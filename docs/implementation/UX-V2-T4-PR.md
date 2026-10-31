## Summary

Closes #38。家庭生活紀錄成為主畫面唯一已發生敘事流，移除 readThrough 與大型故事區。
選擇只提交 CHOOSE；玩家按「繼續生活」才送公開 nextInput。內嵌選項保留，未加入 #39 Modal。

```text
CHOOSE → 保存當下選擇／效果 → Journal
繼續生活 → 公開 nextInput → Engine
  Turn 首次完成 → 0–1 筆固定模板日常
  → 階段時間線索引 → 保存 checkpoint → 同一份 Journal
```

四個 v1 模板依年齡、既有孩子身份與固定 ID 順序篩選，整局不重複；用盡可為零筆。
不假設伴侶／長輩出席、不消耗 PRNG、資源或 EventNode 預算。
手機生活／紀錄使用同一份 Journal DOM，心事是索引，長歷史沿文件捲動。

新增 daily discriminant 使用 Save v7。v1–v6 先按舊契約驗證、保留原始 bytes，再顯式遷移；
舊已完成 Turn 不補造日常。選擇粗體、具體結果、倒敘與既有回顧維持。

## Evidence

- **Before:** 主畫面顯示「故事正在發展」，必須先按「繼續故事」；選擇後 Session 會隱式送 ADVANCE。沒有 Turn 完成日常。
  **After:** Journal 直接呈現；選擇與繼續各送一個命令。新增日常測試先重現零筆失敗，再驗證首次完成、全完成路徑與去重。
- `npm.cmd test -- --maxWorkers=2`：17 個檔案、262 項通過。
- `npm.cmd run typecheck`：通過。
- `npm.cmd run build`：通過（TypeScript＋Vite）。
- `npm.cmd run test:e2e -- --workers=2`：桌面／手機共 34 項通過，包括十二階段回顧、關鍵時刻編修與安全重玩。
- Seed `42`、`3`、`4`、`4294967295` 各完成十二階段，每局 4 筆不同日常；逐 checkpoint Save/Restore 完全一致。八條既有 pre-T3 機械 trace 維持一致，僅排除新增日常、Journal 及日常索引。
- 驗證正常完成、fallback、Turn／階段預算與循環保護；保存失敗重試、忙碌連點、分頁、重載與舊已完成 Turn 不重複。optional 階段進度重建亦排除 daily 節點計數。
- [實際 seed 42 遊玩範例](../examples/ISSUE-38-PLAYTHROUGH.md)：選 coordinate 後節點數 1、無日常；按繼續後 Turn 完成、節點數 3，出現掌心日常；下一次繼續只 START_TURN，不再產生紀錄。
- [桌面截圖](../examples/ISSUE-38-DESKTOP.png)、[手機截圖](../examples/ISSUE-38-MOBILE.png)：紀錄標題、成員入口與下一步在首屏可找到；選項原文粗體，其餘正常字重。

### Standards

獨立審查最初發現 1 項 P2：daily 可能與目前 active Turn 並存而通過保存驗證。
已新增損壞存檔回歸測試並拒絕矛盾資料；`b0f64f3` 複查通過，無殘留問題。

### Spec

獨立審查最初發現 1 項 P2：既有 CHOOSE→ADVANCE 串接違反 UX v2 §11.6。
已移除隱式命令，Session 保存結果精確等於單次 Engine CHOOSE；`b0f64f3` 複查通過，無殘留問題。

初次全套與瀏覽器同時執行造成資源競爭逾時，分開執行並限制 worker 後完整通過。
實機螢幕閱讀器、Safe Area 與瀏覽器原生 400% 縮放仍沿用既有人工驗收項目；Chromium 模擬不宣稱完成全面 WCAG 審核。

## Merge Danger

**Door:** one-way

Save v7 無法由舊 v6 bundle 開啟；回滾需相容讀取修復，不能清除存檔或偽裝舊版號。
遷移保留原始 bytes、歷史與回顧引用。未部署正式站，未合併本 PR。

**Blast Radius:** gameplay

影響主畫面、Session 命令節奏、Turn 完成紀錄與本機保存格式。原 EventNode 內容、
選擇效果、排程、PRNG 與資源規則不變。後續重大決策 Modal 留給 #39。
