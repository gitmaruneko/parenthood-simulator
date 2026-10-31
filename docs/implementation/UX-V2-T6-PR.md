## Summary

Closes #40。補足 UX v2 四家庭全程與現行存檔版本的整合驗收，保留既有機械 golden，不擴充 #42。

```text
4 固定家庭 × coordinate/carry → Session/Save 全程比對 Engine
4 家庭 × desktop/mobile → 12 階段 → Journal/回顧 → 自選時刻
  → pending/中途重載 → 同 seed 重玩 / 新家庭實際開局
v1–v7 → 舊契約驗證 → 原 bytes 備份 → checkpoint / 回顧恢復
```

正式版本是 **Save envelope v7／GameState v1**；原 #40 只列 v1–v3，已補正規格註記與驗收矩陣。
新增真實歷史 v3／v6 樣本及可重現產生器；v4／v5 沿用凍結樣本。v1／v2 是明確標示的合約衍生案例。

唯一執行程式修正：缺少 replayOrigin 的舊檔原本仍承諾「保留開場處境」，現在於重玩前顯示預設開場降級說明，並以 aria-describedby 關聯按鈕。
沒有更動 Engine、PRNG、Scheduler、正式事件內容或 Save v7 格式。

## Evidence

- **Before:** 四家庭主要在 Engine 層驗證，缺少 UX v2 固定配置的完整瀏覽器證據；缺開場資料的重玩提示仍一律承諾還原。
  **After:** 新增 19 項整合／遷移／提示測試與 10 項瀏覽器案例；舊檔提示回歸先失敗再修正，驗證實際 fallback 開局與舊檔備份。
- `npm.cmd test -- --maxWorkers=2`：22 檔案／**288 項通過**。
- `npm.cmd run typecheck`：通過。
- `npm.cmd run build`：通過。
- `npm.cmd run test:e2e -- --workers=2`：桌面／手機 **52 項通過**。
- 四基準 seed `9 / 1 / 11 / 2` 均完整 12 階段，兩種重玩實際開局；每局 4 筆不同日常、14 次選擇。桌面／手機保存事實逐欄一致，Journal、Dialog 合法選項、十二段時間線、三個自選時刻及分享 allowlist 均核對。
- 既有八條 pre-T3 完整機械 trace 仍一致；固定輸入的資源、PRNG、事件／反應／排程與節點預算未變。未重建 golden。
- v1–v7、pending、中途、自選終局、缺 replayOrigin、損壞／未知版本與舊格式偽裝 daily 均驗證；舊 bytes／人物／history／回顧引用保留，不補造往事或反應。
- [完整驗收與手動清單](../UX_V2_ACCEPTANCE.md)、[八局實際執行資料](../examples/UX-V2-T6-RUNS.json)、[歷史樣本來源與重現](UX-V2-T6-FIXTURES.md)、[桌面回顧](../examples/UX-V2-T6-SINGLE-DESKTOP.png)、[手機回顧](../examples/UX-V2-T6-MULTI-MOBILE.png)。

### Standards

獨立審查 `main@96f83dd...9a11fe9`：0 項發現。測試接縫、獨立基準、歷史樣本來源、清理路徑及最小提示修正符合專案慣例。

### Spec

獨立審查相同範圍：無阻擋發現。四家庭、十二階段、確定性、舊檔、回顧與兩種重玩符合 #40；最終 52 項瀏覽器結果與資料彙整已完成。

驗證期間同時擷取歷史專案曾觸發 Vite 重載，該輪 3 個瀏覽器案例失敗；產生器改用 watcher 忽略快取並分開執行，最終全套通過，沒有放寬斷言或啟用 retries 掩蓋問題。

## Merge Danger

**Door:** two-way

沒有存檔格式變更。唯一執行變更是回顧提示，可回退至相容 v7 bundle。
未合併、未發布正式版，也未執行 #41 的發布／回滾演練。

**Blast Radius:** replay

待人工確認：新版 10–15 分鐘試玩、螢幕閱讀器實機、原生 400% 縮放、手機 Safe Area／橫向；知識卡原有專業／編輯審閱仍待完成。
v1／v2 非當年實機捕捉；如有真實舊檔仍應補試。缺 replayOrigin 的預設開場與遭拒保存後離頁資料可能失去，都是已明示的既有限制。本地結果不等於遠端 CI 或正式站簽核。
