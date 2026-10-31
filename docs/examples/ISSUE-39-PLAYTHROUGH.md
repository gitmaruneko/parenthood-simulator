# Issue #39 遊玩與失敗恢復範例

2026-10-31（Asia/Taipei）。正式內容，固定 seed `42`，Save v7。
Playwright 使用真實 Player Session、Event Engine 與 LocalStorage，桌面／手機各執行。

## 讀檔後的必要選擇

保存初次 ADVANCE 的 pending checkpoint，重新開啟故事：

- 唯一 Dialog 標題為「凌晨的交接」，情境包含孩子（小禾）。
- 選項依 Engine 篩選結果呈現：列清單協調時間、今晚先自己承接、詢問太太能否接手。
- 背景遮罩與 inert 生效，焦點在標題；Shift+Tab 到最後選項，Tab 回第一個。
- Escape、點遮罩及重載都不能略過；未選擇時 LocalStorage bytes 與初始 pending 完全相同。

按 Enter 選「把今晚需要的事列出來，協調一段可交接的時間」後，CHOOSE 與保存成功：

- Dialog 直接關閉，焦點在最新 Journal 結果。
- 選項原文仍粗體，結果正常字重，最新結果在選擇上方。
- 保存狀態精確等於單次 Engine CHOOSE 的結果；未隱式送 ADVANCE。
- 玩家可按「繼續生活」推進，無額外閱讀確認。

截圖：[桌面 Modal](ISSUE-39-DESKTOP.png)、[手機 Modal](ISSUE-39-MOBILE.png)。

## Quota／拒絕寫入

同一 pending checkpoint，在選擇前使 Storage.setItem 拋出 QuotaExceededError 或 SecurityError。
雙擊同一選項後：

1. Dialog 保留，狀態顯示「選擇已保留於本次開啟的故事，尚未保存。」
2. 不再顯示可重送的選項；可讀到當次選擇與「你把待洗的用品、安撫和明早的準備寫成清單……能否交接還要等回覆」的已確認結果。
3. 裝置上仍是原 pending bytes，未被半套結果覆蓋；Escape 仍不能關閉。
4. 恢復寫入權限／容量後按「重試儲存」，Dialog 關閉並定位最新紀錄。
5. 最後保存 state 精確等於單次 coordinate 的結果，只有一個選擇，PRNG 與正常路徑一致；重載沒有再出現舊 Dialog。

截圖：[桌面保存失敗](ISSUE-39-FAILED-DESKTOP.png)、[手機保存失敗](ISSUE-39-FAILED-MOBILE.png)。
Dialog 可捲動至下方保存重試與恢復動作；320px 短視窗及 200% 文字也驗證最後選項可達。

## 跨分頁衝突

另一分頁先保存 carry；目前分頁仍嘗試 coordinate：Dialog 保留 coordinate 記憶體結果，
顯示存檔已變動，沒有強制保存按鈕。閱讀「重新讀取會採裝置最後成功保存的版本」警示後，
選「返回首頁並重新讀取」，再繼續故事；Journal 顯示 carry，另一分頁 bytes 完全不變。

## 重掛載與限制

React 測試另驗證提交中及保存失敗後卸載／重掛載 App：同一 Session 的 occurrence、鎖、
已確認結果與錯誤原因保留，舊 key 的選擇／保存／恢復回呼無效。
尚未保存時 beforeunload 會提出原生警示請求，但是否顯示由瀏覽器決定。
重新整理、離頁或關閉分頁不保證保留被拒寫入的結果；這份範例不宣稱跨關頁備份能力。
