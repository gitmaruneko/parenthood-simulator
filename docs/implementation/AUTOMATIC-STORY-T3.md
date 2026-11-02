# #55 — 自動敘事整合驗收與 Preview

來源：#52 已核准修正版；基準：#54 `a149d8c`，PR 依賴 #56 → #57 → 本票。每票獨立 review／驗收，不自行 Merge 或部署正式站。

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
- 完整 npm test／typecheck／build／test:e2e 的最終結果與獨立 Review 於驗證完成後補在本節。

整合修正：取消 command timer 後不把其剩餘時間誤認為閱讀間隔；手動暫停僅停止後續命令，最新區既有 pending 仍可操作；最後命令 busy／未保存期間不提前顯示回顧。

## 人工驗收清單（待人工簽核）

- [ ] 真實 iOS Safari／Android Chrome：先正常閱讀 5–10 分鐘，確認 2–8 秒節奏可讀、無不合理密集 Dialog。
- [ ] 桌面鍵盤及手機觸控：暫停／恢復／快速顯示可達，無完整速度選單或必要閱讀確認。
- [ ] 捲到舊紀錄，等待 pending 提示；確認畫面／焦點不被拉走，從入口選擇後仍回原紀錄。
- [ ] Dialog 開啟中旋轉手機／調整字級，確認原閱讀紀錄位置可恢復，長選項皆可操作。
- [ ] 手動暫停後切頁、重新整理、返回最新仍暫停；按恢復後自然續進。
- [ ] 隱藏分頁數分鐘再返回，確認不追趕背景事件；關閉後重開只續最後成功保存狀態。
- [ ] NVDA／VoiceOver：簡短狀態可讀，焦點限制正確，不反覆朗讀全部 Journal。
- [ ] 系統減少動態效果、200% 文字、320px／短視窗：無不可操作控制或水平溢位。
- [ ] 保存失敗提示／重試與未保存離頁限制可理解；不誤以為已落盤或關閉後可恢復記憶體結果。

自動化的手機專案為 Chromium 模擬 iPhone 13，不代表真實 Safari／觸控／螢幕閱讀器已簽核。上述人工項目未執行，不以測試截圖替代。
