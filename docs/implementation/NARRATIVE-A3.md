# Narrative Quality A3 — #62

基準 main `c9c73a5`（A1 PR #63、A2 PR #64 已合併）。開始前工作目錄乾淨，已同步 main；獨立分支 `feat/narrative-quality-a3`。
規格：[Issue #62](https://github.com/gitmaruneko/parenthood-simulator/issues/62)、[逐事件改稿](../reviews/NARRATIVE-EVENT-REWRITES.md)、[相容政策 V](../reviews/NARRATIVE-QUALITY-REVIEW.md)。

## 不可變版本

新增 `narrative-quality-a3-v1`、assemblyVersion=2，沿用 envelope=8 reader。A3 取 A2 副本替換五組十個舊節點，加入十四個 A3 節點，總作者目錄 44 節點。新增的四節點是兩個中性變體，各為入口＋共同 reflection；各家庭只選一版，requiredEventIds 只列可達集合。每題每局仍是兩節點，Turn≤4／Stage≤6，不以 fallback 代替一般入口。

保留 legacy v1–v7、08A、A1、A2 factory／ID／選項／反應／queue／reader，原 fixtures 和 golden 不更新。Replay 保留原 release；已存 Journal／history／memory／Review 不回填。未知 release、錯誤 flags、遺失後續或另一版 queue 拒收，保留 bytes。正式入口仍為 08A；不改 Event Engine、PRNG、Scheduler、Save Schema 或 #52 自動敘事。

各題的兩條固定結果放在選中 choice.storyEntries（一般 narrative），並不增加節點或關係記憶。reflection 只收起物件，不假設回覆、同意、到場、孩子配合或問題解決。沿用 A2 第 6 階段真實工具 support／planning，以及 A1 第 1／8 階段跨 Turn 鏈與第 8 階段修復機會。

## 作者目錄與資格

下表每個 key 的新 Event ID 都是 `nqa3-{key}-choice` 與 `nqa3-{key}-reflection`；新 Choice ID 亦為本題 action flag，入口先清除兩個舊值，再設本次選值。

| 原母題 | key／階段 | 作者組裝資格 | 兩個 Choice ID | 具體取捨與固定結果 |
| --- | --- | --- | --- | --- |
| N03 backup-contact | work／3（10 月） | dualIncome／flexible／unstable | nqa3-document／nqa3-reschedule | 寫兩點意見、無法即時討論／送出明早時段、尚未改期 |
| N03 中性版 | bag／3（10 月） | singleFullTimeCare | nqa3-pack／nqa3-stay | 補外出袋、延後出門／留家陪孩子、取消散步 |
| N04 grandparent-boundary | message／4（15 月） | persistentActorIds 有 support-1，且 replay actors 有同 ID grandparent | nqa3-decline／nqa3-ask | 回訊維持今天安排／詢問公園活動背景、未答應變更 |
| N04 中性版 | shoes／4（15 月） | 不符合上列實際長輩資格 | nqa3-find／nqa3-toys | 找齊鞋子與用品／排玩具路、取消外出，不保證孩子參與 |
| N09 school-notice | notice／9（45 月） | 全家庭 | nqa3-box／nqa3-materials | 清鞋盒、畫門、雜物待歸位／回覆用班上材料、畫畫，未推定老師已讀 |
| N11 family-ritual | gathering／11（61 月） | 全家庭 | nqa3-menu／nqa3-picnic | 草稿刪菜／草稿提議公園、天氣地點待查；兩路均未寄出 |
| N12 school-transition | map／12（71 月） | 全家庭 | nqa3-walk／nqa3-draw | 陪走安全人行路到入口、不進教室／紙畫轉彎、實際路程未知 |

N03 與 N04 在作者組裝層選版，不新增 Condition 語言、不把家庭作息或入學狀態回填 GameState。N04 只寫手機訊息，適用同住與不同住長輩；未知親屬用「支持家人」，不猜稱謂。N11 沒有具名收件人，不新增親屬或節日。N12 由場景明示新教室與可安全步行入口，不要求孩子讀圖或獨立通學。

四個專用 reaction pool：`nqa3-work-response`（colleague-1）、`nqa3-message-response`（support-1）、`nqa3-notice-response`／`nqa3-map-response`（child-1）。非 none 反應同時要求本題 contextTag、所選 action flag、指定 actorAvailable，並限制 event.actorIds 與 actorRoles。未詢問不抽詢問回覆；同事不保證改期，長輩回覆資訊不等於同意或執行。none 不加台詞或記憶；bag／shoes／gathering 不掛反應池。全部選項都沒有成人幫忙、資源或孩子配合門檻。

本票只維持每階段至少一個一般入口與兩個合法選項。每階段兩個一般候選仍歸 #42；新增四個作者節點未冒稱包含在 #42 原 90 配額，未來整合須重核總目錄。

## 獨立 Preview

執行 `npm run dev -- --port 5173`，開啟 [A3 工作起點](http://127.0.0.1:5173/preview-narrative-a3.html?story=work)。頁面可切換 work／bag／message／shoes／notice／gathering／map 或 full；`seed` 可指定，`attempt` 可另開試玩。

每個故事起點明確組裝相符家庭；message 若原家庭沒有長輩，僅在這個新 Preview 家庭加入支持家人，不修改任何舊存檔。捷徑先用真實 Engine、第一個選項走完前段，保留可完成 Review 的十二階段歷史；頁面說明此前段試走。分頁 sessionStorage 以 release／story／attempt 隔離，可 reload 續玩至 Review。正式 localStorage 完全隔離；入口未列入正式 Build，請使用本機開發網址。本輪不手動部署或切換正式 release。

## 驗證與證據

主要 seam：家庭作者組裝 → 真實 ContentPack → 公開 Engine／Reaction → Journal → Save／Restore → Review／Replay；不 mock 抽選器或重寫 Scheduler。

- 14 行動 × 四基準 seed 9／1／11／2 × availability 0／1，逐 checkpoint 還原、內容重排、pending choice、Journal 來源、4／6 預算。
- 48 三維配置 × 四成人角色 mask：獨立移除伴侶／長輩、availability=0、未知親屬、零資源；每階段一般入口，A3 每個入選版本兩個行動皆實跑。
- 同 seed、同 rngState 只改 workArrangement 或 support-1 membership 的單維正反例，列出候選與 requiredEventIds。
- 所有工作／長輩／孩子限定回覆與 none 均實跑；未詢問、錯場景、缺 actor、非家庭成員、availability=0 負例。
- 每個行動儲存失敗只重存已接受 state；重複 choose／advance 不重抽。
- 完整十二階段、兩條既有鏈、工具支持／planning、Review／Replay 與未知 release bytes 保留。
- 固定 #42 4096 corpus、六個生活方向重新量測 stage 8；事前容差沿原公式，非宣稱完成 #42 全量覆蓋。

實際 Journal：[七版本各兩路與四基準 seed](../examples/NARRATIVE-A3-PLAYTHROUGH.md)；[原始 Engine／Journal／Review 與資格表](../examples/NARRATIVE-A3-RUNS.json)；[固定 corpus 分布](../examples/NARRATIVE-A3-DISTRIBUTION.json)。單題起點為展示該版本會調整工作或角色資格，JSON 逐筆列出實際家庭；完整十二階段另用未調整的四基準家庭。

本機 `npm test -- --maxWorkers=2 --reporter=dot`：35 files／796 tests 全部通過（456.43 秒）；`npm run typecheck`、`npm run build` 通過。[CI 實作版本 4ed7aec](https://github.com/gitmaruneko/parenthood-simulator/actions/runs/42388624689) Node.js 22／24 各 796 tests、Typecheck、Build 全通過；桌面／手機 E2E 156／156 通過，含 A3 新增 42 項與既有 #52、legacy、08A、A1、A2 案例。

實際證據包含 56 條單題 Journal、19 條限定 Reaction／none、8 局完整十二階段 Review、192 組資格／候選表與 2 組同 rngState 單維正反例。N03 單維對照 rngState=2903413571：dualIncome 選 work，singleFullTimeCare 選 bag；N04 同 rngState 僅移除 support-1 membership，由 message 改選 shoes。

七版本桌面／手機畫面已檢視，文字與換行正常，E2E 核對沒有橫向溢出；map 包含真實十二階段 Review timeline。

| 故事 | 桌面 | 手機 |
| --- | --- | --- |
| 工作 | [畫面](../examples/NARRATIVE-A3-work-DESKTOP.png) | [畫面](../examples/NARRATIVE-A3-work-MOBILE.png) |
| 外出袋 | [畫面](../examples/NARRATIVE-A3-bag-DESKTOP.png) | [畫面](../examples/NARRATIVE-A3-bag-MOBILE.png) |
| 作息訊息 | [畫面](../examples/NARRATIVE-A3-message-DESKTOP.png) | [畫面](../examples/NARRATIVE-A3-message-MOBILE.png) |
| 找鞋 | [畫面](../examples/NARRATIVE-A3-shoes-DESKTOP.png) | [畫面](../examples/NARRATIVE-A3-shoes-MOBILE.png) |
| 通知 | [畫面](../examples/NARRATIVE-A3-notice-DESKTOP.png) | [畫面](../examples/NARRATIVE-A3-notice-MOBILE.png) |
| 相聚草稿 | [畫面](../examples/NARRATIVE-A3-gathering-DESKTOP.png) | [畫面](../examples/NARRATIVE-A3-gathering-MOBILE.png) |
| 新教室／Review | [畫面](../examples/NARRATIVE-A3-map-DESKTOP.png) | [畫面](../examples/NARRATIVE-A3-map-MOBILE.png) |

## Standards Review

獨立 reviewer 比較 `git diff origin/main...HEAD`，固定基準 `c9c73a5`、實作 `ffaa353`，檢查 AGENTS、Domain Schema、Event Engine、Persistence、Journal、Actor Profiles、Family Review、Decision Dialog 與 #52 規格。0 項硬違反、0 項需處理 smell。作者組裝、Journal 來源、v8 binding 與隔離 Preview 符合既有規範。

## Spec Review

另一位獨立 reviewer 逐項核對 #62 與相容政策 V，0 項缺陷。資格單版組裝、14 個作者節點、遠端來源限制、共同 reflection、舊版本路由及排除範圍符合要求。驗證描述需區分家庭人物 availability 與瞬時同事；已補 work 專用全 actor unavailable 負例。

複核：0 項未解決缺陷。work／message 的全 actor unavailable、未詢問、錯場景與缺 actor 負例，以及 Preview／map E2E 的完整 Review 歷史均確認符合規格。
