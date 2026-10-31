import { test, expect } from "@playwright/test";
import { writeFile, readFile } from "node:fs/promises";
import { createMvpContent } from "../../src/content/mvp.js";
import { createFamilyRun, createFamilyReview, getPlayerView, projectJournal, replayFamilyRun, transitionGame } from "../../src/engine/index.js";
import { resolveFamilyMembers } from "../../src/engine/actor-profiles.js";
import { serializeGame } from "../../src/persistence/index.js";
import type { GameState } from "../../src/domain/schemas.js";
import { UX_V2_FAMILIES } from "../helpers/ux-v2-scenarios.js";

const key = "parenthood-simulator.save";
for (const scenario of UX_V2_FAMILIES) {
  test(`${scenario.name} seed=${scenario.seed}: twelve stages, restored Dialog/Journal and both replay modes`, async ({ page, isMobile }, testInfo) => {
    test.setTimeout(180000);
    const run = createFamilyRun({ seed: scenario.seed });
    const content = createMvpContent(run.actors);
    const members = resolveFamilyMembers(run.state, run.actors).map(member => member.displayName);
    expect(run.state.family).toMatchObject({ householdComposition: scenario.household, careParticipation: scenario.care });
    await page.addInitScript(({ key, raw }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
    }, { key, raw: serializeGame(run.state) });
    await page.goto("/");
    await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
    await expect(page.locator(".reveal .member h3")).toHaveText(members);
    await page.getByRole("button", { name: "開始這個家庭", exact: true }).click();
    await expect(page.locator(".game-header [role=status]")).toHaveText("已儲存");
    let state = transitionGame(run.state, content, { type: "ADVANCE" }).state;
    let pendingReloaded = false; let midReloaded = false;
    const stages = new Set<string>();
    for (let step = 0; step < 200; step++) {
      const raw = (await page.evaluate(key => localStorage.getItem(key), key))!;
      expect(JSON.parse(raw)).toEqual({ schemaVersion: 7, state });
      stages.add(state.currentAgeStageId);
      const view = getPlayerView(state, content);
      if (view.completed) break;
      const reloadPending: boolean = !pendingReloaded && !!view.pendingEvent;
      const reloadMid: boolean = !midReloaded && state.turn?.status === "active" && state.turn.nodeCount > 0;
      if (reloadPending || reloadMid) {
        await page.reload();
        await page.getByRole("button", { name: "繼續上次生活", exact: true }).click();
        expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(raw);
        pendingReloaded ||= reloadPending; midReloaded ||= reloadMid;
      }
      await expect(page.getByRole("button", { name: "繼續故事", exact: true })).toHaveCount(0);
      await expect(page.locator(".story-stream, .event-panel .decisions")).toHaveCount(0);
      if (view.pendingEvent) {
        const dialog = page.getByRole("dialog", { name: view.pendingEvent.title, exact: true });
        await expect(dialog).toBeVisible();
        await expect(page.getByRole("dialog")).toHaveCount(1);
        await expect(dialog.locator("#decision-description")).toHaveText(view.pendingEvent.text);
        await expect(dialog.locator(".decisions button")).toHaveText(view.pendingEvent.choices.map(choice => choice.text));
        if (!view.pendingEvent.id.endsWith("-reconnect")) {
          expect(view.pendingEvent.choices.some(choice => choice.id === "handoff")).toBe(run.state.family.persistentActorIds.includes("caregiver-2"));
          expect(view.pendingEvent.choices.some(choice => choice.id === "ask-family")).toBe(run.state.family.persistentActorIds.includes("support-1"));
        }
        const choiceId = view.pendingEvent.id.endsWith("-reconnect") ? "pause" : scenario.path;
        const choice = view.pendingEvent.choices.find(choice => choice.id === choiceId)!;
        const expected = transitionGame(state, content, { type: "CHOOSE", choiceId });
        await dialog.getByRole("button", { name: choice.text, exact: true }).click();
        await expect(dialog).toHaveCount(0);
        state = expected.state;
        await expect(page.locator(".event-log > li").first()).toBeFocused();
      } else {
        const records = projectJournal(state).reverse();
        const log = page.getByRole("list", { name: "已發生的事件" });
        await expect(log.locator("li > p")).toHaveText(records.map(row => row.text));
        await expect(log.locator("strong")).toHaveText(records.filter(row => row.kind === "choice").map(row => row.choiceText!));
        if (isMobile) {
          await page.getByRole("tab", { name: "紀錄", exact: true }).click();
          await expect(log).toHaveCount(1);
          await expect(log.locator("li > p")).toHaveText(records.map(row => row.text));
          expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(raw);
          await page.getByRole("tab", { name: "生活", exact: true }).click();
        }
        state = transitionGame(state, content, view.nextInput!).state;
        await page.getByRole("button", { name: "繼續生活", exact: true }).click();
      }
      await expect(page.locator(".game-header [role=status]")).toHaveText("已儲存");
    }
    expect(stages.size).toBe(12); expect(pendingReloaded && midReloaded).toBe(true);
    await expect(page.getByRole("heading", { name: "我們的家庭生活回顧", exact: true })).toBeVisible();
    await expect(page.locator(".review-shell .member h3")).toHaveText(members);
    const rows = projectJournal(state);
    const daily = rows.filter(row => row.kind === "daily");
    expect(daily).toHaveLength(4);
    expect(new Set(daily.map(row => row.text)).size).toBe(4);
    const timeline = page.locator(".review-timeline > li");
    await expect(timeline).toHaveCount(12);
    for (const stage of await timeline.all()) await stage.locator("summary").click();
    // Timeline renders each source exactly once, newest-first inside each stage.
    const expectedTimeline = content.ageStages.flatMap(stage => rows.filter(row => row.ageStageId === stage.id).reverse());
    await expect(timeline.locator("[data-journal-id] > p")).toHaveText(expectedTimeline.map(row => row.text));
    expect(await timeline.locator("[data-journal-id]").evaluateAll(elements => new Set(elements.map(element => element.getAttribute("data-journal-id"))).size)).toBe(rows.length);
    await expect(page.locator(".review-shell > section").nth(1).locator("strong")).toHaveCount(3);
    await page.getByText("調整三個關鍵時刻", { exact: true }).click();
    const beforeSelection = (await page.evaluate(key => localStorage.getItem(key), key))!;
    await page.getByRole("checkbox", { checked: true }).first().uncheck();
    await page.getByRole("checkbox", { checked: false }).last().check();
    await page.getByRole("button", { name: "儲存關鍵時刻", exact: true }).click();
    await expect(page.locator(".game-header [role=status]")).toHaveText("已儲存");
    const selectedRaw = (await page.evaluate(key => localStorage.getItem(key), key))!;
    const selected: GameState = JSON.parse(selectedRaw).state;
    expect(selected.review!.keyMomentIds).not.toEqual(createFamilyReview(JSON.parse(beforeSelection).state, content).keyMomentIds);
    expect(selected.review!.keyMomentIds.some(id => daily.some(row => row.sourceHistoryId === id))).toBe(false);
    await expect(page.getByRole("textbox")).toHaveValue(selected.review!.safeShareText);
    for (const profile of Object.values(selected.actorProfiles!))
      if (profile.source !== "legacy-unknown") expect(selected.review!.safeShareText).not.toContain(profile.name);
    await page.reload();
    await page.getByRole("button", { name: "重看家庭紀錄", exact: true }).click();
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(selectedRaw);
    await page.screenshot({ path: `test-results/ux-v2-${scenario.name}-${isMobile ? "mobile" : "desktop"}.png` });
    await page.getByRole("button", { name: "相同種子，再走一次", exact: true }).click();
    await page.getByRole("button", { name: "確認開始新故事", exact: true }).click();
    await expect(page.locator(".reveal .member h3")).toHaveText(members);
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(selectedRaw);
    await page.getByRole("button", { name: "開始這個家庭", exact: true }).click();
    await expect(page.locator(".game-header [role=status]")).toHaveText("已儲存");
    const replayRaw = (await page.evaluate(key => localStorage.getItem(key), key))!;
    expect(JSON.parse(replayRaw).state).toEqual(transitionGame(run.state, content, { type: "ADVANCE" }).state);
    // Test both modes independently from the same real, edited completed save.
    // This is fixture setup, not an in-product backup restore feature.
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key, raw: selectedRaw });
    await page.reload();
    await page.getByRole("button", { name: "重看家庭紀錄", exact: true }).click();
    await page.getByRole("button", { name: "認識新的家庭", exact: true }).click();
    await page.getByRole("button", { name: "確認開始新故事", exact: true }).click();
    const nextSeed = scenario.seed + 1000;
    await page.evaluate(seed => Object.defineProperty(crypto, "getRandomValues", {
      configurable: true, value: (array: Uint32Array) => { array[0] = seed; return array; },
    }), nextSeed);
    await page.getByRole("button", { name: "跳過測驗，從當下開始", exact: true }).click();
    await expect(page.locator(".seed-label")).toHaveText(`家庭種子：${nextSeed}`);
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(selectedRaw);
    await page.getByRole("button", { name: "開始這個家庭", exact: true }).click();
    await expect(page.locator(".game-header [role=status]")).toHaveText("已儲存");
    const next = createFamilyRun({ seed: nextSeed });
    const nextContent = createMvpContent(next.actors);
    const saved = (await page.evaluate(key => localStorage.getItem(key), key))!;
    expect(JSON.parse(saved).state).toEqual(transitionGame(next.state, nextContent, { type: "ADVANCE" }).state);
    expect(await page.evaluate(({ key, raw }) => Object.keys(localStorage).some(name => name.startsWith(`${key}.preserved.`) && localStorage.getItem(name) === raw), { key, raw: selectedRaw })).toBe(true);
    const evidencePath = testInfo.outputPath("family-acceptance.json");
    await writeFile(evidencePath, JSON.stringify({ scenario, stages: stages.size,
      records: rows.length, daily: daily.length, choices: state.choiceHistory.length,
      events: state.completedEventIds, schedules: state.scheduledFollowUps, selectedMoments: selected.review!.keyMomentIds,
      finalRngState: state.rngState, finalResources: state.resources }, null, 2));
    await testInfo.attach("family-acceptance.json", { path: evidencePath, contentType: "application/json" });
  });
}

