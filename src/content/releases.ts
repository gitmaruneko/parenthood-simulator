import { createMvpContent } from "./mvp.js";
import { toyCarEvents, toyCarPools, TOY_CAR_CHAIN, TOY_CAR_ROOT } from "./toy-car-story.js";
import { parseContentPack } from "../domain/content-validation.js";
import { familyContentKey } from "../domain/content-binding.js";
import type { ContentPack, GameState, Condition } from "../domain/schemas.js";
import type { FamilyRun } from "../engine/family-opening.js";
import { validatePreviewContract } from "./preview-contract.js";
import { NARRATIVE_RELEASE, NARRATIVE_EVENT_REPLACEMENTS, NIGHT, DOOR, narrativeA1Events, narrativeA1Pools } from "./narrative-a1.js";
import { NARRATIVE_A2_RELEASE, NARRATIVE_A2_REPLACEMENTS, A2_STORIES, a2Root, a2Reflection, narrativeA2Events, narrativeA2Pools } from "./narrative-a2.js";

export const PREVIEW_RELEASE = "family-events-08a-v1";
// One private validated catalogue per active identity. Callers always get a copy.
// Checkpoint validation otherwise reparses the same 37 authored nodes on every save.
let cachedPreview: { key: string; content: ContentPack } | undefined;
let cachedNarrative: { key: string; content: ContentPack } | undefined;
let cachedNarrativeA2: { key: string; content: ContentPack } | undefined;
export const isSupportedRelease = (releaseId: string, assemblyVersion: number) =>
  [PREVIEW_RELEASE, NARRATIVE_RELEASE, NARRATIVE_A2_RELEASE].includes(releaseId) && assemblyVersion === 2;
export interface FamilyEntryRule {
  eventId: string;
  householdComposition?: readonly GameState["family"]["householdComposition"][];
  careParticipation?: readonly GameState["family"]["careParticipation"][];
  workArrangement?: readonly GameState["family"]["workArrangement"][];
  requiredActorIds?: readonly string[];
}

// Authoring boundary, deliberately separate from engine Conditions and selection.
export function assembleFamilyEntries(authored: ContentPack, family: GameState["family"], rules: readonly FamilyEntryRule[]): ContentPack {
  const allowed = (id: string) => rules.filter(rule => rule.eventId === id).every(rule =>
    (!rule.householdComposition || rule.householdComposition.includes(family.householdComposition)) &&
    (!rule.careParticipation || rule.careParticipation.includes(family.careParticipation)) &&
    (!rule.workArrangement || rule.workArrangement.includes(family.workArrangement)) &&
    (!rule.requiredActorIds || rule.requiredActorIds.every(actorId =>
      actorId === family.childId || family.persistentActorIds.includes(actorId))));
  const ageStages = [...authored.ageStages].sort((a,b) => a.order-b.order).map(stage => ({ ...stage,
    entryEventIds: stage.entryEventIds.filter(allowed).sort() }));
  const entryEventIds = [...new Set(ageStages.flatMap(stage => stage.entryEventIds).concat(authored.fallbackEventId))].sort();
  const reachable = new Set(entryEventIds);
  for (const id of reachable) {
    const event = authored.events.find(event => event.id === id)!;
    const sources = [event, ...event.choices];
    const next = sources.flatMap(source => [...source.immediateFollowUpEventIds, ...source.scheduledFollowUps.map(item => item.eventId)]);
    for (const poolId of event.reactionPoolIds) {
      for (const reaction of authored.reactionPools.find(pool => pool.id === poolId)!.entries)
        next.push(...reaction.followUpEventIds, ...(reaction.scheduledFollowUps ?? []).map(item => item.eventId));
    }
    next.forEach(id => reachable.add(id));
  }
  return parseContentPack({ ...authored, ageStages, entryEventIds, requiredEventIds: [...reachable].sort() });
}

export function bindPreviewRun(run: FamilyRun): FamilyRun {
  return { ...run, state: { ...run.state, schemaVersion: 2, contentBinding: {
    releaseId: PREVIEW_RELEASE, assemblyVersion: 2, familyKey: familyContentKey(run.state.family, [...run.actors]),
  } } };
}

