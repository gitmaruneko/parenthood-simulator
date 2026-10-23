import type { Condition, EventNode, GameState } from "../domain/schemas.js";

export interface ConditionContext {
  event?: EventNode;
  actorId?: string;
  availableActorIds?: readonly string[];
}

export const conditionMatches = (
  condition: Condition, state: GameState, context: ConditionContext = {},
): boolean => {
  const { event, actorId, availableActorIds } = context;
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
      if (availableActorIds) return availableActorIds.includes(condition.actorId);
      return (
        state.family.childId === condition.actorId ||
        state.family.persistentActorIds.includes(condition.actorId)
      );
    case "location":
      return event?.locationId === condition.locationId;
    case "contextTag":
      return event?.contextTags?.includes(condition.tag) ?? false;
    case "recentEvent": {
      const turn = state.eventLastResolvedTurn?.[condition.eventId];
      const age = (state.turnNumber ?? 1) - (turn ?? -Infinity);
      return age >= 0 && age <= condition.withinTurns;
    }
    case "relationshipMemory":
      return state.relationshipMemories.some((memory) => {
        const age = (state.turnNumber ?? 1) - (memory.createdAtTurn ?? -Infinity);
        return memory.category === condition.category && (!actorId || memory.actorId === actorId) &&
          age >= 0 && age <= condition.withinTurns;
      });
    case "all":
      return condition.conditions.every((child) => conditionMatches(child, state, context));
    case "any":
      return condition.conditions.some((child) => conditionMatches(child, state, context));
    case "not":
      return !conditionMatches(condition.condition, state, context);
  }
};
