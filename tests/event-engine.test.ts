import { describe, expect, it } from "vitest";
import { gameStateSchema } from "../src/domain/schemas.js";

import {
  initializePrngState,
  nextPrng,
  transitionGame,
  type EngineTransition,
} from "../src/engine/index.js";
import { AGE_STAGE_MONTHS, type ContentPack, type EventNode, type GameState } from "../src/domain/index.js";

const makeChoiceEvent = (id: string, weight = 1): EventNode => ({
  id,
  ageStageId: "age-stage-1",
  kind: "choice",
  mode: "PLAYER_INPUT_REQUIRED",
  title: `事件 ${id}`,
  text: "今天的家庭生活需要做一個選擇。",
  weight,
  eligibility: { kind: "always" },
  actorIds: [],
  choices: [
    {
      id: "rest",
      text: "先休息一下",
      resourceDeltas: { energy: 10 },
      setFlags: [],
      relationshipMemoryIds: [],
      immediateFollowUpEventIds: [],
      scheduledFollowUps: [],
      knowledgeCardIds: [],
    },
    {
      id: "continue",
      text: "照原本的安排繼續",
      resourceDeltas: { energy: -5 },
      setFlags: [],
      relationshipMemoryIds: [],
      immediateFollowUpEventIds: [],
      scheduledFollowUps: [],
      knowledgeCardIds: [],
    },
  ],
  reactionPoolIds: [],
  knowledgeCardIds: [],
  immediateFollowUpEventIds: [],
  scheduledFollowUps: [],
  repeatable: false,
  cooldownTurns: 0,
});

const makeAutoEvent = (
  id: string,
  options: { repeatable?: boolean; maxVisits?: number; weight?: number } = {},
): EventNode => ({
  id,
  ageStageId: "age-stage-1",
  kind: "routine",
  mode: "AUTO_ADVANCE",
  title: `事件 ${id}`,
  text: "日常繼續往前。",
  weight: options.weight ?? 1,
  eligibility: { kind: "always" },
  actorIds: [],
  choices: [],
  reactionPoolIds: [],
  knowledgeCardIds: [],
  immediateFollowUpEventIds: [],
  scheduledFollowUps: [],
  repeatable: options.repeatable ?? false,
  cooldownTurns: 0,
  ...(options.maxVisits === undefined
    ? {}
    : { terminationGuard: { kind: "maxVisits" as const, count: options.maxVisits } }),
});

const makeContent = (events: EventNode[], entryEventIds = events.map((event) => event.id)): ContentPack => {
  const fallback = makeAutoEvent("safe-fallback");
  return {
    schemaVersion: 1,
    entryEventIds,
    fallbackEventId: fallback.id,
    requiredEventIds: [fallback.id, ...entryEventIds],
    ageStages: AGE_STAGE_MONTHS.map((childAgeMonths, order) => ({
      id: `age-stage-${order + 1}`,
      order,
      childAgeMonths,
      entryEventIds: order === 0 ? entryEventIds : [fallback.id],
      turnNodeLimit: 4,
      ageStageNodeLimit: 6,
    })),
    events: [...events, fallback],
    actors: [],
    reactionPools: [],
    knowledgeCards: [],
  };
};

const makeState = (seed = 123456789): GameState => ({
  schemaVersion: 1,
  seed,
  rngState: initializePrngState(seed),
  currentAgeStageId: "age-stage-1",
  currentTurnId: "turn-1",
  turn: {
    id: "turn-1",
    ageStageId: "age-stage-1",
    status: "active",
    nodeCount: 0,
    maxNodeCount: 4,
    activeEventId: null,
    processedEventIds: [],
  },
  eventProgress: null,
  resources: {
    finances: 50,
    energy: 50,
    support: 50,
    timeFlexibility: 50,
    connection: 50,
  },
  planningLoad: 0,
  family: {
    householdComposition: "singleCaregiver",
    careParticipation: "primaryAndBackup",
    workArrangement: "flexible",
    preferredAddress: "照顧者",
    childId: "child-1",
    persistentActorIds: [],
  },
  tendencies: {},
  flags: [],
  relationshipMemories: [],
  completedEventIds: [],
  scheduledFollowUps: [],
  choiceHistory: [],
  history: [],
});

const replay = (state: GameState, content: ContentPack): EngineTransition =>
  transitionGame(state, content, { type: "ADVANCE" });

