export const NARRATION_PAUSE_KEY = "parenthood-simulator.ui.story-paused";
type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;

// UI preference only: deliberately separate from the game save and checkpoints.
export function createNarrationPreference(storage?: PreferenceStorage) {
  const target = () => storage ?? (typeof window === "undefined" ? null : window.localStorage);
  return {
    read: () => {
      try { return { paused: target()?.getItem(NARRATION_PAUSE_KEY) === "true", error: null }; }
      catch { return { paused: true, error: "無法讀取敘事偏好，已暫停；你可以手動恢復。" }; }
    },
    write: (paused: boolean) => {
      try { target()?.setItem(NARRATION_PAUSE_KEY, String(paused)); return null; }
      catch { return "無法保存敘事偏好；本次設定仍有效，重新整理後可能無法保留。"; }
    },
  };
}
export type NarrationPreference = ReturnType<typeof createNarrationPreference>;
