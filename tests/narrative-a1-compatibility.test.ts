import { createHash } from "node:crypto";
import { setImmediate } from "node:timers/promises";
import { afterEach, expect, it } from "vitest";
import { bindNarrativeRun, bindPreviewRun, createRunContent } from "../src/content/releases.js";
import { createFamilyRun, createFamilyReview, getPlayerView, projectJournal, replayFamilyRun, transitionGame } from "../src/engine/index.js";
import { restoreGame, serializeGame } from "../src/persistence/index.js";

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
// Keep worker progress responsive while checking complete saved-story traces.
afterEach(() => setImmediate());
// Captured from the unchanged legacy/08A sources at main 6ced33a. Never regenerate to hide a regression.
const oldRuns: Record<string, string> = {
  "legacy/9/false": "27dc05ec530c88233b00c6ae63f4be9c5f9caf286745e8f216f5178877876da1",
  "legacy/9/true": "0b2311e3a8d9e26a18d8bf1c366dbc6baa20a7554a2c65574051c0229ca6d839",
  "legacy/1/false": "299aa3bd30915ea15f50991bc9b7314c31712eedada7bc7eb3a1d50b222544d2",
  "legacy/1/true": "65506b6f6954170b73c7d2424d7ca71e312827a665e71d9e53f98b6cf0c537b9",
  "legacy/11/false": "68989d2ae7a1626cda19f3cfcd0277856749740329e322e1ce7c99d896bf81be",
  "legacy/11/true": "9551ca285390ff63e82cb3156c5b2da31a044715375b7038bb67a306b0a045f7",
  "legacy/2/false": "182633d5f4b735aff48af9f653836eecaacd39da6327de92b0dc328614605291",
  "legacy/2/true": "0d64cdf0129e6d456867207fcd01c4f5d90ea92f811bbb16c104c1a46b6f82b8",
  "08a/9/false": "6a4c4edf642ec57a7e3f7151028ecccf54a10d864a38c9d3bc48ef465ce8004a",
  "08a/9/true": "70b50284e9328b9598977746dd920773b1779b3a31a450564e0cd66945c64a79",
  "08a/1/false": "b297b86eb0288d2450814a32053d2056ea3acd341d0aaf0848d286dab16cc626",
  "08a/1/true": "8189ecb4137ccea6ad5d6d027c63ef28b2a0dbb31c1dc5284d51ba28922d0646",
  "08a/11/false": "5d18320e10805d7db806bd466d2a470ee207b93f72f5013015361c1b49104a71",
  "08a/11/true": "ed06f8587da44d8582e11f54708b1427cdaa686e5b62fff4bfa753f54b210072",
  "08a/2/false": "d5ec323d244ca63c7c37dfa584d6a3cdeb80ff2d40434e66cae9fa61463a8700",
  "08a/2/true": "2ce50732a5da9a9fab5c828c232bd0e6a25a9ab03a69a1431733acc01c170988",
};

it("freezes the complete legacy, 08A-v1 and A1 catalogues independently", () => {
  const run = createFamilyRun({ seed: 9 });
  const digests = [run, bindPreviewRun(run), bindNarrativeRun(run)].map(run => hash(createRunContent(run.state)));
  expect(digests).toEqual([
    "fa2cb24f016d4028000d9bc2a8557f1471a9215a8f71c6bf770597a506fcb474",
    "540ce53a2a36668ed1b93b886879cddfe56e271eb22ae85368c82136b3259909",
    "5907385b861c35521d16afeecf3fea450b5cdf27533bb1b131483b65fdcd8366",
  ]);
});

const oldRunCases = ["legacy", "08a"].flatMap(release =>
  [9, 1, 11, 2].flatMap(seed => [false, true].map(last => ({ release, seed, last }))));

it.each(oldRunCases)("preserves every checkpoint through complete play, review and replay: $release / seed=$seed / last=$last", ({ release, seed, last }) => {
  const run = createFamilyRun({ seed });
  let state = (release === "08a" ? bindPreviewRun(run) : run).state;
  const content = createRunContent(state);
  const checkpoints: string[] = [];
  for (let step = 0; step < 240; step++) {
    const raw = serializeGame(state);
    checkpoints.push(raw);
    const restored = restoreGame(raw);
    expect(restored).toMatchObject({ status: "restored", state, migratedFrom: null });
    if (restored.status !== "restored") throw new Error("Old checkpoint rejected");
    expect(createRunContent(restored.state)).toEqual(content);
    expect(projectJournal(restored.state)).toEqual(projectJournal(state));
    const view = getPlayerView(state, content);
    if (view.completed) break;
    const command = view.pendingEvent ? { type: "CHOOSE" as const,
      choiceId: view.pendingEvent.choices[last ? view.pendingEvent.choices.length - 1 : 0]!.id } : view.nextInput!;
    const result = transitionGame(state, content, command);
    expect(transitionGame(restored.state, createRunContent(restored.state), command)).toEqual(result);
    state = result.state;
  }
  expect(state.completedAgeStages).toHaveLength(12);
  const review = createFamilyReview(state, content);
  const saved = { ...state, review };
  expect(restoreGame(serializeGame(saved))).toMatchObject({ status: "restored", state: saved });
  const replay = replayFamilyRun(saved);
  expect(replay.state.contentBinding).toEqual(state.contentBinding);
  expect(createRunContent(replay.state)).toEqual(content);
  expect(review.repairMomentIds.some(id => state.history.find(row => row.id === id)!.ageStageId === "age-stage-1")).toBe(true);
  expect(hash({ checkpoints, review, replay })).toBe(oldRuns[`${release}/${seed}/${last}`]);
}, 30000);
