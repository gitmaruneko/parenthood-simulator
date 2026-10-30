import { z } from "zod";

import {
  contentPackSchema,
  type Condition,
  type ContentPack,
  type EventNode,
  type ReactionPool,
  type ScheduledFollowUp,
  type NarrativeEffects,
} from "./schemas.js";

export const contentValidationIssueCodeSchema = z.enum([
  "SCHEMA_INVALID",
  "DUPLICATE_ID",
  "MISSING_REFERENCE",
  "INVALID_WEIGHT",
  "EMPTY_REACTION_POOL",
  "INVALID_AGE_STAGE",
  "INVALID_FALLBACK",
  "UNREACHABLE_REQUIRED_EVENT",
  "CYCLE_WITHOUT_TERMINATION_GUARD",
]);

export type ContentValidationIssueCode = z.infer<typeof contentValidationIssueCodeSchema>;

export interface ContentValidationIssue {
  code: ContentValidationIssueCode;
  path: string;
  message: string;
}

export type ContentValidationResult =
  | { success: true; data: ContentPack; issues: [] }
  | { success: false; issues: ContentValidationIssue[] };

const pathOf = (path: readonly (string | number)[]): string =>
  path.length === 0
    ? "$"
    : path.reduce<string>(
        (result, part) =>
          typeof part === "number" ? `${result}[${part}]` : result.length === 0 ? part : `${result}.${part}`,
        "",
      );

const addIssue = (
  issues: ContentValidationIssue[],
  code: ContentValidationIssueCode,
  path: string,
  message: string,
): void => {
  issues.push({ code, path, message });
};

const collectIds = (
  values: readonly { id: string }[],
  collectionName: string,
  issues: ContentValidationIssue[],
): Map<string, number> => {
  const occurrences = new Map<string, number>();
  values.forEach((value, index) => {
    const count = (occurrences.get(value.id) ?? 0) + 1;
    occurrences.set(value.id, count);
    if (count > 1) {
      addIssue(
        issues,
        "DUPLICATE_ID",
        `${collectionName}[${index}].id`,
        `duplicate ${collectionName} id: ${value.id}`,
      );
    }
  });
  return occurrences;
};

const checkReference = (
  id: string,
  collection: ReadonlyMap<string, number>,
  path: string,
  label: string,
  issues: ContentValidationIssue[],
): void => {
  if (!collection.has(id)) {
    addIssue(issues, "MISSING_REFERENCE", path, `${label} does not exist: ${id}`);
  }
};

const validateMemoryActors = (
  effects: NarrativeEffects, path: string, actorIds: ReadonlyMap<string, number>, issues: ContentValidationIssue[],
): void => {
  effects.relationshipMemories?.forEach((memory, index) => {
    if (memory.actorId) checkReference(memory.actorId, actorIds,
      `${path}.relationshipMemories[${index}].actorId`, "memory actor", issues);
  });
  effects.storyEntries?.forEach((entry, index) => {
    if (entry.actorText) checkReference(entry.actorText.actorId, actorIds,
      `${path}.storyEntries[${index}].actorText.actorId`, "story actor", issues);
  });
};

const visitCondition = (
  condition: Condition,
  path: string,
  eventIds: ReadonlyMap<string, number>,
  actorIds: ReadonlyMap<string, number>,
  issues: ContentValidationIssue[],
): void => {
  switch (condition.kind) {
    case "eventCompleted":
    case "eventNotCompleted":
    case "recentEvent":
      checkReference(condition.eventId, eventIds, `${path}.eventId`, "event reference", issues);
      return;
    case "actorAvailable":
      checkReference(condition.actorId, actorIds, `${path}.actorId`, "actor reference", issues);
      return;
    case "all":
    case "any":
      condition.conditions.forEach((nested, index) =>
        visitCondition(nested, `${path}.conditions[${index}]`, eventIds, actorIds, issues),
      );
      return;
    case "not":
      visitCondition(condition.condition, `${path}.condition`, eventIds, actorIds, issues);
      return;
    case "always":
    case "flag":
    case "resourceAtLeast":
    case "resourceAtMost":
    case "planningLoadAtLeast":
    case "planningLoadAtMost":
    case "tendencyAtLeast":
    case "tendencyAtMost":
    case "location":
    case "contextTag":
    case "relationshipMemory":
      return;
  }
};

