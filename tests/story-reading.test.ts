import { afterEach, expect, it, vi } from "vitest";
import { createPlayerSession } from "../src/ui/player-session.js";
import { createStoryProgression } from "../src/ui/story-progression.js";
import { createNarrationPreference } from "../src/ui/narration-preference.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY, serializeGame } from "../src/persistence/index.js";
import { createFamilyRun, transitionGame } from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";

afterEach(() => vi.useRealTimers());
async function setup() {
  const run = createFamilyRun({ seed: 42 });
  const pending = transitionGame(run.state, createMvpContent(run.actors), { type: "ADVANCE" }).state;
  const values = new Map([[LOCAL_SAVE_KEY, serializeGame(pending)]]);
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); } }));
  await session.resume();
  return { session, values };
}

it("retains manual pause in a separate preference across a new Session and page reload", async () => {
  const { session, values } = await setup();
  const prefs = new Map<string, string>();
  const storage = { getItem: (key: string) => prefs.get(key) ?? null,
    setItem: (key: string, value: string) => { prefs.set(key, value); } };
  const story = createStoryProgression(session, createNarrationPreference(storage));
  const detach = story.attach(); const saved = values.get(LOCAL_SAVE_KEY);
  story.pause(); detach();
  const fresh = createStoryProgression((await setup()).session, createNarrationPreference(storage));
  const cleanup = fresh.attach();
  expect(fresh.getSnapshot().paused).toBe(true);
  fresh.setSurface(false); fresh.setSurface(true); fresh.setReadingOlder(true); fresh.setReadingOlder(false);
  expect(fresh.getSnapshot().paused).toBe(true);
  expect(values.get(LOCAL_SAVE_KEY)).toBe(saved);
  fresh.resume(); expect(fresh.getSnapshot().paused).toBe(false);
  cleanup();
});

it("withholds pending choices while reading older records, exposes an explicit entry and retains pause", async () => {
  const { session, values } = await setup(); vi.useFakeTimers();
  const story = createStoryProgression(session); story.setReadingOlder(true);
  const detach = story.attach(); const saved = values.get(LOCAL_SAVE_KEY);
  expect(story.getSnapshot().pending).toBe(true);
  expect(story.getSnapshot().dialogReady).toBe(false);
  await vi.advanceTimersByTimeAsync(60000); expect(values.get(LOCAL_SAVE_KEY)).toBe(saved);
  story.showDecision(); expect(story.getSnapshot().dialogReady).toBe(true);
  story.pause(); story.setReadingOlder(false); expect(story.getSnapshot().paused).toBe(true);
  detach();
});

it("retains an in-memory pause and reports preference failures without touching the game save", async () => {
  const { session, values } = await setup();
  const original = values.get(LOCAL_SAVE_KEY);
  const story = createStoryProgression(session, createNarrationPreference({ getItem: () => null,
    setItem: () => { throw new DOMException("full", "QuotaExceededError"); } }));
  story.pause();
  expect(story.getSnapshot().paused).toBe(true);
  expect(story.getSnapshot().preferenceError).toContain("無法保存敘事偏好");
  expect(values.get(LOCAL_SAVE_KEY)).toBe(original);
});

it("invalidates stale owners and timers on remount, visibility changes, navigation and restore", async () => {
  const { session, values } = await setup(); vi.useFakeTimers();
  const story = createStoryProgression(session);
  const stale = story.attach(); const current = story.attach(); stale();
  story.setVisible(false); story.pause();
  const saved = values.get(LOCAL_SAVE_KEY);
  await vi.advanceTimersByTimeAsync(100000);
  expect(values.get(LOCAL_SAVE_KEY)).toBe(saved);
  story.setVisible(true); story.setReadingOlder(false);
  expect(story.getSnapshot().paused).toBe(true);
  current(); const detach = story.attach();
  expect(story.getSnapshot().paused).toBe(true);
  session.home(); await vi.advanceTimersByTimeAsync(1);
  const restore = session.resume(); await vi.advanceTimersByTimeAsync(1); await restore;
  expect(story.getSnapshot().paused).toBe(true);
  expect(values.get(LOCAL_SAVE_KEY)).toBe(saved);
  detach();
});
