## Summary

開場晚餐與餐廳情境各提供六種假設行動，先顯示四項、其他可展開；保留五題、可跳過與非診斷用途。家庭成員呈現既有角色稱呼、關係、孩子年齡、照顧／工作短摘要，以及有發生時間的人物近況；詳情可展開家庭脈絡與該角色最近三筆關係記憶。

```text
Family Generator / persisted GameState
  → Player Session：關係、當前孩子年齡、人物反應、家庭安排
  → FamilyMembers：桌面與手機共用摘要及詳情
```

不修改核心 Schema、Event Engine、Family Generator 或 EventNode 選項上限。待確認的姓名、成人年齡、職業、特質與正式事件事實契約見 [影響分析](OPENING-FAMILY-IMPACT.md)。

## Evidence

- Before：新增測試確認前兩題只有四個候選、家庭成員缺少關係與年齡，測試失敗。
- After：完整測試 186 項通過；桌面與手機新增 Playwright 案例 2 項通過，包含 320px 詳情展開檢查。執行指令及驗證邊界見影響分析驗證紀錄。
- Typecheck 與正式建置通過；桌面／手機家庭成員及開場展開截圖位於忽略追蹤的 `test-results/`。已對照使用者補上的四張參考圖，沿用自己的家庭手帳風格。
- Standards：無實質問題。Spec：可直接實作範圍符合；待確認契約需求尚未完成。

## Merge Danger

**Door:** two-way

純文案與呈現變更，保留原答案 ID，不改存檔格式。測驗前兩題的候選數量增加，呼叫端不得再假定每題恰四項。

**Blast Radius:** UI

家庭關係映射依目前生成器的三種家庭模型；未來新增角色關係時須同步調整呈現。正式餐廳／物品／已備餐條件未實作，不能以本次介面變更宣稱已支援。
