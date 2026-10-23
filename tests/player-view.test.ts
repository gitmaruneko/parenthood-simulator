import { expect, it } from "vitest";
import {
  createFamilyRun,
  getPlayerView,
  transitionGame,
} from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";

it("offers engine-approved decisions and lifecycle commands without advancing the story", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const waiting = transitionGame(run.state, content, { type: "ADVANCE" });
  const original = structuredClone(waiting.state);
  const view = getPlayerView(waiting.state, content);
  expect(view.pendingEvent).toEqual(waiting.pendingEvent);
  expect(view.nextInput).toBeNull();
  expect(view.stageLabel).toBe("AgeStage 1 / 12");
  expect(view.turnLabel).toBe("Turn 1");
  expect(waiting.state).toEqual(original);
  const chosen = transitionGame(waiting.state, content, {
    type: "CHOOSE",
    choiceId: "coordinate",
  });
  expect(getPlayerView(chosen.state, content).nextInput).toEqual({
    type: "ADVANCE",
  });
});
