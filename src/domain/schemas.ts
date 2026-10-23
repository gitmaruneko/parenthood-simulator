import { z } from "zod";

export const AGE_STAGE_MONTHS = [2, 6, 10, 15, 21, 27, 33, 39, 45, 52, 61, 71] as const;

const identifierSchema = z
  .string()
  .min(1, "identifier must not be empty")
  .regex(/^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/i, "identifier must be stable and URL-safe");

export const resourceKeySchema = z.enum([
  "finances",
  "energy",
  "support",
  "timeFlexibility",
  "connection",
]);

const resourceValueSchema = z.number().finite().min(0).max(100);
const resourceDeltaSchema = z.record(resourceKeySchema, z.number().finite());

export const actorRoleSchema = z.enum([
  "child",
  "partner",
  "grandparent",
  "teacher",
  "colleague",
  "stranger",
]);

export const eventNodeKindSchema = z.enum([
  "choice",
  "reaction",
  "routine",
  "support",
  "repair",
  "environment",
]);

export const eventResolutionModeSchema = z.enum(["PLAYER_INPUT_REQUIRED", "AUTO_ADVANCE"]);

export type Condition =
  | { kind: "always" }
  | { kind: "flag"; flag: string }
  | { kind: "eventCompleted"; eventId: string }
  | { kind: "eventNotCompleted"; eventId: string }
  | { kind: "resourceAtLeast"; resource: z.infer<typeof resourceKeySchema>; value: number }
  | { kind: "resourceAtMost"; resource: z.infer<typeof resourceKeySchema>; value: number }
  | { kind: "planningLoadAtLeast" | "planningLoadAtMost"; value: number }
  | { kind: "tendencyAtLeast" | "tendencyAtMost"; tendency: string; value: number }
  | { kind: "actorAvailable"; actorId: string }
  | { kind: "location"; locationId: string }
  | { kind: "contextTag"; tag: string }
  | { kind: "recentEvent"; eventId: string; withinTurns: number }
  | { kind: "relationshipMemory"; category: "care" | "conflict" | "support" | "repair" | "connection"; withinTurns: number; memoryId?: string | undefined }
  | { kind: "all"; conditions: Condition[] }
  | { kind: "any"; conditions: Condition[] }
  | { kind: "not"; condition: Condition };

export const conditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.object({ kind: z.literal("always") }).strict(),
    z.object({ kind: z.literal("flag"), flag: identifierSchema }).strict(),
    z.object({ kind: z.literal("eventCompleted"), eventId: identifierSchema }).strict(),
    z.object({ kind: z.literal("eventNotCompleted"), eventId: identifierSchema }).strict(),
    z
      .object({
        kind: z.literal("resourceAtLeast"),
        resource: resourceKeySchema,
        value: z.number().finite().min(0).max(100),
      })
      .strict(),
    z
      .object({
        kind: z.literal("resourceAtMost"),
        resource: resourceKeySchema,
        value: z.number().finite().min(0).max(100),
      })
      .strict(),
    z.object({ kind: z.literal("actorAvailable"), actorId: identifierSchema }).strict(),
    z.object({ kind: z.enum(["planningLoadAtLeast", "planningLoadAtMost"]), value: z.number().finite().min(0) }).strict(),
    z.object({ kind: z.enum(["tendencyAtLeast", "tendencyAtMost"]), tendency: identifierSchema,
      value: z.number().finite() }).strict(),
    z.object({ kind: z.literal("location"), locationId: identifierSchema }).strict(),
    z.object({ kind: z.literal("contextTag"), tag: identifierSchema }).strict(),
    z.object({ kind: z.literal("recentEvent"), eventId: identifierSchema, withinTurns: z.number().int().min(0) }).strict(),
    z.object({ kind: z.literal("relationshipMemory"),
      category: z.enum(["care", "conflict", "support", "repair", "connection"]),
      memoryId: identifierSchema.optional(),
      withinTurns: z.number().int().min(0) }).strict(),
    z
      .object({ kind: z.literal("all"), conditions: z.array(conditionSchema).min(1) })
      .strict(),
    z
      .object({ kind: z.literal("any"), conditions: z.array(conditionSchema).min(1) })
      .strict(),
    z.object({ kind: z.literal("not"), condition: conditionSchema }).strict(),
  ]),
);

export const terminationGuardSchema = z.union([
  z
    .object({ kind: z.literal("cooldown"), turns: z.number().int().min(1) })
    .strict(),
  z
    .object({ kind: z.literal("maxVisits"), count: z.number().int().min(1) })
    .strict(),
  z.object({ kind: z.literal("condition"), condition: conditionSchema }).strict(),
]);

