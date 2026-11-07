import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import { afterAll, afterEach, expect, it } from "vitest";
import { bindNarrativeRun, bindPreviewRun, createRunContent } from "../src/content/releases.js";
import { DOOR, NIGHT, NARRATIVE_RELEASE } from "../src/content/narrative-a1.js";
import { createFamilyRun, createFamilyReview, getPlayerView, projectJournal, replayFamilyRun, transitionGame } from "../src/engine/index.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY, restoreGame, serializeGame } from "../src/persistence/index.js";
import { familyProfileSchema } from "../src/domain/schemas.js";
import { familyContentKey } from "../src/domain/content-binding.js";
import { createPlayerSession } from "../src/ui/player-session.js";
import { a1Path, a1Run } from "./helpers/narrative-a1.js";
import { unknownActorProfiles } from "../src/domain/actor-profiles.js";

const evidence: object[] = [];
// Let the runner acknowledge progress between CPU-bound matrix cases.
afterEach(() => setImmediate());
afterAll(() => {
  if (process.env.NQA1_WRITE_EVIDENCE === "1") writeFileSync("docs/examples/NARRATIVE-A1-RUNS.json", JSON.stringify({
    releaseId: NARRATIVE_RELEASE, seam: "public Engine / Journal / Save-Restore / Review / Session", scope: "forced paths; not distribution", rows: evidence,
  }, null, 2) + "\n");
});

it("plays the new night actions across turns without inventing a relationship repair", () => {
  const run = bindNarrativeRun(createFamilyRun({ seed: 9 }));
  const content = createRunContent(run.state);
  let state = run.state;
  for (let step = 0; step < 20; step++) {
    if (state.ageStageProgress && state.ageStageProgress.status !== "active") break;
    const view = getPlayerView(state, content);
    state = transitionGame(state, content, view.pendingEvent ? { type: "CHOOSE", choiceId: view.pendingEvent.choices[0]!.id } : view.nextInput!).state;
    expect(restoreGame(serializeGame(state))).toMatchObject({ status: "restored", state });
  }
  expect(state.completedEventIds).toContain("nqa1-night-close");
  expect(state.ageStageProgress).toMatchObject({ nodeCount: 6, turnCount: 2 });
  expect(state.history.some(row => row.kind === "repair")).toBe(false);
  expect(state.history.map(row => row.text)).toContain("你挑出幾件乾淨用品放進小籃，剩下的衣物仍堆在旁邊。");
});

const paths = [
  ...["nqa1-stock", "nqa1-sit"].flatMap(root => ["nqa1-sort", "nqa1-move"].map(later => ({ stage: 1 as const, root, later }))),
  ...["nqa1-ask-child", "nqa1-ask-teacher"].flatMap(root => ["nqa1-apologize", "nqa1-draw"].map(later => ({ stage: 8 as const, root, later }))),
];
it.each(paths)("completes both turns and validates every saved source: $root / $later", ({ stage, root, later }) => {
  for (const availability of [0, 1]) for (const seed of [9, 1, 11, 2]) {
    const { state, content, checkpoints } = a1Path(stage, root, later, seed, availability);
    const reversed = structuredClone(content);
    reversed.events.reverse(); reversed.actors.reverse(); reversed.ageStages.reverse(); reversed.entryEventIds.reverse();
    reversed.reactionPools.reverse(); reversed.reactionPools.forEach(pool => pool.entries.reverse());
    for (const checkpoint of checkpoints) {
      const loaded = restoreGame(serializeGame(checkpoint));
      expect(loaded).toMatchObject({ status: "restored", state: checkpoint, migratedFrom: null });
      if (loaded.status !== "restored") throw new Error("Checkpoint rejected");
      expect(projectJournal(loaded.state)).toEqual(projectJournal(checkpoint));
      const view = getPlayerView(checkpoint, content);
      const command = view.pendingEvent ? { type: "CHOOSE" as const,
        choiceId: view.pendingEvent.id === (stage === 1 ? NIGHT.root : DOOR.root) ? root : later } : view.nextInput;
      if (command) expect(transitionGame(loaded.state, reversed, command)).toEqual(transitionGame(checkpoint, content, command));
      expect(checkpoint.turn?.nodeCount ?? 0).toBeLessThanOrEqual(4);
      expect(checkpoint.ageStageProgress?.nodeCount ?? 0).toBeLessThanOrEqual(6);
      for (const row of projectJournal(checkpoint)) {
        expect(checkpoint.history.some(source => source.id === row.sourceHistoryId)).toBe(true);
      }
    }
    expect(state.ageStageProgress).toMatchObject({ nodeCount: 6, turnCount: 2 });
    expect(state.ageStageProgress!.status).not.toBe("active");
    expect(state.completedEventIds).toContain(stage === 1 ? NIGHT.close : DOOR.close);
    expect(state.completedEventIds).not.toContain("toy-car-story-choice");
    expect(state.history.filter(row => row.kind === "repair")).toHaveLength(stage === 1 ? 0 : 1);
    expect(state.relationshipMemories).toEqual([]);
    if (availability === 0) expect((state.reactionHistory ?? []).every(row => row.kind === "none")).toBe(true);
    if (availability === 1 && seed === 9) evidence.push({ stage, root, later, seed, availability,
      commands: state.choiceHistory, reactions: state.reactionHistory, journal: projectJournal(state),
      history: state.history, queue: state.scheduledFollowUps, progress: state.ageStageProgress,
      checkpointCount: checkpoints.length, checkpointRestorePassed: true });
  }
}, 30000);

