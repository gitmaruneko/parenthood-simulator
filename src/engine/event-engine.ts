import type {
  Condition,
  ContentPack,
  EventNode,
  GameState,
  ResourceKey,
} from "../domain/schemas.js";
import { nextPrng } from "./prng.js";

export type EngineMode = "PLAYER_INPUT_REQUIRED" | "AUTO_ADVANCE";
export type EngineStopReason =
  | "PLAYER_INPUT_REQUIRED"
  | "EVENT_RESOLVED"
  | "AUTO_ADVANCE_LIMIT"
  | "FALLBACK"
  | "TURN_NODE_LIMIT"
  | "CYCLE_PROTECTED";

export interface EngineOptions {
  readonly maxAutoAdvanceNodes: number;
}

export type EngineInput =
  | Readonly<{ type: "ADVANCE" }>
  | Readonly<{ type: "CHOOSE"; choiceId: string }>;

export interface EngineEventResult {
  readonly kind:
    | "AWAITING_INPUT"
    | "EVENT_RESOLVED"
    | "SAFE_FALLBACK"
    | "TURN_NODE_LIMIT"
    | "CYCLE_PROTECTED";
  readonly eventId: string | null;
  readonly choiceId: string | null;
  readonly resourceDeltas: Readonly<Partial<Record<ResourceKey, number>>>;
}

export interface EngineTraceEntry {
  readonly beforeState: GameState;
  readonly input: EngineInput;
  readonly rngStateBefore: number;
  readonly rngStateAfter: number;
  readonly afterState: GameState;
  readonly result: EngineEventResult;
}

export interface EngineTransition {
  readonly state: GameState;
  readonly mode: EngineMode;
  readonly stopReason: EngineStopReason;
  readonly pendingEvent: EventNode | null;
  readonly results: readonly EngineEventResult[];
  readonly trace: readonly EngineTraceEntry[];
}

const chooseWeightedEvent = (
  events: readonly EventNode[],
  rngState: number,
): { readonly event: EventNode; readonly rngState: number } => {
  if (events.length === 0) {
    throw new Error("cannot choose an event from an empty candidate list");
  }

  const candidates = [...events].sort((left, right) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
  );
  const totalWeight = candidates.reduce((total, event) => total + event.weight, 0);
  const random = nextPrng(rngState);
  const target = random.value * totalWeight;
  let cumulativeWeight = 0;

  for (const event of candidates) {
    cumulativeWeight += event.weight;
    if (target < cumulativeWeight) {
      return { event, rngState: random.state };
    }
  }

  return { event: candidates[candidates.length - 1]!, rngState: random.state };
};

const conditionMatches = (condition: Condition, state: GameState): boolean => {
  switch (condition.kind) {
    case "always":
      return true;
    case "flag":
      return state.flags.includes(condition.flag);
    case "eventCompleted":
      return state.completedEventIds.includes(condition.eventId);
    case "eventNotCompleted":
      return !state.completedEventIds.includes(condition.eventId);
    case "resourceAtLeast":
      return state.resources[condition.resource] >= condition.value;
    case "resourceAtMost":
      return state.resources[condition.resource] <= condition.value;
    case "actorAvailable":
      return (
        state.family.childId === condition.actorId ||
        state.family.persistentActorIds.includes(condition.actorId)
      );
    case "all":
      return condition.conditions.every((child) => conditionMatches(child, state));
    case "any":
      return condition.conditions.some((child) => conditionMatches(child, state));
    case "not":
      return !conditionMatches(condition.condition, state);
  }
};

const getEntryEvents = (state: GameState, content: ContentPack): EventNode[] => {
  const stage = content.ageStages.find((candidate) => candidate.id === state.currentAgeStageId);
  if (!stage) {
    throw new Error(`unknown AgeStage: ${state.currentAgeStageId}`);
  }

  const entryIds = new Set(stage.entryEventIds);
  return content.events.filter(
    (event) =>
      entryIds.has(event.id) &&
      conditionMatches(event.eligibility, state) &&
      (event.repeatable || !state.completedEventIds.includes(event.id)),
  );
};