export const scheduledFollowUpSchema = z
  .object({
    eventId: identifierSchema,
    targetAgeStageId: identifierSchema.optional(),
    delayTurns: z.number().int().min(0).default(0),
    priority: z.number().int().default(0),
    condition: conditionSchema.optional(),
  })
  .strict();

export const relationshipMemorySchema = z
  .object({
    id: identifierSchema,
    actorId: identifierSchema.optional(),
    category: z.enum(["care", "conflict", "support", "repair", "connection"]),
    text: z.string().min(1),
    createdAtAgeStageId: identifierSchema,
    createdAtTurn: z.number().int().min(0).optional(),
  })
  .strict();

export const narrativeEffectsSchema = z.object({
  resourceDeltas: resourceDeltaSchema.optional(),
  setFlags: z.array(identifierSchema).optional(),
  clearFlags: z.array(identifierSchema).optional(),
  planningLoadDelta: z.number().finite().optional(),
  tendencyDeltas: z.record(identifierSchema, z.number().finite()).optional(),
  relationshipMemories: z.array(relationshipMemorySchema.omit({
    createdAtAgeStageId: true, createdAtTurn: true,
  })).optional(),
  storyEntries: z.array(z.object({
    kind: z.enum(["planning", "support", "repair"]),
    text: z.string().min(1),
  }).strict()).optional(),
}).strict();

export const actorDefinitionSchema = z
  .object({
    id: identifierSchema,
    role: actorRoleSchema,
    displayName: z.string().min(1),
    availability: z.number().finite().min(0).max(1),
    initiative: z.number().finite().min(0).max(1),
    workflowOwnership: z.number().finite().min(0).max(1),
    reliability: z.number().finite().min(0).max(1),
    boundaryRespect: z.number().finite().min(0).max(1),
  })
  .strict();

export const reactionKindSchema = z.enum(["support", "understanding", "neutral", "criticism", "conflict", "none"]);

export const reactionEntrySchema = z
  .object({
    ...narrativeEffectsSchema.shape,
    id: identifierSchema,
    kind: reactionKindSchema,
    text: z.string().min(1),
    weight: z.number().finite(),
    actorRoles: z.array(actorRoleSchema).min(1),
    requirements: conditionSchema.optional(),
    followUpEventIds: z.array(identifierSchema).default([]),
    weightModifiers: z.array(z.object({
      condition: conditionSchema,
      multiplier: z.number().finite().min(0),
    }).strict()).optional(),
    setFlags: z.array(identifierSchema).optional(),
    relationshipMemories: z.array(relationshipMemorySchema.omit({
      actorId: true, createdAtAgeStageId: true, createdAtTurn: true,
    })).optional(),
    scheduledFollowUps: z.array(scheduledFollowUpSchema).optional(),
  })
  .strict();

export const reactionPoolSchema = z
  .object({
    id: identifierSchema,
    entries: z.array(reactionEntrySchema),
  })
  .strict();

