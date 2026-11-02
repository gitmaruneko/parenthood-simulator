// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { App } from "../src/ui/App.js";
import { createPlayerSession } from "../src/ui/player-session.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY, serializeGame } from "../src/persistence/index.js";
import { createFamilyRun, transitionGame } from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";

afterEach(cleanup);
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