const addEventReferenceEdges = (
  event: EventNode,
  adjacency: Map<string, Set<string>>,
  eventIds: ReadonlyMap<string, number>,
  reactionPools: ReadonlyMap<string, ReactionPool>,
): void => {
  const edges = adjacency.get(event.id);
  if (!edges) {
    return;
  }
  const add = (targetId: string): void => {
    if (eventIds.has(targetId)) {
      edges.add(targetId);
    }
  };
  event.immediateFollowUpEventIds.forEach(add);
  event.scheduledFollowUps.forEach((followUp) => add(followUp.eventId));
  event.choices.forEach((choice) => {
    choice.immediateFollowUpEventIds.forEach(add);
    choice.scheduledFollowUps.forEach((followUp) => add(followUp.eventId));
  });
  event.reactionPoolIds.forEach((poolId) => {
    reactionPools.get(poolId)?.entries.forEach((entry) => {
      entry.followUpEventIds.forEach(add);
      entry.scheduledFollowUps?.forEach((followUp) => add(followUp.eventId));
    });
  });
};

const validateScheduledFollowUp = (
  followUp: ScheduledFollowUp,
  path: string,
  sourceAgeStageId: string,
  ageStageIds: ReadonlyMap<string, number>,
  ageStageOrder: ReadonlyMap<string, number>,
  eventIds: ReadonlyMap<string, number>,
  actorIds: ReadonlyMap<string, number>,
  issues: ContentValidationIssue[],
): void => {
  checkReference(followUp.eventId, eventIds, `${path}.eventId`, "scheduled event", issues);
  if (followUp.targetAgeStageId) {
    checkReference(followUp.targetAgeStageId, ageStageIds, `${path}.targetAgeStageId`, "target age-stage", issues);
    const targetOrder = ageStageOrder.get(followUp.targetAgeStageId);
    const sourceOrder = ageStageOrder.get(sourceAgeStageId);
    if (targetOrder !== undefined && sourceOrder !== undefined && targetOrder < sourceOrder) {
      addIssue(
        issues,
        "INVALID_AGE_STAGE",
        `${path}.targetAgeStageId`,
        "scheduled follow-up cannot target an earlier age stage",
      );
    }
  }
  if (followUp.condition) {
    visitCondition(followUp.condition, `${path}.condition`, eventIds, actorIds, issues);
  }
};

const stronglyConnectedComponents = (adjacency: ReadonlyMap<string, ReadonlySet<string>>): string[][] => {
  let nextIndex = 0;
  const indices = new Map<string, number>();
  const lowLinks = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const components: string[][] = [];

  const connect = (nodeId: string): void => {
    indices.set(nodeId, nextIndex);
    lowLinks.set(nodeId, nextIndex);
    nextIndex += 1;
    stack.push(nodeId);
    onStack.add(nodeId);

    for (const targetId of adjacency.get(nodeId) ?? []) {
      if (!indices.has(targetId)) {
        connect(targetId);
        lowLinks.set(nodeId, Math.min(lowLinks.get(nodeId) ?? 0, lowLinks.get(targetId) ?? 0));
      } else if (onStack.has(targetId)) {
        lowLinks.set(nodeId, Math.min(lowLinks.get(nodeId) ?? 0, indices.get(targetId) ?? 0));
      }
    }

    if (lowLinks.get(nodeId) === indices.get(nodeId)) {
      const component: string[] = [];
      let member = stack.pop();
      while (member !== undefined) {
        onStack.delete(member);
        component.push(member);
        if (member === nodeId) {
          break;
        }
        member = stack.pop();
      }
      components.push(component);
    }
  };

  for (const nodeId of adjacency.keys()) {
    if (!indices.has(nodeId)) {
      connect(nodeId);
    }
  }
  return components;
};

