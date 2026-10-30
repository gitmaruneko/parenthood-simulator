# UX v2 T3 工作回顧

開始於 2026-10-30，最終驗證於 2026-10-31（Asia/Taipei）。

- **來源驗證：** 只核對 eventId／Turn／歷史時間先後不足以證明同一 occurrence。獨立 Spec Review 重現 reflection 誤掛 choice，已增加最近前置錨點、可確定的 occurrence 序位與新索引遞增驗證。回歸涵蓋獨立結果錯掛及同 Turn 重複事件互換索引；不新增重複 CI guardrail。
- **機械證據：** 改寫敘事前先擷取真實 v5 存檔及八條完整 trace 摘要。比對只排除文字與新增 Journal，保留每個 checkpoint 的其他狀態及原 history 錨點，避免用改版後資料當舊格式或機械基準。
- **文字一致性：** JSON 物件的欄位順序可因 Zod 解析不同，不能直接用任意物件 JSON 字串當內容不變證明。範例同時使用完整物件 deep equality，以及固定欄位順序的文字／ID 摘要；E2E 另比較逐筆 DOM 正文與原 LocalStorage bytes。
- **測試與工具：** 使用既有 npm scripts；Vitest 的大量 DOM 失敗輸出可改寫 JSON report，再只讀失敗案例摘要。Windows npm.cmd 的含 pipe 篩選字串可能被 cmd 當管線解析，改跑聚焦檔案，避免脆弱 shell quoting。完整單元與 E2E 分開執行以降低資源競爭。
