# UX v2 T4 工作回顧

日期：2026-10-31（Asia/Taipei）。

- Turn 完成有正常、fallback、Turn 上限、階段上限及循環保護等路徑；將提交收斂到 `finishTurn`，在時間線索引與保存 checkpoint 前寫入，並透過 Engine 公開接縫逐條驗證。
- 已發布的 v6 schema 必須保留 choice／result 限制；使用 v7 容納 daily，避免以擴充後的 schema 驗證舊版而接受未曾發布的資料。
- 獨立 Review 重現 daily 與 active Turn 的矛盾存檔，以及既有 CHOOSE→ADVANCE 串接；新增公開 Save/Restore 與 Session 回歸測試先重現失敗，再拒絕矛盾狀態並移除隱式命令。
- 完整 Vitest 與 Playwright 分開執行、限制 worker；本機同時全開會造成既有五秒測試逾時。既有 CI 已含測試、Typecheck、Build 與 E2E，無需增加重複流程。
- Windows PowerShell 向 Python 傳送中文字串需使用 UTF-8 OutputEncoding；原始中文內容以 apply_patch 寫入，避免管線預設編碼破壞文字。
