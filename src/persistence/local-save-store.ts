import type { GameState } from "../domain/schemas.js";
import { restoreGame, serializeGame, type RestoreResult, type SaveError } from "./save-format.js";

export const LOCAL_SAVE_KEY = "parenthood-simulator.save";

export interface SaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type LoadResult = RestoreResult
  | { readonly status: "empty"; readonly rawData: null }
  | { readonly status: "error"; readonly error: SaveError; readonly rawData: null };

export type SaveResult =
  | { readonly status: "saved"; readonly rawData: string; readonly preservedKey: string | null }
  | { readonly status: "error"; readonly error: SaveError; readonly rawData: string | null };

const storageError = (cause: unknown): SaveError => {
  const full = cause instanceof Error && cause.name === "QuotaExceededError";
  return { code: full ? "storage-full" : "storage-unavailable",
    message: full
      ? "儲存空間不足，這次進度尚未儲存；既有存檔仍保留。請釋出空間後重試。"
      : "目前無法存取這台裝置的存檔。既有資料未由本操作變更，請確認瀏覽器允許儲存後重試。" };
};

export const createLocalSaveStore = (storage?: SaveStorage) => {
  // Resolve lazily so blocked localStorage access becomes a recoverable result.
  const getStorage = (): SaveStorage => storage ?? globalThis.localStorage;

  const load = (): LoadResult => {
    try {
      const rawData = getStorage().getItem(LOCAL_SAVE_KEY);
      return rawData === null ? { status: "empty", rawData } : restoreGame(rawData);
    } catch (cause) {
      return { status: "error", error: storageError(cause), rawData: null };
    }
  };

  const write = (state: GameState, expectedRawData: string | null, preserveOriginal: boolean): SaveResult => {
    const current = load();
    if (current.status === "error" && (current.rawData === null || !preserveOriginal)) return current;
    if (current.rawData !== expectedRawData) {
      return { status: "error", rawData: current.rawData, error: { code: "save-changed",
        message: "存檔已改變，這次操作尚未儲存。請重新讀取最新故事後再繼續。" } };
    }
    if (!preserveOriginal && current.status === "restored" && current.migratedFrom !== null) {
      return { status: "error", rawData: current.rawData, error: { code: "recovery-required",
        message: "這份故事需要先更新存檔，原始資料會保留。請選擇更新並繼續。" } };
    }
    if (!preserveOriginal && current.status === "restored" && current.state.seed !== state.seed) {
      return { status: "error", rawData: current.rawData, error: { code: "recovery-required",
        message: "裝置上已有另一個家庭的故事。請先確認保留原檔，再開始新故事。" } };
    }
    let rawData: string;
    try {
      rawData = serializeGame(state);
    } catch {
      return { status: "error", rawData: current.rawData, error: { code: "invalid-data",
        message: "這次進度未通過驗證，尚未儲存；既有存檔仍保留。請重試。" } };
    }
    try {
      let preservedKey: string | null = null;
      if (preserveOriginal && current.rawData !== null) {
        // Never replace an older preserved story, even across repeated recoveries.
        for (let index = 0; ; index += 1) {
          const key = `${LOCAL_SAVE_KEY}.preserved.${index}`;
          const existing = getStorage().getItem(key);
          if (existing === current.rawData) { preservedKey = key; break; }
          if (existing === null) {
            getStorage().setItem(key, current.rawData);
            preservedKey = key;
            break;
          }
        }
      }
      getStorage().setItem(LOCAL_SAVE_KEY, rawData);
      return { status: "saved", rawData, preservedKey };
    } catch (cause) {
      return { status: "error", error: storageError(cause), rawData: current.rawData };
    }
  };

  const save = (state: GameState, expectedRawData: string | null): SaveResult =>
    write(state, expectedRawData, false);

  // Call only after presenting the load error/overwrite warning and obtaining
  // the player's confirmation for this exact rawData snapshot.
  const replaceAfterConfirmation = (state: GameState, expectedRawData: string): SaveResult =>
    write(state, expectedRawData, true);

  const migrate = (expectedRawData: string): SaveResult => {
    const current = load();
    if (current.status === "error") return current;
    if (current.status === "empty" || current.rawData !== expectedRawData) {
      return { status: "error", rawData: current.rawData, error: { code: "save-changed",
        message: "存檔已改變，尚未更新。請重新讀取最新故事後重試。" } };
    }
    return write(current.state, expectedRawData, true);
  };

  return { load, save, replaceAfterConfirmation, migrate };
};

export type LocalSaveStore = ReturnType<typeof createLocalSaveStore>;
