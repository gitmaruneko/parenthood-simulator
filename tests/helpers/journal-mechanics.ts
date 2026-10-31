import type { GameState } from "../../src/domain/schemas.js";

// Keep every mechanical field and every original history anchor; omit presentation only.
export function journalMechanics(state: GameState) {
  const dailyIds = new Set(state.history.filter(entry => entry.journal?.some(item => item.kind === "daily")).map(entry => entry.id));
  return { ...state, completedAgeStages: state.completedAgeStages?.map(stage => ({ ...stage,
    storyEntryIds: stage.storyEntryIds.filter(id => !dailyIds.has(id)) })),
    history: state.history.filter(entry => !dailyIds.has(entry.id)).map(({ text: _text, ...entry }) => {
    const { journal: _journal, ...anchor } = entry as typeof entry & { journal?: unknown };
    return anchor;
  }), reactionHistory: state.reactionHistory?.map(({ text: _text, ...reaction }) => reaction) };
}
