# Event Backlog｜統一事件追蹤總表

Issue #10 的可執行內容包與驗證證據見 [MVP_CONTENT.md](MVP_CONTENT.md)。下列索引保留
候選盤點的狀態與範圍；題材相似不代表該候選的全部設計已實作或核定。

本檔統一追蹤《今天也在養小孩》的 143 筆候選事件：GDD 第 9 章原始題材 100 筆、保留的節日與家庭儀式構想 30 筆，以及本次多代同住／隔代教養新增 13 筆。18 項新情境中有 5 項併作變體，不另計紀錄。管理索引是每筆紀錄的欄位來源；後半部保留節日詳細設計。這些是內容候選，不是 143 個已完成的 EventNode。

## 追蹤規則與來源

- 原始來源：[GDD §8 事件內容架構](GDD.md#8-事件內容架構)、[GDD §9 原始事件題材索引](GDD.md#9-原始事件題材索引100-件候選)。
- 實作邊界：[MVP Spec](specs/PARENTING-SIMULATION-MVP.md#content-and-validation)、[Issue #10：建立 MVP 事件與知識卡內容包](https://github.com/gitmaruneko/parenthood-simulator/issues/10)。已於 2026-10-23 整合時讀取 Issue #10 本文與留言；當時為 open、無留言。Ticket 的 ready-for-agent 是工作項目標籤，不是任一候選事件的 Ready 證據。
- Issue #10 要求至少 30 個完整可執行節點、12 個 AgeStage、多種家庭情境、至少兩條跨 Turn 事件鏈，以及分開通過 Content Validation／Engine Integration Validation。它沒有核定這 143 筆的具體 MVP 名單。
- 所有紀錄暫為 Idea／Unassigned：不因已有敘事細節、進入關聯表或被 Ticket 提及，就推定已設計完成、可實作、已實作或已獲選 MVP。
- 本次只維護本檔，不變更 GDD、Spec、Issues、Event Engine、Schema 或其他程式碼；不新增 Calendar System。原始題名含「家庭行事曆」仍保留，僅作生活情境。
- 管理索引的 Source 保留 GDD 分類、原始編號與章節；節日 Source 連回本檔原有詳細構想。Status、ReleaseScope、依賴與關聯以索引為準，避免詳細敘事被誤當實作驗收證據。

### ID、計數與變體

- Backlog ID：原始 GDD 題材固定使用 bl-gdd-001 至 bl-gdd-100；既有節日沿用 hfr-* ID；本次新增使用 mgl-boundary-01 至 07、igc-routine-01 至 06，避免破壞原有引用。ID 不因分類、狀態或範圍改變而重新編號。
- EventNode ID：是未來 ContentPack 中可驗證、可執行節點的身分，與 Backlog ID 不同。目前 143 筆均未指派 EventNode ID，也沒有已確認的 Backlog → EventNode 對應。將來需附內容檔案／節點 ID 及驗證證據，不能把本表 ID 直接當作已存在的引擎引用。
- 詳細設計保留的「Event ID」舊標籤只表示該節日的 Backlog ID；本文所有 CH-* 與 REL-* 也都是追蹤用代號，不是 EventNode ID。
- 年齡變體目前附在同一候選之下；30 筆節日依列出的 AgeStage 可展開為 72 個版本候選，但總表仍計 30 筆，不能稱為 72 個完成節點。GDD 100 題未指定年齡，AgeStage 留 TBD，不自行補成正式適用階段。
- 本次 var-* 是已合併情境的穩定變體 ID，只有所屬候選的 Backlog ID 計入總數；不指派 EventNode ID。
- 五條 GDD 代表鏈、九條節日系列、三條多代／隔代代表鏈、21 組題材關聯，以及 R1／R2 提案均不是額外事件紀錄，不加入 143 的總數。
- 後續拆成多個 EventNode 時保留母 Backlog ID 與年齡／情境變體對應；反應、環境、支持與修復節點也可能使節點數增加。MVP 的節點總數須另按 Spec／Issue #10 驗證。

### Status 與 ReleaseScope

| Status | 判準 |
| --- | --- |
| Idea | 已記錄題材／敘事草案；仍未經設計完成確認。本表目前全部在此狀態。 |
| Designed | 選擇、人物反應、前後條件、年齡與鏈分支經正式設計審查，留下確認來源。 |
| Ready | 設計已確認；節點拆分、ID 對應、條件、效果、引用、必要來源與驗收方式已具體化，可交付實作。 |
| Implemented | 有內容檔案／EventNode ID 與符合範圍的驗證證據；若列入 Issue #10，須分別記錄內容驗證與引擎整合結果。 |
| Deferred | 正式決定延後，記錄原因與重新評估條件；不是「尚未選進 MVP」的同義詞。 |

| ReleaseScope | 判準 |
| --- | --- |
| MVP | 已有正式確認來源，核定納入 MVP；不能由題材數量或實作 Ticket 標籤推定。 |
| Future | 已確認屬未來擴充；仍不代表設計或實作完成。 |
| Unassigned | 尚未核定範圍，包含未確認的 MVP 候選。本表目前全部在此範圍。 |

Status 與 ReleaseScope 獨立管理；Future Proposal 是「可選機制提案」的標記，不是第六種 Status，也不會把相關事件自動改為 Future 或 Deferred。

### 機制相容性與能力代號

相容性分層記錄，不把「既有契約可描述」誤寫成「目前填入內容即可完整執行」：

| 分類 | 意義與本表記法 |
| --- | --- |
| Content Only | 基本情境可使用既有 EventNode、條件、選項、Reaction／記憶契約描述，不要求新的遊戲系統；以 C0 表示。 |
| Planned Dependency | 要在整局中運作，依賴尚未完成的既定能力；索引逐筆列 P5–P8。這些不是新增機制，也不是此次開發項目。 |
| New Mechanism | 超出既有契約與既定能力的額外功能；放在 Optional New Mechanisms 欄，與基本版依賴分開。R1／R2 均為 Future Proposal，尚未核准。 |

| 能力代號 | Required Existing Capabilities 的意義 | 狀態／依據 |
| --- | --- | --- |
| C0 | EventNode／AgeStage、條件、選項、flags、資源、Reaction pool、排程與記憶的既有資料契約及內容驗證邊界 | [DOMAIN_SCHEMA.md](DOMAIN_SCHEMA.md)、src/domain/schemas.ts；有契約不等於全部執行效果已完成。 |
| P5 | 完整 12 AgeStage／多 Turn 生命週期、可執行選項過濾與節點預算 | [Issue #5](https://github.com/gitmaruneko/parenthood-simulator/issues/5)，本次讀取仍 open；是所有候選整合進整局的共通門檻。 |
| P6 | 即時 follow-up、Scheduler、跨 Turn／AgeStage 鏈、冷卻、取消與終止保護 | [Issue #6](https://github.com/gitmaruneko/parenthood-simulator/issues/6)，本次讀取仍 open；有鏈／後續構想者列入。 |
| P7 | 獨立 Reaction resolver、角色可用性與脈絡、可重現的反應及無反應 | [Issue #7](https://github.com/gitmaruneko/parenthood-simulator/issues/7)，本次讀取仍 open。 |
| P8 | planningLoad 敘事效果、relationshipMemories、支持、委派與修復 | [Issue #8](https://github.com/gitmaruneko/parenthood-simulator/issues/8)，本次讀取仍 open。 |

以上依賴也對照 [EVENT_ENGINE.md 的 extension points](EVENT_ENGINE.md#deliberate-extension-points) 與目前本地引擎；不只依 Issue open 狀態推論實作。原始 GDD 題材未完成設計，其 P6／P7／P8 是按目前題材與鏈對照標記的待確認需求，不代表已設計出這些路徑；P5 則是共同整合門檻。知識卡、健康／安全／醫療來源或草稿標記及其引用仍須遵守 Spec／Issue #10；不是靠本表就通過審查。

### 本次數量與覆蓋率

| 指標 | 數量 |
| --- | --- |
| Backlog 總紀錄 | 143（GDD 100＋節日 30＋本次新增 13） |
| Status | Idea 143；Designed 0；Ready 0；Implemented 0；Deferred 0 |
| ReleaseScope | Unassigned 143；MVP 0；Future 0 |
| 原始 GDD 覆蓋 | 100／100＝100%，原始編號 1–100 各出現於一筆管理紀錄 |
| 節日構想覆蓋 | 30／30＝100%，既有 ID、題名與十項詳細設計保留 |
| 題材／ID 去重 | 管理紀錄 Backlog ID 無重複；相似題材保留並建立關聯，不宣稱題材完全不重疊 |
| 相容性 | 143 筆基本構想可由 C0 描述，143 筆均至少依賴 P5 才能完整整局整合；沒有已核定的必需 New Mechanism |
| 新系列需求覆蓋 | 18／18；新增 13 筆，5 項併作變體，涵蓋 3 筆既有與 1 筆本次新增的候選；共 16 筆候選參與系列 |
| 額外機制 | R1 Future Proposal 涉及 8 筆；R2 Future Proposal 涉及 3 筆，兩組共 11 筆；手足爭執的堂／表親變體不增加新機制需求 |
| EventNode 實作映射 | 已確認 0；待定 143，不能視作 Issue #10 已完成任何節點 |

## 統一管理索引

以下每列是一筆紀錄。Category 保留 GDD §9 的原分類；節日統一屬 Holidays & Family Rituals，子類列於同欄。GDD §8.1 的 15 個長期分類是另一組內容方向，不與這 13 個管理主類別強行一對一對應。

表內 Content Only；Planned Dependency 表示「基本版 Content Only 可描述，但執行仍有既定能力依賴」；Optional New Mechanisms 為 — 只表示目前沒有額外機制提案，不是永久排除未來需求。P7／P8 待確認的項目須到 Designed 審查時再定。

### GDD A｜三餐與食物（12）

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="bl-gdd-001"></a>`bl-gdd-001` | 下班煮飯還是外食 | A. 三餐與食物 | [GDD §9.A 原始 #1](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-A`](#CH-GDD-A) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-002"></a>`bl-gdd-002` | 冰箱有食材卻不想煮 | A. 三餐與食物 | [GDD §9.A 原始 #2](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-003"></a>`bl-gdd-003` | 每週菜單誰想 | A. 三餐與食物 | [GDD §9.A 原始 #3](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-A`](#CH-GDD-A) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-004"></a>`bl-gdd-004` | 孩子拒吃青菜 | A. 三餐與食物 | [GDD §9.A 原始 #4](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-A`](#CH-GDD-A)、[`REL-20`](#REL-20) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-005"></a>`bl-gdd-005` | 家人抱怨菜色 | A. 三餐與食物 | [GDD §9.A 原始 #5](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-006"></a>`bl-gdd-006` | 一人吃飯多種禁忌 | A. 三餐與食物 | [GDD §9.A 原始 #6](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-20`](#REL-20) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-007"></a>`bl-gdd-007` | 備餐時孩子需要陪伴 | A. 三餐與食物 | [GDD §9.A 原始 #7](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-008"></a>`bl-gdd-008` | 週末大量備餐還是休息 | A. 三餐與食物 | [GDD §9.A 原始 #8](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-07`](#REL-07) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-009"></a>`bl-gdd-009` | 外食被長輩評論 | A. 三餐與食物 | [GDD §9.A 原始 #9](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-A`](#CH-GDD-A) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-010"></a>`bl-gdd-010` | 自煮被說沒陪孩子 | A. 三餐與食物 | [GDD §9.A 原始 #10](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-011"></a>`bl-gdd-011` | 奶粉副食品器具清潔 | A. 三餐與食物 | [GDD §9.A 原始 #11](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-012"></a>`bl-gdd-012` | 孩子生日餐點要多精緻 | A. 三餐與食物 | [GDD §9.A 原始 #12](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-01`](#REL-01) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |

### GDD B｜家務與時間（10）

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="bl-gdd-013"></a>`bl-gdd-013` | 睡後洗碗還是睡覺 | B. 家務與時間 | [GDD §9.B 原始 #13](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-A`](#CH-GDD-A)、[`REL-07`](#REL-07) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-014"></a>`bl-gdd-014` | 洗衣服與忘記換季 | B. 家務與時間 | [GDD §9.B 原始 #14](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-13`](#REL-13) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-015"></a>`bl-gdd-015` | 一直收拾卻一直亂 | B. 家務與時間 | [GDD §9.B 原始 #15](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-08`](#REL-08) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-016"></a>`bl-gdd-016` | 家裡亂親友臨時拜訪 | B. 家務與時間 | [GDD §9.B 原始 #16](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-19`](#REL-19) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-017"></a>`bl-gdd-017` | 誰注意到快沒尿布 | B. 家務與時間 | [GDD §9.B 原始 #17](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-03`](#REL-03) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-018"></a>`bl-gdd-018` | 幼兒園隔天要帶用品 | B. 家務與時間 | [GDD §9.B 原始 #18](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-D`](#CH-GDD-D)、[`REL-02`](#REL-02) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-019"></a>`bl-gdd-019` | 誰記得垃圾與回收 | B. 家務與時間 | [GDD §9.B 原始 #19](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-03`](#REL-03) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-020"></a>`bl-gdd-020` | 長輩來幫忙卻增加整理 | B. 家務與時間 | [GDD §9.B 原始 #20](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-08`](#REL-08)、[`REL-19`](#REL-19) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-021"></a>`bl-gdd-021` | 孩子想幫忙反而更慢 | B. 家務與時間 | [GDD §9.B 原始 #21](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-08`](#REL-08) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-022"></a>`bl-gdd-022` | 放假大掃除還是出門 | B. 家務與時間 | [GDD §9.B 原始 #22](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-07`](#REL-07) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |

### GDD C｜行政與規劃（10）

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="bl-gdd-023"></a>`bl-gdd-023` | 疫苗／健檢預約 | C. 行政與規劃 | [GDD §9.C 原始 #23](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-024"></a>`bl-gdd-024` | 幼兒園通知未讀 | C. 行政與規劃 | [GDD §9.C 原始 #24](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-D`](#CH-GDD-D)、[`REL-02`](#REL-02) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-025"></a>`bl-gdd-025` | 誰管理學校群組 | C. 行政與規劃 | [GDD §9.C 原始 #25](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-D`](#CH-GDD-D)、[`REL-02`](#REL-02) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-026"></a>`bl-gdd-026` | 活動報名截止 | C. 行政與規劃 | [GDD §9.C 原始 #26](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-D`](#CH-GDD-D)、[`REL-02`](#REL-02) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-027"></a>`bl-gdd-027` | 衣服鞋子突然變小 | C. 行政與規劃 | [GDD §9.C 原始 #27](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-13`](#REL-13) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-028"></a>`bl-gdd-028` | 托育聯絡人緊急變更 | C. 行政與規劃 | [GDD §9.C 原始 #28](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-15`](#REL-15) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-029"></a>`bl-gdd-029` | 報稅與育兒補助 | C. 行政與規劃 | [GDD §9.C 原始 #29](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-030"></a>`bl-gdd-030` | 醫療文件及健保卡 | C. 行政與規劃 | [GDD §9.C 原始 #30](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-031"></a>`bl-gdd-031` | 親子旅行行李誰打包 | C. 行政與規劃 | [GDD §9.C 原始 #31](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-032"></a>`bl-gdd-032` | 家庭行事曆全靠一人 | C. 行政與規劃 | [GDD §9.C 原始 #32](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-D`](#CH-GDD-D)、[`REL-03`](#REL-03) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |

### GDD D｜職涯與工作（10）

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="bl-gdd-033"></a>`bl-gdd-033` | 孩子發燒誰請假 | D. 職涯與工作 | [GDD §9.D 原始 #33](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-16`](#REL-16) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-034"></a>`bl-gdd-034` | 會議撞到接送 | D. 職涯與工作 | [GDD §9.D 原始 #34](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-15`](#REL-15) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-035"></a>`bl-gdd-035` | 加班與臨時托育 | D. 職涯與工作 | [GDD §9.D 原始 #35](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-16`](#REL-16) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-036"></a>`bl-gdd-036` | 升遷需要出差 | D. 職涯與工作 | [GDD §9.D 原始 #36](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-037"></a>`bl-gdd-037` | 申請育嬰留停 | D. 職涯與工作 | [GDD §9.D 原始 #37](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-038"></a>`bl-gdd-038` | 工作面試被問小孩 | D. 職涯與工作 | [GDD §9.D 原始 #38](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-039"></a>`bl-gdd-039` | 在家工作卻被當作能顧孩子 | D. 職涯與工作 | [GDD §9.D 原始 #39](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-040"></a>`bl-gdd-040` | 接送遲到焦慮 | D. 職涯與工作 | [GDD §9.D 原始 #40](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-15`](#REL-15) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-041"></a>`bl-gdd-041` | 請假次數造成心理壓力 | D. 職涯與工作 | [GDD §9.D 原始 #41](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-16`](#REL-16) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-042"></a>`bl-gdd-042` | 工作成就與照顧時間衝突 | D. 職涯與工作 | [GDD §9.D 原始 #42](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |

### GDD E｜交通與公共場合（15）

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="bl-gdd-043"></a>`bl-gdd-043` | 捷運上孩子大哭 | E. 交通與公共場合 | [GDD §9.E 原始 #43](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-B`](#CH-GDD-B)、[`REL-09`](#REL-09)、[`REL-19`](#REL-19) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-044"></a>`bl-gdd-044` | 嬰兒車擠電梯 | E. 交通與公共場合 | [GDD §9.E 原始 #44](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-045"></a>`bl-gdd-045` | 博愛座與讓座 | E. 交通與公共場合 | [GDD §9.E 原始 #45](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-046"></a>`bl-gdd-046` | 公車上下嬰兒車 | E. 交通與公共場合 | [GDD §9.E 原始 #46](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-047"></a>`bl-gdd-047` | 高鐵座椅被踢 | E. 交通與公共場合 | [GDD §9.E 原始 #47](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-048"></a>`bl-gdd-048` | 長途旅行坐不住 | E. 交通與公共場合 | [GDD §9.E 原始 #48](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-049"></a>`bl-gdd-049` | 車上突然想上廁所 | E. 交通與公共場合 | [GDD §9.E 原始 #49](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-050"></a>`bl-gdd-050` | 轉車時孩子睡著 | E. 交通與公共場合 | [GDD §9.E 原始 #50](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-051"></a>`bl-gdd-051` | 旅途中手機影片被評論 | E. 交通與公共場合 | [GDD §9.E 原始 #51](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-B`](#CH-GDD-B)、[`REL-09`](#REL-09) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-052"></a>`bl-gdd-052` | 陌生人幫忙提推車 | E. 交通與公共場合 | [GDD §9.E 原始 #52](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-B`](#CH-GDD-B) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-053"></a>`bl-gdd-053` | 小孩在車廂一直提問 | E. 交通與公共場合 | [GDD §9.E 原始 #53](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-054"></a>`bl-gdd-054` | 公園孩子吵鬧 | E. 交通與公共場合 | [GDD §9.E 原始 #54](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-055"></a>`bl-gdd-055` | 親子廁所排隊 | E. 交通與公共場合 | [GDD §9.E 原始 #55](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-056"></a>`bl-gdd-056` | 餐廳哭鬧被誤解 | E. 交通與公共場合 | [GDD §9.E 原始 #56](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-C`](#CH-GDD-C)、[`REL-09`](#REL-09) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-057"></a>`bl-gdd-057` | 手機安撫再被批評 | E. 交通與公共場合 | [GDD §9.E 原始 #57](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-C`](#CH-GDD-C)、[`REL-09`](#REL-09)、[`REL-21`](#REL-21) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |

### GDD F｜親友與社會眼光（10）

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="bl-gdd-058"></a>`bl-gdd-058` | 不肯叫長輩 | F. 親友與社會眼光 | [GDD §9.F 原始 #58](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-04`](#REL-04)、[`REL-19`](#REL-19) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-059"></a>`bl-gdd-059` | 長輩偷偷餵糖 | F. 親友與社會眼光 | [GDD §9.F 原始 #59](GDD.md#9-原始事件題材索引100-件候選)；[本次系列變體](#design-mg-bl-gdd-059) | TBD（原題未指定）；AS4、AS8、AS11（本次變體候選） | Idea | Unassigned | [`REL-10`](#REL-10)、[`REL-20`](#REL-20)、[`REL-21`](#REL-21)、[`CH-MG-02`](#CH-MG-02) | C0、P5；P7／P8 待設計確認；P6（鏈候選） | — | Content Only；Planned Dependency |
| <a id="bl-gdd-060"></a>`bl-gdd-060` | 拿別人孩子比較 | F. 親友與社會眼光 | [GDD §9.F 原始 #60](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-05`](#REL-05) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-061"></a>`bl-gdd-061` | 孩子怕生被說沒禮貌 | F. 親友與社會眼光 | [GDD §9.F 原始 #61](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-04`](#REL-04) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-062"></a>`bl-gdd-062` | 媽媽休息被說懶 | F. 親友與社會眼光 | [GDD §9.F 原始 #62](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-063"></a>`bl-gdd-063` | 爸爸帶小孩被過度稱讚 | F. 親友與社會眼光 | [GDD §9.F 原始 #63](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-064"></a>`bl-gdd-064` | 是否需要親子才藝班 | F. 親友與社會眼光 | [GDD §9.F 原始 #64](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-065"></a>`bl-gdd-065` | 孩子穿著被評論 | F. 親友與社會眼光 | [GDD §9.F 原始 #65](GDD.md#9-原始事件題材索引100-件候選)；[本次系列變體](#design-mg-bl-gdd-065) | TBD（原題未指定）；AS4、AS8、AS11（本次變體候選） | Idea | Unassigned | [`REL-13`](#REL-13)、[`REL-19`](#REL-19)、[`CH-MG-01`](#CH-MG-01) | C0、P5；P7／P8 待設計確認；P6（鏈候選） | — | Content Only；Planned Dependency |
| <a id="bl-gdd-066"></a>`bl-gdd-066` | 外出哭鬧被要求安靜 | F. 親友與社會眼光 | [GDD §9.F 原始 #66](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-C`](#CH-GDD-C)、[`REL-09`](#REL-09) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-067"></a>`bl-gdd-067` | 全職照顧被否定工作價值 | F. 親友與社會眼光 | [GDD §9.F 原始 #67](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |

### GDD G｜伴侶關係與分工（10）

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="bl-gdd-068"></a>`bl-gdd-068` | 伴侶說「你講我就做」 | G. 伴侶關係與分工 | [GDD §9.G 原始 #68](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-D`](#CH-GDD-D)、[`REL-06`](#REL-06)、[`REL-19`](#REL-19)、[`REL-21`](#REL-21) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-069"></a>`bl-gdd-069` | 誰負責晚上哄睡 | G. 伴侶關係與分工 | [GDD §9.G 原始 #69](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-14`](#REL-14) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-070"></a>`bl-gdd-070` | 誰記得孩子尺寸 | G. 伴侶關係與分工 | [GDD §9.G 原始 #70](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-03`](#REL-03)、[`REL-13`](#REL-13) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-071"></a>`bl-gdd-071` | 家務做法不同而爭執 | G. 伴侶關係與分工 | [GDD §9.G 原始 #71](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-072"></a>`bl-gdd-072` | 兩人都累卻需要溝通 | G. 伴侶關係與分工 | [GDD §9.G 原始 #72](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-E`](#CH-GDD-E)、[`REL-12`](#REL-12)、[`REL-19`](#REL-19) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-073"></a>`bl-gdd-073` | 伴侶主動完整接手備餐 | G. 伴侶關係與分工 | [GDD §9.G 原始 #73](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-A`](#CH-GDD-A)、[`REL-06`](#REL-06) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-074"></a>`bl-gdd-074` | 周末誰能休息 | G. 伴侶關係與分工 | [GDD §9.G 原始 #74](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-E`](#CH-GDD-E)、[`REL-07`](#REL-07) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-075"></a>`bl-gdd-075` | 孩子偏好某位照顧者 | G. 伴侶關係與分工 | [GDD §9.G 原始 #75](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-19`](#REL-19) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-076"></a>`bl-gdd-076` | 教養界線意見不同 | G. 伴侶關係與分工 | [GDD §9.G 原始 #76](GDD.md#9-原始事件題材索引100-件候選)；[本次系列變體](#design-mg-bl-gdd-076) | TBD（原題未指定）；AS4、AS8、AS11（本次變體候選） | Idea | Unassigned | [`REL-10`](#REL-10)、[`REL-19`](#REL-19)、[`REL-20`](#REL-20)、[`REL-21`](#REL-21)、[`CH-MG-01`](#CH-MG-01)、[`CH-MG-02`](#CH-MG-02)、[`CH-MG-03`](#CH-MG-03) | C0、P5；P7／P8 待設計確認；P6（鏈候選） | — | Content Only；Planned Dependency |
| <a id="bl-gdd-077"></a>`bl-gdd-077` | 夫妻難得約會被取消 | G. 伴侶關係與分工 | [GDD §9.G 原始 #77](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |

### GDD H｜父母內在與身心（10）

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="bl-gdd-078"></a>`bl-gdd-078` | 想一個人出門卻有罪惡感 | H. 父母內在與身心 | [GDD §9.H 原始 #78](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-E`](#CH-GDD-E)、[`REL-07`](#REL-07) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-079"></a>`bl-gdd-079` | 夜裡覺得自己做不好 | H. 父母內在與身心 | [GDD §9.H 原始 #79](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-E`](#CH-GDD-E)、[`REL-12`](#REL-12)、[`REL-14`](#REL-14) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-080"></a>`bl-gdd-080` | 情緒失控後道歉 | H. 父母內在與身心 | [GDD §9.H 原始 #80](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-C`](#CH-GDD-C)、[`CH-GDD-E`](#CH-GDD-E)、[`REL-12`](#REL-12) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-081"></a>`bl-gdd-081` | 忘記自己的生日安排 | H. 父母內在與身心 | [GDD §9.H 原始 #81](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-03`](#REL-03) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-082"></a>`bl-gdd-082` | 社群看到別人理想家庭 | H. 父母內在與身心 | [GDD §9.H 原始 #82](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-05`](#REL-05) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-083"></a>`bl-gdd-083` | 想繼續學習或運動 | H. 父母內在與身心 | [GDD §9.H 原始 #83](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-084"></a>`bl-gdd-084` | 身體不舒服卻繼續顧小孩 | H. 父母內在與身心 | [GDD §9.H 原始 #84](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-14`](#REL-14) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-085"></a>`bl-gdd-085` | 沒有自己的安靜時間 | H. 父母內在與身心 | [GDD §9.H 原始 #85](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-E`](#CH-GDD-E)、[`REL-07`](#REL-07) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-086"></a>`bl-gdd-086` | 育兒成就感與失落同時出現 | H. 父母內在與身心 | [GDD §9.H 原始 #86](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-11`](#REL-11) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-087"></a>`bl-gdd-087` | 想求助卻怕被評論 | H. 父母內在與身心 | [GDD §9.H 原始 #87](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-E`](#CH-GDD-E)、[`REL-12`](#REL-12)、[`REL-16`](#REL-16)、[`REL-19`](#REL-19) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |

### GDD I｜孩子發展與照顧（8）

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="bl-gdd-088"></a>`bl-gdd-088` | 夜醒安撫 | I. 孩子發展與照顧 | [GDD §9.I 原始 #88](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-E`](#CH-GDD-E)、[`REL-14`](#REL-14)、[`REL-19`](#REL-19) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-089"></a>`bl-gdd-089` | 分離焦慮 | I. 孩子發展與照顧 | [GDD §9.I 原始 #89](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-15`](#REL-15) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-090"></a>`bl-gdd-090` | 戒尿布進度 | I. 孩子發展與照顧 | [GDD §9.I 原始 #90](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-091"></a>`bl-gdd-091` | 不肯收玩具 | I. 孩子發展與照顧 | [GDD §9.I 原始 #91](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-08`](#REL-08) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-092"></a>`bl-gdd-092` | 同儕搶玩具 | I. 孩子發展與照顧 | [GDD §9.I 原始 #92](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-093"></a>`bl-gdd-093` | 幼兒園適應 | I. 孩子發展與照顧 | [GDD §9.I 原始 #93](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-15`](#REL-15) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-094"></a>`bl-gdd-094` | 孩子說謊 | I. 孩子發展與照顧 | [GDD §9.I 原始 #94](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | —（尚無指定關聯） | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-095"></a>`bl-gdd-095` | 手足爭執 | I. 孩子發展與照顧 | [GDD §9.I 原始 #95](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [手足／堂表親情境變體](#multi-child-question) | C0、P5；P7／P8 待設計確認；親友孩子可用臨時事件角色描述 | — | Content Only；Planned Dependency |

### GDD J｜支持與修復（5）

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="bl-gdd-096"></a>`bl-gdd-096` | 陌生人理解孩子哭聲 | J. 支持與修復 | [GDD §9.J 原始 #96](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-B`](#CH-GDD-B)、[`CH-GDD-C`](#CH-GDD-C)、[`REL-09`](#REL-09) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-097"></a>`bl-gdd-097` | 同事主動代班 | J. 支持與修復 | [GDD §9.J 原始 #97](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-16`](#REL-16) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-098"></a>`bl-gdd-098` | 長輩願意尊重照顧方式 | J. 支持與修復 | [GDD §9.J 原始 #98](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-10`](#REL-10)、[`REL-19`](#REL-19)、[`REL-20`](#REL-20)、[`REL-21`](#REL-21)、[`CH-MG-01`](#CH-MG-01)、[`CH-MG-02`](#CH-MG-02)、[`CH-MG-03`](#CH-MG-03) | C0、P5；P7／P8 待設計確認；P6（鏈候選） | — | Content Only；Planned Dependency |
| <a id="bl-gdd-099"></a>`bl-gdd-099` | 伴侶主動完整承擔一週餐食 | J. 支持與修復 | [GDD §9.J 原始 #99](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`CH-GDD-A`](#CH-GDD-A)、[`REL-06`](#REL-06) | C0、P5；P6（鏈候選）；P7／P8 待設計確認 | — | Content Only；Planned Dependency |
| <a id="bl-gdd-100"></a>`bl-gdd-100` | 孩子一句話讓大人感到被理解 | J. 支持與修復 | [GDD §9.J 原始 #100](GDD.md#9-原始事件題材索引100-件候選) | TBD（原題未指定） | Idea | Unassigned | [`REL-11`](#REL-11) | C0、P5；P7／P8 待設計確認 | — | Content Only；Planned Dependency |

### Holidays & Family Rituals（30）

年齡為原構想的候選版本，並未正式核定；詳細情境、選擇、反應、獨白與記憶均在下方原有設計。

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="hfr-halloween-01"></a>`hfr-halloween-01` | 裝扮通知單是誰記得的（節日前） | Holidays & Family Rituals／萬聖節 | [本檔既有節日構想 `hfr-halloween-01`](#design-hfr-halloween-01) | AS6、AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-01`](#CH-HFR-01)、[`REL-02`](#REL-02)、[`REL-06`](#REL-06) | C0、P5、P6、P7、P8 | [R1：Future Proposal](#r1-proposal) | Content Only；Planned Dependency |
| <a id="hfr-halloween-02"></a>`hfr-halloween-02` | 走到門口又退回來（節日當天） | Holidays & Family Rituals／萬聖節 | [本檔既有節日構想 `hfr-halloween-02`](#design-hfr-halloween-02) | AS6、AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-01`](#CH-HFR-01)、[`REL-09`](#REL-09) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-halloween-03"></a>`hfr-halloween-03` | 留下的不是那套衣服（節日後續） | Holidays & Family Rituals／萬聖節 | [本檔既有節日構想 `hfr-halloween-03`](#design-hfr-halloween-03) | AS6、AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-01`](#CH-HFR-01)、[`REL-08`](#REL-08)、[`REL-18`](#REL-18) | C0、P5、P6、P7、P8 | [R2：Future Proposal](#r2-proposal) | Content Only；Planned Dependency |
| <a id="hfr-christmas-01"></a>`hfr-christmas-01` | 一歲需要禮物嗎（節日前） | Holidays & Family Rituals／聖誕節 | [本檔既有節日構想 `hfr-christmas-01`](#design-hfr-christmas-01) | AS4（變體候選） | Idea | Unassigned | [`CH-HFR-02`](#CH-HFR-02) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-christmas-02"></a>`hfr-christmas-02` | 紙袋比禮物好玩（當天至節後） | Holidays & Family Rituals／聖誕節 | [本檔既有節日構想 `hfr-christmas-02`](#design-hfr-christmas-02) | AS4（變體候選） | Idea | Unassigned | [`CH-HFR-02`](#CH-HFR-02)、[`REL-08`](#REL-08)、[`REL-11`](#REL-11) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-christmas-03"></a>`hfr-christmas-03` | 三歲開始等聖誕老人（節日當天） | Holidays & Family Rituals／聖誕節 | [本檔既有節日構想 `hfr-christmas-03`](#design-hfr-christmas-03) | AS8（變體候選） | Idea | Unassigned | [`CH-HFR-02`](#CH-HFR-02) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-christmas-04"></a>`hfr-christmas-04` | 五歲問為什麼同學收到比較多（當天至節後） | Holidays & Family Rituals／聖誕節 | [本檔既有節日構想 `hfr-christmas-04`](#design-hfr-christmas-04) | AS11（變體候選） | Idea | Unassigned | [`CH-HFR-02`](#CH-HFR-02)、[`REL-05`](#REL-05)、[`REL-12`](#REL-12) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-christmas-05"></a>`hfr-christmas-05` | 六歲想替家人準備一份（節日前） | Holidays & Family Rituals／聖誕節 | [本檔既有節日構想 `hfr-christmas-05`](#design-hfr-christmas-05) | AS12（變體候選） | Idea | Unassigned | [`CH-HFR-02`](#CH-HFR-02)、[`REL-06`](#REL-06) | C0、P5、P6、P7、P8 | [R1：Future Proposal](#r1-proposal) | Content Only；Planned Dependency |
| <a id="hfr-christmas-06"></a>`hfr-christmas-06` | 送出的東西歪歪的（當天至節後） | Holidays & Family Rituals／聖誕節 | [本檔既有節日構想 `hfr-christmas-06`](#design-hfr-christmas-06) | AS12（變體候選） | Idea | Unassigned | [`CH-HFR-02`](#CH-HFR-02)、[`REL-08`](#REL-08)、[`REL-11`](#REL-11)、[`REL-18`](#REL-18) | C0、P5、P6、P7、P8 | [R2：Future Proposal](#r2-proposal) | Content Only；Planned Dependency |
| <a id="hfr-lunar-new-year-01"></a>`hfr-lunar-new-year-01` | 誰去問今年怎麼團圓（節日前） | Holidays & Family Rituals／農曆春節 | [本檔既有節日構想 `hfr-lunar-new-year-01`](#design-hfr-lunar-new-year-01) | AS4、AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-03`](#CH-HFR-03)、[`REL-03`](#REL-03)、[`REL-06`](#REL-06) | C0、P5、P6、P7、P8 | [R1：Future Proposal](#r1-proposal) | Content Only；Planned Dependency |
| <a id="hfr-lunar-new-year-02"></a>`hfr-lunar-new-year-02` | 拜年一定要照那個方式嗎（節日當天） | Holidays & Family Rituals／農曆春節 | [本檔既有節日構想 `hfr-lunar-new-year-02`](#design-hfr-lunar-new-year-02) | AS4、AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-03`](#CH-HFR-03)、[`REL-04`](#REL-04)、[`REL-10`](#REL-10) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-lunar-new-year-03"></a>`hfr-lunar-new-year-03` | 年過完，誰還在收尾（節日後續） | Holidays & Family Rituals／農曆春節 | [本檔既有節日構想 `hfr-lunar-new-year-03`](#design-hfr-lunar-new-year-03) | AS4、AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-03`](#CH-HFR-03)、[`REL-08`](#REL-08)、[`REL-10`](#REL-10) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-childrens-day-01"></a>`hfr-childrens-day-01` | 孩子的節日，誰的行程（節日前） | Holidays & Family Rituals／兒童節 | [本檔既有節日構想 `hfr-childrens-day-01`](#design-hfr-childrens-day-01) | AS6、AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-04`](#CH-HFR-04)、[`REL-07`](#REL-07) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-childrens-day-02"></a>`hfr-childrens-day-02` | 排了很久，他只想玩旁邊的水溝蓋（節日當天） | Holidays & Family Rituals／兒童節 | [本檔既有節日構想 `hfr-childrens-day-02`](#design-hfr-childrens-day-02) | AS6、AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-04`](#CH-HFR-04)、[`REL-07`](#REL-07)、[`REL-11`](#REL-11) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-childrens-day-03"></a>`hfr-childrens-day-03` | 他畫的那一天和你記得的不一樣（節日後續） | Holidays & Family Rituals／兒童節 | [本檔既有節日構想 `hfr-childrens-day-03`](#design-hfr-childrens-day-03) | AS6、AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-04`](#CH-HFR-04)、[`REL-11`](#REL-11)、[`REL-18`](#REL-18) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-mothers-day-01"></a>`hfr-mothers-day-01` | 卡片上的稱呼可以改嗎（節日前） | Holidays & Family Rituals／母親節 | [本檔既有節日構想 `hfr-mothers-day-01`](#design-hfr-mothers-day-01) | AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-05`](#CH-HFR-05)、[`REL-17`](#REL-17) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-mothers-day-02"></a>`hfr-mothers-day-02` | 被感謝的人還在端菜（節日當天） | Holidays & Family Rituals／母親節 | [本檔既有節日構想 `hfr-mothers-day-02`](#design-hfr-mothers-day-02) | AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-05`](#CH-HFR-05)、[`REL-07`](#REL-07)、[`REL-17`](#REL-17) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-mothers-day-03"></a>`hfr-mothers-day-03` | 節日過了，休息還算數嗎（節日後續） | Holidays & Family Rituals／母親節 | [本檔既有節日構想 `hfr-mothers-day-03`](#design-hfr-mothers-day-03) | AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-05`](#CH-HFR-05)、[`REL-06`](#REL-06)、[`REL-07`](#REL-07)、[`REL-12`](#REL-12)、[`REL-17`](#REL-17) | C0、P5、P6、P7、P8 | [R1：Future Proposal](#r1-proposal) | Content Only；Planned Dependency |
| <a id="hfr-fathers-day-01"></a>`hfr-fathers-day-01` | 誰記得替誰準備驚喜（節日前） | Holidays & Family Rituals／父親節 | [本檔既有節日構想 `hfr-fathers-day-01`](#design-hfr-fathers-day-01) | AS8、AS12（變體候選） | Idea | Unassigned | [`CH-HFR-06`](#CH-HFR-06)、[`REL-06`](#REL-06)、[`REL-17`](#REL-17) | C0、P5、P6、P7、P8 | [R1：Future Proposal](#r1-proposal) | Content Only；Planned Dependency |
| <a id="hfr-fathers-day-02"></a>`hfr-fathers-day-02` | 今天想一起做平常那件事（節日當天） | Holidays & Family Rituals／父親節 | [本檔既有節日構想 `hfr-fathers-day-02`](#design-hfr-fathers-day-02) | AS8、AS12（變體候選） | Idea | Unassigned | [`CH-HFR-06`](#CH-HFR-06)、[`REL-11`](#REL-11)、[`REL-17`](#REL-17) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-fathers-day-03"></a>`hfr-fathers-day-03` | 卡片背面的日常（節日後續） | Holidays & Family Rituals／父親節 | [本檔既有節日構想 `hfr-fathers-day-03`](#design-hfr-fathers-day-03) | AS8、AS12（變體候選） | Idea | Unassigned | [`CH-HFR-06`](#CH-HFR-06)、[`REL-11`](#REL-11)、[`REL-12`](#REL-12)、[`REL-17`](#REL-17) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-dragon-boat-01"></a>`hfr-dragon-boat-01` | 粽子不一定要自己包（節日前） | Holidays & Family Rituals／端午節 | [本檔既有節日構想 `hfr-dragon-boat-01`](#design-hfr-dragon-boat-01) | AS5、AS9、AS12（變體候選） | Idea | Unassigned | [`CH-HFR-07`](#CH-HFR-07)、[`REL-06`](#REL-06)、[`REL-10`](#REL-10) | C0、P5、P6、P7、P8 | [R1：Future Proposal](#r1-proposal) | Content Only；Planned Dependency |
| <a id="hfr-dragon-boat-02"></a>`hfr-dragon-boat-02` | 孩子只想問那艘船（節日當天） | Holidays & Family Rituals／端午節 | [本檔既有節日構想 `hfr-dragon-boat-02`](#design-hfr-dragon-boat-02) | AS5、AS9、AS12（變體候選） | Idea | Unassigned | [`CH-HFR-07`](#CH-HFR-07)、[`REL-10`](#REL-10) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-dragon-boat-03"></a>`hfr-dragon-boat-03` | 留下香包，還是留下那句話（節日後續） | Holidays & Family Rituals／端午節 | [本檔既有節日構想 `hfr-dragon-boat-03`](#design-hfr-dragon-boat-03) | AS5、AS9、AS12（變體候選） | Idea | Unassigned | [`CH-HFR-07`](#CH-HFR-07)、[`REL-08`](#REL-08)、[`REL-10`](#REL-10) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-mid-autumn-01"></a>`hfr-mid-autumn-01` | 團圓可以不用湊成一桌（節日前） | Holidays & Family Rituals／中秋節 | [本檔既有節日構想 `hfr-mid-autumn-01`](#design-hfr-mid-autumn-01) | AS3、AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-08`](#CH-HFR-08)、[`REL-03`](#REL-03)、[`REL-06`](#REL-06)、[`REL-10`](#REL-10) | C0、P5、P6、P7、P8 | [R1：Future Proposal](#r1-proposal) | Content Only；Planned Dependency |
| <a id="hfr-mid-autumn-02"></a>`hfr-mid-autumn-02` | 月亮沒有出來（節日當天） | Holidays & Family Rituals／中秋節 | [本檔既有節日構想 `hfr-mid-autumn-02`](#design-hfr-mid-autumn-02) | AS3、AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-08`](#CH-HFR-08)、[`REL-10`](#REL-10)、[`REL-11`](#REL-11) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-mid-autumn-03"></a>`hfr-mid-autumn-03` | 誰把團圓收進冰箱（節日後續） | Holidays & Family Rituals／中秋節 | [本檔既有節日構想 `hfr-mid-autumn-03`](#design-hfr-mid-autumn-03) | AS3、AS8、AS11（變體候選） | Idea | Unassigned | [`CH-HFR-08`](#CH-HFR-08)、[`REL-08`](#REL-08)、[`REL-10`](#REL-10) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-birthday-01"></a>`hfr-birthday-01` | 這次生日是誰先想起來（生日之前） | Holidays & Family Rituals／孩子的生日 | [本檔既有節日構想 `hfr-birthday-01`](#design-hfr-birthday-01) | AS4、AS8、AS12（變體候選） | Idea | Unassigned | [`CH-HFR-09`](#CH-HFR-09)、[`REL-01`](#REL-01)、[`REL-03`](#REL-03)、[`REL-06`](#REL-06) | C0、P5、P6、P7、P8 | [R1：Future Proposal](#r1-proposal) | Content Only；Planned Dependency |
| <a id="hfr-birthday-02"></a>`hfr-birthday-02` | 唱歌時他不想站中間（生日當天） | Holidays & Family Rituals／孩子的生日 | [本檔既有節日構想 `hfr-birthday-02`](#design-hfr-birthday-02) | AS4、AS8、AS12（變體候選） | Idea | Unassigned | [`CH-HFR-09`](#CH-HFR-09)、[`REL-01`](#REL-01)、[`REL-09`](#REL-09)、[`REL-11`](#REL-11)、[`REL-12`](#REL-12) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="hfr-birthday-03"></a>`hfr-birthday-03` | 再大一歲，想留下哪一小段（生日後續） | Holidays & Family Rituals／孩子的生日 | [本檔既有節日構想 `hfr-birthday-03`](#design-hfr-birthday-03) | AS4、AS8、AS12（變體候選） | Idea | Unassigned | [`CH-HFR-09`](#CH-HFR-09)、[`REL-01`](#REL-01)、[`REL-08`](#REL-08)、[`REL-11`](#REL-11)、[`REL-18`](#REL-18) | C0、P5、P6、P7、P8 | [R2：Future Proposal](#r2-proposal) | Content Only；Planned Dependency |

### Multigenerational Living & Parenting Boundaries（新增 7）

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="mgl-boundary-01"></a>`mgl-boundary-01` | 孩子一哭，長輩就立即介入 | Multigenerational Living & Parenting Boundaries | [本次使用者系列題材](#design-mg-mgl-boundary-01) | AS1、AS4、AS8（候選） | Idea | Unassigned | [`REL-19`](#REL-19)、[`CH-MG-01`](#CH-MG-01) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="mgl-boundary-02"></a>`mgl-boundary-02` | 孩子睡著了，客人還想看一眼 | Multigenerational Living & Parenting Boundaries | [本次使用者系列題材](#design-mg-mgl-boundary-02) | AS1、AS4、AS8（候選） | Idea | Unassigned | [`REL-19`](#REL-19)、[`CH-MG-01`](#CH-MG-01) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="mgl-boundary-03"></a>`mgl-boundary-03` | 綁頭髮時，誰先問孩子舒不舒服 | Multigenerational Living & Parenting Boundaries | [本次使用者系列題材](#design-mg-mgl-boundary-03) | AS6、AS8、AS11（候選） | Idea | Unassigned | [`REL-19`](#REL-19)、[`CH-MG-01`](#CH-MG-01) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="mgl-boundary-04"></a>`mgl-boundary-04` | 孩子找父母，長輩還不想放手 | Multigenerational Living & Parenting Boundaries | [本次使用者系列題材](#design-mg-mgl-boundary-04) | AS2、AS4、AS8（候選） | Idea | Unassigned | [`REL-19`](#REL-19)、[`CH-MG-01`](#CH-MG-01) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="mgl-boundary-05"></a>`mgl-boundary-05` | 「以前都這樣帶」背後想被聽見的經驗 | Multigenerational Living & Parenting Boundaries | [本次使用者系列題材](#design-mg-mgl-boundary-05) | AS4、AS8、AS11（候選） | Idea | Unassigned | [`REL-19`](#REL-19)、[`CH-MG-01`](#CH-MG-01)、[`CH-MG-02`](#CH-MG-02) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="mgl-boundary-06"></a>`mgl-boundary-06` | 「他們也是好意」之後，誰去協調 | Multigenerational Living & Parenting Boundaries | [本次使用者系列題材](#design-mg-mgl-boundary-06) | AS4、AS8、AS11（候選） | Idea | Unassigned | [`REL-19`](#REL-19)、[`REL-20`](#REL-20)、[`REL-21`](#REL-21)、[`CH-MG-01`](#CH-MG-01)、[`CH-MG-02`](#CH-MG-02)、[`CH-MG-03`](#CH-MG-03) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="mgl-boundary-07"></a>`mgl-boundary-07` | 有人幫忙帶，也能談照顧界線嗎 | Multigenerational Living & Parenting Boundaries | [本次使用者系列題材](#design-mg-mgl-boundary-07) | AS4、AS8、AS11（候選） | Idea | Unassigned | [`REL-19`](#REL-19)、[`REL-20`](#REL-20)、[`REL-21`](#REL-21)、[`CH-MG-01`](#CH-MG-01)、[`CH-MG-02`](#CH-MG-02)、[`CH-MG-03`](#CH-MG-03) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |

### Intergenerational Caregiving & Daily Routines（新增 6）

| Backlog ID | Title | Category | Source | AgeStage | Status | ReleaseScope | Related Events / Event Chain | Required Existing Capabilities | Optional New Mechanisms | Compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="igc-routine-01"></a>`igc-routine-01` | 「吃一口給阿嬤看」是誰的期待 | Intergenerational Caregiving & Daily Routines | [本次使用者系列題材](#design-mg-igc-routine-01) | AS4、AS8、AS11（候選） | Idea | Unassigned | [`REL-20`](#REL-20)、[`CH-MG-02`](#CH-MG-02) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="igc-routine-02"></a>`igc-routine-02` | 孩子說飽了，桌上還有人繼續勸 | Intergenerational Caregiving & Daily Routines | [本次使用者系列題材](#design-mg-igc-routine-02) | AS4、AS8、AS11（候選） | Idea | Unassigned | [`REL-20`](#REL-20)、[`CH-MG-02`](#CH-MG-02) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="igc-routine-03"></a>`igc-routine-03` | 孩子離開餐桌，照顧者還端著碗 | Intergenerational Caregiving & Daily Routines | [本次使用者系列題材](#design-mg-igc-routine-03) | AS4、AS6、AS8（候選） | Idea | Unassigned | [`REL-20`](#REL-20)、[`CH-MG-02`](#CH-MG-02) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="igc-routine-04"></a>`igc-routine-04` | 電視一開，這頓飯比較容易嗎 | Intergenerational Caregiving & Daily Routines | [本次使用者系列題材](#design-mg-igc-routine-04) | AS6、AS8、AS11（候選） | Idea | Unassigned | [`REL-20`](#REL-20)、[`REL-21`](#REL-21)、[`CH-MG-02`](#CH-MG-02)、[`CH-MG-03`](#CH-MG-03) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="igc-routine-05"></a>`igc-routine-05` | 父母不在時，電視又開了 | Intergenerational Caregiving & Daily Routines | [本次使用者系列題材](#design-mg-igc-routine-05) | AS4、AS8、AS11（候選） | Idea | Unassigned | [`REL-21`](#REL-21)、[`CH-MG-03`](#CH-MG-03) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |
| <a id="igc-routine-06"></a>`igc-routine-06` | 照顧原則被說太嚴格，還能怎麼談 | Intergenerational Caregiving & Daily Routines | [本次使用者系列題材](#design-mg-igc-routine-06) | AS4、AS8、AS11（候選） | Idea | Unassigned | [`REL-21`](#REL-21)、[`CH-MG-03`](#CH-MG-03) | C0、P5、P6、P7、P8 | — | Content Only；Planned Dependency |

### 管理類別數量

| Category | 數量 |
| --- | --- |
| A. 三餐與食物 | 12 |
| B. 家務與時間 | 10 |
| C. 行政與規劃 | 10 |
| D. 職涯與工作 | 10 |
| E. 交通與公共場合 | 15 |
| F. 親友與社會眼光 | 10 |
| G. 伴侶關係與分工 | 10 |
| H. 父母內在與身心 | 10 |
| I. 孩子發展與照顧 | 8 |
| J. 支持與修復 | 5 |
| Holidays & Family Rituals | 30 |
| Multigenerational Living & Parenting Boundaries（新增主分類紀錄） | 7 |
| Intergenerational Caregiving & Daily Routines（新增主分類紀錄） | 6 |
| **總計** | **143** |

節日子類：萬聖節 3；聖誕節 6；農曆春節 3；兒童節 3；母親節 3；父親節 3；端午節 3；中秋節 3；孩子的生日 3。這九個子類已包含在 30 筆內，不重複加總。

多代／隔代兩個新子分類按系列成員計：第一組 10 項情境對應 9 筆候選，第二組 8 項對應 8 筆候選，其中 mgl-boundary-07 跨組共用；去重後共 16 筆（新增 13＋既有 3）。既有 bl-gdd-059／065／076 保留原 GDD Category，只增加系列關聯；上表依主分類計數，不將跨組成員重複加總。

## 事件鏈與題材關聯

### GDD 第 8 章五條代表性鏈

下列是原鏈與候選題材的對照，不是已完成或保證可達的事件圖；各分支仍待設計、預算與整合驗證。五條鏈本身不建立額外 Backlog 紀錄。

| Chain ID | 原始來源與順序 | 對照候選 | 保留差異／待確認 |
| --- | --- | --- | --- |
| <a id="CH-GDD-A"></a>`CH-GDD-A` 晚餐 | GDD §8.2；下班後要不要煮飯 → 孩子不想吃／今晚選外食／家庭成員主動承擔 → 誰負責收拾 → 下週菜單誰規劃 | [`bl-gdd-001`](#bl-gdd-001)、[`bl-gdd-004`](#bl-gdd-004)、[`bl-gdd-009`](#bl-gdd-009)、[`bl-gdd-073`](#bl-gdd-073)、[`bl-gdd-013`](#bl-gdd-013)、[`bl-gdd-003`](#bl-gdd-003)、[`bl-gdd-099`](#bl-gdd-099) | 一次備餐、外食、收尾與一週規劃各有不同負擔；分支與結局未設計完成。 |
| <a id="CH-GDD-B"></a>`CH-GDD-B` 大眾運輸 | GDD §8.3；捷運孩子哭鬧 → 安撫／短暫手機／下車休息／家人接手 → 旁人支持／中立／批評／無反應 → 孩子疲累且隔天要上班 | [`bl-gdd-043`](#bl-gdd-043)、[`bl-gdd-051`](#bl-gdd-051)、[`bl-gdd-052`](#bl-gdd-052)、[`bl-gdd-096`](#bl-gdd-096) | 哭鬧、手機評論與支持可共鏈；最後的疲累與隔天工作保留為待設計鏈內片段，沒有硬套成另一個題材或新增紀錄。 |
| <a id="CH-GDD-C"></a>`CH-GDD-C` 餐廳 | GDD §8.4；孩子吵鬧 → 提醒後大哭 → 抱到外面／遊戲／短暫手機／同行者接手 → 旁人不同反應 → 內心獨白與修復 | [`bl-gdd-056`](#bl-gdd-056)、[`bl-gdd-057`](#bl-gdd-057)、[`bl-gdd-066`](#bl-gdd-066)、[`bl-gdd-096`](#bl-gdd-096)、[`bl-gdd-080`](#bl-gdd-080) | 餐廳與車廂保留不同環境限制；通用支持／修復候選可供對照，不表示已共用同一 EventNode。 |
| <a id="CH-GDD-D"></a>`CH-GDD-D` 看不見的規劃 | GDD §8.5；幼兒園通知要帶用品 → 照顧者忙忘 → 誰記得、採買、準備 → 等待指示或主動認領 → 重新分工 | [`bl-gdd-018`](#bl-gdd-018)、[`bl-gdd-024`](#bl-gdd-024)、[`bl-gdd-025`](#bl-gdd-025)、[`bl-gdd-026`](#bl-gdd-026)、[`bl-gdd-032`](#bl-gdd-032)、[`bl-gdd-068`](#bl-gdd-068) | 帶用品、未讀通知、管理群組與報名截止各自保留；對照察覺、規劃、聯絡、執行與追蹤。 |
| <a id="CH-GDD-E"></a>`CH-GDD-E` 父母情緒 | GDD §8.6；連日睡不好 → 失去耐心 → 擔憂自己不是好父母 → 休息／求助／修復／伴侶協調 → 更有彈性的後續 | [`bl-gdd-088`](#bl-gdd-088)、[`bl-gdd-079`](#bl-gdd-079)、[`bl-gdd-080`](#bl-gdd-080)、[`bl-gdd-078`](#bl-gdd-078)、[`bl-gdd-085`](#bl-gdd-085)、[`bl-gdd-087`](#bl-gdd-087)、[`bl-gdd-072`](#bl-gdd-072)、[`bl-gdd-074`](#bl-gdd-074) | 夜醒、罪惡感、求助與道歉是相關候選，並非每次夜醒都必然導向失控。 |

### 節日系列與年齡變體

同一階段的準備／當天／後續可形成鏈；較大階段的重訪是變體關係，不保證每個階段都遇到。箭頭是候選因果順序，不是可直接載入的 follow-up 引用。沒有實際發生的往事不得回憶補造。

| Chain ID | 系列 | Backlog 關聯 | 變體規則 |
| --- | --- | --- | --- |
| <a id="CH-HFR-01"></a>`CH-HFR-01` | 萬聖節 | [`hfr-halloween-01`](#hfr-halloween-01) → [`hfr-halloween-02`](#hfr-halloween-02) → [`hfr-halloween-03`](#hfr-halloween-03) | 每筆保留所列 AgeStage 版本；同階段接鏈，較大階段可重新協商；不增加候選筆數。 |
| <a id="CH-HFR-02"></a>`CH-HFR-02` | 聖誕節 | [`hfr-christmas-01`](#hfr-christmas-01) → [`hfr-christmas-02`](#hfr-christmas-02)；成長重訪 [`hfr-christmas-03`](#hfr-christmas-03)、[`hfr-christmas-04`](#hfr-christmas-04)；[`hfr-christmas-05`](#hfr-christmas-05) → [`hfr-christmas-06`](#hfr-christmas-06) | AS4 收禮與必要性 → AS8 聖誕老人 → AS11 比較 → AS12 主動送禮；不是連續四年日曆。 |
| <a id="CH-HFR-03"></a>`CH-HFR-03` | 農曆春節 | [`hfr-lunar-new-year-01`](#hfr-lunar-new-year-01) → [`hfr-lunar-new-year-02`](#hfr-lunar-new-year-02) → [`hfr-lunar-new-year-03`](#hfr-lunar-new-year-03) | 每筆保留所列 AgeStage 版本；同階段接鏈，較大階段可重新協商；不增加候選筆數。 |
| <a id="CH-HFR-04"></a>`CH-HFR-04` | 兒童節 | [`hfr-childrens-day-01`](#hfr-childrens-day-01) → [`hfr-childrens-day-02`](#hfr-childrens-day-02) → [`hfr-childrens-day-03`](#hfr-childrens-day-03) | 每筆保留所列 AgeStage 版本；同階段接鏈，較大階段可重新協商；不增加候選筆數。 |
| <a id="CH-HFR-05"></a>`CH-HFR-05` | 母親節 | [`hfr-mothers-day-01`](#hfr-mothers-day-01) → [`hfr-mothers-day-02`](#hfr-mothers-day-02) → [`hfr-mothers-day-03`](#hfr-mothers-day-03) | 每筆保留所列 AgeStage 版本；同階段接鏈，較大階段可重新協商；不增加候選筆數。 |
| <a id="CH-HFR-06"></a>`CH-HFR-06` | 父親節 | [`hfr-fathers-day-01`](#hfr-fathers-day-01) → [`hfr-fathers-day-02`](#hfr-fathers-day-02) → [`hfr-fathers-day-03`](#hfr-fathers-day-03) | 每筆保留所列 AgeStage 版本；同階段接鏈，較大階段可重新協商；不增加候選筆數。 |
| <a id="CH-HFR-07"></a>`CH-HFR-07` | 端午節 | [`hfr-dragon-boat-01`](#hfr-dragon-boat-01) → [`hfr-dragon-boat-02`](#hfr-dragon-boat-02) → [`hfr-dragon-boat-03`](#hfr-dragon-boat-03) | 每筆保留所列 AgeStage 版本；同階段接鏈，較大階段可重新協商；不增加候選筆數。 |
| <a id="CH-HFR-08"></a>`CH-HFR-08` | 中秋節 | [`hfr-mid-autumn-01`](#hfr-mid-autumn-01) → [`hfr-mid-autumn-02`](#hfr-mid-autumn-02) → [`hfr-mid-autumn-03`](#hfr-mid-autumn-03) | 每筆保留所列 AgeStage 版本；同階段接鏈，較大階段可重新協商；不增加候選筆數。 |
| <a id="CH-HFR-09"></a>`CH-HFR-09` | 孩子的生日 | [`hfr-birthday-01`](#hfr-birthday-01) → [`hfr-birthday-02`](#hfr-birthday-02) → [`hfr-birthday-03`](#hfr-birthday-03) | 每筆保留所列 AgeStage 版本；同階段接鏈，較大階段可重新協商；不增加候選筆數。 |

### 多代同住／隔代教養代表鏈

下表各成員為候選池與變體來源，不表示整條鏈必須載入全部成員；完整狀態轉移與內容預算見後方規則。三條鏈不是新增事件紀錄。

| Chain ID | 題材 | 成員候選 | 代表性順序 | 設計重點 |
| --- | --- | --- | --- | --- |
| <a id="CH-MG-01"></a>`CH-MG-01` | 作息與身體界線的下一次 | [`bl-gdd-065`](#bl-gdd-065)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098)、[`mgl-boundary-01`](#mgl-boundary-01)、[`mgl-boundary-02`](#mgl-boundary-02)、[`mgl-boundary-03`](#mgl-boundary-03)、[`mgl-boundary-04`](#mgl-boundary-04)、[`mgl-boundary-05`](#mgl-boundary-05)、[`mgl-boundary-06`](#mgl-boundary-06)、[`mgl-boundary-07`](#mgl-boundary-07) | 從哭鬧介入／叫醒／衣著／整理頭髮／抱回孩子擇一 → 說明與分工 → 下一次相同照顧情境的變體 → 理解支持或再次協調 | 成員是可替換的候選池，不要求全部發生；長輩可先詢問，父母也可接受有用提醒。 |
| <a id="CH-MG-02"></a>`CH-MG-02` | 飲食界線 → 溝通責任 → 下次照顧 | [`bl-gdd-059`](#bl-gdd-059)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098)、[`mgl-boundary-05`](#mgl-boundary-05)、[`mgl-boundary-06`](#mgl-boundary-06)、[`mgl-boundary-07`](#mgl-boundary-07)、[`igc-routine-01`](#igc-routine-01)、[`igc-routine-02`](#igc-routine-02)、[`igc-routine-03`](#igc-routine-03)、[`igc-routine-04`](#igc-routine-04) | 從吃一點點／人情勸食／已飽仍勸／追餵擇一 → 伴侶主責或當事人直接協調 → 下一次祖父母照顧時重訪 → 依實際行動形成支持或重談 | 未來 MVP 至少一條完整多代鏈的優先評選方案；具體事件仍 Unassigned，不把它視為已核定的 30 節點名單。 |
| <a id="CH-MG-03"></a>`CH-MG-03` | 螢幕安排 → 交接釐清 → 再次托育 | [`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098)、[`mgl-boundary-06`](#mgl-boundary-06)、[`mgl-boundary-07`](#mgl-boundary-07)、[`igc-routine-04`](#igc-routine-04)、[`igc-routine-05`](#igc-routine-05)、[`igc-routine-06`](#igc-routine-06) | 餐中開電視或得知私下開電視 → 確認先前是否說清 → 承接溝通與可行調整 → 下次交接的守約／主動詢問／仍落差 | 孩子不負責監視或傳話；一般偏好可協商，安全限制不能作交換條件；沒有單一信任分數。 |

### 重複風險與關聯題材清單

本次保留全部 130 筆既有候選；18 項新情境中的 5 項併為既有或本次候選的變體，詳見後方來源對照，不另建重複紀錄。未發現完全相同的管理紀錄題名；以下列出近似題材、變體及共用鏈主題，不能以「沒有重複 ID」取代語意審查。未列入不表示已證明與其他題材無關。

| Relation ID | 關係 | 相關 Backlog ID | 應保留的獨特情境 |
| --- | --- | --- | --- |
| <a id="REL-01"></a>`REL-01` | 延伸：生日安排 | [`bl-gdd-012`](#bl-gdd-012)、[`hfr-birthday-01`](#hfr-birthday-01)、[`hfr-birthday-02`](#hfr-birthday-02)、[`hfr-birthday-03`](#hfr-birthday-03) | 原題聚焦餐點精緻度；新增事件分別聚焦記得安排、現場界線與成長留存，不以生日同題刪除。 |
| <a id="REL-02"></a>`REL-02` | 變體／共用鏈：通知與期限 | [`bl-gdd-018`](#bl-gdd-018)、[`bl-gdd-024`](#bl-gdd-024)、[`bl-gdd-025`](#bl-gdd-025)、[`bl-gdd-026`](#bl-gdd-026)、[`hfr-halloween-01`](#hfr-halloween-01) | 用品準備、訊息未讀、群組管理、報名期限與自願裝扮的參與選擇各自保留。 |
| <a id="REL-03"></a>`REL-03` | 共用主題：誰先想起 | [`bl-gdd-017`](#bl-gdd-017)、[`bl-gdd-019`](#bl-gdd-019)、[`bl-gdd-032`](#bl-gdd-032)、[`bl-gdd-070`](#bl-gdd-070)、[`bl-gdd-081`](#bl-gdd-081)、[`hfr-birthday-01`](#hfr-birthday-01)、[`hfr-lunar-new-year-01`](#hfr-lunar-new-year-01)、[`hfr-mid-autumn-01`](#hfr-mid-autumn-01) | 消耗品、垃圾、尺寸、成人自己的生日與孩子的生日不是同一件事；行事曆題材只描述協調負荷，不開發 Calendar System。 |
| <a id="REL-04"></a>`REL-04` | 變體：問候與身體界線 | [`bl-gdd-058`](#bl-gdd-058)、[`bl-gdd-061`](#bl-gdd-061)、[`hfr-lunar-new-year-02`](#hfr-lunar-new-year-02) | 拒絕叫人與怕生被貼標籤保留不同焦點；春節加入團聚、禮俗與收禮脈絡。 |
| <a id="REL-05"></a>`REL-05` | 延伸：比較與理想家庭 | [`bl-gdd-060`](#bl-gdd-060)、[`bl-gdd-082`](#bl-gdd-082)、[`hfr-christmas-04`](#hfr-christmas-04) | 親友比較孩子、成人看社群、孩子比較禮物的發問者與情緒位置不同。 |
| <a id="REL-06"></a>`REL-06` | 共用主題：完整承接 | [`bl-gdd-068`](#bl-gdd-068)、[`bl-gdd-073`](#bl-gdd-073)、[`bl-gdd-099`](#bl-gdd-099)、[`hfr-halloween-01`](#hfr-halloween-01)、[`hfr-christmas-05`](#hfr-christmas-05)、[`hfr-lunar-new-year-01`](#hfr-lunar-new-year-01)、[`hfr-mothers-day-03`](#hfr-mothers-day-03)、[`hfr-fathers-day-01`](#hfr-fathers-day-01)、[`hfr-dragon-boat-01`](#hfr-dragon-boat-01)、[`hfr-mid-autumn-01`](#hfr-mid-autumn-01)、[`hfr-birthday-01`](#hfr-birthday-01) | 等待指示、接手一次備餐、主動承擔一週餐食分別保留；節日加入聯絡、期限與收尾，不把一次執行等同整體交接。 |
| <a id="REL-07"></a>`REL-07` | 共用主題：休息與感謝 | [`bl-gdd-008`](#bl-gdd-008)、[`bl-gdd-013`](#bl-gdd-013)、[`bl-gdd-022`](#bl-gdd-022)、[`bl-gdd-074`](#bl-gdd-074)、[`bl-gdd-078`](#bl-gdd-078)、[`bl-gdd-085`](#bl-gdd-085)、[`hfr-mothers-day-02`](#hfr-mothers-day-02)、[`hfr-mothers-day-03`](#hfr-mothers-day-03)、[`hfr-childrens-day-01`](#hfr-childrens-day-01)、[`hfr-childrens-day-02`](#hfr-childrens-day-02) | 睡眠、獨處、休假與被感謝的需求不同；母親節也可不辦，兒童節需容納孩子的行程意見。 |
| <a id="REL-08"></a>`REL-08` | 共用主題：參與與收尾 | [`bl-gdd-015`](#bl-gdd-015)、[`bl-gdd-020`](#bl-gdd-020)、[`bl-gdd-021`](#bl-gdd-021)、[`bl-gdd-091`](#bl-gdd-091)、[`hfr-halloween-03`](#hfr-halloween-03)、[`hfr-christmas-02`](#hfr-christmas-02)、[`hfr-christmas-06`](#hfr-christmas-06)、[`hfr-lunar-new-year-03`](#hfr-lunar-new-year-03)、[`hfr-dragon-boat-03`](#hfr-dragon-boat-03)、[`hfr-mid-autumn-03`](#hfr-mid-autumn-03)、[`hfr-birthday-03`](#hfr-birthday-03) | 日常整理、親友幫忙造成額外工作、孩子參與和節物收尾分開；不將所有收尾節點寫成同一場對話。 |
| <a id="REL-09"></a>`REL-09` | 變體／共用鏈：公共哭鬧與手機 | [`bl-gdd-043`](#bl-gdd-043)、[`bl-gdd-051`](#bl-gdd-051)、[`bl-gdd-056`](#bl-gdd-056)、[`bl-gdd-057`](#bl-gdd-057)、[`bl-gdd-066`](#bl-gdd-066)、[`bl-gdd-096`](#bl-gdd-096)、[`hfr-halloween-02`](#hfr-halloween-02)、[`hfr-birthday-02`](#hfr-birthday-02) | 車廂、餐廳、活動入口與生日焦點的可離開性及他人期待不同；支持也有獨立候選。 |
| <a id="REL-10"></a>`REL-10` | 共用主題：傳統與尊重 | [`bl-gdd-059`](#bl-gdd-059)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098)、[`hfr-lunar-new-year-02`](#hfr-lunar-new-year-02)、[`hfr-lunar-new-year-03`](#hfr-lunar-new-year-03)、[`hfr-dragon-boat-01`](#hfr-dragon-boat-01)、[`hfr-dragon-boat-02`](#hfr-dragon-boat-02)、[`hfr-dragon-boat-03`](#hfr-dragon-boat-03)、[`hfr-mid-autumn-01`](#hfr-mid-autumn-01)、[`hfr-mid-autumn-02`](#hfr-mid-autumn-02)、[`hfr-mid-autumn-03`](#hfr-mid-autumn-03) | 偷偷餵糖、教養分歧、長輩尊重與家庭自選傳統各自保留，不把長輩反應固定成衝突。 |
| <a id="REL-11"></a>`REL-11` | 共用主題：快樂與失落並存 | [`bl-gdd-086`](#bl-gdd-086)、[`bl-gdd-100`](#bl-gdd-100)、[`hfr-christmas-02`](#hfr-christmas-02)、[`hfr-christmas-06`](#hfr-christmas-06)、[`hfr-childrens-day-02`](#hfr-childrens-day-02)、[`hfr-childrens-day-03`](#hfr-childrens-day-03)、[`hfr-fathers-day-02`](#hfr-fathers-day-02)、[`hfr-fathers-day-03`](#hfr-fathers-day-03)、[`hfr-mid-autumn-02`](#hfr-mid-autumn-02)、[`hfr-birthday-02`](#hfr-birthday-02)、[`hfr-birthday-03`](#hfr-birthday-03) | 孩子的一句話、送禮反應、延期陪伴與天候落空是不同轉折；孩子不負責安撫成人。 |
| <a id="REL-12"></a>`REL-12` | 共用鏈：疲憊、支持與修復 | [`bl-gdd-072`](#bl-gdd-072)、[`bl-gdd-079`](#bl-gdd-079)、[`bl-gdd-080`](#bl-gdd-080)、[`bl-gdd-087`](#bl-gdd-087)、[`hfr-mothers-day-03`](#hfr-mothers-day-03)、[`hfr-fathers-day-03`](#hfr-fathers-day-03)、[`hfr-christmas-04`](#hfr-christmas-04)、[`hfr-birthday-02`](#hfr-birthday-02) | 成人協商、對孩子道歉、求助與落差修復需分別設計；不保證一次談話就改善。 |
| <a id="REL-13"></a>`REL-13` | 變體：衣物與尺寸 | [`bl-gdd-014`](#bl-gdd-014)、[`bl-gdd-027`](#bl-gdd-027)、[`bl-gdd-065`](#bl-gdd-065)、[`bl-gdd-070`](#bl-gdd-070) | 換季與洗衣、突然變小、穿著評論、誰記得尺寸分屬整理、需求、眼光與責任。 |
| <a id="REL-14"></a>`REL-14` | 共用鏈：哄睡與夜醒 | [`bl-gdd-069`](#bl-gdd-069)、[`bl-gdd-079`](#bl-gdd-079)、[`bl-gdd-084`](#bl-gdd-084)、[`bl-gdd-088`](#bl-gdd-088) | 誰哄睡、夜裡自責、生病仍照顧與孩子夜醒是不同主體和負擔，不合併。 |
| <a id="REL-15"></a>`REL-15` | 共用主題：入園與接送 | [`bl-gdd-028`](#bl-gdd-028)、[`bl-gdd-034`](#bl-gdd-034)、[`bl-gdd-040`](#bl-gdd-040)、[`bl-gdd-089`](#bl-gdd-089)、[`bl-gdd-093`](#bl-gdd-093) | 緊急聯絡、會議撞接送、遲到焦慮、分離焦慮與入園適應分開；不把孩子反應等同父母工作選擇的後果。 |
| <a id="REL-16"></a>`REL-16` | 共用鏈：工作與支援 | [`bl-gdd-033`](#bl-gdd-033)、[`bl-gdd-035`](#bl-gdd-035)、[`bl-gdd-041`](#bl-gdd-041)、[`bl-gdd-087`](#bl-gdd-087)、[`bl-gdd-097`](#bl-gdd-097) | 發燒請假、加班托育、請假心理壓力、求助顧慮與同事代班各自保留；支持不是固定可取得。 |
| <a id="REL-17"></a>`REL-17` | 共用主題：家庭稱呼與感謝 | [`hfr-mothers-day-01`](#hfr-mothers-day-01)、[`hfr-mothers-day-02`](#hfr-mothers-day-02)、[`hfr-mothers-day-03`](#hfr-mothers-day-03)、[`hfr-fathers-day-01`](#hfr-fathers-day-01)、[`hfr-fathers-day-02`](#hfr-fathers-day-02)、[`hfr-fathers-day-03`](#hfr-fathers-day-03) | 兩節都容納稱呼與缺席；母親節突出被感謝者仍服務的負擔，父親節突出日常參與與不過度稱讚，避免只替換節名。 |
| <a id="REL-18"></a>`REL-18` | 共用主題：成長記憶與自主 | [`hfr-halloween-03`](#hfr-halloween-03)、[`hfr-christmas-06`](#hfr-christmas-06)、[`hfr-childrens-day-03`](#hfr-childrens-day-03)、[`hfr-birthday-03`](#hfr-birthday-03) | 敘事記憶可共用既有契約；卡片、重述與照片界線各異，只有可編輯紀念頁才涉及 R2。 |
| <a id="REL-19"></a>`REL-19` | 延伸／變體：多代界線、作息與溝通 | [`bl-gdd-016`](#bl-gdd-016)、[`bl-gdd-020`](#bl-gdd-020)、[`bl-gdd-043`](#bl-gdd-043)、[`bl-gdd-058`](#bl-gdd-058)、[`bl-gdd-065`](#bl-gdd-065)、[`bl-gdd-068`](#bl-gdd-068)、[`bl-gdd-072`](#bl-gdd-072)、[`bl-gdd-075`](#bl-gdd-075)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-087`](#bl-gdd-087)、[`bl-gdd-088`](#bl-gdd-088)、[`bl-gdd-098`](#bl-gdd-098)、[`mgl-boundary-01`](#mgl-boundary-01)、[`mgl-boundary-02`](#mgl-boundary-02)、[`mgl-boundary-03`](#mgl-boundary-03)、[`mgl-boundary-04`](#mgl-boundary-04)、[`mgl-boundary-05`](#mgl-boundary-05)、[`mgl-boundary-06`](#mgl-boundary-06)、[`mgl-boundary-07`](#mgl-boundary-07) | 同住、探訪與托育交接各自保留；不把公共哭鬧等同親屬介入，也不把支援的成本等同教養決定權。 |
| <a id="REL-20"></a>`REL-20` | 延伸／變體：餵食、飽足與人情 | [`bl-gdd-004`](#bl-gdd-004)、[`bl-gdd-006`](#bl-gdd-006)、[`bl-gdd-059`](#bl-gdd-059)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098)、[`mgl-boundary-06`](#mgl-boundary-06)、[`mgl-boundary-07`](#mgl-boundary-07)、[`igc-routine-01`](#igc-routine-01)、[`igc-routine-02`](#igc-routine-02)、[`igc-routine-03`](#igc-routine-03)、[`igc-routine-04`](#igc-routine-04) | 拒吃、吃飽、追餵與為長輩吃一口有不同焦點；一般偏好與安全限制分支先分開。 |
| <a id="REL-21"></a>`REL-21` | 延伸／變體：螢幕、交接與信任 | [`bl-gdd-057`](#bl-gdd-057)、[`bl-gdd-059`](#bl-gdd-059)、[`bl-gdd-068`](#bl-gdd-068)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098)、[`mgl-boundary-06`](#mgl-boundary-06)、[`mgl-boundary-07`](#mgl-boundary-07)、[`igc-routine-04`](#igc-routine-04)、[`igc-routine-05`](#igc-routine-05)、[`igc-routine-06`](#igc-routine-06) | 餐中開電視、不在場時改動安排與認為原則過嚴各自保留；與公共場合手機、偷偷餵糖是關聯而非同一行為。 |

<a id="multi-child-question"></a>

### 手足與堂／表親爭執的情境變體

依使用者補充，bl-gdd-095「手足爭執」也可涵蓋與堂／表兄弟姊妹的爭執，不預設玩家家中有多個孩子。保留 GDD 原題名與原始 #95 對照，將親屬關係作為同一候選的情境變體，不另增紀錄；Status／ReleaseScope 仍為 Idea／Unassigned。

例如親友聚會時，孩子與堂／表兄弟姊妹爭同一個玩具，照顧者需要回應孩子並與另一方成人協調。親友孩子可使用既有 child actor／臨時事件角色契約描述；不必為此建立另一套孩子成長狀態，也不需要新增遊戲機制。具體年齡、選項與反應仍待設計確認。

只有未來另行要求持續模擬多名孩子各自的 AgeStage、資源、關係與排程時，才需要評估多孩長期狀態；這不是本候選的前置需求，也不是新增或已核准的機制提案。本次不修改人物模型、引擎或 Schema。

## Holidays & Family Rituals｜保留的詳細構想

詳細設計的 Event ID 沿用舊標籤，僅指向上方同名 Backlog ID；管理狀態均為 Idea／Unassigned，沒有 EventNode ID。年齡變體不另計事件紀錄。

### 共用設計約定

- **以年齡觸發**：使用既有 AgeStage eligibility 與事件前置條件，不建立完整年度 Calendar System，不讀取真實日期，也不保證每一局經歷所有節日。文中的「節日前／當天／節後」是故事順序，不是日曆日期。
- **跨年齡系列**：同一節日可在不同 AgeStage 再出現，承接先前的選擇、分工與記憶。這是孩子長大後的新篇章，不是重新播放同一節點；也不代表模擬了每一年。
- **階段對照**：依 `AGE_STAGE_MONTHS`：AS1＝2 個月、AS2＝6 個月、AS3＝10 個月、AS4＝15 個月、AS5＝21 個月、AS6＝27 個月、AS7＝33 個月、AS8＝39 個月、AS9＝45 個月、AS10＝52 個月、AS11＝61 個月、AS12＝71 個月。ASn 暫以 `age-stage-n` 表示；正式內容仍須對照 ContentPack 的 stage ID。「1／3／5／6 歲」為敘事近似，分別使用 AS4／AS8／AS11／AS12。
- **多階段構想**：條目列出多個 AgeStage 時，表示同一構想的不同年齡版本；落地時拆成各自擁有單一 `ageStageId` 與唯一 ID 的 EventNode，不新增多階段欄位。同一條節日準備→當天→後續鏈選用相同 AgeStage 版本；跨階段的線只表示下次重訪。
- **可跳過與可改變**：每個系列都能不慶祝、簡化或在有人可承接時委派；「這次略過」不等於永久退出。是否參與、家庭文化與節日稱呼由內容選項／flags 表達，不從家庭組成、族群或宗教推定。無相關經驗時可從簡短背景進入，不假設上一段已發生。
- **分工包含記得**：準備者不預設為媽媽。辨認「誰先想起、誰決定、誰聯絡、誰執行、誰收尾」；委派要呈現對方是否接下完整責任，父母仍可能負擔提醒與追蹤。單一照顧者可以減量或使用可用支持，不憑空生成伴侶、祖父母或免費人力。
- **不評比家庭**：花費、禮物數量與活動精緻度不決定好壞父母或固定的 connection 回報。孩子可能開心、失望或無感，父母也可以同時疲憊與感到溫暖；孩子失望不自動懲罰父母。資源只表達實際成本與情境。
- **人物反應**：以下均為候選反應，不是選項的固定獎懲。Reaction／reactionPool 可包含 support、neutral、criticism、none；按角色可用性篩選。父母預期的批評與實際觀察分開，拒絕或簡化活動也可以獲得支持。涉及母親／父親缺席、喪親或疏離時，由玩家選擇是否提及，不強制揭露原因。
- **鏈與篇幅**：以 `immediateFollowUpEventIds` 接短反應，Scheduler 的 `scheduledFollowUps` 以 `delayTurns` 接同階段後續、`targetAgeStageId` 接後續成長篇章，並以 flags／`eventCompleted` 避免錯接。準備時選擇不辦，當天節點改寫為平日或休息分支，後續也可留下「今年沒有辦」的記憶。每條鏈分散在多個 Turn，遵守每 Turn 4 節點、每 AgeStage 6 節點的上限；不把此庫的全部候選塞進同一階段，也不保證排程一定能在有限預算內出現。
- **記憶與負荷**：用 `choiceHistory`、flags、`relationshipMemories`、story history 留下具體回憶；以 planningLoad 的敘事呈現規劃、提醒、收尾與交接成本，不新增玩家可見的節日績效分數。可選內心獨白只表達當下感受，不替所有父母定義想法。
- **能力狀態**：EventNode、排程、Reaction、planningLoad、記憶等已有資料契約；依 [EVENT_ENGINE.md](EVENT_ENGINE.md)，完整生命週期、Scheduler、Reaction 與負荷效果仍有後續實作邊界。以下「沿用」表示沿用既有設計與契約，不宣稱全部已可執行，也不因此新增或改寫 Tickets。參考 [DOMAIN_SCHEMA.md](DOMAIN_SCHEMA.md) 與 [GDD.md](GDD.md)。

### 系列索引

箭頭表示可選故事鏈；「重訪」表示較大年齡的新篇章。所有 ID 都是 Backlog 識別碼。

| 節日 | Backlog ID 與故事順序 | 成長中的改變 |
| --- | --- | --- |
| 萬聖節 | hfr-halloween-01 → 02 → 03 | AS6 模仿裝扮 → AS8 在意同伴 → AS11 自訂參與方式 |
| 聖誕節 | hfr-christmas-01 → 02；重訪 03、04；05 → 06 | AS4 禮物的必要性 → AS8 聖誕老人 → AS11 禮物比較 → AS12 主動送禮 |
| 農曆春節 | hfr-lunar-new-year-01 → 02 → 03 | AS4 作息與團聚 → AS8 拜年界線 → AS11 參與家庭協商 |
| 兒童節 | hfr-childrens-day-01 → 02 → 03 | AS6 玩伴與休息 → AS8 期待活動 → AS11 表達自己的願望 |
| 母親節 | hfr-mothers-day-01 → 02 → 03 | AS8 理解稱呼 → AS11 區分被感謝與繼續服務 |
| 父親節 | hfr-fathers-day-01 → 02 → 03 | AS8 看見日常照顧 → AS12 自主表達感謝 |
| 端午節 | hfr-dragon-boat-01 → 02 → 03 | AS5 感官參與 → AS9 提問傳統 → AS12 選擇想傳承的部分 |
| 中秋節 | hfr-mid-autumn-01 → 02 → 03 | AS3 短暫一起看月亮 → AS8 想像與提問 → AS11 協調不同期待 |
| 孩子的生日 | hfr-birthday-01 → 02 → 03 | AS4 大人替孩子記得 → AS8 孩子開始許願 → AS12 參與定義自己的生日 |

### 萬聖節

<a id="design-hfr-halloween-01"></a>

#### hfr-halloween-01｜裝扮通知單是誰記得的（節日前）

1. **Event ID**：`hfr-halloween-01`。
2. **適用 AgeStage**：AS6、AS8、AS11 的各自版本。
3. **生活情境**：班級或社區傳來自願裝扮通知；AS6 的孩子只想戴帽子，AS8 想和朋友一樣，AS11 想改造舊衣服。
4. **父母面臨的矛盾與隱形負擔**：想讓孩子參與，卻要記期限、確認舒適度、找材料及安排接送；另一照顧者可能只說「你決定就好」。
5. **可能的玩家選擇**：用現有物品做簡單裝扮；請可用照顧者承接通知到收尾；詢問無裝扮參與方式；這次不參加並向孩子說明。
6. **孩子與其他人物的反應**：孩子可能因能自己選而興奮，也可能失望；老師可表示便服也歡迎，承接者可主動確認或仍需要提醒。
7. **可選的內心獨白**：「我累的不是找一頂帽子，是每次都要由我先想起來。」
8. **後續事件與家庭記憶**：接同階段 `hfr-halloween-02`，帶入裝扮／便服／不參與旗標；留下誰完成交接的記憶，下次較大年齡重訪可談分工。
9. **可沿用的現有遊戲機制**：EventNode 選項、actorAvailable、setFlags、Scheduler、Reaction、planningLoad 與資源成本。
10. **是否需要新增機制**：基本版否；若要玩家實際編輯準備清單與責任人，列為可選 R1。

<a id="design-hfr-halloween-02"></a>

#### hfr-halloween-02｜走到門口又退回來（節日當天）

1. **Event ID**：`hfr-halloween-02`。
2. **適用 AgeStage**：AS6、AS8、AS11，承接同階段 01；也可有獨立入口。
3. **生活情境**：AS6 被面具嚇到，AS8 想跟朋友走卻怕敲門，AS11 覺得裝扮太幼稚但還想一起玩；未參加者在家看見路過的人群。
4. **父母面臨的矛盾與隱形負擔**：已經準備卻臨場退縮，父母得處理自己的落空、孩子的界線與同行者的步調。
5. **可能的玩家選擇**：在旁邊觀察一會；請同行照顧者陪同、自己休息；提早回家；不參與活動，只在家用影子講故事或照常過。
6. **孩子與其他人物的反應**：孩子可能鬆一口氣或之後改變主意；同行者可能願意等、繼續走或沒有評論，不預設陌生人嘲笑。
7. **可選的內心獨白**：「準備過了，也可以在門口說今天到這裡。」
8. **後續事件與家庭記憶**：排入 `hfr-halloween-03`，記錄孩子實際喜歡的片段，不用完成路線證明活動成功。
9. **可沿用的現有遊戲機制**：eligibility／flags、Reaction pool、timeFlexibility／energy、Scheduler、planningLoad 的臨場協調敘事。
10. **是否需要新增機制**：否；不需恐懼量表或討糖收集系統。

<a id="design-hfr-halloween-03"></a>

#### hfr-halloween-03｜留下的不是那套衣服（節日後續）

1. **Event ID**：`hfr-halloween-03`。
2. **適用 AgeStage**：AS6、AS8、AS11 的同階段後續。
3. **生活情境**：要處理借來的道具、散落材料或活動照片；AS6 記得帽子，AS8 記得牽手，AS11 想把裝扮改成日常遊戲。沒參加也可能留下平靜的一晚。
4. **父母面臨的矛盾與隱形負擔**：節日結束，歸還、整理與記下下次注意事項仍未結束；孩子的最佳回憶與大人投入之處不同。
5. **可能的玩家選擇**：親子一起收一小部分；讓原承接者完成收尾；留下照片就回收材料；只休息，日後再整理。
6. **孩子與其他人物的反應**：孩子可能捨不得或只想繼續玩；其他照顧者可主動歸還物品，也可能這才理解收尾的份量。
7. **可選的內心獨白**：「他記得的是牽著手走那一段，這也很好。」
8. **後續事件與家庭記憶**：留下具體片段與交接結果；較大年齡的 01 可引用「上次帽子太悶」或「上次我們沒去」，不強迫沿用舊偏好。
9. **可沿用的現有遊戲機制**：relationshipMemories、story history、choiceHistory、flags、planningLoad 的收尾敘事與跨 AgeStage Scheduler。
10. **是否需要新增機制**：基本版否；可編輯家庭相簿屬可選 R2。

### 聖誕節

<a id="design-hfr-christmas-01"></a>

#### hfr-christmas-01｜一歲需要禮物嗎（節日前）

1. **Event ID**：`hfr-christmas-01`。
2. **適用 AgeStage**：AS4（15 個月，約 1 歲）。
3. **生活情境**：看到交換禮物訊息，家人問要送什麼；孩子可能更喜歡紙袋，家庭也可能原本沒有過聖誕節。
4. **父母面臨的矛盾與隱形負擔**：想建立回憶，又不確定期待屬於誰；要回覆親友、協調重複禮物與有限空間。
5. **可能的玩家選擇**：把現有玩具包起來；約定只一起聽歌或散步；請願意的親友統整需求；說明今年不慶祝、不收禮。
6. **孩子與其他人物的反應**：孩子可能開心拆紙、很快離開或想睡；親友可能體諒、疑惑或不特別在意。
7. **可選的內心獨白**：「他現在需要的，也許只是有人坐在旁邊。」
8. **後續事件與家庭記憶**：接 `hfr-christmas-02` 的有禮／無禮版本；留下一歲的選擇，供 AS8 的 03 重訪時回想，不要求家庭從此過節。
9. **可沿用的現有遊戲機制**：EventNode、setFlags、Reaction、planningLoad、資源成本、Scheduler 與 relationshipMemories。
10. **是否需要新增機制**：否。

<a id="design-hfr-christmas-02"></a>

#### hfr-christmas-02｜紙袋比禮物好玩（當天至節後）

1. **Event ID**：`hfr-christmas-02`。
2. **適用 AgeStage**：AS4，承接 01。
3. **生活情境**：孩子沒有照大人想像拆禮物拍照，而是玩紙袋或黏著照顧者；沒準備禮物的家庭也可能度過一段普通的相處時光。
4. **父母面臨的矛盾與隱形負擔**：大人疲憊卻想留下「值得的」畫面，還要整理包裝、回覆親友與消化期待落差。
5. **可能的玩家選擇**：放下拍照陪玩；請另一位可用照顧者收拾、自己先休息；留一張普通照片就結束；不補辦任何儀式。
6. **孩子與其他人物的反應**：孩子可能在不用配合後更自在，也可能繼續哭累；親友可覺得紙袋片段有趣，或沒有特別回應。
7. **可選的內心獨白**：「沒有那張照片，這一天也有發生。」
8. **後續事件與家庭記憶**：記下「一起玩紙袋」或「早早休息」；AS8 的 03 可承接家庭是否談聖誕老人，不把未送禮寫成缺憾。
9. **可沿用的現有遊戲機制**：Reaction、energy、planningLoad 收尾、relationshipMemories、story history 與後續階段 flags。
10. **是否需要新增機制**：否。

<a id="design-hfr-christmas-03"></a>

#### hfr-christmas-03｜三歲開始等聖誕老人（節日當天）

1. **Event ID**：`hfr-christmas-03`。
2. **適用 AgeStage**：AS8（39 個月，約 3 歲）。
3. **生活情境**：孩子從故事或同伴聽到聖誕老人，睡前問他會不會來；未慶祝的家庭也可能收到這個問題。
4. **父母面臨的矛盾與隱形負擔**：想保留想像，又不願建立必須年年滿足的承諾；還得統一家人說法，疲憊時也要回應等待。
5. **可能的玩家選擇**：一起玩想像遊戲，說清楚禮物有不同來源；說明這是有人喜歡的故事；請可用照顧者接手睡前談話；維持不過節但接住好奇。
6. **孩子與其他人物的反應**：孩子可繼續幻想、追問或轉移注意；其他家人可配合，也可能需要另談，不以「乖才有禮物」交換服從。
7. **可選的內心獨白**：「我想陪他的想像，也想留下明年可以改變的空間。」
8. **後續事件與家庭記憶**：同階段以短反應／睡前記憶收束；AS11 的 04 可引用家人的說法。若無 01／02，也能獨立進入，不補造往事。
9. **可沿用的現有遊戲機制**：獨立入口 eligibility、對話 EventNode、Reaction、flags、planningLoad 協調敘事與跨階段 Scheduler。
10. **是否需要新增機制**：否；不建立聖誕老人信念值。

<a id="design-hfr-christmas-04"></a>

#### hfr-christmas-04｜五歲問為什麼同學收到比較多（當天至節後）

1. **Event ID**：`hfr-christmas-04`。
2. **適用 AgeStage**：AS11（61 個月，約 5 歲）。
3. **生活情境**：孩子聽同學分享禮物，問為什麼自己比較少、沒有收到，或為什麼家裡不慶祝。
4. **父母面臨的矛盾與隱形負擔**：面對預算與文化差異，父母也被比較刺痛；要決定解釋到哪裡，而不是臨時用消費補上焦慮。
5. **可能的玩家選擇**：承認羨慕並說明每家做法不同；重談家中可負擔的安排；讓可用照顧者一起回應；暫停談話，休息後再談，維持原本不送禮的決定。
6. **孩子與其他人物的反應**：孩子可能仍失落、理解一部分或想送人禮物；老師或家人可支持多種過法，也可能無意間繼續比較。
7. **可選的內心獨白**：「我也會羨慕，但不用把他的失望立刻買掉。」
8. **後續事件與家庭記憶**：記錄被聽見的失望；AS12 的 05 可延續「收到以外，也想送出」或重新談不送禮，不保證孩子因此立刻懂事。
9. **可沿用的現有遊戲機制**：Reaction pool、flags、relationshipMemories、repair／support 節點、planningLoad 與 Scheduler。
10. **是否需要新增機制**：否；不用禮物數量排行榜或家庭消費比較系統。

<a id="design-hfr-christmas-05"></a>

#### hfr-christmas-05｜六歲想替家人準備一份（節日前）

1. **Event ID**：`hfr-christmas-05`。
2. **適用 AgeStage**：AS12（71 個月，約 6 歲）。
3. **生活情境**：孩子想親手送家人一份禮物，列了許多人；家裡即使不過聖誕，也可把這當作自選的感謝行動或婉拒活動。
4. **父母面臨的矛盾與隱形負擔**：孩子的心意可能變成大人的材料採買、期限管理與代工；還要避免把記得所有人的工作全部交給孩子。
5. **可能的玩家選擇**：用現有材料只做一份；改成一句話或一起做件事；請願意的家人陪做並承接收尾；縮小名單或這次不做。
6. **孩子與其他人物的反應**：孩子可投入、半途玩別的或擔心有人沒收到；陪做者可接受不整齊，也可能想接手完成而需協調。
7. **可選的內心獨白**：「我想幫忙，但不想把他的心意變成我的作業。」
8. **後續事件與家庭記憶**：接 `hfr-christmas-06`，記住孩子想送給誰、採取哪種方式與由誰陪同；不要求完成全名單。
9. **可沿用的現有遊戲機制**：2–4 個選項的 EventNode、actorAvailable、flags、Scheduler、planningLoad 的協助／代工差異與人物記憶。
10. **是否需要新增機制**：基本版否；可操作的準備清單與整體交接屬可選 R1，不需製作小遊戲或物品庫。

<a id="design-hfr-christmas-06"></a>

#### hfr-christmas-06｜送出的東西歪歪的（當天至節後）

1. **Event ID**：`hfr-christmas-06`。
2. **適用 AgeStage**：AS12，承接 05。
3. **生活情境**：孩子拿出歪斜的卡片、說出一句感謝，或承認沒有做完；收禮的人不一定能立刻出現或給出期待中的反應。
4. **父母面臨的矛盾與隱形負擔**：想替孩子保護心意，又得克制代替他解釋；活動後仍有材料、寄送或轉達的工作。
5. **可能的玩家選擇**：讓孩子照自己的話送出；約另一時間轉達；停在未完成也接受；請原陪做者收尾，自己和孩子休息。
6. **孩子與其他人物的反應**：孩子可驕傲、害羞或因對方反應平淡失落；家人可能珍惜、忙到晚些回覆或只簡單道謝。
7. **可選的內心獨白**：「原來我們的節日，已經開始有他的提案。」
8. **後續事件與家庭記憶**：在本階段收束從一歲收禮到六歲送禮的變化；只引用真的發生過的往事。保留未完成的版本，不排到不存在的第十三階段。
9. **可沿用的現有遊戲機制**：Reaction、support／repair、relationshipMemories、story history、planningLoad 收尾與既有回顧資料來源。
10. **是否需要新增機制**：基本版否；若讓玩家挑選、命名或編輯紀念頁，屬可選 R2。

### 農曆春節

<a id="design-hfr-lunar-new-year-01"></a>

#### hfr-lunar-new-year-01｜誰去問今年怎麼團圓（節日前）

1. **Event ID**：`hfr-lunar-new-year-01`。
2. **適用 AgeStage**：AS4、AS8、AS11。
3. **生活情境**：家人詢問過年安排；AS4 需顧作息，AS8 想見特定親友，AS11 開始有自己的行程意見。也有家庭不返鄉或不過農曆年。
4. **父母面臨的矛盾與隱形負擔**：交通、聯絡、餐食與禮俗協調擠在一起；「兩邊都問一下」往往集中到同一人身上。
5. **可能的玩家選擇**：只安排一次短聚；請可用照顧者承接各方聯絡；改遠端問候或錯開聚會；今年不聚、不慶祝。
6. **孩子與其他人物的反應**：孩子可能期待或抗拒路程；親友可接受、提出替代方案、失望或沒有意見。
7. **可選的內心獨白**：「說大家都方便之前，誰先把每個人的不方便記住了？」
8. **後續事件與家庭記憶**：接同階段 `hfr-lunar-new-year-02` 的聚會／遠端／平日分支；記下協商者與安排，較大階段可以重新談。
9. **可沿用的現有遊戲機制**：EventNode、actorAvailable、Reaction、flags、Scheduler、planningLoad 與 timeFlexibility／finances 成本。
10. **是否需要新增機制**：基本版否；可由玩家管理多項聯絡與交接屬可選 R1，不做返鄉日曆。

<a id="design-hfr-lunar-new-year-02"></a>

#### hfr-lunar-new-year-02｜拜年一定要照那個方式嗎（節日當天）

1. **Event ID**：`hfr-lunar-new-year-02`。
2. **適用 AgeStage**：AS4、AS8、AS11，承接同階段 01 或獨立入口。
3. **生活情境**：親友希望孩子打招呼、合照或收紅包；AS4 想睡，AS8 不想被抱，AS11 想自己決定稱呼與祝福。不聚會者可收到視訊邀請。
4. **父母面臨的矛盾與隱形負擔**：維持關係、孩子身體界線與自己的疲憊同時拉扯；還要翻譯各方期待。
5. **可能的玩家選擇**：提供揮手或一句祝福的替代；由另一可用照顧者說明界線；縮短聚會或結束通話；婉拒互動、按原計畫休息。
6. **孩子與其他人物的反應**：孩子可能放鬆後主動靠近，也可能仍不想互動；親友可尊重、中性回應或抱怨，不能預設所有長輩都施壓。
7. **可選的內心獨白**：「我想讓他認識家人，也想讓他知道可以說不要。」
8. **後續事件與家庭記憶**：接 `hfr-lunar-new-year-03`，留下被支持或需要修復的片段；紅包不是服從獎勵，也不比較金額。
9. **可沿用的現有遊戲機制**：Reaction、anticipated judgment 的敘事區分、flags、support／repair、planningLoad 與 Scheduler。
10. **是否需要新增機制**：否。

<a id="design-hfr-lunar-new-year-03"></a>

#### hfr-lunar-new-year-03｜年過完，誰還在收尾（節日後續）

1. **Event ID**：`hfr-lunar-new-year-03`。
2. **適用 AgeStage**：AS4、AS8、AS11 的同階段後續。
3. **生活情境**：聚會後還有行李、剩食、回覆與作息調整；AS8 的孩子只記得一起貼紙，AS11 可能提出下次少跑一處。未聚會者也能談休息的感受。
4. **父母面臨的矛盾與隱形負擔**：「已經放過假」不表示照顧者恢復精力；要決定哪些禮俗繼續、哪些可以放下。
5. **可能的玩家選擇**：只處理必要收尾；請原安排者接回整理；和孩子各選一件想保留的事；先不檢討、不補聚會，留一天普通生活。
6. **孩子與其他人物的反應**：孩子可開心回想、想念親友或只想回家；其他家人可理解疲憊，也可能首次注意到收尾工作。
7. **可選的內心獨白**：「大家都回去了，節日還留在我的待辦裡。」
8. **後續事件與家庭記憶**：保存「這次短聚比較自在」等實際經驗；較大年齡的 01 可參考並允許推翻，不把一次協商變成永久規則。
9. **可沿用的現有遊戲機制**：planningLoad、energy、relationshipMemories、choiceHistory、flags 與跨階段 Scheduler。
10. **是否需要新增機制**：否；固定版本的傳承偏好用內容 flags 即可。

### 兒童節

<a id="design-hfr-childrens-day-01"></a>

#### hfr-childrens-day-01｜孩子的節日，誰的行程（節日前）

1. **Event ID**：`hfr-childrens-day-01`。
2. **適用 AgeStage**：AS6、AS8、AS11。
3. **生活情境**：活動廣告很多；AS6 只想去熟悉的地方，AS8 想出門，AS11 想自己安排。家長未必放假，也未必把這天當節日。
4. **父母面臨的矛盾與隱形負擔**：訂位、交通、工作調整與「應該給孩子特別一天」的期待交纏；免費活動也會消耗時間和精力。
5. **可能的玩家選擇**：選家附近的短活動；讓孩子從兩個可行方案選一個；請可用支持者陪伴並承接安排；當天照常生活，另找時間或不慶祝。
6. **孩子與其他人物的反應**：孩子可因有選擇而開心，也可能嫌普通；支持者可樂意接手、提出限制或無法配合。
7. **可選的內心獨白**：「我想給他一點特別，也需要把自己的體力算進去。」
8. **後續事件與家庭記憶**：接同階段 `hfr-childrens-day-02`；保留孩子自己的願望與大人可行的界線。
9. **可沿用的現有遊戲機制**：EventNode、actorAvailable、resource requirements、flags、Scheduler、Reaction 與 planningLoad。
10. **是否需要新增機制**：否。

<a id="design-hfr-childrens-day-02"></a>

#### hfr-childrens-day-02｜排了很久，他只想玩旁邊的水溝蓋（節日當天）

1. **Event ID**：`hfr-childrens-day-02`。
2. **適用 AgeStage**：AS6、AS8、AS11，承接同階段 01。
3. **生活情境**：原定活動人多、天氣變了，或孩子突然偏愛路邊小遊戲；照常生活的分支中，孩子提議玩十分鐘。
4. **父母面臨的矛盾與隱形負擔**：投入安排後很難放下，還需即時找替代、聯絡同行者，並承認自己已經累了。
5. **可能的玩家選擇**：放棄原行程玩眼前的小事；縮短等待並設離開界線；由同行者接手一段；回家休息，不另補一個活動。
6. **孩子與其他人物的反應**：孩子可能滿足、失望或仍堅持原活動；同行者可支持、無感或對變動不習慣。
7. **可選的內心獨白**：「我花時間安排的，和他今天需要的，原來可以不同。」
8. **後續事件與家庭記憶**：接 `hfr-childrens-day-03`，記錄實際的快樂與疲憊，原行程未完成也有故事。
9. **可沿用的現有遊戲機制**：environment／choice 節點、Reaction、energy／timeFlexibility、planningLoad 與 Scheduler。
10. **是否需要新增機制**：否；不用即時天氣或排隊模擬。

<a id="design-hfr-childrens-day-03"></a>

#### hfr-childrens-day-03｜他畫的那一天和你記得的不一樣（節日後續）

1. **Event ID**：`hfr-childrens-day-03`。
2. **適用 AgeStage**：AS6、AS8、AS11 的同階段後續。
3. **生活情境**：孩子用動作、畫或話重述那一天：AS6 模仿跳格子，AS8 畫回家的路，AS11 說最喜歡自己決定的一小段。
4. **父母面臨的矛盾與隱形負擔**：大人記得混亂與爭執，卻怕讓孩子知道自己累了；也可能被要求再做一份紀錄。
5. **可能的玩家選擇**：聽孩子說並分享自己的感受；請同行者一起回顧；只收下作品不整理；不做節日紀錄，回到日常。
6. **孩子與其他人物的反應**：孩子可提出新觀點或不想回顧；同行者可能補上溫暖片段，也可能同樣需要休息。
7. **可選的內心獨白**：「我們記得不同的部分，還是一起過了這一天。」
8. **後續事件與家庭記憶**：保存一個由孩子說出的具體片段；較大階段的 01 可問「這次還想這樣嗎」，不把回憶當下次的義務。
9. **可沿用的現有遊戲機制**：relationshipMemories、story history、flags、Reaction、planningLoad 與跨階段 Scheduler。
10. **是否需要新增機制**：否；作品先以文字敘事呈現。

### 母親節

<a id="design-hfr-mothers-day-01"></a>

#### hfr-mothers-day-01｜卡片上的稱呼可以改嗎（節日前）

1. **Event ID**：`hfr-mothers-day-01`。
2. **適用 AgeStage**：AS8、AS11。
3. **生活情境**：班級發下母親節活動通知，孩子問要送給誰；家裡的母親可能在場、缺席、不使用這個稱呼，或家庭不過此節。
4. **父母面臨的矛盾與隱形負擔**：要回覆學校、確認孩子想法與保護隱私；被感謝的人也可能成為準備自己慶祝活動的人。
5. **可能的玩家選擇**：由孩子選一位想感謝的照顧者與稱呼；請可用的其他成人承接活動聯絡；改為平日一句感謝；婉拒或不參與，不解釋私人原因。
6. **孩子與其他人物的反應**：孩子可安心、困惑或需要多問幾次；老師可能提供空白卡、尊重退出或需再溝通。
7. **可選的內心獨白**：「我希望他能表達心意，不必先證明我們家符合哪一張圖。」
8. **後續事件與家庭記憶**：接同階段 `hfr-mothers-day-02` 的家庭自定稱呼版本；記下誰承接準備，不預設母親本人負責。
9. **可沿用的現有遊戲機制**：EventNode、選項 flags、actorAvailable、Reaction、planningLoad 與 Scheduler；稱呼先用內容版本處理。
10. **是否需要新增機制**：否；不要求新增人物角色或家庭結構欄位。

<a id="design-hfr-mothers-day-02"></a>

#### hfr-mothers-day-02｜被感謝的人還在端菜（節日當天）

1. **Event ID**：`hfr-mothers-day-02`。
2. **適用 AgeStage**：AS8、AS11，承接同階段 01。
3. **生活情境**：孩子想送卡片或一起吃飯，被感謝的照顧者卻仍在找餐具、處理孩子需求；不慶祝者可能只收到一句話或照常過。
4. **父母面臨的矛盾與隱形負擔**：想接住孩子的心意，也想真的休息；開口要求交接本身又是一份管理工作。
5. **可能的玩家選擇**：直接說出需要哪段完整休息；請可用成人承接餐食與收尾；把聚餐簡化成現成食物或陪坐；取消慶祝，保留孩子自願的表達。
6. **孩子與其他人物的反應**：孩子可高興陪坐，也可能以為自己的心意不夠而需要澄清；其他成人可主動完成、只做一半或願意重談。
7. **可選的內心獨白**：「我喜歡這張卡，也想有一段不用隨時起身的時間。」
8. **後續事件與家庭記憶**：接 `hfr-mothers-day-03`，區分孩子的感謝與成人的照顧責任；孩子不用負責補足大人的休息。
9. **可沿用的現有遊戲機制**：Reaction、support／repair、actorAvailable、energy、planningLoad 與 Scheduler。
10. **是否需要新增機制**：否；責任交接先以情境選項與後續反應表達。

<a id="design-hfr-mothers-day-03"></a>

#### hfr-mothers-day-03｜節日過了，休息還算數嗎（節日後續）

1. **Event ID**：`hfr-mothers-day-03`。
2. **適用 AgeStage**：AS8、AS11 的同階段後續。
3. **生活情境**：卡片放在桌上，日常照顧又開始；AS8 問明天還能不能說謝謝，AS11 注意到平常誰在做哪些事。
4. **父母面臨的矛盾與隱形負擔**：一次被感謝不會自動改變分工；要不要再談、怎麼談、誰追蹤，仍會耗費力氣。
5. **可能的玩家選擇**：與可用成人談一項可持續交接；只保留這次回憶、不立新約；由支持者提案再確認；暫緩討論或今後不以此節安排活動。
6. **孩子與其他人物的反應**：孩子可模仿道謝或無感；其他成人可理解、需要磨合或尚未改變，不把孩子變成監督者。
7. **可選的內心獨白**：「我想留下的，不只是一年一天被看見。」
8. **後續事件與家庭記憶**：記錄實際協商而非保證改善；較大年齡的 01 可回顧誰主動想起，也能選擇新的做法。
9. **可沿用的現有遊戲機制**：relationshipMemories、flags、support／repair、planningLoad、choiceHistory 與跨階段 Scheduler。
10. **是否需要新增機制**：基本版否；若要持續追蹤責任人、提醒與交接狀態，屬可選 R1。

### 父親節

<a id="design-hfr-fathers-day-01"></a>

#### hfr-fathers-day-01｜誰記得替誰準備驚喜（節日前）

1. **Event ID**：`hfr-fathers-day-01`。
2. **適用 AgeStage**：AS8、AS12。
3. **生活情境**：孩子聽到父親節，AS8 問能否送畫，AS12 想策畫小驚喜；也可能沒有在場的父親，或不使用這個節日。
4. **父母面臨的矛盾與隱形負擔**：替另一位成人記得偏好、邀約與準備，容易變成固定照顧者的額外工作；缺席的角色也可能需要溫柔處理。
5. **可能的玩家選擇**：讓孩子選一個簡單表達；請願意的其他成人承接安排；改向孩子選擇的照顧者致意；不慶祝、也不要求孩子交代家庭情況。
6. **孩子與其他人物的反應**：孩子可開心、猶豫或不想做；老師／親友可接納改稱呼，接手者也可能無法幫忙。
7. **可選的內心獨白**：「這份心意可以很小，不必再由一個人把全部環節補齊。」
8. **後續事件與家庭記憶**：接同階段 `hfr-fathers-day-02`，帶入孩子選擇的對象與過法，不假設由媽媽代辦。
9. **可沿用的現有遊戲機制**：EventNode、actorAvailable、Reaction、flags、planningLoad 與 Scheduler。
10. **是否需要新增機制**：基本版否；可編輯準備項目與整體交接屬可選 R1。

<a id="design-hfr-fathers-day-02"></a>

#### hfr-fathers-day-02｜今天想一起做平常那件事（節日當天）

1. **Event ID**：`hfr-fathers-day-02`。
2. **適用 AgeStage**：AS8、AS12，承接同階段 01。
3. **生活情境**：孩子想和被感謝的照顧者一起修玩具、散步或讀書，對方可能要工作或已很累；未慶祝分支則照常相處。
4. **父母面臨的矛盾與隱形負擔**：孩子期待專屬時間，但「陪孩子」不該被寫成另一照顧者難得施恩；誰備物、誰顧其他事仍需協調。
5. **可能的玩家選擇**：只一起做十分鐘；改到雙方可行的時間；請可用支持者接一段其他工作；取消特別安排，以普通問候或不慶祝替代。
6. **孩子與其他人物的反應**：孩子可因熟悉的陪伴快樂，也可能對延期失望；被感謝者可投入、坦白疲憊或提議替代，不保證每次都溫馨。
7. **可選的內心獨白**：「他想要的，是一起做那件普通的小事。」
8. **後續事件與家庭記憶**：接 `hfr-fathers-day-03`；留下實際陪伴或延期的約定，不把父親身份等同賺錢或偶爾玩耍。
9. **可沿用的現有遊戲機制**：Reaction、timeFlexibility／energy、Scheduler、flags、relationshipMemories 與 planningLoad。
10. **是否需要新增機制**：否。

<a id="design-hfr-fathers-day-03"></a>

#### hfr-fathers-day-03｜卡片背面的日常（節日後續）

1. **Event ID**：`hfr-fathers-day-03`。
2. **適用 AgeStage**：AS8、AS12 的同階段後續。
3. **生活情境**：孩子說畫裡的人在陪睡、煮飯或接送；也可能說不出熟悉片段，或提醒上次延期的約定。
4. **父母面臨的矛盾與隱形負擔**：成人可能感動，也可能對未參與感到尷尬；需要承認差距，避免由另一人再替他補辦關係。
5. **可能的玩家選擇**：聽孩子說、不替對方美化；由相關成人自行重約一件可行的小事；讓支持者陪談；只收下卡片或結束節日話題。
6. **孩子與其他人物的反應**：孩子可被聽見、仍失落或很快去玩；相關成人可道歉、主動安排或暫時沒有回應。
7. **可選的內心獨白**：「被記得的，常常是每天做的那一些。」
8. **後續事件與家庭記憶**：保存日常照顧、缺席或修復的真實片段；AS8 可在 AS12 重訪 01，AS12 則在本階段收束，不自動宣告關係改善。
9. **可沿用的現有遊戲機制**：relationshipMemories、support／repair、Reaction、flags、planningLoad 與有效階段內的 Scheduler。
10. **是否需要新增機制**：否。

### 端午節

<a id="design-hfr-dragon-boat-01"></a>

#### hfr-dragon-boat-01｜粽子不一定要自己包（節日前）

1. **Event ID**：`hfr-dragon-boat-01`。
2. **適用 AgeStage**：AS5、AS9、AS12。
3. **生活情境**：親友邀包粽或送來節物；AS5 好奇葉子，AS9 問為什麼過節，AS12 想學家人的一個步驟。家庭也可能沒有這項傳統。
4. **父母面臨的矛盾與隱形負擔**：備料、聯絡、保存與收拾被「一起動手很有意義」遮住；又怕拒絕像在拒絕親情。
5. **可能的玩家選擇**：只參與一小段；請願意的親友承接備料到收尾；用現成食物或只聽故事；不參與、不收節物也不補活動。
6. **孩子與其他人物的反應**：孩子可只喜歡摸葉子、想多問或沒有興趣；親友可樂意分享、尊重拒絕或有些失落。
7. **可選的內心獨白**：「我想留下的是一起做的感覺，不一定是整套工序。」
8. **後續事件與家庭記憶**：接同階段 `hfr-dragon-boat-02` 的自做／現成／無活動版本，記下準備與收尾的承接人。
9. **可沿用的現有遊戲機制**：EventNode、actorAvailable、Reaction、flags、Scheduler、planningLoad 與資源成本。
10. **是否需要新增機制**：基本版否；可操作的準備清單與責任追蹤屬可選 R1。

<a id="design-hfr-dragon-boat-02"></a>

#### hfr-dragon-boat-02｜孩子只想問那艘船（節日當天）

1. **Event ID**：`hfr-dragon-boat-02`。
2. **適用 AgeStage**：AS5、AS9、AS12，承接同階段 01 或獨立入口。
3. **生活情境**：看到龍舟影像、香包或家人談傳統；AS5 想模仿划船，AS9 連問原因，AS12 對不同家庭的過法產生好奇。
4. **父母面臨的矛盾與隱形負擔**：父母未必知道完整故事，也可能不認同某些習俗；在疲憊中承接好奇，不想硬把活動變成課程。
5. **可能的玩家選擇**：坦白不知道，留待一起找答案；請願意的家人講自己的版本；只陪孩子模仿一會；結束活動休息，保留不過節的選擇。
6. **孩子與其他人物的反應**：孩子可滿足、繼續問或跑去玩；家人可能喜歡分享，也可能說「我們家以前沒有這樣過」。
7. **可選的內心獨白**：「我不必什麼都知道，才能和他一起好奇。」
8. **後續事件與家庭記憶**：接 `hfr-dragon-boat-03`，留下家庭自己的版本；不把某種民俗寫成所有家庭必須遵從的標準。
9. **可沿用的現有遊戲機制**：對話／routine EventNode、Reaction、flags、planningLoad 與 Scheduler；故事為內容，不新增教學系統。
10. **是否需要新增機制**：否。

<a id="design-hfr-dragon-boat-03"></a>

#### hfr-dragon-boat-03｜留下香包，還是留下那句話（節日後續）

1. **Event ID**：`hfr-dragon-boat-03`。
2. **適用 AgeStage**：AS5、AS9、AS12 的同階段後續。
3. **生活情境**：節物與材料需要整理；AS5 仍愛那片葉子，AS9 記得親友講的片段，AS12 想決定下次是否保留某個習慣。
4. **父母面臨的矛盾與隱形負擔**：保存節物、安排歸還與決定傳承內容，都可能落回同一人；「明年再做」也可能變成沒人討論過的義務。
5. **可能的玩家選擇**：保留一件小物或一句故事；請原承接者收尾；回收材料、不留紀念；明確說下次再決定，或不延續。
6. **孩子與其他人物的反應**：孩子可珍惜、捨不得或毫不在意；親友可接受只保留一部分，也可能需要時間理解。
7. **可選的內心獨白**：「傳下去的，也可以是我們有權選擇。」
8. **後續事件與家庭記憶**：AS5／AS9 的較大年齡 01 可引用這次偏好，AS12 本階段收束；不因一次參與鎖定永久儀式。
9. **可沿用的現有遊戲機制**：relationshipMemories、flags、story history、planningLoad 收尾、Reaction 與 Scheduler。
10. **是否需要新增機制**：否；不需節物庫存或配方系統。

### 中秋節

<a id="design-hfr-mid-autumn-01"></a>

#### hfr-mid-autumn-01｜團圓可以不用湊成一桌（節日前）

1. **Event ID**：`hfr-mid-autumn-01`。
2. **適用 AgeStage**：AS3、AS8、AS11。
3. **生活情境**：收到賞月、聚餐或烤肉邀約；AS3 的孩子容易累，AS8 想玩到晚，AS11 想見朋友。家庭可能分隔多地或沒有慶祝習慣。
4. **父母面臨的矛盾與隱形負擔**：要協調場地、餐食、作息與不能到場的人；團圓的期待可能掩蓋交通和輪班限制。
5. **可能的玩家選擇**：安排住處附近短暫賞月；由可用親友承接聚會；改短通話或白天相見；不聚、不補辦，照常休息。
6. **孩子與其他人物的反應**：孩子可期待、嫌太短或願意換玩法；親友可支持、想念或提出不同安排。
7. **可選的內心獨白**：「想念是真的，今天沒有力氣也是真的。」
8. **後續事件與家庭記憶**：接同階段 `hfr-mid-autumn-02` 的戶外／室內／平日版本，帶入聯絡與分工結果。
9. **可沿用的現有遊戲機制**：EventNode、actorAvailable、Reaction、flags、Scheduler、planningLoad 與 timeFlexibility／energy。
10. **是否需要新增機制**：基本版否；可互動的邀約與責任清單屬可選 R1。

<a id="design-hfr-mid-autumn-02"></a>

#### hfr-mid-autumn-02｜月亮沒有出來（節日當天）

1. **Event ID**：`hfr-mid-autumn-02`。
2. **適用 AgeStage**：AS3、AS8、AS11，承接同階段 01。
3. **生活情境**：雲遮住月亮，孩子先累了或家人無法到場；AS3 想被抱，AS8 問月亮去哪，AS11 失望於朋友沒來。未過節者可能也在窗邊停一下。
4. **父母面臨的矛盾與隱形負擔**：花力氣安排仍無法保證畫面，還需回應孩子和親友的落空；父母也有自己的期待。
5. **可能的玩家選擇**：在室內說個故事就結束；請同行者帶孩子一會、自己休息；傳一句問候給不在的人；承認失望，今天不另找替代活動。
6. **孩子與其他人物的反應**：孩子可喜歡新故事、想哭或很快睡著；家人可安慰、一起失望或只是安靜陪伴。
7. **可選的內心獨白**：「沒有看到月亮，還是有這一小段一起坐著。」
8. **後續事件與家庭記憶**：接 `hfr-mid-autumn-03`，記下實際相處或休息的片段，不必補出一張團圓照。
9. **可沿用的現有遊戲機制**：environment 節點、Reaction、flags、energy、planningLoad 與 Scheduler。
10. **是否需要新增機制**：否；天氣只是事件情境，不建立氣象系統。

<a id="design-hfr-mid-autumn-03"></a>

#### hfr-mid-autumn-03｜誰把團圓收進冰箱（節日後續）

1. **Event ID**：`hfr-mid-autumn-03`。
2. **適用 AgeStage**：AS3、AS8、AS11 的同階段後續。
3. **生活情境**：聚餐後有剩餘食物、器具與訊息；沒聚餐的家庭可能只聊昨晚的通話。孩子記得的可能是紙盤上的圓，而非月亮。
4. **父母面臨的矛盾與隱形負擔**：整理與分送食物延長節日工作；還要消化「下次應該辦更好」的壓力。
5. **可能的玩家選擇**：請原承辦者完成整理；只做必要收尾、其餘延後；向親友說下次少準備；不再追加分享或補聚會。
6. **孩子與其他人物的反應**：孩子可幫一小步或只想玩；親友可同意減量，也可能這才發現準備太多。
7. **可選的內心獨白**：「團圓散場後，能有人一起收尾，也是一種團圓。」
8. **後續事件與家庭記憶**：留下實際支持與需要調整之處；較大階段的 01 可提出新的規模，孩子過去喜歡的玩法也能改變。
9. **可沿用的現有遊戲機制**：planningLoad、support、relationshipMemories、choiceHistory、flags 與跨階段 Scheduler。
10. **是否需要新增機制**：否；不需食物保存模擬。

### 孩子的生日

<a id="design-hfr-birthday-01"></a>

#### hfr-birthday-01｜這次生日是誰先想起來（生日之前）

1. **Event ID**：`hfr-birthday-01`。
2. **適用 AgeStage**：AS4、AS8、AS12；代表這些成長階段的生日篇章，不宣稱是精確生日日期。
3. **生活情境**：AS4 的生日多由大人定義，AS8 的孩子想邀朋友，AS12 想自己決定。照顧者發現每次都是自己先記得詢問與安排。
4. **父母面臨的矛盾與隱形負擔**：除了買不買蛋糕，還有詢問意願、聯絡、時間、預算與拍照；一次辦得熱鬧可能變成往後的隱性基準。
5. **可能的玩家選擇**：只做孩子選的一件小事；請可用照顧者承接完整安排；用既有材料或日常食物簡單紀念；不辦生日活動，仍表達關心或由孩子選擇不特別提。
6. **孩子與其他人物的反應**：孩子可很期待、想法常變或不想成為焦點；親友可支持簡化、想幫忙或需要調整原本預期。
7. **可選的內心獨白**：「我想記得他的生日，也想有人記得這件事不是自動發生的。」
8. **後續事件與家庭記憶**：接同階段 `hfr-birthday-02`，帶入規模、孩子意願與承接人；較大年齡重訪時重新詢問，不把過去偏好當承諾。
9. **可沿用的現有遊戲機制**：EventNode、flags、actorAvailable、Reaction、planningLoad、choiceHistory 與 Scheduler。
10. **是否需要新增機制**：基本版否；能編輯的準備清單、責任與完成狀態屬可選 R1，不建立生日日期系統。

<a id="design-hfr-birthday-02"></a>

#### hfr-birthday-02｜唱歌時他不想站中間（生日當天）

1. **Event ID**：`hfr-birthday-02`。
2. **適用 AgeStage**：AS4、AS8、AS12，承接同階段 01。
3. **生活情境**：AS4 被歌聲嚇到，AS8 不想被拍，AS12 臨時改主意不邀人；簡單過或不辦的分支也可能遇到親友臨時提議唱歌。
4. **父母面臨的矛盾與隱形負擔**：孩子的界線與大人的投入、親友期待碰撞；父母得在眾人面前改流程，自己也可能委屈。
5. **可能的玩家選擇**：停止唱歌或拍照，問孩子想怎麼做；請可用照顧者向親友說明；縮成一對一祝福；結束活動，不要求補拍或補吹蠟燭。
6. **孩子與其他人物的反應**：孩子可安心、仍生氣或晚點才想分享；親友可尊重、尷尬、疑惑或無反應，並非必然批評。
7. **可選的內心獨白**：「我有一點失落，也可以先讓他不用勉強。」
8. **後續事件與家庭記憶**：接 `hfr-birthday-03`，保留「我們有停下來聽」或仍待修復的片段；活動完成度不決定生日價值。
9. **可沿用的現有遊戲機制**：Reaction、flags、support／repair、energy／connection 的情境效果、planningLoad 與 Scheduler。
10. **是否需要新增機制**：否；不需派對成功度或社交表現評分。

<a id="design-hfr-birthday-03"></a>

#### hfr-birthday-03｜再大一歲，想留下哪一小段（生日後續）

1. **Event ID**：`hfr-birthday-03`。
2. **適用 AgeStage**：AS4、AS8、AS12 的同階段後續。
3. **生活情境**：生日過後整理照片、訊息或剩下的材料；AS4 的回憶由成人描述，AS8 說自己最喜歡的片段，AS12 想挑選或拒絕留下某張照片。沒辦活動也有日常片段可留。
4. **父母面臨的矛盾與隱形負擔**：保存成長足跡也可能成為沒完沒了的工作；大人想留住的畫面未必是孩子想被記住的樣子。
5. **可能的玩家選擇**：各說一句話就收束；讓孩子挑一段、成人承接整理；只記在生活紀錄不對外分享；不保存額外紀念，先休息。
6. **孩子與其他人物的反應**：孩子可珍惜普通小事、想刪一張或沒有興趣；親友可理解不分享，也可能需再次提醒界線。
7. **可選的內心獨白**：「他長大一點，也開始能說自己想怎麼被記得。」
8. **後續事件與家庭記憶**：AS4／AS8 可讓較大階段的 01 回看真實選擇；AS12 收入本局回顧。保留照顧者的疲憊、孩子的快樂與未修復之處，不要求完美結局。
9. **可沿用的現有遊戲機制**：relationshipMemories、story history、choiceHistory、flags、planningLoad 與既有回顧資料來源；不分享可由選項直接敘述。
10. **是否需要新增機制**：基本版否；可讓玩家／孩子挑選、命名或隱藏紀念頁的互動能力屬可選 R2。

### 可能新增機制：Future Proposal，待審查

R1 的新功能是「玩家可編輯、逐項追蹤的任務清單」，不是既已規劃的完整責任承接敘事。R2 的新功能是「遊玩中持續編輯／命名／隱藏紀念頁」；Spec 原已規劃的結局三個 key moments 選擇與調整不歸為新機制，也不重複提案。

以下 R1、R2 均為 Future Proposal，尚未核准；相關候選仍是 Idea／Unassigned，Future Proposal 不代表已列入未來發布。基本版依賴以管理索引的 C0／P5–P8 為準。30 個構想的基本敘事版都能沿用現有設計契約；「需要完成已規劃的 Scheduler／Reaction／planningLoad 能力」與「需要新增機制」分開處理。本次不新增 Schema、程式碼或 Tickets，也不將下表視為核准。

| 候選 | 涉及事件 | 現有機制可先做到 | 若希望更深入，才考慮新增 | 審查問題 |
| --- | --- | --- | --- | --- |
| <a id="r1-proposal"></a>R1：可編輯的儀式準備與責任交接（Future Proposal） | `hfr-halloween-01`、`hfr-christmas-05`、`hfr-lunar-new-year-01`、`hfr-mothers-day-03`、`hfr-fathers-day-01`、`hfr-dragon-boat-01`、`hfr-mid-autumn-01`、`hfr-birthday-01` | 用選項／flags 記錄誰先想起、誰承接；用 planningLoad 與後續事件呈現提醒、漏接、收尾。按 AgeStage 手寫下一篇，不自動每年重複。 | 若要玩家增刪待辦、逐項分派聯絡／執行／收尾，並跨階段追蹤承接、催促、完成與重新議定，需持久化任務狀態及對應互動。既有 actor initiative／workflowOwnership 只是角色特性，不能等同這套逐項追蹤能力。觸發仍限定 AgeStage。 | 是否先以固定內容表達長期的「記得」負擔，待有需求再讓清單可操作？ |
| <a id="r2-proposal"></a>R2：玩家可編輯的家庭紀念頁（Future Proposal） | `hfr-halloween-03`、`hfr-christmas-06`、`hfr-birthday-03` | 以既有 relationshipMemories／story history 保存選定文字版本，回顧引用實際發生的片段；照片、卡片先以敘事表達。 | 若要互動挑選、命名、隱藏紀念頁，或讓孩子在長大後要求更改留存內容，需編輯／可見性狀態與介面。這不等同既有記憶紀錄，也不含真實照片上傳或對外分享。 | 是否有必要讓玩家操作紀念頁，或文字記憶已足夠承載成長感？ |

**未核定的驗證建議（不是 MVP 名單或實作指令）**：先用聖誕節的 AS4→AS8→AS11→AS12 驗證同一節日的期待變化，再選一條三段鏈驗證準備與收尾負荷。較晚階段的事件也應能獨立進入；未曾發生的往事不用回憶補造。R1／R2 都可延後，完整年度 Calendar System 不在此次範圍。

<a id="mg-series"></a>

## 多代同住與隔代教養｜情境草案

新增兩個子分類：Multigenerational Living & Parenting Boundaries、Intergenerational Caregiving & Daily Routines。來源為本輪使用者提供的 10＋8 項題材；以下是 Idea 草案，不構成 Designed／Ready，也不替未來 EventNode 預先指派 ID。既有原題與節日詳細內容均保留。

### 家庭結構、支持與安全原則

- 出場依實際家庭、actorAvailable 與當次同住／定期托育／探訪情境；「公婆」保留為來源用語，敘事可使用自己的父母、伴侶父母、祖父母或其他已有長輩，不預設玩家性別、婚姻或一定同住。
- 區分「祖父母協助父母」與「祖父母承擔主要日常照顧」；後者也有疲憊、可承擔範圍和與父母協調的需要。不把長輩寫成全天候可用的免費支援，也不把父母缺席當作失職。
- 長輩可以詢問、理解、提出有效提醒、願意改變，也可以疲憊或仍有顧慮；Reaction pool 不把祖父母角色固定綁定 criticism。孩子的失望不代表玩家做錯，支持不以無條件服從父母換取。
- 有可用伴侶時，明確分支為「主動承接自己原生家庭的聯絡、確認與後續交接」「只說會談但需催促」「以好意迴避」。單一照顧者、不在場父母或無可用伴侶的家庭，改由當事人直接協調、可用支持者或減量，不憑空安排伴侶。
- 隱形負擔涵蓋：觀察孩子、整理需求、查證資訊、聯絡、提醒、跟進、安撫成人與安排替代；委派只有實際承接後才可減輕追蹤敘事。其他照顧者的勞動也要可見，沒有唯一正確話術。
- **食物安全先分支**：已知過敏、安全限制、不適齡或合適性未明的食物，不與份量、時機、餐桌儀式、一般螢幕偏好放在同一組妥協選項。前者只呈現停止該食物、改已確認合適的替代或先確認而本次不提供等可行路徑；不能選「試一口換和氣」，也不以花費或讓長輩開心獎勵風險。
- 安全／適齡判斷須在內容條件中明確定義，不由長輩身份、孩子開心程度或資源高低推定。本文不提供過敏閾值、食物年齡表或症狀處理指令；要加入具體健康建議、診療或安全知識卡，仍須依 Spec／Issue #10 查證可靠來源並標示審查狀態。安全版本不能因來源尚未完成就公開為一般教養建議。
- 一般偏好可重談或縮小；孩子表達不想吃、已吃飽與不想被抱應被聽見，不用討好大人作為服從獎勵。衣著與整理頭髮的場景可接受有用提醒，若孩子實際不舒服應回應，而不是為了反駁長輩維持原做法。

### 18 項來源題材與去重處理

本次新增 13 筆管理紀錄，5 項來源情境併為變體；「關聯 18 項」表示全部需求均有既有題材對照，不是再增加 18 筆。所有原始 GDD 題名與編號保留。第一組／第二組中的序號僅為需求對照，只有 Backlog ID 計入總數。

#### 第一組：多代同住與教養界線（10 項）

子分類：Multigenerational Living & Parenting Boundaries。

| 需求 | 使用者題材 | Backlog ID／穩定變體 ID | 處理 | 既有關聯 | 保留差異 |
| --- | --- | --- | --- | --- | --- |
| M01 | 孩子一哭，公婆就立即介入 | [`mgl-boundary-01`](#mgl-boundary-01) | 新增 | [`bl-gdd-043`](#bl-gdd-043)、[`bl-gdd-075`](#bl-gdd-075)、[`bl-gdd-098`](#bl-gdd-098) | 哭鬧的場域與照顧權交接不同於捷運哭鬧；保留親屬介入這個焦點。 |
| M02 | 孩子睡著了，長輩為了讓客人看而想叫醒孩子 | [`mgl-boundary-02`](#mgl-boundary-02) | 新增 | [`bl-gdd-016`](#bl-gdd-016)、[`bl-gdd-088`](#bl-gdd-088)、[`bl-gdd-098`](#bl-gdd-098) | 客人期待與孩子作息的衝突，不等同夜醒安撫。 |
| M03 | 孩子穿短袖被質疑會不會冷 | [`bl-gdd-065`](#bl-gdd-065)；<a id="var-mgl-short-sleeves"></a>`var-mgl-short-sleeves` | 併入變體 | [`bl-gdd-065`](#bl-gdd-065)、[`bl-gdd-098`](#bl-gdd-098) | 與既有穿著評論共用候選；新增短袖／怕冷的具體對話。 |
| M04 | 孩子穿長袖又被質疑會不會熱 | [`bl-gdd-065`](#bl-gdd-065)；<a id="var-mgl-long-sleeves"></a>`var-mgl-long-sleeves` | 併入變體 | [`bl-gdd-065`](#bl-gdd-065)、[`bl-gdd-098`](#bl-gdd-098) | 與 M03 共用候選，保留改了衣著又被評論的連續負擔。 |
| M05 | 幫孩子綁頭髮被評論太緊 | [`mgl-boundary-03`](#mgl-boundary-03) | 新增 | [`bl-gdd-065`](#bl-gdd-065)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098) | 聚焦孩子舒適感、身體感受與被評論的照顧操作；與衣著評論關聯但不合併。 |
| M06 | 孩子哭著找父母，長輩卻堅持自己抱 | [`mgl-boundary-04`](#mgl-boundary-04) | 新增 | [`bl-gdd-058`](#bl-gdd-058)、[`bl-gdd-075`](#bl-gdd-075)、[`bl-gdd-098`](#bl-gdd-098) | 孩子已表達想找誰，與單純偏好某位照顧者或不肯叫人不同。 |
| M07 | 父母說不行，祖父母卻說可以 | [`bl-gdd-076`](#bl-gdd-076)；<a id="var-mgl-permission"></a>`var-mgl-permission` | 併入變體 | [`bl-gdd-068`](#bl-gdd-068)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098) | 保留原始教養界線題名；新增跨代不一致的情境與協商對象。 |
| M08 | 長輩認為以前的育兒方式才正確 | [`mgl-boundary-05`](#mgl-boundary-05) | 新增 | [`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098) | 聚焦世代經驗、被否定感及經驗能否調整，不只是一項規則不同。 |
| M09 | 伴侶以「他們也是好意」迴避協調 | [`mgl-boundary-06`](#mgl-boundary-06) | 新增 | [`bl-gdd-068`](#bl-gdd-068)、[`bl-gdd-072`](#bl-gdd-072)、[`bl-gdd-076`](#bl-gdd-076) | 迴避原生家庭溝通與等待指示做家務的責任位置不同。 |
| M10 | 長輩提供托育協助，卻同時不斷干涉照顧方式 | [`mgl-boundary-07`](#mgl-boundary-07) | 新增 | [`bl-gdd-020`](#bl-gdd-020)、[`bl-gdd-087`](#bl-gdd-087)、[`bl-gdd-098`](#bl-gdd-098) | 關注照顧支援與決定權的拉扯；與幫忙後增加整理工作不同。 |

#### 第二組：隔代教養與生活習慣（8 項）

子分類：Intergenerational Caregiving & Daily Routines。

| 需求 | 使用者題材 | Backlog ID／穩定變體 ID | 處理 | 既有關聯 | 保留差異 |
| --- | --- | --- | --- | --- | --- |
| I01 | 長輩說「吃一點點沒關係」 | [`bl-gdd-059`](#bl-gdd-059)；<a id="var-igc-small-bite"></a>`var-igc-small-bite` | 併入變體 | [`bl-gdd-006`](#bl-gdd-006)、[`bl-gdd-059`](#bl-gdd-059)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098) | 保留偷偷餵糖原題；新增公開勸說變體，並區分安全限制與一般偏好。 |
| I02 | 孩子不想吃，卻被要求「吃一口給阿嬤看」 | [`igc-routine-01`](#igc-routine-01) | 新增 | [`bl-gdd-004`](#bl-gdd-004)、[`bl-gdd-059`](#bl-gdd-059)、[`bl-gdd-098`](#bl-gdd-098) | 以讓長輩開心作為進食理由，不同於單純拒吃某種蔬菜。 |
| I03 | 孩子表示吃飽了，長輩仍持續勸吃 | [`igc-routine-02`](#igc-routine-02) | 新增 | [`bl-gdd-004`](#bl-gdd-004)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098) | 孩子表達飽足，與不喜歡菜色或尚未想吃的情境不同。 |
| I04 | 長輩追著離開餐桌的孩子餵飯 | [`igc-routine-03`](#igc-routine-03) | 新增 | [`bl-gdd-004`](#bl-gdd-004)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098) | 增加餐桌移動、追餵與大人執行負擔，保留具體生活流程。 |
| I05 | 長輩開電視讓孩子邊看邊吃 | [`igc-routine-04`](#igc-routine-04) | 新增 | [`bl-gdd-004`](#bl-gdd-004)、[`bl-gdd-057`](#bl-gdd-057)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098) | 餐中協助方式與公共場合暫用手機的環境及目的不同。 |
| I06 | 父母不在時，長輩私下開電視給孩子看 | [`igc-routine-05`](#igc-routine-05) | 新增 | [`bl-gdd-059`](#bl-gdd-059)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098) | 聚焦不在場時的照顧交接與信任；與餐中是否看電視分開。 |
| I07 | 父母提醒螢幕使用原則，長輩認為太嚴格 | [`igc-routine-06`](#igc-routine-06) | 新增 | [`bl-gdd-068`](#bl-gdd-068)、[`bl-gdd-076`](#bl-gdd-076)、[`bl-gdd-098`](#bl-gdd-098) | 對可行照顧方式的分歧是具體螢幕情境，與偷偷開電視的違約／未說清不同。 |
| I08 | 長輩以「幫你帶孩子還有這麼多規矩」回應照顧要求 | [`mgl-boundary-07`](#mgl-boundary-07)；<a id="var-igc-help-rules"></a>`var-igc-help-rules` | 併入跨組變體 | [`bl-gdd-020`](#bl-gdd-020)、[`bl-gdd-068`](#bl-gdd-068)、[`bl-gdd-087`](#bl-gdd-087)、[`bl-gdd-098`](#bl-gdd-098) | 與 M10 共用「協助與界線」候選，保留受惠壓力與規則被質疑的對話；不另建重複紀錄。 |


### 反覆情境與協調結果：沿用既定能力

- 以 EventNode eligibility、flags、eventCompleted、relationshipMemories 和 choiceHistory 區分「尚未說清」「已談但沒確認」「已確認一版」「已修訂」「下次實際表現」；這些是內容分支示意，不是新增 Schema 欄位。
- 不把「伴侶答應會說」記成「長輩已同意」；實際確認、主動詢問、仍需提醒或遇到新困難，分別留下不同記憶與 planningLoad 敘事。關係可以有支持、反覆與修復，不能永久標記某人是壞長輩。
- Scheduler 依後續 Turn／AgeStage 安排「下一次照顧」；不讀取真實日期，不建立 Calendar System。先前未發生的協調不能補造，沒有角色可用時可略過／改用合法分支。
- 用有限次變體、事件完成條件、maxVisits／cooldown 與節點預算保護重訪。flags 目前是累積記錄，不能假設可覆寫或清除：可用有順序的版本旗標，讓較新版本的條件優先、舊版在新版存在時不再進入。這是待 P6／P8 落地的內容設計，不是假設引擎已完成。
- 每次重訪是同一 Backlog 候選的另一個有限內容節點／版本，不新增候選計數；將來才為可執行 EventNode 指派各自 ID。不要用未受限的自我循環模擬永遠發生的家庭爭執。
- 已有 C0 契約可描述基本版；實際多 Turn、排程、Reaction 和負荷／記憶效果依賴 P5–P8，屬 Planned Dependency。固定協調旗標和後續反應不需要新增「長輩服從度」「信任值」或關係勝負分數。

### 未來 MVP 選題目標：至少一條完整多代事件鏈

依本輪方向，未來 MVP 30 個 EventNode 的候選遴選應至少包含一條「發生界線落差 → 承接溝通 → 下次照顧驗證」的完整多代鏈，優先評估 CH-MG-02。這是本檔記錄的選題目標；未核定具體節點名單，不修改 Spec／Issue #10，也不把相關候選改標 MVP。

例：在一般偏好或已排除風險的飲食版本中，由 bl-gdd-059／igc-routine-01／02 擇一發生落差 → mgl-boundary-06 的伴侶主責，或合法的當事人直接協調分支 → 下一次祖父母照顧時重訪同候選變體，觀察主動詢問、依約調整、仍有誤會或需要減量；具體支持可銜接 bl-gdd-098，反覆落差可銜接 mgl-boundary-07。安全限制版本從頭到尾維持安全選項，不能用關係改善抵銷風險。

完整鏈可先按 3–4 個內容節點、至少跨兩個 Turn 規劃；每 Turn 仍最多 4 節點，每 AgeStage 最多 6 節點，若反應／支持另拆節點必須一起計入。不是把上述所有候選全數串入，也不保證同局遇到所有重訪。遴選與驗收須檢查不同家庭結構、確實的伴侶主責／無伴侶替代、先前協調影響後續，以及長輩理解和未立即改善兩種合法方向，避免只做單次批評。

### 可選新機制判斷

本系列基本版不提出必需 New Mechanism；沿用既有 C0 與待完成的 P5–P8。若未來要求玩家自由編輯照顧原則、逐項指派責任並追蹤完成，才另評估既有 R1 Future Proposal 的適用範圍，不在此次新增提案或改寫 R1 名單。R2 也維持 Future Proposal。本次沒有事件被標為必須新增機制才能落地，不需要食物過敏模擬器、每日作息引擎或多名孩子成長系統。

### 候選情境、選擇、人物反應與後續

以下每個小節對應一筆候選；多個來源情境共用候選時，保留不同台詞與前因，不把變體當新增事件。AgeStage 都是草案候選；原始 GDD 題材本身仍未正式指定年齡。

<a id="design-mg-mgl-boundary-01"></a>

#### mgl-boundary-01｜孩子一哭，長輩就立即介入

- **Backlog ID／來源**：[`mgl-boundary-01`](#mgl-boundary-01)；需求 M01；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Multigenerational Living & Parenting Boundaries；AS1、AS4、AS8（變體候選，待審查）。
- **生活情境**：父母正嘗試安撫，長輩急著抱走或指揮；也可能先問「要我幫什麼？」。同住、探訪或交接時都可出現。
- **矛盾與隱形負擔**：照顧者一邊安撫，一邊解釋正在做什麼；每次都要守住處理空間，支持也可能變成被接管。
- **可能的玩家選擇**：請長輩先陪在旁邊；明確交接一段安撫並約定何時接回；請可用伴侶說明由誰主責；先移到較安靜處再談。
- **孩子與其他人物反應**：孩子可能被熟悉的人接住後安心，也可能更想原照顧者；長輩可體諒、詢問分工、覺得被拒絕或無特別回應。
- **伴侶／家庭結構分支**：有伴侶時可主動說明自己家人的分工，或只說「他們也是擔心」而留下追蹤負擔；無伴侶時由玩家直接交接或請已有支持者陪談。
- **反覆情境、後續與記憶**：下一次哭鬧時，先前若說清楚「先問再抱」，可出現詢問後接手的變體；若只暫停衝突，則仍需協調。可接 [`mgl-boundary-06`](#mgl-boundary-06) 或 [`bl-gdd-098`](#bl-gdd-098)，孩子哭不作為長輩必然介入的規則。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-mgl-boundary-02"></a>

#### mgl-boundary-02｜孩子睡著了，客人還想看一眼

- **Backlog ID／來源**：[`mgl-boundary-02`](#mgl-boundary-02)；需求 M02；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Multigenerational Living & Parenting Boundaries；AS1、AS4、AS8（變體候選，待審查）。
- **生活情境**：家中或探訪處有客人，長輩想叫醒孩子打招呼；也可能先替孩子擋下邀請，讓客人等下次。
- **矛盾與隱形負擔**：安排訪客、守住休息、事後重新安撫與向親友解釋，都可能留給同一人；父母也想維持關係。
- **可能的玩家選擇**：說明讓孩子繼續睡、改下次見面；用不打擾孩子的方式接待客人；請可用伴侶承接客人的說明；縮短這次探訪。
- **孩子與其他人物反應**：孩子可繼續睡而沒有反應；若之前已被吵醒，可能需要安撫。長輩可理解、失落或轉而幫忙接待，不把叫醒當必然發生。
- **伴侶／家庭結構分支**：伴侶可自行聯絡自己的親友、接待及收尾；也可口頭附和卻仍讓玩家解釋。沒有伴侶或不與長輩同住時，改用當次探訪中的可用成人。
- **反覆情境、後續與記憶**：記住有沒有先問父母與訪客安排由誰處理；下次來客時可出現提前約好時段或仍臨時要求的版本，接 [`bl-gdd-098`](#bl-gdd-098) 的尊重反應或 [`mgl-boundary-07`](#mgl-boundary-07) 的協調。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-bl-gdd-065"></a>

#### bl-gdd-065｜穿短袖怕冷，換長袖又怕熱

- **Backlog ID／來源**：[`bl-gdd-065`](#bl-gdd-065)；需求 M03、M04；Status＝Idea，ReleaseScope＝Unassigned。保留 GDD 原始題名，以上標題為本次情境版本。
- **Category／AgeStage**：Multigenerational Living & Parenting Boundaries；AS4、AS8、AS11（變體候選，待審查）。
- **生活情境**：同一候選保留短袖被問會不會冷、長袖又被問會不會熱兩個變體；家人也可能先問孩子自己的感受。
- **矛盾與隱形負擔**：父母要反覆解釋衣物選擇，調整後仍被評論；負擔不只換衣，也包括持續證明自己有注意。
- **可能的玩家選擇**：詢問能表達的孩子是否舒服、再決定是否調整；先說明已考量並停止反覆辯論；請可用伴侶統一回應；帶替換衣物但不承諾每個評論都要改。
- **孩子與其他人物反應**：孩子可說出感受、對換衣不耐或不在意；長輩可接受、協助拿衣服或仍擔心。若孩子有實際不適，回應不適，不為了反駁而忽略。
- **伴侶／家庭結構分支**：伴侶可主動向自己的家人說明，也可能要玩家一再提醒；單一照顧者可縮短對話，無須交代不存在的另一位父母。
- **反覆情境、後續與記憶**：下一次評論先讀先前是否已約定「先問孩子、由當次照顧者判斷」；短袖→長袖的期待落差可串成兩次有限的變體，保留 [`bl-gdd-065`](#bl-gdd-065) 題名和一筆總數。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-mgl-boundary-03"></a>

#### mgl-boundary-03｜綁頭髮時，誰先問孩子舒不舒服

- **Backlog ID／來源**：[`mgl-boundary-03`](#mgl-boundary-03)；需求 M05；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Multigenerational Living & Parenting Boundaries；AS6、AS8、AS11（變體候選，待審查）。
- **生活情境**：父母幫孩子整理頭髮，長輩評論綁太緊；孩子可能真的拉扯頭髮，也可能覺得舒服，評論未必全是挑剔。
- **矛盾與隱形負擔**：要分辨有用提醒與反覆被檢視的壓力，同時處理出門時間；不能只為維護面子忽略孩子感受。
- **可能的玩家選擇**：先問或觀察孩子、需要時重綁；邀請願意的長輩協助並說清楚方式；請可用伴侶接出門安排、自己整理；這次不綁，改簡單整理。
- **孩子與其他人物反應**：孩子可能放鬆、拒絕被再碰頭髮或想自己選；長輩可提出有用協助、理解不重綁的決定或仍不放心。不限孩子性別或固定髮型。
- **伴侶／家庭結構分支**：伴侶可擋下連續評論並承接時間壓力，也可能讓玩家同時解釋與趕出門；無伴侶分支仍可自行簡化。
- **反覆情境、後續與記憶**：下一次以曾經詢問孩子的經驗重訪；對方可能改成先問，父母也能承認上次提醒有幫助。與 [`bl-gdd-065`](#bl-gdd-065) 關聯，但保留照顧操作及孩子身體感受的焦點。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-mgl-boundary-04"></a>

#### mgl-boundary-04｜孩子找父母，長輩還不想放手

- **Backlog ID／來源**：[`mgl-boundary-04`](#mgl-boundary-04)；需求 M06；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Multigenerational Living & Parenting Boundaries；AS2、AS4、AS8（變體候選，待審查）。
- **生活情境**：孩子哭著伸手找熟悉照顧者，長輩希望自己哄好，擔心交回去像是不被信任；也可在聽見孩子後主動交接。
- **矛盾與隱形負擔**：父母要接住孩子，又怕讓幫忙的人難堪；被迫反覆爭取抱回孩子的空間，並處理長輩失落。
- **可能的玩家選擇**：接回孩子並簡短說明現在的需要；讓長輩在旁做另一項可行協助；請可用伴侶完成交接說明；先結束這次互動，晚點再談。
- **孩子與其他人物反應**：孩子可安心、仍哭或過一會才願意靠近長輩；長輩可尊重、感到失落或提出下次先問，不把孩子反應當長輩是否稱職的分數。
- **伴侶／家庭結構分支**：伴侶可主動回應自己的家人「先交回來」，也可能要求玩家遷就而延長負擔；沒有伴侶時不顯示求伴侶出面。
- **反覆情境、後續與記憶**：先前若約定「孩子找誰就協助交接」，下次由對方主動交回可形成 [`bl-gdd-098`](#bl-gdd-098) 支持片段；若未落實，進入重新協調而非永久敵對。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-bl-gdd-076"></a>

#### bl-gdd-076｜父母說不行，祖父母說可以

- **Backlog ID／來源**：[`bl-gdd-076`](#bl-gdd-076)；需求 M07；Status＝Idea，ReleaseScope＝Unassigned。保留 GDD 原始題名，以上標題為本次情境版本。
- **Category／AgeStage**：Multigenerational Living & Parenting Boundaries；AS4、AS8、AS11（變體候選，待審查）。
- **生活情境**：同一件日常安排，兩位成人給了不同答覆，孩子不知道聽誰的；可能是沒有交接清楚，也可能是已知約定被改動。
- **矛盾與隱形負擔**：父母需要收拾孩子期待落差、避免當眾互相否定，還要釐清先前到底有沒有共識；孩子不負責替成人傳話。
- **可能的玩家選擇**：先依已知安排接住孩子、成人稍後私下確認；針對一般偏好協商一個可執行版本；請可用伴侶向自己的家人說明；先暫停該活動，資訊清楚再決定。
- **孩子與其他人物反應**：孩子可能失望、追問或對說法一致鬆口氣；祖父母可承認沒聽到、願意改，也可能仍認為有例外。安全限制不進入「輪流答應」的協商。
- **伴侶／家庭結構分支**：伴侶可承接說明、確認與下次交接，或只叫雙方別計較；無伴侶時使用直接協調／現有支持者分支。
- **反覆情境、後續與記憶**：用「未說清楚／已同意／已修訂／仍待確認」的有限內容旗標決定下次敘事；可接 [`mgl-boundary-06`](#mgl-boundary-06)、[`igc-routine-06`](#igc-routine-06) 或 [`bl-gdd-098`](#bl-gdd-098)，保留原始 #76 而非另立同題。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-mgl-boundary-05"></a>

#### mgl-boundary-05｜「以前都這樣帶」背後想被聽見的經驗

- **Backlog ID／來源**：[`mgl-boundary-05`](#mgl-boundary-05)；需求 M08；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Multigenerational Living & Parenting Boundaries；AS4、AS8、AS11（變體候選，待審查）。
- **生活情境**：長輩拿過去經驗說明自己的做法，父母感到被否定；也可能是對方不知道現在的安排，想分享曾有效的方法。
- **矛盾與隱形負擔**：父母要比較建議、解釋選擇，又要承接「是不是嫌我以前帶不好」的情緒；不把專業查證工作默認交給某個性別。
- **可能的玩家選擇**：先聽一段經驗再說明本次需要；邀請一起確認可靠資訊、先不採用未釐清方式；請可用伴侶承接與自家長輩的對話；暫停爭辯，保留已明確的安全界線。
- **孩子與其他人物反應**：長輩可覺得被尊重後願意調整、分享有用細節或仍不認同；孩子可察覺緊張、繼續玩或問為何大人說法不同。
- **伴侶／家庭結構分支**：伴侶主動確認背景與後續交接，或以好意為由迴避，會影響誰持續查資料和提醒；沒有伴侶也能縮小這次協商範圍。
- **反覆情境、後續與記憶**：下次照顧時可能出現「我試了你們說的方式」或仍沿舊習的版本，承接 [`igc-routine-02`](#igc-routine-02)／06；改變記為具體行動，不只一句和解。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-mgl-boundary-06"></a>

#### mgl-boundary-06｜「他們也是好意」之後，誰去協調

- **Backlog ID／來源**：[`mgl-boundary-06`](#mgl-boundary-06)；需求 M09；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Multigenerational Living & Parenting Boundaries；AS4、AS8、AS11（變體候選，待審查）。
- **生活情境**：照顧方式出現落差，伴侶用「他們也是好意」結束話題；另一版本是伴侶先理解雙方，再自行向自己的家人聯絡。
- **矛盾與隱形負擔**：玩家除了照顧，還得整理事實、教伴侶如何開口、提醒聯絡與追蹤；好意不會自動完成交接。
- **可能的玩家選擇**：請伴侶承接一次完整的聯絡、確認與回報；約定一起談且由對方主責；這次由自己直接說、明確留下負荷；暫縮照顧安排，等能協調時再談。
- **孩子與其他人物反應**：伴侶可理解並行動、口頭答應但拖延或提出自己的顧慮；長輩可願意討論、需要時間或先主動詢問。孩子可在場玩或表達需要，不當成人調解者。
- **伴侶／家庭結構分支**：只在伴侶存在且可聯絡時出現本候選的伴侶分支；無伴侶家庭改走相關事件的直接協調或支持者路線，不硬生成伴侶。原生家庭指雙方各自的家人，不預設公婆／媳婦角色。
- **反覆情境、後續與記憶**：下次照顧前分成「已聯絡且確認／只說會談／仍未談」；只有實際確認過才引用共識，後續仍容許長輩有自己的理解與反應。可接 [`igc-routine-01`](#igc-routine-01)／05 或 [`mgl-boundary-07`](#mgl-boundary-07)。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-mgl-boundary-07"></a>

#### mgl-boundary-07｜有人幫忙帶，也能談照顧界線嗎

- **Backlog ID／來源**：[`mgl-boundary-07`](#mgl-boundary-07)；需求 M10、I08；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Multigenerational Living & Parenting Boundaries；AS4、AS8、AS11（變體候選，待審查）。同時參與 Intergenerational Caregiving & Daily Routines 子分類。
- **生活情境**：同一候選含 M10「提供托育卻持續干涉」與 I08「幫你帶還有這麼多規矩」兩種情境：前者著重決定權，後者著重協調時的受惠與委屈。
- **矛盾與隱形負擔**：父母怕失去現有支援而難開口；長輩也可能真的疲累、覺得工作超出可承擔範圍。誰安排替代、減量與追蹤也有成本。
- **可能的玩家選擇**：把必要安全限制與可協商偏好分開，縮小照顧工作；請可用伴侶承接自家聯絡及下一次交接；在可用資源內改為較短時段或其他支持；暫停該項委派、不答應以安全換支援。
- **孩子與其他人物反應**：孩子可喜歡陪伴、對變動不習慣或無感；長輩可說明負荷、接受精簡、提出替代或暫時無法幫忙，不把設界線固定寫成失去支持。
- **伴侶／家庭結構分支**：伴侶可主動聯絡並承接替代安排，也可能只要求玩家忍耐；單一照顧者可直接談、減量，替代人力須真的存在且可用。祖父母做主要日常照顧時，也能主動提出可承擔範圍。
- **反覆情境、後續與記憶**：下次交接時看是否真的減量、先問再改或仍需提醒；支持和疲憊可並存。跨兩個子分類共用一筆紀錄，不讓 I08 另增加總數。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-bl-gdd-059"></a>

#### bl-gdd-059｜「吃一點點沒關係」：偏好與安全要先分開

- **Backlog ID／來源**：[`bl-gdd-059`](#bl-gdd-059)；需求 I01；Status＝Idea，ReleaseScope＝Unassigned。保留 GDD 原始題名，以上標題為本次情境版本。
- **Category／AgeStage**：Intergenerational Caregiving & Daily Routines；AS4、AS8、AS11（變體候選，待審查）。
- **生活情境**：在原本「偷偷餵糖」候選下，加入公開說「吃一點點沒關係」的變體。場景先區分已確認合適食物的一般偏好，以及有已知安全限制或資訊未明的版本。
- **矛盾與隱形負擔**：父母需要說明、確認食物資訊、交接限制並追蹤是否被遵守；重複被要求證明安全界線，與一般份量偏好的協商不同。
- **可能的玩家選擇**：一般偏好版本可說明維持安排、協商合適的時機／方式、或由可用伴侶接續說明；安全／資訊未明版本只提供停止該食物、換已確認合適的替代、先確認而本次不提供、或請可用成人共同說明等分支。
- **孩子與其他人物反應**：孩子可對沒拿到食物失望，也可能接受替代；長輩可理解、先詢問、提供替代或仍疑惑。安全版本不把勉強試一口寫成獲得好感的選項。
- **伴侶／家庭結構分支**：伴侶可主動交接限制與確認理解，或只說自己家人知道了；無伴侶時由當次照顧者直接說明，不假設所有父母在現場。
- **反覆情境、後續與記憶**：下一次由同一位可用長輩照顧時，可先詢問、依約替代、仍不清楚或出現未遵守的版本；轉 [`mgl-boundary-06`](#mgl-boundary-06)／07 協調，再以 [`bl-gdd-098`](#bl-gdd-098) 記錄具體尊重。保留偷偷餵糖與公開勸說的差別。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-igc-routine-01"></a>

#### igc-routine-01｜「吃一口給阿嬤看」是誰的期待

- **Backlog ID／來源**：[`igc-routine-01`](#igc-routine-01)；需求 I02；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Intergenerational Caregiving & Daily Routines；AS4、AS8、AS11（變體候選，待審查）。
- **生活情境**：孩子不想吃，長輩把吃一口連到表達親近或讓自己開心；也可能聽見孩子意思後改成陪坐。
- **矛盾與隱形負擔**：父母需同時接住孩子拒絕與長輩的失落，把關係期待從進食要求移開；另一位成人可能把協調視為掃興。
- **可能的玩家選擇**：回應孩子不想吃並停止以人情勸食；邀長輩用聊天或陪坐表達親近；請可用伴侶說明不讓孩子負責大人情緒；暫停這段互動、晚點再談。
- **孩子與其他人物反應**：孩子可鬆口氣、仍不想坐或之後自願想吃；長輩可理解、改為陪伴或需要時間接受。不能把孩子自願吃寫成唯一成功結局。
- **伴侶／家庭結構分支**：伴侶可自行向自己的長輩解釋，也可能叫孩子配合一下；單一照顧者可直接設界線，祖父母主照顧時可由其主動改變勸食話語。
- **反覆情境、後續與記憶**：下次用餐依之前是否協調，出現先問孩子、改用其他互動或仍用人情勸食的版本；可接 [`mgl-boundary-06`](#mgl-boundary-06) 與 [`bl-gdd-098`](#bl-gdd-098)，重點是行為有沒有改變。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-igc-routine-02"></a>

#### igc-routine-02｜孩子說飽了，桌上還有人繼續勸

- **Backlog ID／來源**：[`igc-routine-02`](#igc-routine-02)；需求 I03；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Intergenerational Caregiving & Daily Routines；AS4、AS8、AS11（變體候選，待審查）。
- **生活情境**：孩子已表達吃飽，長輩擔心吃得不夠而繼續勸；另一版本是願意先停下來，詢問既有用餐安排。
- **矛盾與隱形負擔**：父母要回應對食量的擔心，又不想每餐都成為監督者；可能還要向不同照顧者重複解釋。
- **可能的玩家選擇**：接住飽足表達、結束這次勸食；和長輩確認擔心點，另找時間討論；請可用伴侶承接後續交接；簡化同桌互動，稍後再談。
- **孩子與其他人物反應**：孩子可安心離席、因被反覆問而煩躁或主動說想留哪個食物；長輩可放下擔心、願意觀察或仍疑惑，不以當餐多吃多少作為成效分數。
- **伴侶／家庭結構分支**：伴侶可主動記住共識並在下餐先說明，或只當場附和；無伴侶家庭不需代替不存在的人維持一致。
- **反覆情境、後續與記憶**：下一餐依共識是否確認、是否修訂，出現「先問是否還要」或仍勸吃；支持可留成記憶，落差可接 [`mgl-boundary-07`](#mgl-boundary-07) 重談可行流程。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-igc-routine-03"></a>

#### igc-routine-03｜孩子離開餐桌，照顧者還端著碗

- **Backlog ID／來源**：[`igc-routine-03`](#igc-routine-03)；需求 I04；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Intergenerational Caregiving & Daily Routines；AS4、AS6、AS8（變體候選，待審查）。
- **生活情境**：孩子離席後，長輩端碗跟著走，覺得不追就沒有吃到；也可能說追餵很累，希望一起換個流程。
- **矛盾與隱形負擔**：父母除了用餐規則，還要理解追餵者已付出的時間；停下舊方式可能需要重新安排陪伴與收尾。
- **可能的玩家選擇**：停止追餵，確認孩子這次是否還要在餐桌用餐；與長輩一起簡化流程並分擔收尾；請可用伴侶承接說明與下一餐協助；先結束這次用餐互動，晚點談。
- **孩子與其他人物反應**：孩子可不想回來、願意坐回或只是要休息；長輩可鬆口氣、覺得過去努力被否定或願意試新方式，不保證馬上配合。
- **伴侶／家庭結構分支**：伴侶可真的接一餐與收尾，或只要求長輩換做法而沒承接工作；單一照顧者則選擇自身可行的簡化，不假設有免費人力。
- **反覆情境、後續與記憶**：下次以實際分工是否落實作變體；長輩可能先問需不需要陪坐，或又因疲累回到舊習，接 [`mgl-boundary-05`](#mgl-boundary-05)／07 或支持記憶。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-igc-routine-04"></a>

#### igc-routine-04｜電視一開，這頓飯比較容易嗎

- **Backlog ID／來源**：[`igc-routine-04`](#igc-routine-04)；需求 I05；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Intergenerational Caregiving & Daily Routines；AS6、AS8、AS11（變體候選，待審查）。
- **生活情境**：長輩開電視幫孩子用餐，父母的習慣不同；長輩也可能先說明自己當天很累，詢問能不能調整安排。
- **矛盾與隱形負擔**：父母需協商可行替代，又不想只新增規矩而沒有人承接陪伴；長輩的執行負荷也需被看見。
- **可能的玩家選擇**：依已說清楚的安排關閉電視並由可用成人接續陪伴；在一般偏好範圍重談雙方做得到的版本；請伴侶承接這餐與後續溝通；減少照顧工作、另約時間協調。
- **孩子與其他人物反應**：孩子可抗議、適應新流程或對轉換無感；長輩可願意試、提出限制或需要時間。螢幕安排不直接產生好壞父母分數，也不藉此交換不合適食物。
- **伴侶／家庭結構分支**：伴侶主動談替代並接一餐，或只叫玩家別管，會留下不同負荷；無伴侶時只能採現有支持與可行減量。
- **反覆情境、後續與記憶**：下餐依先前約定，出現先詢問、仍沿舊習或共同找到簡單陪伴的版本；與 [`igc-routine-05`](#igc-routine-05) 的不在場交接、06 的原則分歧互相關聯，不合成單一批評場景。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-igc-routine-05"></a>

#### igc-routine-05｜父母不在時，電視又開了

- **Backlog ID／來源**：[`igc-routine-05`](#igc-routine-05)；需求 I06；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Intergenerational Caregiving & Daily Routines；AS4、AS8、AS11（變體候選，待審查）。
- **生活情境**：交接後才知道孩子看了電視；可能是先前沒說清楚、照顧者遇到困難，或已理解約定卻私下改動。不把孩子當監視或告密工具。
- **矛盾與隱形負擔**：父母要還原情境、確認安排與重建信任，還要決定下次如何托育；孩子不能負責證明誰對誰錯。
- **可能的玩家選擇**：向照顧長輩直接確認當時情況；請可用伴侶承接自家聯絡及下次交接；重新談一般偏好與可行替代；在資源允許下縮短或暫停這項委派。
- **孩子與其他人物反應**：孩子可自然分享、對成人緊張困惑或不願再談；長輩可說明困難、主動承認變動、願意先問或仍不認同。
- **伴侶／家庭結構分支**：伴侶可先了解再完整回報，也可能把查證與提醒丟回玩家；單一照顧者用直接協調或實際可用支持者，不要求缺席父母必須到場。
- **反覆情境、後續與記憶**：下次照顧時，以「未曾說清／已確認／已重談／仍待協調」走不同敘事；可出現主動回報、守約或仍落差，不保證一次對話修復信任，也不新設信任量表。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。

<a id="design-mg-igc-routine-06"></a>

#### igc-routine-06｜照顧原則被說太嚴格，還能怎麼談

- **Backlog ID／來源**：[`igc-routine-06`](#igc-routine-06)；需求 I07；Status＝Idea，ReleaseScope＝Unassigned。
- **Category／AgeStage**：Intergenerational Caregiving & Daily Routines；AS4、AS8、AS11（變體候選，待審查）。
- **生活情境**：父母提醒螢幕使用安排，長輩覺得做不到或限制太多；也可能先詢問具體需要，而不是全面反對。
- **矛盾與隱形負擔**：把原則轉成可執行做法、找替代、理解照顧者限制與追蹤，全都需要時間；父母也可重新檢視一般偏好是否過細。
- **可能的玩家選擇**：把一般偏好縮成少數可行安排；一起想替代並分擔照顧工作；請可用伴侶主責與自家協商；若仍不合適，減量或暫停委派，保留必要安全限制。
- **孩子與其他人物反應**：長輩可理解、提出合理調整、先試一次或仍有顧慮；孩子可對新安排開心、失落或無感。不同家庭做法不被排成教養高低。
- **伴侶／家庭結構分支**：伴侶可主動承接原生家庭聯絡與後續確認，或只叫玩家放寬；無伴侶與祖父母主照顧家庭也保留直接談需求的路線。
- **反覆情境、後續與記憶**：下一次照顧前確認新版本，而不是引用過時安排；若對方願意先問、提出替代或真的分擔，留下 [`bl-gdd-098`](#bl-gdd-098) 的具體支持；若仍落差則接 [`mgl-boundary-07`](#mgl-boundary-07)，不直接懲罰關係。
- **機制相容性**：Content Only（C0 可描述）；Planned Dependency（P5、P6、P7、P8）；Optional New Mechanisms＝—。採用有限旗標、Scheduler、Reaction、planningLoad 與記憶的共同規則，不宣稱可立即執行。