it("reaches every specific reply, refusal and none without cross-answering another question", () => {
  const seen = new Set<string>();
  for (const root of ["nqa1-ask-child", "nqa1-ask-teacher"]) for (const later of ["nqa1-apologize", "nqa1-draw"]) {
    const { state: opening, content } = a1Run(8);
    content.ageStages[7]!.entryEventIds = [DOOR.root];
    const waiting = transitionGame(opening, content, { type: "ADVANCE" }).state;
    // Force RNG states at the public seam, never mock the selector or change pool weights.
    for (let rngState = 1; rngState <= 96; rngState++) {
      let state = { ...waiting, rngState };
      state = transitionGame(state, content, { type: "CHOOSE", choiceId: root }).state;
      const first = state.reactionHistory!.at(-1)!;
      if (first.kind !== "none") expect(first.actorId).toBe(root === "nqa1-ask-child" ? "child-1" : "teacher-1");
      for (let step = 0; step < 12 && !getPlayerView(state, content).pendingEvent; step++)
        state = transitionGame(state, content, getPlayerView(state, content).nextInput!).state;
      state = transitionGame(state, content, { type: "CHOOSE", choiceId: later }).state;
      const second = state.reactionHistory!.at(-1)!;
      for (const reaction of [first, second]) {
        const key = `${reaction.poolId}/${reaction.reactionId}`;
        if (!seen.has(key)) evidence.push({ forcedRngState: rngState, root, later, reaction, journal: projectJournal(state) });
        seen.add(key);
      }
      const journal = projectJournal(state);
      expect(state.history.flatMap(row => row.journal ?? []).filter(row => "reactionHistoryIndex" in row && row.reactionHistoryIndex !== undefined)).toHaveLength([first, second].filter(row => row.kind !== "none").length);
      expect(state.relationshipMemories).toEqual([]);
      const repairs = state.history.filter(row => row.kind === "repair");
      expect(repairs).toHaveLength(1);
      expect(repairs[0]!.text).toBe(content.events.find(event => event.id === DOOR.later)!.choices.find(choice => choice.id === later)!.storyEntries![0]!.text);
    }
  }
  expect([...seen].sort()).toEqual([
    "nqa1-door-response/nqa1-show-teacher", "nqa1-door-response/nqa1-hold-drawing", "nqa1-door-response/nqa1-teacher-wait", "nqa1-door-response/nqa1-teacher-basket", "nqa1-door-response/nqa1-none",
    "nqa1-door-repair-response/nqa1-explain", "nqa1-door-repair-response/nqa1-not-now", "nqa1-door-repair-response/nqa1-draw-square", "nqa1-door-repair-response/nqa1-push-paper", "nqa1-door-repair-response/nqa1-none",
  ].sort());
});

