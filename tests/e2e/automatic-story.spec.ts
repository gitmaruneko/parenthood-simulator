import { test, expect } from "@playwright/test";
import { createFamilyRun, getPlayerView, transitionGame } from "../../src/engine/index.js";
import { createMvpContent } from "../../src/content/mvp.js";
import { serializeGame } from "../../src/persistence/index.js";

const key = "parenthood-simulator.save";
const run = createFamilyRun({ seed: 42 }); const content = createMvpContent(run.actors);
const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;

test("automatic pacing and fast display keep outcomes fixed without back-to-back Dialogs", async ({ page }, testInfo) => {
  await page.clock.install();
  await page.addInitScript(({ key, raw }) => { localStorage.setItem(key, raw); }, { key, raw: serializeGame(pending) });
  await page.goto("/");
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await page.getByRole("dialog").locator(".decisions button").first().click();
  await page.clock.runFor(20);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const chosen = transitionGame(pending, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
  const saved = await page.evaluate(key => localStorage.getItem(key), key);
  expect(JSON.parse(saved!).state).toEqual(chosen);
  await expect(page.getByRole("button", { name: "繼續生活", exact: true })).toHaveCount(0);
  const rows = page.locator(".event-log > li");
  const firstCount = await rows.count();
  await page.clock.runFor(1000);
  await expect(rows).toHaveCount(firstCount);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(saved);
  await page.getByRole("button", { name: "快速顯示", exact: true }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(saved);
  await page.clock.runFor(249);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(saved);
  await page.clock.runFor(2);
  const next = transitionGame(chosen, content, getPlayerView(chosen, content).nextInput!).state;
  expect(JSON.parse((await page.evaluate(key => localStorage.getItem(key), key))!).state).toEqual(next);
  await page.clock.runFor(120000);
  await expect(page.getByRole("dialog")).toHaveCount(1);
  const stopped = await page.evaluate(key => localStorage.getItem(key), key);
  await page.clock.runFor(120000);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(stopped);
  await page.screenshot({ path: testInfo.outputPath("automatic-pending.png") });
});

test("hidden documents suspend automatic commands without offline catch-up", async ({ page }) => {
  await page.clock.install();
  const chosen = transitionGame(pending, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
  await page.addInitScript(({ key, raw }) => {
    localStorage.setItem(key, raw); localStorage.setItem("parenthood-simulator.ui.story-paused", "true");
  }, { key, raw: serializeGame(chosen) });
  await page.goto("/");
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  await expect(page.getByRole("button", { name: "恢復敘事", exact: true })).toBeVisible();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await page.getByRole("button", { name: "恢復敘事", exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(600000);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(serializeGame(chosen));
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(251);
  const next = transitionGame(chosen, content, getPlayerView(chosen, content).nextInput!).state;
  expect(JSON.parse((await page.evaluate(key => localStorage.getItem(key), key))!).state).toEqual(next);
});

test("isolated automatic Preview leaves the original story untouched", async ({ page }, testInfo) => {
  const original = serializeGame(createFamilyRun({ seed: 2 }).state);
  await page.addInitScript(({ key, original }) => { localStorage.setItem(key, original); }, { key, original });
  await page.goto("/preview-automatic-story.html");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").locator(".decisions button").first().click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "暫停敘事", exact: true }).click();
  await page.getByRole("button", { name: "快速顯示", exact: true }).click();
  await expect(page.locator(".event-log > li")).not.toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(original);
  await page.screenshot({ path: testInfo.outputPath("automatic-preview.png"), fullPage: true });
  await page.reload();
  await expect(page.getByRole("button", { name: "恢復敘事", exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(original);
});
