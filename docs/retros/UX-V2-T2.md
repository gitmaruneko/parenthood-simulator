# UX v2 T2 工作回顧

日期：2026-10-26。

- **內容稽核：** 人物解析新增後，仍須檢查原場景是否提及缺席角色。此次獨立 Spec Review 找出舊長輩場景；已補公開邊界回歸與中性文字。後續角色相關內容應測有／無該角色兩個分支，不以人物卡一致取代場景驗證。
- **存檔與內容：** schema 能驗證儲存內部引用，安裝內容是否認得角色須在續玩檢查確認。此次新增無 replayOrigin、合法語法但未知 actorId 的 Session 回歸，避免只測一般新檔。
- **驗證排程：** 同時執行完整 Vitest 與六個 Playwright workers 造成多個既有案例逾時。最後使用 npm scripts 單 worker 串行驗證，保留原斷言與 timeout；不調高 timeout 掩蓋資源競爭。既有 CI 已跑 test／typecheck／build 和瀏覽器流程，無需新增重複 guardrail。
- **導覽：** `implement` 位於 `skills/engineering/implement/SKILL.md`，不是 `skills/implement/SKILL.md`。先用 `rg --files skills` 定位技能；不擴充每次載入的 AGENTS.md。
- **可重現性：** 機械 golden fixture 必須在修改生成器前擷取。人物命名空間、目錄順序及雜湊演算法另以固定輸出測試凍結，與現有遊戲 PRNG 分離。

2026-10-30 接續驗證：舊格式測試必須使用沒有新版欄位的真實舊契約；直接將目前 GameState 包成舊版本會掩蓋 strict migration 缺口。新增共用 legacy fixture，並驗證三版都拒絕兩處人物欄位。缺少 replayOrigin 的存檔另以已安裝角色目錄驗證人物關係；partner／elder 矛盾皆保留原始資料並進入恢復流程。沿用既有 npm scripts 與 CI，不增加重複驗證工作。
