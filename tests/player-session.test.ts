import { expect, it } from "vitest";
import { createPlayerSession } from "../src/ui/player-session.js";
import {
  createLocalSaveStore,
  LOCAL_SAVE_KEY,
} from "../src/persistence/index.js";
import { createFamilyRun } from "../src/engine/index.js";
import { serializeGame } from "../src/persistence/index.js";

const memory = () => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
};

it("saves every rapid direction switch in order and restores the pending story", async () => {
  const storage = memory();
  const session = createPlayerSession(createLocalSaveStore(storage), () => 42);
  await session.check(); await session.newStory(); session.reveal(); await session.startFamily();
  const before = session.getSnapshot().game!;
  const writes: string[] = [];
  const original = storage.setItem;
  storage.setItem = (key, value) => { writes.push(JSON.parse(value).state.activeFamilyLifeDirectionId); original(key, value); };
  await Promise.all([session.setDirection("parent-child-time"), session.setDirection("work-and-finances"),
    session.setDirection("life-exploration")]);
  expect(writes).toEqual(["parent-child-time", "work-and-finances", "life-exploration"]);
  const after = session.getSnapshot().game!;
  expect(after).toEqual({ ...before, activeFamilyLifeDirectionId: "life-exploration" });
  const restored = createPlayerSession(createLocalSaveStore(storage));
  await restored.check(); await restored.resume();
  expect(restored.getSnapshot().game).toEqual(after);
});

it("keeps an unsaved direction visible, blocks progression, and retries without replaying", async () => {
  const storage = memory();
  let fail = false;
  const store = createLocalSaveStore({ ...storage, setItem: (key, value) => {
    if (fail) throw new DOMException("full", "QuotaExceededError");
    storage.setItem(key, value);
  } });
  const session = createPlayerSession(store, () => 42);
  await session.check(); await session.newStory(); session.reveal(); await session.startFamily();
  const raw = storage.getItem(LOCAL_SAVE_KEY);
  fail = true;
  await session.setDirection("caregiver-wellbeing");
  const unsaved = session.getSnapshot().game;
  expect(unsaved!.activeFamilyLifeDirectionId).toBe("caregiver-wellbeing");
  expect(session.getSnapshot().error).toContain("尚未儲存");
  expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(raw);
  await session.choose("coordinate");
  expect(session.getSnapshot().game).toEqual(unsaved);
  fail = false; await session.retrySave();
  expect(store.load()).toMatchObject({ status: "restored", state: { activeFamilyLifeDirectionId: "caregiver-wellbeing" } });
  expect(session.getSnapshot().game).toEqual(unsaved);
});

it("keeps previews unsaved, saves the revealed family, and restores the exact pending choice", async () => {
  const storage = memory();
  const session = createPlayerSession(createLocalSaveStore(storage), () => 42);
  expect(session.getSnapshot().home.kind).toBe("checking");
  await session.check();
  await session.newStory();
  session.reveal();
  expect(storage.data.size).toBe(0);
  await session.startFamily();
  const before = session.getSnapshot().game!;
  expect(before.pendingEvent?.title).toBeTruthy();
  const restored = createPlayerSession(createLocalSaveStore(storage));
  await restored.check();
  await restored.resume();
  expect(restored.getSnapshot().game).toEqual(before);
  expect(storage.getItem(LOCAL_SAVE_KEY)).toBeTruthy();
});

it("never overwrites a newer tab's progress when a failed save is retried", async () => {
  const storage = memory();
  const session = createPlayerSession(createLocalSaveStore(storage), () => 42);
  await session.check();
  await session.newStory();
  session.reveal();
  await session.startFamily();
  const other = createPlayerSession(createLocalSaveStore(storage));
  await other.check();
  await other.resume();
  await other.choose("coordinate");
  const latest = storage.getItem(LOCAL_SAVE_KEY);
  await session.choose("carry");
  expect(session.getSnapshot().error).toContain("存檔已改變");
  await session.retrySave();
  expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(latest);
});

