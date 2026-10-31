import { test, expect, type Page } from "@playwright/test";
import { createFamilyRun, projectJournal, transitionGame, getPlayerView } from "../../src/engine/index.js";
import { createMvpContent } from "../../src/content/mvp.js";
import { serializeGame } from "../../src/persistence/index.js";

const key = "parenthood-simulator.save";
const run = createFamilyRun({ seed: 42 });
const content = createMvpContent(run.actors);
const pending = transitionGame(run.state, content, { type: "ADVANCE" }).state;
const raw = serializeGame(pending);

async function openDecision(page: Page) {
  await page.addInitScript(({ key, raw }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
  }, { key, raw });
  await page.goto("/");
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  await expect(page.locator(".decision-dialog")).toBeVisible();
}

test("restored decisions are modal, trap keyboard focus, cannot be skipped, and return directly to newest Journal", async ({ page, isMobile }) => {
  await openDecision(page);
  const dialog = page.getByRole("dialog", { name: "凌晨的交接" });
  await expect(page.locator("#decision-title")).toBeFocused();
  await expect(page.locator(".game-background")).toHaveAttribute("inert", "");
  expect(await dialog.evaluate(element => element.matches(":modal"))).toBe(true);
  expect(await dialog.evaluate(element => getComputedStyle(element, "::backdrop").backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
  await expect(page.locator(".event-panel .decisions button")).toHaveCount(0);
  await expect(dialog.locator(".decisions button")).toHaveText(getPlayerView(pending, content).pendingEvent!.choices.map(choice => choice.text));
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.locator(".decisions button").last()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.locator(".decisions button").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await page.mouse.click(2, 2);
  await expect(dialog).toBeVisible();
  const before = await page.evaluate(key => localStorage.getItem(key), key);
  expect(before).toBe(raw);
  await page.reload();
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  await expect(dialog).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(raw);
  await page.setViewportSize({ width: isMobile ? 320 : 640, height: 320 });
  await page.evaluate(() => { document.documentElement.style.fontSize = "32px"; });
  const last = dialog.locator(".decisions button").last();
  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeInViewport();
  expect((await last.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: `test-results/decision-short-${isMobile ? "mobile" : "desktop"}.png` });
  await page.evaluate(() => { document.documentElement.style.fontSize = "16px"; });
  await page.setViewportSize({ width: isMobile ? 390 : 1440, height: isMobile ? 844 : 1000 });
  await dialog.locator(".decisions button").first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: `test-results/decision-modal-${isMobile ? "mobile" : "desktop"}.png` });
  await dialog.locator(".decisions button").first().press("Enter");
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".event-log > li").first()).toBeFocused();
  const expected = transitionGame(pending, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
  const saved = await page.evaluate(key => localStorage.getItem(key), key);
  expect(JSON.parse(saved!).state).toEqual(expected);
  const log = page.getByRole("list", { name: "已發生的事件" });
  await expect(log.locator("li > p")).toHaveText(projectJournal(expected).reverse().map(row => row.text));
  await expect(log.locator("strong")).toHaveText(["把今晚需要的事列出來，協調一段可交接的時間"]);
  await expect(page.getByRole("button", { name: "繼續生活", exact: true })).toBeEnabled();
});

for (const errorName of ["QuotaExceededError", "SecurityError"]) {
  test(`${errorName}: duplicate input keeps one accepted result and retry saves without another CHOOSE`, async ({ page, isMobile }) => {
    await openDecision(page);
    await page.evaluate(errorName => {
      const original = Storage.prototype.setItem;
      (window as any).restoreWrites = () => { Storage.prototype.setItem = original; };
      Storage.prototype.setItem = () => { throw new DOMException("unavailable", errorName); };
    }, errorName);
    const dialog = page.locator(".decision-dialog");
    await dialog.getByRole("button", { name: /把今晚需要的事列出來/ }).dblclick();
    await expect(dialog.getByRole("status")).toHaveText("選擇已保留於本次開啟的故事，尚未保存。");
    await expect(dialog.locator(".decisions button")).toHaveCount(0);
    await expect(dialog).toContainText("關閉或重新整理可能失去這次結果");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(raw);
    await page.screenshot({ path: `test-results/decision-${errorName}-${isMobile ? "mobile" : "desktop"}.png` });
    await page.evaluate(() => (window as any).restoreWrites());
    await dialog.getByRole("button", { name: "重試儲存", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator(".event-log > li").first()).toBeFocused();
    const expected = transitionGame(pending, content, { type: "CHOOSE", choiceId: "coordinate" }).state;
    expect(JSON.parse((await page.evaluate(key => localStorage.getItem(key), key))!).state).toEqual(expected);
    await page.reload();
    await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect(JSON.parse((await page.evaluate(key => localStorage.getItem(key), key))!).state).toEqual(expected);
  });
}

test("conflicting save offers warned reload and never overwrites the other tab's choice", async ({ page }) => {
  await openDecision(page);
  const newer = serializeGame(transitionGame(pending, content, { type: "CHOOSE", choiceId: "carry" }).state);
  await page.evaluate(({ key, newer }) => localStorage.setItem(key, newer), { key, newer });
  const dialog = page.locator(".decision-dialog");
  await dialog.getByRole("button", { name: /把今晚需要的事列出來/ }).click();
  await expect(dialog).toContainText("存檔已改變");
  await expect(dialog.getByRole("button", { name: "重試儲存" })).toHaveCount(0);
  await expect(dialog).toContainText("重新讀取會採裝置最後成功保存的版本");
  await dialog.getByRole("button", { name: "返回首頁並重新讀取" }).click();
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  await expect(page.locator(".event-log strong")).toHaveText(["今晚先自己承接，明天再談安排"]);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(newer);
});
