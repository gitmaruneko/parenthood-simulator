import { expect, it } from "vitest";
import { createFamilyRun, createFamilyReview, selectReviewMoments, replayFamilyRun, rerollFamilyRun, getAssessmentQuestions } from "../src/engine/index.js";
import { restoreGame, serializeGame } from "../src/persistence/index.js";
import { completedStory } from "./helpers/completed-story.js";

it("builds a stable whole-life review with 12 stages, all turns, choices, support and repair", () => {
  const { state, content } = completedStory();
  const before = structuredClone(state);
  const review = createFamilyReview(state, content);
  expect(review.timeline).toHaveLength(12);
  expect(review.timeline.flatMap((stage) => stage.storyEntryIds)).toEqual(state.history.map((entry) => entry.id));
  expect(new Set(state.history.filter((entry) => entry.ageStageId === review.timeline[0]!.ageStageId).map((entry) => entry.turnId)).size).toBeGreaterThan(1);
  expect(review.keyMomentIds).toHaveLength(3);
  for (const id of review.keyMomentIds) {
    const entry = state.history.find((entry) => entry.id === id)!;
    expect(state.choiceHistory.some((choice) => choice.turnId === entry.turnId && choice.eventId === entry.resolvedEventId)).toBe(true);
  }
  expect(review.supportMomentIds.length).toBeGreaterThan(0);
  expect(review.repairMomentIds.length).toBeGreaterThan(0);
  expect(review.narrativeOverview).toContain("安排");
  expect(createFamilyReview(state, content)).toEqual(review);
  expect(state).toEqual(before);
});

it("persists three adjusted choices and rejects duplicate or unrelated moments", () => {
  const { state, content } = completedStory();
  const ids = state.history.filter((entry) => entry.kind === "event" && state.choiceHistory.some(
    (choice) => choice.eventId === entry.resolvedEventId && choice.turnId === entry.turnId)).slice(1, 4).map((entry) => entry.id);
  const selected = selectReviewMoments(state, content, ids);
  const restored = restoreGame(serializeGame(selected));
  expect(restored.status).toBe("restored");
  if (restored.status !== "restored") throw new Error("Restore failed");
  expect(restored.state.review?.keyMomentIds).toEqual(ids);
  expect(() => selectReviewMoments(state, content, [ids[0]!, ids[0]!, ids[2]!])).toThrow();
  expect(() => selectReviewMoments(state, content, [ids[0]!, ids[1]!, "not-recorded"])).toThrow();
  expect(createFamilyReview(restored.state, content)).toEqual(selected.review);
});

it("replays the initial circumstances instead of end-state resources or tendencies", () => {
  const { state } = completedStory();
  const initial = createFamilyRun({ seed: 42 });
  const replay = replayFamilyRun({ ...state, tendencies: { selfCare: 99 } });
  expect(replay.state).toEqual(initial.state);
  expect(replay.actors).toEqual(initial.actors);
});

it("retains an assessed and rerolled opening across save and replay", () => {
  const assessed = createFamilyRun({ seed: 41, answers: getAssessmentQuestions().map((question) => question.choices[0]!.id) });
  const run = rerollFamilyRun(assessed, { seed: 42 });
  const saved = restoreGame(serializeGame(run.state));
  if (saved.status !== "restored") throw new Error("Restore failed");
  expect(replayFamilyRun(saved.state).state).toEqual(run.state);
  expect(replayFamilyRun(saved.state).actors).toEqual(run.actors);
});

it("shares only controlled narrative labels, excluding private data and random state", () => {
  const { state, content } = completedStory();
  const privateState = { ...state, family: { ...state.family, preferredAddress: "PRIVATE-NAME" },
    history: state.history.map((entry) => ({ ...entry, text: `PRIVATE-HEALTH ${entry.text}` })) };
  const review = createFamilyReview(privateState, content);
  expect(review.safeShareText).toContain("這是遊戲中的家庭紀錄");
  expect(review.safeShareText).not.toMatch(/PRIVATE|rngState|seed|finances|energy|planningLoad|42/);
  expect(review.themes.length).toBeGreaterThanOrEqual(1);
  expect(review.themes.length).toBeLessThanOrEqual(2);
  expect(() => createFamilyReview(createFamilyRun({ seed: 42 }).state, content)).toThrow();
});

it("reaches all six themes through complete games using unmodified MVP content", () => {
  const themes = new Set<string>();
  for (let seed = 0; seed < 32 && themes.size < 6; seed++) {
    for (const choice of ["coordinate", "carry", "handoff"]) {
      const { state, content } = completedStory(choice, seed);
      for (const theme of createFamilyReview(state, content).themes) themes.add(theme);
    }
  }
  expect([...themes].sort()).toEqual(["dual-income-routine", "growing-together", "learning-self-care",
    "repair-after-conflict", "supported-journey", "unexpected-growth"]);
});
