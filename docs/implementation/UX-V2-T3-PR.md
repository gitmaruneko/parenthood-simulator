# UX v2 T3：可保存、可回顧的選擇與結果（#37）

基準 main：`d20c847267e687bb223ba90b6e23930c84710662`。開工前工作目錄乾淨，
先快轉 main，再建立 `feat/ux-v2-t3-journal`。只實作 #37，#36／PR #44 為已合併前置。

## Summary

玩家確認選擇後，原 history 的同一個轉換保存完整情境、選項原文、已執行結果及
實際反應的 Journal 快照。選項以粗體顯示，其他正文一般字重；最新在上，
來源／排序可驗證。讀檔與回顧使用同一純投影，舊故事不套用新版選項原文。

```text
CHOOSE / executed node
  → original history anchors + journal snapshots
  → trace.afterState → per-checkpoint Save v6
  → shared projection → FamilyLog / Family Review
v1–v5 → strict old contracts → preserve bytes → legacy projection
```

原三欄、手機分頁、內嵌選項與「繼續故事」控制保留。僅移除已確認正文、選擇、
反應與心事摘要的重複播放，Journal 不移到新主畫面，沒有新增日常或 Dialog。

## Evidence

- **Before:** 首個公開引擎邊界案例因沒有 Journal 投影失敗；泛用 planning 結果沒有具體用品或安排，新增斷言先失敗。
  **After:** Journal 在每個原 checkpoint 保存前產生，內容與選項原文快照化；十二個一般入口各有具體情境與兩套結果，條件式交接／詢問使用已確認親屬稱謂。
- 243 項單元測試、Typecheck 與 Build 通過；Windows 沙箱沿用 runner config loader。完整 E2E、兩軸 Review 與遠端 CI／Preview 的最後結果以本票 PR 紀錄為準。
- 八條完整改版前 trace（四 seed × coordinate／carry）機械摘要完全一致，保留原 history IDs／kind、事件／反應、資源、PRNG、記憶、排程與節點數；只排除敘事文字及 Journal 呈現資料。正式包仍是 32 節點＋1 fallback。
- 真實 v5 開場／pending／已選／完成含回顧存檔驗證原 bytes、身份、舊正文及自選 keyMomentIds 保留。v1–v5 舊契約拒絕 Journal 欄位；來源、choice／reaction 索引、角色、空白與序號損壞被安全拒絕。保存失敗重試不重送選擇。
- seed 42 的 handoff 範例實際沒有角色回應；Journal 只有已詢問、已列工作及已發生的天亮片段，不宣稱太太接手，也不把 pending support 當結果。[完整範例](../examples/ISSUE-37-PLAYTHROUGH.md) 包含倒序三筆、穩定 ID 與讀檔前後相同摘要。
- [Journal 契約](../JOURNAL.md) 與[逐項內容稽核](UX-V2-T3-CONTENT.md) 同步記錄本票邊界及舊檔降級。

## Merge Danger

**Door:** one-way

Save v6 不可由 v5 舊 bundle 讀取。升版保留原始 bytes，舊人物／歷史／回顧引用
不補寫；回滾需支援 v6 的修復 bundle 或明確恢復流程，不自動降版或清除存檔。

**Blast Radius:** persistence

影響節點 checkpoint、Journal、存檔、既有玩家 UI 及回顧。事件機械語義不變；
不實作 #38／#39，不自行合併 PR 或部署正式站。實機輔具驗收仍依全局門檻。
