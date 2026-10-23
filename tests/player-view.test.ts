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

it("labels story time with the stage age and day, shared by events in the same Turn", () => {
  const run = createFamilyRun({ seed: 42 });
  const state = {
    ...run.state,
    currentAgeStageId: "age-stage-4",
    history: [
      {
        id: "first",
        ageStageId: "age-stage-1",
        turnId: "first-turn",
        kind: "event" as const,
        text: "第一天",
      },
      {
        id: "reaction",
        ageStageId: "age-stage-1",
        turnId: "first-turn",
        kind: "reaction" as const,
        text: "同一天的反應",
      },
      {
        id: "second",
        ageStageId: "age-stage-1",
        turnId: "second-turn",
        kind: "event" as const,
        text: "第二天",
      },
      {
        id: "later",
        ageStageId: "age-stage-4",
        turnId: "later-turn",
        kind: "event" as const,
        text: "較大的時候",
      },
    ],
  };
  const original = structuredClone(state);
  const view = getPlayerView(state, createMvpContent(run.actors));
  expect(view.storyTimeLabels).toEqual({
    "first-turn": "2 個月 1 天",
    "second-turn": "2 個月 2 天",
    "later-turn": "1 歲 3 個月 1 天",
  });
  expect(state).toEqual(original);
});
