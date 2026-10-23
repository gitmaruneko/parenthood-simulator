import { expect, it } from "vitest";
import { createFamilyRun, transitionGame, getPlayerView } from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";
import { restoreGame, serializeGame } from "../src/persistence/index.js";

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
  const { activeFamilyLifeDirectionId: _, ...legacy } = waiting;
  for (const [version, data] of [[1, legacy], [2, { schemaVersion: 2, state: legacy }]] as const) {
    const restored = restoreGame(JSON.stringify(data));
    expect(restored).toMatchObject({ status: "restored", migratedFrom: version, state: waiting });
  }
  const current = JSON.parse(serializeGame(waiting));
  expect(current.schemaVersion).toBe(3);
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