test("a completed v6 save without replayOrigin warns before replay and starts the documented seed-default opening", async ({ page }) => {
  const fixtures = JSON.parse(await readFile(new URL("../helpers/ux-v2-historical-saves.json", import.meta.url), "utf8"));
  const fixture = fixtures.find((row: any) => row.label === "v6-completed-custom-review").save;
  delete fixture.state.replayOrigin;
  const raw = JSON.stringify(fixture);
  await page.addInitScript(({ key, raw }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
  }, { key, raw });
  await page.goto("/");
  await page.getByRole("button", { name: "更新存檔並繼續", exact: true }).click();
  await expect(page.getByRole("heading", { name: "我們的家庭生活回顧", exact: true })).toBeVisible();
  const saved = (await page.evaluate(key => localStorage.getItem(key), key))!;
  const migrated = JSON.parse(saved).state;
  expect(migrated.history).toEqual(fixture.state.history);
  expect(migrated.replayOrigin).toBeUndefined();
  const replay = page.getByRole("button", { name: "相同種子，再走一次", exact: true });
  await expect(replay).toHaveAccessibleDescription(/缺少開場快照.*預設開場.*無法還原/);
  await replay.click();
  await page.getByRole("button", { name: "確認開始新故事", exact: true }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(saved);
  await page.getByRole("button", { name: "開始這個家庭", exact: true }).click();
  await expect(page.locator(".game-header [role=status]")).toHaveText("已儲存");
  const expected = replayFamilyRun(migrated);
  expect(JSON.parse((await page.evaluate(key => localStorage.getItem(key), key))!).state)
    .toEqual(transitionGame(expected.state, createMvpContent(expected.actors), { type: "ADVANCE" }).state);
  expect(await page.evaluate(({ key, raw }) => Object.keys(localStorage).some(name => name.startsWith(`${key}.preserved.`) && localStorage.getItem(name) === raw), { key, raw: saved })).toBe(true);
});
