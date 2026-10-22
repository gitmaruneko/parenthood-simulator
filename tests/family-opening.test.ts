import { describe, expect, it } from "vitest";
import { gameStateSchema, actorDefinitionSchema } from "../src/domain/index.js";
import { createFamilyRun, rerollFamilyRun, getAssessmentQuestions, describeTendencies } from "../src/engine/index.js";

describe("Family opening public boundary", () => {
  it("replays a valid family and fresh state from a seed without starting a Turn", () => {
    const run = createFamilyRun({ seed: 123456789 });

    expect(run).toEqual(createFamilyRun({ seed: 123456789 }));
    expect(gameStateSchema.safeParse(run.state).success).toBe(true);
    expect(run.state.seed).toBe(123456789);
    expect(run.state.rngState).not.toBe(run.state.seed);
    expect(run.state).toMatchObject({
      currentAgeStageId: "age-stage-1", currentTurnId: null, turn: null,
      eventProgress: null, scheduledFollowUps: [], choiceHistory: [], history: [],
      completedEventIds: [], flags: [], relationshipMemories: [], planningLoad: 0,
    });
    expect(run.state.family.preferredAddress).toBe("照顧者");
    expect(run.actors.filter((actor) => actor.role === "child")).toHaveLength(1);
    expect(run.state.family.persistentActorIds.length).toBeLessThanOrEqual(2);
    for (const actor of run.actors) {
      expect(actorDefinitionSchema.safeParse(actor).success).toBe(true);
    }
    expect(run.actors.map((actor) => actor.id)).toEqual([
      run.state.family.childId, ...run.state.family.persistentActorIds,
    ]);
    expect(run.summary.text).toContain("你");
    expect(run.summary.conditions).toHaveLength(3);
  });

  it("offers five optional situations with four choices and describes current tendencies without scores", () => {
    const questions = getAssessmentQuestions();
    expect(questions).toHaveLength(5);
    for (const question of questions) {
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices.map((choice) => choice.id)).size).toBe(4);
      for (const choice of question.choices) expect(Object.keys(choice).sort()).toEqual(["id", "text"]);
    }
    const answers = questions.map((question) => question.choices[0]!.id);
    const skipped = createFamilyRun({ seed: 42 });
    const completed = createFamilyRun({ seed: 42, answers });
    expect(completed).toEqual(createFamilyRun({ seed: 42, answers }));
    expect(completed.state.tendencies).toEqual({ responsibility: 3, flexibility: 2, selfCare: 4, sharedCare: 2 });
    expect(skipped.state.tendencies).toEqual({ responsibility: 0, flexibility: 0, selfCare: 0, sharedCare: 0 });
    expect(createFamilyRun({ seed: 42, answers: null })).toEqual(skipped);
    expect(completed.state.family).toEqual(skipped.state.family);
    expect(completed.state.resources).toEqual(skipped.state.resources);
    expect(completed.actors).toEqual(skipped.actors);
    expect(completed.state.rngState).toBe(skipped.state.rngState);
    expect(completed.summary).toEqual(skipped.summary);
    expect(completed.assessment.status).toBe("completed");
    expect(skipped.assessment.status).toBe("skipped");
    expect(Object.keys(completed.assessment).sort()).toEqual(["descriptions", "status"]);
    expect(completed.assessment.descriptions.length).toBeGreaterThanOrEqual(2);
    expect(completed.assessment.descriptions.length).toBeLessThanOrEqual(3);
    const changed = { ...completed.state, tendencies: { responsibility: 0, flexibility: 0, selfCare: 0, sharedCare: 10 } };
    expect(describeTendencies(changed.tendencies)[0]).toContain("分擔");
    expect(completed.state.tendencies.sharedCare).toBe(2);
  });

  it("rerolls to a fresh run while preserving the chosen address and current assessment", () => {
    const answers = getAssessmentQuestions().map((question) => question.choices[0]!.id);
    const previous = createFamilyRun({ seed: 1, preferredAddress: "阿樂", answers });
    previous.state.currentAgeStageId = "age-stage-8";
    previous.state.currentTurnId = "old-turn";
    previous.state.turn = { id: "old-turn", ageStageId: "age-stage-8", status: "completed", nodeCount: 1,
      maxNodeCount: 4, activeEventId: null, processedEventIds: ["old-event"] };
    previous.state.eventProgress = { ageStageId: "age-stage-8", turnId: "old-turn", eventId: "old-event", nodeIndex: 0, status: "completed" };
    previous.state.flags = ["old-flag"];
    previous.state.completedEventIds = ["old-event"];
    previous.state.planningLoad = 123;
    previous.state.relationshipMemories = [{ id: "old-memory", category: "support", text: "old", createdAtAgeStageId: "age-stage-8" }];
    previous.state.scheduledFollowUps = [{ id: "old-schedule", eventId: "old-event", targetAgeStageId: "age-stage-9", dueAfterTurns: 2, priority: 0, status: "pending" }];
    previous.state.choiceHistory = [{ eventId: "old-event", choiceId: "old-choice", ageStageId: "age-stage-8", turnId: "old-turn" }];
    previous.state.history = [{ id: "old-story", ageStageId: "age-stage-8", turnId: "old-turn", kind: "event", text: "old" }];
    const snapshot = structuredClone(previous);
    const rerolled = rerollFamilyRun(previous, { seed: 2 });
    expect(rerolled).toEqual(rerollFamilyRun(previous, { seed: 2 }));
    expect(previous).toEqual(snapshot);
    expect(rerolled.state).toMatchObject({ seed: 2, currentAgeStageId: "age-stage-1",
      currentTurnId: null, turn: null, eventProgress: null, planningLoad: 0,
      flags: [], completedEventIds: [], relationshipMemories: [], scheduledFollowUps: [], choiceHistory: [], history: [],
      family: { preferredAddress: "阿樂" }, tendencies: previous.state.tendencies });
    expect(rerolled.state.review).toBeUndefined();
    expect(rerolled.assessment).toEqual(previous.assessment);
    expect(gameStateSchema.safeParse(rerolled.state).success).toBe(true);
    expect(() => rerollFamilyRun(previous, { seed: 1 })).toThrow(/new seed/i);
    expect(rerollFamilyRun(previous, { seed: 2, answers: null }).assessment.status).toBe("skipped");
  });

  it("allows all 48 independent dimension combinations and prevents an immediate repeat", () => {
    const signature = (run: ReturnType<typeof createFamilyRun>) => {
      const family = run.state.family;
      return `${family.householdComposition}/${family.careParticipation}/${family.workArrangement}`;
    };
    const seen = new Map<string, ReturnType<typeof createFamilyRun>>();
    let collisions = 0;
    for (let seed = 0; seed < 512; seed++) {
      const run = createFamilyRun({ seed });
      const previous = seen.get(signature(run));
      if (previous) {
        const rerolled = rerollFamilyRun(previous, { seed });
        expect(signature(rerolled)).not.toBe(signature(previous));
        expect(rerolled.summary.conditions.map((condition) => condition.value)).toEqual([
          rerolled.state.family.householdComposition, rerolled.state.family.careParticipation, rerolled.state.family.workArrangement,
        ]);
        collisions++;
      } else seen.set(signature(run), run);
    }
    expect(seen.size).toBe(48);
    expect(collisions).toBeGreaterThan(0);
  });

  it("covers every assessment choice with mixed narrative weights independent of family generation", () => {
    const questions = getAssessmentQuestions();
    const baseline = questions.map((question) => question.choices[0]!.id);
    const neutral = createFamilyRun({ seed: 0xffffffff });
    // Worked totals in responsibility, flexibility, self-care, shared-care order.
    const totals = [
      [[3, 2, 4, 2], [5, 2, 3, 2], [3, 1, 4, 4], [3, 2, 5, 2]],
      [[3, 2, 4, 2], [3, 1, 4, 4], [2, 3, 5, 2], [3, 1, 6, 2]],
      [[3, 2, 4, 2], [1, 4, 4, 2], [2, 2, 3, 4], [1, 3, 5, 2]],
      [[3, 2, 4, 2], [4, 2, 6, 0], [4, 4, 4, 0], [3, 4, 5, 0]],
      [[3, 2, 4, 2], [5, 2, 2, 3], [3, 2, 3, 4], [3, 4, 3, 2]],
    ];
    questions.forEach((question, questionIndex) => {
      question.choices.forEach((choice, choiceIndex) => {
        const answers = [...baseline];
        answers[questionIndex] = choice.id;
        const run = createFamilyRun({ seed: 0xffffffff, answers });
        const [responsibility, flexibility, selfCare, sharedCare] = totals[questionIndex]![choiceIndex]!;
        expect(run.state.tendencies).toEqual({ responsibility, flexibility, selfCare, sharedCare });
        expect(run).toEqual(createFamilyRun({ seed: 0xffffffff, answers }));
        expect({ ...run.state, tendencies: neutral.state.tendencies }).toEqual(neutral.state);
        expect(run.actors).toEqual(neutral.actors);
        expect(run.assessment.descriptions.join("")).not.toMatch(/\d|分數|診斷|某型|媽媽|爸爸|成功率/);
      });
    });
  });

  it("rejects invalid seeds, incomplete answers, wrong question choices and empty addresses", () => {
    for (const seed of [-1, 1.5, 0x1_0000_0000, NaN, Infinity]) {
      expect(() => createFamilyRun({ seed })).toThrow(RangeError);
    }
    const answers = getAssessmentQuestions().map((question) => question.choices[0]!.id);
    for (const invalid of [[], answers.slice(1), [...answers, "extra"], ["missing", ...answers.slice(1)], [...answers].reverse()]) {
      expect(() => createFamilyRun({ seed: 0, answers: invalid })).toThrow();
    }
    expect(() => createFamilyRun({ seed: 0, preferredAddress: "  " })).toThrow();
    expect(() => createFamilyRun({ seed: 0, firstAgeStageId: "not a stable id" })).toThrow();
    const custom = createFamilyRun({ seed: 0, preferredAddress: "  阿晴  ", firstAgeStageId: "infancy" });
    expect(custom.state.family.preferredAddress).toBe("阿晴");
    expect(custom.state.currentAgeStageId).toBe("infancy");
  });

  it("configures care participation separately from actor reliability and household size", () => {
    const covered = new Set<string>();
    for (let seed = 0; seed < 64; seed++) {
      const run = createFamilyRun({ seed });
      const care = run.state.family.careParticipation;
      covered.add(care);
      const adult = run.actors.find((actor) => actor.id === run.state.family.persistentActorIds[0])!;
      if (care === "shared") {
        expect(adult.workflowOwnership).toBeGreaterThanOrEqual(0.5);
        expect(adult.initiative).toBeGreaterThanOrEqual(0.5);
      }
      if (care === "pseudoSingle") {
        expect(adult.workflowOwnership).toBeLessThanOrEqual(0.25);
        expect(adult.availability).toBeLessThanOrEqual(0.25);
      }
      if (care === "uneven" || care === "primaryAndBackup") expect(adult.workflowOwnership).toBeLessThanOrEqual(0.5);
      expect(adult.reliability).toBeGreaterThanOrEqual(0);
      expect(adult.reliability).toBeLessThanOrEqual(1);
    }
    expect(covered.size).toBe(4);
  });

  it("describes only supported tendencies and uses neutral context when fewer than two remain", () => {
    const run = createFamilyRun({ seed: 42,
      answers: ["pause-meal", "pack-meal", "rest-tonight", "defer-comment", "follow-mood"] });
    expect(run.state.tendencies).toEqual({ responsibility: 0, flexibility: 8, selfCare: 7, sharedCare: 0 });
    expect(run.assessment.descriptions).toHaveLength(2);
    expect(run.assessment.descriptions.join("")).not.toMatch(/準備好|分擔/);
    const single = describeTendencies({ responsibility: 0, flexibility: 0, selfCare: 5, sharedCare: 0 });
    expect(single).toHaveLength(2);
    expect(single[0]).toContain("休息");
    expect(single[1]).toContain("改變");
    expect(single.join("")).not.toMatch(/準備好|分擔|原來的安排/);
    expect(describeTendencies({ responsibility: -1 })).toEqual(describeTendencies({}));
  });
});
