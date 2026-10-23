# 家庭生活方向：實作決議與驗收

2026-10-23，玩家確認首版範圍、兩張 Ticket 與測試邊界。此文件記錄設計提案的實作決議，補充 [設計規格](FAMILY_LIFE_DIRECTION.md) 中原先標示待審查的項目。

## 依賴與範圍

- [Spec #28](https://github.com/gitmaruneko/parenthood-simulator/issues/28)：本功能的補充規格。既有 MVP 的三層生命週期、確定性與保存要求沒有行為衝突；先前「僅文件、不擴充交付」的狀態由本次明確實作授權更新。
- [Ticket #29](https://github.com/gitmaruneko/parenthood-simulator/issues/29)：常駐單選、專用引擎命令、遷移與立即保存；依賴已完成的 #2、#3、#5、#6、#9、#11。
- [Ticket #30](https://github.com/gitmaruneko/parenthood-simulator/issues/30)：一般入口方向權重與確定性回歸；依賴 #29 與已完成的 #10。
- #12 家庭回顧、#13 全體 MVP 驗收仍開啟，但不阻塞本功能；本次不宣稱完整 MVP 已驗收。
- `UI_UX_SPEC` 已含桌面中欄／手機生活故事區常駐單選、全部可選項可見的最新規則。

## 已確認決議

六方向全部開放：彈性安排、工作與經濟、親子陪伴、家庭與關係、照顧者身心、生活探索。新局與缺少方向的舊檔預設彈性安排；不新增解鎖機制、直接資源效果、年度 Calendar、摘要生成或完整命令歷程存檔。

專用命令在生命週期初始化與節點預算檢查前處理，只改目前方向與公開 transition trace。切換不推進、不抽樣、不改待選事件或排程；同項冪等，完成遊戲唯讀。Session 依提交順序串行保存；失敗保留記憶體選擇並阻擋模擬，重試只保存，不重送命令。

外層存檔升為 v3，內層 GameState 維持 v1。v1 裸狀態與 v2 包裝經顯式遷移，原始資料由既有安全遷移流程保留。新格式方向必填且嚴格驗證；未知 ID 不靜默修復。還原沿用目前 RNG，不從 Seed 重建。

一般入口使用原權重乘上明確內容標註，乘數限制 1～1.25，省略為 1。資格、冷卻、節點預算、穩定排序、抽樣次數、固定 follow-up 與人物反應維持既有規則。

## 正式內容限制

現有正式 MVP 每個 AgeStage 僅一個一般入口候選，因此方向權重不會改變目前正式內容的入口分布。首版驗證多候選能力，不擅增事件或將固定 follow-up 改成隨機事件。要在正式故事中觀察分布差異，需後續確認同階段多入口內容擴充。

## 驗證邊界

沿用 Core Event Engine Public Boundary、Content Schema Validation、Save / Restore Boundary；補 Session、UI 與桌面／手機 Playwright。實作前基線：168 個測試與 typecheck 通過。UI 截圖驗證六項可見、單選文字標示與鍵盤焦點，不以自動測試宣稱螢幕閱讀器實機驗收。
