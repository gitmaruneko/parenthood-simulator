import type { ContentPack, GameState } from "../domain/schemas.js";
import type { FamilyLifeDirectionId } from "../domain/family-life-direction.js";
import { createMvpContent } from "../content/mvp.js";
import {
  createFamilyRun,
  rerollFamilyRun,
  describeFamily,
  describeTendencies,
  getPlayerView,
  type EngineInput,
  type FamilyRun,
} from "../engine/index.js";
import {
  checkingSave,
  inspectPlayerSave,
  transitionAndSave,
  createLocalSaveStore,
  type HomeSaveView,
  type LocalSaveStore,
  type SaveResult,
} from "../persistence/index.js";

export interface GamePresentation extends ReturnType<typeof getPlayerView> {
  readonly family: ReturnType<typeof describeFamily>;
  readonly resources: GameState["resources"];
  readonly history: GameState["history"];
  readonly choices: GameState["choiceHistory"];
  readonly reactions: NonNullable<GameState["reactionHistory"]>;
  readonly members: readonly {
    id: string;
    displayName: string;
    recent: string | null;
  }[];
  readonly currentTurnId: string | null;
  readonly currentAgeStageId: string;
  readonly cause: string | null;
  readonly eventTitles: Readonly<Record<string, string>>;
  readonly choiceTexts: Readonly<Record<string, string>>;
}
export interface PlayerSnapshot {
  readonly page: "home" | "assessment" | "reveal" | "game";
  readonly home: HomeSaveView;
  readonly busy: boolean;
  readonly status: string;
  readonly error: string | null;
  readonly canRetrySave: boolean;
  readonly dialog: "confirm" | "recovery" | null;
  readonly reveal: {
    seed: number;
    summary: FamilyRun["summary"];
    descriptions: readonly string[];
  } | null;
  readonly game: GamePresentation | null;
  readonly gameTab: "life" | "records";
}

