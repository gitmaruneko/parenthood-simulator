import { z } from "zod";
import { gameStateSchema, type GameState } from "../domain/schemas.js";

export const SAVE_SCHEMA_VERSION = 2;

export type SaveErrorCode = "invalid-data" | "incompatible-version" | "storage-unavailable"
  | "storage-full" | "save-changed" | "recovery-required";

export interface SaveError {
  readonly code: SaveErrorCode;
  readonly message: string;
}

export type RestoreResult =
  | { readonly status: "restored"; readonly state: GameState; readonly rawData: string;
      readonly migratedFrom: 1 | null }
  | { readonly status: "error"; readonly error: SaveError; readonly rawData: string };

const savedStateSchema = gameStateSchema.extend({ schemaVersion: z.literal(1) }).superRefine((state, ctx) => {
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
});

const saveSchema = z.object({
  schemaVersion: z.literal(SAVE_SCHEMA_VERSION),
  state: savedStateSchema,
}).strict();

// Version 1 is the original, unwrapped GameState contract. No PRNG or
// lifecycle defaults are reconstructed during migration.
const migrateVersion1 = (data: unknown): unknown => ({ schemaVersion: SAVE_SCHEMA_VERSION, state: data });

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
  if ((version.success && version.data.schemaVersion !== 1 && version.data.schemaVersion !== SAVE_SCHEMA_VERSION) ||
      (version.success && version.data.schemaVersion === SAVE_SCHEMA_VERSION && nestedVersion.success &&
        nestedVersion.data.state.schemaVersion !== 1)) {
    return { status: "error", rawData, error: { code: "incompatible-version",
      message: "這份故事的版本目前無法開啟，原始資料仍保留。請使用支援此版本的程式，或確認保留原檔後開始新故事。" } };
  }
  const migratedFrom = version.success && version.data.schemaVersion === 1 ? 1 : null;
  const parsed = saveSchema.safeParse(migratedFrom === 1 ? migrateVersion1(data) : data);
  if (!parsed.success) {
    return { status: "error", rawData, error: { code: "invalid-data",
      message: "這份故事的資料不完整或已損壞，原始資料仍保留。你可以重試，或確認保留原檔後開始新故事。" } };
  }
  return { status: "restored", rawData, state: parsed.data.state, migratedFrom };
};
