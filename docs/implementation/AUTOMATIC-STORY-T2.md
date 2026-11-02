# #54 — 舊紀錄、待選與暫停偏好

基準：#53 `41220e9`，堆疊在 PR #56；不自行 Merge。

手動暫停以 `parenthood-simulator.ui.story-paused` 保存，獨立於遊戲存檔；偏好讀取失敗保守暫停並提示，寫入失敗保留本次設定並提示限制。回最新或切換畫面不解除手動暫停。

閱讀舊紀錄時自動停止後續命令；pending 以固定可見的提示／入口呈現，玩家主動進入才開 Dialog。一般更新保留可見 record／viewport offset；Dialog 關閉時以 preventScroll 恢復可用焦點或原閱讀列。錨點補償同時涵蓋新內容與提示造成的高度變化。

驗收：7 個偏好／閱讀／StrictMode React 與 Session 測試通過，既有 2 個 Decision UI 測試亦通過；TypeScript 通過。桌面與手機 Playwright 共 4 項通過，包含 storage checkpoint 執行中進入舊紀錄、pending 不強開、選後維持 offset／焦點與跨重新整理暫停。截圖與 trace 由 Playwright test-results 產出。

人工實機與螢幕閱讀器驗收尚待 #55 的清單，不宣稱已完成。

## 獨立 Review

Standards：0 硬性違規／0 可維護性問題。Spec：1 個 P2，Dialog 返回保存絕對 scrollY 可能抵消字型／視窗變動後的錨點補償；已改為保存閱讀列與 viewport offset，並加入 Dialog 中改字級的瀏覽器回歸。修正後桌面／手機 4/4 再次通過，typecheck 通過。

截圖：[桌面](../examples/AUTOMATIC-STORY-READING-DESKTOP.png)、[手機](../examples/AUTOMATIC-STORY-READING-MOBILE.png)。
