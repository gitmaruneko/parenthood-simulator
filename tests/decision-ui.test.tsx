// @vitest-environment jsdom
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within, act, waitFor } from "@testing-library/react";
import { App } from "../src/ui/App.js";
import { DecisionDialog } from "../src/ui/DecisionDialog.js";
import { eventNodeSchema } from "../src/domain/schemas.js";
import { createPlayerSession } from "../src/ui/player-session.js";
import { createFamilyRun, transitionGame, getPlayerView } from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY, serializeGame } from "../src/persistence/index.js";

beforeAll(() => {
  // jsdom does not implement the native top layer; browser tests verify inert/trapping.
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});
afterEach(cleanup);

it.each([
  ["conflict", "育兒衝突"],
  ["dailyLife", "日常生活"],
  ["positive", "成長與溫暖"],
  ["consequence", "選擇的後續"],
] as const)("presents authored %s metadata and action text without anticipated judgments", async (experienceType, label) => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const values = new Map([[LOCAL_SAVE_KEY, serializeGame(pending)]]);
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); } }));
  await session.check(); await session.resume();
  const decision = session.getSnapshot().decision!;
  // A release author's presentation annotation must survive schema validation and the engine projection.
  const authored = eventNodeSchema.parse({ ...decision.event, experienceType,
    choices: decision.event.choices.map(choice => ({ ...choice, anticipatedJudgment: "也許對方正忙" })) });
  const event = getPlayerView(pending, { ...content,
    events: content.events.map(event => event.id === authored.id ? authored : event) }).pendingEvent!;
  render(<DecisionDialog decision={{ ...decision, event }} busy={false} error={null}
    hasUnsavedChanges={false} canRetry={false} onChoose={session.choose}
    onRetry={session.retryDecisionSave} onReload={session.reloadDecision} />);
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText(label)).toBeTruthy();
  expect(within(dialog).getAllByRole("button").map(button => button.textContent)).toEqual(authored.choices.map(choice => choice.text));
  expect(within(dialog).queryByText(/心裡預期|也許對方正忙/)).toBeNull();
  expect(event.choices[0]!.anticipatedJudgment).toBe("也許對方正忙");
  expect(values.get(LOCAL_SAVE_KEY)).toBe(serializeGame(pending));
});

it("opens a restored choice once, prevents dismissal, retains failed results across remount and returns focus after retry", async () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const original = serializeGame(pending);
  const values = new Map([[LOCAL_SAVE_KEY, original]]);
  let fail = true;
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { if (fail) throw new DOMException("full", "QuotaExceededError"); values.set(key, value); } }));
  await session.check(); await session.resume();
  const view = render(<App session={session} />);
  const dialog = screen.getByRole("dialog", { name: "凌晨的交接" });
  expect(dialog.getAttribute("aria-modal")).toBe("true");
  expect(within(dialog).getByText("生活抉擇")).toBeTruthy();
  expect(within(dialog).queryByText("選擇後才能繼續。")).toBeNull();
  expect(within(dialog).queryByText("請選擇眼前的做法。")).toBeNull();
  expect(within(dialog).getByRole("status").textContent).toBe("");
  expect(dialog.getAttribute("aria-describedby")!.split(/\s+/).every(id => document.getElementById(id))).toBe(true);
  expect(document.activeElement).toBe(within(dialog).getByRole("heading", { name: "凌晨的交接" }));
  expect(document.querySelector(".game-background")?.hasAttribute("inert")).toBe(true);
  expect(document.querySelector(".event-panel .decisions")).toBeNull();
  expect(fireEvent(dialog, new Event("cancel", { bubbles: true, cancelable: true }))).toBe(false);
  fireEvent.click(dialog);
  expect(dialog.hasAttribute("open")).toBe(true);
  expect(values.get(LOCAL_SAVE_KEY)).toBe(original);
  await waitFor(() => expect(session.getSnapshot().busy).toBe(false));
  const key = session.getSnapshot().decision!.key;
  await act(async () => { fireEvent.click(within(dialog).getByRole("button", { name: /列出來/ })); });
  await waitFor(() => expect(session.getSnapshot().decision!.status).toBe("unsaved"));
  expect(screen.getByRole("dialog")).toBe(dialog);
  expect(within(dialog).getByText(/選擇已保留於本次開啟的故事/)).toBeTruthy();
  expect(document.activeElement).toBe(within(dialog).getByRole("status"));
  expect(dialog.getAttribute("aria-describedby")!.split(/\s+/).every(id => document.getElementById(id))).toBe(true);
  expect(within(dialog).queryByRole("button", { name: /列出來/ })).toBeNull();
  const accepted = session.getSnapshot().game!;
  const failureMessage = session.getSnapshot().error;
  view.unmount();
  render(<App session={session} />);
  await waitFor(() => expect(session.getSnapshot().busy).toBe(false));
  expect(within(screen.getByRole("dialog")).getByRole("alert").textContent).toBe(failureMessage);
  expect(session.getSnapshot().decision!.key).toBe(key);
  const warning = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(warning);
  expect(warning.defaultPrevented).toBe(true);
  fail = false;
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "重試儲存" })); });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(session.getSnapshot().game!.history).toEqual(accepted.history);
  await new Promise(resolve => requestAnimationFrame(resolve));
  expect(document.activeElement).toBe(document.querySelector(".event-log > li"));
  expect(JSON.parse(values.get(LOCAL_SAVE_KEY)!).state)
    .toEqual(transitionGame(pending, content, { type: "CHOOSE", choiceId: "coordinate" }).state);
});

it("remounts a submitting occurrence with locked options and does not accept a second command", async () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  const values = new Map([[LOCAL_SAVE_KEY, serializeGame(pending)]]);
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); } }));
  await session.check(); await session.resume();
  const key = session.getSnapshot().decision!.key;
  const submitted = session.choose("coordinate", key);
  const view = render(<App session={session} />);
  view.unmount();
  render(<App session={session} />);
  expect(session.getSnapshot().decision).toMatchObject({ key, status: "submitting" });
  const options = within(screen.getByRole("dialog")).getAllByRole("button") as HTMLButtonElement[];
  expect(options.every(option => option.disabled)).toBe(true);
  expect(within(screen.getByRole("dialog")).getByRole("status").textContent).toBe("正在處理並儲存，請稍候。");
  await act(async () => { await session.choose("carry", key); await submitted; });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(JSON.parse(values.get(LOCAL_SAVE_KEY)!).state)
    .toEqual(transitionGame(pending, content, { type: "CHOOSE", choiceId: "coordinate" }).state);
});
