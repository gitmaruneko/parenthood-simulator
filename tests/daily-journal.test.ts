import { expect, it } from "vitest";
import { createFamilyRun, getPlayerView, projectJournal, transitionGame } from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";
import { restoreGame, serializeGame, createLocalSaveStore, LOCAL_SAVE_KEY } from "../src/persistence/index.js";
import { DAILY_TEMPLATES, validateDailyTemplates } from "../src/content/daily-journal.js";
import { createFamilyReview } from "../src/engine/index.js";

it("commits one concrete daily snapshot only when a Turn first ends, with no mechanical effects", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const chosen = transitionGame(pending, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
  expect(projectJournal(chosen).filter(row => row.kind === "daily")).toHaveLength(0);
  const ended = transitionGame(chosen, content, { type: "END_TURN" });
  const daily = projectJournal(ended.state).filter(row => row.kind === "daily");
  expect(daily).toHaveLength(1);
  expect(daily[0]!.text).toContain("你把手指放在孩子的掌心");
  expect(ended.state).toEqual({ ...chosen, history: ended.state.history,
    turn: { ...chosen.turn!, status: "completed", activeEventId: null } });
  expect(ended.trace.at(-1)!.afterState).toEqual(ended.state);
  const loaded = restoreGame(serializeGame(ended.state));
  if (loaded.status !== "restored") throw new Error("restore failed");
  expect(projectJournal(loaded.state)).toEqual(projectJournal(ended.state));
  expect(transitionGame(loaded.state, content, { type: "ADVANCE" }).state.history).toEqual(ended.state.history);
  expect(transitionGame(chosen, content, { type: "END_TURN" }).state).toEqual(ended.state);
  const old = { ...ended.state, history: chosen.history };
  expect(transitionGame(old, content, { type: "ADVANCE" }).state.history).toEqual(chosen.history);
  expect(getPlayerView(loaded.state, content).nextInput).toEqual({ type: "START_TURN" });
});

it("validates a closed zero-effect catalogue and rejects invalid ages, IDs, prose and effects", () => {
  expect(validateDailyTemplates(DAILY_TEMPLATES)).toEqual(DAILY_TEMPLATES);
  for (const rows of [
    [DAILY_TEMPLATES[0], DAILY_TEMPLATES[0]],
    [{ ...DAILY_TEMPLATES[0], minMonths: 9 }],
    [{ ...DAILY_TEMPLATES[0], text: " " }],
    [{ ...DAILY_TEMPLATES[0], resourceDeltas: { energy: 1 } }],
    [{ ...DAILY_TEMPLATES[0], actorId: "teacher" }],
  ]) expect(() => validateDailyTemplates(rows)).toThrow();
});

