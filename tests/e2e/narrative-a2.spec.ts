import { test, expect } from "@playwright/test";
import { a2Path } from "../helpers/narrative-a2.js";
import { A2_STORIES, a2Root } from "../../src/content/narrative-a2.js";
import { serializeGame } from "../../src/persistence/index.js";
import { projectJournal } from "../../src/engine/index.js";
import { installPausedNarration, pauseAndReveal, stepNarration } from "./narration-helpers.js";

test.beforeEach(async ({ page }) => { await installPausedNarration(page); });

for (const story of A2_STORIES) for (const choiceId of story.choices)
  test(`two-action Dialog / saved Journal / reload: ${choiceId}`, async ({ page, isMobile }) => {
    const { checkpoints, content, state: final } = a2Path(story, choiceId);
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
        const event = content.events.find(event => event.id === a2Root(story.key))!;
        const selected = event.choices.find(choice => choice.id === choiceId)!;
        const dialog = page.getByRole("dialog", { name: event.title, exact: true });
        await expect(dialog.getByRole("button")).toHaveCount(2);
        await expect(dialog.getByRole("heading")).toBeFocused();
        await dialog.getByRole("button", { name: selected.text, exact: true }).click();
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await pauseAndReveal(page);
      } else await stepNarration(page);
      const next = checkpoints[index + 1]!;
      await expect.poll(async () => JSON.parse((await page.evaluate(() => localStorage.getItem("parenthood-simulator.save")))!).state).toEqual(next);
    }
    const journal = page.getByRole("list", { name: "已發生的事件" });
    await expect(journal.locator("li > p")).toHaveText(projectJournal(final).reverse().map(row => row.text));
    await expect(journal.locator("strong")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (choiceId === story.choices[0]) await page.screenshot({ path: `test-results/NARRATIVE-A2-${story.key}-${isMobile ? "MOBILE" : "DESKTOP"}.png`, fullPage: true });
  });

for (const story of A2_STORIES) test(`isolated A2 preview resumes saved results: ${story.key}`, async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("parenthood-simulator.save", "original-bytes"));
  await page.goto(`/preview-narrative-a2.html?story=${story.key}`);
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button")).toHaveCount(2);
  await page.reload();
  await expect(dialog).toBeVisible();
  const choice = (await dialog.getByRole("button").last().textContent())!;
  await dialog.getByRole("button").last().click();
  await pauseAndReveal(page);
  await expect(page.getByRole("list", { name: "已發生的事件" })).toContainText(choice);
  const bytes = await page.evaluate(() => Object.fromEntries(Object.keys(sessionStorage).map(key => [key, sessionStorage.getItem(key)])));
  await page.reload();
  expect(await page.evaluate(() => Object.fromEntries(Object.keys(sessionStorage).map(key => [key, sessionStorage.getItem(key)])))).toEqual(bytes);
  expect(await page.evaluate(() => localStorage.getItem("parenthood-simulator.save"))).toBe("original-bytes");
});
