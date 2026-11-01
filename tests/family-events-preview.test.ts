import { expect, it } from "vitest";
import { createMvpContent } from "../src/content/mvp.js";
import { parseContentPack } from "../src/domain/content-validation.js";
import { createFamilyRun, projectJournal, transitionGame, replayFamilyRun, getPlayerView } from "../src/engine/index.js";
import { bindPreviewRun, createRunContent } from "../src/content/releases.js";
import { restoreGame, serializeGame } from "../src/persistence/index.js";
import { createLocalSaveStore } from "../src/persistence/index.js";
import { createPlayerSession } from "../src/ui/player-session.js";
import { createFamilyReview } from "../src/engine/index.js";
import { TOY_CAR_CHAIN, TOY_CAR_ROOT } from "../src/content/toy-car-story.js";

const paths = ["enact", "ask", "acknowledge"].flatMap(choiceId => ["invite", "clarify"].flatMap(later =>
  [0, 1].map(availability => ({ choiceId, later, availability }))));
it.each(paths)("finishes 08A across turns and checkpoints: $choiceId/$later availability=$availability", ({ choiceId, later, availability }) => {
    const opening = createFamilyRun({ seed: 9, firstAgeStageId: "age-stage-8" });
    opening.state.replayOrigin!.actors.forEach(actor => { actor.availability = availability; });
    const run = bindPreviewRun(opening);
    const content = createRunContent(run.state);
    // Pin only the entry for exhaustive path coverage, never for distribution evidence.
    content.ageStages[7]!.entryEventIds = [TOY_CAR_ROOT];
    let state = run.state;
    for (let step = 0; step < 20; step++) {
      const view = getPlayerView(state, content);
      if (state.ageStageProgress?.status !== undefined && state.ageStageProgress.status !== "active") break;
      const input = view.pendingEvent ? { type: "CHOOSE" as const,
        choiceId: view.pendingEvent.id === TOY_CAR_ROOT ? choiceId : later } : view.nextInput!;
      const next = transitionGame(state, content, input);
      const restored = restoreGame(serializeGame(state));
      if (restored.status !== "restored") throw new Error(`Checkpoint rejected: ${step}`);
      expect(transitionGame(restored.state, content, input)).toEqual(next);
      state = next.state;
      expect(state.turn!.nodeCount).toBeLessThanOrEqual(4);
      expect(state.ageStageProgress!.nodeCount).toBeLessThanOrEqual(6);
    }
    expect(state.completedEventIds).toEqual(expect.arrayContaining([...TOY_CAR_CHAIN]));
    expect(state.ageStageProgress).toMatchObject({ nodeCount: 6, turnCount: 2, status: "completed" });
    expect(state.scheduledFollowUps.find(row => row.eventId === TOY_CAR_CHAIN[1])?.status).toBe("consumed");
    expect(state.history.some(row => row.kind === "repair")).toBe(true);
    expect(state.completedEventIds).not.toContain("preschool-handoff-choice");
    if (availability === 0) {
      expect(state.reactionHistory!.every(row => row.kind === "none")).toBe(true);
      expect(state.history.flatMap(row => row.journal ?? []).some(row => row.kind === "result" && row.reactionHistoryIndex !== undefined)).toBe(false);
    }
});

it.each([9, 1, 11, 2])("keeps two chains, real support and planning in every complete preview family: seed=%s", seed => {
  for (const firstChoice of [true, false]) {
    const run = bindPreviewRun(createFamilyRun({ seed }));
    let state = run.state;
    const content = createRunContent(state);
    for (let step = 0; step < 250; step++) {
      const view = getPlayerView(state, content);
      if (view.completed) break;
      state = transitionGame(state, content, view.pendingEvent ? { type: "CHOOSE",
        choiceId: (!firstChoice && view.pendingEvent.choices.find(choice => choice.id === "carry")?.id) || view.pendingEvent.choices[firstChoice ? 0 : view.pendingEvent.choices.length - 1]!.id } : view.nextInput!).state;
    }
    expect(state.completedAgeStages).toHaveLength(12);
    for (const stage of ["age-stage-1", "age-stage-8"])
      expect(state.scheduledFollowUps.some(row => row.status === "consumed" && row.targetAgeStageId === stage && row.immediateTurnId === undefined)).toBe(true);
    expect(state.history.some(row => row.kind === "planning" && row.ageStageId === "age-stage-6")).toBe(true);
    expect(state.history.some(row => row.kind === "support" && row.resolvedEventId === "shared-ownership-reflection")).toBe(true);
    expect(createFamilyReview(state, content).supportMomentIds.length).toBeGreaterThan(0);
    const replay = replayFamilyRun(state);
    expect(replay.state.contentBinding).toEqual(state.contentBinding);
    expect(createRunContent(replay.state)).toEqual(content);
  }
});

