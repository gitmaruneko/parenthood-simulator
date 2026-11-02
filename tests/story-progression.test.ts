import { afterEach, expect, it, vi } from "vitest";
import { createPlayerSession } from "../src/ui/player-session.js";
import { createStoryProgression } from "../src/ui/story-progression.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY, serializeGame } from "../src/persistence/index.js";
import { createFamilyRun, transitionGame } from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";
import { bindPreviewRun, createRunContent } from "../src/content/releases.js";
import { getPlayerView } from "../src/engine/index.js";

afterEach(() => vi.useRealTimers());

it("automatically continues through the public Session and stops at the next required choice", async () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const resolved = transitionGame(pending, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
  const values = new Map([[LOCAL_SAVE_KEY, serializeGame(resolved)]]);
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); } }));
  await session.resume();
  vi.useFakeTimers();
  const story = createStoryProgression(session);
  const detach = story.attach();
  await vi.advanceTimersByTimeAsync(30000);
  expect(session.getSnapshot().decision).not.toBeNull();
  const saved = values.get(LOCAL_SAVE_KEY);
  await vi.advanceTimersByTimeAsync(60000);
  expect(values.get(LOCAL_SAVE_KEY)).toBe(saved);
  expect(story.getSnapshot().fault).toBeNull();
  detach();
});

it("reveals only saved results, waits 2–8 seconds, and fast display adds no commands", async () => {
  const run = createFamilyRun({ seed: 42 });
  const pending = transitionGame(run.state, createMvpContent(run.actors), { type: "ADVANCE" }).state;
  const values = new Map([[LOCAL_SAVE_KEY, serializeGame(pending)]]);
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); } }));
  await session.resume();
  vi.useFakeTimers();
  const story = createStoryProgression(session); const detach = story.attach();
  const before = story.getSnapshot().records.length;
  const chosen = session.choose("coordinate", session.getSnapshot().decision!.key);
  await vi.advanceTimersByTimeAsync(1); await chosen;
  const saved = values.get(LOCAL_SAVE_KEY);
  expect(story.getSnapshot().records.length).toBe(before + 1);
  await vi.advanceTimersByTimeAsync(1999);
  expect(story.getSnapshot().records.length).toBe(before + 1);
  story.pause(); story.fastForward();
  expect(story.getSnapshot().records.some(record => record.kind === "choice")).toBe(true);
  await vi.advanceTimersByTimeAsync(60000);
  expect(values.get(LOCAL_SAVE_KEY)).toBe(saved);
  expect(story.getSnapshot().displaying).toBe(false);
  detach();
});

it.each([1, 2])("stops at failed checkpoint %i and retries the exact accepted transition", async failAt => {
  const run = createFamilyRun({ seed: 42 }); const content = createMvpContent(run.actors);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const resolved = transitionGame(pending, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
  const expected = transitionGame(resolved, content, getPlayerView(resolved, content).nextInput!).state;
  const original = serializeGame(resolved);
  const values = new Map([[LOCAL_SAVE_KEY, original]]); let writes = 0; let failing = true;
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { if (++writes === failAt && failing) throw new DOMException("full", "QuotaExceededError"); values.set(key, value); } }));
  await session.resume(); vi.useFakeTimers();
  const story = createStoryProgression(session); const detach = story.attach();
  await vi.advanceTimersByTimeAsync(30000);
  expect(session.getSnapshot().hasUnsavedChanges).toBe(true);
  expect(writes).toBe(failAt);
  const accepted = session.getSnapshot().game!.history;
  await vi.advanceTimersByTimeAsync(60000); expect(writes).toBe(failAt);
  story.pause(); failing = false;
  const retry = session.retrySave(); await vi.advanceTimersByTimeAsync(1); await retry;
  expect(session.getSnapshot().hasUnsavedChanges).toBe(false);
  expect(session.getSnapshot().game!.history).toEqual(accepted);
  expect(JSON.parse(values.get(LOCAL_SAVE_KEY)!).state).toEqual(expected);
  detach();
});

it.each([false, true])("keeps a complete manual and automatic run deterministic (bound=%s)", async bound => {
  let run = createFamilyRun({ seed: 42 }); if (bound) run = bindPreviewRun(run);
  const content = bound ? createRunContent(run.state) : createMvpContent(run.actors);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const make = () => {
    const values = new Map([[LOCAL_SAVE_KEY, serializeGame(pending)]]);
    return { values, session: createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); } })) };
  };
  const manual = make(); const auto = make(); await manual.session.resume(); await auto.session.resume();
  vi.useFakeTimers(); const story = createStoryProgression(auto.session); const detach = story.attach();
  for (let step = 0; step < 256 && !manual.session.getSnapshot().game!.completed; step++) {
    const snap = manual.session.getSnapshot();
    const op = snap.decision ? manual.session.choose(snap.decision.event.choices[0]!.id, snap.decision.key) : manual.session.advance();
    await vi.advanceTimersByTimeAsync(1); await op;
  }
  for (let step = 0; step < 256 && !auto.session.getSnapshot().game!.completed; step++) {
    const snap = auto.session.getSnapshot();
    if (snap.decision) {
      const op = auto.session.choose(snap.decision.event.choices[0]!.id, snap.decision.key);
      await vi.advanceTimersByTimeAsync(1); await op;
    }
    story.fastForward(); await vi.advanceTimersByTimeAsync(120000);
  }
  expect(auto.session.getSnapshot().game!.completed).toBe(true);
  expect(story.getSnapshot().fault).toBeNull();
  expect(auto.values.get(LOCAL_SAVE_KEY)).toBe(manual.values.get(LOCAL_SAVE_KEY));
  const final = auto.values.get(LOCAL_SAVE_KEY);
  await vi.advanceTimersByTimeAsync(60000); expect(auto.values.get(LOCAL_SAVE_KEY)).toBe(final);
  detach();
}, 30000);