it.each([9, 1, 11, 2])("preserves full-story guarantees, review sources and replay for seed %s", seed => {
  for (const strategy of ["first", "last", "alternate"]) {
    let { state, content } = a1Run(1, seed);
    let choices = 0;
    for (let step = 0; step < 240; step++) {
      const view = getPlayerView(state, content);
      if (view.completed) break;
      const last = strategy === "last" || strategy === "alternate" && choices++ % 2 === 1;
      state = transitionGame(state, content, view.pendingEvent ? { type: "CHOOSE", choiceId: view.pendingEvent.choices[last ? view.pendingEvent.choices.length - 1 : 0]!.id } : view.nextInput!).state;
      expect(state.turn?.nodeCount ?? 0).toBeLessThanOrEqual(4);
      expect(state.ageStageProgress!.nodeCount).toBeLessThanOrEqual(6);
      expect(restoreGame(serializeGame(state))).toMatchObject({ status: "restored", state });
    }
    expect(state.completedAgeStages).toHaveLength(12);
    for (const stage of ["age-stage-1", "age-stage-8"]) expect(state.completedAgeStages!.find(row => row.ageStageId === stage)?.turnCount).toBe(2);
    expect(state.history.some(row => row.kind === "planning" && row.ageStageId === "age-stage-6")).toBe(true);
    expect(state.history.some(row => row.kind === "support" && row.resolvedEventId === "shared-ownership-reflection")).toBe(true);
    const review = createFamilyReview(state, content);
    expect(review.repairMomentIds.length).toBeGreaterThan(0);
    expect(review.repairMomentIds.every(id => state.history.find(row => row.id === id)!.ageStageId !== "age-stage-1")).toBe(true);
    state = { ...state, review };
    const restored = restoreGame(serializeGame(state));
    expect(restored).toMatchObject({ status: "restored", state });
    expect(createRunContent(replayFamilyRun(state).state)).toEqual(content);
    if (strategy === "first") evidence.push({ seed, strategy, review, stages: state.completedAgeStages, journal: projectJournal(state) });
  }
}, 30000);

const familyConfigurations = familyProfileSchema.shape.householdComposition.options.flatMap(householdComposition =>
  familyProfileSchema.shape.careParticipation.options.flatMap(careParticipation =>
    familyProfileSchema.shape.workArrangement.options.map(workArrangement => ({ householdComposition, careParticipation, workArrangement }))));

it.each(familyConfigurations)("keeps two feasible actions with actor masks and zero resources: $householdComposition / $careParticipation / $workArrangement", ({ householdComposition, careParticipation, workArrangement }) => {
  for (const persistentActorIds of [[], ["caregiver-2"], ["support-1"], ["caregiver-2", "support-1"]]) {
    const run = bindNarrativeRun(createFamilyRun({ seed: 2 }));
    run.state.family = { ...run.state.family, householdComposition, careParticipation, workArrangement, persistentActorIds };
    run.state.contentBinding!.familyKey = familyContentKey(run.state.family, run.state.replayOrigin!.actors);
    run.state.resources = { energy: 0, timeFlexibility: 0, finances: 0, support: 0, connection: 0 };
    run.state.planningLoad = 0;
    const content = createRunContent(run.state);
    for (const stage of content.ageStages) {
      const view = transitionGame({ ...run.state, currentAgeStageId: stage.id }, content, { type: "ADVANCE" });
      expect(view.pendingEvent!.choices.length).toBeGreaterThanOrEqual(2);
    }
  }
}, 60000);

