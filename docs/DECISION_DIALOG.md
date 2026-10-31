# 重大抉擇與保存恢復（UX v2 T5，Issue #39）

所有公開 pendingEvent 使用唯一原生 `DecisionDialog`，包括讀檔後的必要選擇。
UI 只呈現 Engine 已過濾的選項文字與既有心裡預期，不顯示 resourceDeltas。
主畫面不再放情境正文或內嵌選項；已發生文字仍由同一份倒敘 Journal 顯示。

## Session 契約

`PlayerSnapshot.decision` 是記憶體中的呈現狀態，不寫入 Save v7：

| 狀態 | 呈現與命令 |
| --- | --- |
| ready | 合法選項可選；拒絕命令保留事件、顯示錯誤，可重新選擇 |
| submitting | Session 在 yield 前同步保留 occurrence 並鎖定；所有選項不可操作 |
| unsaved | CHOOSE 已接受，保留事件與本次 Journal 快照，隱藏可重送選項，只能保存重試或閱讀恢復說明 |

key 包含 Session run 世代、Turn ID、event ID 與 nodeIndex。`choose(choiceId, key)`、
`retryDecisionSave(key)` 與 `reloadDecision(key)` 均在 Session 驗證 key；舊回呼不能提交
新事件或離開另一個抉擇。React 重掛載使用同一 Session，不重建命令或再次抽樣。
新 Session 從裝置最後成功保存的 pending checkpoint 建立新的 run 身份，不會推進。

CHOOSE 仍由既有 Engine 驗證；每次只送該命令。接受但保存失敗時，即使引擎的
pendingEvent 已消失，Session decision 仍為 unsaved，不會當成成功關閉 Dialog。
重試呼叫既有 store.save，保存同一 state，不重送 CHOOSE、ADVANCE 或重抽反應。
進入事件的 checkpoint 若尚未保存，也先顯示保存重試，成功後才顯示可選選項。

Quota／拒絕存取提供重試；驗證錯誤與跨分頁衝突提供「返回首頁並重新讀取」，
按鈕前明示本次未保存結果可能失去，採裝置最後成功版本。衝突 token 不會成為
覆蓋較新存檔的授權；不新增強制寫入、降版或清除資料的路徑。

## 可及性與返回

Dialog 使用 showModal、aria-modal、標題／描述／狀態與錯誤播報。背景含頁首、
方向、分頁與紀錄均 inert；焦點先進標題，Tab／Shift+Tab 留在 Dialog。
Escape 與遮罩點擊不關閉，沒有關閉或略過必要選擇的按鈕。

Dialog 是唯一捲動容器，背景文件捲動暫停；長選項換行，短視窗仍可捲到最後選項
與恢復操作。成功保存後直接關閉，焦點定位主紀錄最新一筆，沒有額外閱讀確認。
已排程的舊焦點回呼會檢查當前快照，避免搶走新事件或另一局的焦點。

未保存時註冊 beforeunload 警示，並顯示清楚限制。原生警示是否出現仍由瀏覽器決定；
關閉分頁、重新整理或重新讀取，不保證保留遭拒寫入的記憶體結果。

## 相容性與驗證

Save v7、Journal 快照、Engine、PRNG、日常模板、排程與事件內容都維持 #38 契約。
不新增 #42 內容。既有固定 Seed、機械 trace、Save/Restore、家庭回顧與重玩測試保留。

- 真實 Session/Save：同 tick 重複、拒絕選擇、occurrence／run 失效、pending checkpoint、保存失敗重試、驗證錯誤與衝突。
- React：開啟／不可略過、背景 inert、提交中及失敗後重掛載、錯誤保留、beforeunload 與成功焦點返回。
- Playwright 桌面／手機：原生 Modal、鍵盤限制與返回、遮罩、短視窗大字、雙擊、Quota／SecurityError、跨分頁恢復、完整回顧與舊檔。

螢幕閱讀器實機、實機 Safe Area 與原生 400% 縮放沿用人工驗收；Chromium 模擬不代表完整 WCAG 審核。
