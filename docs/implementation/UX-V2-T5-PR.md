## Summary

Closes #39。所有必要選擇改用唯一原生 Modal，包含還原的 pending occurrence；移除主畫面內嵌選項。
背景 inert、遮罩及焦點限制生效；Escape／遮罩不能略過。只呈現 Engine 合法選項，不顯示數值增減。

```text
pending occurrence → ready Dialog → CHOOSE（run＋occurrence 鎖）
  拒絕 → 原事件可重選
  接受＋保存成功 → 關閉 → 最新 Journal
  接受＋保存失敗 → 保留結果、隱藏選項
    重試 → store.save（同一 state）→ 最新 Journal
    衝突／不可重試 → 警示後返回首頁／讀取裝置版本
```

Session 以 run 世代＋Turn＋event＋nodeIndex 識別抉擇；選擇、保存重試與恢復均驗證 key。
提交前同步鎖定，重掛載不重送；pendingEvent 消失不代表保存成功。
成功後直接定位最新紀錄，選項原文粗體與倒敘排序保留，沒有閱讀確認。

未保存時顯示離頁限制並註冊 beforeunload；不保證關閉頁面後保留遭拒寫入的記憶體結果。
維持 Save v7、Seed 確定性、Engine、日常、家庭回顧與既有內容，未納入 #42。

## Evidence

- **Before:** 必要選擇在主畫面內嵌；接受後保存失敗時 pending 消失，沒有保留該次抉擇的 Modal 狀態。
  **After:** 真實 Session/Save 與 React 測試先重現缺口，再驗證結果保留、只重試保存、重掛載及成功焦點返回。
- `npm.cmd test -- --maxWorkers=2`：19 個檔案、269 項通過。
- `npm.cmd run typecheck`：通過。
- `npm.cmd run build`：通過（TypeScript＋Vite）。
- `npm.cmd run test:e2e -- --workers=2`：桌面／手機共 42 項通過，含原生 Modal、鍵盤、遮罩、短視窗大字、Quota／SecurityError、跨分頁恢復、舊檔及完整十二階段回顧／重玩。
- 同 tick 重複輸入、提交中與失敗後重掛載、拒絕命令、失效 run／occurrence key、pending checkpoint 失敗與驗證錯誤均有接縫測試。
- 保存恢復精確比對單次 Engine CHOOSE 的完整 state；舊 bytes 不變，重試成功不重抽。既有四組固定 Seed 日常與八條機械 trace 測試保留通過。
- [實際遊玩與失敗恢復範例](../examples/ISSUE-39-PLAYTHROUGH.md)、[桌面](../examples/ISSUE-39-DESKTOP.png)、[手機](../examples/ISSUE-39-MOBILE.png)、[桌面保存失敗](../examples/ISSUE-39-FAILED-DESKTOP.png)、[手機保存失敗](../examples/ISSUE-39-FAILED-MOBILE.png)。

### Standards

獨立審查 `main@5478b4a...feaffab`：0 項發現。Session 擁有抉擇狀態，保存與原生 Modal 邊界一致，測試及文件符合專案慣例。

### Spec

獨立審查相同範圍：0 項發現。確認必要選擇、防重送、保存失敗恢復、焦點與相容性，未擴張事件內容或引擎。

螢幕閱讀器實機、實機 Safe Area 與瀏覽器原生 400% 縮放仍屬人工驗收；Chromium 模擬不宣稱完成完整 WCAG 審核。

## Merge Danger

**Door:** two-way

沒有新增存檔格式或遷移，維持 #38 的 Save v7；可回退到相容 v7 的 #38 bundle。
未部署正式站，未合併本 PR。未保存結果仍受既有 LocalStorage 限制，離頁前明示。

**Blast Radius:** gameplay

影響必要選擇呈現、Session 提交鎖與失敗恢復。原事件效果、PRNG、資源、Journal 快照與回顧規則不變。
