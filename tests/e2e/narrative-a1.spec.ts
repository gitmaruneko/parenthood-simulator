import { test, expect } from "@playwright/test";
import { a1Path } from "../helpers/narrative-a1.js";
import { serializeGame } from "../../src/persistence/index.js";
import { projectJournal } from "../../src/engine/index.js";
import { installPausedNarration, pauseAndReveal, stepNarration } from "./narration-helpers.js";

test.beforeEach(async ({ page }) => { await installPausedNarration(page); });

for (const path of [
  ...["nqa1-stock", "nqa1-sit"].flatMap(root => ["nqa1-sort", "nqa1-move"].map(later => ({ stage: 1 as const, root, later }))),
  ...["nqa1-ask-child", "nqa1-ask-teacher"].flatMap(root => ["nqa1-apologize", "nqa1-draw"].map(later => ({ stage: 8 as const, root, later }))),
]) test(`two-action Dialog / saved Journal / reload: ${path.root} / ${path.later}`, async ({ page, isMobile }) => {
  const { checkpoints, content, state: final } = a1Path(path.stage, path.root, path.later, 9, path.later === "nqa1-draw" ? 1 : 0);
  const waitingIndex = checkpoints.findIndex(state => state.turn?.status === "awaitingInput");
  await page.addInitScript(raw => {
    if (!localStorage.getItem("parenthood-simulator.save")) localStorage.setItem("parenthood-simulator.save", raw);
  }, serializeGame(checkpoints[waitingIndex]!));
  await page.goto("/");
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  for (let index = waitingIndex; index < checkpoints.length - 1; index++) {
    const state = checkpoints[index]!;
    if (state.turn?.status === "awaitingInput") {
      const event = content.events.find(event => event.id === state.turn!.activeEventId)!;
      const selected = event.choices.find(choice => choice.id === (state.choiceHistory.length === 0 ? path.root : path.later))!;
      const dialog = page.getByRole("dialog", { name: event.title, exact: true });
      await expect(dialog.getByRole("button")).toHaveCount(2);
      await expect(dialog.getByRole("heading")).toBeFocused();
      await dialog.getByRole("button", { name: selected.text, exact: true }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await pauseAndReveal(page);
    } else await stepNarration(page);
    const next = checkpoints[index + 1]!;
    await expect.poll(async () => JSON.parse((await page.evaluate(() => localStorage.getItem("parenthood-simulator.save")))!).state).toEqual(next);
    if (next.turn?.status === "completed" && next.ageStageProgress?.status === "active") {
      await page.reload();
      await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
    }
  }
  const journal = page.getByRole("list", { name: "已發生的事件" });
  await expect(journal.locator("li > p")).toHaveText(projectJournal(final).reverse().map(row => row.text));
  await expect(journal.locator("strong")).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (path.root === "nqa1-stock" && path.later === "nqa1-sort" || path.root === "nqa1-ask-child" && path.later === "nqa1-apologize")
    await page.screenshot({ path: `test-results/NARRATIVE-A1-${path.stage}-${isMobile ? "MOBILE" : "DESKTOP"}.png`, fullPage: true });
});

test("A1 preview uses its own storage and resumes its pending choices", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("parenthood-simulator.save", "original-bytes"));
  await page.goto("/preview-narrative-a1.html?story=door");
  const dialog = page.getByRole("dialog", { name: "教室門口，那句「快點」還停在嘴邊", exact: true });
  await expect(dialog.getByRole("button")).toHaveCount(2);
  await page.reload();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button").last().click();
  await pauseAndReveal(page);
  await expect(page.getByRole("list", { name: "已發生的事件" })).toContainText("請求已說出口，還沒確認老師何時有空");
  const bytes = await page.evaluate(() => Object.fromEntries(Object.keys(sessionStorage).map(key => [key, sessionStorage.getItem(key)])));
  await page.reload();
  expect(await page.evaluate(() => Object.fromEntries(Object.keys(sessionStorage).map(key => [key, sessionStorage.getItem(key)])))).toEqual(bytes);
  expect(await page.evaluate(() => localStorage.getItem("parenthood-simulator.save"))).toBe("original-bytes");
});
