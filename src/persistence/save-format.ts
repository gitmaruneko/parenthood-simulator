import { z } from "zod";
import { gameStateSchema, storyEntrySchema, type GameState } from "../domain/schemas.js";
import { validateJournal } from "../domain/journal-validation.js";
import { familyLifeDirectionIdSchema } from "../domain/family-life-direction.js";
import { actorProfilesSchema, legacyActorProfilesSchema, unknownActorProfiles, validateActorProfiles } from "../domain/actor-profiles.js";

export const SAVE_SCHEMA_VERSION = 6;

export type SaveErrorCode = "invalid-data" | "incompatible-version" | "storage-unavailable"
  | "storage-full" | "save-changed" | "recovery-required";

export interface SaveError {
  readonly code: SaveErrorCode;
  readonly message: string;
}

export type RestoreResult =
  | { readonly status: "restored"; readonly state: GameState; readonly rawData: string;
      readonly migratedFrom: 1 | 2 | 3 | 4 | 5 | null }
  | { readonly status: "error"; readonly error: SaveError; readonly rawData: string };

const stateContract = gameStateSchema.extend({ schemaVersion: z.literal(1) });
const validateSavedState = (state: GameState, ctx: z.RefinementCtx) => {
  validateActorProfiles(state, ctx);
  if (state.currentTurnId !== (state.turn?.id ?? null) ||
      (state.turn && state.turn.ageStageId !== state.currentAgeStageId) ||
      (state.ageStageProgress && state.ageStageProgress.ageStageId !== state.currentAgeStageId) ||
      (state.eventProgress && (state.eventProgress.turnId !== state.currentTurnId ||
        state.eventProgress.ageStageId !== state.currentAgeStageId))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "inconsistent story progress" });
  }
  if (state.turn && state.turn.nodeCount !== state.turn.processedEventIds.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "inconsistent resolved node count" });
  }
  const pendingInput = state.turn?.status === "awaitingInput" ||
    state.eventProgress?.status === "awaitingInput" || state.turn?.activeEventId != null;
  if (pendingInput && (state.turn?.status !== "awaitingInput" || !state.turn.activeEventId ||
      state.eventProgress?.status !== "awaitingInput" ||
      state.eventProgress.eventId !== state.turn.activeEventId ||
      state.eventProgress.nodeIndex !== state.turn.nodeCount)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "inconsistent pending player input" });
  }
};
const savedStateSchema = stateContract.extend({
  actorProfiles: actorProfilesSchema,
  activeFamilyLifeDirectionId: familyLifeDirectionIdSchema,
}).superRefine((state, ctx) => { validateSavedState(state, ctx); validateJournal(state, ctx); });
// All older formats strictly forbid journal fields, including inside old history rows.
const oldStateContract = stateContract.extend({ history: z.array(storyEntrySchema.omit({ journal: true })) });
const v5StateSchema = oldStateContract.extend({
  actorProfiles: actorProfilesSchema,
  activeFamilyLifeDirectionId: familyLifeDirectionIdSchema,
}).superRefine(validateSavedState);
const v4StateSchema = oldStateContract.extend({
  actorProfiles: legacyActorProfilesSchema,
  replayOrigin: stateContract.shape.replayOrigin.unwrap().extend({
    actorProfiles: legacyActorProfilesSchema.optional(),
  }).optional(),
  activeFamilyLifeDirectionId: familyLifeDirectionIdSchema,
}).superRefine(validateSavedState);

const saveSchema = z.object({
  schemaVersion: z.literal(SAVE_SCHEMA_VERSION),
  state: savedStateSchema,
}).strict();

// Version 1 is the original, unwrapped GameState contract. No PRNG or
// lifecycle defaults are reconstructed during migration.
const legacyStateSchema = oldStateContract.omit({ actorProfiles: true }).extend({
  replayOrigin: stateContract.shape.replayOrigin.unwrap().omit({ actorProfiles: true }).optional(),
  activeFamilyLifeDirectionId: familyLifeDirectionIdSchema.optional(),
});
const migrateLegacy = (data: unknown, requireDirection = false): unknown => {
  const legacy = (requireDirection ? legacyStateSchema.extend({ activeFamilyLifeDirectionId: familyLifeDirectionIdSchema }) : legacyStateSchema).safeParse(data);
  if (!legacy.success) return data;
  const state = legacy.data;
  // Only membership is known. Never re-sample a name, kinship or habit for an old story.
  const profiles = unknownActorProfiles(state.family);
  return { schemaVersion: SAVE_SCHEMA_VERSION, state: {
    ...state, actorProfiles: profiles,
    ...(state.replayOrigin ? { replayOrigin: { ...state.replayOrigin,
      actorProfiles: profiles } } : {}),
    activeFamilyLifeDirectionId: state.activeFamilyLifeDirectionId ?? "flexible",
  } };
};

export const serializeGame = (state: GameState): string =>
  JSON.stringify(saveSchema.parse({ schemaVersion: SAVE_SCHEMA_VERSION, state }));

export const restoreGame = (rawData: string): RestoreResult => {
  let data: unknown;
  try {
    data = JSON.parse(rawData);
  } catch {
    return { status: "error", rawData, error: { code: "invalid-data",
      message: "暫時無法讀取這份故事，原始資料仍保留。你可以重試，或確認保留原檔後開始新故事。" } };
  }
  const version = z.object({ schemaVersion: z.number().int().positive() }).safeParse(data);
  const nestedVersion = z.object({ state: z.object({ schemaVersion: z.number().int().positive() }) }).safeParse(data);
  if ((version.success && ![1, 2, 3, 4, 5, SAVE_SCHEMA_VERSION].includes(version.data.schemaVersion)) ||
      (version.success && [2, 3, 4, 5, SAVE_SCHEMA_VERSION].includes(version.data.schemaVersion) && nestedVersion.success &&
        nestedVersion.data.state.schemaVersion !== 1)) {
    return { status: "error", rawData, error: { code: "incompatible-version",
      message: "這份故事的版本目前無法開啟，原始資料仍保留。請使用支援此版本的程式，或確認保留原檔後開始新故事。" } };
  }
  const migratedFrom = version.success && [1, 2, 3, 4, 5].includes(version.data.schemaVersion)
    ? version.data.schemaVersion as 1 | 2 | 3 | 4 | 5 : null;
  const legacyEnvelope = z.object({ schemaVersion: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]), state: z.unknown() }).strict().safeParse(data);
  const v4 = migratedFrom === 4 && legacyEnvelope.success ? v4StateSchema.safeParse(legacyEnvelope.data.state) : null;
  const v5 = migratedFrom === 5 && legacyEnvelope.success ? v5StateSchema.safeParse(legacyEnvelope.data.state) : null;
  const migrated = migratedFrom === 1 ? migrateLegacy(data)
    : v5?.success ? { schemaVersion: SAVE_SCHEMA_VERSION, state: v5.data }
    : v4?.success ? { schemaVersion: SAVE_SCHEMA_VERSION, state: v4.data }
    : (migratedFrom === 2 || migratedFrom === 3) && legacyEnvelope.success
      ? migrateLegacy(legacyEnvelope.data.state, migratedFrom === 3) : data;
  const parsed = saveSchema.safeParse(migrated);
  if (!parsed.success) {
    return { status: "error", rawData, error: { code: "invalid-data",
      message: "這份故事的資料不完整或已損壞，原始資料仍保留。你可以重試，或確認保留原檔後開始新故事。" } };
  }
  return { status: "restored", rawData, state: parsed.data.state, migratedFrom };
};
