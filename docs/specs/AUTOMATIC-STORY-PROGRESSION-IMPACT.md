# Automatic Story Progression — 規格與影響分析

狀態：2026-11-02 使用者已核准修正版與 Testing Seam，授權拆票、依序實作、每票獨立 Review／驗收及 PR。不自行 Merge 或部署正式站。
GitHub Issue：[規格 #52](https://github.com/gitmaruneko/parenthood-simulator/issues/52)，移除 needs-info，改標記 ready-for-agent。
分析基準：checkout `4755872f43421e73731f219476bc822f9b6497a6`。

## 現行命令與保存流程

| 邊界 | 目前行為 | 本需求影響 |
| --- | --- | --- |
| `src/ui/GameScreen.tsx` | 「繼續生活」經 onAdvance；FamilyLog 即時投影全部 Journal；focusKey 更新就聚焦標題 | 移除大型手動入口，分批呈現、閱讀錨點、小型控制；取消一般更新自動聚焦 |
| `src/ui/App.tsx` | 綁定 Session；pending 直接掛載 Dialog；選後聚焦最新紀錄 | 連接唯一控制器、可見性與顯示 gate；尊重舊紀錄焦點；保存復原不受 gate 阻擋 |
| `src/ui/player-session.ts` | advance 使用公開 nextInput；execute 經 transitionAndSave；startFamily 已送首個 ADVANCE；choose / retry / setDirection 有既有 guard | 控制器優先沿用公開命令；如需補充，限唯讀 revision / owner 與 Session 排程介面；保留原命令語義 |
| `src/engine/event-engine.ts` | getPlayerView 提供 ADVANCE、START_TURN、NEXT_AGE_STAGE 或 null；一次可多節點；CHOOSE 只結算目前節點 | 只讀取公開投影，不修改 |
| `src/persistence/transition-and-save.ts` | 先執行純引擎，再逐 checkpoint 寫入，失敗留記憶體結果與最後保存 bytes | 保留；控制器以 error / hasUnsavedChanges 判斷，不以 Promise resolve 判斷保存成功 |
| `src/engine/journal.ts`、`src/ui/JournalText.tsx` | 來源穩定 ID、保存文字與 choiceText 粗體 | 沿用來源與字重；顯示游標不寫入 GameState |

`getPlayerView.nextInput`：pending／completed → null；Stage 結束 → NEXT_AGE_STAGE；Turn 結束 → START_TURN；其餘 → ADVANCE。不能把每次 advance 當成「一個事件」，也不能把 CHOOSE 當成會自動跑完後續故事。

## 主要風險與處理

1. 單命令多筆輸出：以已保存 Journal 顯示佇列處理，不拆結算或少存 checkpoint；佇列清空後才再發命令。
2. Dialog 連開：pending 立即停止引擎推進；前文及選後結果保留閱讀時間；讀檔 pending 在最新區恢復，舊紀錄只提示待選入口；保存復原優先顯示。快速顯示不加額外 3 秒等待。
3. effect 重啟／舊 timer：每 Session 單一 owner、generation / revision 與一次一個命令；卸載、換局、離頁使舊回呼失效。
4. 保存中途失敗：不能重送 ADVANCE 或 CHOOSE；沿用 retry 保存已接受狀態。重新開啟只從最後成功 checkpoint 繼續。
5. 閱讀位置：移除 history-driven focus；新插入保留可見 record / offset；選後尊重原閱讀錨點。這會調整 #39 一律定位最新的驗收。
6. 方向更新競態：已排隊使用者命令先執行並保存，再安排自動 advance。
7. 結束畫面：完成狀態立即停發命令，最後 Journal 顯示完成後才切回顧。
8. 非進度／無限排程：無進度停止，加每 Stage 64 次自動命令 watchdog；沿用引擎 cycle protection 與 4 / 6 預算。
9. 現存 preview：新故事已使用 #42 的 08A 綁定；需 v7 與 v8 回歸，不能假設全部還是舊 MVP，亦不改 #42 內容。

## Testing Seam 與文件影響

主要 seam 為真實 PlayerSession + 可控 SaveStorage + 時鐘／可見性邊界；輔以 React 與 Playwright 桌面、手機。沿用 decision-session、player-session、persistence、journal、ux-v2 integration／migration 及四種固定家庭 fixtures。需更新 player-ui、decision-ui 與相關 E2E 的手動按鈕及選後焦點斷言。

實作後更新 `docs/PLAYER_UI.md`、`docs/JOURNAL.md`、`docs/DECISION_DIALOG.md` 與 `docs/UX_V2_ACCEPTANCE.md`；不在規格階段改寫它們所描述的現行行為。

完整 Acceptance Criteria、Dependencies、互動流程、測試矩陣與已核准決議見同目錄 `AUTOMATIC-STORY-PROGRESSION.md`。閱讀間隔 2–8 秒、Stage 提示約 2 秒，皆為 UI 常數；只有暫停／恢復及快速顯示，無速度選單。手動暫停透過獨立 UI preference 跨重新整理保存，不改遊戲存檔。

新增驗證：同 seed 手動／自動結果比較、第 N checkpoint 失敗、偏好跨重新整理、舊紀錄 pending 焦點／捲動保護及 StrictMode／重掛載／換頁／舊 timer。實作分為敘事與保存、閱讀保護與偏好、整合驗收三個依序交付的垂直切片。