const RESOURCE_KEYS = [
  "finances",
  "energy",
  "support",
  "timeFlexibility",
  "connection",
] as const satisfies readonly ResourceKey[];

const clampResource = (value: number): number => Math.min(100, Math.max(0, value));

const applyResourceDeltas = (
  resources: GameState["resources"],
  deltas: Readonly<Partial<Record<ResourceKey, number>>>,
): GameState["resources"] => {
  const nextResources = { ...resources };
  for (const key of RESOURCE_KEYS) {
    nextResources[key] = clampResource(resources[key] + (deltas[key] ?? 0));
  }
  return nextResources;
};

const appendUnique = (values: readonly string[], additions: readonly string[]): string[] => [
  ...values,
  ...additions.filter((addition) => !values.includes(addition)),
];

interface NodeResolution {
  readonly state: GameState;
  readonly result: EngineEventResult;
  readonly trace: EngineTraceEntry;
}

const makeTrace = (
  beforeState: GameState,
  input: EngineInput,
  afterState: GameState,
  result: EngineEventResult,
): EngineTraceEntry => ({
  beforeState,
  input,
  rngStateBefore: beforeState.rngState,
  rngStateAfter: afterState.rngState,
  afterState,
  result,
});

const makeResolution = (
  beforeState: GameState,
  input: EngineInput,
  state: GameState,
  result: EngineEventResult,
): NodeResolution => ({
  state,
  result,
  trace: makeTrace(beforeState, input, state, result),
});

const awaitPlayerInput = (
  state: GameState,
  event: EventNode,
  input: Extract<EngineInput, { type: "ADVANCE" }>,
  rngStateAfter: number,
): NodeResolution => {
  if (!state.turn || !state.currentTurnId) {
    throw new Error("an active Turn is required");
  }

  const nextState: GameState = {
    ...state,
    rngState: rngStateAfter,
    turn: {
      ...state.turn,
      status: "awaitingInput",
      activeEventId: event.id,
    },
    eventProgress: {
      ageStageId: state.currentAgeStageId,
      turnId: state.currentTurnId,
      eventId: event.id,
      nodeIndex: state.turn.nodeCount,
      status: "awaitingInput",
    },
  };
  const result: EngineEventResult = {
    kind: "AWAITING_INPUT",
    eventId: event.id,
    choiceId: null,
    resourceDeltas: {},
  };

  return makeResolution(state, input, nextState, result);
};

const completeEventNode = (
  state: GameState,
  event: EventNode,
  input: EngineInput,
  rngStateAfter: number,
  resultKind: "EVENT_RESOLVED" | "SAFE_FALLBACK" = "EVENT_RESOLVED",
  choice: EventNode["choices"][number] | null = null,
): NodeResolution => {
  if (!state.turn || !state.currentTurnId) {
    throw new Error("an active Turn is required");
  }

  const nodeIndex = state.turn.nodeCount;
  const nextState: GameState = {
    ...state,
    rngState: rngStateAfter,
    resources: choice
      ? applyResourceDeltas(state.resources, choice.resourceDeltas)
      : state.resources,
    flags: choice ? appendUnique(state.flags, choice.setFlags) : state.flags,
    completedEventIds: appendUnique(state.completedEventIds, [event.id]),
    choiceHistory: choice
      ? [
          ...state.choiceHistory,
          {
            eventId: event.id,
            choiceId: choice.id,
            ageStageId: state.currentAgeStageId,
            turnId: state.currentTurnId,
          },
        ]
      : state.choiceHistory,
    history: [
      ...state.history,
      {
        id: `story-${state.currentTurnId}-${nodeIndex + 1}`,
        ageStageId: state.currentAgeStageId,
        turnId: state.currentTurnId,
        kind: "event",
        text: event.text,
      },
    ],
    turn: {
      ...state.turn,
      status: choice ? "active" : state.turn.status,
      nodeCount: nodeIndex + 1,
      activeEventId: null,
      processedEventIds: [...state.turn.processedEventIds, event.id],
    },
    eventProgress: {
      ageStageId: state.currentAgeStageId,
      turnId: state.currentTurnId,
      eventId: event.id,
      nodeIndex,
      status: "completed",
    },
  };
  const result: EngineEventResult = {
    kind: resultKind,
    eventId: event.id,
    choiceId: choice?.id ?? null,
    resourceDeltas: choice ? { ...choice.resourceDeltas } : {},
  };

  return makeResolution(state, input, nextState, result);
};