export const knowledgeCardSchema = z
  .object({
    id: identifierSchema,
    topic: z.string().min(1),
    ageRange: z
      .object({ minMonths: z.number().int().min(0), maxMonths: z.number().int().min(0) })
      .strict()
      .refine((range) => range.minMonths <= range.maxMonths, {
        message: "ageRange.minMonths must not exceed maxMonths",
        path: ["minMonths"],
      }),
    summary: z.string().min(1),
    practicalTips: z.array(z.string().min(1)).min(1),
    sourceOrganization: z.string().min(1).optional(),
    sourceTitle: z.string().min(1).optional(),
    sourceUrl: z.string().url().optional(),
    reviewStatus: z.enum(["draft", "reviewed"]),
    lastReviewedAt: z.string().datetime().optional(),
    medicalDisclaimer: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((card, ctx) => {
    if (card.reviewStatus === "reviewed" && (!card.sourceOrganization || !card.sourceTitle || !card.sourceUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "reviewed knowledge cards require sourceOrganization, sourceTitle, and sourceUrl",
        path: ["reviewStatus"],
      });
    }
  });

export const eventChoiceSchema = z
  .object({
    ...narrativeEffectsSchema.shape,
    id: identifierSchema,
    text: z.string().min(1),
    anticipatedJudgment: z.string().min(1).optional(),
    requirements: conditionSchema.optional(),
    resourceDeltas: resourceDeltaSchema.default({}),
    setFlags: z.array(identifierSchema).default([]),
    relationshipMemoryIds: z.array(identifierSchema).default([]),
    immediateFollowUpEventIds: z.array(identifierSchema).default([]),
    scheduledFollowUps: z.array(scheduledFollowUpSchema).default([]),
    knowledgeCardIds: z.array(identifierSchema).default([]),
  })
  .strict();

export const eventNodeSchema = z
  .object({
    ...narrativeEffectsSchema.shape,
    id: identifierSchema,
    ageStageId: identifierSchema,
    kind: eventNodeKindSchema,
    mode: eventResolutionModeSchema,
    title: z.string().min(1),
    text: z.string().min(1),
    weight: z.number().finite().positive(),
    locationId: identifierSchema.optional(),
    contextTags: z.array(identifierSchema).optional(),
    eligibility: conditionSchema.default({ kind: "always" }),
    actorIds: z.array(identifierSchema).default([]),
    choices: z.array(eventChoiceSchema).default([]),
    reactionPoolIds: z.array(identifierSchema).default([]),
    knowledgeCardIds: z.array(identifierSchema).default([]),
    immediateFollowUpEventIds: z.array(identifierSchema).default([]),
    scheduledFollowUps: z.array(scheduledFollowUpSchema).default([]),
    repeatable: z.boolean().default(false),
    cooldownTurns: z.number().int().min(0).default(0),
    terminationGuard: terminationGuardSchema.optional(),
  })
  .strict()
  .superRefine((event, ctx) => {
    const isChoice = event.kind === "choice";
    if (isChoice && event.mode !== "PLAYER_INPUT_REQUIRED") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "choice events must require player input",
        path: ["mode"],
      });
    }
    if (isChoice && (event.choices.length < 2 || event.choices.length > 4)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "choice events must contain between 2 and 4 choices",
        path: ["choices"],
      });
    }
    if (!isChoice && event.choices.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "only choice events may contain choices",
        path: ["choices"],
      });
    }
    if (event.mode === "PLAYER_INPUT_REQUIRED" && !isChoice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "only choice events may require player input",
        path: ["mode"],
      });
    }
  });

export const ageStageDefinitionSchema = z
  .object({
    id: identifierSchema,
    order: z.number().int().min(0),
    childAgeMonths: z.number().int().min(0),
    entryEventIds: z.array(identifierSchema).min(1),
    turnNodeLimit: z.literal(4).default(4),
    ageStageNodeLimit: z.literal(6).default(6),
  })
  .strict();

export const contentPackSchema = z
  .object({
    schemaVersion: z.number().int().positive(),
    entryEventIds: z.array(identifierSchema).min(1),
    fallbackEventId: identifierSchema,
    requiredEventIds: z.array(identifierSchema).min(1),
    ageStages: z.array(ageStageDefinitionSchema).length(12),
    events: z.array(eventNodeSchema).min(1),
    actors: z.array(actorDefinitionSchema).default([]),
    reactionPools: z.array(reactionPoolSchema).default([]),
    knowledgeCards: z.array(knowledgeCardSchema).default([]),
  })
  .strict();

export const resourceStateSchema = z
  .object({
    finances: resourceValueSchema,
    energy: resourceValueSchema,
    support: resourceValueSchema,
    timeFlexibility: resourceValueSchema,
    connection: resourceValueSchema,
  })
  .strict();

export const familyProfileSchema = z
  .object({
    householdComposition: z.enum(["singleCaregiver", "twoCaregivers", "multigenerational"]),
    careParticipation: z.enum(["shared", "uneven", "pseudoSingle", "primaryAndBackup"]),
    workArrangement: z.enum(["dualIncome", "singleFullTimeCare", "flexible", "unstable"]),
    preferredAddress: z.string().min(1),
    childId: identifierSchema,
    persistentActorIds: z.array(identifierSchema).max(2),
  })
  .strict();

export const eventProgressSchema = z
  .object({
    ageStageId: identifierSchema,
    turnId: identifierSchema,
    eventId: identifierSchema,
    nodeIndex: z.number().int().min(0),
    status: z.enum(["active", "awaitingInput", "completed"]),
  })
  .strict();

export const turnSchema = z
  .object({
    id: identifierSchema,
    ageStageId: identifierSchema,
    status: z.enum(["active", "awaitingInput", "completed", "cycleProtected", "safelyEnded"]),
    nodeCount: z.number().int().min(0).max(4),
    maxNodeCount: z.literal(4).default(4),
    activeEventId: identifierSchema.nullable(),
    processedEventIds: z.array(identifierSchema),
  })
  .strict();

export const scheduledEventStateSchema = z
  .object({
    id: identifierSchema,
    eventId: identifierSchema,
    targetAgeStageId: identifierSchema,
    dueAfterTurns: z.number().int().min(0),
    priority: z.number().int(),
    condition: conditionSchema.optional(),
    immediateTurnId: identifierSchema.optional(),
    status: z.enum(["pending", "cancelled", "consumed", "expired"]),
  })
  .strict();

