import type { ContentPack } from "../domain/schemas.js";
import { profileMatchesActorRole } from "../domain/actor-profiles.js";
import { getPlayerView } from "../engine/index.js";
import type { LoadResult, LocalSaveStore } from "./local-save-store.js";

export type HomeSaveKind =
  | "checking"
  | "empty"
  | "active"
  | "completed"
  | "migration"
  | "corrupt"
  | "incompatible"
  | "unavailable";
export interface HomeSaveView {
  readonly kind: HomeSaveKind;
  readonly summary: string;
  readonly primary: string | null;
  readonly canStartNew: boolean;
}
export const checkingSave: HomeSaveView = {
  kind: "checking",
  summary: "正在確認這台裝置的故事…",
  primary: null,
  canStartNew: false,
};

// Classify only validated persistence results; raw data never reaches React.
export const inspectPlayerSave = (
  store: LocalSaveStore,
  content: ContentPack,
): {
  load: LoadResult;
  view: HomeSaveView;
} => {
  let load = store.load();
  if (load.status === "restored") {
    try {
      // The save schema cannot know which actor IDs the installed content supports.
      const { family, actorProfiles } = load.state;
      const ids = [family.childId, ...family.persistentActorIds];
      if (new Set(ids).size !== ids.length || ids.some(id => {
        const actor = content.actors.find(actor => actor.id === id);
        const profile = actorProfiles?.[id];
        return !actor || (id === family.childId ? actor.role !== "child"
          : !["partner", "grandparent"].includes(actor.role)) ||
          (profile !== undefined && !profileMatchesActorRole(profile, actor.role));
      })) throw new Error("family actor content is unavailable");
      const journalActors = load.state.history.flatMap(entry => entry.journal?.flatMap(item => item.actorIds) ?? []);
      if (journalActors.some(id => !content.actors.some(actor => actor.id === id)))
        throw new Error("journal actor content is unavailable");
      getPlayerView(load.state, content);
    } catch {
      load = {
        status: "error",
        rawData: load.rawData,
        error: {
          code: "incompatible-version",
          message:
            "這份故事使用的內容目前無法開啟，原始資料仍保留。你可以重試，或保留原檔後開始新的故事。",
        },
      };
    }
  }
  if (load.status === "empty")
    return {
      load,
      view: {
        kind: "empty",
        summary: "從一個家庭的日常開始",
        primary: "開始我們的故事",
        canStartNew: false,
      },
    };
  if (load.status === "error")
    return {
      load,
      view: {
        kind:
          load.rawData === null
            ? "unavailable"
            : load.error.code === "incompatible-version"
              ? "incompatible"
              : "corrupt",
        summary: load.error.message,
        primary: load.rawData === null ? "重新讀取" : "查看恢復選項",
        canStartNew: load.rawData !== null,
      },
    };
  if (load.migratedFrom !== null)
    return {
      load,
      view: {
        kind: "migration",
        summary: "這份故事需要更新後才能繼續，原始資料會保留。",
        primary: "更新存檔並繼續",
        canStartNew: true,
      },
    };
  const game = getPlayerView(load.state, content);
  return {
    load,
    view: game.completed
      ? {
          kind: "completed",
          summary: "這段生活已成為家庭紀錄",
          primary: "開始新的故事",
          canStartNew: false,
        }
      : {
          kind: "active",
          summary: `${game.ageLabel} · ${game.stageLabel} · ${game.turnLabel}`,
          primary: "繼續上次生活",
          canStartNew: true,
        },
  };
};
