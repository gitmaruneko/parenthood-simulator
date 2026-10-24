import { expect, it } from "vitest";
import { createPlayerSession } from "../src/ui/player-session.js";
import {
  createLocalSaveStore,
  LOCAL_SAVE_KEY,
} from "../src/persistence/index.js";
import { createFamilyRun } from "../src/engine/index.js";
import { serializeGame } from "../src/persistence/index.js";
import { completedStory } from "./helpers/completed-story.js";

it("restores the review, saves selected moments and confirms a seed replay before replacing", async () => {
  const { state } = completedStory();
  const storage = memory();
  storage.setItem(LOCAL_SAVE_KEY, serializeGame(state));
  const store = createLocalSaveStore(storage);
  const session = createPlayerSession(store, () => 43);
  await session.check(); await session.resume("records");
  const game = session.getSnapshot().game!;
  expect(game.review!.timeline).toHaveLength(12);
  const ids = [...game.review!.keyMomentIds].reverse();
  await session.selectMoments(ids);
  const restored = createPlayerSession(store);
  await restored.check(); await restored.resume();
  expect(restored.getSnapshot().game!.review!.keyMomentIds).toEqual(ids);
  const raw = storage.getItem(LOCAL_SAVE_KEY);
  await session.replay();
  expect(session.getSnapshot().dialog).toBe("confirm");
  session.closeDialog();
  expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(raw);
  await session.replay(); await session.confirmNew();
  expect(session.getSnapshot().reveal!.seed).toBe(42);
  expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(raw);
  await session.startFamily();
  const replayed = store.load();
  expect(replayed.status === "restored" && replayed.state.seed).toBe(42);
  expect(session.getSnapshot().game!.review).toBeNull();
  expect(session.getSnapshot().game!.choices).toHaveLength(0);
});

it("retries selected moments without advancing and refuses replay over another tab's save", async () => {
  const { state } = completedStory();
  const storage = memory();
  storage.setItem(LOCAL_SAVE_KEY, serializeGame(state));
  let fail = false;
  const store = createLocalSaveStore({ ...storage, setItem: (key, value) => {
    if (fail) throw new DOMException("full", "QuotaExceededError");
    storage.setItem(key, value);
  } });
  const session = createPlayerSession(store);
  await session.check(); await session.resume();
  const ids = [...session.getSnapshot().game!.review!.keyMomentIds].reverse();
  fail = true;
  await session.selectMoments(ids);
  expect(session.getSnapshot().canRetrySave).toBe(true);
  expect(session.getSnapshot().game!.review!.keyMomentIds).toEqual(ids);
  fail = false; await session.retrySave();
  const saved = store.load();
  expect(saved.status === "restored" && saved.state.review!.keyMomentIds).toEqual(ids);
  expect(saved.status === "restored" && saved.state.rngState).toBe(state.rngState);
  const newer = serializeGame({ ...state, planningLoad: state.planningLoad + 1 });
  storage.setItem(LOCAL_SAVE_KEY, newer);
  await session.replay();
  expect(session.getSnapshot().dialog).toBeNull();
  expect(session.getSnapshot().error).toContain("存檔已改變");
  expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(newer);
});

it("starts the new-family opening only after confirmation while preserving the completed story", async () => {
  const { state } = completedStory();
  const storage = memory();
  const original = serializeGame(state);
  storage.setItem(LOCAL_SAVE_KEY, original);
  const session = createPlayerSession(createLocalSaveStore(storage), () => 43);
  await session.check(); await session.resume(); await session.newStory();
  session.closeDialog();
  expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(original);
  await session.newStory(); await session.confirmNew();
  expect(session.getSnapshot().page).toBe("assessment");
  session.reveal();
  expect(session.getSnapshot().reveal!.seed).toBe(43);
  expect(storage.getItem(LOCAL_SAVE_KEY)).toBe(original);
  await session.startFamily();
  expect(session.getSnapshot().game!.review).toBeNull();
});

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

it("restores each person's own memories and dates earlier reactions without changing their age", async () => {
  const run = createFamilyRun({ seed: 42 });
  const adultId = run.state.family.persistentActorIds[0]!;
  const storage = memory();
  storage.setItem(LOCAL_SAVE_KEY, serializeGame({
    ...run.state, currentAgeStageId: "age-stage-8",
    history: [{ id: "remembered-reaction", kind: "reaction", text: "對方說週末能來幫忙。",
      ageStageId: "age-stage-1", turnId: "remembered-turn" }],
    reactionHistory: [{ poolId: "everyday-responses", reactionId: "understanding", actorId: adultId,
      kind: "understanding", text: "對方說週末能來幫忙。", eventId: "night-handoff-choice",
      ageStageId: "age-stage-1", turnId: "remembered-turn" }],
    relationshipMemories: [
      { id: "family-note", category: "care", text: "這是全家的紀錄。", createdAtAgeStageId: "age-stage-1" },
      { id: "adult-note", actorId: adultId, category: "support", text: "你們確認了週末幫忙的時間。", createdAtAgeStageId: "age-stage-1" },
      { id: "child-note", actorId: run.state.family.childId, category: "connection", text: "孩子拉著你的手。", createdAtAgeStageId: "age-stage-1" },
    ],
  }));
  const session = createPlayerSession(createLocalSaveStore(storage));
  await session.check(); await session.resume();
  const game = session.getSnapshot().game!;
  const adult = game.members.find((member) => member.id === adultId)!;
  expect(adult).toMatchObject({ recent: "對方說週末能來幫忙。", recentTimeLabel: "2 個月 1 天",
    memories: ["你們確認了週末幫忙的時間。"] });
  expect(game.members[0]).toMatchObject({ ageLabel: "3 歲 3 個月", recentTimeLabel: null,
    memories: ["孩子拉著你的手。"] });
});

