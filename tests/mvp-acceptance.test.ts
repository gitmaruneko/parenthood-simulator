import { describe, expect, it } from "vitest";
import { createMvpContent } from "../src/content/mvp.js";
import { createFamilyRun, createFamilyReview, getPlayerView, transitionGame,
  type EngineInput, type EngineTransition } from "../src/engine/index.js";
import { createLocalSaveStore, restoreGame, serializeGame, transitionAndSave } from "../src/persistence/index.js";

// Record explicit public inputs once; replay never chooses a new path on restore.
function recordStory(seed: number, decision: "coordinate" | "carry") {
  const opening = createFamilyRun({ seed });
  const content = createMvpContent(opening.actors);
  const inputs: EngineInput[] = [];
  const transitions: EngineTransition[] = [];
  let state = opening.state;
  for (let step = 0; step < 250; step++) {
    const view = getPlayerView(state, content);
    if (view.completed) return { opening, content, inputs, transitions, state };
    const input: EngineInput = view.pendingEvent
      ? { type: "CHOOSE", choiceId: view.pendingEvent.id.endsWith("-reconnect") ? "pause" : decision }
      : view.nextInput!;
    const next = transitionGame(state, content, input);
    inputs.push(input);
    transitions.push(next);
    state = next.state;
  }
  throw new Error(`MVP did not complete: seed=${seed}, decision=${decision}`);
}

describe("MVP acceptance across engine and save/restore boundaries", () => {
  it.each(["coordinate", "carry"] as const)("replays explicit %s inputs through every persisted checkpoint and final review", (decision) => {
    const story = recordStory(42, decision);
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    };
    let state = createFamilyRun({ seed: 42 }).state;
    let rawData: string | null = null;
    const restoredBoundaries = new Set<string>();
    for (const [index, input] of story.inputs.entries()) {
      const label = `seed=42 path=${decision} step=${index} input=${input.type}`;
      const result = transitionAndSave(state, story.content, input, createLocalSaveStore(storage), rawData);
      expect(result.transition, label).toEqual(story.transitions[index]);
      expect(result.save.status, label).toBe("saved");
      const loaded = createLocalSaveStore(storage).load();
      if (loaded.status !== "restored") throw new Error(`${label}: checkpoint not restored`);
      expect(loaded.state, label).toEqual(result.transition.state);
      rawData = loaded.rawData;
      state = loaded.state;
      if (state.turn?.status === "awaitingInput") restoredBoundaries.add("pending-choice");
      if (state.turn?.status === "completed") restoredBoundaries.add("completed-turn");
      if (state.scheduledFollowUps.some((item) => item.status === "pending")) restoredBoundaries.add("pending-schedule");
    }
    expect([...restoredBoundaries].sort()).toEqual(["completed-turn", "pending-choice", "pending-schedule"]);
    expect(state.completedAgeStages).toHaveLength(12);
    expect(state).toEqual(story.state);
    expect(createFamilyReview(state, story.content)).toEqual(createFamilyReview(story.state, story.content));

    // An automatic-node checkpoint can be earlier than the final transition state.
    // Resume each of those as well, using the player's next public input.
    for (const transition of story.transitions) {
      for (const entry of transition.trace) {
        if (entry.result.kind !== "EVENT_RESOLVED") continue;
        const restored = restoreGame(serializeGame(entry.afterState));
        if (restored.status !== "restored") throw new Error(`Cannot restore ${entry.result.eventId}`);
        expect(restored.state).toEqual(entry.afterState);
        const view = getPlayerView(entry.afterState, story.content);
        if (view.nextInput) {
          expect(transitionGame(restored.state, story.content, view.nextInput))
            .toEqual(transitionGame(entry.afterState, story.content, view.nextInput));
        }
      }
    }
  });

  it("changes later events, memories and the family review for different decisions under the same seed", () => {
    const coordinated = recordStory(42, "coordinate");
    const carried = recordStory(42, "carry");
    expect(carried.opening).toEqual(coordinated.opening);
    for (const chain of ["night-handoff", "preschool-handoff"]) {
      expect(coordinated.state.completedEventIds).toContain(`${chain}-support`);
      expect(carried.state.completedEventIds).toContain(`${chain}-strain`);
      const choice = carried.state.choiceHistory.find((entry) => entry.eventId === `${chain}-choice`)!;
      const strain = carried.state.history.find((entry) => entry.resolvedEventId === `${chain}-strain`)!;
      expect(strain.turnId).not.toBe(choice.turnId);
      expect(strain.text).toContain(chain === "night-handoff" ? "睡得零碎" : "對話中斷");
    }
    expect(carried.state.relationshipMemories).not.toEqual(coordinated.state.relationshipMemories);
    expect(createFamilyReview(carried.state, carried.content)).not.toEqual(createFamilyReview(coordinated.state, coordinated.content));
    const relief = carried.transitions.flatMap((next) => next.trace).filter((entry) =>
      entry.afterState.planningLoad < entry.beforeState.planningLoad);
    expect(relief.some((entry) => entry.result.choiceId === "pause")).toBe(true);
    expect(carried.state.completedAgeStages).toHaveLength(12);
  });

  it("allows understanding, neutral, criticism and silence for the same authored choice", () => {
    const outcomes = new Set<string>();
    for (let seed = 0; seed < 32; seed++) {
      const run = createFamilyRun({ seed });
      const content = createMvpContent(run.actors);
      const waiting = transitionGame(run.state, content, { type: "ADVANCE" });
      const chosen = transitionGame(waiting.state, content, { type: "CHOOSE", choiceId: "coordinate" });
      for (const reaction of chosen.state.reactionHistory ?? []) outcomes.add(reaction.kind);
    }
    expect([...outcomes].sort()).toEqual(["criticism", "neutral", "none", "understanding"]);
  });
});
