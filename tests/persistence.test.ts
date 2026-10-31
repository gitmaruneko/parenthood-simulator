import { afterEach, describe, expect, it, vi } from "vitest";
import { AGE_STAGE_MONTHS, contentPackSchema, type GameState } from "../src/domain/schemas.js";
import { createFamilyRun, transitionGame, type EngineInput } from "../src/engine/index.js";
import { LOCAL_SAVE_KEY, createLocalSaveStore, restoreGame, serializeGame, transitionAndSave, type SaveStorage } from "../src/persistence/index.js";
import { legacyState } from "./helpers/legacy-state.js";
import { unknownActorProfiles } from "../src/domain/actor-profiles.js";

class MemoryStorage implements SaveStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

const run = createFamilyRun({ seed: 123456789 });
const content = contentPackSchema.parse({
  schemaVersion: 1, entryEventIds: ["planning"], requiredEventIds: ["planning"],
  fallbackEventId: "fallback",
  ageStages: AGE_STAGE_MONTHS.map((childAgeMonths, order) => ({
    id: `age-stage-${order + 1}`, order, childAgeMonths,
    entryEventIds: order === 0 ? ["planning"] : ["fallback"],
  })),
  actors: run.actors.map((actor) => ({ ...actor, availability: 1 })),
  events: [
    {
      id: "planning", ageStageId: "age-stage-1", kind: "choice", mode: "PLAYER_INPUT_REQUIRED",
      title: "安排交接", text: "記住時間並安排交接。", weight: 1,
      actorIds: ["child-1"], reactionPoolIds: ["responses"],
      choices: [
        { id: "arrange", text: "安排並追蹤", anticipatedJudgment: "會不會太在意？",
          planningLoadDelta: 3, tendencyDeltas: { coordination: 1 }, setFlags: ["arranged"],
          relationshipMemories: [{ id: "handoff", category: "care", text: "你確認了交接。" }],
          scheduledFollowUps: [{ eventId: "support", delayTurns: 1, priority: 5 }] },
        { id: "rest", text: "先休息" },
      ],
    },
    {
      id: "support", ageStageId: "age-stage-1", kind: "support", mode: "AUTO_ADVANCE",
      title: "有人接手", text: "有人接手了安排。", weight: 1, planningLoadDelta: -2,
      storyEntries: [{ kind: "support", text: "今天的事情有人幫忙記住。" }],
    },
    {
      id: "fallback", ageStageId: "age-stage-1", kind: "routine", mode: "AUTO_ADVANCE",
      title: "日常", text: "日子繼續。", weight: 1,
    },
  ],
  reactionPools: [{ id: "responses", entries: [
    { id: "thanks", kind: "support", text: "謝謝你記得。", weight: 1,
      actorRoles: ["child", "partner", "grandparent"], resourceDeltas: { support: 2 } },
    { id: "quiet", kind: "neutral", text: "家人點點頭。", weight: 1,
      actorRoles: ["child", "partner", "grandparent"] },
  ] }],
});

const continueGame = (initial: GameState, inputs: EngineInput[]) => {
  let state = initial;
  return inputs.map((input) => {
    const result = transitionGame(state, content, input);
    state = result.state;
    return result;
  });
};

const restoredState = (rawData: string): GameState => {
  const restored = restoreGame(rawData);
  expect(restored.status).toBe("restored");
  if (restored.status !== "restored") throw new Error("expected a restorable save");
  return restored.state;
};

