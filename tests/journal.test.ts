import { expect, it } from "vitest";
import { createFamilyRun, getPlayerView, transitionGame, projectJournal } from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";
import { restoreGame, serializeGame } from "../src/persistence/index.js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { journalMechanics } from "./helpers/journal-mechanics.js";
import { createFamilyReview } from "../src/engine/index.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY } from "../src/persistence/index.js";
import { transitionAndSave } from "../src/persistence/index.js";
import { validateContentPack } from "../src/domain/content-validation.js";

it("snapshots an accepted choice and actual results before every saved checkpoint", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const waiting = transitionGame(run.state, content, { type: "ADVANCE" });
  expect(projectJournal(waiting.state)).toEqual([]);
  const chosen = transitionGame(waiting.state, content, { type: "CHOOSE", choiceId: "coordinate" });
  const journal = projectJournal(chosen.state);
  expect(journal[0]).toMatchObject({ kind: "choice", choiceText: "把今晚需要的事列出來，協調一段可交接的時間" });
  expect(journal[0]!.text).toContain("凌晨");
  expect(journal.some(entry => entry.kind === "result" && entry.text.includes("用品"))).toBe(true);
  expect(journal.map(entry => entry.text).join("\n")).not.toContain("已經接手");
  for (const checkpoint of chosen.trace) {
    const restored = restoreGame(serializeGame(checkpoint.afterState));
    expect(restored.status).toBe("restored");
    if (restored.status !== "restored") throw new Error("checkpoint failed");
    expect(projectJournal(restored.state)).toEqual(projectJournal(checkpoint.afterState));
  }
  const before = structuredClone(chosen.state);
  projectJournal(chosen.state); getPlayerView(chosen.state, content);
  expect(chosen.state).toEqual(before);
});

it("preserves eight complete pre-T3 mechanical traces, original anchors and review selections", () => {
  const golden = JSON.parse(readFileSync(new URL("./helpers/journal-mechanics-golden.json", import.meta.url), "utf8"));
  for (const expected of golden) {
    const run = createFamilyRun({ seed: expected.seed });
    const content = createMvpContent(run.actors);
    let state = run.state;
    const hash = createHash("sha256");
    for (let step = 0; step < 250; step++) {
      const view = getPlayerView(state, content);
      if (view.completed) break;
      const input = view.pendingEvent ? { type: "CHOOSE" as const,
        choiceId: view.pendingEvent.id.endsWith("-reconnect") ? "pause" : expected.decision } : view.nextInput!;
      const next = transitionGame(state, content, input);
      hash.update(JSON.stringify({ input, results: next.results.map(({ reactions, ...result }) => ({ ...result,
        ...(reactions ? { reactions: reactions.map(({ text: _text, ...reaction }) => reaction) } : {}) })),
        trace: next.trace.map(entry => journalMechanics(entry.afterState)) }));
      state = next.state;
    }
    expect(getPlayerView(state, content).completed).toBe(true);
    expect(hash.digest("hex"), `${expected.seed}/${expected.decision}`).toBe(expected.hash);
    const review = createFamilyReview(state, content);
    expect(review.keyMomentIds.every(id => state.history.some(entry => entry.id === id))).toBe(true);
    expect(review.safeShareText).not.toContain("輪班表");
  }
});

it("migrates real v5 saves without backfilling prose and mixes old and new records in append order", () => {
  const fixtures = JSON.parse(readFileSync(new URL("./helpers/v5-journal-saves.json", import.meta.url), "utf8"));
  for (const fixture of fixtures) {
    if (fixture.state.review) fixture.state.review.keyMomentIds.reverse();
    const raw = JSON.stringify(fixture);
    const values = new Map([[LOCAL_SAVE_KEY, raw]]);
    const store = createLocalSaveStore({ getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } });
    const result = store.load();
    expect(result).toMatchObject({ status: "restored", migratedFrom: 5, state: fixture.state });
    if (result.status !== "restored") throw new Error("v5 migration failed");
    const oldJournal = projectJournal(result.state);
    expect(oldJournal.every(entry => entry.legacy)).toBe(true);
    expect(oldJournal.filter(entry => entry.kind === "choice").every(entry => entry.choiceText === "你在這次事件做了選擇。")).toBe(true);
    expect(store.migrate(raw).status).toBe("saved");
    expect(values.get(`${LOCAL_SAVE_KEY}.preserved.0`)).toBe(raw);
    expect(JSON.parse(values.get(LOCAL_SAVE_KEY)!).state).toEqual(fixture.state);
    const content = createMvpContent(fixture.state.replayOrigin.actors);
    if (getPlayerView(result.state, content).completed) {
      expect(createFamilyReview(result.state, content).keyMomentIds).toEqual(fixture.state.review.keyMomentIds);
    } else {
      const view = getPlayerView(result.state, content);
      const next = transitionGame(result.state, content, view.pendingEvent ? { type: "CHOOSE", choiceId: "coordinate" } : view.nextInput!);
      expect(next.state.history.slice(0, result.state.history.length)).toEqual(result.state.history);
      expect(projectJournal(next.state).slice(0, oldJournal.length)).toEqual(oldJournal);
    }
  }
});