export function bindNarrativeRun(run: FamilyRun): FamilyRun {
  const bound = bindPreviewRun(run);
  bound.state.contentBinding!.releaseId = NARRATIVE_RELEASE;
  return bound;
}

export function bindNarrativeA2Run(run: FamilyRun): FamilyRun {
  const bound = bindPreviewRun(run);
  bound.state.contentBinding!.releaseId = NARRATIVE_A2_RELEASE;
  return bound;
}

export function createRunContent(state: GameState): ContentPack {
  const actors = state.replayOrigin?.actors;
  if (!state.contentBinding) {
    if (state.schemaVersion !== 1) throw new Error("Missing content binding");
    return createMvpContent(actors);
  }
  const binding = state.contentBinding;
  if (state.schemaVersion !== 2 || !isSupportedRelease(binding.releaseId, binding.assemblyVersion) ||
      !actors || !state.actorProfiles || !state.replayOrigin?.actorProfiles ||
      binding.familyKey !== familyContentKey(state.family, actors)) throw new Error("Incompatible content binding");
  const cacheKey = `${binding.familyKey}/${JSON.stringify(actors)}`;
  if (binding.releaseId === NARRATIVE_A2_RELEASE) {
    if (cachedNarrativeA2?.key === cacheKey) return structuredClone(cachedNarrativeA2.content);
    const original = createRunContent({ ...state, contentBinding: { ...binding, releaseId: NARRATIVE_RELEASE } });
    const replace = (id: string) => NARRATIVE_A2_REPLACEMENTS[id] ?? id;
    const events = [...original.events.filter(event => !NARRATIVE_A2_REPLACEMENTS[event.id]), ...narrativeA2Events()];
    const authored = parseContentPack({ ...original, events,
      ageStages: original.ageStages.map(stage => ({ ...stage, entryEventIds: stage.entryEventIds.map(replace).sort() })),
      entryEventIds: original.entryEventIds.map(replace).sort(), requiredEventIds: events.map(event => event.id),
      reactionPools: [...original.reactionPools, ...narrativeA2Pools()] });
    const assembled = assembleFamilyEntries(authored, state.family, []);
    cachedNarrativeA2 = { key: cacheKey, content: assembled };
    return structuredClone(assembled);
  }
  if (binding.releaseId === NARRATIVE_RELEASE) {
    if (cachedNarrative?.key === cacheKey) return structuredClone(cachedNarrative.content);
    const original = createRunContent({ ...state, contentBinding: { ...binding, releaseId: PREVIEW_RELEASE } });
    const replacements = new Map(Object.entries(NARRATIVE_EVENT_REPLACEMENTS));
    const ageStages = original.ageStages.map(stage => ({ ...stage, entryEventIds: stage.entryEventIds.map(id => replacements.get(id) ?? id).sort() }));
    const roots = ageStages.find(stage => stage.id === "age-stage-8")!.entryEventIds;
    const events = [...original.events.filter(event => !replacements.has(event.id)), ...narrativeA1Events()].map(event => {
      if (!roots.includes(event.id)) return event;
      // Rebuild the root exclusion against this release's IDs, including unchanged 08A.
      const base = event.id === TOY_CAR_ROOT ? toyCarEvents()[0]!.eligibility : event.eligibility;
      return { ...event, eligibility: { kind: "all", conditions: [base,
        ...roots.filter(id => id !== event.id).map(eventId => ({ kind: "eventNotCompleted", eventId } as Condition))] } as Condition };
    });
    const authored = parseContentPack({ ...original, ageStages, events,
      entryEventIds: original.entryEventIds.map(id => replacements.get(id) ?? id).sort(),
      requiredEventIds: events.map(event => event.id), reactionPools: [...original.reactionPools, ...narrativeA1Pools()] });
    const assembled = assembleFamilyEntries(authored, state.family, []);
    cachedNarrative = { key: cacheKey, content: assembled };
    return structuredClone(assembled);
  }
  if (cachedPreview?.key === cacheKey) return structuredClone(cachedPreview.content);
  const legacy = createMvpContent(actors);
  const ageStages = legacy.ageStages.map(stage => stage.id === "age-stage-8"
    ? { ...stage, entryEventIds: [...stage.entryEventIds, TOY_CAR_ROOT].sort() } : stage);
  const roots = ageStages[7]!.entryEventIds;
  const events = [...legacy.events, ...toyCarEvents()].map(event => roots.includes(event.id)
    ? { ...event, eligibility: { kind: "all", conditions: [event.eligibility,
      ...roots.filter(id => id !== event.id).map(eventId => ({ kind: "eventNotCompleted", eventId } as Condition))] } as Condition }
    : event);
  const authored = parseContentPack({ ...legacy, schemaVersion: 2, ageStages, events,
    entryEventIds: [...legacy.entryEventIds, TOY_CAR_ROOT].sort(),
    requiredEventIds: events.map(event => event.id), reactionPools: [...legacy.reactionPools, ...toyCarPools()] });
  validatePreviewContract(authored);
  const assembled = assembleFamilyEntries(authored, state.family, []);
  cachedPreview = { key: cacheKey, content: assembled };
  return structuredClone(assembled);
}