const stopAtTurnNodeLimit = (
  state: GameState,
  input: EngineInput,
): NodeResolution => {
  if (!state.turn) {
    throw new Error("an active Turn is required");
  }

  const nextState: GameState = {
    ...state,
    turn: {
      ...state.turn,
      activeEventId: null,
    },
  };
  const result: EngineEventResult = {
    kind: "TURN_NODE_LIMIT",
    eventId: null,
    choiceId: null,
    resourceDeltas: {},
  };

  return makeResolution(state, input, nextState, result);
};

const stopAtCycle = (
  state: GameState,
  event: EventNode,
  input: Extract<EngineInput, { type: "ADVANCE" }>,
  rngStateAfter: number,
): NodeResolution => {
  if (!state.turn) {
    throw new Error("an active Turn is required");
  }

  const nextState: GameState = {
    ...state,
    rngState: rngStateAfter,
    turn: {
      ...state.turn,
      status: "cycleProtected",
      activeEventId: null,
    },
  };
  const result: EngineEventResult = {
    kind: "CYCLE_PROTECTED",
    eventId: event.id,
    choiceId: null,
    resourceDeltas: {},
  };

  return makeResolution(state, input, nextState, result);
};

const getMaximumVisits = (event: EventNode): number =>
  event.terminationGuard?.kind === "maxVisits" ? event.terminationGuard.count : 1;

const resolveChoice = (
  state: GameState,
  content: ContentPack,
  input: Extract<EngineInput, { type: "CHOOSE" }>,
): EngineTransition => {
  if (!state.turn || !state.currentTurnId || !state.turn.activeEventId) {
    throw new Error("player input requires an active EventNode");
  }

  if (state.turn.nodeCount >= state.turn.maxNodeCount) {
    const stopped = stopAtTurnNodeLimit(state, input);
    return {
      state: stopped.state,
      mode: "AUTO_ADVANCE",
      stopReason: "TURN_NODE_LIMIT",
      pendingEvent: null,
      results: [stopped.result],
      trace: [stopped.trace],
    };
  }

  const event = content.events.find((candidate) => candidate.id === state.turn?.activeEventId);
  if (!event || event.mode !== "PLAYER_INPUT_REQUIRED") {
    throw new Error(`active event does not accept player input: ${state.turn.activeEventId}`);
  }

  const choice = event.choices.find((candidate) => candidate.id === input.choiceId);
  if (!choice) {
    throw new Error(`unknown choice for ${event.id}: ${input.choiceId}`);
  }

  const resolved = completeEventNode(
    state,
    event,
    input,
    state.rngState,
    "EVENT_RESOLVED",
    choice,
  );

  return {
    state: resolved.state,
    mode: "AUTO_ADVANCE",
    stopReason: "EVENT_RESOLVED",
    pendingEvent: null,
    results: [resolved.result],
    trace: [resolved.trace],
  };
};

