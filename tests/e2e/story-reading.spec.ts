import { test, expect } from "@playwright/test";
import { createFamilyRun, getPlayerView, transitionGame } from "../../src/engine/index.js";
import { createMvpContent } from "../../src/content/mvp.js";
import { serializeGame } from "../../src/persistence/index.js";
import { NARRATION_PAUSE_KEY } from "../../src/ui/narration-preference.js";

const key = "parenthood-simulator.save";
const run = createFamilyRun({ seed: 42 });
const content = createMvpContent(run.actors);
function beforePending() {
  let state = run.state;
  for (let step = 0; step < 200; step++) {
    const view = getPlayerView(state, content);
    const next = transitionGame(state, content, view.pendingEvent ?
      { type: "CHOOSE", choiceId: view.pendingEvent.choices[0]!.id } : view.nextInput!).state;
    if (state.history.length > 15 && !view.pendingEvent && getPlayerView(next, content).pendingEvent) return state;
    state = next;
  }
  throw new Error("missing long Journal fixture");
}
const raw = serializeGame(beforePending());

test("old-record pending protects viewport and focus until explicit entry", async ({ page }, testInfo) => {
  await page.addInitScript(({ key, raw }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, raw); }, { key, raw });
  await page.goto("/");
  // Interrupt at the storage boundary during the accepted command, before its pending snapshot publishes.
  await page.evaluate(key => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      original.call(this, name, value);
      if (name !== key || !document.querySelector(".event-log > li")) return;
      Storage.prototype.setItem = original;
      const row = document.querySelectorAll<HTMLElement>(".event-log > li")[6]!;
      row.scrollIntoView({ block: "start", behavior: "instant" }); row.focus({ preventScroll: true });
      window.dispatchEvent(new Event("scroll"));
      (window as any).readingAnchor = { id: row.id, top: row.getBoundingClientRect().top };
    };
  }, key);
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  const notice = page.getByRole("complementary", { name: "閱讀中的敘事狀態" });
  await expect(notice).toContainText("有重大抉擇等待你");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const anchor = await page.evaluate(() => (window as any).readingAnchor as { id: string; top: number });
  const row = page.locator(`[id="${anchor.id}"]`);
  await expect(row).toBeFocused();
  expect(Math.abs((await row.boundingBox())!.y - anchor.top)).toBeLessThan(2);
  const pendingRaw = await page.evaluate(key => localStorage.getItem(key), key);
  await page.waitForTimeout(500);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(pendingRaw);
  await notice.getByRole("button", { name: "查看待選抉擇" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await page.getByRole("dialog").locator(".decisions button").first().click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(row).toBeFocused();
  expect(Math.abs((await row.boundingBox())!.y - anchor.top)).toBeLessThan(2);
  await page.screenshot({ path: testInfo.outputPath("old-record-pending.png") });
});

test("manual pause survives reload and returning to latest without modifying game bytes", async ({ page }) => {
  await page.addInitScript(({ key, raw, pref }) => {
    if (!localStorage.getItem(key)) { localStorage.setItem(key, raw); localStorage.setItem(pref, "true"); }
  }, { key, raw, pref: NARRATION_PAUSE_KEY });
  await page.goto("/");
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  await expect(page.getByRole("button", { name: "恢復敘事" })).toBeVisible();
  await page.locator(".event-log > li").nth(6).scrollIntoViewIfNeeded();
  const notice = page.getByRole("complementary", { name: "閱讀中的敘事狀態" });
  await expect(notice).toBeVisible();
  await notice.getByRole("button", { name: "回到最新紀錄" }).click();
  await expect(page.getByRole("button", { name: "恢復敘事" })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  await expect(page.getByRole("button", { name: "恢復敘事" })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(raw);
});
