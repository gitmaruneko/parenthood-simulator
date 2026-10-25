import { test, expect, type Page } from "@playwright/test";
import { createFamilyRun } from "../../src/engine/index.js";

const key = "parenthood-simulator.save";
test("opening candidates expand and family members show current relationships", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "開始我們的故事", exact: true }).click();
  const main = page.getByRole("main");
  await expect(main.getByRole("button", { name: /外食、外帶或叫外送/ })).toHaveCount(0);
  await main.getByRole("button", { name: "看看其他做法" }).click();
  await expect(main.getByRole("button", { name: /同住家人已經煮好飯/ })).toBeVisible();
  await page.screenshot({ path: `test-results/opening-dinner-${isMobile ? "mobile" : "desktop"}.png`, fullPage: true });
  await main.getByRole("button", { name: /外食、外帶或叫外送/ }).click();
  await expect(main.getByRole("button", { name: /手機或平板/ })).toHaveCount(0);
  await main.getByRole("button", { name: "看看其他做法" }).click();
  await expect(main.getByRole("button", { name: /手機或平板/ })).toBeVisible();
  await page.screenshot({ path: `test-results/opening-restaurant-${isMobile ? "mobile" : "desktop"}.png`, fullPage: true });
  await main.getByRole("button", { name: /事先準備的安撫玩具/ }).click();
  await main.getByRole("button", { name: "跳過測驗，從當下開始" }).click();
  await startFamily(page);
  if (isMobile) await page.getByRole("tab", { name: "家庭", exact: true }).click();
  const family = page.getByRole("tabpanel", { name: isMobile ? "家庭" : "心事", exact: true });
  await expect(family.getByText("你的孩子 · 2 個月")).toBeVisible();
  await expect(family.getByText("照顧安排", { exact: true })).toBeVisible();
  await expect(family.getByText("家庭工作", { exact: true })).toBeVisible();
  await expect(family.getByText("一起走進今天的生活")).toHaveCount(0);
  await page.screenshot({ path: `test-results/family-members-${isMobile ? "mobile" : "desktop"}.png`, fullPage: true });
  await family.getByText(/查看.+的生活脈絡/).first().click();
  await expect(family.getByText(/家庭照顧安排：/).first()).toBeVisible();
  if (isMobile) await page.setViewportSize({ width: 320, height: 844 });
  await page.screenshot({ path: `test-results/family-details-${isMobile ? "mobile-320" : "desktop"}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

// Click completion precedes the session's yielded save operation.
async function waitForSaved(page: Page) {
  await expect(page.locator(".game-header").getByRole("status")).toHaveText("已儲存");
}
async function startFamily(page: Page) {
  await page.getByRole("button", { name: "開始這個家庭" }).click();
  await waitForSaved(page);
}

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
  await startFamily(page);
  const group = page.getByRole("group", { name: "家庭生活方向" });
  await expect(group.getByRole("radio")).toHaveCount(6);
  for (const radio of await group.getByRole("radio").all()) await expect(radio).toBeVisible();
  const rawBefore = await page.evaluate((key) => localStorage.getItem(key), key);
  const selected = group.getByRole("radio", { name: /照顧者身心/ });
  // The controlled radio updates after the asynchronous save completes.
  await selected.click();
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

test("compact directions and family details stay readable without changing the saved story", async ({ page, isMobile }) => {
  await start(page);
  await startFamily(page);
  const before = await page.evaluate((key) => localStorage.getItem(key), key);
  const group = page.getByRole("group", { name: "家庭生活方向" });
  const help = page.getByText("方向說明", { exact: true });
  await help.focus();
  await help.press("Enter");
  await expect(page.getByText("留意休息、自我照顧與照顧者需要", { exact: true })).toBeVisible();
  await help.press("Enter");
  await expect(page.getByText("留意休息、自我照顧與照顧者需要", { exact: true })).not.toBeVisible();
  const widths = isMobile ? [320, 390] : [768, 1024, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    for (const radio of await group.getByRole("radio").all()) {
      await expect(radio).toBeVisible();
      const target = await radio.locator("..").boundingBox();
      expect(target!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  if (isMobile) await page.getByRole("tab", { name: "家庭", exact: true }).click();
  const family = page.getByRole("heading", { name: "家庭檔案", exact: true }).locator("..");
  await expect(family.getByText("家庭型態", { exact: true })).toBeVisible();
  await expect(family.getByText("分工狀態", { exact: true })).toBeVisible();
  const details = family.getByText("家庭詳細資料", { exact: true });
  await details.focus();
  await details.press("Enter");
  await expect(family.getByText("你將以「照顧者」的稱呼，開始安排與孩子一起生活的日常。", { exact: true })).toBeVisible();
  await expect(family.locator(".condition")).toHaveCount(3);
  await details.press("Enter");
  await page.evaluate(() => { document.documentElement.style.fontSize = "32px"; });
  if (isMobile) {
    await page.getByRole("tab", { name: "生活", exact: true }).click();
    await page.setViewportSize({ width: 320, height: 844 });
  }
  for (const radio of await group.getByRole("radio").all()) await expect(radio).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/ux-v2-t1-large-text-${isMobile ? "mobile" : "desktop"}.png`, fullPage: true });
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(before);
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
  await startFamily(page);
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
  await startFamily(page);
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

