import type {
  Condition,
  ContentPack,
  EventNode,
  GameState,
  ResourceKey,
} from "../domain/schemas.js";
import { nextPrng } from "./prng.js";
import { ensureStageProgress, finishStage, nextStage, startTurn } from "./lifecycle.js";

export type EngineMode = "PLAYER_INPUT_REQUIRED" | "AUTO_ADVANCE";
export type EngineStopReason =
  | "PLAYER_INPUT_REQUIRED"
  | "EVENT_RESOLVED"
  | "AUTO_ADVANCE_LIMIT"
  | "FALLBACK"
  | "TURN_NODE_LIMIT"
  | "CYCLE_PROTECTED"
  | "AGE_STAGE_NODE_LIMIT"
  | "TURN_COMPLETED"
  | "AGE_STAGE_COMPLETED"
  | "GAME_COMPLETED"
  | "TURN_STARTED"
  | "AGE_STAGE_STARTED"
  | "SCHEDULE_CANCELLED";

export interface EngineOptions {
  readonly maxAutoAdvanceNodes: number;
}

export type EngineInput =
  | Readonly<{ type: "ADVANCE" }>
  | Readonly<{ type: "CANCEL_SCHEDULED_EVENT"; scheduledEventId: string }>
  | Readonly<{ type: "CHOOSE"; choiceId: string }>
  | Readonly<{ type: "START_TURN" }>
  | Readonly<{ type: "END_TURN" }>
  | Readonly<{ type: "COMPLETE_AGE_STAGE" }>
  | Readonly<{ type: "NEXT_AGE_STAGE" }>;

