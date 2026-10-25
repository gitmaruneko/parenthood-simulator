# UX v2 T2：認識同一個家庭（#36）

日期：2026-10-26。Review 基準：使用者確認的 `d5148d3707920bac3f9c142e09b6f12105ad8b8e`。

## Summary

新家庭保存穩定的虛構名字、明確關係與生活習慣，開場、家庭成員、待選事件及回顧使用相同身份。舊家庭以未知人物檔案遷移，保留中性稱呼與歷史文字。只交付 T2；Journal、日常推進、Dialog 與內容擴充仍屬後續 Tickets。

```text
seed + generated family → versioned actorProfiles (no game PRNG draws)
  ├─ shared identity resolver → reveal / members / pending event / review
  └─ replayOrigin snapshot → same-family replay
v1 / v2 / v3 → preserve original bytes → v4 with unknown legacy identities
```

開場移除可見照顧傾向，保留五題、候選展開、跳過及內部向量；孩子顯示階段月齡，成人未知年齡省略。角色不存在時使用已撰寫的中性作息建議，不增加角色或改變事件資格／權重。存檔引用不存在的內容時，續玩前進入恢復流程。

## Evidence

- **Before:** 新增 Session 測試因 reveal 沒有人物資料失敗；Review 回歸分別重現無長輩仍提及長輩、未知角色被列為可續玩、開場缺少孩子月齡。
  **After:** 相同公開邊界與 UI 測試通過，完整 reveal → 遊玩 → 重整 → 回顧 → 重玩保持相同身份。
- `npm.cmd test -- --maxWorkers 1`：14 檔、214 項通過。
- `npm.cmd run typecheck`、`npm.cmd run build` 通過。
- `npm.cmd run test:e2e -- --workers 1`：桌面／手機共 24 項通過，包含完整 12 階段與 reveal → 遊玩 → 重整 → 回顧 → 重玩，以及開場孩子月齡。已檢視家庭成員的桌面／手機截圖。首次重疊執行完整 unit／六 worker 瀏覽器驗證發生資源競爭逾時；最終串行驗證保留原 timeout 與斷言，全數通過。
- 改版前 `d5148d3` 的四組 seed golden fixture 驗證家庭維度、actors 全部機械參數、資源及 rngState 不變；另以完整遊戲確認名字不影響事件順序、反應、效果或 PRNG。
- v1／v2／v3 遷移、原始 bytes 保存、寫入失敗後停止及重試、嚴格版本／角色／關係鏈驗證均有回歸。舊 history 字串不替換；分享文字仍不含人物姓名或習慣。
- 螢幕閱讀器實機、400% 原生縮放與實機 Safe Area 保留全局人工驗收；未執行正式部署。

### Standards

獨立 Standards 最終審查（至 `8b2085c`）：0 項發現。原一項低優先級重複 markup 建議已由共用 `FamilyMemberCard` 解決。

### Spec

獨立 Spec 最終審查（至 `8b2085c`）：0 項未處理發現。原三項發現均已以先失敗、後通過的回歸修正：缺席長輩的中性場景、無 replayOrigin 的未知角色恢復、開場孩子月齡。

## Merge Danger

**Door:** one-way

v4 存檔不能由舊 bundle 讀取。原 bytes 保留，但回滾部署不等於存檔降版；需使用支援 v4 的修復版本或明確恢復流程，不可刪檔回滾。

**Blast Radius:** persistence

人物檔案同時影響開場、事件文字、家庭成員、續玩與重玩；原遊戲機械狀態和 PRNG 不變。此次已在目前分支提交，PR 本文備妥；尚未發布遠端 PR、合併或部署。

Closes #36
