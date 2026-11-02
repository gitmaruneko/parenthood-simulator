import { createFamilyRun, getPlayerView, transitionGame } from "../../src/engine/index.js";
import { bindNarrativeRun, createRunContent } from "../../src/content/releases.js";
import { DOOR, NIGHT } from "../../src/content/narrative-a1.js";

export function a1Run(stage = 1, seed = 9, availability = 1) {
  const run = createFamilyRun({ seed, firstAgeStageId: `age-stage-${stage}` });
  run.actors.forEach(actor => { actor.availability = availability; });
  run.state.replayOrigin!.actors.forEach(actor => { actor.availability = availability; });
  const bound = bindNarrativeRun(run);
  const content = createRunContent(bound.state);
  return { state: bound.state, content };
}

// Public engine commands; only the entry is pinned for exhaustive path evidence.
export function a1Path(stage: 1 | 8, rootChoice: string, laterChoice: string, seed = 9, availability = 1) {
  const { content, state: initial } = a1Run(stage, seed, availability);
  const chain = stage === 1 ? NIGHT : DOOR;
  content.ageStages.find(row => row.id === `age-stage-${stage}`)!.entryEventIds = [chain.root];
  let state = initial;
  const checkpoints = [state];
  for (let step = 0; step < 20; step++) {
    if (state.ageStageProgress && state.ageStageProgress.status !== "active") break;
    const view = getPlayerView(state, content);
    state = transitionGame(state, content, view.pendingEvent ? { type: "CHOOSE",
      choiceId: view.pendingEvent.id === chain.root ? rootChoice : laterChoice } : view.nextInput!).state;
    checkpoints.push(state);
  }
  return { state, content, checkpoints };
}
