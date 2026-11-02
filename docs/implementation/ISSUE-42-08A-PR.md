## Summary

新增08A小車故事的完整兩Turn試玩，讓一般敘事結果有自己的Journal正文；原家庭故事仍綁legacy。

```text
既有局 → 凍結v1–v7 reader → legacy內容／v7保存
新局   → 家庭資料組裝＋內容綁定 → preview v8
第8階段 E或08A → 各自固定後續 → 修復機會
第6階段 → 已發生的規劃＋無條件工具支持
```

本PR交付相容基礎與08A，共37節點，不關閉#42。其餘35候選待試玩確認；全量87為基準，支持保證另需3節點的90方案僅作後續配額對照，未批次實作。

試玩：checkout此分支後執行`npm run dev`，開啟`http://127.0.0.1:5173/preview-08a.html`。直接進入故事、可重試不同選項，使用獨立sessionStorage，不動原家庭存檔；此捷徑不包入production build，也不作自然抽選證據。

## Evidence

- **Before:** 原內容沒有08A或一般narrative結果契約；Review發現清除完成ID／queue及未知階段可繞過初版v8驗證，新增拒收測試先失敗。
- **After:** narrative獨立顯示且不灌入planning／support；兩項損壞checkpoint均拒收並保留bytes。每局兩鏈、支持／planning、來源、重排、Replay及checkpoint續玩均有公開邊界驗證。
- `npm test`：25檔323項；typecheck、build通過；桌機／手機e2e：56項全部通過。
- 固定4096語料×6方向：08A一般方向2042／4096，親子方向1952／4096，全部符合事前容差；僅代表第8階段固定家庭的隔離抽選。
- Standards／Spec兩路Review修正後各0 open。範圍、統計、實際Journal、截圖及審查紀錄見[切片文件](https://github.com/gitmaruneko/parenthood-simulator/blob/feat/issue-42-08a-preview/docs/implementation/ISSUE-42-08A-SLICE.md)。

## Merge Danger

**Door:** one-way（新preview存檔）

舊v7 bundle無法讀preview v8；回退UI時須保留相容reader與內容release。舊局仍用凍結legacy路徑，歷史、人物、原始備份及golden不改寫。本PR供試玩，未合併或正式發布。

**Blast Radius:** persistence

涉及新局內容路由、保存／還原、Replay與普通結果；保留原抽選、PRNG、Scheduler及4／6預算。