export const choiceHistoryEntrySchema = z
  .object({
    eventId: identifierSchema,
    choiceId: identifierSchema,
    anticipatedJudgment: z.string().min(1).optional(),
    ageStageId: identifierSchema,
    turnId: identifierSchema,
  })
  .strict();

export const storyEntrySchema = z
  .object({
    id: identifierSchema,
    ageStageId: identifierSchema,
    turnId: identifierSchema,
    kind: z.enum(["event", "reaction", "support", "repair", "planning"]),
    text: z.string().min(1),
  })
  .strict();

export const reviewTimelineEntrySchema = z
  .object({
    ageStageId: identifierSchema,
    title: z.string().min(1),
    storyEntryIds: z.array(identifierSchema),
  })
  .strict();

export const reviewDataSchema = z
  .object({
    familySummary: z.string().min(1),
    narrativeOverview: z.string().min(1),
    timeline: z.array(reviewTimelineEntrySchema).length(12),
    keyMomentIds: z.array(identifierSchema).length(3),
    supportMomentIds: z.array(identifierSchema),
    repairMomentIds: z.array(identifierSchema),
    endStateResources: resourceStateSchema,
    themes: z.array(z.enum([
      "growing-together",
      "dual-income-routine",
      "supported-journey",
      "learning-self-care",
      "repair-after-conflict",
      "unexpected-growth",
    ])).min(1).max(2),
    safeShareText: z.string().min(1),
  })
  .strict();

export const ageStageProgressSchema = z.object({
  ageStageId: identifierSchema,
  status: z.enum(["active", "completed", "safelyEnded"]),
  nodeCount: z.number().int().min(0).max(6),
  turnCount: z.number().int().min(1),
}).strict();

export const completedAgeStageSchema = ageStageProgressSchema.extend({
  status: z.enum(["completed", "safelyEnded"]),
  storyEntryIds: z.array(identifierSchema),
});

export const observedReactionSchema = z.object({
  poolId: identifierSchema,
  reactionId: identifierSchema.nullable(),
  actorId: identifierSchema.nullable(),
  kind: reactionKindSchema,
  text: z.string().min(1),
}).strict();

export const reactionHistoryEntrySchema = observedReactionSchema.extend({
  eventId: identifierSchema,
  ageStageId: identifierSchema,
  turnId: identifierSchema,
});

export const gameStateSchema = z
  .object({
    schemaVersion: z.number().int().positive(),
    seed: z.number().int().min(0).max(0xffffffff),
    rngState: z.number().int().min(0).max(0xffffffff),
    currentAgeStageId: identifierSchema,
    currentTurnId: identifierSchema.nullable(),
    turn: turnSchema.nullable(),
    eventProgress: eventProgressSchema.nullable(),
    ageStageProgress: ageStageProgressSchema.optional(),
    completedAgeStages: z.array(completedAgeStageSchema).optional(),
    turnNumber: z.number().int().min(0).optional(),
    eventLastResolvedTurn: z.record(identifierSchema, z.number().int().min(0)).optional(),
    resources: resourceStateSchema,
    planningLoad: z.number().finite().min(0),
    family: familyProfileSchema,
    tendencies: z.record(identifierSchema, z.number().finite()),
    flags: z.array(identifierSchema),
    relationshipMemories: z.array(relationshipMemorySchema),
    completedEventIds: z.array(identifierSchema),
    scheduledFollowUps: z.array(scheduledEventStateSchema),
    choiceHistory: z.array(choiceHistoryEntrySchema),
    reactionHistory: z.array(reactionHistoryEntrySchema).optional(),
    history: z.array(storyEntrySchema),
    review: reviewDataSchema.optional(),
  })
  .strict();

export type ContentPack = z.infer<typeof contentPackSchema>;
export type EventNode = z.infer<typeof eventNodeSchema>;
export type GameState = z.infer<typeof gameStateSchema>;
export type ResourceKey = z.infer<typeof resourceKeySchema>;
export type ReactionPool = z.infer<typeof reactionPoolSchema>;
export type KnowledgeCard = z.infer<typeof knowledgeCardSchema>;
export type ScheduledFollowUp = z.infer<typeof scheduledFollowUpSchema>;
export type Turn = z.infer<typeof turnSchema>;
export type ObservedReaction = z.infer<typeof observedReactionSchema>;
export type NarrativeEffects = z.infer<typeof narrativeEffectsSchema>;
