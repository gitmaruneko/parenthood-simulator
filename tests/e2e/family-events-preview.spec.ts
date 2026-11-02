import { installPausedNarration, pauseAndReveal, stepNarration } from "./narration-helpers.js";
import { test, expect } from "@playwright/test";
import { createFamilyRun, getPlayerView, projectJournal, transitionGame } from "../../src/engine/index.js";
import { bindPreviewRun, createRunContent } from "../../src/content/releases.js";
import { serializeGame } from "../../src/persistence/index.js";
import { TOY_CAR_ROOT } from "../../src/content/toy-car-story.js";

test.beforeEach(async ({ page }) => { await installPausedNarration(page); });

test("isolated 08A shortcut preserves the original story and resumes only its own playtest", async ({ page }) => {
  const original = serializeGame(createFamilyRun({ seed: 2 }).state);
  await page.addInitScript(raw => localStorage.setItem("parenthood-simulator.save", raw), original);
  await page.goto("/preview-08a.html");
  await expect(page.getByRole("dialog", { name: "搶回來的那台小車", exact: true })).toBeVisible();
  await page.getByRole("dialog").getByRole("button").first().click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await pauseAndReveal(page);
  const checkpoint = await page.evaluate(() => Object.fromEntries(Object.keys(sessionStorage).map(key => [key, sessionStorage.getItem(key)])));
  await page.reload();
  await expect(page.getByRole("list", { name: "已發生的事件" })).toContainText("你把兩台小車放到桌邊");
  expect(await page.evaluate(() => localStorage.getItem("parenthood-simulator.save"))).toBe(original);
  expect(await page.evaluate(() => Object.fromEntries(Object.keys(sessionStorage).map(key => [key, sessionStorage.getItem(key)])))).toEqual(checkpoint);
});

test("08A: reload pending and across turns, render independent narrative results and finish the complete story", async ({ page, isMobile }) => {
  const run = bindPreviewRun(createFamilyRun({ seed: 9, firstAgeStageId: "age-stage-8" }));
  const content = createRunContent(run.state);
  content.ageStages[7]!.entryEventIds = [TOY_CAR_ROOT]; // path evidence, not natural distribution
  let state = transitionGame(run.state, content, { type: "ADVANCE" }).state;
  await page.addInitScript(raw => {
    if (!localStorage.getItem("parenthood-simulator.save")) localStorage.setItem("parenthood-simulator.save", raw);
  }, serializeGame(state));
  await page.goto("/");
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "搶回來的那台小車", exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  for (let step = 0; step < 20; step++) {
    if (state.ageStageProgress?.status === "completed") break;
    const view = getPlayerView(state, content);
    if (view.pendingEvent) {
      await page.getByRole("dialog").getByRole("button", { name: view.pendingEvent.choices[0]!.text, exact: true }).click();
      state = transitionGame(state, content, { type: "CHOOSE", choiceId: view.pendingEvent.choices[0]!.id }).state;
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await pauseAndReveal(page);
    } else {
      await stepNarration(page);
      state = transitionGame(state, content, view.nextInput!).state;
    }
    await expect.poll(async () => JSON.parse((await page.evaluate(() => localStorage.getItem("parenthood-simulator.save")))!).state).toEqual(state);
    if (state.turn?.status === "completed" && state.ageStageProgress?.status === "active") {
      await page.reload();
      await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
    }
  }
  expect(state.ageStageProgress).toMatchObject({ nodeCount: 6, turnCount: 2, status: "completed" });
  const log = page.getByRole("list", { name: "已發生的事件" });
  await expect(log.locator("li > p")).toHaveText(projectJournal(state).reverse().map(row => row.text));
  await expect(log).toContainText("你把兩台小車放到桌邊");
  await expect(log).toContainText("是否繼續說由孩子決定");
  await expect(log.locator("strong")).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/ISSUE-42-08A-${isMobile ? "MOBILE" : "DESKTOP"}.png`, fullPage: true });
});
