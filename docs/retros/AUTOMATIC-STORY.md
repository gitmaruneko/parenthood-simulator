# 自動生活敘事工作回顧（#52–#55）

## 保留的做法

- 以真實 Session／SaveStorage 驗證控制器，手動與自動的八條固定家庭 v7／v8 完整流程比對最終 bytes，避免以動畫測試冒充引擎確定性。
- 每票獨立 Standards／Spec Review，分別找到錯誤 Dialog 被隱藏、絕對 scrollY 抵消錨點補償，並以 React／真實瀏覽器回歸修正。
- Preview 使用分頁獨立儲存與公開 Session，不把試玩進度寫進原遊戲存檔。

## 下次流程改善

1. 瀏覽器驗證期間固定 source revision。Vite 的來源重載會重建 Session、使原本精確 checkpoint 測試失效；先完成修正再跑整套，避免邊改邊驗收。
2. 同一 workspace 只跑一個 Playwright 程序。既有設定共用 test-results 與伺服器；並行啟動第二個程序會互刪 trace，第一個結束亦可能關閉第二個沿用的伺服器。需要並行時先建立隔離的 port／outputDir，不能直接重用預設。
3. 精確一步的舊測試改用既有 clock seam，而非靠快速點擊暫停。自動推進後，下一個合法命令可能先於斷言發生，測試時間必須受控。
4. Windows 驗證使用 npm.cmd，並限制大型套件與瀏覽器的同時負載。既有 5 秒完整 Session 測試在多程序 CPU 競爭時曾超時；固定來源、依序測試與 maxWorkers=2 後完整套件通過。

未變更 AGENTS.md、全域測試時限或既有技能；以上是可重用的執行經驗，不增加每次工作的常駐規則。
