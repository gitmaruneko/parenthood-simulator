# #55 — 自動敘事整合驗收與 Preview

來源：#52 已核准修正版；本票差異基準：#54 `a149d8c`。#56／#57 保留為 Draft 單票 Review 切片；最終交付為以 main 為基準的完整整合 PR，包含全部三票與更新後瀏覽器驗收。每票獨立 review／驗收，不自行 Merge 或部署正式站。

## Preview

執行 `npm run dev`（PowerShell 可用 npm.cmd），開啟
`http://127.0.0.1:5173/preview-automatic-story.html`。使用固定 seed 9 的既有 v8 bound
內容，經公開 Session 開始家庭，接續自然自動敘事；不改事件候選或結果。
此開發入口不包含於正式 index build，無正式部署。

試玩保存在 sessionStorage 的 `parenthood-simulator.preview-auto.<attempt>.` 專屬空間，
原本 localStorage 家庭存檔不變；同分頁重新整理可繼續，重新體驗產生獨立 attempt。
UI 暫停偏好沿用獨立 key；已暫停時請按恢復。關閉分頁可能失去試玩紀錄。

截圖：[桌面](../examples/AUTOMATIC-STORY-PREVIEW-DESKTOP.png)、[手機](../examples/AUTOMATIC-STORY-PREVIEW-MOBILE.png)。

## 自動驗收

- 四種固定家庭 seed 9／1／11／2，legacy v7 與 bound v8 共八次完整十二階段手動／自動比較，最終保存 bytes 一致；無進度與同 Stage 64 次 watchdog 均有限停止。
- 真實 Session／SaveStorage 測第 1／2 checkpoint 失敗，停止後續命令、重試同一已接受結果；沿用既有 pending、CHOOSE、衝突／驗證失敗恢復回歸。
- StrictMode／重掛載、舊 owner／timer、換頁／讀檔、手動暫停跨重新整理及偏好失敗有 Session／React 回歸。
- 原有精確 checkpoint 瀏覽器案例改用實際暫停／恢復／快速顯示及瀏覽器時鐘；不再按已移除的「繼續生活」。另有自然自動節奏測試，直接檢查 2 秒內不連發、快速顯示不改 state、下個命令只接續一次、待選停住及 hidden 無離線追趕。
- 舊紀錄 pending 入口、焦點／offset、Dialog 中字級變動、獨立 Preview、v7／v8 續玩及四家庭完整回顧／重玩以桌面與手機 Playwright 驗證。
- 完整 npm scripts 的最終結果如下；驗證 source revision 為 `0c6c16d`，後續只補驗收文件／證據。

已完成最終固定來源驗證：`npm.cmd test -- --maxWorkers=2`：28 files／346 tests 通過；
`npm.cmd run typecheck`、`npm.cmd run build` 通過；`npm.cmd run test:e2e -- --workers=2`：
66/66 通過（桌面／手機，4.0 分鐘）。既有 5 秒測試曾在同時執行 build／E2E 的負載下超時；依序重跑完整套件通過，未放寬測試時限。

獨立 Review：Standards 0 項，Spec 0 項。整合測試補正 ReviewScreen 忙碌操作的焦點穩定性，
以及隱藏 Journal 不參與閱讀判斷／不在家庭視圖顯示閱讀提示；新增回歸通過。

GitHub 切片 #56／#57 的 Node 22／24 verify 成功；browser CI 使用更新前的手動按鈕斷言而失敗，故保留 Draft 作差異審閱，不作可單獨合併的交付。完整整合 PR 帶入新版 browser tests，以其最終 CI 為準。

四家庭桌面／手機完整執行資料：[驗收 JSON](../examples/AUTOMATIC-STORY-RUNS.json)。
工作目錄對 main 的 engine／content／domain／persistence diff 為空；所有遊戲核心與存檔契約保持不變。

整合修正：取消 command timer 後不把其剩餘時間誤認為閱讀間隔；手動暫停僅停止後續命令，最新區既有 pending 仍可操作；最後命令 busy／未保存期間不提前顯示回顧。

## 人工驗收清單（2／9 項通過）

2026-11-02：使用者回報第 1、3 項通過；其餘項目待驗收。

- [x] 真實 iOS Safari／Android Chrome：先正常閱讀 5–10 分鐘，確認 2–8 秒節奏可讀、無不合理密集 Dialog。
- [ ] 桌面鍵盤及手機觸控：暫停／恢復／快速顯示可達，無完整速度選單或必要閱讀確認。
- [x] 捲到舊紀錄，等待 pending 提示；確認畫面／焦點不被拉走，從入口選擇後仍回原紀錄。
- [ ] Dialog 開啟中旋轉手機／調整字級，確認原閱讀紀錄位置可恢復，長選項皆可操作。
- [ ] 手動暫停後切頁、重新整理、返回最新仍暫停；按恢復後自然續進。
- [ ] 隱藏分頁數分鐘再返回，確認不追趕背景事件；關閉後重開只續最後成功保存狀態。
- [ ] NVDA／VoiceOver：簡短狀態可讀，焦點限制正確，不反覆朗讀全部 Journal。
- [ ] 系統減少動態效果、200% 文字、320px／短視窗：無不可操作控制或水平溢位。
- [ ] 保存失敗提示／重試與未保存離頁限制可理解；不誤以為已落盤或關閉後可恢復記憶體結果。

自動化的手機專案為 Chromium 模擬 iPhone 13，不代替人工簽核。第 1、3 項依使用者回報標記通過；其餘人工項目尚待驗收，不以測試截圖替代。
