import { describe, expect, it } from "vitest";

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
      status: "active",
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
      status: "active",
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
      status: "active",
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
      status: "awaitingInput",
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
