import { writeFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import { afterAll, afterEach, expect, it } from "vitest";
import { bindNarrativeA2Run, bindNarrativeA3Run, createRunContent } from "../src/content/releases.js";
import { createFamilyRun, createFamilyReview, getPlayerView, projectJournal, replayFamilyRun, transitionGame } from "../src/engine/index.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY, restoreGame, serializeGame } from "../src/persistence/index.js";
import { A3_STORIES, a3Root, a3Reflection, NARRATIVE_A3_RELEASE, NARRATIVE_A3_REPLACEMENTS } from "../src/content/narrative-a3.js";
import { familyProfileSchema } from "../src/domain/schemas.js";
import { createPlayerSession } from "../src/ui/player-session.js";
import { a3Path, a3Run } from "./helpers/narrative-a3.js";
import { unknownActorProfiles } from "../src/domain/actor-profiles.js";
import { resolveReactions } from "../src/engine/reactions.js";

const evidence: object[] = [];
afterEach(() => setImmediate());
afterAll(() => {
  if (process.env.NQA3_WRITE_EVIDENCE === "1") writeFileSync("docs/examples/NARRATIVE-A3-RUNS.json", JSON.stringify({
    releaseId: NARRATIVE_A3_RELEASE, seam: "real ContentPack / public Engine / Journal / Save-Restore / Review / Session", rows: evidence,
  }, null, 2) + "\n");
});
const paths = A3_STORIES.flatMap(story => story.choices.map(choiceId => ({ story, choiceId })));

const baselineCases = paths.flatMap(path => [0, 1].flatMap(availability => [9, 1, 11, 2].map(seed => ({ ...path, availability, seed }))));
it.each(baselineCases)("restores every checkpoint: $choiceId / seed=$seed / availability=$availability", ({ story, choiceId, seed, availability }) => {
    const { state, content, checkpoints } = a3Path(story, choiceId, seed, availability);
    const reversed = structuredClone(content);
    reversed.events.reverse(); reversed.actors.reverse(); reversed.ageStages.reverse(); reversed.entryEventIds.reverse();
    reversed.reactionPools.reverse(); reversed.reactionPools.forEach(pool => pool.entries.reverse());
    for (const checkpoint of checkpoints) {
      const loaded = restoreGame(serializeGame(checkpoint));
      expect(loaded).toMatchObject({ status: "restored", state: checkpoint, migratedFrom: null });
      if (loaded.status !== "restored") throw new Error("Checkpoint rejected");
      expect(projectJournal(loaded.state)).toEqual(projectJournal(checkpoint));
      const view = getPlayerView(checkpoint, content);
      if (checkpoint.ageStageProgress?.status === "active" || !checkpoint.ageStageProgress) {
        const command = view.pendingEvent ? { type: "CHOOSE" as const, choiceId } : view.nextInput!;
        const expected = transitionGame(checkpoint, content, command);
        expect(transitionGame(loaded.state, createRunContent(loaded.state), command)).toEqual(expected);
        expect(transitionGame(checkpoint, reversed, command)).toEqual(expected);
      }
      expect(checkpoint.turn?.nodeCount ?? 0).toBeLessThanOrEqual(4);
      expect(checkpoint.ageStageProgress?.nodeCount ?? 0).toBeLessThanOrEqual(6);
      for (const row of projectJournal(checkpoint)) expect(checkpoint.history.some(source => source.id === row.sourceHistoryId)).toBe(true);
    }
    expect(state.completedEventIds).toContain(a3Reflection(story.key));
    expect(state.flags.filter(flag => story.choices.includes(flag as never))).toEqual([choiceId]);
    expect(state.relationshipMemories).toEqual([]);
    expect(state.history.some(row => row.kind === "repair")).toBe(false);
    if (availability === 0) expect((state.reactionHistory ?? []).filter(row => row.poolId !== "nqa3-work-response").every(row => row.kind === "none")).toBe(true);
    if (["bag", "shoes", "gathering"].includes(story.key)) expect(state.reactionHistory ?? []).toEqual([]);
    if (availability === 1) evidence.push({ kind: "path", story: story.key, choiceId, seed, family: state.family,
      journal: projectJournal(state), reactions: state.reactionHistory, history: state.history,
      progress: state.ageStageProgress, checkpointCount: checkpoints.length, checkpointRestorePassed: true });
});

it.each([9, 1, 11, 2])("completes twelve stages, tool support, repair, review and replay: seed %s", seed => {
  for (const last of [false, true]) {
    let { state } = bindNarrativeA3Run(createFamilyRun({ seed }));
    const content = createRunContent(state);
    for (let step = 0; step < 240 && !getPlayerView(state, content).completed; step++) {
      const view = getPlayerView(state, content);
      state = transitionGame(state, content, view.pendingEvent ? { type: "CHOOSE", choiceId: view.pendingEvent.choices[last ? view.pendingEvent.choices.length - 1 : 0]!.id } : view.nextInput!).state;
      expect(state.turn?.nodeCount ?? 0).toBeLessThanOrEqual(4);
      expect(state.ageStageProgress!.nodeCount).toBeLessThanOrEqual(6);
      expect(restoreGame(serializeGame(state))).toMatchObject({ status: "restored", state });
    }
    expect(state.completedAgeStages).toHaveLength(12);
    for (const stage of ["age-stage-1", "age-stage-8"]) expect(state.completedAgeStages!.find(row => row.ageStageId === stage)?.turnCount).toBe(2);
    expect(state.history.some(row => row.kind === "planning" && row.ageStageId === "age-stage-6")).toBe(true);
    expect(state.history.some(row => row.kind === "support" && row.resolvedEventId === "nqa2-supplies-after-" + (last ? "list" : "buy"))).toBe(true);
    const review = createFamilyReview(state, content);
    expect(review.repairMomentIds.length).toBeGreaterThan(0);
    expect(review.repairMomentIds.every(id => state.history.find(row => row.id === id)!.ageStageId === "age-stage-8")).toBe(true);
    expect(review.narrativeOverview).toContain("可查用的工具與支持");
    state = { ...state, review };
    expect(restoreGame(serializeGame(state))).toMatchObject({ status: "restored", state });
    expect(createRunContent(replayFamilyRun(state).state)).toEqual(content);
    expect(replayFamilyRun(state).state.contentBinding).toEqual(state.contentBinding);
    evidence.push({ kind: "full", seed, last, family: state.family, review, stages: state.completedAgeStages, journal: projectJournal(state) });
  }
}, 30000);

it.each(paths)("retries only the accepted saved state after write failure: $choiceId", async ({ story, choiceId }) => {
  const { checkpoints, content } = a3Path(story, choiceId);
  const pending = checkpoints.find(state => state.turn?.status === "awaitingInput")!;
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
});


const configurations = familyProfileSchema.shape.householdComposition.options.flatMap(householdComposition =>
  familyProfileSchema.shape.careParticipation.options.flatMap(careParticipation =>
    familyProfileSchema.shape.workArrangement.options.map(workArrangement => ({ householdComposition, careParticipation, workArrangement }))));

it.each(configurations)("assembles one variant and two legal actions across all stages / masks: $householdComposition/$careParticipation/$workArrangement", family => {
  for (const mask of [0, 1, 2, 3]) {
    const run = createFamilyRun({ seed: 9 });
    // Mask independently removes family adults; defaults in the catalogue must not manufacture membership.
    const actors = createRunContent(run.state).actors.filter(actor => actor.role === "child" ||
      (actor.id === "support-1" ? mask & 1 : actor.id === "caregiver-2" ? mask & 2 : false));
    actors.forEach(actor => { actor.availability = 0; });
    run.state.family = { ...run.state.family, ...family, persistentActorIds: actors.filter(actor => actor.role !== "child").map(actor => actor.id) };
    run.state.replayOrigin!.actors = structuredClone(actors);
    run.state.actorProfiles = unknownActorProfiles(run.state.family);
    run.state.replayOrigin!.actorProfiles = structuredClone(run.state.actorProfiles);
    const bound = bindNarrativeA3Run({ ...run, actors });
    const content = createRunContent(bound.state);
    const expectedWork = family.workArrangement === "singleFullTimeCare" ? "bag" : "work";
    const expectedSupport = bound.state.family.persistentActorIds.includes("support-1") ? "message" : "shoes";
    expect(content.ageStages[2]!.entryEventIds).toEqual([a3Root(expectedWork)]);
    expect(content.ageStages[3]!.entryEventIds).toEqual([a3Root(expectedSupport)]);
    for (const stage of content.ageStages) {
      expect(stage.entryEventIds.filter(id => id !== content.fallbackEventId).length).toBeGreaterThan(0);
      const entry = transitionGame({ ...bound.state, currentAgeStageId: stage.id }, content, { type: "ADVANCE" });
      expect(stage.entryEventIds).toContain(entry.pendingEvent?.id);
      expect(entry.pendingEvent!.choices.length).toBeGreaterThanOrEqual(2);
      for (const id of stage.entryEventIds.filter(id => id.startsWith("nqa3-"))) {
        const otherKey = id === a3Root(expectedWork) ? (expectedWork === "bag" ? "work" : "bag") : (expectedSupport === "message" ? "shoes" : "message");
        expect(content.requiredEventIds).not.toContain(a3Root(otherKey));
        const initial = { ...bound.state, currentAgeStageId: stage.id,
          resources: { energy: 0, timeFlexibility: 0, finances: 0, support: 0, connection: 0 } };
        const selected = transitionGame(initial, content, { type: "ADVANCE" });
        expect(selected.pendingEvent?.id).toBe(id);
        expect(selected.pendingEvent!.choices).toHaveLength(2);
        for (const choice of selected.pendingEvent!.choices) {
          const chosen = transitionGame(selected.state, content, { type: "CHOOSE", choiceId: choice.id }).state;
          expect(chosen.choiceHistory.at(-1)?.choiceId).toBe(choice.id);
          expect(restoreGame(serializeGame(chosen))).toMatchObject({ status: "restored", state: chosen });
        }
      }
    }
    evidence.push({ kind: "eligibility", seed: 9, rngState: bound.state.rngState, family: bound.state.family, mask,
      candidates: content.ageStages.map(stage => ({ stage: stage.id, ids: stage.entryEventIds,
        choices: stage.entryEventIds.map(id => ({ id, choices: content.events.find(event => event.id === id)!.choices.map(choice => choice.id) })) })),
      requiredEventIds: content.requiredEventIds });
  }
}, 60000);

it("compares identical RNG checkpoints by changing only work or support membership", () => {
  for (const stage of [3, 4]) {
    const { state: initial } = a3Run(A3_STORIES.find(story => story.key === (stage === 3 ? "work" : "message"))!);
    const states = [structuredClone(initial), structuredClone(initial)];
    if (stage === 3) states[1]!.family.workArrangement = "singleFullTimeCare";
    else states[1]!.family.persistentActorIds = states[1]!.family.persistentActorIds.filter(id => id !== "support-1");
    const rows = states.map(state => {
      const rebound = bindNarrativeA3Run({ ...createFamilyRun({ seed: 9 }), state, actors: state.replayOrigin!.actors });
      const content = createRunContent(rebound.state);
      const result = transitionGame(rebound.state, content, { type: "ADVANCE" });
      return { rngState: state.rngState, family: state.family, event: result.pendingEvent!.id,
        entries: content.ageStages[stage - 1]!.entryEventIds, requiredEventIds: content.requiredEventIds };
    });
    expect(rows[0]!.rngState).toBe(rows[1]!.rngState);
    expect(rows.map(row => row.event)).toEqual(stage === 3 ? ["nqa3-work-choice", "nqa3-bag-choice"] : ["nqa3-message-choice", "nqa3-shoes-choice"]);
    evidence.push({ kind: "single-dimension", stage, rows });
  }
});

it.each(A3_STORIES.filter(story => ["work", "message", "notice", "map"].includes(story.key)))("executes all actual replies and none with action-specific provenance: $key", story => {
  const seen = new Set<string>();
  for (const choiceId of story.choices) {
    const { state: initial, content } = a3Run(story);
    // Colleague is a scene actor, not a family member.
    content.actors.forEach(actor => { actor.availability = 1; });
    const waiting = transitionGame(initial, content, { type: "ADVANCE" }).state;
    for (let rngState = 1; rngState <= 128; rngState++) {
      let state = transitionGame({ ...waiting, rngState }, content, { type: "CHOOSE", choiceId }).state;
      const reaction = state.reactionHistory!.at(-1)!;
      if (reaction.kind !== "none") {
        expect(reaction.actorId).toBe(story.key === "work" ? "colleague-1" : story.key === "message" ? "support-1" : "child-1");
        expect(reaction.eventId).toBe(a3Root(story.key));
      }
      expect(state.relationshipMemories).toEqual([]);
      const key = `${choiceId}/${reaction.reactionId}`;
      if (!seen.has(key)) {
        for (let step = 0; step < 10 && state.ageStageProgress?.status === "active"; step++)
          state = transitionGame(state, content, getPlayerView(state, content).nextInput!).state;
        expect(restoreGame(serializeGame(state))).toMatchObject({ status: "restored", state });
        evidence.push({ kind: "reaction", story: story.key, choiceId, forcedRngState: rngState, reaction, journal: projectJournal(state) });
      }
      seen.add(key);
    }
    expect([...seen].filter(key => key.startsWith(choiceId + "/"))).toHaveLength(
      ["work", "message", "map"].includes(story.key) && choiceId === story.choices[1] ? 3 : 2);
  }
});

it.each(["message", "work"])("never answers an unasked remote question, a different scene, or a missing actor: %s", key => {
  const story = A3_STORIES.find(story => story.key === key)!;
  const { state, content } = a3Run(story);
  const event = content.events.find(event => event.id === a3Root(story.key))!;
  const flag = story.choices[1];
  const cases = [
    { state: { ...state, flags: [story.choices[0]] }, event },
    { state: { ...state, flags: [] }, event },
    { state: { ...state, flags: [flag] }, event: { ...event, contextTags: ["nqa3-bag"] } },
    { state: { ...state, flags: [flag] }, event: { ...event, actorIds: ["child-1"] } },
    ...(key === "message" ? [{ state: { ...state, flags: [flag], family: { ...state.family, persistentActorIds: [] } }, event }] : []),
  ];
  for (const row of cases) for (let rngState = 1; rngState <= 96; rngState++) {
    const reactions = resolveReactions({ ...row.state, rngState }, row.event, content).reactions;
    expect(reactions.every(reaction => reaction.entry?.kind === "none" || reaction.entry?.id === `nqa3-${key}-reply-0`)).toBe(true);
  }
  const unavailable = structuredClone(content);
  unavailable.actors.forEach(actor => { actor.availability = 0; });
  expect(resolveReactions({ ...state, flags: [flag] }, event, unavailable).reactions.every(reaction => reaction.entry?.kind === "none")).toBe(true);
});

it("rejects missing A3 continuations, spoofed releases and wrong flags while preserving bytes", () => {
  const chosen = a3Path(A3_STORIES[0], "nqa3-document").checkpoints.find(state => state.choiceHistory.length === 1)!;
  for (const mutate of [
    (data: any) => { data.state.contentBinding.releaseId = "narrative-quality-a3-v999"; },
    (data: any) => { data.state.contentBinding.releaseId = "narrative-quality-a2-v1"; },
    (data: any) => { data.state.scheduledFollowUps = []; },
    (data: any) => { data.state.scheduledFollowUps[0].eventId = "nqa3-bag-reflection"; },
    (data: any) => { data.state.flags = ["nqa3-reschedule"]; },
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

it("retains all four existing catalogues and adds fourteen A3 author nodes with four variant-only nodes", () => {
  const run = createFamilyRun({ seed: 9 });
  const a2 = bindNarrativeA2Run(run);
  const before = createRunContent(a2.state);
  const content = createRunContent(bindNarrativeA3Run(run).state);
  expect(before.events).toHaveLength(40);
  expect(content.events).toHaveLength(44);
  expect(content.events.filter(event => event.id.startsWith("nqa3-"))).toHaveLength(14);
  expect(content.events.filter(event => !event.id.startsWith("nqa3-")))
    .toEqual(before.events.filter(event => !NARRATIVE_A3_REPLACEMENTS[event.id]));
  expect(content.reactionPools.filter(pool => !pool.id.startsWith("nqa3-"))).toEqual(before.reactionPools);
  content.events[0]!.text = "caller mutation";
  expect(createRunContent(bindNarrativeA3Run(run).state).events[0]!.text).not.toBe("caller mutation");
  expect(createRunContent(a2.state)).toEqual(before);
});