it("presents only generated family members with relationships and the child's current age", async () => {
  const covered = new Set<string>();
  for (let seed = 0; seed < 64 && covered.size < 3; seed++) {
    const run = createFamilyRun({ seed });
    if (covered.has(run.state.family.householdComposition)) continue;
    covered.add(run.state.family.householdComposition);
    const session = createPlayerSession(createLocalSaveStore(memory()), () => seed);
    await session.check(); await session.newStory(); session.reveal(); await session.startFamily();
    const game = session.getSnapshot().game!;
    expect(game.members.map((member) => member.id)).toEqual(run.actors.map((actor) => actor.id));
    expect(game.members[0]).toMatchObject({ displayName: "孩子", relationship: "你的孩子", ageLabel: "2 個月" });
    for (const member of game.members.slice(1)) {
      expect(member.ageLabel).toBeNull();
      expect(member.context.join("")).toContain("家庭照顧安排");
      expect(member.context.join("")).toContain("家庭工作安排");
    }
    if (run.state.family.householdComposition === "singleCaregiver") {
      expect(game.members).toHaveLength(2);
      expect(game.members[1]!.relationship).toBe("不同住的支持家人");
      expect(game.pendingEvent!.choices.map((choice) => choice.id)).not.toContain("handoff");
    } else if (run.state.family.householdComposition === "twoCaregivers") {
      expect(game.members).toHaveLength(2);
      expect(game.members[1]!.relationship).toBe("共同照顧者");
      expect(game.pendingEvent!.choices.map((choice) => choice.id)).not.toContain("ask-family");
    } else {
      expect(game.members).toHaveLength(3);
      expect(game.members[2]!.relationship).toBe("同住長輩");
    }
    const before = game.members.map((member) => ({ ...member }));
    await session.choose("coordinate");
    const after = session.getSnapshot().game!;
    for (const member of after.members) {
      const reaction = after.reactions.filter((entry) => entry.actorId === member.id).at(-1);
      expect(member.recent).toBe(reaction?.text ?? null);
    }
    expect(game.members).toEqual(before);
    // Age is read from the persisted stage, rather than fixed at generation.
    const storage = memory();
    storage.setItem(LOCAL_SAVE_KEY, serializeGame({ ...run.state, currentAgeStageId: "age-stage-8" }));
    const older = createPlayerSession(createLocalSaveStore(storage));
    await older.check(); await older.resume();
    expect(older.getSnapshot().game!.members[0]!.ageLabel).toBe("3 歲 3 個月");
  }
  expect(covered.size).toBe(3);
}, 15000);

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

it("reserves direction submission before a same-tick choice can overtake it", async () => {
  const storage = memory();
  const session = createPlayerSession(createLocalSaveStore(storage), () => 42);
  await session.check(); await session.newStory(); session.reveal(); await session.startFamily();
  const change = session.setDirection("parent-child-time");
  await session.choose("coordinate");
  await change;
  expect(session.getSnapshot().game!.choices).toHaveLength(0);
  expect(session.getSnapshot().game!.activeFamilyLifeDirectionId).toBe("parent-child-time");
});

it.each(["retry", "reload"])("handles failed and queued switches safely on %s", async (recovery) => {
  const storage = memory();
  let fail = false;
  const store = createLocalSaveStore({ ...storage, setItem: (key, value) => {
    if (fail) throw new DOMException("full", "QuotaExceededError");
    storage.setItem(key, value);
  } });
  const session = createPlayerSession(store, () => 42);
  await session.check(); await session.newStory(); session.reveal(); await session.startFamily();
  const before = session.getSnapshot().game!;
  fail = true;
  const first = session.setDirection("parent-child-time");
  const queued = session.setDirection("life-exploration");
  await first;
  expect(session.getSnapshot().canRetrySave).toBe(true);
  fail = false;
  if (recovery === "retry") await session.retrySave();
  else {
    session.home();
    // check() invoked by home owns the busy operation until its promise settles.
    await new Promise<void>((resolve) => {
      const done = () => { if (!session.getSnapshot().busy) { unsubscribe(); resolve(); } };
      const unsubscribe = session.subscribe(done); done();
    });
    await session.resume();
  }
  await queued;
  const expected = recovery === "retry" ? "life-exploration" : "flexible";
  expect(session.getSnapshot().game).toEqual({ ...before, activeFamilyLifeDirectionId: expected });
  expect(store.load()).toMatchObject({ status: "restored", state: { activeFamilyLifeDirectionId: expected } });
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
