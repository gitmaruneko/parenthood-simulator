import type { ContentPack, GameState } from "../domain/schemas.js";
import { transitionGame, type EngineInput, type EngineOptions, type EngineTransition } from "../engine/event-engine.js";
import type { LocalSaveStore, SaveResult } from "./local-save-store.js";

export interface PersistedTransition {
  readonly transition: EngineTransition;
  readonly save: SaveResult;
}

// The engine stays pure. Commit each node/input/lifecycle boundary without
// rerunning selection or reactions, and stop writing on the first failure.
export const transitionAndSave = (
  state: GameState, content: ContentPack, input: EngineInput,
  store: LocalSaveStore, expectedRawData: string | null, options?: EngineOptions,
): PersistedTransition => {
  const transition = transitionGame(state, content, input, options);
  const checkpoints = transition.trace.map((entry) => entry.afterState);
  if (checkpoints.at(-1) !== transition.state) checkpoints.push(transition.state);
  let rawData = expectedRawData;
  let save: SaveResult;
  for (const checkpoint of checkpoints) {
    save = store.save(checkpoint, rawData);
    if (save.status === "error") return { transition, save };
    rawData = save.rawData;
  }
  return { transition, save: save! };
};