// A saved checkpoint must retain the outstanding edge, never silently rebuild it.
export function validatePreviewProgress(state: GameState, content: ContentPack): void {
  const ids = new Set(content.events.map(event => event.id));
  const stages = new Set(content.ageStages.map(stage => stage.id));
  const stageReferences = [state.currentAgeStageId, ...state.history.map(row => row.ageStageId),
    ...state.choiceHistory.map(row => row.ageStageId), ...(state.reactionHistory ?? []).map(row => row.ageStageId),
    ...state.scheduledFollowUps.map(row => row.targetAgeStageId), ...(state.completedAgeStages ?? []).map(row => row.ageStageId)];
  if (stageReferences.some(id => !stages.has(id))) throw new Error("Unavailable stage reference");
  const references = [...state.completedEventIds, ...state.choiceHistory.map(row => row.eventId),
    ...(state.reactionHistory ?? []).map(row => row.eventId), ...(state.turn?.processedEventIds ?? []),
    ...state.scheduledFollowUps.map(row => row.eventId), ...state.history.flatMap(row => row.resolvedEventId ? [row.resolvedEventId] : []),
    ...(state.eventProgress ? [state.eventProgress.eventId] : [])];
  if (references.some(id => !ids.has(id))) throw new Error("Unavailable story reference");
  const anchors = state.history.filter(row => row.resolvedEventId !== undefined);
  if (state.eventProgress && state.eventProgress.eventId !== content.fallbackEventId &&
      content.events.find(event => event.id === state.eventProgress!.eventId)!.ageStageId !== state.currentAgeStageId)
    throw new Error("Pending event belongs to another stage");
  if (state.turn && state.turn.nodeCount !== anchors.filter(row => row.turnId === state.currentTurnId).length ||
      state.ageStageProgress && state.ageStageProgress.nodeCount !== anchors.filter(row => row.ageStageId === state.currentAgeStageId).length ||
      state.completedAgeStages?.some(stage => stage.nodeCount !== anchors.filter(row => row.ageStageId === stage.ageStageId).length))
    throw new Error("Inconsistent resolved node counts");
  const resolvedIds = new Set(anchors.map(row => row.resolvedEventId!));
  if (new Set(state.completedEventIds).size !== state.completedEventIds.length || resolvedIds.size !== state.completedEventIds.length ||
      state.completedEventIds.some(id => !resolvedIds.has(id))) throw new Error("Inconsistent completed events and history");
  for (const anchor of anchors) {
    const event = content.events.find(event => event.id === anchor.resolvedEventId)!;
    if (event.id !== content.fallbackEventId && event.ageStageId !== anchor.ageStageId) throw new Error("Wrong event stage");
    if (event.kind === "choice" && state.choiceHistory.filter(choice => choice.eventId === event.id &&
        choice.turnId === anchor.turnId && choice.ageStageId === anchor.ageStageId).length !== 1)
      throw new Error("Missing resolved choice");
  }
  for (const choice of state.choiceHistory) {
    if (anchors.filter(row => row.resolvedEventId === choice.eventId && row.turnId === choice.turnId && row.ageStageId === choice.ageStageId).length !== 1 ||
        !content.events.find(event => event.id === choice.eventId)!.choices.some(option => option.id === choice.choiceId))
      throw new Error("Choice without matching event occurrence");
  }
  for (const scheduled of state.scheduledFollowUps) {
    if (content.events.find(event => event.id === scheduled.eventId)!.ageStageId !== scheduled.targetAgeStageId)
      throw new Error("Wrong scheduled stage");
  }
  const check = (path: readonly string[], crossesTurn = true) => {
    if (!state.completedEventIds.includes(path[0]!)) return;
    for (let i = 1; i < path.length; i++) {
      if (state.completedEventIds.includes(path[i]!)) continue;
      const stage = content.events.find(event => event.id === path[0])!.ageStageId;
      if (state.currentAgeStageId !== stage || state.completedAgeStages?.some(item => item.ageStageId === stage) ||
          (state.currentAgeStageId === stage && state.ageStageProgress?.status !== "active"))
        throw new Error("Incomplete guaranteed chain");
      const queued = state.scheduledFollowUps.some(item => item.eventId === path[i] && item.status === "pending" &&
        item.targetAgeStageId === stage && item.condition === undefined &&
        (i === 1 && crossesTurn ? item.immediateTurnId === undefined && item.dueAfterTurns === 1
          : item.immediateTurnId === state.currentTurnId && item.dueAfterTurns === (state.ageStageProgress?.turnCount ?? 1) - 1));
      const awaiting = state.turn?.status === "awaitingInput" && state.turn.activeEventId === path[i];
      if (!queued && !awaiting) throw new Error("Missing guaranteed continuation");
      return;
    }
  };
  check(TOY_CAR_CHAIN);
  check(["shared-ownership-choice", "shared-ownership-reflection"], false);
  for (const prefix of ["night-handoff", "preschool-handoff"]) {
    const choice = state.choiceHistory.find(row => row.eventId === `${prefix}-choice`);
    if (choice) {
      check([`${prefix}-choice`, `${prefix}-reflection`], false);
      check([`${prefix}-choice`, `${prefix}-${choice.choiceId === "carry" ? "strain" : "support"}`, `${prefix}-reconnect`, `${prefix}-repair`]);
    }
  }
  if ([NARRATIVE_RELEASE, NARRATIVE_A2_RELEASE].includes(state.contentBinding?.releaseId ?? "")) {
    for (const chain of [NIGHT, DOOR]) {
      const choice = state.choiceHistory.find(row => row.eventId === chain.root);
      if (!choice) continue;
      const root = content.events.find(event => event.id === chain.root)!;
      const selected = root.choices.find(option => option.id === choice.choiceId)!;
      if (selected.setFlags.some(flag => !state.flags.includes(flag)) ||
          root.choices.filter(option => option !== selected).some(option => option.setFlags.some(flag => state.flags.includes(flag))))
        throw new Error("Inconsistent story branch flags");
      const branch = selected.scheduledFollowUps[0]!.eventId;
      const other = branch === chain.strain ? chain.support : chain.strain;
      if (state.completedEventIds.includes(other) || state.scheduledFollowUps.some(row => row.eventId === other))
        throw new Error("Wrong story branch");
      check([chain.root, chain.reflection], false);
      check([chain.root, branch, chain.later, chain.close]);
    }
    if (state.completedEventIds.includes(TOY_CAR_ROOT) && state.completedEventIds.includes(DOOR.root))
      throw new Error("Multiple stage roots");
  }
  if (state.contentBinding?.releaseId === NARRATIVE_A2_RELEASE) {
    for (const story of A2_STORIES) {
      const choice = state.choiceHistory.find(row => row.eventId === a2Root(story.key));
      if (!choice) continue;
      if (!state.flags.includes(choice.choiceId) || story.choices.some(id => id !== choice.choiceId && state.flags.includes(id)))
        throw new Error("Inconsistent daily story flags");
      check([a2Root(story.key), a2Reflection(story.key)], false);
    }
  }
  if (state.completedEventIds.includes(TOY_CAR_ROOT) && state.completedEventIds.includes("preschool-handoff-choice"))
    throw new Error("Multiple stage roots");
}
