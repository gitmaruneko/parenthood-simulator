import { finishTurn } from "./daily-journal.js";
import type { ContentPack, GameState } from "../domain/schemas.js";

export const ensureStageProgress = (state: GameState): GameState => {
  if (state.ageStageProgress) return state;
  return {
    ...state,
    ageStageProgress: {
      ageStageId: state.currentAgeStageId,
      status: "active",
      nodeCount: state.history.filter((entry) => entry.ageStageId === state.currentAgeStageId &&
        (entry.kind === "event" || entry.resolvedEventId !== undefined)).length,
      turnCount: 1,
    },
  };
};

export const startTurn = (state: GameState): GameState => {
  if (state.ageStageProgress?.status !== "active") throw new Error("an active AgeStage is required");
  if (state.turn?.status === "active" || state.turn?.status === "awaitingInput") {
    throw new Error("the current Turn must end before starting another");
  }
  const turnCount = state.ageStageProgress.turnCount + (state.turn ? 1 : 0);
  const id = `${state.currentAgeStageId}-turn-${turnCount}`;
  return {
    ...state,
    turnNumber: (state.turnNumber ?? (state.turn ? 1 : 0)) + 1,
    ageStageProgress: { ...state.ageStageProgress, turnCount },
    currentTurnId: id,
    turn: { id, ageStageId: state.currentAgeStageId, status: "active", nodeCount: 0,
      maxNodeCount: 4, activeEventId: null, processedEventIds: [] },
    eventProgress: null,
  };
};

export const finishStage = (state: GameState, status: "completed" | "safelyEnded", content: ContentPack): GameState => {
  const progress = state.ageStageProgress!;
  if (progress.status !== "active") return state;
  state = finishTurn(state, status, content);
  return {
    ...state,
    turn: state.turn ? { ...state.turn, status: status === "completed" ? "completed" : "safelyEnded", activeEventId: null } : null,
    ageStageProgress: { ...progress, status },
    completedAgeStages: [...(state.completedAgeStages ?? []), {
      ...progress, status,
      storyEntryIds: state.history.filter((entry) => entry.ageStageId === state.currentAgeStageId).map((entry) => entry.id),
    }],
  };
};

export const nextStage = (state: GameState, content: ContentPack): GameState => {
  if (state.ageStageProgress?.status === "active") throw new Error("the current AgeStage must finish first");
  const stages = [...content.ageStages].sort((a, b) => a.order - b.order);
  const index = stages.findIndex((stage) => stage.id === state.currentAgeStageId);
  if (index < 0) throw new Error(`unknown AgeStage: ${state.currentAgeStageId}`);
  const next = stages[index + 1];
  if (!next) return state;
  const { ageStageProgress: previousProgress, ...rest } = state;
  return ensureStageProgress({ ...rest, currentAgeStageId: next.id, turn: null,
    currentTurnId: null, eventProgress: null });
};
