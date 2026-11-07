import { createFamilyRun, getPlayerView, transitionGame } from "../../src/engine/index.js";
import { bindNarrativeA2Run, createRunContent } from "../../src/content/releases.js";
import { A2_STORIES } from "../../src/content/narrative-a2.js";
import type { GameState } from "../../src/domain/schemas.js";
import { familyContentKey } from "../../src/domain/content-binding.js";
import { unknownActorProfiles } from "../../src/domain/actor-profiles.js";

export type A2Story = typeof A2_STORIES[number];
export function a2Run(story: A2Story, seed = 9, availability = 1,
  family?: Partial<GameState["family"]>, noAdults = false) {
  const run = createFamilyRun({ seed, firstAgeStageId: `age-stage-${story.stage}` });
  run.actors.forEach(actor => { actor.availability = availability; });
  const actors = noAdults ? run.actors.filter(actor => actor.role === "child") : [...run.actors];
  run.state.family = { ...run.state.family, ...family, ...(noAdults ? { persistentActorIds: [] } : {}) };
  run.state.replayOrigin!.actors = structuredClone(actors);
  run.state.actorProfiles = unknownActorProfiles(run.state.family);
  run.state.replayOrigin!.actorProfiles = structuredClone(run.state.actorProfiles);
  const bound = bindNarrativeA2Run({ ...run, actors });
  bound.state.contentBinding!.familyKey = familyContentKey(bound.state.family, actors);
  return { state: bound.state, content: createRunContent(bound.state) };
}

export function a2Path(story: A2Story, choiceId: string, seed = 9, availability = 1) {
  const { state: initial, content } = a2Run(story, seed, availability);
  let state = initial;
  const checkpoints: GameState[] = [state];
  for (let step = 0; step < 12; step++) {
    if (state.ageStageProgress && state.ageStageProgress.status !== "active") break;
    const view = getPlayerView(state, content);
    state = transitionGame(state, content, view.pendingEvent ? { type: "CHOOSE", choiceId } : view.nextInput!).state;
    checkpoints.push(state);
  }
  return { state, content, checkpoints };
}
