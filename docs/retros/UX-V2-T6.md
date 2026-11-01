# UX v2 T6 工作回顧

2026-11-01（Asia/Taipei）。

- 舊 Ticket 只列 v1–v3，但已發布存檔是 v7。用現行 serializer、各版嚴格讀取分支及歷史程式捕捉建立矩陣，明確區分真實 v3／v6 與衍生 v1／v2，避免把改版後資料換版號冒充歷史。
- 引擎測試已有四家庭，新增的價值是固定 seed 經 Session、每個 checkpoint、實際 Dialog／Journal／回顧與兩種重玩走完整流程；舊八條機械 golden 完全不動，避免自己重建期望值。
- 缺 replayOrigin 的降級原本只有文件說明，畫面仍一律承諾保留開場。以 React 可讀說明及瀏覽器真實舊檔重玩驗證補上最小提示，未修改引擎或保存格式。
- 歷史專案暫存的 tsconfig／package 會干擾 Vite watcher；產生器已改用被忽略的 node_modules 快取並驗證清理路徑，正式 E2E 在擷取完畢後執行。既有 CI 已執行 npm tests／Typecheck／Build／E2E，沒有再增加重複流程。
- Standards／Spec 獨立審查均無發現。人測時間、實機輔具、原生縮放與 Safe Area 繼續列為待驗證，不能用自動化結果或舊 MVP 的 12 分鐘紀錄替代新版簽核。
