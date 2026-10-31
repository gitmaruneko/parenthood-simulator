import { expect, it } from "vitest";
import { createFamilyRun, transitionGame, getPlayerView, type EngineInput } from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";
import { contentPackSchema, eventNodeSchema } from "../src/domain/schemas.js";
import { restoreGame, serializeGame } from "../src/persistence/index.js";
import { FAMILY_LIFE_DIRECTIONS } from "../src/domain/family-life-direction.js";
import { legacyState } from "./helpers/legacy-state.js";
import { unknownActorProfiles } from "../src/domain/actor-profiles.js";

it("switches a pending story's direction without changing any committed simulation data", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const waiting = transitionGame(run.state, content, { type: "ADVANCE" });
  const changed = transitionGame(waiting.state, content,
    { type: "SET_FAMILY_LIFE_DIRECTION", directionId: "caregiver-wellbeing" });
  expect(changed.state).toEqual({ ...waiting.state, activeFamilyLifeDirectionId: "caregiver-wellbeing" });
  expect(changed.pendingEvent).toEqual(waiting.pendingEvent);
  expect(changed.mode).toBe(waiting.mode);
  expect(changed.trace[0]?.rngStateAfter).toBe(waiting.state.rngState);
  expect(getPlayerView(changed.state, content).activeFamilyLifeDirectionId).toBe("caregiver-wellbeing");
  const repeated = transitionGame(changed.state, content,
    { type: "SET_FAMILY_LIFE_DIRECTION", directionId: "caregiver-wellbeing" });
  expect(repeated.state).toEqual(changed.state);
  expect(repeated.trace).toEqual([]);
  const a = transitionGame(waiting.state, content, { type: "CHOOSE", choiceId: "coordinate" });
  const b = transitionGame(changed.state, content, { type: "CHOOSE", choiceId: "coordinate" });
  expect(b.state).toEqual({ ...a.state, activeFamilyLifeDirectionId: "caregiver-wellbeing" });
  expect(b.results).toEqual(a.results);
});

it("explicitly migrates v1/v2 saves without changing pending data or RNG and rejects damaged current directions", () => {
  const run = createFamilyRun({ seed: 42 });
  const waiting = transitionGame(run.state, createMvpContent(run.actors), { type: "ADVANCE" }).state;
  const { activeFamilyLifeDirectionId: _, ...legacy } = legacyState(waiting);
  for (const [version, data] of [[1, legacy], [2, { schemaVersion: 2, state: legacy }]] as const) {
    const restored = restoreGame(JSON.stringify(data));
    const profiles = unknownActorProfiles(waiting.family);
    expect(restored).toMatchObject({ status: "restored", migratedFrom: version,
      state: { ...waiting, history: legacyState(waiting).history, actorProfiles: profiles,
        replayOrigin: { ...waiting.replayOrigin!, actorProfiles: profiles } } });
  }
  const current = JSON.parse(serializeGame(waiting));
  expect(current.schemaVersion).toBe(7);
  for (const id of [undefined, null, "unknown-direction"]) {
    current.state.activeFamilyLifeDirectionId = id;
    const raw = JSON.stringify(current);
    expect(restoreGame(raw)).toMatchObject({ status: "error", rawData: raw });
  }
});

it("switches before lifecycle initialization and at stage boundaries, rejects invalid IDs and completed records", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const input = { type: "SET_FAMILY_LIFE_DIRECTION", directionId: "parent-child-time" } as const;
  const changed = transitionGame(run.state, content, input);
  expect(changed.state).toEqual({ ...run.state, activeFamilyLifeDirectionId: "parent-child-time" });
  expect(changed.state.turn).toBeNull();
  expect(() => transitionGame(run.state, content, { ...input, directionId: "bad" as never })).toThrow();
  const boundary = { ...changed.state, ageStageProgress: { ageStageId: "age-stage-1", status: "completed" as const,
    nodeCount: 4, turnCount: 2 } };
  expect(transitionGame(boundary, content, { ...input, directionId: "flexible" }).state)
    .toEqual({ ...boundary, activeFamilyLifeDirectionId: "flexible" });
  const complete = { ...boundary, currentAgeStageId: "age-stage-12",
    ageStageProgress: { ...boundary.ageStageProgress, ageStageId: "age-stage-12" } };
  expect(() => transitionGame(complete, content, input)).toThrow(/read-only/);
});