it("rejects corrupted source, occurrence, actor, text and sequence references without discarding bytes", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const waiting = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const chosen = transitionGame(waiting, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
  for (const damage of [
    (item: any) => { item.sourceHistoryId = "missing"; },
    (item: any) => { item.eventHistoryId = "missing"; },
    (item: any) => { item.eventId = "different-event"; },
    (item: any) => { item.choiceHistoryIndex = 99; },
    (item: any) => { item.actorIds = ["ghost"]; },
    (item: any) => { item.sequence = 1; },
    (item: any) => { item.text = " "; },
    (item: any) => { item.choiceText = "從未做過的選擇"; },
  ]) {
    const raw = JSON.parse(serializeGame(chosen));
    damage(raw.state.history[0].journal[0]);
    const bytes = JSON.stringify(raw);
    expect(restoreGame(bytes)).toMatchObject({ status: "error", rawData: bytes });
  }
  for (const version of [1, 2, 3, 4, 5]) {
    const raw = JSON.parse(serializeGame(chosen));
    raw.schemaVersion = version;
    const bytes = JSON.stringify(version === 1 ? raw.state : raw);
    expect(restoreGame(bytes)).toMatchObject({ status: "error", rawData: bytes });
  }
});

it("shows no fabricated reaction and does not guess legacy repeated-event choice pairings", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  content.reactionPools[0]!.entries = content.reactionPools[0]!.entries.filter(entry => entry.kind === "none");
  const waiting = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const chosen = transitionGame(waiting, content, { type: "CHOOSE", choiceId: "handoff" }).state;
  const records = projectJournal(chosen);
  expect(chosen.reactionHistory![0]!.kind).toBe("none");
  expect(records).toHaveLength(2);
  expect(records[0]!.choiceText).toBe("詢問太太能否完整接手這一段");
  expect(records[1]!.text).toContain("你向太太提出完整交接的詢問");
  expect(records.map(entry => entry.text).join(" ")).not.toContain("No one responds");
  const legacy = structuredClone(chosen);
  legacy.history = legacy.history.map(({ journal: _journal, ...entry }) => entry);
  legacy.history.push({ ...legacy.history[0]!, id: "repeated-occurrence" });
  expect(projectJournal(legacy).filter(entry => entry.kind === "choice")).toHaveLength(0);
});

it("retries exactly the accepted journal after a write failure without reapplying the choice or reaction", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const waiting = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const raw = serializeGame(waiting);
  const values = new Map([[LOCAL_SAVE_KEY, raw]]);
  let fail = true;
  const store = createLocalSaveStore({ getItem: key => values.get(key) ?? null, setItem: (key, value) => {
    if (fail) throw new DOMException("full", "QuotaExceededError");
    values.set(key, value);
  } });
  const result = transitionAndSave(waiting, content, { type: "CHOOSE", choiceId: "handoff" }, store, raw);
  expect(result.save.status).toBe("error");
  const journal = projectJournal(result.transition.state);
  expect(values.get(LOCAL_SAVE_KEY)).toBe(raw);
  fail = false;
  expect(store.save(result.transition.state, raw).status).toBe("saved");
  const loaded = store.load();
  expect(loaded.status).toBe("restored");
  if (loaded.status !== "restored") throw new Error("retry failed");
  expect(loaded.state).toEqual(result.transition.state);
  expect(projectJournal(loaded.state)).toEqual(journal);
});

it("validates bound journal context and consequence actors through the content boundary", () => {
  const content = createMvpContent();
  content.events[0]!.journalContext = { text: "未知人物", actorText: { actorId: "ghost", prefix: "", suffix: "" } };
  expect(validateContentPack(content).success).toBe(false);
  delete content.events[0]!.journalContext;
  content.events[0]!.choices[0]!.storyEntries![0]!.actorText = { actorId: "ghost", prefix: "", suffix: "" };
  expect(validateContentPack(content).success).toBe(false);
});

it("links only actual observed reactions and keeps snapshots independent of later content edits", () => {
  let found = false;
  for (let seed = 0; seed < 32; seed++) {
    const run = createFamilyRun({ seed });
    const content = createMvpContent(run.actors);
    const waiting = transitionGame(run.state, content, { type: "ADVANCE" }).state;
    const chosen = transitionGame(waiting, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
    const observed = chosen.history.flatMap(entry => entry.journal ?? [])
      .filter(item => item.kind === "result" && item.reactionHistoryIndex !== undefined);
    if (!observed.length) continue;
    found = true;
    for (const item of observed) {
      if (item.kind !== "result") throw new Error("expected result");
      const reaction = chosen.reactionHistory![item.reactionHistoryIndex!]!;
      expect(reaction.kind).not.toBe("none");
      expect(item.actorIds).toEqual([reaction.actorId]);
      expect(item.text).toContain(reaction.text);
    }
    const snapshot = projectJournal(chosen);
    content.events[0]!.text = "之後的內容版本完全不同。";
    content.events[0]!.choices[0]!.text = "之後改寫的選項。";
    const restored = restoreGame(serializeGame(chosen));
    if (restored.status !== "restored") throw new Error("reaction snapshot failed");
    expect(projectJournal(restored.state)).toEqual(snapshot);
    const raw = JSON.parse(serializeGame(chosen));
    const row = raw.state.history.find((entry: any) => entry.journal?.some((item: any) => item.reactionHistoryIndex !== undefined));
    row.journal[0].reactionHistoryIndex = 999;
    expect(restoreGame(JSON.stringify(raw)).status).toBe("error");
    break;
  }
  expect(found).toBe(true);
});
