import type { GameState } from "../../src/domain/schemas.js";

// Legacy fixtures use the actual pre-v4 contract, which has no identity fields.
export function legacyState(state: GameState): GameState {
  const legacy = structuredClone(state);
  delete legacy.actorProfiles;
  if (legacy.replayOrigin) delete legacy.replayOrigin.actorProfiles;
  return legacy;
}
