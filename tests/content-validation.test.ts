import { describe, expect, it } from "vitest";

import {
  AGE_STAGE_MONTHS,
  contentPackSchema,
  gameStateSchema,
  type ContentPack,
} from "../src/domain/schemas.js";
import { parseContentPack, validateContentPack } from "../src/domain/content-validation.js";

const makeAgeStages = () =>
  AGE_STAGE_MONTHS.map((childAgeMonths, order) => ({
    id: `age-stage-${order + 1}`,
    order,
    childAgeMonths,
    entryEventIds: [order === 0 ? "welcome" : `stage-entry-${order + 1}`],
    turnNodeLimit: 4 as const,
    ageStageNodeLimit: 6 as const,
  }));

const makeValidPack = (): ContentPack => ({
  schemaVersion: 1,
  entryEventIds: ["welcome"],
  fallbackEventId: "follow-up",
  requiredEventIds: ["welcome", "follow-up"],
  ageStages: makeAgeStages(),
  actors: [
    {
      id: "partner-1",
      role: "partner" as const,
      displayName: "另一位照顧者",
      availability: 0.7,
      initiative: 0.6,
      workflowOwnership: 0.5,
      reliability: 0.8,
      boundaryRespect: 0.9,
    },
  ],
  reactionPools: [
    {
      id: "public-reactions",
      entries: [
        {
          id: "understanding",
          kind: "support" as const,
          text: "另一位家長點了點頭。",
          weight: 2,
          actorRoles: ["stranger" as const],
          followUpEventIds: [],
        },
        {
          id: "silence",
          kind: "none" as const,
          text: "沒有人特別注意。",
          weight: 1,
          actorRoles: ["stranger" as const],
          followUpEventIds: [],
        },
      ],
    },
  ],
  knowledgeCards: [
    {
      id: "calm-transition",
      topic: "轉換情境",
      ageRange: { minMonths: 24, maxMonths: 48 },
      summary: "孩子在轉換活動時可能需要預告。",
      practicalTips: ["可以先說明下一步會發生什麼。"],
      reviewStatus: "draft" as const,
    },
  ],
  events: [
    {
      id: "welcome",
      ageStageId: "age-stage-1",
      kind: "choice" as const,
      mode: "PLAYER_INPUT_REQUIRED" as const,
      title: "早上的安排",
      text: "你注意到今天的節奏比平常緊湊。",
      weight: 1,
      eligibility: { kind: "always" },
      actorIds: ["partner-1"],
      choices: [
        {
          id: "prepare-together",
          text: "和另一位照顧者一起重新安排",
          resourceDeltas: { energy: -5 },
          setFlags: [],
          relationshipMemoryIds: [],
          immediateFollowUpEventIds: ["follow-up"],
          scheduledFollowUps: [],
          knowledgeCardIds: ["calm-transition"],
        },
        {
          id: "handle-alone",
          text: "先自己處理，再找時間說明",
          resourceDeltas: { energy: -10 },
          setFlags: [],
          relationshipMemoryIds: [],
          immediateFollowUpEventIds: [],
          scheduledFollowUps: [{ eventId: "follow-up", delayTurns: 1, priority: 0 }],
          knowledgeCardIds: [],
        },
      ],
      reactionPoolIds: ["public-reactions"],
      knowledgeCardIds: ["calm-transition"],
      immediateFollowUpEventIds: [],
      scheduledFollowUps: [],
      repeatable: false,
      cooldownTurns: 0,
    },
    {
      id: "follow-up",
      ageStageId: "age-stage-1",
      kind: "reaction" as const,
      mode: "AUTO_ADVANCE" as const,
      title: "有人回應了",
      text: "這個選擇留下了一點後續影響。",
      weight: 1,
      eligibility: { kind: "always" },
      actorIds: ["partner-1"],
      choices: [],
      reactionPoolIds: ["public-reactions"],
      knowledgeCardIds: [],
      immediateFollowUpEventIds: [],
      scheduledFollowUps: [],
      repeatable: false,
      cooldownTurns: 0,
    },
    ...AGE_STAGE_MONTHS.slice(1).map((childAgeMonths, index) => ({
      id: `stage-entry-${index + 2}`,
      ageStageId: `age-stage-${index + 2}`,
      kind: "routine" as const,
      mode: "AUTO_ADVANCE" as const,
      title: "階段入口",
      text: "新的成長階段開始了。",
      weight: 1,
      eligibility: { kind: "always" as const },
      actorIds: [],
      choices: [],
      reactionPoolIds: [],
      knowledgeCardIds: [],
      immediateFollowUpEventIds: [],
      scheduledFollowUps: [],
      repeatable: false,
      cooldownTurns: 0,
    })),
  ],
});

