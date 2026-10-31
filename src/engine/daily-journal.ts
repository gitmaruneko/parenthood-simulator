import type { ContentPack, GameState } from "../domain/schemas.js";
import { DAILY_TEMPLATES } from "../content/daily-journal.js";

export function finishTurn(state: GameState, status: "completed" | "safelyEnded" | "cycleProtected",
  content: ContentPack): GameState {
  const turn = state.turn;
  if (!turn || !["active", "awaitingInput"].includes(turn.status)) return state;
  const ended = { ...state, turn: { ...turn, status, activeEventId: null } };
  const months = content.ageStages.find(stage => stage.id === turn.ageStageId)?.childAgeMonths;
  const child = content.actors.find(actor => actor.id === state.family.childId && actor.role === "child");
  if (months === undefined || !child) return ended;
  const candidates = DAILY_TEMPLATES.filter(template => months >= template.minMonths && months <= template.maxMonths)
    .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  // Never repeat the same snippet in a run. Exhaustion legitimately yields zero.
  const template = candidates.find(candidate => !state.history.some(entry =>
    entry.journal?.some(item => item.kind === "daily" && item.templateId === candidate.id)));
  if (!template || state.history.some(entry => entry.turnId === turn.id &&
      entry.journal?.some(item => item.kind === "daily"))) return ended;
  const id = `${turn.id}-completion-${template.id}`;
  return { ...ended, history: [...state.history, {
    id, ageStageId: turn.ageStageId, turnId: turn.id, kind: "event", text: template.text,
    journal: [{ id: `${id}-journal-0`, sourceHistoryId: id, sequence: 0, kind: "daily",
      templateId: template.id, text: template.text, actorIds: [child.id] }],
  }] };
}