describe("Core Event Engine Public Boundary", () => {
  it("resumes an interrupted immediate chain before higher-priority same-Turn schedules", () => {
    const first = makeAutoEvent("first");
    first.immediateFollowUpEventIds = ["reaction"];
    first.scheduledFollowUps = [{ eventId: "scheduled", delayTurns: 0, priority: 99 }];
    const reaction = makeChoiceEvent("reaction");
    const content = makeContent([first, reaction, makeChoiceEvent("scheduled")], [first.id]);
    const paused = transitionGame(makeState(), content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 1 });
    const state = gameStateSchema.parse(JSON.parse(JSON.stringify(paused.state)));
    const resumed = transitionGame(state, content, { type: "ADVANCE" });
    expect(resumed.pendingEvent?.id).toBe("reaction");
    const chosen = transitionGame(resumed.state, content, { type: "CHOOSE", choiceId: "rest" });
    const scheduled = transitionGame(chosen.state, content, { type: "ADVANCE" });
    expect(scheduled.pendingEvent?.id).toBe("scheduled");
    expect(scheduled.state.rngState).toBe(paused.state.rngState);
  });

  it("preserves the run-wide Turn clock across an AgeStage boundary", () => {
    const first = makeChoiceEvent("first");
    const later = makeChoiceEvent("later");
    later.ageStageId = "age-stage-2";
    const content = makeContent([first, later]);
    content.ageStages[1]!.entryEventIds = [later.id];
    let state = transitionGame(makeState(), content, { type: "ADVANCE" }).state;
    state = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    state = transitionGame(state, content, { type: "COMPLETE_AGE_STAGE" }).state;
    state = transitionGame(state, content, { type: "NEXT_AGE_STAGE" }).state;
    state = transitionGame(state, content, { type: "ADVANCE" }).state;
    expect(state.turnNumber).toBe(2);
    expect(state.eventLastResolvedTurn?.first).toBe(1);
  });

  it("keeps causal cycles bounded and every trace state contiguous", () => {
    const a = makeAutoEvent("loop-a", { repeatable: true, maxVisits: 1 });
    const b = makeAutoEvent("loop-b", { repeatable: true, maxVisits: 1 });
    a.immediateFollowUpEventIds = [b.id];
    b.immediateFollowUpEventIds = [a.id];
    const content = makeContent([a, b], [a.id]);
    const result = transitionGame(makeState(), content, { type: "ADVANCE" });
    expect(result.stopReason).toBe("CYCLE_PROTECTED");
    expect(result.results.map((entry) => entry.eventId)).toEqual(["loop-a", "loop-b", "loop-a"]);
    for (let i = 1; i < result.trace.length; i += 1) {
      expect(result.trace[i]!.beforeState).toEqual(result.trace[i - 1]!.afterState);
    }
    expect(result.trace.at(-1)?.afterState).toEqual(result.state);
    a.terminationGuard = { kind: "maxVisits", count: 100 };
    b.terminationGuard = { kind: "maxVisits", count: 100 };
    const bounded = transitionGame(makeState(), content, { type: "ADVANCE" });
    expect(bounded.stopReason).toBe("TURN_NODE_LIMIT");
    expect(bounded.state.turn?.nodeCount).toBe(4);
    const ended = transitionGame(bounded.state, content, { type: "START_TURN" });
    expect(transitionGame(ended.state, content, { type: "ADVANCE" }).stopReason).toBe("AGE_STAGE_NODE_LIMIT");
  });

  it("checks future-stage conditions only when due and orders schedules independently of array order", () => {
    const first = makeChoiceEvent("first");
    const future = makeChoiceEvent("future");
    future.ageStageId = "age-stage-2";
    first.choices[0]!.scheduledFollowUps = [
      { eventId: future.id, targetAgeStageId: "age-stage-2", delayTurns: 1, priority: 10,
        condition: { kind: "flag", flag: "ready" } },
      { eventId: "low", delayTurns: 0, priority: 1 },
      { eventId: "high", delayTurns: 0, priority: 5 },
    ];
    const ready = makeChoiceEvent("ready");
    ready.ageStageId = "age-stage-2";
    ready.choices[0]!.setFlags = ["ready"];
    const content = makeContent([first, future, ready, makeChoiceEvent("low"), makeChoiceEvent("high")], [first.id]);
    content.ageStages[1]!.entryEventIds = [ready.id];
    const run = (reverse: boolean) => {
      const transitions: EngineTransition[] = [];
      let state = makeState();
      const act = (input: Parameters<typeof transitionGame>[2]) => {
        const result = transitionGame(state, content, input);
        transitions.push(result);
        state = result.state;
        return result;
      };
      act({ type: "ADVANCE" });
      act({ type: "CHOOSE", choiceId: "rest" });
      if (reverse) state = { ...state, scheduledFollowUps: [...state.scheduledFollowUps].reverse() };
      const high = act({ type: "ADVANCE" });
      expect(high.pendingEvent?.id).toBe("high");
      expect(high.state.rngState).toBe(transitions[0]!.state.rngState);
      act({ type: "CHOOSE", choiceId: "continue" });
      expect(act({ type: "ADVANCE" }).pendingEvent?.id).toBe("low");
      act({ type: "CHOOSE", choiceId: "continue" });
      act({ type: "COMPLETE_AGE_STAGE" });
      act({ type: "NEXT_AGE_STAGE" });
      expect(act({ type: "ADVANCE" }).pendingEvent?.id).toBe("ready");
      act({ type: "CHOOSE", choiceId: "rest" });
      act({ type: "END_TURN" });
      act({ type: "START_TURN" });
      expect(act({ type: "ADVANCE" }).pendingEvent?.id).toBe("future");
      return transitions;
    };
    const normal = run(false);
    expect(run(false)).toEqual(normal);
    expect(run(true).flatMap((entry) => entry.results)).toEqual(normal.flatMap((entry) => entry.results));
  });

  it.each(["cooldownTurns", "guard"])("defers a scheduled repeat during its %s and resumes after the cooldown", (kind) => {
    const repeat = makeChoiceEvent("repeat");
    repeat.repeatable = true;
    if (kind === "guard") repeat.terminationGuard = { kind: "cooldown", turns: 2 };
    else repeat.cooldownTurns = 2;
    repeat.choices[0]!.scheduledFollowUps = [{ eventId: "repeat", delayTurns: 0, priority: 4 }];
    const ordinary = makeChoiceEvent("ordinary");
    ordinary.eligibility = { kind: "eventCompleted", eventId: "repeat" };
    const content = makeContent([repeat, ordinary]);
    let state = transitionGame(makeState(), content, { type: "ADVANCE" }).state;
    state = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    const cooling = transitionGame(state, content, { type: "ADVANCE" });
    expect(cooling.pendingEvent?.id).toBe("ordinary");
    expect(cooling.state.scheduledFollowUps[0]?.status).toBe("pending");
    state = transitionGame(cooling.state, content, { type: "CHOOSE", choiceId: "continue" }).state;
    state = transitionGame(state, content, { type: "END_TURN" }).state;
    state = transitionGame(state, content, { type: "START_TURN" }).state;
    // Turn 2 is still inside the two-Turn interval; use a new ordinary event.
    const next = makeChoiceEvent("next");
    content.events.push(next);
    content.ageStages[0]!.entryEventIds.push(next.id);
    const during = transitionGame(state, content, { type: "ADVANCE" });
    expect(during.pendingEvent?.id).toBe("next");
    state = transitionGame(during.state, content, { type: "CHOOSE", choiceId: "continue" }).state;
    state = transitionGame(state, content, { type: "END_TURN" }).state;
    state = transitionGame(state, content, { type: "START_TURN" }).state;
    const resumed = transitionGame(gameStateSchema.parse(JSON.parse(JSON.stringify(state))), content, { type: "ADVANCE" });
    expect(resumed.pendingEvent?.id).toBe("repeat");
    expect(resumed.state.scheduledFollowUps[0]?.status).toBe("consumed");
  });

  it("invalidates a chain when its continuation guard becomes false", () => {
    const first = makeChoiceEvent("first");
    const guarded = makeChoiceEvent("guarded");
    guarded.terminationGuard = { kind: "condition", condition: { kind: "not", condition: { kind: "flag", flag: "stop" } } };
    first.choices[0]!.setFlags = ["stop"];
    first.choices[0]!.immediateFollowUpEventIds = ["guarded"];
    const content = makeContent([first, guarded], [first.id]);
    let state = transitionGame(makeState(), content, { type: "ADVANCE" }).state;
    state = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    const result = transitionGame(state, content, { type: "ADVANCE" });
    expect(result.stopReason).toBe("FALLBACK");
    expect(result.state.scheduledFollowUps[0]?.status).toBe("expired");
  });

  it("cancels a pending schedule idempotently without advancing input or randomness", () => {
    const choice = makeChoiceEvent("planning");
    choice.choices[0]!.scheduledFollowUps = [{ eventId: "followup", delayTurns: 0, priority: 9 }];
    const content = makeContent([choice, makeChoiceEvent("followup"), makeChoiceEvent("ordinary")],
      [choice.id, "ordinary"]);
    content.events.find((event) => event.id === "ordinary")!.eligibility = { kind: "eventCompleted", eventId: "planning" };
    const pending = transitionGame(makeState(), content, { type: "ADVANCE" });
    const resolved = transitionGame(pending.state, content, { type: "CHOOSE", choiceId: "rest" });
    const id = resolved.state.scheduledFollowUps[0]!.id;
    const cancelled = transitionGame(resolved.state, content, { type: "CANCEL_SCHEDULED_EVENT", scheduledEventId: id });
    expect(cancelled.state.scheduledFollowUps[0]?.status).toBe("cancelled");
    expect(cancelled.state.rngState).toBe(resolved.state.rngState);
    expect(cancelled.state.turn).toEqual(resolved.state.turn);
    expect(transitionGame(cancelled.state, content, { type: "CANCEL_SCHEDULED_EVENT", scheduledEventId: id }).trace).toEqual([]);
    expect(transitionGame(cancelled.state, content, { type: "ADVANCE" }).pendingEvent?.id).toBe("ordinary");
  });

  it.each(["condition", "missing", "past-stage", "old-turn", "completed", "choices"])(
    "expires an invalid %s schedule and still selects an ordinary entry", (reason) => {
      const target = makeChoiceEvent("scheduled-decision");
      if (reason === "choices") target.choices[0]!.requirements = { kind: "flag", flag: "missing" };
      const content = makeContent([target, makeChoiceEvent("ordinary")], ["ordinary"]);
      const state = makeState();
      state.scheduledFollowUps = [{ id: "invalid", eventId: reason === "missing" ? "missing" : target.id,
        targetAgeStageId: "age-stage-1", dueAfterTurns: 0, priority: 10, status: "pending",
        ...(reason === "condition" ? { condition: { kind: "flag" as const, flag: "missing" } } : {}),
        ...(reason === "old-turn" ? { immediateTurnId: "previous-turn" } : {}),
      }];
      if (reason === "completed") state.completedEventIds = [target.id];
      if (reason === "past-stage") {
        state.currentAgeStageId = "age-stage-2";
        content.events.find((event) => event.id === "ordinary")!.ageStageId = "age-stage-2";
        content.ageStages[1]!.entryEventIds = ["ordinary"];
      }
      const result = transitionGame(state, content, { type: "ADVANCE" });
      expect(result.pendingEvent?.id).toBe("ordinary");
      expect(result.state.scheduledFollowUps[0]?.status).toBe("expired");
      expect(state.scheduledFollowUps[0]?.status).toBe("pending");
    },
  );

  it("continues a chosen three-node story through an immediate reaction and a later Turn", () => {
    const choice = makeChoiceEvent("ask-for-help");
    choice.choices[0]!.immediateFollowUpEventIds = ["partner-agrees"];
    const reaction = makeAutoEvent("partner-agrees");
    reaction.kind = "reaction";
    reaction.text = "Your partner agrees to take the next care shift.";
    reaction.scheduledFollowUps = [{ eventId: "care-handoff", delayTurns: 1, priority: 3,
      condition: { kind: "eventCompleted", eventId: "partner-agrees" } }];
    const handoff = makeChoiceEvent("care-handoff");
    const content = makeContent([choice, reaction, handoff], [choice.id]);
    let state = transitionGame(makeState(), content, { type: "ADVANCE" }).state;
    state = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    const immediate = transitionGame(state, content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 1 });
    expect(immediate.results[0]?.eventId).toBe("partner-agrees");
    expect(immediate.state.history.at(-1)?.text).toBe(reaction.text);
    state = transitionGame(immediate.state, content, { type: "END_TURN" }).state;
    state = transitionGame(state, content, { type: "START_TURN" }).state;
    const restored = gameStateSchema.parse(JSON.parse(JSON.stringify(state)));
    const later = transitionGame(restored, content, { type: "ADVANCE" });
    expect(later.pendingEvent?.id).toBe("care-handoff");
    expect(later.state.scheduledFollowUps.map((item) => item.status)).toEqual(["consumed", "consumed"]);
    expect(later).toEqual(transitionGame(state, content, { type: "ADVANCE" }));
  });

  it("enters stage-owned events in milestone order even when content arrays are reversed", () => {
    const content = makeContent([]);
    const events = content.ageStages.map((stage) => ({ ...makeChoiceEvent(`decision-${stage.order}`), ageStageId: stage.id }));
    content.events.push(...events);
    for (const stage of content.ageStages) stage.entryEventIds = [events[stage.order]!.id];
    content.ageStages.reverse();
    content.events.reverse();
    let state = makeState();
    for (let order = 0; order < 12; order += 1) {
      const pending = transitionGame(state, content, { type: "ADVANCE" });
      expect(pending.pendingEvent?.id).toBe(`decision-${order}`);
      const resolved = transitionGame(pending.state, content, { type: "CHOOSE", choiceId: "rest" });
      const complete = transitionGame(resolved.state, content, { type: "COMPLETE_AGE_STAGE" });
      state = transitionGame(complete.state, content, { type: "NEXT_AGE_STAGE" }).state;
    }
    expect(state.completedAgeStages).toHaveLength(12);
  });

  it("enforces hard boundaries immediately after player choices", () => {
    const content = makeContent([makeChoiceEvent("decision")]);
    const pending = transitionGame(makeState(), content, { type: "ADVANCE" });
    const fourth = { ...pending.state, turn: { ...pending.state.turn!, nodeCount: 3 } };
    const turnLimit = transitionGame(fourth, content, { type: "CHOOSE", choiceId: "rest" });
    expect(turnLimit.stopReason).toBe("TURN_NODE_LIMIT");
    expect(turnLimit.state.turn?.status).toBe("safelyEnded");
    const sixth = { ...pending.state, ageStageProgress: { ...pending.state.ageStageProgress!, nodeCount: 5 } };
    const stageLimit = transitionGame(sixth, content, { type: "CHOOSE", choiceId: "rest" });
    expect(stageLimit.stopReason).toBe("AGE_STAGE_NODE_LIMIT");
    expect(stageLimit.state.ageStageProgress?.status).toBe("safelyEnded");
    expect(stageLimit.state.choiceHistory).toHaveLength(1);
    expect(transitionGame(stageLimit.state, content, { type: "ADVANCE" }).state).toBe(stageLimit.state);
  });

  it("ends a multi-node Turn explicitly, starts another, and completes the stage without UI rules", () => {
    const content = makeContent([makeAutoEvent("routine", { repeatable: true, maxVisits: 10 })]);
    const first = transitionGame(makeState(), content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 2 });
    expect(first.state.turn?.nodeCount).toBe(2);
    const ended = transitionGame(first.state, content, { type: "END_TURN" });
    expect(ended.stopReason).toBe("TURN_COMPLETED");
    expect(ended.state.ageStageProgress?.status).toBe("active");
    expect(transitionGame(ended.state, content, { type: "ADVANCE" }).state).toBe(ended.state);
    const next = transitionGame(ended.state, content, { type: "START_TURN" });
    expect(next.state.currentTurnId).not.toBe(first.state.currentTurnId);
    expect(() => transitionGame(next.state, content, { type: "COMPLETE_AGE_STAGE" })).toThrow();
    const resolved = transitionGame(next.state, content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 1 });
    const complete = transitionGame(resolved.state, content, { type: "COMPLETE_AGE_STAGE" });
    expect(complete.state.completedAgeStages?.[0]).toMatchObject({ nodeCount: 3, turnCount: 2 });
    expect(complete.state.completedAgeStages?.[0]?.storyEntryIds).toHaveLength(3);
    expect(complete.state.turn?.status).toBe("completed");
    expect(() => transitionGame(first.state, content, { type: "NEXT_AGE_STAGE" })).toThrow();
    expect(() => transitionGame(first.state, content, { type: "START_TURN" })).toThrow();
  });

  it("resumes pending input and completed stages identically after JSON serialization", () => {
    const content = makeContent([makeChoiceEvent("decision")]);
    const pending = transitionGame(makeState(), content, { type: "ADVANCE" });
    expect(() => transitionGame(pending.state, content, { type: "END_TURN" })).toThrow();
    expect(() => transitionGame(pending.state, content, { type: "COMPLETE_AGE_STAGE" })).toThrow();
    const restored = gameStateSchema.parse(JSON.parse(JSON.stringify(pending.state)));
    const input = { type: "CHOOSE", choiceId: "rest" } as const;
    const resolved = transitionGame(pending.state, content, input);
    expect(transitionGame(restored, content, input)).toEqual(resolved);
    const complete = transitionGame(resolved.state, content, { type: "COMPLETE_AGE_STAGE" });
    const saved = gameStateSchema.parse(JSON.parse(JSON.stringify(complete.state)));
    expect(transitionGame(saved, content, { type: "NEXT_AGE_STAGE" })).toEqual(
      transitionGame(complete.state, content, { type: "NEXT_AGE_STAGE" }));
    for (const step of [pending, resolved, complete]) {
      expect(step.trace[0]?.beforeState.rngState).toBe(step.trace[0]?.rngStateBefore);
      expect(step.trace.at(-1)?.afterState).toEqual(step.state);
    }
  });

  it("filters executable choices, rejects hidden choices, and falls back if fewer than two remain", () => {
    const event = makeChoiceEvent("care-decision");
    event.choices.push({ ...event.choices[0]!, id: "ask-partner", requirements: { kind: "actorAvailable", actorId: "partner" } });
    const content = makeContent([event]);
    const pending = transitionGame(makeState(), content, { type: "ADVANCE" });
    expect(pending.pendingEvent?.choices.map((choice) => choice.id)).toEqual(["rest", "continue"]);
    expect(() => transitionGame(pending.state, content, { type: "CHOOSE", choiceId: "ask-partner" })).toThrow();
    event.choices[0]!.requirements = { kind: "resourceAtLeast", resource: "energy", value: 60 };
    const fallback = transitionGame(pending.state, content, { type: "ADVANCE" });
    expect(fallback.stopReason).toBe("FALLBACK");
    expect(fallback.pendingEvent).toBeNull();
    expect(fallback.state.choiceHistory).toEqual([]);
    expect(fallback.state.rngState).toBe(pending.state.rngState);
  });

  it("carries the six-node stage budget across multiple four-node Turns", () => {
    const event = makeAutoEvent("routine", { repeatable: true, maxVisits: 20 });
    const content = makeContent([event]);
    let transition = transitionGame(makeState(), content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 10 });
    expect(transition.stopReason).toBe("TURN_NODE_LIMIT");
    expect(transition.state.turn?.nodeCount).toBe(4);
    expect(transition.state.ageStageProgress?.nodeCount).toBe(4);
    transition = transitionGame(transition.state, content, { type: "START_TURN" });
    expect(transition.state.turn?.nodeCount).toBe(0);
    transition = transitionGame(transition.state, content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 2 });
    expect(transition.stopReason).toBe("AGE_STAGE_NODE_LIMIT");
    expect(transition.state.turn?.nodeCount).toBe(2);
    expect(transition.state.ageStageProgress).toMatchObject({ nodeCount: 6, turnCount: 2, status: "safelyEnded" });
    const stopped = transitionGame(transition.state, content, { type: "ADVANCE" });
    expect(stopped.state.history).toHaveLength(6);
    expect(gameStateSchema.parse(JSON.parse(JSON.stringify(stopped.state)))).toEqual(stopped.state);
  });

  it("starts from the family opening and completes all twelve stages in milestone order", () => {
    const content = makeContent([]);
    let state = makeState();
    state.turn = null;
    state.currentTurnId = null;
    const months: number[] = [];
    for (let index = 0; index < 12; index += 1) {
      months.push(content.ageStages.find((stage) => stage.id === state.currentAgeStageId)!.childAgeMonths);
      const completed = transitionGame(state, content, { type: "ADVANCE" });
      expect(completed.state.turn?.status).toBe("completed");
      expect(completed.state.ageStageProgress?.status).toBe("completed");
      expect(completed.state.ageStageProgress?.nodeCount).toBe(1);
      state = transitionGame(completed.state, content, { type: "NEXT_AGE_STAGE" }).state;
    }
    expect(months).toEqual([2, 6, 10, 15, 21, 27, 33, 39, 45, 52, 61, 71]);
    expect(state.completedAgeStages).toHaveLength(12);
    expect(state.completedAgeStages?.map((stage) => stage.storyEntryIds.length)).toEqual(Array(12).fill(1));
    expect(transitionGame(state, content, { type: "ADVANCE" }).stopReason).toBe("GAME_COMPLETED");
  });

  it("keeps the PRNG sequence stable and accepts only unsigned 32-bit state", () => {
    const first = nextPrng(initializePrngState(123456789));

    expect(first).toEqual({
      state: 1955022602,
      value: 0.2577907438389957,
    });
    expect(() => initializePrngState(-1)).toThrow(RangeError);
    expect(() => initializePrngState(0x1_0000_0000)).toThrow(RangeError);
    expect(() => nextPrng(1.5)).toThrow(RangeError);
  });

  it("replays weighted event selection and its transition trace from the same state", () => {
    const state = makeState();
    const content = makeContent([
      makeChoiceEvent("morning-routine", 1),
      makeChoiceEvent("preschool-dropoff", 3),
    ]);

    const firstRun = replay(state, content);
    const secondRun = replay(state, content);

    expect(firstRun).toEqual(secondRun);
    expect(firstRun.mode).toBe("PLAYER_INPUT_REQUIRED");
    expect(firstRun.pendingEvent?.id).toBe("preschool-dropoff");
    expect(firstRun.state.rngState).not.toBe(state.rngState);
    expect(firstRun.trace).toHaveLength(1);
    expect(firstRun.trace[0]).toMatchObject({
      input: { type: "ADVANCE" },
      rngStateBefore: state.rngState,
      rngStateAfter: firstRun.state.rngState,
      result: {
        kind: "AWAITING_INPUT",
        eventId: "preschool-dropoff",
      },
    });
    expect(firstRun.trace[0]?.beforeState).toBe(state);
    expect(firstRun.trace[0]?.afterState).toBe(firstRun.state);
  });

  it("resolves player input immutably and clamps visible resources to 0-100", () => {
    const initialState = makeState();
    initialState.resources = {
      finances: 5,
      energy: 95,
      support: 2,
      timeFlexibility: 3,
      connection: 4,
    };
    const choiceEvent = makeChoiceEvent("evening-routine");
    choiceEvent.choices[0]!.resourceDeltas = {
      finances: -10,
      energy: 10,
      support: -50,
      timeFlexibility: -4,
      connection: -5,
    };
    const content = makeContent([choiceEvent]);
    const awaitingInput = transitionGame(initialState, content, { type: "ADVANCE" });

    const resolved = transitionGame(awaitingInput.state, content, {
      type: "CHOOSE",
      choiceId: "rest",
    });

    expect(initialState.resources).toEqual({
      finances: 5,
      energy: 95,
      support: 2,
      timeFlexibility: 3,
      connection: 4,
    });
    expect(awaitingInput.state.resources).toEqual(initialState.resources);
    expect(resolved.mode).toBe("AUTO_ADVANCE");
    expect(resolved.pendingEvent).toBeNull();
    expect(resolved.state.resources).toEqual({
      finances: 0,
      energy: 100,
      support: 0,
      timeFlexibility: 0,
      connection: 0,
    });
    expect(resolved.state.completedEventIds).toEqual(["evening-routine"]);
    expect(resolved.state.choiceHistory).toEqual([
      {
        eventId: "evening-routine",
        choiceId: "rest",
        ageStageId: "age-stage-1",
        turnId: "turn-1",
      },
    ]);
    expect(resolved.state.turn).toMatchObject({
      status: "active",
      nodeCount: 1,
      activeEventId: null,
      processedEventIds: ["evening-routine"],
    });
    expect(resolved.trace).toHaveLength(1);
    expect(resolved.trace[0]).toMatchObject({
      beforeState: awaitingInput.state,
      input: { type: "CHOOSE", choiceId: "rest" },
      rngStateBefore: awaitingInput.state.rngState,
      rngStateAfter: awaitingInput.state.rngState,
      afterState: resolved.state,
      result: {
        kind: "EVENT_RESOLVED",
        eventId: "evening-routine",
        choiceId: "rest",
        resourceDeltas: {
          finances: -10,
          energy: 10,
          support: -50,
          timeFlexibility: -4,
          connection: -5,
        },
      },
    });
  });

  it("resolves AUTO_ADVANCE nodes and stops at the configured automatic node limit", () => {
    const state = makeState();
    const content = makeContent([makeAutoEvent("morning-passes")]);

    const transition = transitionGame(
      state,
      content,
      { type: "ADVANCE" },
      { maxAutoAdvanceNodes: 1 },
    );

    expect(transition.mode).toBe("AUTO_ADVANCE");
    expect(transition.stopReason).toBe("AUTO_ADVANCE_LIMIT");
    expect(transition.pendingEvent).toBeNull();
    expect(transition.results).toEqual([
      expect.objectContaining({
        kind: "EVENT_RESOLVED",
        eventId: "morning-passes",
        choiceId: null,
      }),
    ]);
    expect(transition.state.turn).toMatchObject({
      status: "active",
      nodeCount: 1,
      activeEventId: null,
      processedEventIds: ["morning-passes"],
    });
    expect(transition.state.completedEventIds).toEqual(["morning-passes"]);
    expect(transition.trace).toHaveLength(1);
    expect(transition.trace[0]?.afterState).toBe(transition.state);
  });

  it("continues through automatic nodes and stops at the next player-input boundary", () => {
    const state = makeState();
    const content = makeContent([
      makeAutoEvent("arrival", { weight: 1000 }),
      makeChoiceEvent("dropoff-decision", 1),
    ]);

    const transition = transitionGame(state, content, { type: "ADVANCE" });

    expect(transition.mode).toBe("PLAYER_INPUT_REQUIRED");
    expect(transition.stopReason).toBe("PLAYER_INPUT_REQUIRED");
    expect(transition.pendingEvent?.id).toBe("dropoff-decision");
    expect(transition.results.map((result) => [result.kind, result.eventId])).toEqual([
      ["EVENT_RESOLVED", "arrival"],
      ["AWAITING_INPUT", "dropoff-decision"],
    ]);
    expect(transition.trace).toHaveLength(2);
    expect(transition.trace[1]?.rngStateBefore).toBe(transition.trace[0]?.rngStateAfter);
    expect(transition.state.turn).toMatchObject({
      status: "awaitingInput",
      nodeCount: 1,
      activeEventId: "dropoff-decision",
      processedEventIds: ["arrival"],
    });
  });

  it("uses a safe fallback without consuming randomness when no event is eligible", () => {
    const state = makeState();
    const blockedEvent = makeChoiceEvent("needs-support");
    blockedEvent.eligibility = { kind: "flag", flag: "support-arranged" };
    const content = makeContent([blockedEvent]);

    const transition = transitionGame(state, content, { type: "ADVANCE" });

    expect(transition.mode).toBe("AUTO_ADVANCE");
    expect(transition.stopReason).toBe("FALLBACK");
    expect(transition.pendingEvent).toBeNull();
    expect(transition.state.rngState).toBe(state.rngState);
    expect(transition.state.resources).toEqual(state.resources);
    expect(transition.state.flags).toEqual(state.flags);
    expect(transition.state.turn).toMatchObject({
      status: "completed",
      nodeCount: 1,
      processedEventIds: ["safe-fallback"],
    });
    expect(transition.results).toEqual([
      expect.objectContaining({
        kind: "SAFE_FALLBACK",
        eventId: "safe-fallback",
      }),
    ]);
    expect(transition.trace[0]).toMatchObject({
      rngStateBefore: state.rngState,
      rngStateAfter: state.rngState,
      beforeState: state,
      afterState: transition.state,
    });
  });

  it("stops safely before selecting another event when the Turn node limit is reached", () => {
    const state = makeState();
    state.turn!.nodeCount = 4;
    state.turn!.processedEventIds = ["event-1", "event-2", "event-3", "event-4"];
    const content = makeContent([makeChoiceEvent("one-more-event")]);

    const transition = transitionGame(state, content, { type: "ADVANCE" });

    expect(transition.mode).toBe("AUTO_ADVANCE");
    expect(transition.stopReason).toBe("TURN_NODE_LIMIT");
    expect(transition.pendingEvent).toBeNull();
    expect(transition.state.rngState).toBe(state.rngState);
    expect(transition.state.turn).toMatchObject({
      status: "safelyEnded",
      nodeCount: 4,
      processedEventIds: ["event-1", "event-2", "event-3", "event-4"],
    });
    expect(transition.results).toEqual([
      expect.objectContaining({
        kind: "TURN_NODE_LIMIT",
        eventId: null,
      }),
    ]);
    expect(transition.trace[0]).toMatchObject({
      beforeState: state,
      rngStateBefore: state.rngState,
      rngStateAfter: state.rngState,
      afterState: transition.state,
    });
  });

  it("allows guarded repeat visits and returns a traceable cycle-protection result", () => {
    const state = makeState();
    const content = makeContent([
      makeAutoEvent("repeating-routine", { repeatable: true, maxVisits: 2 }),
    ]);

    const transition = transitionGame(state, content, { type: "ADVANCE" });

    expect(transition.mode).toBe("AUTO_ADVANCE");
    expect(transition.stopReason).toBe("CYCLE_PROTECTED");
    expect(transition.results.map((result) => result.kind)).toEqual([
      "EVENT_RESOLVED",
      "EVENT_RESOLVED",
      "CYCLE_PROTECTED",
    ]);
    expect(transition.results[2]).toMatchObject({
      eventId: "repeating-routine",
    });
    expect(transition.state.turn).toMatchObject({
      status: "cycleProtected",
      nodeCount: 2,
      activeEventId: null,
      processedEventIds: ["repeating-routine", "repeating-routine"],
    });
    expect(transition.trace).toHaveLength(3);
    expect(transition.trace[2]?.rngStateBefore).toBe(transition.trace[1]?.rngStateAfter);
    expect(transition.trace[2]?.rngStateAfter).toBe(transition.state.rngState);
    expect(transition.trace[2]?.afterState).toBe(transition.state);
  });

  it("completes the Turn when an automatic node reaches the Turn limit", () => {
    const state = makeState();
    state.turn!.nodeCount = 3;
    state.turn!.processedEventIds = ["event-1", "event-2", "event-3"];
    const content = makeContent([makeAutoEvent("final-node")]);

    const transition = transitionGame(state, content, { type: "ADVANCE" });

    expect(transition.stopReason).toBe("TURN_NODE_LIMIT");
    expect(transition.results.map((result) => result.kind)).toEqual([
      "EVENT_RESOLVED",
      "TURN_NODE_LIMIT",
    ]);
    expect(transition.state.turn).toMatchObject({
      status: "safelyEnded",
      nodeCount: 4,
      processedEventIds: ["event-1", "event-2", "event-3", "final-node"],
    });
    expect(transition.trace).toHaveLength(2);
  });

  it("keeps the current player-input boundary stable until a choice is submitted", () => {
    const state = makeState();
    const content = makeContent([makeChoiceEvent("waiting-choice")]);
    const awaitingInput = transitionGame(state, content, { type: "ADVANCE" });

    const repeatedAdvance = transitionGame(awaitingInput.state, content, { type: "ADVANCE" });

    expect(repeatedAdvance.mode).toBe("PLAYER_INPUT_REQUIRED");
    expect(repeatedAdvance.stopReason).toBe("PLAYER_INPUT_REQUIRED");
    expect(repeatedAdvance.pendingEvent?.id).toBe("waiting-choice");
    expect(repeatedAdvance.state).toBe(awaitingInput.state);
    expect(repeatedAdvance.state.rngState).toBe(awaitingInput.state.rngState);
    expect(repeatedAdvance.results).toEqual([]);
    expect(repeatedAdvance.trace).toEqual([]);
  });

  it("does not apply player input beyond the Turn node limit", () => {
    const initialState = makeState();
    const content = makeContent([makeChoiceEvent("late-choice")]);
    const awaitingInput = transitionGame(initialState, content, { type: "ADVANCE" });
    const atLimit: GameState = {
      ...awaitingInput.state,
      turn: {
        ...awaitingInput.state.turn!,
        nodeCount: 4,
        processedEventIds: ["event-1", "event-2", "event-3", "event-4"],
      },
    };

    const transition = transitionGame(atLimit, content, {
      type: "CHOOSE",
      choiceId: "rest",
    });

    expect(transition.stopReason).toBe("TURN_NODE_LIMIT");
    expect(transition.state.resources).toEqual(atLimit.resources);
    expect(transition.state.choiceHistory).toEqual([]);
    expect(transition.state.turn).toMatchObject({
      status: "safelyEnded",
      nodeCount: 4,
      activeEventId: null,
    });
  });

  it("replays the complete event and result trace for the same action sequence", () => {
    const content = makeContent([makeChoiceEvent("shared-evening")]);
    const runSequence = () => {
      const initialState = makeState();
      const awaitingInput = transitionGame(initialState, content, { type: "ADVANCE" });
      const resolved = transitionGame(awaitingInput.state, content, {
        type: "CHOOSE",
        choiceId: "continue",
      });
      return { awaitingInput, resolved };
    };

    const firstRun = runSequence();
    const secondRun = runSequence();

    expect(firstRun).toEqual(secondRun);
    expect(firstRun.resolved.results[0]).toMatchObject({
      eventId: "shared-evening",
      choiceId: "continue",
    });
  });

  it("uses seed only for initialization and continues from the PRNG state", () => {
    const content = makeContent([
      makeChoiceEvent("morning-routine", 1),
      makeChoiceEvent("preschool-dropoff", 3),
    ]);
    const firstState = makeState(1);
    firstState.rngState = initializePrngState(123456789);
    const secondState = makeState(0xffffffff);
    secondState.rngState = initializePrngState(123456789);

    const first = transitionGame(firstState, content, { type: "ADVANCE" });
    const second = transitionGame(secondState, content, { type: "ADVANCE" });

    expect(first.pendingEvent?.id).toBe(second.pendingEvent?.id);
    expect(first.state.rngState).toBe(second.state.rngState);
    expect(first.state.seed).toBe(1);
    expect(second.state.seed).toBe(0xffffffff);
  });

  it("does not depend on the incoming event or entry-ID iteration order", () => {
    const morning = makeChoiceEvent("morning-routine", 1);
    const dropoff = makeChoiceEvent("preschool-dropoff", 3);
    const firstContent = makeContent([morning, dropoff], [morning.id, dropoff.id]);
    const reorderedContent = makeContent([dropoff, morning], [dropoff.id, morning.id]);

    const first = transitionGame(makeState(), firstContent, { type: "ADVANCE" });
    const reordered = transitionGame(makeState(), reorderedContent, { type: "ADVANCE" });

    expect(first.pendingEvent?.id).toBe(reordered.pendingEvent?.id);
    expect(first.state.rngState).toBe(reordered.state.rngState);
  });
});
