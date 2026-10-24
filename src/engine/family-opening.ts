import { actorDefinitionSchema, familyProfileSchema, gameStateSchema } from "../domain/schemas.js";
import type { GameState } from "../domain/schemas.js";
import { FAMILY_DIMENSIONS, type FamilyProfile, type FamilyCondition, type FamilyDimension } from "../domain/family-conditions.js";
import { FAMILY_CONDITIONS } from "../content/family-conditions.js";
import { initializePrngState, nextPrng } from "./prng.js";
import type { z } from "zod";
import { describeTendencies, resolveOpeningAssessment, type OpeningAssessment } from "./opening-assessment.js";

export interface FamilyRunInput {
  readonly seed: number;
  readonly preferredAddress?: string;
  readonly firstAgeStageId?: string;
  readonly answers?: readonly string[] | null;
}

export interface FamilySummary {
  readonly text: string;
  readonly conditions: readonly FamilyCondition[];
}

export interface FamilyRun {
  readonly state: GameState;
  readonly actors: readonly z.infer<typeof actorDefinitionSchema>[];
  readonly summary: FamilySummary;
  readonly assessment: OpeningAssessment;
}

export const describeFamily = (family: FamilyProfile): FamilySummary => ({
  text: `你將以「${family.preferredAddress}」的稱呼，開始安排與孩子一起生活的日常。`,
  conditions: FAMILY_DIMENSIONS.map(
    (dimension) => structuredClone(FAMILY_CONDITIONS.find((condition) =>
      condition.dimension === dimension && condition.value === family[dimension])!),
  ),
});

const buildFamilyRun = (input: FamilyRunInput, previousFamily?: FamilyProfile): FamilyRun => {
  const { tendencies, assessment } = resolveOpeningAssessment(input.answers);
  let rngState = initializePrngState(input.seed);
  const draw = (): number => {
    const step = nextPrng(rngState);
    rngState = step.state;
    return step.value;
  };
  const pickDimension = <K extends FamilyDimension>(dimension: K): FamilyProfile[K] => {
    const values = familyProfileSchema.shape[dimension].options;
    return values[Math.floor(draw() * values.length)]! as FamilyProfile[K];
  };
  const householdComposition = pickDimension("householdComposition");
  const careParticipation = pickDimension("careParticipation");
  let workArrangement = pickDimension("workArrangement");
  if (previousFamily && householdComposition === previousFamily.householdComposition &&
      careParticipation === previousFamily.careParticipation && workArrangement === previousFamily.workArrangement) {
    const alternatives = familyProfileSchema.shape.workArrangement.options.filter((value) => value !== workArrangement);
    workArrangement = alternatives[Math.floor(draw() * alternatives.length)]!;
  }
  const supportActors: { id: string; role: "partner" | "grandparent"; displayName: string }[] =
    householdComposition === "singleCaregiver"
      ? [{ id: "support-1", role: "grandparent", displayName: "支持家人（不同住）" }]
      : householdComposition === "twoCaregivers"
        ? [{ id: "caregiver-2", role: "partner", displayName: "共同照顧者" }]
        : [
            { id: "caregiver-2", role: "partner", displayName: "共同照顧者" },
            { id: "support-1", role: "grandparent", displayName: "同住長輩" },
          ];
  const actors = [{ id: "child-1", role: "child" as const, displayName: "孩子" }, ...supportActors]
    .map((actor) => {
      // Fictional participation ranges describe present logistics, not character or virtue.
      const ranges = {
        shared: { min: 0.5, max: 1 }, uneven: { min: 0, max: 0.5 },
        pseudoSingle: { min: 0, max: 0.25 }, primaryAndBackup: { min: 0, max: 0.5 },
      };
      const range = actor.role === "child" ? { min: 0, max: 1 } : ranges[careParticipation];
      const participation = () => range.min + draw() * (range.max - range.min);
      return actorDefinitionSchema.parse({
        ...actor, availability: participation(), initiative: participation(), workflowOwnership: participation(),
        reliability: draw(), boundaryRespect: draw(),
      });
    });
  const state = gameStateSchema.parse({
    schemaVersion: 1, seed: input.seed,
    currentAgeStageId: input.firstAgeStageId ?? "age-stage-1",
    currentTurnId: null, turn: null, eventProgress: null,
    resources: {
      finances: Math.floor(draw() * 61) + 20, energy: Math.floor(draw() * 61) + 20,
      support: Math.floor(draw() * 61) + 20, timeFlexibility: Math.floor(draw() * 61) + 20,
      connection: Math.floor(draw() * 61) + 20,
    },
    rngState, planningLoad: 0,
    family: {
      householdComposition, careParticipation, workArrangement,
      preferredAddress: input.preferredAddress?.trim() ?? "照顧者", childId: "child-1",
      persistentActorIds: supportActors.map((actor) => actor.id),
    },
    tendencies, flags: [], relationshipMemories: [], completedEventIds: [],
    scheduledFollowUps: [], choiceHistory: [], history: [],
  });
  state.replayOrigin = { resources: { ...state.resources }, tendencies: { ...state.tendencies },
    rngState: state.rngState, actors: structuredClone(actors) };
  return { state, actors, summary: describeFamily(state.family), assessment };
};

export const createFamilyRun = (input: FamilyRunInput): FamilyRun => buildFamilyRun(input);

export const rerollFamilyRun = (previous: FamilyRun, input: FamilyRunInput): FamilyRun => {
  if (input.seed === previous.state.seed) throw new Error("reroll requires a new seed");
  const run = buildFamilyRun({
    ...input, preferredAddress: input.preferredAddress ?? previous.state.family.preferredAddress,
  }, previous.state.family);
  if (input.answers !== undefined) return run;
  return {
    ...run,
    state: { ...run.state, tendencies: { ...previous.state.tendencies },
      replayOrigin: { ...run.state.replayOrigin!, tendencies: { ...previous.state.tendencies } } },
    assessment: { status: previous.assessment.status, descriptions: describeTendencies(previous.state.tendencies) },
  };
};