describe("Save / Restore Boundary", () => {
  it("restores a pending choice with current PRNG state and identical future reactions and events", () => {
    const waiting = transitionGame(run.state, content, { type: "ADVANCE" });
    expect(waiting.pendingEvent?.id).toBe("planning");
    expect(waiting.state.rngState).not.toBe(waiting.state.seed);
    const restored = restoredState(serializeGame(waiting.state));
    expect(restored).toEqual(waiting.state);
    const inputs: EngineInput[] = [
      { type: "CHOOSE", choiceId: "arrange" }, { type: "END_TURN" },
      { type: "START_TURN" }, { type: "ADVANCE" },
    ];
    const uninterrupted = continueGame(waiting.state, inputs);
    expect(uninterrupted[0]?.results[0]?.reactions).toHaveLength(1);
    expect(uninterrupted[0]?.results[0]?.reactions?.[0]?.reactionId).toBeTruthy();
    expect(uninterrupted[3]?.state.completedEventIds).toContain("support");
    expect(continueGame(restored, inputs)).toEqual(uninterrupted);
  });

  it("continues from a Turn boundary after recreating the store without losing narrative or scheduled work", () => {
    const [waiting, chosen, ended] = continueGame(run.state, [
      { type: "ADVANCE" }, { type: "CHOOSE", choiceId: "arrange" }, { type: "END_TURN" },
    ]);
    const state = ended!.state;
    expect(state.turn?.status).toBe("completed");
    expect(state.planningLoad).toBe(3);
    expect(state.flags).toContain("arranged");
    expect(state.relationshipMemories).toHaveLength(1);
    expect(state.scheduledFollowUps[0]?.status).toBe("pending");
    expect(state.choiceHistory[0]?.anticipatedJudgment).toBe("會不會太在意？");
    expect(chosen!.state.reactionHistory).toHaveLength(1);
    expect(waiting!.state.rngState).not.toBe(run.state.rngState);
    const storage = new MemoryStorage();
    const store = createLocalSaveStore(storage);
    expect(store.load().status).toBe("empty");
    expect(store.save(state, null).status).toBe("saved");
    const reloaded = createLocalSaveStore(storage).load();
    expect(reloaded.status).toBe("restored");
    if (reloaded.status !== "restored") throw new Error("expected a restorable save");
    expect(reloaded.state).toEqual(state);
    const actions: EngineInput[] = [{ type: "START_TURN" }, { type: "ADVANCE" }];
    expect(continueGame(reloaded.state, actions)).toEqual(continueGame(state, actions));
  });

  it("explicitly migrates the unwrapped version-1 GameState without resetting randomness or progress", () => {
    const [waiting, chosen] = continueGame(run.state, [
      { type: "ADVANCE" }, { type: "CHOOSE", choiceId: "arrange" },
    ]);
    const legacy = JSON.stringify(legacyState(chosen!.state));
    const profiles = unknownActorProfiles(chosen!.state.family);
    const expected = { ...legacyState(chosen!.state), actorProfiles: profiles,
      replayOrigin: { ...chosen!.state.replayOrigin!, actorProfiles: profiles } };
    const restored = restoreGame(legacy);
    expect(restored).toMatchObject({ status: "restored", migratedFrom: 1, rawData: legacy,
      state: expected });
    expect(restoredState(serializeGame(restoredState(legacy)))).toEqual(expected);
    expect(waiting!.state.rngState).not.toBe(chosen!.state.rngState);
    const actions: EngineInput[] = [
      { type: "END_TURN" }, { type: "START_TURN" }, { type: "ADVANCE" },
    ];
    expect(continueGame(restoredState(legacy), actions)).toEqual(continueGame(expected, actions));
  });

  it.each([
    ["future save", JSON.stringify({ schemaVersion: 99, state: run.state })],
    ["future GameState", JSON.stringify({ ...run.state, schemaVersion: 99 })],
    ["future nested GameState", JSON.stringify({ schemaVersion: 2, state: { ...run.state, schemaVersion: 99 } })],
  ])("reports an incompatible %s without changing or discarding the raw data", (_label, rawData) => {
    const storage = new MemoryStorage();
    storage.setItem(LOCAL_SAVE_KEY, rawData!);
    const store = createLocalSaveStore(storage);
    const result = store.load();
    expect(result).toMatchObject({ status: "error", rawData,
      error: { code: "incompatible-version", message: expect.stringContaining("版本") } });
    expect(store.save(run.state, rawData!).status).toBe("error");
    expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(rawData);
  });

  it.each([
    ["truncated JSON", "{\"schemaVersion\":"],
    ["empty JSON", "null"],
    ["missing PRNG state", JSON.stringify({ ...run.state, rngState: undefined })],
    ["invalid PRNG state", JSON.stringify({ ...run.state, rngState: -1 })],
    ["unknown fields", JSON.stringify({ ...run.state, unexpected: true })],
    ["mismatched Turn", JSON.stringify({ ...run.state, currentTurnId: "missing-turn" })],
  ])("preserves %s and requires an informed recovery instead of silently starting over", (_label, rawData) => {
    const storage = new MemoryStorage();
    storage.setItem(LOCAL_SAVE_KEY, rawData!);
    const store = createLocalSaveStore(storage);
    expect(store.load()).toMatchObject({ status: "error", rawData,
      error: { code: "invalid-data", message: expect.stringContaining("保留") } });
    expect(store.save(run.state, rawData!).status).toBe("error");
    expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(rawData);
  });

  it("starts a new game only through acknowledged recovery and preserves each original save", () => {
    const storage = new MemoryStorage();
    const store = createLocalSaveStore(storage);
    const broken = "{broken story";
    storage.setItem(LOCAL_SAVE_KEY, broken);
    expect(store.save(run.state, broken).status).toBe("error");
    const recovered = store.replaceAfterConfirmation(run.state, broken);
    expect(recovered.status).toBe("saved");
    if (recovered.status !== "saved") throw new Error("expected recovery");
    expect(recovered.preservedKey).toBeTruthy();
    expect(storage.getItem(recovered.preservedKey!)).toBe(broken);
    expect(store.load()).toMatchObject({ status: "restored", state: run.state });

    const unsupported = JSON.stringify({ schemaVersion: 99 });
    storage.setItem(LOCAL_SAVE_KEY, unsupported);
    const next = store.replaceAfterConfirmation(run.state, unsupported);
    expect(next.status).toBe("saved");
    if (next.status !== "saved") throw new Error("expected recovery");
    expect(next.preservedKey).not.toBe(recovered.preservedKey);
    expect(storage.getItem(next.preservedKey!)).toBe(unsupported);
    expect(storage.getItem(recovered.preservedKey!)).toBe(broken);
  });

  it("retains the original version-1 bytes before explicitly committing a migration", () => {
    const storage = new MemoryStorage();
    const legacy = JSON.stringify(legacyState(transitionGame(run.state, content, { type: "ADVANCE" }).state));
    storage.setItem(LOCAL_SAVE_KEY, legacy);
    const store = createLocalSaveStore(storage);
    const loaded = store.load();
    expect(loaded).toMatchObject({ status: "restored", migratedFrom: 1 });
    expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(legacy);
    expect(store.save(restoredState(legacy), legacy)).toMatchObject({ status: "error",
      error: { code: "recovery-required" } });
    const migrated = store.migrate(legacy);
    expect(migrated.status).toBe("saved");
    if (migrated.status !== "saved") throw new Error("expected migration");
    expect(storage.getItem(migrated.preservedKey!)).toBe(legacy);
    expect(store.load()).toMatchObject({ status: "restored", migratedFrom: null,
      state: restoredState(legacy) });
    expect(createLocalSaveStore(storage).load()).toEqual(store.load());
  });

  it("requires confirmation to replace an existing family run and rejects stale confirmation", () => {
    const storage = new MemoryStorage();
    const store = createLocalSaveStore(storage);
    const first = store.save(run.state, null);
    if (first.status !== "saved") throw new Error("expected save");
    const newRun = createFamilyRun({ seed: 42 }).state;
    expect(store.save(newRun, first.rawData)).toMatchObject({ status: "error",
      error: { code: "recovery-required" } });
    expect(store.save(newRun, null)).toMatchObject({ status: "error", error: { code: "save-changed" } });
    const updated = store.save(transitionGame(run.state, content, { type: "ADVANCE" }).state, first.rawData);
    if (updated.status !== "saved") throw new Error("expected save");
    expect(store.replaceAfterConfirmation(newRun, first.rawData)).toMatchObject({ status: "error",
      error: { code: "save-changed" } });
    expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(updated.rawData);
    const replaced = store.replaceAfterConfirmation(newRun, updated.rawData);
    if (replaced.status !== "saved") throw new Error("expected replacement");
    expect(storage.getItem(replaced.preservedKey!)).toBe(updated.rawData);
    expect(store.load()).toMatchObject({ status: "restored", state: newRun });
  });

  it("checkpoints every automatic node and Turn boundary through the persistence transition boundary", () => {
    const storage = new MemoryStorage();
    const checkpoints: GameState[] = [];
    const store = createLocalSaveStore({
      getItem: (key) => storage.getItem(key),
      setItem: (key, value) => {
        storage.setItem(key, value);
        if (key === LOCAL_SAVE_KEY) checkpoints.push(restoredState(value));
      },
    });
    let state = run.state;
    let rawData: string | null = null;
    for (const input of [
      { type: "ADVANCE" }, { type: "CHOOSE", choiceId: "arrange" }, { type: "END_TURN" },
      { type: "START_TURN" }, { type: "ADVANCE" },
    ] as EngineInput[]) {
      const result = transitionAndSave(state, content, input, store, rawData);
      expect(result.transition).toEqual(transitionGame(state, content, input));
      expect(result.save.status).toBe("saved");
      rawData = result.save.rawData;
      state = result.transition.state;
    }
    expect(checkpoints.map((state) => [state.turn?.status, state.eventProgress?.eventId])).toEqual([
      ["awaitingInput", "planning"], ["active", "planning"], ["completed", "planning"],
      ["active", undefined], ["active", "support"], ["completed", "fallback"],
    ]);
    expect(createLocalSaveStore(storage).load()).toMatchObject({ status: "restored", state });
  });

  it("keeps review data and the completed twelve-stage timeline intact", () => {
    let state = run.state;
    for (let stage = 1; stage <= 12; stage += 1) {
      if (stage === 1) {
        state = transitionGame(state, content, { type: "ADVANCE" }).state;
        state = transitionGame(state, content, { type: "CHOOSE", choiceId: "arrange" }).state;
        state = transitionGame(state, content, { type: "COMPLETE_AGE_STAGE" }).state;
      } else {
        state = transitionGame(state, content, { type: "NEXT_AGE_STAGE" }).state;
        state = transitionGame(state, content, { type: "ADVANCE" }).state;
      }
    }
    expect(state.completedAgeStages).toHaveLength(12);
    state = { ...state, review: {
      familySummary: "一起生活的家人", narrativeOverview: "記住安排，也記住支持。",
      timeline: state.completedAgeStages!.map((stage) => ({ ageStageId: stage.ageStageId,
        title: "生活的一章", storyEntryIds: stage.storyEntryIds })),
      keyMomentIds: state.history.slice(0, 3).map((entry) => entry.id),
      supportMomentIds: [], repairMomentIds: [], endStateResources: state.resources,
      themes: ["growing-together"], safeShareText: "這是我們一起生活的故事。",
    } };
    expect(restoredState(serializeGame(state))).toEqual(state);
  });

  it.each(["event-id", "node-index", "missing-input", "node-count", "turn-status"])(
    "rejects a shape-valid pending save with inconsistent %s progress", (damage) => {
      const state = structuredClone(transitionGame(run.state, content, { type: "ADVANCE" }).state);
      if (damage === "event-id") state.eventProgress!.eventId = "different-event";
      if (damage === "node-index") state.eventProgress!.nodeIndex = 2;
      if (damage === "missing-input") state.eventProgress = null;
      if (damage === "node-count") state.turn!.nodeCount = 1;
      if (damage === "turn-status") state.turn!.status = "active";
      const rawData = JSON.stringify({ schemaVersion: 2, state: legacyState(state) });
      expect(restoreGame(rawData)).toMatchObject({ status: "error", rawData,
        error: { code: "invalid-data" } });
    },
  );
});

