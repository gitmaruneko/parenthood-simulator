import { describe, expect, it } from "vitest";
import { createMvpContent } from "../src/content/mvp.js";
import { createFamilyRun, transitionGame, type EngineInput, type EngineTransition } from "../src/engine/index.js";
import { gameStateSchema } from "../src/domain/schemas.js";

const scenarios = [
  { name: "single caregiver with backup", household: "singleCaregiver", care: "primaryAndBackup" },
  { name: "two caregivers sharing care", household: "twoCaregivers", care: "shared" },
  { name: "two caregivers with pseudo-single participation", household: "twoCaregivers", care: "pseudoSingle" },
  { name: "multigenerational uneven participation", household: "multigenerational", care: "uneven" },
] as const;

const seedFor = (scenario: typeof scenarios[number]) => {
  for (let seed = 1; seed < 1000; seed += 1) {
    const family = createFamilyRun({ seed }).state.family;
    if (family.householdComposition === scenario.household && family.careParticipation === scenario.care) return seed;
  }
  throw new Error(`No seeded family for ${scenario.name}`);
};

const play = (seed: number, choiceId: string, repairChoice = "talk", exhausted = false) => {
  const opening = createFamilyRun({ seed });
  const content = createMvpContent(opening.actors);
  const transitions: EngineTransition[] = [];
  let state = opening.state;
  if (exhausted) state = { ...state, resources: { finances: 0, energy: 0, support: 0, timeFlexibility: 0, connection: 0 } };
  let pending: EngineTransition["pendingEvent"] = null;
  for (let step = 0; step < 250; step += 1) {
    let input: EngineInput;
    if (state.ageStageProgress && state.ageStageProgress.status !== "active") input = { type: "NEXT_AGE_STAGE" };
    else if (!state.turn || !["active", "awaitingInput"].includes(state.turn.status)) input = { type: "START_TURN" };
    else if (pending) input = { type: "CHOOSE", choiceId: pending.id.endsWith("-reconnect") ? repairChoice : choiceId };
    else input = { type: "ADVANCE" };
    const label = `engine integration: seed=${seed} choice=${choiceId} stage=${state.currentAgeStageId} event=${pending?.id ?? state.eventProgress?.eventId} phase=${input.type}`;
    let next: EngineTransition;
    try { next = transitionGame(state, content, input); }
    catch (error) { throw new Error(label, { cause: error }); }
    expect(gameStateSchema.safeParse(next.state).success, label).toBe(true);
    for (const trace of next.trace) {
      expect(trace.afterState.turn?.nodeCount ?? 0, `${label} event=${trace.result.eventId}`).toBeLessThanOrEqual(4);
      expect(trace.afterState.ageStageProgress?.nodeCount ?? 0, label).toBeLessThanOrEqual(6);
    }
    transitions.push(next);
    state = next.state;
    pending = next.pendingEvent;
    if (next.stopReason === "GAME_COMPLETED") return { state, transitions, content };
  }
  throw new Error(`termination: seed=${seed} choice=${choiceId} event=${state.eventProgress?.eventId}`);
};

describe("MVP content through the core event engine", () => {
  it.each(scenarios)("completes 12 stages with both decision paths: $name", (scenario) => {
    const seed = seedFor(scenario);
    for (const decision of ["coordinate", "carry"]) {
      const { state, transitions } = play(seed, decision);
      expect(state.completedAgeStages, `termination: ${scenario.name}/${decision}`).toHaveLength(12);
      expect(state.choiceHistory).toHaveLength(14);
      expect(state.history.some((entry) => entry.kind === "support"), `support: ${scenario.name}/${decision}`).toBe(true);
      expect(state.history.some((entry) => entry.kind === "repair")).toBe(true);
      expect(state.history.some((entry) => entry.kind === "planning")).toBe(true);
      expect(state.reactionHistory?.some((entry) => entry.reactionId !== null)).toBe(true);
      expect(transitions.every((next) => next.stopReason !== "CYCLE_PROTECTED")).toBe(true);
    }
  });

  it.each(["night-handoff", "preschool-handoff"])("replays the full cross-turn %s chain and diverges with decisions", (chain) => {
    const seed = seedFor(scenarios[1]!);
    const coordinated = play(seed, "coordinate");
    expect(play(seed, "coordinate").transitions, `determinism: ${chain}`).toEqual(coordinated.transitions);
    const carried = play(seed, "carry", "pause");
    for (const run of [coordinated, carried]) {
      const choice = run.state.choiceHistory.find((entry) => entry.eventId === `${chain}-choice`)!;
      const branch = run.state.history.find((entry) => entry.resolvedEventId === `${chain}-${run === coordinated ? "support" : "strain"}`)!;
      const repaired = run.state.history.find((entry) => entry.resolvedEventId === `${chain}-repair`)!;
      expect(branch, `scheduled branch: ${chain}`).toBeDefined();
      expect(branch.turnId, `cross-turn: ${chain}`).not.toBe(choice.turnId);
      expect(repaired, `repair: ${chain}`).toBeDefined();
      expect(run.state.scheduledFollowUps.find((item) => item.eventId === branch.resolvedEventId)?.status).toBe("consumed");
    }
    expect(carried.state.completedEventIds).not.toEqual(coordinated.state.completedEventIds);
    expect(carried.state.planningLoad).toBeGreaterThan(coordinated.state.planningLoad);
    expect(carried.state.history).not.toEqual(coordinated.state.history);
  });

  it("actually resolves every authored Event ID across complete runs", () => {
    const reached = new Set<string>();
    for (const decision of ["coordinate", "carry"]) {
      for (const eventId of play(42, decision).state.completedEventIds) reached.add(eventId);
    }
    for (const event of createMvpContent().events) {
      expect(reached.has(event.id), `engine reachability: ${event.id}`).toBe(true);
    }
  });

  it.each(scenarios)("offers executable family-specific choices: $name", (scenario) => {
    const run = createFamilyRun({ seed: seedFor(scenario) });
    const content = createMvpContent(run.actors);
    const started = transitionGame(run.state, content, { type: "START_TURN" });
    const waiting = transitionGame(started.state, content, { type: "ADVANCE" });
    const choices = waiting.pendingEvent!.choices.map((choice) => choice.id);
    expect(choices.includes("handoff")).toBe(run.state.family.persistentActorIds.includes("caregiver-2"));
    expect(choices.includes("ask-family")).toBe(run.state.family.persistentActorIds.includes("support-1"));
    for (const person of run.actors) expect(content.actors.find((entry) => entry.id === person.id)).toEqual(person);
  });

  it("keeps the complete story executable with exhausted resources", () => {
    for (const choice of ["coordinate", "carry"]) {
      const { state } = play(42, choice, "talk", true);
      expect(state.completedAgeStages, `exhausted resources: ${choice}`).toHaveLength(12);
      expect(state.choiceHistory).toHaveLength(14);
    }
  });

  it.each([
    { scenario: scenarios[1]!, choice: "handoff" },
    { scenario: scenarios[0]!, choice: "ask-family" },
  ])("executes conditional $choice choices throughout the full run", ({ scenario, choice }) => {
    const { state } = play(seedFor(scenario), choice);
    expect(state.completedAgeStages).toHaveLength(12);
    expect(state.choiceHistory.filter((entry) => entry.choiceId === choice)).toHaveLength(12);
  });
});