it("applies bounded direction weights only to unselected general entries with one stable draw", () => {
  const run = createFamilyRun({ seed: 42 });
  const original = createMvpContent(run.actors);
  const first = original.events[0]!;
  const content = contentPackSchema.parse({ ...original,
    ageStages: original.ageStages.map((stage, index) => index ? stage : { ...stage, entryEventIds: ["a", "b"] }),
    events: [...original.events,
      { ...first, id: "a", weight: 1, familyLifeDirectionWeights: { "parent-child-time": 1.25 } },
      { ...first, id: "b", weight: 1 }],
  });
  // Mulberry32 state 6 produces 0.5257466111797839: neutral picks b,
  // companion weighting moves the a threshold to 1.25 / 2.25.
  const state = { ...run.state, rngState: 6 };
  const neutral = transitionGame(state, content, { type: "ADVANCE" });
  const changed = transitionGame(state, content, { type: "SET_FAMILY_LIFE_DIRECTION", directionId: "parent-child-time" });
  const weighted = transitionGame(changed.state, content, { type: "ADVANCE" });
  expect(neutral.pendingEvent?.id).toBe("b");
  expect(weighted.pendingEvent?.id).toBe("a");
  expect(weighted.state.rngState).toBe(neutral.state.rngState);
  expect(transitionGame(changed.state, { ...content, events: [...content.events].reverse() }, { type: "ADVANCE" })).toEqual(weighted);
  expect(transitionGame(changed.state, content, { type: "ADVANCE" })).toEqual(weighted);
});

it("rejects unknown direction weights and values outside the approved bounds", () => {
  const event = createMvpContent().events[0]!;
  for (const weights of [{ unknown: 1.1 }, { flexible: 0 }, { flexible: 0.9 }, { flexible: 1.26 }, { flexible: Infinity }]) {
    expect(eventNodeSchema.safeParse({ ...event, familyLifeDirectionWeights: weights }).success).toBe(false);
  }
  expect(eventNodeSchema.safeParse({ ...event, familyLifeDirectionWeights: { flexible: 1 } }).success).toBe(true);
});

it("replays a full seed and switch sequence including fixed follow-ups and a saved continuation", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  let state = run.state;
  const inputs: EngineInput[] = [];
  for (let i = 0; !getPlayerView(state, content).completed && i < 150; i++) {
    const direction = FAMILY_LIFE_DIRECTIONS[i % 6]!;
    const change: EngineInput = { type: "SET_FAMILY_LIFE_DIRECTION", directionId: direction.id };
    const prior = state;
    state = transitionGame(state, content, change).state;
    expect(state).toEqual({ ...prior, activeFamilyLifeDirectionId: direction.id });
    inputs.push(change);
    const view = getPlayerView(state, content);
    const input: EngineInput = view.pendingEvent
      ? { type: "CHOOSE", choiceId: view.pendingEvent.choices[0]!.id } : view.nextInput!;
    state = transitionGame(state, content, input).state;
    inputs.push(input);
  }
  expect(getPlayerView(state, content).completed).toBe(true);
  expect(state.scheduledFollowUps.some((item) => item.status === "consumed")).toBe(true);
  const replay = (start: typeof state, commands: EngineInput[]) => {
    let current = start;
    return commands.map((input) => {
      const transition = transitionGame(current, content, input);
      current = transition.state;
      return transition;
    });
  };
  const uninterrupted = replay(run.state, inputs);
  expect(replay(createFamilyRun({ seed: 42 }).state, inputs)).toEqual(uninterrupted);
  expect(uninterrupted.at(-1)!.state).toEqual(state);
  const saved = restoreGame(serializeGame(uninterrupted[9]!.state));
  if (saved.status !== "restored") throw new Error("expected restored continuation");
  expect(replay(saved.state, inputs.slice(10))).toEqual(uninterrupted.slice(10));
});

it("avoids overflow for finite entry weights and keeps empty-candidate fallback deterministic", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const first = content.events[0]!;
  const huge = { ...content, events: content.events.map((event) => event.id === first.id
    ? { ...event, weight: Number.MAX_VALUE, familyLifeDirectionWeights: { flexible: 1.25 } } : event) };
  const result = transitionGame(run.state, huge, { type: "ADVANCE" });
  expect(result.pendingEvent?.id).toBe(first.id);
  const empty = { ...content, ageStages: content.ageStages.map((stage) => ({ ...stage, entryEventIds: [] })) };
  const fallback = transitionGame(run.state, empty, { type: "ADVANCE" });
  const changed = transitionGame(run.state, empty, { type: "SET_FAMILY_LIFE_DIRECTION", directionId: "life-exploration" });
  expect(transitionGame(changed.state, empty, { type: "ADVANCE" }).state)
    .toEqual({ ...fallback.state, activeFamilyLifeDirectionId: "life-exploration" });
  expect(fallback.stopReason).toBe("FALLBACK");
  expect(fallback.state.rngState).toBe(run.state.rngState);
});
