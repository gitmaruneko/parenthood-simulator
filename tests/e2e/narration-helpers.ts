import { expect, type Page } from "@playwright/test";
import { NARRATION_PAUSE_KEY } from "../../src/ui/narration-preference.js";

// Existing exact-checkpoint regressions opt into the real optional pause control.
// Automatic timing itself is covered separately with a controlled browser clock.
export async function installPausedNarration(page: Page) {
  await page.clock.install();
  await page.addInitScript(key => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, "true");
  }, NARRATION_PAUSE_KEY);
}

export async function pauseAndReveal(page: Page) {
  if (await page.locator(".decision-dialog").count()) return;
  const pause = page.getByRole("button", { name: "暫停敘事", exact: true });
  if (await pause.count()) await pause.click();
  const fast = page.getByRole("button", { name: "快速顯示", exact: true });
  if (await fast.count() && await fast.isEnabled()) await fast.click();
}

export async function stepNarration(page: Page) {
  await pauseAndReveal(page);
  const before = await page.evaluate(() => localStorage.getItem("parenthood-simulator.save"));
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await page.getByRole("button", { name: "恢復敘事", exact: true }).click();
  await page.clock.runFor(251);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("parenthood-simulator.save")),
    { intervals: [10], timeout: 5000 }).not.toBe(before);
  await pauseAndReveal(page);
  await page.clock.resume();
}