it.each(paths)("retains exactly the accepted $root result when SaveStorage rejects writing", async ({ stage, root, later }) => {
  const { checkpoints, content } = a1Path(stage, root, later);
  for (const pending of checkpoints.filter(state => state.turn?.status === "awaitingInput")) {
    const choiceId = pending.turn!.activeEventId === (stage === 1 ? NIGHT.root : DOOR.root) ? root : later;
    const original = serializeGame(pending);
    const values = new Map([[LOCAL_SAVE_KEY, original]]);
    let fail = true;
    const store = createLocalSaveStore({ getItem: key => values.get(key) ?? null, setItem: (key, value) => {
      if (fail) throw new Error("write denied"); values.set(key, value);
    } });
    const session = createPlayerSession(store);
    await session.check(); await session.resume();
    const decision = session.getSnapshot().decision!;
    expect(decision.event.choices).toHaveLength(2);
    await session.choose(choiceId, decision.key);
    expect(session.getSnapshot().decision!.status).toBe("unsaved");
    const expected = transitionGame(pending, content, { type: "CHOOSE", choiceId }).state;
    await session.choose(choiceId, decision.key); await session.advance();
    expect(values.get(LOCAL_SAVE_KEY)).toBe(original);
    fail = false; await session.retryDecisionSave(decision.key);
    expect(JSON.parse(values.get(LOCAL_SAVE_KEY)!).state).toEqual(expected);
    expect(session.getSnapshot().hasUnsavedChanges).toBe(false);
  }
});

it("rejects unknown versions, lost queues, and wrong release identities while retaining the bytes", () => {
  const { checkpoints } = a1Path(8, "nqa1-ask-teacher", "nqa1-draw");
  const chosen = checkpoints.find(state => state.choiceHistory.length === 1)!;
  for (const mutate of [
    (data: any) => { data.state.contentBinding.releaseId = "narrative-quality-a1-v999"; },
    (data: any) => { data.state.contentBinding.assemblyVersion = 99; },
    (data: any) => { data.state.scheduledFollowUps = []; },
    (data: any) => { data.state.flags = []; },
    (data: any) => { data.state.contentBinding.releaseId = "family-events-08a-v1"; },
  ]) {
    const data = JSON.parse(serializeGame(chosen)); mutate(data);
    const rawData = JSON.stringify(data);
    const values = new Map([[LOCAL_SAVE_KEY, rawData]]);
    const store = createLocalSaveStore({ getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } });
    expect(store.load()).toMatchObject({ status: "error", rawData });
    expect(store.save(chosen, rawData).status).toBe("error");
    expect(values.get(LOCAL_SAVE_KEY)).toBe(rawData);
  }
});

it.each(paths.filter(path => path.stage === 1))("plays $root / $later with no other adult, zero resources and stale branch flags", ({ root, later }) => {
  const opening = createFamilyRun({ seed: 9 });
  opening.state.family.persistentActorIds = [];
  const actors = opening.actors.filter(actor => actor.role === "child");
  opening.state.replayOrigin!.actors = structuredClone(actors);
  opening.state.actorProfiles = unknownActorProfiles(opening.state.family);
  opening.state.replayOrigin!.actorProfiles = structuredClone(opening.state.actorProfiles);
  opening.state.resources = { finances: 0, energy: 0, support: 0, timeFlexibility: 0, connection: 0 };
  opening.state.flags = ["nqa1-night-stock", "nqa1-night-sit"];
  let { state } = bindNarrativeRun({ ...opening, actors });
  const content = createRunContent(state);
  for (let step = 0; step < 20; step++) {
    if (state.ageStageProgress && state.ageStageProgress.status !== "active") break;
    const view = getPlayerView(state, content);
    if (view.pendingEvent) expect(view.pendingEvent.choices).toHaveLength(2);
    state = transitionGame(state, content, view.pendingEvent ? { type: "CHOOSE", choiceId: view.pendingEvent.id === NIGHT.root ? root : later } : view.nextInput!).state;
    expect(restoreGame(serializeGame(state))).toMatchObject({ status: "restored", state });
  }
  expect(state.completedEventIds).toContain(NIGHT.close);
  expect(state.flags.filter(flag => flag.startsWith("nqa1-night-"))).toEqual([root === "nqa1-stock" ? "nqa1-night-stock" : "nqa1-night-sit"]);
  expect(state.relationshipMemories).toEqual([]);
  expect(state.reactionHistory ?? []).toEqual([]);
});
