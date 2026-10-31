# T6 歷史存檔來源與重現

2026-11-01。現行正式格式：envelope v7、GameState v1。

| 樣本 | 來源 | 內容 |
| --- | --- | --- |
| `tests/helpers/ux-v2-historical-saves.json` 的 v3 三組 | [5680512](https://github.com/gitmaruneko/parenthood-simulator/commit/5680512)，UX v2 之前的 main | seed 42，pending、第一個 CHOOSE 後的中途 checkpoint、十二階段完成後自選末三個選擇（倒序）。 |
| 同檔 v6 三組 | [9b1a3d2](https://github.com/gitmaruneko/parenthood-simulator/commit/9b1a3d2)，T3 合併後的 main | 同 seed／輸入；保留當時 choice／result Journal，沒有 daily。 |
| v1／v2 | 從上列真實 v3 狀態移除 direction，分別改為未包裝 state／v2 envelope | 明確標示為合約衍生案例，不宣稱是舊實機捕捉。用來檢驗現行 reader 的 v1／v2 分支、未知身份及預設方向。 |
| v4／v5 | 原有 `v4-family-saves.json`／`v5-journal-saves.json` | 沿用先前在相應舊版捕捉的凍結檔，不重生基準。 |
| v7 | 本輪正常遊玩與公開 serializer | 四家庭、兩條路徑的所有 checkpoint，以及自選回顧；與舊資料矩陣分開。 |

六組新歷史樣本由**舊 commit 的 Engine、ContentPack、selectReviewMoments 與 serializer**
實際執行產生，不是將現行 v7 填上 v3／v6 版號。序列為固定公開 nextInput；遇選擇時
coordinate，reconnect 時 pause；完成後選最後三個選擇來源並反轉順序。

重現（需先安裝專案依賴、Git、tar 及 Node）：

```sh
node tests/helpers/capture-ux-v2-historical-saves.mjs
```

產生器使用 `git archive` 擷取限定的 src／package.json／tsconfig，再由目前安裝的
TypeScript 編譯舊程式。暫存置於 Vite 忽略的 `node_modules/.cache/ux-v2-fixtures`，
結束前確認真實目標在指定快取根目錄內，再刪除本次產生的目錄。一般測試**不呼叫**
產生器，避免驗收時重建自己的 expected baseline；建議先產生完畢，再啟動瀏覽器測試。

本輪兩次擷取（初次與重現）bytes 相同，SHA-256：

`1FE06B4043C854B67D3EE6EC78C1EE80C2B4523E48A2A5B6B0374AF1A62B8E9C`

新測試從保存物件 JSON.stringify 得到 raw bytes，再驗證 load 不寫入、migrate 備份同一
raw、history 原樣、人物不重抽、checkpoint 後續一致、review 自選 IDs 不變。缺少
replayOrigin 的案例是明確衍生變體；原始歷史保留，fallback replay 不冒充找回舊答案。

未知版本 8 與受損 v7、將現行 daily 偽裝成 v1–v6，均要求拒絕並保留原 bytes。
既有八條 pre-T3 機械 trace 的 golden 檔完全未修改，與本輪 fixture 產生器無關。
