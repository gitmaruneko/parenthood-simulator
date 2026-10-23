import { test, expect, type Page } from "@playwright/test";
import { createFamilyRun } from "../../src/engine/index.js";

const key = "parenthood-simulator.save";
async function seedSave(page: Page, raw: string) {
  await page.addInitScript(
    ({ key, raw }) => {
      if (!localStorage.getItem("test-installed")) {
        localStorage.setItem(key, raw);
        localStorage.setItem("test-installed", "yes");
      }
    },
    { key, raw },
  );
}
async function start(page: Page, assessment = false) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "開始我們的故事", exact: true })
    .click();
  if (assessment) {
    for (let index = 0; index < 5; index++) {
      await expect(
        page.getByText(`開場情境 ${index + 1} / 5 · 可隨時跳過`),
      ).toBeVisible();
      await page.getByRole("main").getByRole("button").first().click();
    }
  } else
    await page.getByRole("button", { name: "跳過測驗，從當下開始" }).click();
  await expect(
    page.getByRole("heading", {
      name: "從今天開始， 我要經營一個怎樣的家庭？",
    }),
  ).toBeVisible();
}

test("persistent direction selection saves immediately, preserves pending story and supports keyboard", async ({ page, isMobile }) => {
  await start(page);
  await page.getByRole("button", { name: "開始這個家庭" }).click();
  const group = page.getByRole("group", { name: "家庭生活方向" });
  await expect(group.getByRole("radio")).toHaveCount(6);
  for (const radio of await group.getByRole("radio").all()) await expect(radio).toBeVisible();
  const rawBefore = await page.evaluate((key) => localStorage.getItem(key), key);
  const selected = group.getByRole("radio", { name: /照顧者身心/ });
  await selected.check();
  await expect(selected).toBeChecked();
  await expect(selected).toBeFocused();
  await expect(page.getByText("已儲存", { exact: true }).first()).toBeVisible();
  const rawAfter = await page.evaluate((key) => localStorage.getItem(key), key);
  const before = JSON.parse(rawBefore!).state;
  expect(JSON.parse(rawAfter!).state).toEqual({ ...before, activeFamilyLifeDirectionId: "caregiver-wellbeing" });
  await selected.press("ArrowRight");
  await expect(group.getByRole("radio", { name: /生活探索/ })).toBeChecked();
  await page.screenshot({ path: `test-results/direction-${isMobile ? "mobile" : "desktop"}.png`, fullPage: true });
  await page.reload();
  await page.getByRole("button", { name: "繼續上次生活" }).click();
  await expect(page.getByRole("radio", { name: /生活探索/ })).toBeChecked();
  const restored = JSON.parse((await page.evaluate((key) => localStorage.getItem(key), key))!).state;
  expect(restored).toEqual({ ...before, activeFamilyLifeDirectionId: "life-exploration" });
});

test("browse original previews, reroll, choose, read reactions, restore and preserve tabs", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.screenshot({
    path: `test-results/home-${isMobile ? "mobile" : "desktop"}.png`,
  });
  await expect(
    page.getByRole("heading", { name: "每個家庭， 都有正在發生的生活" }),
  ).toBeVisible();
  const preview = page.getByRole("button", { name: "讀一段生活 ＋" }).first();
  await preview.click();
  await expect(
    page.getByRole("button", { name: "收起這段生活 −" }).first(),
  ).toHaveAttribute("aria-expanded", "true");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), key),
  ).toBeNull();
  await start(page);
  const seed = await page.getByText(/家庭種子：/).innerText();
  const summary = await page.getByRole("main").innerText();
  await page.getByRole("button", { name: "重新抽選家庭" }).click();
  await expect(page.getByText(/家庭種子：/)).not.toHaveText(seed);
  expect(await page.getByRole("main").innerText()).not.toEqual(summary);
  await page.getByRole("button", { name: "開始這個家庭" }).click();
  await expect(
    page.getByText("AgeStage 1 / 12", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Turn 1", { exact: true })).toBeVisible();
  await expect(page.locator("#event-title")).toBeFocused();
  const life = page.getByRole("tabpanel", { name: "生活", exact: true });
  await life.getByRole("button").first().click();
  await expect(life.getByText("故事正在發展", { exact: true })).toBeVisible();
  await expect(life.getByText(/實際觀察 ·/).first()).toBeVisible();
  const saved = await page.evaluate((key) => localStorage.getItem(key), key);
  await life.getByRole("button", { name: "繼續故事", exact: true }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    saved,
  );
  if (isMobile) {
    await page.getByRole("tab", { name: "家庭", exact: true }).click();
    await expect(page.getByRole("heading", { name: "家庭資源" })).toBeVisible();
    await page.getByRole("tab", { name: "紀錄", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "家庭生活紀錄" }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "生活", exact: true }).click();
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
      saved,
    );
    await expect(
      life.getByRole("button", { name: "繼續故事", exact: true }),
    ).toHaveCount(0);
  }
  await page.reload();
  await page.getByRole("button", { name: "繼續上次生活" }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    saved,
  );
  await expect(page.getByText("Turn 1", { exact: true })).toBeVisible();
  await page.screenshot({
    path: `test-results/game-${isMobile ? "mobile" : "desktop"}.png`,
    fullPage: true,
  });
});