export const transitionGame = (
  state: GameState,
  content: ContentPack,
  input: EngineInput,
  options: EngineOptions = { maxAutoAdvanceNodes: 4 },
): EngineTransition => {
  if (input.type === "CHOOSE") {
    return resolveChoice(state, content, input);
  }

  if (!state.turn || !state.currentTurnId) {
    throw new Error("an active Turn is required");
  }

  if (state.turn.status === "awaitingInput" && state.turn.activeEventId) {
    const pendingEvent = content.events.find(
      (event) => event.id === state.turn?.activeEventId,
    );
    if (!pendingEvent || pendingEvent.mode !== "PLAYER_INPUT_REQUIRED") {
      throw new Error(`pending player-input event is unavailable: ${state.turn.activeEventId}`);
    }

    return {
      state,
      mode: "PLAYER_INPUT_REQUIRED",
      stopReason: "PLAYER_INPUT_REQUIRED",
      pendingEvent,
      results: [],
      trace: [],
    };
  }

  if (!Number.isInteger(options.maxAutoAdvanceNodes) || options.maxAutoAdvanceNodes < 1) {
    throw new RangeError("maxAutoAdvanceNodes must be a positive integer");
  }

  let currentState = state;
  let automaticNodeCount = 0;
  const results: EngineEventResult[] = [];
  const trace: EngineTraceEntry[] = [];

  while (true) {
    if (currentState.turn!.nodeCount >= currentState.turn!.maxNodeCount) {
      const stopped = stopAtTurnNodeLimit(currentState, input);
      results.push(stopped.result);
      trace.push(stopped.trace);
      return {
        state: stopped.state,
        mode: "AUTO_ADVANCE",
        stopReason: "TURN_NODE_LIMIT",
        pendingEvent: null,
        results,
        trace,
      };
    }

    const candidates = getEntryEvents(currentState, content);
    if (candidates.length === 0) {
      const fallback = content.events.find((event) => event.id === content.fallbackEventId);
      if (!fallback || fallback.mode !== "AUTO_ADVANCE") {
        throw new Error(`safe fallback is unavailable: ${content.fallbackEventId}`);
      }

      const resolved = completeEventNode(
        currentState,
        fallback,
        input,
        currentState.rngState,
        "SAFE_FALLBACK",
      );
      results.push(resolved.result);
      trace.push(resolved.trace);
      return {
        state: resolved.state,
        mode: "AUTO_ADVANCE",
        stopReason: "FALLBACK",
        pendingEvent: null,
        results,
        trace,
      };
    }

    const selected = chooseWeightedEvent(candidates, currentState.rngState);
    const event = selected.event;
    const priorVisits = currentState.turn!.processedEventIds.filter(
      (eventId) => eventId === event.id,
    ).length;
    if (priorVisits >= getMaximumVisits(event)) {
      const stopped = stopAtCycle(currentState, event, input, selected.rngState);
      results.push(stopped.result);
      trace.push(stopped.trace);
      return {
        state: stopped.state,
        mode: "AUTO_ADVANCE",
        stopReason: "CYCLE_PROTECTED",
        pendingEvent: null,
        results,
        trace,
      };
    }

    if (event.mode === "PLAYER_INPUT_REQUIRED") {
      const boundary = awaitPlayerInput(currentState, event, input, selected.rngState);
      results.push(boundary.result);
      trace.push(boundary.trace);
      return {
        state: boundary.state,
        mode: "PLAYER_INPUT_REQUIRED",
        stopReason: "PLAYER_INPUT_REQUIRED",
        pendingEvent: event,
        results,
        trace,
      };
    }

    const resolved = completeEventNode(currentState, event, input, selected.rngState);
    currentState = resolved.state;
    automaticNodeCount += 1;
    results.push(resolved.result);
    trace.push(resolved.trace);

    if (automaticNodeCount >= options.maxAutoAdvanceNodes) {
      return {
        state: currentState,
        mode: "AUTO_ADVANCE",
        stopReason: "AUTO_ADVANCE_LIMIT",
        pendingEvent: null,
        results,
        trace,
      };
    }
  }
};
