import { expect, it, vi } from "vitest";
import { createFamilyRun, transitionGame } from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY, serializeGame } from "../src/persistence/index.js";
import { createPlayerSession } from "../src/ui/player-session.js";

it("retains the accepted occurrence after failed persistence and retries only its exact result", async () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const original = serializeGame(pending);
  const values = new Map([[LOCAL_SAVE_KEY, original]]);
  let fail = true;
  const store = createLocalSaveStore({ getItem: key => values.get(key) ?? null, setItem: (key, value) => {
    if (fail) throw new DOMException("full", "QuotaExceededError");
    values.set(key, value);
  } });
  const session = createPlayerSession(store);
  await session.check(); await session.resume();
  const decision = session.getSnapshot().decision!;
  expect(decision).toMatchObject({ status: "ready", event: { id: pending.turn!.activeEventId } });
  const operation = session.choose("coordinate", decision.key);
  expect(session.getSnapshot().decision!.status).toBe("submitting");
  await session.choose("carry", decision.key);
  await operation;
  expect(session.getSnapshot().game!.pendingEvent).toBeNull();
  expect(session.getSnapshot().decision).toMatchObject({ key: decision.key, status: "unsaved" });
  expect(session.getSnapshot().decision!.records.some(row => row.kind === "choice")).toBe(true);
  expect(session.getSnapshot().hasUnsavedChanges).toBe(true);
  const accepted = session.getSnapshot().game!;
  await session.choose("carry", decision.key); await session.advance();
  expect(session.getSnapshot().game!.history).toEqual(accepted.history);
  expect(values.get(LOCAL_SAVE_KEY)).toBe(original);
  fail = false;
  await session.retryDecisionSave(decision.key);
  expect(session.getSnapshot().decision).toBeNull();
  expect(session.getSnapshot().hasUnsavedChanges).toBe(false);
  const expected = transitionGame(pending, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
  expect(JSON.parse(values.get(LOCAL_SAVE_KEY)!).state).toEqual(expected);
});

it("can retry the pending checkpoint before choosing, without accepting any option", async () => {
  const original = serializeGame(createFamilyRun({ seed: 42 }).state);
  const values = new Map([[LOCAL_SAVE_KEY, original]]);
  let fail = true;
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => {
      if (fail && JSON.parse(value).state.turn?.status === "awaitingInput") throw new Error("denied");
      values.set(key, value);
    } }));
  await session.check(); await session.resume(); await session.startFamily();
  const decision = session.getSnapshot().decision!;
  expect(decision.status).toBe("ready");
  expect(session.getSnapshot().hasUnsavedChanges).toBe(true);
  fail = false;
  await session.retryDecisionSave(decision.key);
  expect(session.getSnapshot().hasUnsavedChanges).toBe(false);
  expect(session.getSnapshot().decision!.key).toBe(decision.key);
  expect(JSON.parse(values.get(LOCAL_SAVE_KEY)!).state.choiceHistory).toHaveLength(0);
});

it("keeps a rejected choice retryable and ignores callbacks from an older run or occurrence", async () => {
  const run = createFamilyRun({ seed: 42 });
  const pending = transitionGame(run.state, createMvpContent(run.actors), { type: "ADVANCE" }).state;
  const original = serializeGame(pending);
  const values = new Map([[LOCAL_SAVE_KEY, original]]);
  let fail = false;
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { if (fail) throw new Error("denied"); values.set(key, value); } }));
  await session.check(); await session.resume();
  const first = session.getSnapshot().decision!;
  await session.choose("nonexistent-choice", first.key);
  expect(session.getSnapshot().decision).toMatchObject({ key: first.key, status: "ready" });
  expect(session.getSnapshot().error).toBeTruthy();
  expect(values.get(LOCAL_SAVE_KEY)).toBe(original);
  await session.choose("coordinate", first.key);
  expect(session.getSnapshot().decision).toBeNull();
  // Restore the same seed/event: run generation must still invalidate old callbacks.
  values.set(LOCAL_SAVE_KEY, original);
  await session.resume();
  const second = session.getSnapshot().decision!;
  expect(second.key).not.toBe(first.key);
  await session.choose("carry", first.key);
  expect(values.get(LOCAL_SAVE_KEY)).toBe(original);
  fail = true;
  await session.choose("coordinate", second.key);
  expect(session.getSnapshot().decision!.status).toBe("unsaved");
  fail = false;
  await session.retryDecisionSave(first.key);
  session.reloadDecision(first.key);
  expect(session.getSnapshot().page).toBe("game");
  expect(values.get(LOCAL_SAVE_KEY)).toBe(original);
  expect(session.getSnapshot().decision!.status).toBe("unsaved");
  await session.retryDecisionSave(second.key);
  expect(session.getSnapshot().decision).toBeNull();
});

it.each(["save-changed", "invalid-data"])("keeps accepted results on %s and leaves existing bytes untouched", async code => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const original = serializeGame(pending);
  const values = new Map([[LOCAL_SAVE_KEY, original]]);
  const actualStore = createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); } });
  // The validation-error case substitutes only the storage boundary's typed failure.
  const store = code === "invalid-data" ? { ...actualStore, save: () => ({ status: "error" as const,
    error: { code: "invalid-data" as const, message: "這次進度未通過驗證。" }, rawData: original }) } : actualStore;
  const session = createPlayerSession(store);
  await session.check(); await session.resume();
  const decision = session.getSnapshot().decision!;
  const newer = serializeGame(transitionGame(pending, content, { type: "CHOOSE", choiceId: "carry" }).state);
  if (code === "save-changed") values.set(LOCAL_SAVE_KEY, newer);
  await session.choose("coordinate", decision.key);
  expect(session.getSnapshot().decision).toMatchObject({ key: decision.key, status: "unsaved" });
  expect(session.getSnapshot().canRetrySave).toBe(false);
  expect(session.getSnapshot().game!.choices.at(-1)!.choiceId).toBe("coordinate");
  await session.retryDecisionSave(decision.key);
  expect(values.get(LOCAL_SAVE_KEY)).toBe(code === "save-changed" ? newer : original);
  session.reloadDecision(decision.key);
  await vi.waitFor(() => expect(session.getSnapshot().busy).toBe(false));
  await session.resume();
  expect(session.getSnapshot().game!.choices.at(-1)?.choiceId).toBe(code === "save-changed" ? "carry" : undefined);
});
