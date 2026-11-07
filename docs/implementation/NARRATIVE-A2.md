# Narrative Quality A2 — #61

基準 main `7fbe9de`，PR #63 已合併。開始前工作目錄乾淨並已 fast-forward main。
範圍僅 [#61](https://github.com/gitmaruneko/parenthood-simulator/issues/61)：N02／N05／N06／N07／N10，每組入口＋固定後續。
規格依 [逐事件改稿](../reviews/NARRATIVE-EVENT-REWRITES.md)、[品質與相容政策 V](../reviews/NARRATIVE-QUALITY-REVIEW.md)、[建票決議](../reviews/NARRATIVE-TICKETING.md)。

## 版本與來源

新增 `narrative-quality-a2-v1`、assemblyVersion=2，沿既有 envelope=8 reader；不改 schema。
`bindNarrativeA2Run` 明確選用；正式入口仍用 `family-events-08a-v1`。A2 由不可變 A1 副本替換十個節點，總目錄仍 37 節點。
`src/content/narrative-a1.ts`、legacy factory、08A、舊 fixtures／golden 均不變。
每個目錄回傳獨立副本；Replay 保留 binding；未知 release／assembly 拒收並保留 bytes。
舊 history／Journal／記憶／Review 不回填、不重分類。移除 A2 掛載的通用成人池會改變 PRNG 消耗，不承諾跨 release 同 seed 同故事。

| 原 Event pair（choice／reflection） | A2 Event pair | 年齡 | 兩個新 Choice ID（亦為本題 action flag） |
| --- | --- | --- | --- |
| meal-preparation-* | nqa2-meal-* | 6 月 | nqa2-simplify／nqa2-finish |
| leaving-playground-* | nqa2-park-* | 21 月 | nqa2-loop／nqa2-home |
| shared-ownership-* | nqa2-supplies-* | 27 月 | nqa2-buy／nqa2-list |
| rainy-pickup-* | nqa2-rain-* | 33 月 | nqa2-wait／nqa2-covered |
| quiet-time-* | nqa2-rest-* | 52 月 | nqa2-read／nqa2-play |

各根先清本題兩旗標，再寫入所選旗標；不改其他題 flags。新版 validator 核對選項旗標與固定後續 queue，不能遺失後續或冒用 A1 binding。
每題兩行動沒有成人／資源門檻，不沿用 coordinate／carry／handoff／ask-family。

## 選擇與後續

| 題目 | A 已執行動作／代價 | B 已執行動作／代價 | 本題後續與事實邊界 |
| --- | --- | --- | --- |
| 餐桌 | 收起備料、清桌，少一道菜且食材待處理 | 做完第二道菜、只挪一位置，晚坐下且器具待收 | 餐後集中器具；只寫玩家晚餐，不替 6 月孩子安排飲食 |
| 公園 | 繞一圈、晚點備餐 | 直接回程、指出停著的紅車 | 返家放袋、備餐；孩子可仍想回公園，不出現路人評論 |
| 用品 | 帶孩子實際補一包、縮短公園時間 | 寫手機待辦、保留原路線，尚未補貨 | 兩路固定留下袋內兩欄清單；kind=support 的工具來源，另有實際分類 planning |
| 雨天 | 合法留在等候區整理雨具，返家尚未開始 | 帶孩子走有遮蔽長路，繞遠 | 之後返家收濕襪；不宣稱等到雨停，不加冒險捷徑 |
| 休息 | 喝水、打開書，桌遊先放旁邊 | 排好桌遊、休息後移 | 晚些收書與盒；同室照看，不保證讀完兩頁、孩子等完或願意只玩一局 |

差異由選中行動的已執行結果與保存旗標成立；公園／休息的旗標也決定哪些實際後續 Reaction 可抽到，反選不能抽到同一分支專屬反應。共同 reflection 只寫兩路都成立的具體落點，不抹去先前代價、不補外在條件。依規格只用十節點，不擴充物品、天氣、承諾或倒數系統。

### pool／效果差異

- 餐桌、用品、雨天不掛 Reaction。各題 actorIds 只有 child-1，無成人回應或詢問即支援。
- `nqa2-park-response`：loop → another-path／look-exit；home → point-car／reach-park；另有 park-none。完整 ID 均加 `nqa2-`。
- `nqa2-rest-response`：read → how-long／other-toy；play → another-game／first-piece；另有 rest-none。完整 ID 均加 `nqa2-`。
- 非 none 均限定本題 contextTag、action flag、可回應 child，沒有超齡台詞；none 不生成可見 Journal 或記憶。
- 新版移除這五題原共用 resourceDeltas、tendencyDeltas、planningLoadDelta、成人記憶與 knowledgeCard 掛載。普通動作不給全題同獎懲。
- N06 list 的已寫待辦是 planning；兩欄分類的 planning 另由 reflection 實際完成才產生。support 是清單工具，不只 support 資源數字，也不暗示家人代買。
- Review 沿 A1 工具支持／修復嘗試摘要；A2 沒有新增人際 repair。第 8 階段修復仍由未改 A1／08A 鏈提供。舊 Review 路由不變。

## 已知敘事缺陷：A1 小籃重複移動

PR #63 的 `nqa1-night-stock` → `nqa1-night-support` 已把小籃移到坐下可拿的位置；隨後 `nqa1-night-reorder` 的 `nqa1-move` 又作同一搬動。兩次動作缺少新的位置前提，屬敘事連續性缺陷。A2 繼承此問題，本票不修夜間鏈。

建議另開修訂票：新增如 `narrative-quality-a1-v2`（或後續整合 release），為夜間鏈配置新 Event／Choice／flag namespace。
保留 support 確實移近的工具來源，把後續第二行動改成不重排且維持現位置、先取一件放手邊；結果寫實際取物，與重新排序有差異。
若要保留再次搬動，必須先建立新位置需求，避免僅換句話重演。重新驗證根 A／B × 後續 A／B 與工具支持來源。
不覆寫 A1／A2 manifest，不映射舊 pending／queue／history；舊存檔與 Replay 繼續走原 release。這是待另票核定的方案，沒有在 #61 實作。

## 試玩與證據

本機 `npm run dev -- --port 5173`，開啟 `/preview-narrative-a2.html`；`?story=meal|supplies|park|rain|rest|full` 可直達五題或完整 12 階段。
各模式與重新試玩 attempt 使用隔離 sessionStorage，重新整理可續玩，不改正式 localStorage。正式 Build 仍只有 index，沒有部署 A2 或切換預設 release。

- [五題各兩路 × 四家庭完整實際 Journal](../examples/NARRATIVE-A2-PLAYTHROUGH.md)
- [Engine／Journal 原始輸出、全部 Reaction／none、12 階段 Review](../examples/NARRATIVE-A2-RUNS.json)
- [#42 固定 corpus 在 A2 的獨立分布報告](../examples/NARRATIVE-A2-DISTRIBUTION.json)

## 驗證範圍

- 四基準家庭 seed 9／1／11／2 × 十行動 × availability 0／1，逐 checkpoint Save／Restore、目錄重排、結果／Journal 一致。
- 48 家庭配置 × 有／無其他成人 × 十行動，在零資源／planningLoad=0／未知親屬下實際執行到後續，清除本題殘留旗標。
- 公園／休息兩路每種限定 Reaction 與 none 實際可達；沒有交叉答覆或 none 記憶。
- 真實 Session 與可拒寫 SaveStorage：十行動失敗後只重存已接受 state，不重抽、不重送 CHOOSE。
- 四家庭 × 首／尾策略，完整十二階段、兩跨 Turn 鏈、Turn≤4／Stage≤6、工具 support／planning、修復機會、Review 與 Replay。
- 舊 legacy／08A／A1 目錄凍結與既有完整 checkpoints／v1–v7 fixtures 全數回歸，不更新 golden。
- 桌面／手機：十行動 Dialog、已保存完整 Journal、重開 pending；五個 Preview 入口隔離與已選結果續玩。#52 自動節奏沿原 E2E 全套回歸。

最終命令結果與獨立 Standards／Spec Review 完成後附於此文件及 PR。
