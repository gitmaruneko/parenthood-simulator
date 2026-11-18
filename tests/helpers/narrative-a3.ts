import { createFamilyRun, getPlayerView, transitionGame } from "../../src/engine/index.js";
import { bindNarrativeA3Run, createRunContent } from "../../src/content/releases.js";
import { A3_STORIES } from "../../src/content/narrative-a3.js";
import type { GameState } from "../../src/domain/schemas.js";
import { familyContentKey } from "../../src/domain/content-binding.js";
import { unknownActorProfiles } from "../../src/domain/actor-profiles.js";

export type A3Story = typeof A3_STORIES[number];
export function a3Run(story: A3Story, seed = 9, availability = 1,
  family?: Partial<GameState["family"]>, noAdults = false) {
  const run = createFamilyRun({ seed, firstAgeStageId: `age-stage-${story.stage}` });
  const workArrangement = story.key === "bag" ? "singleFullTimeCare" : "dualIncome";
  if (story.key === "message" && !run.actors.some(actor => actor.id === "support-1")) {
    (run.actors as Array<typeof run.actors[number]>).push({ ...run.actors[0]!, id: "support-1", role: "grandparent", displayName: "支持家人" });
    run.state.family.persistentActorIds.push("support-1");
  }
  run.actors.forEach(actor => { actor.availability = availability; });
  const actors = noAdults || story.key === "shoes" ? run.actors.filter(actor => actor.role === "child") : [...run.actors];
  run.state.family = { ...run.state.family, workArrangement, ...family, ...(noAdults || story.key === "shoes" ? { persistentActorIds: [] } : {}) };
  run.state.replayOrigin!.actors = structuredClone(actors);
  run.state.actorProfiles = unknownActorProfiles(run.state.family);
  run.state.replayOrigin!.actorProfiles = structuredClone(run.state.actorProfiles);
  const bound = bindNarrativeA3Run({ ...run, actors });
  bound.state.contentBinding!.familyKey = familyContentKey(bound.state.family, actors);
  return { state: bound.state, content: createRunContent(bound.state) };
}

export function a3Path(story: A3Story, choiceId: string, seed = 9, availability = 1, browser = false) {
  const { state: initial, content } = a3Run(story, seed, availability);
  let state = initial;
  if (browser && story.stage === 12) {
    state = { ...state, currentAgeStageId: "age-stage-1" };
    for (let step = 0; step < 220 && state.currentAgeStageId !== "age-stage-12"; step++) {
      const view = getPlayerView(state, content);
      state = transitionGame(state, content, view.pendingEvent
        ? { type: "CHOOSE", choiceId: view.pendingEvent.choices[0]!.id } : view.nextInput!).state;
    }
  }
  const checkpoints: GameState[] = [state];
  for (let step = 0; step < 12; step++) {
    if (state.ageStageProgress && state.ageStageProgress.status !== "active") break;
    const view = getPlayerView(state, content);
    state = transitionGame(state, content, view.pendingEvent ? { type: "CHOOSE", choiceId } : view.nextInput!).state;
    checkpoints.push(state);
  }
  return { state, content, checkpoints };
}