it.each(["fallback", "turn-limit", "stage-limit", "cycle", "stage-complete"])(
  "includes the daily in the %s completion checkpoint and stage index without extra event budget",
  path => {
    const run = createFamilyRun({ seed: 42 });
    const content = createMvpContent(run.actors);
    let state = transitionGame(run.state, content, { type: "ADVANCE" }).state;
    state = transitionGame(state, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
    if (path === "fallback") {
      content.ageStages[0]!.entryEventIds = [];
      state.scheduledFollowUps = [];
    }
    if (path === "turn-limit") state.turn = { ...state.turn!, nodeCount: 4,
      processedEventIds: ["a", "b", "c", "d"] };
    if (path === "stage-limit") state.ageStageProgress = { ...state.ageStageProgress!, nodeCount: 6 };
    if (path === "cycle") {
      const event = content.events.find(row => row.id === state.turn!.processedEventIds[0])!;
      event.repeatable = true; event.cooldownTurns = 0;
      content.ageStages[0]!.entryEventIds = [event.id]; state.scheduledFollowUps = [];
    }
    const result = transitionGame(state, content, { type: path === "stage-complete" ? "COMPLETE_AGE_STAGE" : "ADVANCE" });
    expect(result.stopReason).toBe({ fallback: "FALLBACK", "turn-limit": "TURN_NODE_LIMIT",
      "stage-limit": "AGE_STAGE_NODE_LIMIT", cycle: "CYCLE_PROTECTED", "stage-complete": "AGE_STAGE_COMPLETED" }[path]);
    const rows = projectJournal(result.state).filter(row => row.kind === "daily");
    expect(rows).toHaveLength(1);
    expect(result.trace.at(-1)!.afterState).toEqual(result.state);
    if (result.state.completedAgeStages?.length)
      expect(result.state.completedAgeStages.at(-1)!.storyEntryIds).toContain(rows[0]!.sourceHistoryId);
    expect(result.state.turn!.nodeCount).toBe(state.turn!.nodeCount + Number(path === "fallback"));
    expect(restoreGame(serializeGame(result.state)).status).toBe("restored");
    expect(transitionGame(result.state, content, { type: "ADVANCE" }).state.history).toEqual(result.state.history);
  });

it.each([42, 3, 4, 4294967295])("seed %s has no repeated daily prose, survives every checkpoint and keeps review choices", seed => {
  const run = createFamilyRun({ seed });
  const content = createMvpContent(run.actors);
  let state = run.state;
  for (let step = 0; step < 250; step++) {
    const view = getPlayerView(state, content);
    if (view.completed) break;
    const result = transitionGame(state, content, view.pendingEvent
      ? { type: "CHOOSE", choiceId: view.pendingEvent.choices[0]!.id } : view.nextInput!);
    for (const checkpoint of result.trace) {
      const loaded = restoreGame(serializeGame(checkpoint.afterState));
      if (loaded.status !== "restored") throw new Error("checkpoint failed");
      expect(loaded.state).toEqual(checkpoint.afterState);
    }
    state = result.state;
  }
  const rows = projectJournal(state).filter(row => row.kind === "daily");
  expect(rows).toHaveLength(4);
  expect(new Set(rows.map(row => row.turnId)).size).toBe(rows.length);
  expect(new Set(rows.map(row => row.text)).size).toBe(rows.length);
  for (const row of rows) {
    const entry = state.history.find(entry => entry.id === row.sourceHistoryId)!;
    const snapshot = entry.journal![0]!;
    if (snapshot.kind !== "daily") throw new Error("missing daily");
    const template = DAILY_TEMPLATES.find(item => item.id === snapshot.templateId)!;
    const months = content.ageStages.find(stage => stage.id === row.ageStageId)!.childAgeMonths;
    expect(months).toBeGreaterThanOrEqual(template.minMonths);
    expect(months).toBeLessThanOrEqual(template.maxMonths);
    expect(snapshot.actorIds).toEqual([state.family.childId]);
  }
  const review = createFamilyReview(state, content);
  expect(review.keyMomentIds.some(id => rows.some(row => row.sourceHistoryId === id))).toBe(false);
  expect(review.timeline.flatMap(stage => stage.storyEntryIds)).toEqual(state.history.map(entry => entry.id));
  const withoutDaily = { ...state, history: state.history.filter(entry => !rows.some(row => row.sourceHistoryId === entry.id)) };
  expect(createFamilyReview(withoutDaily, content).themes).toEqual(review.themes);
});

it("migrates v6 exactly and refuses daily snapshots disguised as v6", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const chosen = transitionGame(pending, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
  const old = JSON.stringify({ schemaVersion: 6, state: chosen });
  expect(restoreGame(old)).toMatchObject({ status: "restored", state: chosen, migratedFrom: 6, rawData: old });
  const values = new Map([[LOCAL_SAVE_KEY, old]]);
  const store = createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); } });
  expect(store.load().status).toBe("restored");
  expect(values.get(LOCAL_SAVE_KEY)).toBe(old);
  expect(store.migrate(old).status).toBe("saved");
  expect(values.get(`${LOCAL_SAVE_KEY}.preserved.0`)).toBe(old);
  expect(JSON.parse(values.get(LOCAL_SAVE_KEY)!).state).toEqual(chosen);
  const ended = transitionGame(chosen, content, { type: "END_TURN" }).state;
  const disguised = JSON.stringify({ schemaVersion: 6, state: ended });
  expect(restoreGame(disguised)).toMatchObject({ status: "error", rawData: disguised });
  for (const mutate of [
    (item: any) => { item.sourceHistoryId = "missing"; },
    (item: any) => { item.actorIds = ["absent-grandparent"]; },
    (item: any) => { item.text = " "; },
  ]) {
    const damaged = JSON.parse(serializeGame(ended));
    mutate(damaged.state.history.at(-1).journal[0]);
    expect(restoreGame(JSON.stringify(damaged)).status).toBe("error");
  }
});