describe("Content Schema Validation seam", () => {
  it("accepts a valid content pack and exposes parsed defaults", () => {
    const result = validateContentPack(makeValidPack());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ageStages).toHaveLength(12);
      expect(result.data.events[0]?.choices).toHaveLength(2);
      expect(result.data.events[0]?.choices[0]?.resourceDeltas).toEqual({ energy: -5 });
    }
  });

  it("keeps schema parsing and cross-reference validation as separate public checks", () => {
    const pack = makeValidPack();
    expect(() => contentPackSchema.parse(pack)).not.toThrow();

    pack.events[0]!.choices[0]!.immediateFollowUpEventIds = ["missing-event"];
    const result = validateContentPack(pack);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          code: "MISSING_REFERENCE",
          path: "events[0].choices[0].immediateFollowUpEventIds[0]",
        }),
      );
    }
  });

  it("rejects duplicate IDs, invalid weights, and missing reaction references", () => {
    const pack = makeValidPack();
    pack.events.push({ ...pack.events[1]!, id: "welcome" });
    pack.events[1]!.reactionPoolIds = ["unknown-pool"];

    const result = validateContentPack(pack);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some((issue) => issue.code === "DUPLICATE_ID")).toBe(true);
      expect(result.issues.some((issue) => issue.code === "MISSING_REFERENCE")).toBe(true);
    }

    const invalidWeightPack = makeValidPack();
    invalidWeightPack.reactionPools[0]!.entries[0]!.weight = 0;
    const invalidWeightResult = validateContentPack(invalidWeightPack);
    expect(invalidWeightResult.success).toBe(false);
    if (!invalidWeightResult.success) {
      expect(invalidWeightResult.issues.some((issue) => issue.code === "INVALID_WEIGHT")).toBe(true);
    }

    const emptyPoolPack = makeValidPack();
    emptyPoolPack.reactionPools[0]!.entries = [];
    const emptyPoolResult = validateContentPack(emptyPoolPack);
    expect(emptyPoolResult.success).toBe(false);
    if (!emptyPoolResult.success) {
      expect(emptyPoolResult.issues.some((issue) => issue.code === "EMPTY_REACTION_POOL")).toBe(true);
    }
  });

  it("reports required content that cannot be reached from an entry event", () => {
    const pack = makeValidPack();
    pack.requiredEventIds.push("unreachable");
    pack.events.push({
      ...pack.events[1]!,
      id: "unreachable",
      immediateFollowUpEventIds: [],
      reactionPoolIds: [],
    });

    const result = validateContentPack(pack);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: "UNREACHABLE_REQUIRED_EVENT" }),
      );
    }
  });

  it("validates knowledge-card references and nested scheduled conditions", () => {
    const pack = makeValidPack();
    pack.events[0]!.choices[0]!.knowledgeCardIds = ["missing-card"];
    pack.events[0]!.choices[1]!.scheduledFollowUps[0]!.condition = {
      kind: "eventCompleted",
      eventId: "missing-condition-event",
    };
    pack.events[1]!.terminationGuard = {
      kind: "condition",
      condition: { kind: "actorAvailable", actorId: "missing-guard-actor" },
    };

    const result = validateContentPack(pack);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: "MISSING_REFERENCE", path: "events[0].choices[0].knowledgeCardIds[0]" }),
          expect.objectContaining({
            code: "MISSING_REFERENCE",
            path: "events[0].choices[1].scheduledFollowUps[0].condition.eventId",
          }),
          expect.objectContaining({
            code: "MISSING_REFERENCE",
            path: "events[1].terminationGuard.condition.actorId",
          }),
        ]),
      );
    }
  });

  it("uses age-stage entry events as reachability roots and validates stage ownership", () => {
    const pack = makeValidPack();
    pack.requiredEventIds.push("stage-entry-2");

    const result = validateContentPack(pack);

    expect(result.success).toBe(true);
  });

  it("requires a safe auto-advance fallback event", () => {
    const pack = makeValidPack();
    pack.fallbackEventId = "welcome";

    const result = validateContentPack(pack);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: "INVALID_FALLBACK", path: "fallbackEventId" }),
      );
    }
  });

  it("permits a declared cycle when a termination guard is present", () => {
    const pack = makeValidPack();
    pack.events[0]!.immediateFollowUpEventIds = ["follow-up"];
    pack.events[1]!.immediateFollowUpEventIds = ["welcome"];
    pack.events[0]!.terminationGuard = { kind: "maxVisits", count: 2 };

    const result = validateContentPack(pack);

    expect(result.success).toBe(true);
  });

  it("rejects a cycle without an explicit termination guard", () => {
    const pack = makeValidPack();
    pack.events[0]!.immediateFollowUpEventIds = ["follow-up"];
    pack.events[1]!.immediateFollowUpEventIds = ["welcome"];

    const result = validateContentPack(pack);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: "CYCLE_WITHOUT_TERMINATION_GUARD" }),
      );
    }
  });

  it("throws a structured error without hiding invalid content", () => {
    const pack = makeValidPack();
    pack.fallbackEventId = "missing-fallback";

    expect(() => parseContentPack(pack)).toThrow(/content validation failed/);
    try {
      parseContentPack(pack);
    } catch (error) {
      expect(error).toMatchObject({ name: "ContentValidationError" });
      expect((error as { issues: Array<{ code: string; path: string }> }).issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: "MISSING_REFERENCE", path: "fallbackEventId" }),
        ]),
      );
    }
  });
});

describe("domain state schemas", () => {
  it("accepts a serializable GameState contract", () => {
    const result = gameStateSchema.safeParse({
      schemaVersion: 1,
      seed: 123,
      rngState: 456,
      currentAgeStageId: "age-stage-1",
      currentTurnId: null,
      turn: null,
      eventProgress: null,
      resources: {
        finances: 50,
        energy: 70,
        support: 20,
        timeFlexibility: 40,
        connection: 80,
      },
      planningLoad: 12,
      family: {
        householdComposition: "twoCaregivers",
        careParticipation: "pseudoSingle",
        workArrangement: "dualIncome",
        preferredAddress: "照顧者",
        childId: "child-1",
        persistentActorIds: ["partner-1"],
      },
      tendencies: { coordination: 0.5 },
      flags: [],
      relationshipMemories: [],
      completedEventIds: [],
      scheduledFollowUps: [],
      choiceHistory: [],
      history: [],
    });

    expect(result.success).toBe(true);
  });
});
