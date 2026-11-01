import { createMvpContent } from "./mvp.js";
import { toyCarEvents, toyCarPools, TOY_CAR_CHAIN, TOY_CAR_ROOT } from "./toy-car-story.js";
import { parseContentPack } from "../domain/content-validation.js";
import { familyContentKey } from "../domain/content-binding.js";
import type { ContentPack, GameState, Condition } from "../domain/schemas.js";
import type { FamilyRun } from "../engine/family-opening.js";
import { validatePreviewContract } from "./preview-contract.js";

export const PREVIEW_RELEASE = "family-events-08a-v1";
// One private validated catalogue per active identity. Callers always get a copy.
// Checkpoint validation otherwise reparses the same 37 authored nodes on every save.
let cachedPreview: { key: string; content: ContentPack } | undefined;
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

export function createRunContent(state: GameState): ContentPack {
  const actors = state.replayOrigin?.actors;
  if (!state.contentBinding) {
    if (state.schemaVersion !== 1) throw new Error("Missing content binding");
    return createMvpContent(actors);
  }
  const binding = state.contentBinding;
  if (state.schemaVersion !== 2 || binding.releaseId !== PREVIEW_RELEASE || binding.assemblyVersion !== 2 ||
      !actors || !state.actorProfiles || !state.replayOrigin?.actorProfiles ||
      binding.familyKey !== familyContentKey(state.family, actors)) throw new Error("Incompatible content binding");
  const cacheKey = `${binding.familyKey}/${JSON.stringify(actors)}`;
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
  const references = [...state.completedEventIds, ...state.choiceHistory.map(row => row.eventId),
    ...state.scheduledFollowUps.map(row => row.eventId), ...state.history.flatMap(row => row.resolvedEventId ? [row.resolvedEventId] : []),
    ...(state.eventProgress ? [state.eventProgress.eventId] : [])];
  if (references.some(id => !ids.has(id))) throw new Error("Unavailable story reference");
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
  if (state.completedEventIds.includes(TOY_CAR_ROOT) && state.completedEventIds.includes("preschool-handoff-choice"))
    throw new Error("Multiple stage roots");
}
