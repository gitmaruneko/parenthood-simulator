# Issue #42：家庭條件事件擴充｜第一階段規格與審查

> 使用者已核准對應固定鏈、narrative契約及87節點基準。本文保留規劃階段紀錄；相容落地、每局支持／規劃保證及08A試玩實作範圍，以[試玩切片紀錄](../implementation/ISSUE-42-08A-SLICE.md)為準。
狀態：**第一階段規格，已依審查修訂；事件鏈／結果／版本以[設計決議第二版](ISSUE-42-DESIGN-DECISIONS-V2.md)為準，待確認後才實作**。2026-11-01；基準 commit `87bdb47c7dd9e68619b5e74e9e6aa2e1a086108c`。

本次只產出及退修文件，沒有修改正式遊戲、加入 EventNode、改動候選追蹤狀態或發布內容。家庭組裝及legacy分流方向已獲使用者採用；逐局兩鏈及一般結果契約依第二版具體提案確認。

## 來源與閱讀順序

- [Issue #42 原始驗收](https://github.com/gitmaruneko/parenthood-simulator/issues/42)：本次讀取本文，open、0 comments；實作前須確認矩陣、配額、內容審查及相容策略。
- [候選矩陣與 Journal 樣稿](../planning/ISSUE-42-CANDIDATE-MATRIX.md)：36 個新入口提案、12 個既有入口逐項審查。
- [143 筆逐項去重盤點](../planning/ISSUE-42-BACKLOG-AUDIT.csv)：保留每筆母題、來源、原 Status／ReleaseScope、對應候選與未選原因。
- 產品依據：[GDD](../GDD.md) §4–10、[MVP Content](../MVP_CONTENT.md)、[Event Backlog](../EVENT_BACKLOG.md)、[家庭開場](../FAMILY_OPENING.md)、[人物檔案](../ACTOR_PROFILES.md)、[Journal](../JOURNAL.md)、[重大抉擇](../DECISION_DIALOG.md)。
- 技術依據：[Event Engine](../EVENT_ENGINE.md)、[存檔](../PERSISTENCE.md)、[生活方向決議](../FAMILY_LIFE_DIRECTION_IMPLEMENTATION.md) 及以下實際原始碼。根目錄無 GLOSSARY.md／docs/adr，未補造。

| 原始碼證據 | 本次使用的事實 |
| --- | --- |
| [內容工廠](../../src/content/mvp.ts)、[題材](../../src/content/mvp-topics.ts)、[Journal文案](../../src/content/mvp-journal.ts) | 33節點、每階段單一根、固定選項模板及兩條鏈 |
| [Schemas](../../src/domain/schemas.ts)、[條件判斷](../../src/engine/conditions.ts) | 家庭三維度、沒有家庭enum條件、actorAvailable語意及storyEntries類別限制 |
| [家庭生成](../../src/engine/family-opening.ts)、[人物](../../src/engine/actor-profiles.ts) | 獨立抽取維度、真實成員、既有身分與親屬解析 |
| [引擎](../../src/engine/event-engine.ts)、[Reaction](../../src/engine/reactions.ts) | 穩定抽選、可能續抽其他根、場景可用性及排程優先序 |
| [內容驗證](../../src/domain/content-validation.ts) | 圖引用／required可達性、stages順序驗證 |
| [存檔](../../src/persistence/save-format.ts)、[Session](../../src/ui/player-session.ts) | save v7、目前無內容發布版本路由、重建MVP包 |

## Issue #42 驗收對應與本次邊界

| 原驗收面向 | 本次交付／後續證據 |
| --- | --- |
| 矩陣、配額、審查、版本策略先確認 | 本規格＋候選矩陣；全部待確認，不宣告核准 |
| 每階段至少兩個實際可執行入口 | A／B共24個通用根設計；正式包完成後以48配置實跑驗證 |
| 家庭配置對照 | 每階段C條件及單維度反例；固定seed/rngState對照方法 |
| 缺席人物及內容平衡 | 人物／回覆契約、36筆Journal、E逐項風險與四主調配額 |
| 沿用引擎與4／6預算 | 原生排程／抽選＋內容組裝提案；入口互斥及逐路徑配額 |
| 固定seed、頻率、事前容差 | 4096語料規則／摘要、完整cell數、p與容差、報告欄位 |
| 同版本確定性、重排、save/restore | legacy／新包分流、完整trace與checkpoint比較；尚待實作 |
| schema／引用／可達、四家庭、歷史保護 | 六檔既有基線通過；新包／新格式的證據屬後續工作 |
| 未確認節日／隔代包獨立核定 | 143筆逐項盤點，43筆系列維持Idea／Unassigned |

## 問題與預期體驗

玩家應記得「鞋帶纏在袋口」「洗好卻忘記晾的圍兜」「孩子想把自己的作品留在門邊」，而不只是記得又填了一張分工問卷。人物的存在、可用程度與實際回覆影響故事；工作安排改變會遇到的事，分工安排改變記憶工作落在哪裡。家庭型態不是好壞結局的代碼。

本方案每階段提出兩個不依賴其他成人到場的入口 A／B，以及一個有家庭條件的入口 C。共 **36 個新入口提案**。另保留既有 12 個入口 E，機械上各算一個，但不把其自動節點、修復選擇、反應池或四個 daily 模板灌入一般入口數。A／B 確保所有支援情境在初次進入階段時至少兩個可執行故事，C 提供真實候選差異；舊內容是否計入不影響最低覆蓋成立。

玩家故事：能在無伴侶時仍有完整故事；能遇見支持而非只有衝突的長輩；能看見伴侶可靠的具體行動而非無證據的保證；能在不花錢、不委派的路線做有意義選擇；能從 Journal 看出自己選了什麼、已發生什麼、什麼仍待回覆；能續玩和重播自己的原版故事。

## 既有內容及 143 筆盤點結論

`createMvpContent` 現為 33 節點＝12 入口 choice＋12 reflection＋兩鏈各4額外節點＋1 fallback。每階段 entryEventIds 只有一個 choice；第1／8階段 reconnect 雖有選擇，屬固定鏈，不能算第二入口。`daily-journal` 的四個零效果模板也不是入口。

Backlog 管理索引共143筆＝GDD100＋節日30＋多代界線7＋隔代日常6；本次逐筆對照題名、來源、既有題材關聯，並讀取系列的狀態／機制界線。新增矩陣採母 Backlog ID 下的年齡／情境變體，**沒有建立新的母題 ID，也沒有把 143 改成 179**。一個候選可有數個母題來源，關聯不表示全部設計已採納。

節日30筆與多代／隔代13筆仍為 Idea／Unassigned，全部維持範圍未定；GDD內已存在的長輩支持題材可以提出新變體，但不藉此核准整個隔代內容包。Backlog 的 P5–P8「尚待完成」是歷史盤點描述；目前程式已提供生命週期、排程、Reaction、記憶能力，不能照舊文推斷引擎缺少它們。

## 家庭資料與接入決議（方向已採用，能力尚待實作）

目前 FamilyProfile 為三個獨立 enum：3 householdComposition × 4 careParticipation × 4 workArrangement＝48組。生成器會獨立抽取，不能自行排除看似不典型的組合，例如 singleCaregiver＋dualIncome 或 singleCaregiver＋shared；收入來源不等於同住照顧者。四種產品基準家庭是測試樣本，不是只有四種合法狀態。

實際生成角色：singleCaregiver 有 child-1、不同住 support-1；twoCaregivers 有 child-1、caregiver-2；multigenerational 三者都有。persistentActorIds 是權威；ContentPack 裡補齊的預覽 actor 不能當成該家庭成員。不得新增手足、另一位祖父母、同住親友或重抽姓名來補劇情。暫時人物只用現有 teacher／colleague／stranger 角色，且在對應場景出現。

**技術缺口**：Condition union 沒有家庭 enum 比對；一般 eligibility／choice 的 actorAvailable 只查家庭成員身分。Reaction 內才使用抽到的場景 availability。contextTag／location 是事件標記，不是家庭或實際在場證據；workflowOwnership 目前也沒有直接條件讀取能力。

建議在內容組裝邊界接受已保存的 FamilyProfile 與 actors，依矩陣 C 的三維度條件組裝該 run 的一般 entryEventIds，保留完整節點／引用目錄；之後仍由既有引擎做 eligibility、冷卻、可執行選項、方向權重及 seeded 抽選。組裝不消耗 PRNG，依穩定 ID 輸出，不由 UI 藏選項；families 在本版不會中途變更，故組裝一次即可。不要用衍生 flags 冒充持久家庭事實，也不要在引擎複製另一套抽選器。

這是**尚待實作的內容組裝能力**，不是宣稱現有工廠已支援家庭三維度。實作時所有候選根仍有原生 eligibility（去重／互斥、必要人物存在）；對有必要人物要求的C，若persistentActorIds無該成員就略過，保留A／B；矩陣明列成人只影響可選詢問的C仍可用兩個基本選項。若存檔宣告成員卻找不到該release的actor定義，則拒絕還原，不靜默略過錯誤。完整內容包須通過目前可達性驗證；若非入池 C 成為圖外節點，另用完整作者目錄驗證所有變體，再對實際組裝包驗證 reachable／requiredEventIds 的正確集合，不把驗證錯誤關掉。替代方案是增加窄範圍 family 條件至 Condition，但它會擴及 schema 與存檔條件驗證；本階段不選擇這條路。

具體地說，作者目錄驗證時所有根列入entry／required；組裝包的**頂層與各AgeStage entryEventIds都過濾**，required只含該配置根及其可達固定後續與fallback。events仍保留完整引用目錄，使互斥條件引用的非入池根不成為missing reference。不能只改AgeStage卻保留頂層所有根，讓靜態可達性檢查看似通過；各變體的實際可達性仍要用引擎逐一證明。

## 配額與 4／6 節點預算（第二版取代原69方案）

採第1／8階段各候選有對應固定鏈，維持**每局**兩條跨Turn鏈，不改成內容包可達能力。原33節點＋36新根＋六個新根各3固定後續＝**87節點基準**，不是已核准的硬上限。新鏈Turn1根＋fallback＝2；Turn2重訪＋choice＋收束＋fallback＝4；Stage6。E原鏈3＋3＝6。其他新根仍為2節點，普通E3節點。所有後續不列一般入口。

根互斥以同階段其他根的eventNotCompleted處理，repeatable=false；後續不受該互斥。每個新鏈根在節點層無條件排delayTurns=1，不依選項、Reaction或成人回覆。沿用immediate／Scheduler／普通入口優先序、方向權重、冷卻及fallback。一般結果正文／Reaction不計EventNode，不用新增節點湊Journal。

方案成本比較、兩條鏈的結構性證明、六組後續場景、最後fallback預算及正式命令域見[第二版§1](ISSUE-42-DESIGN-DECISIONS-V2.md#1-事件鏈比較並選定對應固定鏈)。不以固定seed測過就宣稱逐局保證；提前取消queue或COMPLETE_AGE_STAGE不屬正常遊戲流程。原「零新增後續／69上限／放寬逐局要求」已撤回。

## 敘事品質審查規則

每個矩陣候選定義物件／時間壓力、人物與資格、2–3種行動、行動結果、Journal樣稿。至少兩個選項無資源門檻且不依賴其他成人；第3選項可有額外條件，失效後仍有兩項。選項數不由原開場問卷四方向硬套，亦不重新生成「協調／承接／伴侶／支援」四項。

1. **可見事實**：先寫玩家能觀察的物件和行動，再寫內心感受；成人未反應時只記玩家做了什麼。Journal沿產品第二人稱「你」表達玩家視角，不改成全知旁白。
2. **存在→可聯絡→同意→執行**分開。存在只能開放「詢問」。同意由具名且有正向回覆的Reaction留下精確flag；執行須另有結果證據。本配額不以回覆代表完成交接，不用模糊support數值推斷完成。不同住長輩只訊息／通話，不寫進門、抱走孩子或收拾。
3. **場景在場**：C中伴侶／長輩的行動只在有該人Reaction被選中時寫。事件基底只呈現訊息草稿、物件、玩家回憶，不能以 actorText 插入姓名就宣稱其在場。通話／訊息的Reaction文字須明示遠端。沒有抽到回應者時保留未回覆，none不補可見對白。
4. **人物不是反派職位**：長輩題材包含先詢問、承認自己累、分享經驗、願意調整；伴侶可以可靠、不同意或暫時沒空。照顧參與低不等於人格差；照顧者可以拒絕增加工作而不被道德懲罰。
5. **孩子有意願**：玩、停下、反覆、拒絕展示均可；不能因一次選項推斷依附、智力、診斷或長期人格。嬰兒不說超齡台詞。
6. **平衡**：36候選按矩陣主調分成日常瑣事、孩子成長、支持／溫暖、摩擦／取捨；各類至少6筆、摩擦最多12筆，不能用所有衝突都分配給C達標。實際抽選須另報加權曝光比例；不是只數標籤。長輩相關候選至少一半保有中性／支持版本；伴侶題材至少一半包含可確認的支持版本，不能只有抱怨。
7. **選擇有差異**：剪去道德正解；安排具體動作與機會成本，例如少做一件家務、留作品或拆掉再玩、只看一題或關通知。不能只換物件名稱而維持同一套選項。
8. **來源**：本稿為原創虛構生活場景，無私人貼文與統計。涉及醫療、安全、飲食指引的選材本輪不採；不新增已審閱知識卡。既有12張draft卡保持原狀；未來加入指引須另核實來源及專業審查。

作者先檢查上述8項，再由內容審查者逐筆標通過／退修／需能力。現稿屬自審提案；正式 Designed／Ready 必須留下獨立的確認來源。矩陣E的問題是現有內容審查發現，**本次未修正**。

**Journal契約已作提案選擇**：目前schema尚只有planning／support／repair；第二版決定擴充一般narrative結果，保存為history.kind=narrative及既有Journal.kind=result，不增加節點。一般成長與玩樂結果有獨立正文，不再只留選項快照。孩子笑、抗議、成人答應等未確定行動仍須由實際Reaction提供證據。來源驗證、Review分類與版本邊界見[第二版§2](ISSUE-42-DESIGN-DECISIONS-V2.md#2-一般敘事結果契約新增narrative不借用planning)，尚未實作。

## 版本、舊存檔與 Replay 影響

現有 ContentPack.schemaVersion=1、GameState.schemaVersion=1、save envelope=7；三者均不等於內容版本。目前沒有內容版本欄位／歷史目錄路由；player-session 直接重建 createMvpContent，保存的是進度和replayOrigin人物／初始機械狀態，而非整份內容包。只保持ID、history快照不夠保障待選事件和未來抽選。

**採用新舊內容分流方向**：v1–v7合法舊局綁凍結legacy；新局才用擴充包。第二版提出save envelope v8／GameState v2與新內容schema v2；state.contentBinding內releaseId選不可變發布包、assemblyVersion選固定組裝規則、familyKey核對保存家庭的資格輸入。欄位用途、雜湊格式、未知版本／不一致拒收、Replay單一綁定與舊schema凍結規則，以[第二版§5](ISSUE-42-DESIGN-DECISIONS-V2.md#5-家庭組裝與版本欄位定案)為準。原「預計v8但內層未定／家庭簽章未定義」由此取代；familyKey不是防竄改簽章。

| 情境 | 要求 |
| --- | --- |
| 舊pending | 原event／選項／資格／文字／rngState續玩；不能指向新版同ID不同內容 |
| 已CHOOSE、未ADVANCE | 原反應已提交；原排程和冷卻接續，不重送選擇 |
| 舊history／Journal／memory／review | 原字串、ID、來源與索引不改；不回填新版文字 |
| 相同家庭重玩 | Replay保留內容版本、初始state、人物、命令及方向序列；重新抽人生才可使用新版本 |
| 新版本重排資料 | 同版本完整trace、事件、反應、後續、Journal、review一致 |
| 不同內容版本 | 分開報差異；不宣稱與舊包相同抽選分布或相同故事 |
| 未知／缺失版本 | legacy規則僅適用既有合法v1–v7；未知新版本回報相容錯誤，保留raw bytes，不猜最新版 |
| 保存失敗／重試／衝突 | 沿用保存同一state及原bytes備份規則，不重抽、不覆寫較新檔 |

原人物、親屬關係、生活細節、daily規則、Dialog待選流程不因內容擴充重新生成。舊版原有可疑文案也不得藉遷移改寫既成事實；新版本才能交付經確認的修訂。

## 固定測試矩陣與事前容差（提議凍結值）

測試只經現有 Content Schema Validation、Core Event Engine Public Boundary、Save／Restore、Family Review；不另寫抽選器來產生「實際」結果。驗收使用真正的發布候選包，測試fixture只控制初始state／角色參數／rngState。

### 固定 corpus

- 基準完整遊程：既有UX_V2_FAMILIES seed **9／1／11／2**，分別為single-backup／shared-care／pseudo-single／multigenerational。固定原家庭與人物，額外列出workArrangement原值，不能每次掃seed找會通過的家庭。
- 擴充分布：i=0..4095，UTF-8字串 `issue42-entry-v1/`＋十進位i（無補零），取SHA-256前4 bytes作big-endian uint32。本次已計算確認4096值全部相異。將每值轉十進位、各接一個LF（含末行），ASCII串接清單的SHA-256為 `1d0459e3c86c7d6cc1510dba7c2e104a581540e494de14c14a6f3e60329adcc0`。前8值：1792558116、1802922251、1239372156、1446078914、1832703376、4114204181、2749556758、1101138710。正式測試須依此重建並核對摘要，不從結果挑seed；本次只有語料規則及摘要，尚無新內容分布報告。
- 完整新包長程語料：上述corpus前128值；Replay／保存／重排壓力取前32值；不得從結果挑好看的seed。
- 同seed家庭對照在獨立fixture中固定完全相同rngState、資源50、傾向0、人物參數0.5；只改單一家庭維度並維持一致的成員集合。用固定actor profiles fixture，不呼叫生成器重抽造成其他變數混入。真實生成家庭完整局另測，兩者不能互相取代。

### 結構及資格

1. 48家庭配置 ×12階段，建立無既往入口、無到期排程的合法階段初始state，進引擎。枚舉A／B／C／E預期集合；A／B必有，C若且唯若矩陣條件與角色存在成立。每個支援配置的可執行一般入口≥2、每入口可執行選項≥2。資源全0再測一次，覆蓋率100%，錯誤容許0。
2. 角色mask：無伴侶、無support、成人availability=0／1、不同住support、legacy-unknown稱謂。成人不出現時仍能完局，不造出新親屬。存在但availability=0可以顯示詢問，不可記為已回覆／交接。測後續flag只由正確反應產生。
3. 每階段C分別做條件正例及只翻轉household／care／work其中一維的反例；與同seed對照表一起報告候選集合差異。未涉及的維度不應改變該C資格。
4. 完整發布目錄與每種組裝包的schema、引用、可達性、至少一條實際執行路徑；36新根、新增18固定後續與既有固定後續逐一有執行證據，未發生不當成已覆蓋。requiredEventIds按各包可達範圍正確建立。

### 抽選分布

- 隔離入口測試：48配置 ×12階段 ×6個固定生活方向 ×4096 corpus，共14,155,776次首次入口ADVANCE。分批執行可接受，報告需完整，不每次CI全跑；PR跑結構＋代表分布，發布前跑全矩陣。每次記錄實際returned pendingEvent.id。**本階段尚未執行這組新內容測試**。
- E與新根初始base weight均2，未標方向倍數1，相關方向至多1.25；各C／A／B的方向建議見矩陣。合法入口保持正權重，初始單次機率至少1/(4×1.25)=20%。不以零權重隱藏不喜歡的故事；不符合家庭者從候選資格排除。
- 理論p使用人工核准的候選／權重清單按 `w×directionMultiplier / 合法候選總權重` 算，這是統計期望，不是複製抽選實作。每個固定cell（家庭、階段、方向）報 n、每ID k、p、k/n、偏差及候選全集。
- **事前容差**：每候選 `abs(k/n-p) <= max(0.025, 5*sqrt(p*(1-p)/n))`，n=4096；分布為遊戲平衡參數而非人口統計。5σ加2.5百分點下限供大量固定cell的回歸檢查；不是事後依結果調整門檻。任一合法候選k=0、非法候選k>0均失敗。這裡p≥20%，預期數足夠；後續若降低權重，須先重核樣本量，不能拿此門檻默許稀有候選沒出現。
- 所有cell固定語料，重跑結果必完全相同；不同cell不是獨立人口抽樣，不宣稱統計顯著家庭優劣。若失敗先檢查資格、排序、PRNG與corpus，不換seed／放寬容差求通過。
- 完整局另報入口曝光／抽選機會數、排程攔截次數、fallback率、因互斥未再開池的次數；不把被固定排程占用的ADVANCE算成未抽中。對長程因玩家選擇而改變的候選池按當時state分組，不能混成同一p。正常新根路線fallback是終止用途，不能用fallback率誤判漏內容。
- 敘事曝光：按主調、角色、家庭組別報實際入口占比；事前期望由各cell的p與標籤加總，按相同2.5pp／5σ規則檢查。此為曝光均衡檢查，不要求每一局全含四類。支持與衝突Reaction另依場景記錄，不能以角色人數造成的候選pair數差異冒稱已平衡；若要改Reaction權重須內容審查重新核定。

### 完整局、預算及確定性

- 4基準家庭＋48三維度fixture，完整12階段 ×128固定seed，先測每次選第一合法、最後合法、依i輪替合法三條命令策略；另逐一釘選每個C與每個可選項作可達性測試（釘選只用於路徑驗證，不計自然分布）。資源0／50、planningLoad0／高值、方向固定六種及每階段循環切換序列另作邊界組。
- 每條路徑檢查Turn≤4、Stage≤6，沒有意外cycleProtected、沒有其他根擠掉固定鏈；第1／8階段所有可選根均完成跨Turn鏈，E兩分支仍到repair，新第8階段後續選項均提供repair機會。遊程在250命令上限內完成12階段；失敗列seed、家庭、stage、event、choice、queue及rngState。
- 保存checkpoint：開場、pending、CHOOSE後、immediate前、延遲鏈Turn邊界、Stage邊界、完成／review。每個checkpoint serialize／restore後以同命令序列與未中斷路徑比較完整trace及結果，不只機械欄位hash。
- 資料重排：固定逆序events／actors／stages／entry IDs／pool IDs／pool entries／queue，與原順序完全相同；**choice順序及同一來源follow-up宣告順序有語意，不隨意重排**。目前內容驗證要求stages陣列已按order排列，因此作者輸入重排測試需先經組裝器依order正規化再parse；不要把現有validator宣稱為接受任意stage順序。方向序列固定且切換不消耗PRNG；pending與固定follow-up不因方向改抽。
- legacy各v1–v7 fixture沿用原golden；特別保留pending、歷史、unknown親屬、replayOrigin、保存失敗重試。新包同版本的Replay與續玩全字串／事件／Reaction／排程／Review一致；跨內容版本另表說明差異。

### 報告與放行

提交兩份機器可讀證據：coverage（family三維度、stage、角色mask、合法ID、選項數、實際到達、未到原因）與distribution（corpus摘要、內容版本、commit、方向、n、p、k、偏差、門檻、結果）。另附四基準家庭完整Journal樣例與相同seed單維度對照。

內容審查、資格與預算、相容與確定性均零違規；合法候選實際覆蓋100%；所有分布cell通過事前容差，才可進Preview。Preview確認後另核發布；不能只通過UI snapshot或只增加靜態資料就關閉#42。

## 影響範圍與後續工作順序

| 區域 | 預期後續改動／風險 | 本次 |
| --- | --- | --- |
| 內容工廠／目錄 | 新版本作者資料、家庭條件組裝、入口互斥、母題對照 | 僅規劃 |
| Engine／Eligibility／Scheduler | 沿用現有公開邊界；不改隨機器與排程優先序 | 僅檢查 |
| Reaction | 場景專用正向／中性／無回應文字，遠端通訊不冒充到場 | 僅樣稿 |
| Journal／人物／Dialog | 既有快照及actorText；每選項有具體結果；確認現有UI可讀性 | 不改程式 |
| Save／Replay／Session | 內容版本路由是新增必要能力；legacy frozen factory及版本錯誤處理 | 僅提出缺口 |
| Tests／文件 | 新包覆蓋與分布、舊golden、版本文件 | 僅定義驗收 |

建議後續依序：確認第二版逐局兩鏈／narrative契約與矩陣修訂→核定版本欄位與87節點基準→凍結corpus／容差→建立相容邊界→分階段編寫內容→覆蓋與分布報告→Standards／Spec Review→獨立內容PR／Preview→核定發布。現在不建立新GitHub tickets、不留言或改Issue狀態，也不啟動實作。

本階段交付可以用來確認設計，不能當作#42已完成或任何候選已Ready的證據。

## 本次文件核對與既有基線

已核對143筆唯一Backlog ID、36個候選段落、12個月份、來源對照、主調計數與固定語料摘要。盤點中49個GDD母題與新候選有關聯；這是關聯數，不能當成新事件數。

既有 npm script 驗證：`npm.cmd test -- tests/mvp-content-validation.test.ts tests/mvp-content-engine.test.ts tests/family-conditions.test.ts tests/family-life-direction.test.ts tests/persistence.test.ts tests/ux-v2-replay-ui.test.tsx`，6檔56測試通過。PowerShell的npm.ps1受執行政策限制，改用npm.cmd；沙箱內esbuild讀父目錄失敗後以獲准的測試執行重跑通過。這些只證明本次所依據的既有基線，**沒有驗證尚未實作的新候選、版本路由或新分布**。本次未新增測試程式、未更新golden，也未執行發布或GitHub寫入。
