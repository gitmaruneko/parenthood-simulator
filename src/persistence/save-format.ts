import { z } from "zod";
import { gameStateSchema, contentBindingSchema, type GameState } from "../domain/schemas.js";
import { actorProfilesSchema } from "../domain/actor-profiles.js";
import { familyLifeDirectionIdSchema } from "../domain/family-life-direction.js";
import { validateJournal } from "../domain/journal-validation.js";
import { createRunContent, validatePreviewProgress, isSupportedRelease } from "../content/releases.js";
import * as legacy from "./legacy-save-format.js";

export const SAVE_SCHEMA_VERSION = 8;
export type { SaveErrorCode, SaveError, RestoreResult } from "./legacy-save-format.js";

const previewState = gameStateSchema.extend({
  schemaVersion: z.literal(2), contentBinding: contentBindingSchema,
  actorProfiles: actorProfilesSchema, activeFamilyLifeDirectionId: familyLifeDirectionIdSchema,
  replayOrigin: gameStateSchema.shape.replayOrigin.unwrap().extend({ actorProfiles: actorProfilesSchema }),
}).superRefine((state, context) => {
  legacy.validateSavedState(state, context);
  validateJournal(state, context);
  if (state.history.some(row => row.kind === "narrative" && (row.resolvedEventId !== undefined ||
      !row.text.trim() || row.journal?.length !== 1 || row.journal[0]?.kind !== "result" ||
      row.journal[0].reactionHistoryIndex !== undefined || !row.journal[0].text.endsWith(row.text))))
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Narrative result needs its own sourced snapshot, not an event anchor" });
  try { validatePreviewProgress(state, createRunContent(state)); }
  catch { context.addIssue({ code: z.ZodIssueCode.custom, message: "Incompatible content or story progress" }); }
});
const previewEnvelope = z.object({ schemaVersion: z.literal(8), state: previewState }).strict();

export function serializeGame(state: GameState): string {
  // Legacy stays on the frozen v7 writer; a preview never falls back to it.
  return state.contentBinding || state.schemaVersion === 2
    ? JSON.stringify(previewEnvelope.parse({ schemaVersion: 8, state })) : legacy.serializeGame(state);
}

export function restoreGame(rawData: string): legacy.RestoreResult {
  let data: unknown;
  try { data = JSON.parse(rawData); } catch { return legacy.restoreGame(rawData); }
  if (typeof data !== "object" || data === null || !("schemaVersion" in data) || data.schemaVersion !== 8)
    return legacy.restoreGame(rawData);
  const identity = z.object({ state: z.object({ schemaVersion: z.number(), contentBinding: z.object({
    releaseId: z.string(), assemblyVersion: z.number(),
  }) }) }).safeParse(data);
  if (identity.success && (identity.data.state.schemaVersion !== 2 ||
      !isSupportedRelease(identity.data.state.contentBinding.releaseId, identity.data.state.contentBinding.assemblyVersion)))
    return { status: "error", rawData, error: { code: "incompatible-version", message: "這份故事的內容版本目前無法開啟，原始資料仍保留。" } };
  const parsed = previewEnvelope.safeParse(data);
  if (!parsed.success) return { status: "error", rawData, error: { code: "invalid-data",
    message: "這份故事的內容版本或進度無法核對，原始資料仍保留。請使用支援此版本的程式，或保留原檔後再開始。" } };
  return { status: "restored", rawData, state: parsed.data.state, migratedFrom: null };
}
