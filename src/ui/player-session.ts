import type { ContentPack, EventNode, GameState } from "../domain/schemas.js";
import { projectJournal, type JournalRecord } from "../engine/journal.js";
import type { FamilyLifeDirectionId } from "../domain/family-life-direction.js";
import { createMvpContent } from "../content/mvp.js";
import { resolveFamilyMembers, resolveEventIdentity } from "../engine/actor-profiles.js";
import {
  createFamilyRun,
  rerollFamilyRun,
  describeFamily,
  describeTendencies,
  getPlayerView,
  createFamilyReview,
  selectReviewMoments,
  replayFamilyRun,
  type FamilyReview,
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
    relationship: string;
    lifeDetail?: string | null;
    ageLabel: string | null;
    context: readonly string[];
    recent: string | null;
    recentTimeLabel: string | null;
    memories: readonly string[];
  }[];
  readonly currentTurnId: string | null;
  readonly currentAgeStageId: string;
  readonly cause: string | null;
  readonly eventTitles: Readonly<Record<string, string>>;
  readonly choiceTexts: Readonly<Record<string, string>>;
  readonly review: FamilyReview | null;
  readonly planningLoad: number;
  readonly openingResources: GameState["resources"] | null;
}
export interface DecisionPresentation {
  readonly key: string;
  readonly event: EventNode;
  readonly status: "ready" | "submitting" | "unsaved";
  readonly records: readonly JournalRecord[];
}
export interface PlayerSnapshot {
  readonly page: "home" | "assessment" | "reveal" | "game";
  readonly home: HomeSaveView;
  readonly busy: boolean;
  readonly status: string;
  readonly error: string | null;
  readonly canRetrySave: boolean;
  readonly hasUnsavedChanges: boolean;
  readonly decision: DecisionPresentation | null;
  readonly dialog: "confirm" | "recovery" | null;
  readonly reveal: {
    seed: number;
    summary: FamilyRun["summary"];
    descriptions: readonly string[];
    members: readonly (ReturnType<typeof resolveFamilyMembers>[number] & { ageLabel: string | null })[];
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
    hasUnsavedChanges: false,
    decision: null,
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
  const presentReveal = (familyRun: FamilyRun): NonNullable<PlayerSnapshot["reveal"]> => {
    const ageLabel = getPlayerView(familyRun.state, content).ageLabel;
    return { seed: familyRun.state.seed, summary: familyRun.summary,
      descriptions: familyRun.assessment.descriptions,
      members: resolveFamilyMembers(familyRun.state, familyRun.actors).map(member => ({
        ...member, ageLabel: member.id === familyRun.state.family.childId ? ageLabel : null,
      })) };
  };
  let run: FamilyRun | null = null;
  let state: GameState | null = null;
  let expectedRaw: string | null = null;
  let confirmedRaw: string | null | undefined;
  let dialogRaw: string | null = null;
  let pendingReplay: FamilyRun | null = null;
  let needsSave = false;
  let directionQueue: Promise<void> = Promise.resolve();
  let pendingDirections = 0;
  let storyGeneration = 0;
  const pendingDecision = (): DecisionPresentation | null => {
    if (!state) return null;
    const event = getPlayerView(state, content).pendingEvent;
    return event ? {
      key: `${storyGeneration}/${state.currentTurnId}/${event.id}/${state.eventProgress?.nodeIndex ?? state.turn?.nodeCount}`,
      event, status: "ready", records: [],
    } : null;
  };
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
    const family = describeFamily(state!.family);
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
      review: view.completed ? createFamilyReview(state!, content) : null,
      planningLoad: state!.planningLoad,
      openingResources: state!.replayOrigin?.resources ?? null,
      family,
      resources: { ...state!.resources },
      history: state!.history,
      choices: state!.choiceHistory,
      reactions: state!.reactionHistory ?? [],
      members: resolveFamilyMembers(state!, content.actors)
        .map((member) => {
          const actor = content.actors.find(actor => actor.id === member.id)!;
          const recent = [...(state!.reactionHistory ?? [])].reverse()
            .find((reaction) => reaction.actorId === actor.id);
          return {
            ...member,
            ageLabel: actor.id === state!.family.childId ? view.ageLabel : null,
            // These describe household arrangements, never an individual's job or personality.
            context: actor.role === "child" ? [] : family.conditions
              .filter((condition) => condition.dimension !== "householdComposition")
              .map((condition) => `${condition.dimension === "careParticipation" ? "家庭照顧安排" : "家庭工作安排"}：${condition.neutralSummary}`),
            recent: recent?.text ?? null,
            recentTimeLabel: recent ? view.storyTimeLabels[recent.turnId] ?? null : null,
            memories: state!.relationshipMemories.filter((memory) => memory.actorId === actor.id)
              .slice(-3).reverse().map((memory) => memory.text),
          };
        }),
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
          resolveEventIdentity(event, state!).choices.map((choice) => [
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
      hasUnsavedChanges: needsSave,
      decision: result.status === "saved" && snapshot.decision?.status === "unsaved"
        ? pendingDecision() : snapshot.decision,
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
        decision: snapshot.decision?.status === "submitting" ? pendingDecision() : snapshot.decision,
        error: snapshot.decision?.status === "submitting"
          ? "這個選擇未被接受，尚未改變紀錄。請重新選擇目前可用的做法。"
          : "這次操作未完成，既有存檔未刪除。請重新讀取故事後重試。",
        status: "操作未完成",
      });
    } finally {
      publish({ busy: false });
    }
  };
  const enterOpening = () => {
    storyGeneration++;
    publish({
      page: "assessment",
      dialog: null,
      reveal: null,
      game: null,
      decision: null,
      gameTab: "life",
    });
  };
  const installState = (
    loaded: GameState,
    gameTab: "life" | "records" = "life",
  ) => {
    storyGeneration++;
    state = loaded;
    // Recreate only the seeded actor catalogue through the family-generation boundary.
    const generated = createFamilyRun({ seed: state.seed });
    content = createMvpContent(state.replayOrigin?.actors ?? generated.actors);
    run = {
      ...generated,
      actors: state.replayOrigin?.actors ?? generated.actors,
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
      reveal: presentReveal(run),
      dialog: null,
      status: "已儲存",
      canRetrySave: false,
      hasUnsavedChanges: false,
      decision: pendingDecision(),
    });
  };
  const execute = (input: EngineInput) => {
    const previousHistoryLength = state!.history.length;
    const submitted = snapshot.decision;
    const result = transitionAndSave(
      state!,
      content,
      input,
      store,
      expectedRaw,
    );
    state = result.transition.state;
    savingResult(result.save);
    // A command commits only its actual results. Continue submits the nextInput;
    // traversal and safety boundaries remain owned by the engine.
    const sourceIds = new Set(state.history.slice(previousHistoryLength).map(entry => entry.id));
    const decision: DecisionPresentation | null = input.type === "CHOOSE" &&
      result.save.status === "error" && submitted
      ? { ...submitted, status: "unsaved", records: projectJournal(state)
          .filter(record => sourceIds.has(record.sourceHistoryId)).reverse() }
      : pendingDecision();
    publish({ game: presentGame(), decision });
  };
  const session = {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    check: () => snapshot.page !== "home" ? Promise.resolve() :
      operate("正在確認這台裝置的故事…", () => {
        if (snapshot.page === "home") inspect();
      }),
    home: () => {
      if (snapshot.busy) return;
      pendingReplay = null;
      storyGeneration++;
      confirmedRaw = undefined;
      publish({ page: "home", dialog: null, decision: null, error: null });
      void session.check();
    },
    newStory: () =>
      operate("正在確認目前的故事…", () => {
        pendingReplay = null;
        const loaded = inspect();
        if (loaded.status === "empty") {
          confirmedRaw = null;
          enterOpening();
        } else if (loaded.rawData !== null) {
          dialogRaw = loaded.rawData;
          publish({ dialog: "confirm" });
        }
      }),
    replay: () => operate("正在準備相同家庭…", () => {
      if (!state || needsSave || !getPlayerView(state, content).completed) return;
      const loaded = inspect();
      if (loaded.status !== "restored" || loaded.rawData !== expectedRaw) {
        publish({ error: "存檔已改變，請重新讀取故事後再重玩。" });
        return;
      }
      pendingReplay = replayFamilyRun(state);
      dialogRaw = loaded.rawData;
      publish({ dialog: "confirm" });
    }),
    selectMoments: (ids: readonly string[]) => operate("儲存中…", () => {
      if (!state || needsSave || snapshot.page !== "game") return;
      const next = selectReviewMoments(state, content, ids);
      state = next;
      savingResult(store.save(next, expectedRaw));
      publish({ game: presentGame() });
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
        if (pendingReplay) {
          storyGeneration++;
          run = pendingReplay;
          pendingReplay = null;
          publish({ page: "reveal", dialog: null, game: null,
            reveal: presentReveal(run) });
          return;
        }
        enterOpening();
      }),
    closeDialog: () => {
      if (!snapshot.busy) { pendingReplay = null; publish({ dialog: null }); }
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
        reveal: presentReveal(run),
      });
    },
    reroll: () => {
      if (snapshot.busy || snapshot.page !== "reveal" || !run) return;
      const seed = seedSource();
      run = rerollFamilyRun(run, {
        seed: seed === run.state.seed ? (seed + 1) >>> 0 : seed,
      });
      publish({
        reveal: presentReveal(run),
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
    choose: (choiceId: string, occurrenceKey: string) => {
      const decision = snapshot.decision;
      if (snapshot.busy || needsSave || !decision || decision.key !== occurrenceKey ||
          decision.status !== "ready") return Promise.resolve();
      publish({ decision: { ...decision, status: "submitting" } });
      return operate("儲存中…", () => {
        if (
          !state ||
          needsSave ||
          snapshot.page !== "game" ||
          snapshot.decision?.key !== occurrenceKey ||
          !getPlayerView(state, content).pendingEvent
        )
          return;
        execute({ type: "CHOOSE", choiceId });
      });
    },
    retryDecisionSave: (occurrenceKey: string): Promise<void> => {
      if (snapshot.decision?.key !== occurrenceKey || !needsSave)
        return Promise.resolve();
      return session.retrySave();
    },
    reloadDecision: (occurrenceKey: string) => {
      if (snapshot.decision?.key === occurrenceKey && needsSave) session.home();
    },
    setDirection: (directionId: FamilyLifeDirectionId) => {
      const generation = storyGeneration;
      const applyDirection = () => operate("儲存中…", () => {
          if (generation !== storyGeneration) return;
          if (!state || snapshot.page !== "game" || getPlayerView(state, content).completed) return;
          execute({ type: "SET_FAMILY_LIFE_DIRECTION", directionId });
        });
      const immediate = pendingDirections === 0 && !snapshot.busy && !needsSave;
      pendingDirections++;
      const operation = immediate ? applyDirection() : directionQueue.then(async () => {
        await waitForDirection();
        await applyDirection();
      });
      directionQueue = operation.finally(() => { pendingDirections--; });
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