export interface EngineEventResult {
  readonly kind:
    | "AWAITING_INPUT"
    | "EVENT_RESOLVED"
    | "SAFE_FALLBACK"
    | "TURN_NODE_LIMIT"
    | "CYCLE_PROTECTED"
    | "AGE_STAGE_NODE_LIMIT"
    | "TURN_COMPLETED"
    | "AGE_STAGE_COMPLETED"
    | "GAME_COMPLETED"
    | "TURN_STARTED"
    | "AGE_STAGE_STARTED"
    | "SCHEDULE_CANCELLED";
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

const executableEvent = (event: EventNode, state: GameState): EventNode => ({
  ...event,
  choices: event.choices.filter((choice) => !choice.requirements || conditionMatches(choice.requirements, state)),
});

const eventEligible = (event: EventNode, state: GameState): boolean =>
  event.ageStageId === state.currentAgeStageId &&
  (event.mode !== "PLAYER_INPUT_REQUIRED" || executableEvent(event, state).choices.length >= 2) &&
  conditionMatches(event.eligibility, state) &&
  (event.terminationGuard?.kind !== "condition" || conditionMatches(event.terminationGuard.condition, state)) &&
  (event.repeatable || !state.completedEventIds.includes(event.id));

const eventCoolingDown = (event: EventNode, state: GameState): boolean => {
  const lastTurn = state.eventLastResolvedTurn?.[event.id];
  const cooldown = Math.max(event.cooldownTurns,
    event.terminationGuard?.kind === "cooldown" ? event.terminationGuard.turns : 0);
  return lastTurn !== undefined && cooldown > 0 && (state.turnNumber ?? 1) - lastTurn < cooldown;
};

const isScheduleDue = (item: GameState["scheduledFollowUps"][number], state: GameState): boolean =>
  item.targetAgeStageId === state.currentAgeStageId &&
  item.dueAfterTurns < state.ageStageProgress!.turnCount;

const selectScheduledEvent = (state: GameState, content: ContentPack): {
  state: GameState; event: EventNode | undefined;
} => {
  const stageOrder = new Map(content.ageStages.map((stage) => [stage.id, stage.order]));
  const scheduledFollowUps = state.scheduledFollowUps.map((item) => {
    if (item.status !== "pending") return item;
    const targetOrder = stageOrder.get(item.targetAgeStageId);
    const currentOrder = stageOrder.get(state.currentAgeStageId)!;
    const due = isScheduleDue(item, state);
    const event = content.events.find((event) => event.id === item.eventId);
    if (targetOrder === undefined || targetOrder < currentOrder || !event ||
        (item.immediateTurnId !== undefined && item.immediateTurnId !== state.currentTurnId) ||
        (due && ((!eventEligible(event, state)) ||
          (item.condition !== undefined && !conditionMatches(item.condition, state))))) {
      return { ...item, status: "expired" as const };
    }
    return item;
  });
  const due = scheduledFollowUps.filter((item) => item.status === "pending" &&
    isScheduleDue(item, state) &&
    !eventCoolingDown(content.events.find((event) => event.id === item.eventId)!, state))
    .sort((a, b) => Number(!!b.immediateTurnId) - Number(!!a.immediateTurnId) ||
      b.priority - a.priority || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const selected = due[0];
  return { state: { ...state, scheduledFollowUps: scheduledFollowUps.map((item) => item.id === selected?.id
    ? { ...item, status: "consumed" } : item) },
    event: selected && content.events.find((event) => event.id === selected.eventId) };
};

const lifecycleTransition = (
  before: GameState, state: GameState, input: EngineInput, stopReason: Extract<EngineStopReason, EngineEventResult["kind"]>,
): EngineTransition => {
  const result: EngineEventResult = { kind: stopReason, eventId: null, choiceId: null, resourceDeltas: {} };
  return { state, mode: "AUTO_ADVANCE", stopReason, pendingEvent: null,
    results: before === state ? [] : [result],
    trace: before === state ? [] : [makeTrace(before, input, state, result)] };
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
      event.id !== content.fallbackEventId &&
      eventEligible(event, state) && !eventCoolingDown(event, state),
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
  let nextState: GameState = {
    ...state,
    ageStageProgress: { ...state.ageStageProgress!, nodeCount: state.ageStageProgress!.nodeCount + 1 },
    rngState: rngStateAfter,
    scheduledFollowUps: [
      ...state.scheduledFollowUps,
      ...[event, ...(choice ? [choice] : [])].flatMap((source) => [
        ...source.immediateFollowUpEventIds.map((eventId) => ({
          eventId, targetAgeStageId: state.currentAgeStageId, delayTurns: 0,
          priority: 0, immediateTurnId: state.currentTurnId!,
        })),
        ...source.scheduledFollowUps,
      ]).map((followUp, index) => ({
        ...followUp,
        id: `scheduled-${state.currentTurnId}-${nodeIndex + 1}-${index}`,
        targetAgeStageId: followUp.targetAgeStageId ?? state.currentAgeStageId,
        dueAfterTurns: (followUp.targetAgeStageId && followUp.targetAgeStageId !== state.currentAgeStageId
          ? 0 : state.ageStageProgress!.turnCount - 1) + followUp.delayTurns,
        status: "pending" as const,
      })).map(({ delayTurns: _delayTurns, ...scheduled }) => scheduled),
    ],
    turnNumber: state.turnNumber ?? 1,
    eventLastResolvedTurn: { ...state.eventLastResolvedTurn, [event.id]: state.turnNumber ?? 1 },
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
  if (resultKind === "SAFE_FALLBACK") {
    const waitingForLaterTurn = nextState.scheduledFollowUps.some((item) => item.status === "pending" &&
      item.targetAgeStageId === nextState.currentAgeStageId && item.immediateTurnId === undefined);
    nextState = waitingForLaterTurn
      ? { ...nextState, turn: { ...nextState.turn!, status: "completed" } }
      : finishStage(nextState, "completed");
  }
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
      status: "safelyEnded",
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

const stopAtNodeBudget = (state: GameState, input: EngineInput): EngineTransition | null => {
  if (state.ageStageProgress?.status !== "active") return null;
  if (state.ageStageProgress.nodeCount >= 6) {
    return lifecycleTransition(state, finishStage(state, "safelyEnded"), input, "AGE_STAGE_NODE_LIMIT");
  }
  if (state.turn && (state.turn.status === "active" || state.turn.status === "awaitingInput") &&
      state.turn.nodeCount >= Math.min(4, state.turn.maxNodeCount)) {
    const stopped = stopAtTurnNodeLimit(state, input);
    return { state: stopped.state, mode: "AUTO_ADVANCE", stopReason: "TURN_NODE_LIMIT",
      pendingEvent: null, results: [stopped.result], trace: [stopped.trace] };
  }
  return null;
};

const resolveChoice = (
  state: GameState,
  content: ContentPack,
  input: Extract<EngineInput, { type: "CHOOSE" }>,
): EngineTransition => {
  if (!state.turn || !state.currentTurnId || !state.turn.activeEventId) {
    throw new Error("player input requires an active EventNode");
  }

  const event = content.events.find((candidate) => candidate.id === state.turn?.activeEventId);
  if (!event || event.mode !== "PLAYER_INPUT_REQUIRED") {
    throw new Error(`active event does not accept player input: ${state.turn.activeEventId}`);
  }

  const choice = executableEvent(event, state).choices.find((candidate) => candidate.id === input.choiceId);
  if (!choice || executableEvent(event, state).choices.length < 2) {
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

const runTransition = (
  state: GameState,
  content: ContentPack,
  input: EngineInput,
  options: EngineOptions = { maxAutoAdvanceNodes: 4 },
): EngineTransition => {
  const originalState = state;
  if (input.type === "CANCEL_SCHEDULED_EVENT") {
    const pending = state.scheduledFollowUps.some((item) => item.id === input.scheduledEventId && item.status === "pending");
    const next = pending ? { ...state, scheduledFollowUps: state.scheduledFollowUps.map((item) =>
      item.id === input.scheduledEventId && item.status === "pending" ? { ...item, status: "cancelled" as const } : item) } : state;
    const transition = lifecycleTransition(state, next, input, "SCHEDULE_CANCELLED");
    const active = content.events.find((event) => event.id === state.turn?.activeEventId);
    return active ? { ...transition, mode: "PLAYER_INPUT_REQUIRED", pendingEvent: executableEvent(active, state) } : transition;
  }
  state = ensureStageProgress(state);
  const stages = [...content.ageStages].sort((a, b) => a.order - b.order);
  const lastStage = stages.at(-1)?.id === state.currentAgeStageId;
  if (state.ageStageProgress!.status !== "active") {
    if (input.type === "NEXT_AGE_STAGE") {
      const next = nextStage(state, content);
      return lifecycleTransition(originalState, next, input, lastStage ? "GAME_COMPLETED" : "AGE_STAGE_STARTED");
    }
    if (input.type !== "ADVANCE") throw new Error("the current AgeStage has ended");
    return lifecycleTransition(originalState, state, input, lastStage ? "GAME_COMPLETED" : "AGE_STAGE_COMPLETED");
  }
  if (input.type === "NEXT_AGE_STAGE") throw new Error("the current AgeStage must finish first");
  const budgetBoundary = stopAtNodeBudget(state, input);
  if (budgetBoundary) return budgetBoundary;
  if (input.type === "START_TURN") {
    return lifecycleTransition(originalState, startTurn(state), input, "TURN_STARTED");
  }
  if (input.type === "END_TURN" || input.type === "COMPLETE_AGE_STAGE") {
    if (!state.turn || state.turn.status === "awaitingInput" || state.turn.nodeCount === 0) {
      throw new Error("a resolved EventNode and no pending choice are required");
    }
    state = { ...state, turn: { ...state.turn, status: "completed", activeEventId: null } };
    return lifecycleTransition(originalState, input.type === "COMPLETE_AGE_STAGE" ? finishStage(state, "completed") : state,
      input, input.type === "COMPLETE_AGE_STAGE" ? "AGE_STAGE_COMPLETED" : "TURN_COMPLETED");
  }
  if (!state.turn && input.type === "ADVANCE") state = startTurn(state);
  if (state.turn && state.turn.status !== "active" && state.turn.status !== "awaitingInput") {
    if (input.type === "CHOOSE") throw new Error("the current Turn has ended");
    return lifecycleTransition(originalState, state, input, "TURN_COMPLETED");
  }
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

    if (executableEvent(pendingEvent, state).choices.length < 2) {
      const fallback = content.events.find((event) => event.id === content.fallbackEventId);
      if (!fallback || fallback.mode !== "AUTO_ADVANCE") throw new Error("safe fallback is unavailable");
      const resolved = completeEventNode(state, fallback, input, state.rngState, "SAFE_FALLBACK");
      return { state: resolved.state, mode: "AUTO_ADVANCE", stopReason: "FALLBACK",
        pendingEvent: null, results: [resolved.result], trace: [resolved.trace] };
    }

    return {
      state,
      mode: "PLAYER_INPUT_REQUIRED",
      stopReason: "PLAYER_INPUT_REQUIRED",
      pendingEvent: executableEvent(pendingEvent, state),
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
    const boundary = stopAtNodeBudget(currentState, input);
    if (boundary) return { ...boundary, results: [...results, ...boundary.results],
      trace: [...trace, ...boundary.trace] };

    const selectionBefore = currentState;
    const scheduledSelection = selectScheduledEvent(currentState, content);
    currentState = scheduledSelection.state;
    const scheduledEvent = scheduledSelection.event;
    const candidates = scheduledEvent ? [scheduledEvent] : getEntryEvents(currentState, content);
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
      trace.push(makeTrace(selectionBefore, input, resolved.state, resolved.result));
      return {
        state: resolved.state,
        mode: "AUTO_ADVANCE",
        stopReason: "FALLBACK",
        pendingEvent: null,
        results,
        trace,
      };
    }

    const selected = scheduledEvent ? { event: scheduledEvent, rngState: currentState.rngState }
      : chooseWeightedEvent(candidates, currentState.rngState);
    const event = selected.event;
    const priorVisits = currentState.turn!.processedEventIds.filter(
      (eventId) => eventId === event.id,
    ).length;
    if (priorVisits >= getMaximumVisits(event)) {
      const stopped = stopAtCycle(currentState, event, input, selected.rngState);
      results.push(stopped.result);
      trace.push(makeTrace(selectionBefore, input, stopped.state, stopped.result));
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
      trace.push(makeTrace(selectionBefore, input, boundary.state, boundary.result));
      return {
        state: boundary.state,
        mode: "PLAYER_INPUT_REQUIRED",
        stopReason: "PLAYER_INPUT_REQUIRED",
        pendingEvent: executableEvent(event, currentState),
        results,
        trace,
      };
    }

    const resolved = completeEventNode(currentState, event, input, selected.rngState);
    currentState = resolved.state;
    automaticNodeCount += 1;
    results.push(resolved.result);
    trace.push(makeTrace(selectionBefore, input, resolved.state, resolved.result));

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

export const transitionGame = (
  state: GameState, content: ContentPack, input: EngineInput,
  options: EngineOptions = { maxAutoAdvanceNodes: 4 },
): EngineTransition => {
  let transition = runTransition(state, content, input, options);
  if (transition.state.ageStageProgress?.status === "active" &&
      (transition.stopReason === "EVENT_RESOLVED" || transition.stopReason === "AUTO_ADVANCE_LIMIT" ||
        transition.stopReason === "FALLBACK")) {
    const boundary = stopAtNodeBudget(transition.state, input);
    if (boundary) transition = { ...boundary, results: [...transition.results, ...boundary.results],
      trace: [...transition.trace, ...boundary.trace] };
  }
  if (!transition.trace.length) return transition;
  const [first, ...rest] = transition.trace;
  return { ...transition, trace: [{ ...first!, beforeState: state, rngStateBefore: state.rngState }, ...rest] };
};
