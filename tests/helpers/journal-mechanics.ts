import type { GameState } from "../../src/domain/schemas.js";

// Keep every mechanical field and every original history anchor; omit presentation only.
export function journalMechanics(state: GameState) {
  return { ...state, history: state.history.map(({ text: _text, ...entry }) => {
    const { journal: _journal, ...anchor } = entry as typeof entry & { journal?: unknown };
    return anchor;
  }), reactionHistory: state.reactionHistory?.map(({ text: _text, ...reaction }) => reaction) };
}
