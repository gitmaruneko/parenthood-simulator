// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { getStoryProgression } from "../src/ui/story-progression.js";
import { NARRATION_PAUSE_KEY } from "../src/ui/narration-preference.js";
import { App } from "../src/ui/App.js";
import { createPlayerSession } from "../src/ui/player-session.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY, serializeGame } from "../src/persistence/index.js";
import { createFamilyRun, transitionGame } from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";

afterEach(() => { cleanup(); window.localStorage.clear(); });
it("replaces the required continue button with optional narration controls", async () => {
  const values = new Map([[LOCAL_SAVE_KEY, serializeGame(createFamilyRun({ seed: 42 }).state)]]);
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); } }));
  await session.resume(); await session.startFamily();
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  render(<App session={session} />);
  expect(screen.queryByRole("button", { name: "繼續生活" })).toBeNull();
  expect(screen.getByRole("button", { name: "暫停敘事" })).toBeTruthy();
  expect(screen.queryByRole("combobox", { name: /速度/ })).toBeNull();
});

it("keeps old-record focus when a pending choice appears in StrictMode and after remount", async () => {
  const run = createFamilyRun({ seed: 42 }); const content = createMvpContent(run.actors);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const resolved = transitionGame(pending, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
  const values = new Map([[LOCAL_SAVE_KEY, serializeGame(resolved)]]);
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); } }));
  await session.resume();
  const story = getStoryProgression(session); story.pause();
  const view = render(<StrictMode><App session={session} /></StrictMode>);
  const row = document.querySelector<HTMLElement>(".event-log > li")!;
  row.focus();
  act(() => { story.setReadingOlder(true); });
  for (let step = 0; step < 8 && !session.getSnapshot().decision; step++) {
    await act(async () => { await session.advance(); });
  }
  expect(session.getSnapshot().decision).not.toBeNull();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(row);
  const entry = within(screen.getByRole("complementary", { name: "閱讀中的敘事狀態" })).getByRole("button", { name: "查看待選抉擇" });
  entry.focus(); fireEvent.click(entry);
  expect(screen.getByRole("dialog")).toBeTruthy();
  const decision = session.getSnapshot().decision!;
  await act(async () => { await session.choose(decision.event.choices[0]!.id, decision.key); });
  await waitFor(() => expect(document.activeElement).toBe(row));
  view.unmount(); render(<StrictMode><App session={session} /></StrictMode>);
  expect(story.getSnapshot().paused).toBe(true);
  expect(window.localStorage.getItem(NARRATION_PAUSE_KEY)).toBe("true");
});

it("keeps a rejected choice visible with its error and retryable options", async () => {
  const run = createFamilyRun({ seed: 42 });
  const pending = transitionGame(run.state, createMvpContent(run.actors), { type: "ADVANCE" }).state;
  const values = new Map([[LOCAL_SAVE_KEY, serializeGame(pending)]]);
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); } }));
  await session.resume();
  render(<App session={session} />);
  const key = session.getSnapshot().decision!.key;
  await act(async () => { await session.choose("invalid-choice", key); });
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByRole("alert").textContent).toBe(session.getSnapshot().error);
  expect(within(dialog).getAllByRole("button").every(button => !(button as HTMLButtonElement).disabled)).toBe(true);
  expect(values.get(LOCAL_SAVE_KEY)).toBe(serializeGame(pending));
});
