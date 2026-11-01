import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { createMvpContent } from "../src/content/mvp.js";
import { createFamilyReview, getPlayerView, projectJournal, replayFamilyRun, selectReviewMoments, transitionGame } from "../src/engine/index.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY, restoreGame, SAVE_SCHEMA_VERSION, serializeGame } from "../src/persistence/index.js";
import { completedStory } from "./helpers/completed-story.js";

const historical = JSON.parse(readFileSync(new URL("./helpers/ux-v2-historical-saves.json", import.meta.url), "utf8"));
const v4 = JSON.parse(readFileSync(new URL("./helpers/v4-family-saves.json", import.meta.url), "utf8"));
const v5 = JSON.parse(readFileSync(new URL("./helpers/v5-journal-saves.json", import.meta.url), "utf8"));

it.each([1, 2, 3, 4, 5, 6, 7])("validates version %s using its own contract and preserves source bytes, facts, checkpoints and review choices", version => {
  expect(SAVE_SCHEMA_VERSION).toBe(7);
  const saves = version <= 3 ? historical.filter((row: any) => row.save.schemaVersion === 3).map((row: any) => {
    const source = structuredClone(row.save.state);
    if (version < 3) delete source.activeFamilyLifeDirectionId;
    // v1/v2 variants are explicitly derived from genuine v3 states, not labelled historical captures.
    return version === 1 ? source : { schemaVersion: version, state: source };
  }) : version === 4 ? v4 : version === 5 ? v5
    : version === 6 ? historical.filter((row: any) => row.save.schemaVersion === 6).map((row: any) => row.save)
    : (() => {
      const { state, content } = completedStory("carry", 9);
      const moments = createFamilyReview(state, content).keyMomentIds.slice().reverse();
      const pending = historical.find((row: any) => row.label === "v6-pending").save.state;
      return [JSON.parse(serializeGame(pending)), JSON.parse(serializeGame(selectReviewMoments(state, content, moments)))];
    })();
  for (const save of saves) {
    const source = version === 1 ? save : save.state;
    const raw = JSON.stringify(save);
    const values = new Map([[LOCAL_SAVE_KEY, raw]]);
    const store = createLocalSaveStore({ getItem: key => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); } });
    const loaded = store.load();
    expect(loaded).toMatchObject({ status: "restored", migratedFrom: version === 7 ? null : version, rawData: raw });
    if (loaded.status !== "restored") throw new Error(`v${version} fixture rejected`);
    expect(values.get(LOCAL_SAVE_KEY)).toBe(raw);
    expect(loaded.state).toMatchObject({ ...source, activeFamilyLifeDirectionId: source.activeFamilyLifeDirectionId ?? "flexible" });
    expect(loaded.state.history).toEqual(source.history);
    if (version <= 3)
      expect(Object.values(loaded.state.actorProfiles!).every(profile => profile.source === "legacy-unknown")).toBe(true);
    else expect(loaded.state.actorProfiles).toEqual(source.actorProfiles);
    const journal = projectJournal(loaded.state);
    if (version !== 7) {
      expect(store.migrate(raw).status).toBe("saved");
      expect(values.get(`${LOCAL_SAVE_KEY}.preserved.0`)).toBe(raw);
      expect(JSON.parse(values.get(LOCAL_SAVE_KEY)!).schemaVersion).toBe(7);
    }
    const restored = store.load();
    expect(restored).toMatchObject({ status: "restored", migratedFrom: null, state: loaded.state });
    const content = createMvpContent(loaded.state.replayOrigin?.actors);
    const view = getPlayerView(loaded.state, content);
    if (view.completed) {
      expect(createFamilyReview(loaded.state, content).keyMomentIds).toEqual(source.review.keyMomentIds);
      expect(createFamilyReview(loaded.state, content).timeline).toHaveLength(12);
      const replay = replayFamilyRun(loaded.state);
      expect(replay.state.history).toEqual([]);
      expect(replay.state.choiceHistory).toEqual([]);
      expect(replay.state.rngState).toBe(loaded.state.replayOrigin!.rngState);
    } else {
      const input = view.pendingEvent ? { type: "CHOOSE" as const, choiceId: "coordinate" } : view.nextInput!;
      const uninterrupted = transitionGame(loaded.state, content, input);
      if (restored.status !== "restored") throw new Error("restore failed");
      expect(transitionGame(restored.state, content, input)).toEqual(uninterrupted);
      expect(uninterrupted.state.history.slice(0, source.history.length)).toEqual(source.history);
    }
    expect(projectJournal(loaded.state)).toEqual(journal);
  }
});

it("keeps missing replayOrigin saves readable without claiming to reconstruct the lost opening", () => {
  const fixture = structuredClone(historical.find((row: any) => row.label === "v6-completed-custom-review").save);
  delete fixture.state.replayOrigin;
  const raw = JSON.stringify(fixture);
  const loaded = restoreGame(raw);
  expect(loaded).toMatchObject({ status: "restored", migratedFrom: 6, rawData: raw });
  if (loaded.status !== "restored") throw new Error("legacy no-origin save failed");
  expect(loaded.state.replayOrigin).toBeUndefined();
  expect(loaded.state.history).toEqual(fixture.state.history);
  expect(restoreGame(serializeGame(loaded.state))).toMatchObject({ status: "restored", migratedFrom: null, state: loaded.state });
  const replay = replayFamilyRun(loaded.state);
  expect(replay.state.history).toEqual([]);
  expect(Object.values(replay.state.actorProfiles!).every(profile => profile.source === "legacy-unknown")).toBe(true);
  expect(replay.state).not.toEqual(loaded.state);
});

it("refuses daily disguised as any older envelope, damaged current data and unknown versions without changing bytes", () => {
  const { state } = completedStory();
  for (const save of [
    ...[1, 2, 3, 4, 5, 6].map(version => version === 1 ? state : { schemaVersion: version, state }),
    { schemaVersion: 8, state }, { schemaVersion: 7, state: { ...state, rngState: -1 } },
  ]) {
    const raw = JSON.stringify(save);
    const values = new Map([[LOCAL_SAVE_KEY, raw]]);
    const store = createLocalSaveStore({ getItem: key => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); } });
    expect(store.load()).toMatchObject({ status: "error", rawData: raw });
    expect(store.save(state, raw).status).toBe("error");
    expect(values.get(LOCAL_SAVE_KEY)).toBe(raw);
  }
});
