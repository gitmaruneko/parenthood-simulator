import { createMvpContent } from "../../src/content/mvp.js";
import { createFamilyRun, getPlayerView, transitionGame } from "../../src/engine/index.js";

export function completedStory(decision = "coordinate") {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  let state = run.state;
  for (let step = 0; step < 250; step++) {
    const view = getPlayerView(state, content);
    if (view.completed) return { state, content };
    state = transitionGame(state, content, view.pendingEvent
      ? { type: "CHOOSE", choiceId: view.pendingEvent.choices.some((c) => c.id === decision) ? decision : view.pendingEvent.choices[0]!.id }
      : view.nextInput!).state;
  }
  throw new Error("Story did not complete");
}
