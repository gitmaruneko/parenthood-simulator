# #53 — 安全自動敘事與閱讀節奏

基準：main `d328cb4`；來源：#52 已核准修正版。

控制器每 Session 唯一，以公開 advance 接續 nextInput；Journal 分批顯示，閱讀間隔 2–8 秒、Stage 約 2 秒。快速顯示不執行事件、不增加 3 秒等待。busy、保存失敗、Dialog、hidden、卸載與完成皆停止後續命令。Session 僅增加唯讀 run／revision／排隊資訊，引擎、內容與保存格式不變。

本票 seam 驗收：36 個相關測試通過，包含完整 seed 42 手動／自動 v7／v8 位元組一致、第 1／2 checkpoint 保存失敗與同結果重試、單次顯示／暫停及既有抉擇復原 UI。TypeScript 驗證通過。既有 E2E 的手動按鈕流程將於 #55 改為新流程；本票未宣稱舊 E2E 已通過。

後續 #54 交付舊紀錄錨點、延後 pending Dialog 與跨重新整理手動暫停；#55 交付全套 E2E、四種家庭、Preview 與人工清單。

## 獨立 Review

Standards：0 項硬性違規、2 項可維護性建議（以明確 timer purpose 取代 duration 判別；移除未使用 onAdvance prop），均已處理。

Spec：1 項 P2（被拒絕的 CHOOSE 錯誤 Dialog 被控制器隱藏），已將 decision error 納入優先復原並加入 React 回歸。引擎／保存檔案未修改。

完整 npm test：27 files／330 tests 通過；npm run typecheck、npm run build 通過。Review 修正後重跑受影響 Session／UI 測試，結果記錄於 PR。瀏覽器整合驗收由 #55 提供，不宣稱本票已完成後票範圍。