test("completes all five assessment questions and cancels new-story confirmation safely", async ({
  page,
}) => {
  await start(page, true);
  await page.getByRole("button", { name: "開始這個家庭" }).click();
  const saved = await page.evaluate((key) => localStorage.getItem(key), key);
  await page.getByRole("button", { name: "返回首頁", exact: true }).click();
  await page.getByRole("button", { name: "開始新的故事", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "保留原本的故事" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "確認開始新故事" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "保留原本的故事" }),
  ).toBeFocused();
  await expect(page.getByRole("region", { name: "遊戲操作" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "開始新的故事", exact: true }),
  ).toBeFocused();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    saved,
  );
  await page.getByRole("button", { name: "開始新的故事", exact: true }).click();
  await page.getByRole("button", { name: "確認開始新故事" }).click();
  await page.getByRole("button", { name: "返回首頁", exact: true }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    saved,
  );
});

test("preserves corrupt saves through recovery and safely replaces only on confirmation", async ({
  page,
}) => {
  await seedSave(page, "broken-story");
  await page.goto("/");
  await page.getByRole("button", { name: "查看恢復選項" }).click();
  await expect(page.getByRole("dialog")).toContainText("原始資料未刪除");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "開始新的故事", exact: true }).click();
  await page.getByRole("button", { name: "確認開始新故事" }).click();
  await page.getByRole("button", { name: "跳過測驗，從當下開始" }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    "broken-story",
  );
  await page.getByRole("button", { name: "開始這個家庭" }).click();
  expect(
    await page.evaluate(
      (key) => localStorage.getItem(`${key}.preserved.0`),
      key,
    ),
  ).toBe("broken-story");
  await expect(
    page.getByText("AgeStage 1 / 12", { exact: true }),
  ).toBeVisible();
});

test("explicit migration retains the original data before entering the story", async ({
  page,
}) => {
  const raw = JSON.stringify(createFamilyRun({ seed: 42 }).state);
  await seedSave(page, raw);
  await page.goto("/");
  await page.getByRole("button", { name: "更新存檔並繼續" }).click();
  await expect(
    page.getByRole("heading", {
      name: "從今天開始， 我要經營一個怎樣的家庭？",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (key) => localStorage.getItem(`${key}.preserved.0`),
      key,
    ),
  ).toBe(raw);
});

test("homepage reflows at required widths, large text, and short windows", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByRole("button", { name: "開始我們的故事", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 600 });
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "開始我們的故事", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `test-results/home-large-text-${isMobile ? "mobile" : "desktop"}.png`,
    fullPage: true,
  });
});

test("storage denial remains recoverable and does not offer a new-story shortcut", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("blocked", "SecurityError");
    };
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "重新讀取", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "開始我們的故事", exact: true }),
  ).toHaveCount(0);
});

test("finishes twelve stages and reopens the existing family log without advancing", async ({
  page,
  isMobile,
}) => {
  await start(page);
  await page.getByRole("button", { name: "開始這個家庭" }).click();
  const life = page.getByRole("tabpanel", { name: "生活", exact: true });
  for (let step = 0; step < 120; step++) {
    if (await life.getByText("十二個階段告一段落。", { exact: false }).count())
      break;
    const button = life.getByRole("button").first();
    await expect(button).toBeEnabled();
    await button.click();
  }
  await expect(
    page.getByText("AgeStage 12 / 12", { exact: true }),
  ).toBeVisible();
  await expect(
    life.getByText("十二個階段告一段落。", { exact: false }),
  ).toBeVisible();
  const saved = await page.evaluate((key) => localStorage.getItem(key), key);
  await page.getByRole("button", { name: "返回首頁", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "遊戲操作" }).getByRole("status"),
  ).toHaveText("這段生活已成為家庭紀錄");
  await page.getByRole("button", { name: "重看家庭紀錄" }).click();
  await expect(
    page.getByRole("heading", { name: "家庭生活紀錄" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "家庭生活紀錄" }),
  ).toBeFocused();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    saved,
  );
});

test("migration write failures remain in recovery and keep the original story", async ({
  page,
}) => {
  const raw = JSON.stringify(createFamilyRun({ seed: 42 }).state);
  await seedSave(page, raw);
  await page.addInitScript(() => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.includes(".preserved."))
        throw new DOMException("full", "QuotaExceededError");
      write.call(this, key, value);
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "更新存檔並繼續" }).click();
  await expect(page.getByRole("dialog")).toContainText("儲存空間不足");
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    raw,
  );
});