it("rejects a removed guaranteed queue and never accepts preview results disguised as a legacy save", () => {
  const run = bindPreviewRun(createFamilyRun({ seed: 9, firstAgeStageId: "age-stage-8" }));
  const content = createRunContent(run.state);
  content.ageStages[7]!.entryEventIds = [TOY_CAR_ROOT];
  const waiting = transitionGame(run.state, content, { type: "ADVANCE" });
  const chosen = transitionGame(waiting.state, content, { type: "CHOOSE", choiceId: "enact" }).state;
  const missing = JSON.parse(serializeGame(chosen));
  missing.state.scheduledFollowUps = [];
  expect(restoreGame(JSON.stringify(missing))).toMatchObject({ status: "error" });
  for (const version of [1,2,3,4,5,6,7]) {
    const fake = structuredClone(chosen);
    delete fake.contentBinding; fake.schemaVersion = 1;
    const raw = JSON.stringify(version === 1 ? fake : { schemaVersion: version, state: fake });
    expect(restoreGame(raw)).toMatchObject({ status: "error", rawData: raw });
  }
});

it("refuses a lost support continuation instead of quietly completing the stage without support", () => {
  const run = bindPreviewRun(createFamilyRun({ seed: 9, firstAgeStageId: "age-stage-6" }));
  const content = createRunContent(run.state);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" });
  const chosen = transitionGame(pending.state, content, { type: "CHOOSE", choiceId: "carry" }).state;
  const saved = JSON.parse(serializeGame(chosen));
  saved.state.scheduledFollowUps = [];
  const rawData = JSON.stringify(saved);
  expect(restoreGame(rawData)).toMatchObject({ status: "error", rawData });
});

it("starts the preview through the player session and keeps the release on replay", async () => {
  const data = new Map<string, string>();
  const store = createLocalSaveStore({ getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); } });
  const session = createPlayerSession(store, () => 9);
  await session.check(); await session.newStory(); session.reveal(); await session.startFamily();
  const loaded = store.load();
  expect(loaded.status).toBe("restored");
  if (loaded.status !== "restored") throw new Error("No saved preview");
  expect(loaded.state.contentBinding?.releaseId).toBe("family-events-08a-v1");
  const replay = replayFamilyRun(loaded.state);
  expect(replay.state.contentBinding).toEqual(loaded.state.contentBinding);
  expect(createRunContent(replay.state).ageStages[7]!.entryEventIds).toContain("toy-car-story-choice");
  const restoredSession = createPlayerSession(store);
  await restoredSession.check(); await restoredSession.resume();
  expect(restoredSession.getSnapshot().decision?.event).toEqual(session.getSnapshot().decision?.event);
});

it("binds a new preview and resumes the same pending story while legacy saves keep their catalogue", () => {
  const legacy = createFamilyRun({ seed: 9 });
  const run = bindPreviewRun(legacy);
  const content = createRunContent(run.state);
  expect(content.events).toHaveLength(37);
  expect(content.ageStages[7]!.entryEventIds).toEqual(["preschool-handoff-choice", "toy-car-story-choice"]);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const raw = serializeGame(pending);
  expect(JSON.parse(raw).schemaVersion).toBe(8);
  expect(restoreGame(raw)).toMatchObject({ status: "restored", migratedFrom: null, state: pending });
  expect(serializeGame(legacy.state)).toContain('"schemaVersion":7');
  expect(createRunContent(legacy.state).events).toHaveLength(33);
  const corrupt = JSON.parse(raw);
  corrupt.state.contentBinding.familyKey = "0".repeat(64);
  expect(restoreGame(JSON.stringify(corrupt))).toMatchObject({ status: "error" });
});

it("records ordinary play as a separate result without creating planning, support or an extra node", () => {
  const run = createFamilyRun({ seed: 9 });
  const authored = createMvpContent(run.actors);
  const root = authored.events.find(event => event.id === "night-handoff-choice")!;
  const content = parseContentPack({ ...authored, schemaVersion: 2,
    events: authored.events.map(event => event === root ? { ...event, reactionPoolIds: [], choices: [
      { ...root.choices[0]!, planningLoadDelta: 0, id: "play", text: "把玩具放到桌邊", storyEntries: [{ kind: "narrative", text: "你把小車放到桌邊。" }] },
      { ...root.choices[1]!, planningLoadDelta: 0, id: "listen", text: "先聽他說", storyEntries: [{ kind: "narrative", text: "你把問題留給他說。" }] },
    ] } : event) });
  const pending = transitionGame(run.state, content, { type: "ADVANCE" });
  const result = transitionGame(pending.state, content, { type: "CHOOSE", choiceId: "play" }).state;
  expect(projectJournal(result).map(entry => entry.text)).toContain("凌晨的交接：你把小車放到桌邊。");
  expect(result.history.filter(entry => entry.kind === "narrative")).toHaveLength(1);
  expect(result.history.some(entry => ["planning", "support", "repair"].includes(entry.kind))).toBe(false);
  expect(result.turn?.nodeCount).toBe(1);
  expect(result.history.find(entry => entry.kind === "narrative")?.resolvedEventId).toBeUndefined();
});
