# MVP 事件與知識卡內容包（Issue #10）

`src/content/mvp.ts` 提供 `createMvpContent(actors?)`，每次建立並驗證獨立的
ContentPack。正式開局傳入 `createFamilyRun({ seed }).actors`，保留同一 Seed
產生的參與、可靠度與界線參數；省略參數時使用內容預覽用人物。

```ts
import { createFamilyRun, transitionGame } from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";

const run = createFamilyRun({ seed: 42 });
const content = createMvpContent(run.actors);
const first = transitionGame(run.state, content, { type: "ADVANCE" });
// first.pendingEvent 是等待作答的節點；以 CHOOSE 送出選項後再次 ADVANCE。
```

## 節點清單

本包有 32 個敘事節點及 1 個安全 fallback，共 33 個 EventNode；12 張知識卡。
所有節點都列入 requiredEventIds。下表每個前綴包含 `-choice` 與
`-reflection`，知識卡為 `-card`。第 1、8 階段另有 `-support`、`-strain`、
`-reconnect`、`-repair`。fallback ID 是 `mvp-breathing-space`。

| AgeStage | 月齡 | Event ID 前綴 | 情境 |
| --- | --- | --- | --- |
| age-stage-1 | 2 | night-handoff | 夜間照顧與交接鏈 |
| age-stage-2 | 6 | meal-preparation | 備餐、準備與收尾 |
| age-stage-3 | 10 | backup-contact | 工作變動與不同住備援 |
| age-stage-4 | 15 | grandparent-boundary | 多代／探訪長輩與作息界線 |
| age-stage-5 | 21 | leaving-playground | 公共場所目光與活動轉換 |
| age-stage-6 | 27 | shared-ownership | 雙照顧者、偽單親與完整工作責任 |
| age-stage-7 | 33 | rainy-pickup | 雨天接送與共同照顧協調 |
| age-stage-8 | 39 | preschool-handoff | 入園、工作與修復鏈 |
| age-stage-9 | 45 | school-notice | 通知閱讀、期限與追蹤 |
| age-stage-10 | 52 | quiet-time | 全職照顧／彈性工作與休息 |
| age-stage-11 | 61 | family-ritual | 多代相聚與籌備負擔 |
| age-stage-12 | 71 | school-transition | 下一階段與生活整理 |

情境是虛構敘事，不宣稱發展里程碑、盛行率或家庭優劣。單親可向不同住的支持家人
詢問；雙照顧者、偽單親和多代家庭的實際反應取決於開局人物參數，不由人數推定。
每題有兩個無資源門檻的基本選項；另兩個詢問選項，分別要求家庭中存在
`caregiver-2`、`support-1`。詢問不保證對方當下能接手。

## 事件鏈與終止

兩條鏈各自採用下列形狀，沒有圖循環，所有內容節點預設不重複：

```text
Turn 1: choice → reflection → fallback（結束 Turn，保留下一 Turn 排程）
Turn 2: support 或 strain → reconnect（玩家決策）→ repair
```

`coordinate`、`handoff`、`ask-family` 在下一 Turn 排程 `support`；`carry`
增加較多 planningLoad，排程需 planningLoad ≥ 3 的 `strain`。排程 delayTurns=1、
priority=10。兩個分支都接到修復決策；可現在對話或先休息並留下約定。
修復不是抹除衝突，而是留下重新對話的關係記憶。

每 Turn 最多 4 節點、每 AgeStage 最多 6 節點，沿用引擎原有保護。
鏈的第二 Turn 完成後達階段上限；其他階段通常 choice、reflection、fallback
共 3 節點便結束。呼叫端在 Turn 結束且階段仍 active 時 START_TURN；階段結束後
NEXT_AGE_STAGE，最後收到 GAME_COMPLETED。提前 COMPLETE_AGE_STAGE 會跳過尚未發生的內容。

第 6 階段的 reflection 是無條件可達的支持片段：重複使用用品清單接住記憶工作，
減輕 planningLoad。即使兩條鏈都選擇自行承接，也仍會經歷支持、修復與隱形規劃。
兩個分支的 history、completedEventIds 和 planningLoad 不同，可供後續回顧功能使用。

## 人物與知識卡

`everyday-responses` 反應池有理解、不同期待、孩子回應與無回應，使用獨立的 Seed
反應解析。老師、同事與路人限對應地點；伴侶與長輩沿用家庭成員檢查與可用性。
選項不直接指定社會評價；批評不是固定懲罰，理解也不等於承諾執行。

choice 節點的 knowledgeCardIds 留空；卡片引用放在選項結果與自動節點上。
呈現層應在事件結果後，讓玩家自行展開。卡片不評定單一正解。

12 張卡皆為 `reviewStatus: draft`，摘要顯示「待專業與編輯審閱草稿」，並附
medicalDisclaimer。未宣稱外部來源或已審閱；不提供診斷、醫療或安全操作指引。
日後改為 reviewed 須依既有 Schema 補齊來源機構、標題和 URL，並經內容審閱。

## 驗證證據

- `tests/mvp-content-validation.test.ts`：個別 Event Schema、33 個 required 節點、
  引用、權重、入口可達性、無不受控循環、12 階段與結果卡契約。
- `tests/mvp-content-engine.test.ts`：用同一內容包實際推進整局；四類 Seed 家庭與
  不同決策、每個 Event ID 的實際執行、兩條鏈跨 Turn、完整 trace 重播、人物反應、
  planningLoad、支持／修復、條件式選項與零資源下的 12 階段終止。
- 測試訊息包含 Event ID 或 Seed、AgeStage、選項與驗證階段，便於定位失敗。

本次沿用 issue #10 的兩個 Testing Seam。內容選材與 ID 以本清單為準；
`EVENT_BACKLOG.md` 的 143 筆候選盤點不等於本包的逐筆設計核定，未將相似題材或
未完成的節日系列批次改成 Implemented。本次不新增 UI、回顧生成器或額外時間系統。
