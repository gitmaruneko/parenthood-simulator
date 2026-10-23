import { resourceKeySchema, type GameState, type NarrativeEffects } from "../domain/schemas.js";

const addFinite = (left: number, right: number): number =>
  Math.max(-Number.MAX_VALUE, Math.min(Number.MAX_VALUE, left + right));

export const sumResourceDeltas = (sources: readonly NarrativeEffects[]): NonNullable<NarrativeEffects["resourceDeltas"]> => {
  const deltas: NonNullable<NarrativeEffects["resourceDeltas"]> = {};
  for (const source of sources) {
    for (const key of resourceKeySchema.options) {
      const delta = source.resourceDeltas?.[key];
      if (delta !== undefined) deltas[key] = addFinite(deltas[key] ?? 0, delta);
    }
  }
  return deltas;
};

export const applyNarrativeEffects = (state: GameState, effects: NarrativeEffects, source: string): GameState => ({
  ...state,
  resources: Object.fromEntries(resourceKeySchema.options.map((key) => [key,
    Math.min(100, Math.max(0, state.resources[key] + (effects.resourceDeltas?.[key] ?? 0))),
  ])) as GameState["resources"],
  flags: [...new Set([...state.flags.filter((flag) => !effects.clearFlags?.includes(flag)), ...(effects.setFlags ?? [])])],
  planningLoad: Math.max(0, addFinite(state.planningLoad, effects.planningLoadDelta ?? 0)),
  tendencies: Object.fromEntries([...new Set([
    ...Object.keys(state.tendencies), ...Object.keys(effects.tendencyDeltas ?? {}),
  ])].map((key) => [key, addFinite(state.tendencies[key] ?? 0, effects.tendencyDeltas?.[key] ?? 0)])),
  relationshipMemories: [...state.relationshipMemories, ...(effects.relationshipMemories ?? []).map((memory) => ({
    ...memory, createdAtAgeStageId: state.currentAgeStageId, createdAtTurn: state.turnNumber ?? 1,
  }))],
  history: [...state.history, ...(effects.storyEntries ?? []).map((entry, index) => ({
    ...entry, id: `${source}-${state.currentTurnId}-${state.turn!.nodeCount}-${index}`,
    ageStageId: state.currentAgeStageId, turnId: state.currentTurnId!,
  }))],
});
