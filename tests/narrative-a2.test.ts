import { writeFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import { afterAll, afterEach, expect, it } from "vitest";
import { bindNarrativeRun, bindNarrativeA2Run, createRunContent } from "../src/content/releases.js";
import { createFamilyRun, createFamilyReview, getPlayerView, projectJournal, replayFamilyRun, transitionGame } from "../src/engine/index.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY, restoreGame, serializeGame } from "../src/persistence/index.js";
import { A2_STORIES, a2Root, a2Reflection, NARRATIVE_A2_RELEASE, NARRATIVE_A2_REPLACEMENTS } from "../src/content/narrative-a2.js";
import { familyProfileSchema } from "../src/domain/schemas.js";
import { createPlayerSession } from "../src/ui/player-session.js";
import { a2Path, a2Run } from "./helpers/narrative-a2.js";

const evidence: object[] = [];
afterEach(() => setImmediate());
afterAll(() => {
  if (process.env.NQA2_WRITE_EVIDENCE === "1") writeFileSync("docs/examples/NARRATIVE-A2-RUNS.json", JSON.stringify({
    releaseId: NARRATIVE_A2_RELEASE, seam: "real ContentPack / public Engine / Journal / Save-Restore / Review / Session", rows: evidence,
  }, null, 2) + "\n");
});
const paths = A2_STORIES.flatMap(story => story.choices.map(choiceId => ({ story, choiceId })));

it.each([
  { key: "meal", choices: ["nqa2-simplify", "nqa2-finish"], results: ["你把收起的第二道菜備料留待之後處理，再把今天用到的器具集中到桌邊，將椅子推回去。", "兩道菜用餐後，你把做菜與吃飯用過的器具集中到桌邊，將椅子推回去。"] },
  { key: "supplies", choices: ["nqa2-buy", "nqa2-list"], results: ["回家後，你在外出袋的清單分出『待補』與『已有備用』兩格，把今天多買的一包記在『已有備用』。清單留在袋內側。", "回家後，你在外出袋的清單分出『待補』與『已有備用』兩格，把尚未補貨的濕紙巾記在『待補』。手機上的補貨待辦仍留著，袋內也有了可查的清單。"] },
  { key: "rain", choices: ["nqa2-wait", "nqa2-covered"], results: ["整理好雨具後，你帶孩子離開等候區，沿有遮蔽的長路返家。沒有等到雨停；進門後，你把濕襪放進待洗籃，將外出袋留在門邊晾放。", "沿有遮蔽的長路走回家後，你把濕襪放進待洗籃，將外出袋留在門邊晾放。繞遠的這段路已走完。"] },
])("uses the actual $key action to select a different continuation, not just the immediate result", ({ key, choices, results }) => {
  const story = A2_STORIES.find(story => story.key === key)!;
  const runs = choices.map(choiceId => a2Path(story, choiceId));
  for (const [index, run] of runs.entries()) {
    expect(run.state.completedEventIds).toContain(`nqa2-${key}-after-${choices[index]!.slice(5)}`);
    expect(run.state.history.map(row => row.text)).toContain(results[index]);
    expect(run.state.completedEventIds).not.toContain(`nqa2-${key}-after-${choices[1 - index]!.slice(5)}`);
  }
});

it("replaces ten original nodes with thirteen A2 nodes and retains all other A1 and 08A content independently", () => {
  const opening = createFamilyRun({ seed: 9 });
  const original = createRunContent(bindNarrativeRun(opening).state);
  const bound = bindNarrativeA2Run(opening);
  const content = createRunContent(bound.state);
  expect(content.events).toHaveLength(40);
  expect(content.events.filter(event => event.id.startsWith("nqa2-"))).toHaveLength(13);
  expect(content.events.filter(event => !event.id.startsWith("nqa2-")))
    .toEqual(original.events.filter(event => !NARRATIVE_A2_REPLACEMENTS[event.id]));
  expect(content.reactionPools.filter(pool => !pool.id.startsWith("nqa2-"))).toEqual(original.reactionPools);
  content.events[0]!.text = "caller mutation";
  expect(createRunContent(bound.state).events[0]!.text).not.toBe("caller mutation");
  expect(createRunContent(bindNarrativeRun(opening).state)).toEqual(original);
});

it("records the actual stage 6 supply tool and classification on either action", () => {
  for (const choiceId of ["nqa2-buy", "nqa2-list"]) {
    let { state } = bindNarrativeA2Run(createFamilyRun({ seed: 9, firstAgeStageId: "age-stage-6" }));
    const content = createRunContent(state);
    for (let step = 0; step < 12; step++) {
      if (state.ageStageProgress && state.ageStageProgress.status !== "active") break;
      const view = getPlayerView(state, content);
      state = transitionGame(state, content, view.pendingEvent ? { type: "CHOOSE", choiceId } : view.nextInput!).state;
      expect(restoreGame(serializeGame(state))).toMatchObject({ status: "restored", state });
    }
    expect(state.completedEventIds).toContain(a2Reflection("supplies", choiceId));
    expect(state.history).toContainEqual(expect.objectContaining({ kind: "support", resolvedEventId: a2Reflection("supplies", choiceId) }));
    expect(state.history).toContainEqual(expect.objectContaining({ kind: "planning", text: choiceId === "nqa2-buy"
      ? "你把已補的一包記在袋內清單的『已有備用』格，留下這次實際盤點的記錄。"
      : "你把尚未補貨的濕紙巾記在袋內清單的『待補』格，補貨待辦沒有被當成已完成。" }));
    expect(state.relationshipMemories).toEqual([]);
  }
});

const baselineCases = paths.flatMap(path => [0, 1].flatMap(availability => [9, 1, 11, 2].map(seed => ({ ...path, availability, seed }))));
it.each(baselineCases)("restores every checkpoint: $choiceId / seed=$seed / availability=$availability", ({ story, choiceId, seed, availability }) => {
    const { state, content, checkpoints } = a2Path(story, choiceId, seed, availability);
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
    expect(state.completedEventIds).toContain(a2Reflection(story.key, choiceId));
    expect(state.flags.filter(flag => story.choices.includes(flag as never))).toEqual([choiceId]);
    expect(state.relationshipMemories).toEqual([]);
    expect(state.history.some(row => row.kind === "repair")).toBe(false);
    if (availability === 0) expect((state.reactionHistory ?? []).every(row => row.kind === "none")).toBe(true);
    if (["meal", "supplies", "rain"].includes(story.key)) expect(state.reactionHistory ?? []).toEqual([]);
    if (availability === 1) evidence.push({ kind: "path", story: story.key, choiceId, seed, family: state.family,
      journal: projectJournal(state), reactions: state.reactionHistory, history: state.history,
      progress: state.ageStageProgress, checkpointCount: checkpoints.length, checkpointRestorePassed: true });
});

it.each(A2_STORIES.filter(story => ["park", "rest"].includes(story.key)))("reaches every action-specific reaction and none: $key", story => {
  const seen = new Set<string>();
  for (const choiceId of story.choices) {
    const { state: initial, content } = a2Run(story);
    const waiting = transitionGame(initial, content, { type: "ADVANCE" }).state;
    const event = content.events.find(event => event.id === a2Root(story.key))!;
    for (let rngState = 1; rngState <= 96; rngState++) {
      let state = transitionGame({ ...waiting, rngState }, content, { type: "CHOOSE", choiceId }).state;
      const reaction = state.reactionHistory!.at(-1)!;
      const other = transitionGame({ ...waiting, rngState }, content, { type: "CHOOSE", choiceId: story.choices.find(id => id !== choiceId)! }).state;
      if (reaction.kind !== "none") {
        expect(reaction.actorId).toBe("child-1");
        expect(other.reactionHistory!.at(-1)!.reactionId).not.toBe(reaction.reactionId);
      }
      const reactionEntries = state.history.flatMap(row => row.journal ?? []).filter(row => "reactionHistoryIndex" in row && row.reactionHistoryIndex !== undefined);
      expect(reactionEntries).toHaveLength(reaction.kind === "none" ? 0 : 1);
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
    expect([...seen].filter(key => key.startsWith(choiceId + "/"))).toHaveLength(3);
    expect(event.reactionPoolIds).toHaveLength(1);
  }
});

const familyConfigurations = familyProfileSchema.shape.householdComposition.options.flatMap(householdComposition =>
  familyProfileSchema.shape.careParticipation.options.flatMap(careParticipation =>
    familyProfileSchema.shape.workArrangement.options.map(workArrangement => ({ householdComposition, careParticipation, workArrangement }))));

it.each(familyConfigurations)("runs all ten actions at zero resources, including absent adults: $householdComposition / $careParticipation / $workArrangement", family => {
  for (const noAdults of [false, true]) for (const { story, choiceId } of paths) {
    let { state, content } = a2Run(story, 2, 0, family, noAdults);
    state.resources = { energy: 0, timeFlexibility: 0, finances: 0, support: 0, connection: 0 };
    state.planningLoad = 0;
    state.flags = [...story.choices]; // The current occurrence clears stale action flags.
    for (let step = 0; step < 12; step++) {
      if (state.ageStageProgress && state.ageStageProgress.status !== "active") break;
      const view = getPlayerView(state, content);
      if (view.pendingEvent) expect(view.pendingEvent.choices.map(choice => choice.id)).toEqual(story.choices);
      state = transitionGame(state, content, view.pendingEvent ? { type: "CHOOSE", choiceId } : view.nextInput!).state;
    }
    expect(state.completedEventIds).toContain(a2Reflection(story.key, choiceId));
    expect(state.flags.filter(flag => story.choices.includes(flag as never))).toEqual([choiceId]);
    expect(restoreGame(serializeGame(state))).toMatchObject({ status: "restored", state });
  }
}, 60000);

it.each([9, 1, 11, 2])("completes twelve stages, tool support, repair, review and replay: seed %s", seed => {
  for (const last of [false, true]) {
    let { state } = bindNarrativeA2Run(createFamilyRun({ seed }));
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
    expect(state.history.some(row => row.kind === "support" && row.resolvedEventId === a2Reflection("supplies", last ? "nqa2-list" : "nqa2-buy"))).toBe(true);
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
  const { checkpoints, content } = a2Path(story, choiceId);
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

it("rejects missing continuations, wrong flags, release spoofing and unknown versions without overwriting bytes", () => {
  const story = A2_STORIES[2];
  const chosen = a2Path(story, "nqa2-list").checkpoints.find(state => state.choiceHistory.length === 1)!;
  for (const mutate of [
    (data: any) => { data.state.contentBinding.releaseId = "narrative-quality-a2-v999"; },
    (data: any) => { data.state.contentBinding.assemblyVersion = 99; },
    (data: any) => { data.state.contentBinding.releaseId = "narrative-quality-a1-v1"; },
    (data: any) => { data.state.scheduledFollowUps = []; },
    (data: any) => { data.state.scheduledFollowUps[0].eventId = "nqa2-supplies-after-buy"; },
    (data: any) => { data.state.flags = ["nqa2-buy"]; },
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
