import { projectJournal, type JournalRecord } from "../engine/journal.js";
import type { PlayerSession } from "./player-session.js";

export interface StorySnapshot {
  readonly records: readonly JournalRecord[];
  readonly paused: boolean;
  readonly readingOlder: boolean;
  readonly pending: boolean;
  readonly dialogReady: boolean;
  readonly displaying: boolean;
  readonly stageNotice: string | null;
  readonly fault: string | null;
}

// One controller belongs to one Session, surviving React effect restarts.
const controllers = new WeakMap<PlayerSession, ReturnType<typeof createStoryProgression>>();
export function getStoryProgression(session: PlayerSession) {
  let story = controllers.get(session);
  if (!story) { story = createStoryProgression(session); controllers.set(session, story); }
  return story;
}

export function createStoryProgression(session: PlayerSession) {
  let records: readonly JournalRecord[] = [];
  let all: readonly JournalRecord[] = [];
  let generation = -1;
  let stage: string | null = null;
  let notice: string | null = null;
  let paused = false;
  let readingOlder = false;
  let surface = true;
  let visible = true;
  let owner: symbol | null = null;
  let unsubscribe: (() => void) | null = null;
  let inFlight = false;
  let commands = 0;
  let fault: string | null = null;
  let wait = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let due = 0;
  let epoch = 0;
  let openedDecision: string | null = null;
  const listeners = new Set<() => void>();
  let snapshot: StorySnapshot = { records, paused, readingOlder, pending: false,
    dialogReady: false, displaying: false, stageNotice: null, fault };
  const cancel = () => {
    epoch++;
    if (timer !== null) { clearTimeout(timer); timer = null; wait = Math.max(0, due - Date.now()); }
  };
  const update = () => {
    const current = session.getSnapshot();
    const game = current.game;
    const identity = session.getStoryIdentity();
    if (identity !== generation) {
      cancel(); generation = identity; stage = game?.currentAgeStageId ?? null;
      all = records = game && !current.hasUnsavedChanges ? project(game) : [];
      wait = 0; notice = null; fault = null; commands = 0; readingOlder = false;
      openedDecision = null;
    }
    if (current.page === "game" && game && !current.busy && !current.hasUnsavedChanges && !current.error) {
      const projected = project(game);
      if (projected.length !== all.length || projected.some((item, i) => item.id !== all[i]?.id)) all = projected;
      if (stage !== game.currentAgeStageId) {
        stage = game.currentAgeStageId; commands = 0;
        notice = `${game.ageLabel}，我們走進新的成長階段。`; wait = 2000;
      }
    }
    if (current.decision) commands = 0;
    const blocked = !owner || !visible || !surface || paused || readingOlder || current.page !== "game" ||
      current.busy || current.dialog !== null || current.error !== null || current.hasUnsavedChanges || !!fault;
    const displaying = records.length < all.length || wait > 0;
    const recovery = !!current.decision && (current.hasUnsavedChanges || !!current.error || current.decision.status === "submitting");
    const dialogReady = !!current.decision && (recovery || openedDecision === current.decision.key ||
      (!blocked && !displaying));
    const next: StorySnapshot = { records, paused, readingOlder, pending: !!current.decision,
      dialogReady, displaying, stageNotice: notice, fault };
    if (Object.keys(next).some(key => next[key as keyof StorySnapshot] !== snapshot[key as keyof StorySnapshot])) {
      snapshot = next; listeners.forEach(listener => listener());
    }
    if (blocked || inFlight) { cancel(); return; }
    if (timer !== null) return;
    if (!displaying && (current.decision || game?.completed || !game?.nextInput)) return;
    const token = ++epoch;
    const purpose = wait > 0 ? "reading" : records.length < all.length ? "reveal" : "command";
    const delay = wait || (records.length < all.length ? 0 : 250);
    due = Date.now() + delay;
    timer = setTimeout(async () => {
      timer = null;
      if (token !== epoch || identity !== session.getStoryIdentity()) return;
      wait = 0; notice = null;
      const latest = session.getSnapshot();
      if (!owner || !visible || !surface || paused || readingOlder || latest.busy || latest.error ||
          latest.hasUnsavedChanges || latest.dialog || latest.page !== "game") { update(); return; }
      if (records.length < all.length) {
        const record = all[records.length]!;
        records = all.slice(0, records.length + 1);
        wait = Math.min(8000, Math.max(2000, [...record.text].length / 12 * 1000));
        update(); return;
      }
      if (purpose !== "command") { update(); return; }
      if (latest.decision || latest.game?.completed || !latest.game?.nextInput) { update(); return; }
      if (session.hasQueuedCommands()) { update(); return; }
      if (++commands > 64) { fault = "自動敘事已安全停止，請返回首頁重新讀取。"; update(); return; }
      const revision = session.getProgressRevision();
      inFlight = true;
      try {
        await session.advance();
        const after = session.getSnapshot();
        if (identity === session.getStoryIdentity() && !after.error && !after.hasUnsavedChanges &&
            !after.decision && !after.game?.completed && revision === session.getProgressRevision()) {
          fault = "故事暫時無法繼續，請返回首頁重新讀取。";
        }
      } catch { fault = "自動敘事已停止，請返回首頁重新讀取。"; }
      finally { inFlight = false; update(); }
    }, delay);
  };
  const story = {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    attach: () => {
      const token = Symbol(); owner = token;
      if (!unsubscribe) unsubscribe = session.subscribe(update);
      update();
      return () => {
        if (owner !== token) return;
        owner = null; cancel(); unsubscribe?.(); unsubscribe = null;
      };
    },
    setVisible: (value: boolean) => { visible = value; update(); },
    setSurface: (value: boolean) => { surface = value; update(); },
    setReadingOlder: (value: boolean) => { readingOlder = value; update(); },
    pause: () => { paused = true; update(); },
    resume: () => { paused = false; update(); },
    showDecision: () => { openedDecision = session.getSnapshot().decision?.key ?? null; update(); },
    fastForward: () => {
      cancel(); records = all; wait = 0; notice = null; update();
    },
  };
  update();
  return story;
}

function project(game: NonNullable<ReturnType<PlayerSession["getSnapshot"]>["game"]>) {
  return projectJournal({ history: game.history, choiceHistory: game.choices, reactionHistory: game.reactions });
}
export type StoryProgression = ReturnType<typeof createStoryProgression>;
