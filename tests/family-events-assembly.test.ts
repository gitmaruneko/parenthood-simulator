import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { assembleFamilyEntries, bindPreviewRun, createRunContent } from "../src/content/releases.js";
import { sha256 } from "../src/domain/content-binding.js";
import { familyProfileSchema } from "../src/domain/schemas.js";
import { createFamilyRun, getPlayerView, transitionGame } from "../src/engine/index.js";
import { restoreGame, serializeGame } from "../src/persistence/index.js";
import { TOY_CAR_ROOT } from "../src/content/toy-car-story.js";
import { validatePreviewContract } from "../src/content/preview-contract.js";

it("rejects content edits that break unconditional chains, repair, mutual exclusion or support/planning guarantees", () => {
  const content = createRunContent(bindPreviewRun(createFamilyRun({ seed: 9 })).state);
  for (const mutate of [
    (pack: typeof content) => { pack.events.find(event => event.id === TOY_CAR_ROOT)!.scheduledFollowUps = []; },
    (pack: typeof content) => { pack.events.find(event => event.id === "toy-car-story-listen")!.choices[0]!.requirements = { kind: "actorAvailable", actorId: "caregiver-2" }; },
    (pack: typeof content) => { pack.events.find(event => event.id === "toy-car-story-close")!.immediateFollowUpEventIds = [TOY_CAR_ROOT]; },
    (pack: typeof content) => { pack.events.find(event => event.id === "shared-ownership-reflection")!.kind = "routine"; },
    (pack: typeof content) => { pack.events.find(event => event.id === "shared-ownership-choice")!.choices[0]!.storyEntries = []; },
  ]) {
    const broken = structuredClone(content); mutate(broken);
    expect(() => validatePreviewContract(broken)).toThrow();
  }
});

it("keeps SHA-256 content identity compatible with independent standard vectors and UTF-8", () => {
  expect(sha256("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  expect(sha256("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  for (const text of ["家庭小車", "x".repeat(55), "x".repeat(56), "x".repeat(64), "x".repeat(1000)])
    expect(sha256(text)).toBe(createHash("sha256").update(text).digest("hex"));
});

it.each(familyProfileSchema.shape.householdComposition.options)("assembles all care/work combinations without consuming RNG: %s", householdComposition => {
  const run = bindPreviewRun(createFamilyRun({ seed: 2 }));
  const authored = createRunContent(run.state);
  const rule = { eventId: TOY_CAR_ROOT, householdComposition: ["twoCaregivers" as const],
    careParticipation: ["shared" as const], workArrangement: ["flexible" as const], requiredActorIds: ["caregiver-2"] };
  // Authoring fixture exercises the family gate; the shipped 08A itself is universal.
  for (const careParticipation of familyProfileSchema.shape.careParticipation.options)
      for (const workArrangement of familyProfileSchema.shape.workArrangement.options) {
        const family = { ...run.state.family, householdComposition, careParticipation, workArrangement,
          persistentActorIds: householdComposition === "singleCaregiver" ? ["support-1"] : ["caregiver-2"] };
        const before = structuredClone(run.state);
        const result = assembleFamilyEntries(authored, family, [rule]);
        expect(result.ageStages[7]!.entryEventIds.includes(TOY_CAR_ROOT)).toBe(
          householdComposition === "twoCaregivers" && careParticipation === "shared" && workArrangement === "flexible");
        expect(result.entryEventIds.includes(TOY_CAR_ROOT)).toBe(result.ageStages[7]!.entryEventIds.includes(TOY_CAR_ROOT));
        expect(run.state).toEqual(before);
      }
});

it("continues exactly after reversing content data, including result prose and review inputs", () => {
  const run = bindPreviewRun(createFamilyRun({ seed: 9, firstAgeStageId: "age-stage-8" }));
  const content = createRunContent(run.state);
  content.ageStages[7]!.entryEventIds = [TOY_CAR_ROOT];
  const reversed = structuredClone(content);
  reversed.events.reverse(); reversed.actors.reverse(); reversed.ageStages.reverse(); reversed.entryEventIds.reverse();
  reversed.reactionPools.reverse();
  reversed.reactionPools.forEach(pool => pool.entries.reverse());
  let state = run.state;
  for (let step = 0; step < 20; step++) {
    if (state.ageStageProgress && state.ageStageProgress.status !== "active") break;
    const view = getPlayerView(state, content);
    const command = view.pendingEvent ? { type: "CHOOSE" as const, choiceId: view.pendingEvent.choices[0]!.id } : view.nextInput!;
    const actual = transitionGame(state, reversed, command);
    const expected = transitionGame(state, content, command);
    expect(actual).toEqual(expected);
    state = actual.state;
  }
});

it("keeps current bytes on unknown releases, assembly mismatches, wrong profiles and misplaced narrative anchors", () => {
  const run = bindPreviewRun(createFamilyRun({ seed: 9 }));
  const data = JSON.parse(serializeGame(run.state));
  for (const mutate of [
    (save: typeof data) => { save.state.contentBinding.releaseId = "future-release"; },
    (save: typeof data) => { save.state.contentBinding.assemblyVersion = 3; },
    (save: typeof data) => { delete save.state.replayOrigin; },
    (save: typeof data) => { save.state.family.workArrangement = "unstable"; },
    (save: typeof data) => { save.state.history.push({ id: "fake", resolvedEventId: "toy-car-story-choice",
      kind: "narrative", text: "Not a node", turnId: "age-stage-1-turn-1", ageStageId: "age-stage-1" }); },
  ]) {
    const copy = structuredClone(data); mutate(copy);
    const rawData = JSON.stringify(copy);
    expect(restoreGame(rawData)).toMatchObject({ status: "error", rawData });
  }
});