const validateCrossReferences = (content: ContentPack): ContentValidationIssue[] => {
  const issues: ContentValidationIssue[] = [];
  const ageStageIds = collectIds(content.ageStages, "ageStages", issues);
  const eventIds = collectIds(content.events, "events", issues);
  const actorIds = collectIds(content.actors, "actors", issues);
  const reactionPoolIds = collectIds(content.reactionPools, "reactionPools", issues);
  const knowledgeCardIds = collectIds(content.knowledgeCards, "knowledgeCards", issues);
  const reactionPools = new Map(content.reactionPools.map((pool) => [pool.id, pool]));
  const ageStageOrder = new Map(content.ageStages.map((stage) => [stage.id, stage.order]));

  const expectedStages = content.ageStages.every(
    (stage, index) => stage.order === index && stage.childAgeMonths >= (content.ageStages[index - 1]?.childAgeMonths ?? 0),
  );
  if (!expectedStages) {
    addIssue(
      issues,
      "INVALID_AGE_STAGE",
      "ageStages",
      "age stages must have unique sequential order and non-decreasing child age",
    );
  }

  content.entryEventIds.forEach((eventId, index) =>
    checkReference(eventId, eventIds, `entryEventIds[${index}]`, "entry event", issues),
  );
  checkReference(content.fallbackEventId, eventIds, "fallbackEventId", "fallback event", issues);
  const fallbackEvent = content.events.find((event) => event.id === content.fallbackEventId);
  if (fallbackEvent && (fallbackEvent.kind === "choice" || fallbackEvent.mode !== "AUTO_ADVANCE" || fallbackEvent.choices.length > 0)) {
    addIssue(
      issues,
      "INVALID_FALLBACK",
      "fallbackEventId",
      "fallback event must be a choice-free AUTO_ADVANCE node",
    );
  }
  content.requiredEventIds.forEach((eventId, index) =>
    checkReference(eventId, eventIds, `requiredEventIds[${index}]`, "required event", issues),
  );

  content.ageStages.forEach((stage, stageIndex) => {
    stage.entryEventIds.forEach((eventId, eventIndex) => {
      checkReference(
        eventId,
        eventIds,
        `ageStages[${stageIndex}].entryEventIds[${eventIndex}]`,
        "age-stage entry event",
        issues,
      );
      const entryEvent = content.events.find((event) => event.id === eventId);
      if (entryEvent && entryEvent.ageStageId !== stage.id) {
        addIssue(
          issues,
          "INVALID_AGE_STAGE",
          `ageStages[${stageIndex}].entryEventIds[${eventIndex}]`,
          `entry event ${eventId} belongs to ${entryEvent.ageStageId}, not ${stage.id}`,
        );
      }
    });
  });

  const adjacency = new Map<string, Set<string>>(
    content.events.map((event) => [event.id, new Set<string>()]),
  );

  content.events.forEach((event, eventIndex) => {
    if (event.journalContext?.actorText) checkReference(event.journalContext.actorText.actorId, actorIds,
      `events[${eventIndex}].journalContext.actorText.actorId`, "journal context actor", issues);
    for (const [index, item] of [event, ...event.choices].entries()) {
      if (item.actorText) checkReference(item.actorText.actorId, actorIds,
        `events[${eventIndex}].identity[${index}]`, "text actor", issues);
    }
    validateMemoryActors(event, `events[${eventIndex}]`, actorIds, issues);
    checkReference(event.ageStageId, ageStageIds, `events[${eventIndex}].ageStageId`, "age-stage reference", issues);
    event.actorIds.forEach((actorId, actorIndex) =>
      checkReference(actorId, actorIds, `events[${eventIndex}].actorIds[${actorIndex}]`, "actor reference", issues),
    );
    event.reactionPoolIds.forEach((poolId, poolIndex) =>
      checkReference(
        poolId,
        reactionPoolIds,
        `events[${eventIndex}].reactionPoolIds[${poolIndex}]`,
        "reaction-pool reference",
        issues,
      ),
    );
    event.knowledgeCardIds.forEach((cardId, cardIndex) =>
      checkReference(
        cardId,
        knowledgeCardIds,
        `events[${eventIndex}].knowledgeCardIds[${cardIndex}]`,
        "knowledge-card reference",
        issues,
      ),
    );
    visitCondition(event.eligibility, `events[${eventIndex}].eligibility`, eventIds, actorIds, issues);
    addEventReferenceEdges(event, adjacency, eventIds, reactionPools);

    event.scheduledFollowUps.forEach((followUp, followUpIndex) =>
      validateScheduledFollowUp(
        followUp,
        `events[${eventIndex}].scheduledFollowUps[${followUpIndex}]`,
        event.ageStageId,
        ageStageIds,
        ageStageOrder,
        eventIds,
        actorIds,
        issues,
      ),
    );
    if (event.terminationGuard?.kind === "condition") {
      visitCondition(
        event.terminationGuard.condition,
        `events[${eventIndex}].terminationGuard.condition`,
        eventIds,
        actorIds,
        issues,
      );
    }

    event.choices.forEach((choice, choiceIndex) => {
      validateMemoryActors(choice, `events[${eventIndex}].choices[${choiceIndex}]`, actorIds, issues);
      choice.knowledgeCardIds.forEach((cardId, cardIdIndex) =>
        checkReference(
          cardId,
          knowledgeCardIds,
          `events[${eventIndex}].choices[${choiceIndex}].knowledgeCardIds[${cardIdIndex}]`,
          "knowledge-card reference",
          issues,
        ),
      );
      if (choice.requirements) {
        visitCondition(
          choice.requirements,
          `events[${eventIndex}].choices[${choiceIndex}].requirements`,
          eventIds,
          actorIds,
          issues,
        );
      }
      choice.immediateFollowUpEventIds.forEach((eventId, followUpIndex) =>
        checkReference(
          eventId,
          eventIds,
          `events[${eventIndex}].choices[${choiceIndex}].immediateFollowUpEventIds[${followUpIndex}]`,
          "follow-up event",
          issues,
        ),
      );
      choice.scheduledFollowUps.forEach((followUp, followUpIndex) =>
        validateScheduledFollowUp(
          followUp,
          `events[${eventIndex}].choices[${choiceIndex}].scheduledFollowUps[${followUpIndex}]`,
          event.ageStageId,
          ageStageIds,
          ageStageOrder,
          eventIds,
          actorIds,
          issues,
        ),
      );
    });
  });

  content.reactionPools.forEach((pool, poolIndex) => {
    collectIds(pool.entries, `reactionPools[${poolIndex}].entries`, issues);
    if (pool.entries.length === 0) {
      addIssue(issues, "EMPTY_REACTION_POOL", `reactionPools[${poolIndex}].entries`, "reaction pool must not be empty");
    }
    pool.entries.forEach((entry, entryIndex) => {
      const entryPath = `reactionPools[${poolIndex}].entries[${entryIndex}]`;
      entry.storyEntries?.forEach((story, index) => {
        if (story.actorText) checkReference(story.actorText.actorId, actorIds,
          `${entryPath}.storyEntries[${index}].actorText.actorId`, "reaction story actor", issues);
      });
      entry.weightModifiers?.forEach((modifier, index) =>
        visitCondition(modifier.condition, `${entryPath}.weightModifiers[${index}].condition`, eventIds, actorIds, issues));
      entry.scheduledFollowUps?.forEach((followUp, index) => {
        const users = content.events.filter((event) => event.reactionPoolIds.includes(pool.id));
        const sourceStages = new Set(users.map((event) => event.ageStageId));
        if (!sourceStages.size) sourceStages.add(content.ageStages[0]!.id);
        sourceStages.forEach((sourceStage) => validateScheduledFollowUp(followUp,
          `${entryPath}.scheduledFollowUps[${index}]`, sourceStage,
          ageStageIds, ageStageOrder, eventIds, actorIds, issues));
      });
      if (!Number.isFinite(entry.weight) || entry.weight <= 0) {
        addIssue(
          issues,
          "INVALID_WEIGHT",
          `reactionPools[${poolIndex}].entries[${entryIndex}].weight`,
          "reaction weight must be a finite positive number",
        );
      }
      entry.followUpEventIds.forEach((eventId, followUpIndex) =>
        checkReference(
          eventId,
          eventIds,
          `reactionPools[${poolIndex}].entries[${entryIndex}].followUpEventIds[${followUpIndex}]`,
          "reaction follow-up event",
          issues,
        ),
      );
      if (entry.requirements) {
        visitCondition(
          entry.requirements,
          `reactionPools[${poolIndex}].entries[${entryIndex}].requirements`,
          eventIds,
          actorIds,
          issues,
        );
      }
    });
  });

  const reachable = new Set<string>();
  const reachabilityRoots = [
    ...content.entryEventIds,
    ...content.ageStages.flatMap((stage) => stage.entryEventIds),
  ];
  const queue = [...reachabilityRoots.filter((eventId) => eventIds.has(eventId))];
  while (queue.length > 0) {
    const eventId = queue.shift();
    if (!eventId || reachable.has(eventId)) {
      continue;
    }
    reachable.add(eventId);
    for (const nextEventId of adjacency.get(eventId) ?? []) {
      if (!reachable.has(nextEventId)) {
        queue.push(nextEventId);
      }
    }
  }
  content.requiredEventIds.forEach((eventId, index) => {
    if (eventIds.has(eventId) && !reachable.has(eventId)) {
      addIssue(
        issues,
        "UNREACHABLE_REQUIRED_EVENT",
        `requiredEventIds[${index}]`,
        `required event is not reachable from configured entry events: ${eventId}`,
      );
    }
  });

  for (const component of stronglyConnectedComponents(adjacency)) {
    const hasSelfLoop = component.length === 1 && adjacency.get(component[0] ?? "")?.has(component[0] ?? "");
    if (component.length > 1 || hasSelfLoop) {
      const guarded = component.some(
        (eventId) => content.events.find((event) => event.id === eventId)?.terminationGuard?.kind === "maxVisits",
      );
      if (!guarded) {
        addIssue(
          issues,
          "CYCLE_WITHOUT_TERMINATION_GUARD",
          "events",
          `cycle requires a maxVisits termination guard: ${component.join(" -> ")}`,
        );
      }
    }
  }

  return issues;
};

export const validateContentPack = (input: unknown): ContentValidationResult => {
  const parsed = contentPackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      issues: parsed.error.issues.map((issue) => ({
        code: "SCHEMA_INVALID",
        path: pathOf(issue.path),
        message: issue.message,
      })),
    };
  }

  const issues = validateCrossReferences(parsed.data);
  if (issues.length > 0) {
    return { success: false, issues };
  }
  return { success: true, data: parsed.data, issues: [] };
};

export class ContentValidationError extends Error {
  public readonly issues: readonly ContentValidationIssue[];

  public constructor(issues: readonly ContentValidationIssue[]) {
    super(`content validation failed with ${issues.length} issue(s)`);
    this.name = "ContentValidationError";
    this.issues = issues;
  }
}

export const parseContentPack = (input: unknown): ContentPack => {
  const result = validateContentPack(input);
  if (!result.success) {
    throw new ContentValidationError(result.issues);
  }
  return result.data;
};
