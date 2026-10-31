# UX v2 T5 工作回顧

2026-10-31（Asia/Taipei）。

- 必要 Dialog 不能以 pendingEvent 消失當作完成；Session 另外持有提交／未保存狀態，並以 Engine 單次 CHOOSE 的完整 state equality 證明重試不重抽。
- 進入 pending checkpoint 的寫入也可能失敗；新增公開 Session 測試先重現保存重試不可用，再讓同一 occurrence 在選擇前完成 checkpoint 保存。
- App 重掛載時的首頁檢查原先會清掉遊戲中的錯誤，已限制 check 在首頁執行，並以重掛載前後的錯誤比較保護恢復說明。
- jsdom 模擬原生 Dialog 的 open 屬性只能驗證 React 呈現；Modal top layer、inert、鍵盤、遮罩與短視窗透過真實 Chromium 驗證。既有 CI 已執行 npm tests、Typecheck、Build 與 E2E，未新增重複流程。
