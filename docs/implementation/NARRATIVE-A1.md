# Narrative Quality A1 — #60

基準：main `6ced33a`（PR #59 已合併，CI success；GitHub 無提交的 Review）。
規格：[Issue #60](https://github.com/gitmaruneko/parenthood-simulator/issues/60) 與四份 [審查文件](../reviews/NARRATIVE-TICKETING.md)。僅實作 N01／N08／N13／N14。

## 版本與作者目錄

`narrative-quality-a1-v1` 是獨立內容 release，assemblyVersion=2、Save envelope=8；由 `bindNarrativeRun` 明確選用。正式新家庭仍用 `family-events-08a-v1`。Replay 保留原 binding，未知 release／assembly 拒收且保留 bytes。

舊 legacy 33 節點與 08A-v1 37 節點的 factory／pool／choice 不變。A1 以 12 個新作者節點取代兩鏈的 12 個舊節點，仍共 37 節點；未整修的其他題目與小車內容沿用凍結來源。每次呼叫取得獨立副本；相容測試固定三份完整目錄的 SHA-256。後續票必須使用新 release，不能擴寫這份 v1。

| 舊 Event ID | A1 Event ID | 種類／拓撲 |
| --- | --- | --- |
| night-handoff-choice | nqa1-night-choice | choice → reflection 即時；依選項排下一 Turn |
| night-handoff-reflection | nqa1-night-reflection | routine；兩選項都成立 |
| night-handoff-support | nqa1-night-support | support；玩家確實移動已整理的小籃 |
| night-handoff-strain | nqa1-night-strain | environment；多找一會，不生衝突 |
| night-handoff-reconnect | nqa1-night-reorder | choice；兩分支都接此節點 |
| night-handoff-repair | nqa1-night-close | routine；不計為人際 repair |
| preschool-handoff-choice | nqa1-door-choice | choice → reflection 即時；依選項排下一 Turn |
| preschool-handoff-reflection | nqa1-door-reflection | routine；折角是記憶，不保證畫仍在袋內 |
| preschool-handoff-support | nqa1-door-support | support；玩家留下班級聯絡工具 |
| preschool-handoff-strain | nqa1-door-strain | environment；想起自己的催促，不假設工作 |
| preschool-handoff-reconnect | nqa1-door-repair | choice；玩家補話／畫圖邀請 |
| preschool-handoff-repair | nqa1-door-close | routine；不替孩子承諾理解或原諒 |

| 舊 Choice ID（對照，不遷移） | 新 Event／Choice ID | 固定結果、flag 與排程 |
| --- | --- | --- |
| 根 coordinate／carry／handoff／ask-family | night-choice / nqa1-stock | 挑幾件入籃；nqa1-night-stock → night-support |
| 同上 | night-choice / nqa1-sit | 圍兜留手邊、坐回孩子旁；nqa1-night-sit → night-strain |
| reconnect talk／pause | night-reorder / nqa1-sort | 重排籃內；無人物結果 |
| 同上 | night-reorder / nqa1-move | 不重排、移動位置；無人物結果 |
| 根 coordinate／carry／handoff／ask-family | door-choice / nqa1-ask-child | 移到門邊問孩子；nqa1-door-child → door-support |
| 同上 | door-choice / nqa1-ask-teacher | 等待後提出請求；nqa1-door-teacher → door-strain |
| reconnect talk／pause | door-repair / nqa1-apologize | 說完整道歉；nqa1-door-apologize；repair 嘗試 |
| 同上 | door-repair / nqa1-draw | 畫門口、邀請補充；nqa1-door-draw；repair 嘗試 |

表內新 Event 簡寫均加 `nqa1-`。兩個新根各先清除本題兩個 flags，再設選項 flag；門口後續也清其本題 flags。support／strain eligibility 僅檢查本題新根已完成與對應 flag，不檢查 planningLoad。無成人、資源或 Reaction 門檻。每鏈根＋reflection＋fallback 為 Turn 1 三節點，下一 Turn 分支＋choice＋close 三節點；既有 6 節點邊界可能標為 safelyEnded，所有鏈節點均已完成。

舊 `everyday-responses` 留給未整修內容；A1 夜間不掛 Reaction pool。新版 `nqa1-door-response` 僅在對應 contextTag／action flag／實際可回應角色下抽 child 或 teacher。`nqa1-door-repair-response` 僅 child、專用 contextTag 與後續 action flag；每池有 none。回覆沒有額外後續、資源或關係記憶。根權重仍為 2，門口親子方向 1.25；未改小車 2／1.15 與根互斥。

## 來源、相容與品質

玩家選擇由 choiceHistory／choice Journal 保存；固定動作由選中 choice.storyEntries 產生 narrative 或 repair history；人物實際反應只由 Reaction 與 reactionHistoryIndex 產生。none 不顯示台詞。現有 Journal validator 核對 sourceHistoryId、eventHistoryId、eventId、sequence 與索引，無新增資料結構或 renderer。

A1 移除兩鏈原本的通用資源／planningLoad／傾向獎懲與 conflict／repair memory；夜間工具 support 只源於實際移動物件。門口 repair 僅源於已執行補話，不源於孩子是否願談。A1 Review 使用工具支持與修復嘗試的用語，普通整理不進 repairMomentIds；舊 Review 仍走原分支。

四個代表 choice 的人工讀稿核對：

| 樣本 | 人／地點／困難與兩行動 | 年齡／安全／情緒／事實邊界 | 結果與來源 |
| --- | --- | --- | --- |
| N01 | 半夜房內醒著的孩子、小籃與衣堆；整理幾件／先坐下 | 疲累與反覆翻找並存；無成人交接、無嬰兒對白；保留眼前照看 | 不把少量整理寫成全部完成；雙分支各自 narrative |
| N13 | 天亮房內；改籃內排序／只移位置 | 承接夜間手忙腳亂；普通用品動作不給人際修復 | B 明說保留原放法；無 Reaction 或 repair memory |
| N08 | 壅擠門口、折角的畫、忙碌老師、已說快點；問孩子／問老師 | 催促後還沒聽清楚的困難；不要求趕工作；仍與孩子同行 | 詢問、老師回覆與實際交接分開；none 只留玩家結果 |
| N14 | 家中桌邊；蹲下說明／畫門口邀請 | 具體承認自己的語氣；孩子可補充、拒談或不回應 | repair 是玩家嘗試；不保證理解、安心或原諒 |

無抽象分工替代生活情境、無說教結論；新的場景事實只在當前明示，不補寫上題未知完成。八種完整路徑與所有實際 Reaction 見 [可讀遊玩紀錄](../examples/NARRATIVE-A1-PLAYTHROUGH.md) 及 [完整 JSON](../examples/NARRATIVE-A1-RUNS.json)。

## 驗證與 Preview

- 強制路徑：兩鏈根 2 × 後續 2 × 四家庭 seed × availability 0／1；逐 checkpoint pending、CHOOSE 後、下一 Turn queue、Stage 邊界、重排／Restore 一致。另測無成人／零資源／舊 flags 清理。
- 真實 Session＋拒寫 SaveStorage：四代表事件各選項失敗後只重存已接受 state；不重抽、不重送 CHOOSE。未知 release／assembly、遺失 queue／flags、跨 release 冒用均拒收且不改 bytes。
- 完整局：四 seed × 第一／最後／輪替選項，12 階段、兩跨 Turn 鏈、第 6 階段 support／planning、第 8 階段 repair 與 Replay／Review。
- 48 家庭維度配置 × 四種家庭成員 mask，零資源下每階段至少兩個可行行動。未改的工作／長輩場景仍屬 #62，這裡只驗證可行性，不宣稱全量敘事已整修。
- 舊版：既有 v1–v7 fixtures／golden 原封保留；新增 legacy／08A-v1 四家庭 × 首尾選項的全部 checkpoints＋Review＋Replay 指紋，保護舊文字、選項、queue、PRNG、記憶與舊 repair 分類。
- 自然分布：另跑既有 #42 固定 4096 corpus × 六方向；一般小車 2042/4096、親子方向 1952/4096，均通過原事前容差。詳見 [獨立 A1 報告](../examples/NARRATIVE-A1-DISTRIBUTION.json)，不拿它代表完整 #42 或跨 release 結局相同。
- E2E：桌面／手機八組兩鏈路徑與 Preview 隔離、兩選項、焦點、已保存 Journal、pending／跨 Turn 重開；#52 全套回歸沿原測試執行。

本機 `npm run dev -- --port 5173` 後開啟 `/preview-narrative-a1.html?story=night`、`?story=door` 或 `?story=full`。直接故事入口是強制路徑試玩，不作自然分布證據；三個模式各自 sessionStorage namespace，可用重新試玩連結重抽同一 seed。原正式 localStorage 與新家庭預設不變；Preview 沿原 Session／App，不新增自動節奏或保存控制。

不修改 #61、#62、#42 新候選或 08A 原文；不修改 #52 自動播放、暫停、閱讀焦點、timer 或保存流程。測試結果與雙軸 Review 完成紀錄另列於本票 PR。