it("requires fresh consent when another tab changes a story during confirmation or opening", async () => {
  const storage = memory();
  storage.setItem(LOCAL_SAVE_KEY, "corrupt-original");
  const session = createPlayerSession(createLocalSaveStore(storage), () => 42);
  await session.check();
  await session.newStory();
  storage.setItem(LOCAL_SAVE_KEY, "newer-original");
  await session.confirmNew();
  expect(session.getSnapshot().page).toBe("home");
  expect(session.getSnapshot().dialog).toBe("confirm");
  await session.confirmNew();
  session.reveal();
  storage.setItem(LOCAL_SAVE_KEY, "even-newer-original");
  await session.startFamily();
  expect(session.getSnapshot().page).toBe("home");
  expect(storage.getItem(LOCAL_SAVE_KEY)).toBe("even-newer-original");
});

it("deduplicates commands and allows quota errors to retry without replaying a choice", async () => {
  const storage = memory();
  let fail = false;
  const store = createLocalSaveStore({
    ...storage,
    setItem: (key, value) => {
      if (fail) throw new DOMException("full", "QuotaExceededError");
      storage.setItem(key, value);
    },
  });
  const session = createPlayerSession(store, () => 42);
  await session.check();
  await session.newStory();
  session.reveal();
  await session.startFamily();
  fail = true;
  await Promise.all([
    session.choose("coordinate"),
    session.choose("coordinate"),
  ]);
  expect(session.getSnapshot().game!.choices).toHaveLength(1);
  expect(session.getSnapshot().canRetrySave).toBe(true);
  fail = false;
  await session.retrySave();
  expect(session.getSnapshot().status).toBe("已儲存");
  const restored = store.load();
  expect(
    restored.status === "restored" && restored.state.choiceHistory,
  ).toHaveLength(1);
});

it("never navigates to the game when preserving an original during migration fails", async () => {
  const storage = memory();
  const original = JSON.stringify(createFamilyRun({ seed: 42 }).state);
  storage.setItem(LOCAL_SAVE_KEY, original);
  const session = createPlayerSession(
    createLocalSaveStore({
      ...storage,
      setItem: () => {
        throw new Error("blocked");
      },
    }),
  );
  await session.check();
  expect(session.getSnapshot().home.kind).toBe("migration");
  await session.migrate();
  expect(session.getSnapshot().page).toBe("home");
  expect(session.getSnapshot().dialog).toBe("recovery");
  expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(original);
});

it("rerolls a restored family before the first stage and starts that family", async () => {
  const storage = memory();
  storage.setItem(
    LOCAL_SAVE_KEY,
    serializeGame(createFamilyRun({ seed: 42 }).state),
  );
  const session = createPlayerSession(createLocalSaveStore(storage), () => 43);
  await session.check();
  await session.resume();
  session.reroll();
  expect(session.getSnapshot().reveal!.seed).toBe(43);
  await session.startFamily();
  const restored = createLocalSaveStore(storage).load();
  expect(restored.status === "restored" && restored.state.seed).toBe(43);
});

it("retries the exact final state after a later automatic-node checkpoint fails", async () => {
  const storage = memory();
  let remaining = Infinity;
  const store = createLocalSaveStore({
    ...storage,
    setItem: (key, value) => {
      if (remaining-- <= 0)
        throw new DOMException("full", "QuotaExceededError");
      storage.setItem(key, value);
    },
  });
  const session = createPlayerSession(store, () => 42);
  await session.check();
  await session.newStory();
  session.reveal();
  await session.startFamily();
  remaining = 2;
  await session.choose("coordinate");
  const history = session.getSnapshot().game!.history;
  expect(session.getSnapshot().status).toBe("儲存失敗");
  remaining = Infinity;
  await session.retrySave();
  expect(session.getSnapshot().status).toBe("已儲存");
  const restored = store.load();
  expect(restored.status === "restored" && restored.state.history).toEqual(
    history,
  );
});

it("offers recovery when a valid save references content unavailable in this build", async () => {
  const storage = memory();
  const state = {
    ...createFamilyRun({ seed: 42 }).state,
    currentAgeStageId: "another-edition-stage",
  };
  const raw = serializeGame(state);
  storage.setItem(LOCAL_SAVE_KEY, raw);
  const session = createPlayerSession(createLocalSaveStore(storage));
  await session.check();
  expect(session.getSnapshot().home.kind).toBe("incompatible");
  expect(session.getSnapshot().home.primary).toBe("查看恢復選項");
  expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(raw);
});
