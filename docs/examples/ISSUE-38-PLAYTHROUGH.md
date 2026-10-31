# Issue #38 實際遊玩範例

2026-10-31（Asia/Taipei），使用正式內容與 Player Session，固定 seed `42`，
跳過開場測驗後開始家庭，第一個內嵌選項選 `coordinate`。
以下由實際編譯後的 Session 與 LocalSaveStore 執行擷取。

## 第一個 Turn：選擇、結果與日常同源

孩子 2 個月，雙照顧者家庭，分工尚待協調。

1. 內嵌選擇：「把今晚需要的事列出來，協調一段可交接的時間」。
2. 選擇後原有自動節點完成，Turn 為 completed，Journal 最新一筆為：
   「你把手指放在孩子的掌心，停了一會兒，再輕輕收回手。」
3. 日常下方仍有已發生的具體結果，例如「天亮後，用品和待辦仍在桌邊。你發現昨晚除了安撫，也花了力氣記住誰何時能接手。」
4. 只有保存的選項原文粗體；日常、情境與結果正常字重。沒有「繼續故事」閱讀確認。

日常來源 ID 為 `age-stage-1-turn-1-completion-daily-v1-infant-hand`，
綁定 `child-1`；該 Turn 的節點數是 3，rngState 為 `1639742264`。
資源為經濟 38、精力 31、支持 50、時間 59、連結 57；這些是原有事件的結果，
日常本身的零效果另由完整 pre-T3 trace 比對與 Engine 測試確認。

桌面主欄與手機生活分頁均直接看見家庭生活紀錄與「繼續生活」。
手機切到紀錄頁時使用同一份 Journal，操作區隱藏；切回與重載不改 LocalStorage bytes。

## 第二個 Turn：每次繼續只送公開命令

1. 按「繼續生活」：只送 `START_TURN`，進入 `age-stage-1-turn-2`，節點數 0；
   資源與 rngState 完全不變，沒有第二筆日常。
2. 再按「繼續生活」：送 `ADVANCE`，停在下一個內嵌選擇；nextInput 為 null。
3. 選第一個可用選項後，原有自動節點使階段安全結束，Turn 節點數 3。
   第二筆日常為「你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。」
4. 第三次繼續將送 `NEXT_AGE_STAGE`，不連發命令越過安全邊界。

第二筆來源為 `age-stage-1-turn-2-completion-daily-v1-infant-voice`。
兩筆不同，重讀、保存重試與恢復不再產生。目錄用盡的 Turn 合法為零筆。

## 自動驗證

- Seed `42`、`3`、`4`、`4294967295` 各走完十二階段，每局 4 筆不重複日常；
  每筆符合階段年齡，actorIds 只包含該家庭孩子，每個 checkpoint 都能精確恢復。
- 正常結束、fallback、Turn 上限、階段上限、循環保護均在完成 checkpoint 留下一筆；
  completedAgeStages 索引包含該來源。已完成舊 Turn 不補造。
- 新增日常不改既有八條機械 trace、關鍵時刻或主題證據；家庭回顧仍有十二階段、
  三個可調整選擇時刻與安全重玩。
- v6 遷移保留原始 bytes，history 原樣不回填；偽裝成 v6 的 daily 資料會被拒絕。

Playwright 截圖：[桌面](ISSUE-38-DESKTOP.png)、[手機](ISSUE-38-MOBILE.png)。