const freshSeed = () => crypto.getRandomValues(new Uint32Array(1))[0]!;
const yieldPaint = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export const createPlayerSession = (
  store: LocalSaveStore = createLocalSaveStore(),
  seedSource = freshSeed,
) => {
  let snapshot: PlayerSnapshot = {
    page: "home",
    home: checkingSave,
    busy: false,
    status: "",
    error: null,
    canRetrySave: false,
    dialog: null,
    reveal: null,
    game: null,
    gameTab: "life",
  };
  const listeners = new Set<() => void>();
  const publish = (change: Partial<PlayerSnapshot>) => {
    snapshot = { ...snapshot, ...change };
    listeners.forEach((listener) => listener());
  };
  let content = createMvpContent();
  let run: FamilyRun | null = null;
  let state: GameState | null = null;
  let expectedRaw: string | null = null;
  let confirmedRaw: string | null | undefined;
  let dialogRaw: string | null = null;
  let needsSave = false;
  let directionQueue: Promise<void> = Promise.resolve();
  const waitForDirection = () => new Promise<void>((resolve) => {
    const ready = () => {
      if (!snapshot.busy && (!needsSave || snapshot.page !== "game")) {
        listeners.delete(ready);
        resolve();
      }
    };
    listeners.add(ready);
    ready();
  });
  const inspect = () => {
    const result = inspectPlayerSave(store, content);
    publish({ home: result.view });
    return result.load;
  };
  const presentGame = (): GamePresentation => {
    const view = getPlayerView(state!, content);
    const currentEventIds = new Set(
      state!.history
        .filter((entry) => entry.turnId === state!.currentTurnId)
        .map((entry) => entry.resolvedEventId),
    );
    if (view.pendingEvent) currentEventIds.add(view.pendingEvent.id);
    const consumedIds = new Set(
      state!.scheduledFollowUps
        .filter(
          (item) =>
            item.status === "consumed" && currentEventIds.has(item.eventId),
        )
        .map((item) => item.eventId),
    );
    // Cite the actual confirmed choice that authored a consumed follow-up, never a future schedule.
    const cause =
      [...state!.choiceHistory].reverse().flatMap((entry) => {
        if (entry.turnId === state!.currentTurnId) return [];
        const event = content.events.find(
          (event) => event.id === entry.eventId,
        );
        const choice = event?.choices.find(
          (choice) => choice.id === entry.choiceId,
        );
        return choice?.scheduledFollowUps.some((item) =>
          consumedIds.has(item.eventId),
        )
          ? [`${event!.title}：你選擇「${choice.text}」。`]
          : [];
      })[0] ?? null;
    return {
      ...view,
      family: describeFamily(state!.family),
      resources: { ...state!.resources },
      history: state!.history,
      choices: state!.choiceHistory,
      reactions: state!.reactionHistory ?? [],
      members: content.actors
        .filter(
          (actor) =>
            actor.id === state!.family.childId ||
            state!.family.persistentActorIds.includes(actor.id),
        )
        .map((actor) => ({
          id: actor.id,
          displayName: actor.displayName,
          recent:
            [...(state!.reactionHistory ?? [])]
              .reverse()
              .find((reaction) => reaction.actorId === actor.id)?.text ?? null,
        })),
      currentTurnId: state!.currentTurnId,
      currentAgeStageId: state!.currentAgeStageId,
      cause,
      eventTitles: Object.fromEntries(
        content.events
          .filter((event) => state!.completedEventIds.includes(event.id))
          .map((event) => [event.id, event.title]),
      ),
      choiceTexts: Object.fromEntries(
        content.events.flatMap((event) =>
          event.choices.map((choice) => [
            `${event.id}/${choice.id}`,
            choice.text,
          ]),
        ),
      ),
    };
  };
  const savingResult = (result: SaveResult) => {
    const retryable =
      result.status === "error" &&
      ["storage-full", "storage-unavailable"].includes(result.error.code);
    // A write failure can follow successful checkpoints in the same traversal.
    // A conflict token must never be adopted as permission to overwrite it.
    if (result.status === "saved" || (retryable && result.rawData !== null))
      expectedRaw = result.rawData;
    needsSave = result.status === "error";
    publish({
      status: result.status === "saved" ? "已儲存" : "儲存失敗",
      canRetrySave: retryable,
      error: result.status === "error" ? result.error.message : null,
    });
    return result.status === "saved";
  };
  const operate = async (status: string, action: () => void) => {
    if (snapshot.busy) return;
    publish({ busy: true, status, error: null });
    await yieldPaint();
    try {
      action();
    } catch {
      publish({
        error: "這次操作未完成，既有存檔未刪除。請重新讀取故事後重試。",
        status: "操作未完成",
      });
    } finally {
      publish({ busy: false });
    }
  };
  const enterOpening = () =>
    publish({
      page: "assessment",
      dialog: null,
      reveal: null,
      game: null,
      gameTab: "life",
    });
  const installState = (
    loaded: GameState,
    gameTab: "life" | "records" = "life",
  ) => {
    state = loaded;
    // Recreate only the seeded actor catalogue through the family-generation boundary.
    const generated = createFamilyRun({ seed: state.seed });
    content = createMvpContent(generated.actors);
    run = {
      ...generated,
      state: loaded,
      summary: describeFamily(loaded.family),
      assessment: {
        ...generated.assessment,
        descriptions: describeTendencies(loaded.tendencies),
      },
    };
    confirmedRaw =
      state.turn || state.ageStageProgress ? undefined : expectedRaw;
    needsSave = false;
    publish({
      page: state.turn || state.ageStageProgress ? "game" : "reveal",
      game: presentGame(),
      gameTab,
      reveal: {
        seed: state.seed,
        summary: describeFamily(state.family),
        descriptions: describeTendencies(state.tendencies),
      },
      dialog: null,
      status: "已儲存",
    });
  };
  const execute = (input: EngineInput) => {
    const result = transitionAndSave(
      state!,
      content,
      input,
      store,
      expectedRaw,
    );
    state = result.transition.state;
    savingResult(result.save);
    // Engine traverses automatic nodes. Reading the resulting story is local UI state.
    if (
      !needsSave &&
      input.type === "CHOOSE" &&
      getPlayerView(state, content).nextInput?.type === "ADVANCE"
    ) {
      const automatic = transitionAndSave(
        state,
        content,
        { type: "ADVANCE" },
        store,
        expectedRaw,
      );
      state = automatic.transition.state;
      savingResult(automatic.save);
    }
    publish({ game: presentGame() });
  };
  const session = {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    check: () =>
      operate("正在確認這台裝置的故事…", () => {
        if (snapshot.page === "home") inspect();
      }),
    home: () => {
      if (snapshot.busy) return;
      confirmedRaw = undefined;
      publish({ page: "home", dialog: null, error: null });
      void session.check();
    },
    newStory: () =>
      operate("正在確認目前的故事…", () => {
        const loaded = inspect();
        if (loaded.status === "empty") {
          confirmedRaw = null;
          enterOpening();
        } else if (loaded.rawData !== null) {
          dialogRaw = loaded.rawData;
          publish({ dialog: "confirm" });
        }
      }),
    confirmNew: () =>
      operate("正在確認目前的故事…", () => {
        const loaded = inspect();
        if (loaded.rawData !== dialogRaw) {
          dialogRaw = loaded.rawData;
          publish({
            dialog: loaded.rawData === null ? null : "confirm",
            error: "存檔已改變，請閱讀最新摘要並重新確認。",
          });
          return;
        }
        confirmedRaw = loaded.rawData;
        enterOpening();
      }),
    closeDialog: () => {
      if (!snapshot.busy) publish({ dialog: null });
    },
    recovery: () => {
      if (!snapshot.busy) publish({ dialog: "recovery" });
    },
    resume: (target: "life" | "records" = "life") =>
      operate("正在開啟故事…", () => {
        const loaded = inspect();
        if (loaded.status !== "restored" || loaded.migratedFrom !== null)
          return;
        expectedRaw = loaded.rawData;
        installState(loaded.state, target);
      }),
    migrate: () =>
      operate("正在更新存檔…", () => {
        const loaded = inspect();
        if (loaded.status !== "restored" || loaded.migratedFrom === null)
          return;
        const result = store.migrate(loaded.rawData);
        if (!savingResult(result)) {
          inspect();
          publish({ dialog: "recovery" });
          return;
        }
        const updated = inspect();
        if (updated.status === "restored" && updated.migratedFrom === null)
          installState(updated.state);
      }),
    reveal: (answers?: readonly string[]) => {
      if (snapshot.busy || snapshot.page !== "assessment") return;
      run = createFamilyRun({
        seed: seedSource(),
        ...(answers ? { answers } : {}),
      });
      publish({
        page: "reveal",
        reveal: {
          seed: run.state.seed,
          summary: run.summary,
          descriptions: run.assessment.descriptions,
        },
      });
    },
    reroll: () => {
      if (snapshot.busy || snapshot.page !== "reveal" || !run) return;
      const seed = seedSource();
      run = rerollFamilyRun(run, {
        seed: seed === run.state.seed ? (seed + 1) >>> 0 : seed,
      });
      publish({
        reveal: {
          seed: run.state.seed,
          summary: run.summary,
          descriptions: run.assessment.descriptions,
        },
      });
    },
    startFamily: () =>
      operate("儲存中…", () => {
        if (snapshot.page !== "reveal") return;
        if (!run) return;
        const loaded = inspect();
        if (
          loaded.rawData !== confirmedRaw ||
          (loaded.status === "error" && loaded.rawData === null)
        ) {
          confirmedRaw = undefined;
          publish({
            page: "home",
            error: "裝置上的故事已改變，尚未取代任何資料。請重新開始並確認。",
          });
          return;
        }
        state = run.state;
        content = createMvpContent(run.actors);
        const saved =
          confirmedRaw === null
            ? store.save(state, null)
            : store.replaceAfterConfirmation(state, confirmedRaw!);
        if (!savingResult(saved)) return;
        confirmedRaw = undefined;
        publish({ page: "game", game: presentGame(), gameTab: "life" });
        execute({ type: "ADVANCE" });
      }),
    advance: () =>
      operate("儲存中…", () => {
        if (!state || needsSave || snapshot.page !== "game") return;
        const input = getPlayerView(state, content).nextInput;
        if (input) execute(input);
      }),
    choose: (choiceId: string) =>
      operate("儲存中…", () => {
        if (
          !state ||
          needsSave ||
          snapshot.page !== "game" ||
          !getPlayerView(state, content).pendingEvent
        )
          return;
        execute({ type: "CHOOSE", choiceId });
      }),
    setDirection: (directionId: FamilyLifeDirectionId) => {
      directionQueue = directionQueue.then(async () => {
        await waitForDirection();
        await operate("儲存中…", () => {
          if (!state || snapshot.page !== "game" || getPlayerView(state, content).completed) return;
          execute({ type: "SET_FAMILY_LIFE_DIRECTION", directionId });
        });
      });
      return directionQueue;
    },
    retrySave: () =>
      !snapshot.canRetrySave
        ? Promise.resolve()
        : operate("儲存中…", () => {
            if (state && needsSave)
              savingResult(store.save(state, expectedRaw));
          }),
  };
  return session;
};
export type PlayerSession = ReturnType<typeof createPlayerSession>;