describe("browser storage failures", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses localStorage by default and restores after a simulated page reload", () => {
    vi.stubGlobal("localStorage", new MemoryStorage());
    expect(createLocalSaveStore().save(run.state, null).status).toBe("saved");
    expect(createLocalSaveStore().load()).toMatchObject({ status: "restored", state: run.state });
  });

  it("reports blocked localStorage access as an error rather than an empty save", () => {
    vi.stubGlobal("localStorage", { getItem() { throw new Error("blocked"); } });
    const store = createLocalSaveStore();
    expect(store.load()).toMatchObject({ status: "error", error: { code: "storage-unavailable" } });
    expect(store.save(run.state, null)).toMatchObject({ status: "error",
      error: { code: "storage-unavailable" } });
  });

  it.each(["backup", "replacement"])("keeps original bytes when the %s write runs out of space", (failure) => {
    const storage = new MemoryStorage();
    const original = "{damaged";
    storage.setItem(LOCAL_SAVE_KEY, original);
    const limited: SaveStorage = {
      getItem: (key) => storage.getItem(key),
      setItem: (key, value) => {
        if (failure === "backup" || key === LOCAL_SAVE_KEY) {
          const error = new Error("full"); error.name = "QuotaExceededError"; throw error;
        }
        storage.setItem(key, value);
      },
    };
    const store = createLocalSaveStore(limited);
    expect(store.replaceAfterConfirmation(run.state, original)).toMatchObject({ status: "error",
      rawData: original, error: { code: "storage-full" } });
    expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(original);
    expect(createLocalSaveStore(storage).load()).toMatchObject({ status: "error", rawData: original });
  });

  it("retains the last complete checkpoint and the in-memory result when a later automatic save fails", () => {
    const [,, ended] = continueGame(run.state, [
      { type: "ADVANCE" }, { type: "CHOOSE", choiceId: "arrange" }, { type: "END_TURN" },
    ]);
    const initial = transitionGame(ended!.state, content, { type: "START_TURN" }).state;
    const storage = new MemoryStorage();
    let writes = 0;
    const store = createLocalSaveStore({
      getItem: (key) => storage.getItem(key),
      setItem: (key, value) => {
        writes += 1;
        if (writes > 1) { const error = new Error("full"); error.name = "QuotaExceededError"; throw error; }
        storage.setItem(key, value);
      },
    });
    const result = transitionAndSave(initial, content, { type: "ADVANCE" }, store, null);
    expect(result.save).toMatchObject({ status: "error", error: { code: "storage-full" } });
    expect(result.transition).toEqual(transitionGame(initial, content, { type: "ADVANCE" }));
    const persisted = store.load();
    expect(persisted.status).toBe("restored");
    if (persisted.status !== "restored") throw new Error("expected checkpoint");
    expect(persisted.state.eventProgress?.eventId).toBe("support");
    expect(transitionGame(persisted.state, content, { type: "ADVANCE" }).state).toEqual(result.transition.state);
  });

  it("rejects invalid state on writes before touching the existing save or recovery copy", () => {
    const storage = new MemoryStorage();
    const store = createLocalSaveStore(storage);
    const first = store.save(run.state, null);
    if (first.status !== "saved") throw new Error("expected save");
    const invalid = { ...run.state, rngState: Number.NaN };
    expect(store.save(invalid, first.rawData)).toMatchObject({ status: "error", error: { code: "invalid-data" } });
    expect(store.replaceAfterConfirmation(invalid, first.rawData)).toMatchObject({ status: "error",
      error: { code: "invalid-data" } });
    expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(first.rawData);
    expect(storage.getItem(`${LOCAL_SAVE_KEY}.preserved.0`)).toBeNull();
  });
});