for (const [kind, raw] of [["corrupt", "broken-story"], ["incompatible", '{"schemaVersion":999,"state":{}}']] as const) {
test(`preserves ${kind} saves through recovery and safely replaces only on confirmation`, async ({
  page,
}) => {
  await seedSave(page, raw);
  await page.goto("/");
  await page.getByRole("button", { name: "查看恢復選項" }).click();
  await expect(page.getByRole("dialog")).toContainText("原始資料未刪除");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "開始新的故事", exact: true }).click();
  await page.getByRole("button", { name: "確認開始新故事" }).click();
  await page.getByRole("button", { name: "跳過測驗，從當下開始" }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    raw,
  );
  await startFamily(page);
  expect(
    await page.evaluate(
      (key) => localStorage.getItem(`${key}.preserved.0`),
      key,
    ),
  ).toBe(raw);
  await expect(
    page.getByText("AgeStage 1 / 12", { exact: true }),
  ).toBeVisible();
});
}

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

test("finishes twelve stages, edits the review and confirms replay safely", async ({
  page,
  isMobile,
}) => {
  await start(page);
  const names = await page.locator(".reveal .member h3").allTextContents();
  const habits = await page.locator(".reveal .member > p").allTextContents();
  await expect(page.getByRole("heading", { name: "此刻的照顧傾向" })).toHaveCount(0);
  await startFamily(page);
  await expect(page.locator(".event-panel")).toContainText(names[0]!);
  await page.reload();
  await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
  if (isMobile) await page.getByRole("tab", { name: "家庭", exact: true }).click();
  const members = page.locator(isMobile ? ".mobile-members" : ".desktop-members");
  expect(await members.locator(".member h3").allTextContents()).toEqual(names);
  for (const habit of habits) await expect(members).toContainText(habit);
  if (isMobile) await page.getByRole("tab", { name: "生活", exact: true }).click();
  const life = page.getByRole("tabpanel", { name: "生活", exact: true });
  for (let step = 0; step < 120; step++) {
    if (await page.getByRole("heading", { name: "我們的家庭生活回顧" }).count())
      break;
    const button = life.getByRole("button").first();
    await expect(button).toBeEnabled();
    await button.click();
    await waitForSaved(page);
  }
  await expect(
    page.getByText("AgeStage 12 / 12", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "我們的家庭生活回顧" }),
  ).toBeVisible();
  const saved = await page.evaluate((key) => localStorage.getItem(key), key);
  await page.getByRole("button", { name: "返回首頁", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "遊戲操作" }).getByRole("status"),
  ).toHaveText("這段生活已成為家庭紀錄");
  await page.getByRole("button", { name: "重看家庭紀錄" }).click();
  await expect(
    page.getByRole("heading", { name: "我們的家庭生活回顧" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "我們的家庭生活回顧" }),
  ).toBeFocused();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    saved,
  );
  await expect(page.locator(".review-timeline > li")).toHaveCount(12);
  expect(await page.locator(".review-shell .member h3").allTextContents()).toEqual(names);
  for (const habit of habits) await expect(page.locator(".review-shell")).toContainText(habit);
  await page.getByText("調整三個關鍵時刻", { exact: true }).click();
  await page.getByRole("checkbox", { checked: true }).first().uncheck();
  await page.getByRole("checkbox", { checked: false }).last().check();
  await page.getByRole("button", { name: "儲存關鍵時刻" }).click();
  await expect(page.getByRole("button", { name: "相同種子，再走一次" })).toBeEnabled();
  await expect(page.getByRole("textbox")).toHaveValue(/這是遊戲中的家庭紀錄/);
  await page.screenshot({ path: `test-results/review-${isMobile ? "mobile" : "desktop"}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const reviewed = await page.evaluate((key) => localStorage.getItem(key), key);
  await page.getByRole("button", { name: "相同種子，再走一次" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "保留原本的故事" }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(reviewed);
  await expect(page.getByRole("button", { name: "相同種子，再走一次" })).toBeFocused();
  await page.getByRole("button", { name: "相同種子，再走一次" }).click();
  await page.getByRole("button", { name: "確認開始新故事" }).click();
  await expect(page.getByRole("button", { name: "開始這個家庭" })).toBeVisible();
  expect(await page.locator(".reveal .member h3").allTextContents()).toEqual(names);
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(reviewed);
  await startFamily(page);
  const replayed = JSON.parse((await page.evaluate((key) => localStorage.getItem(key), key))!);
  expect(replayed.state.seed).toBe(JSON.parse(saved!).state.seed);
  await expect(page.getByRole("heading", { name: "我們的家庭生活回顧" })).toHaveCount(0);
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
