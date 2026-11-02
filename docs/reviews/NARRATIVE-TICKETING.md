# Narrative Quality：正式建票決議

版本：v1，2026-11-03（Asia/Taipei）。使用者已核准既有事件整修與 #42 分工、三票拆分及發布；本輪只建立文件 PR 與 Issues，不實作、Merge 或部署。NQ-A1／A2／A3 已分別發布為 #60／#61／#62，連結見發布索引。

## 文件與來源核對

| 文件 | 版本／完整性 | 用途 |
| --- | --- | --- |
| [審查結論](NARRATIVE-QUALITY-REVIEW.md) | 審查 v1，原程式基準 51a3b45 | 問題證據、作者契約、相容政策 V |
| [逐事件改寫](NARRATIVE-EVENT-REWRITES.md) | 改稿 v1，N01–N16 全部存在 | 32 個 legacy 敘事節點＋4 個小車節點的改稿、fallback 保留決議；每題行動／結果／條件 |
| [原文盤點](NARRATIVE-ORIGINAL-CATALOGUE.md) | 原文快照 v1，37 個唯一 Event ID | 33 個 legacy 節點＋4 個 08A 節點，原情境／選項／資格／結果；不改寫此歷史快照 |

原文目錄不包含 daily 作為節點；4 個 daily 模板另已在改稿文件全數審查。正式發布前已以遠端 main `98c26fdcb713601a21a999533cc4b261de4fa2a9` 比對六個來源：MVP 工廠、題材、Journal、小車、release 路由、daily；與審查 checkout 的內容一致（忽略 CRLF／LF）。遠端 #52 已合併，不把本機舊分支的 #52 commits 再帶進文件 PR。

原文快照保留 51a3b45 的來源日期；本文件補上發布時 main 核對，沒有把未執行改稿標成已測通。本文優先於原三票草案的發布狀態及依賴補充；不改變 Review 的產品方向。

## 責任、依賴與順序

| 票 | 獨占範圍 | 節點數／關係 | Blocked by |
| --- | --- | --- | --- |
| NQ-A1 | N01、N08、N13、N14；不可變 NQ release、保留舊路由的首次落地 | 兩條鏈共 12 個作者節點；單一路徑不會同時跑 support／strain | 無；先做本票的小量代表樣本 |
| NQ-A2 | N02、N05、N06、N07、N10 | 5 個入口＋5 個各題後續＝10 | NQ-A1 的新版目錄／相容邊界完成並驗收；不依賴 A3 |
| NQ-A3 | N03、N04、N09、N11、N12，以及前兩題不適用家庭的中性變體 | 基本 10；中性變體最多另 4 個作者節點，各局仍只選其中一版 | NQ-A1 的新版目錄／相容邊界完成並驗收；不依賴 A2 |

12＋10＋10＝原 32 個 legacy 敘事節點，無重複所有權；fallback／daily 均保留。新候選、家庭多入口覆蓋、08A 的 N15／N16 修訂仍屬 [#42](https://github.com/gitmaruneko/parenthood-simulator/issues/42)，不在三張 NQ 票重做。#42 不是這三票的父票或阻擋票，三票也不阻擋 #42；引用 #42 是為了界定邊界。

建議順序：**A1 代表樣本→A1 兩鏈完成與相容驗收→A2→A3**。A2／A3 在 A1 通過後可各自開工；順序推薦不增加 A2→A3 的阻擋邊。A2 優先是因其涵蓋普通日常與第 6 階段支持／planning 保證。文案審稿可提前進行；依賴指可執行整合的門檻。

新發行線先採獨立 NQ release／獨立儲存 Preview，不切換預設正式新局。A1 為第一個不可變 release；A2／A3 各用自己的後續 release ID／目錄快照組合已驗收內容，不回頭覆寫 A1。若兩票獨立完成，最後整合另建 release、以實際組合回歸；不用共用可變 release 避免衝突。release 命名由實作依現有路由慣例配置，不改 Save schema 或增加家庭狀態系統。

## 文案、Choice、Reaction、Journal 與版本分類

「純文案」指 title／text／journalContext 文字調整，動作語意、Actor、資格、效果、flags、排程、來源種類與索引不變。**即使純文案，也不可原地修改已綁定 release 或歷史。**新文字產生新的 Journal 文字快照，但不用更改 Journal schema／renderer。以下是本次完整改稿的影響，不把所有提案誤稱 copy-only。

| 對應事件 | 可限定為文案工作的部分 | 其他必要影響 | 版本責任 |
| --- | --- | --- | --- |
| N01／N08 入口 | 標題、具體場景 | Choice 4→2、選項 ID／效果／flags；Actor／Reaction；新 choice 與結果快照、鏈邊引用 | A1 新 release／新語意 ID |
| N13 夜間 support／strain／reconnect／close | 部分場景字句 | 分支 eligibility、選項、工具 support；移除虛構 conflict／repair 記憶及通用 connection；close 種類調整、Journal／Review 分類 | A1 |
| N14 入園 support／strain／reconnect／close | 部分場景字句 | 分支旗標、child-only Reaction、玩家 repair 嘗試與結果；不得保證原諒／老師回覆，記憶與 Review 來源須核對 | A1 |
| N02、N05、N07、N10 入口 | 場景文字 | Choice／效果；移除不成立的成人池，必要時 child-only 池；選項結果來源 | A2 |
| N06 入口與 support reflection | 場景文字 | Choice／planning 結果；support 節點保留，新增實際分類 planning 來源及工具支持證據；不是只改反思一段字 | A2 |
| N03、N04 入口與中性變體 | 場景文字 | Choice／資格／家庭組裝；遠端成人池及選項旗標；限定題＋中性替代 ID；Journal 結果 | A3 |
| N09、N11、N12 入口 | 場景文字 | Choice／效果／Actor／場景池與結果；相聚不能固定演成已獲同意 | A3 |
| N01／N02／N03／N04／N05／N07／N08／N09／N10／N11／N12 的 reflection | 父事件成立後，AUTO title／text 可單獨視為純文案；不改其種類／效果／來源 | 新物件前提仍須與父題整合驗證，不能抽離父題單獨套到舊歷史；新 ID 引用依整包配置 | 各所屬票；V 仍適用 |
| N15 小車根、N16 後續 choice | 標題與場景文字 | 根 3→2、後續行動改變、flags／Reaction／storyEntries；新 choice ID | 僅 #42 下一版 |
| 小車 revisit／close | AUTO title／text 可限純文案 | 仍隨新版鏈一併核對前提與來源；不換舊 queue | 僅 #42 下一版 |
| fallback／daily-v1 | 不要求改字 | 保留靜默、去重、無效果與零 PRNG | 不新增版本工作 |

以上 Journal 變動指**新內容產生的資料與來源**，不是授權修改 Journal／Engine／Save 的結構契約。現有 narrative 與 v8 已足夠；若實作發現需新 schema、條件語言或未建模狀態，列差異另提案，不自行擴張。任何選項／Actor／pool 變動都可能改變新版 PRNG 消耗，不能宣稱只是文案或與舊包同分布。

## 共通相容與 Testing Seam（每票皆適用）

- **相容：**凍結 legacy v1–v7 與 v8 family-events-08a-v1；pending 的選項、資格、文字、rngState、未來 queue 都沿原 release。新版行動用新 Event／Choice ID，版本路由保留舊目錄，familyKey／assembly 與 manifest 保持一致。已保存 history／Journal／memory／Review 不回填、不重分類；Replay 保留原 release；未知 release 拒收保留 bytes。未保存結果重試只重存同一 state，不重抽／重送 CHOOSE。不為文案升 envelope，不取消現有 reader。
- **主要 seam：**真實 ContentPack 經公開 Engine 命令到 checkpoint，串 Save／Restore 與 Family Review；沿既有內容、家庭組裝、事件鏈、Journal、persistence 測試邊界，不 mock 抽選器、不複製 Scheduler。
- **覆蓋：**四基準家庭 seed 9／1／11／2、48 家庭配置的適用性／可行選項、無成人／不同住／availability=0／未知親屬與零資源；每個入池事件至少 2 合法行動，沒有超齡對白或危險捷徑。使用既有 #42 固定 corpus，變更分布依該規格事前容差另報，不用舊報告冒充。
- **確定性：**同 release／家庭／seed／命令／方向，目錄重排與逐 checkpoint Save／Restore 的事件、反應、結果、Journal、Review 一致。舊內容 fixtures 保留，不更新 golden 掩蓋相容退化；跨 release 差異另報。
- **驗證：**功能 PR 使用 package.json 的 npm test、typecheck、build 及 test:e2e；內容／存檔／來源針對本票補測，桌面／手機只補兩選項、結果／none、續玩與既有 #52 自動節奏相容案例。每票附真實引擎輸出的 Journal、獨立內容 Preview、Standards／Spec Review；不能用靜態樣稿作執行證據。
- **排除：**不改 [#52](https://github.com/gitmaruneko/parenthood-simulator/issues/52) 的自動推進、間隔、暫停、快速顯示、焦點／捲動、保存控制器；不自動 Merge、正式部署或切換正式 release；不新增醫療／睡眠／飲食指引、節日／隔代包。

## NQ-A1｜兩條既有鏈與不可變內容路由

### What to build

將凌晨用品與教室門口兩條既有鏈改成能看到物件、做出行動、讀到實際結果的家庭故事。範圍限 N01／N08／N13／N14；兩鏈連同現有 Dialog、Journal、讀檔與 Review 端到端可試讀。保留其餘未整修內容，供完整 12 階段相容驗證；不順手改 08A。

### Acceptance Criteria

- [ ] 提交新 release／目錄、舊→新 Event／Choice／pool／flag／follow-up 對照，舊 legacy 與 08A-v1 完整保留；未知新版拒收、不改正式預設 release。
- [ ] N01 與 N13 的用品動作無成人門檻、無嬰兒成人台詞；根與後續各有 2 合法選項，整理籃內與搬動位置有實際差異。
- [ ] N08 開場明示門口、孩子的畫、老師正忙與玩家已催促；主要行動不假設玩家趕工作。老師只在正確詢問分支實際抽到才回覆，不能當成已交接。
- [ ] N14 後續的道歉／畫門口邀請只保存玩家 repair 嘗試；孩子補充、拒談、none 都能完成鏈，不保證理解、安心或原諒。
- [ ] support／strain 分支只用對應新根完成與本題旗標，清舊旗標；不靠 generic planningLoad 推定故事。AUTO 結果對其所有前置路徑成立；不用不存在的固定 storyEntry requirements。
- [ ] 正常操作下兩鏈各跨 2 Turn，Turn≤4、Stage≤6，含 fallback；保留根互斥、每局兩跨 Turn 鏈、第 6 階段 support／planning 與第 8 階段修復機會。未改的 08A 路線亦完整回歸。
- [ ] 每個新行動都有自己的固定結果；Reaction／none 不混入玩家結果。刪去新版不成立的 conflict／repair 記憶與通用獎勵，Review 不把普通整理當人際修復；舊 Review 不重分類。
- [ ] 四個代表 choice 的雙分支實跑 Journal 通過下列樣本尺規；整條兩鏈所有分支都驗證，不只展示好看的 seed。
- [ ] 共通相容與 Testing Seam 全部適用；逐 checkpoint 測 pending、CHOOSE 後、下一 Turn queue、Stage 完成、Review、保存失敗重試、未知 release，來源／索引與舊資料皆正確。
- [ ] 獨立 Preview、測試報告與兩軸 Review 完成；不修改 #42 新候選、08A 內容或 #52 行為，不 Merge／部署。

### Testing Seam

公開 Engine→Journal→Save／Restore→Review；另測真實 Session／可拒寫 SaveStorage→兩選項 Dialog／已保存結果。強制路徑用於每個選項與 Reaction 可達性；自然固定 corpus 用於分布，兩者分報。最重要的負例是無成人夜間、老師無回應、孩子拒談／none、跨 Turn 保存重開及已接受選擇的重試。

### Examples and first-batch quality samples

| 代表舊事件 ID（新版另配 ID） | 核心場景與兩個行動 | 實際結果／驗收重點 |
| --- | --- | --- |
| night-handoff-choice（N01） | 半夜房內、乾淨圍兜、小籃與衣堆；挑幾件入籃／先坐回孩子旁 | A：「你挑出幾件乾淨用品放進小籃，剩下的衣物仍堆在旁邊。」B 不得寫已整理全部；兩路都無家人接班 |
| night-handoff-reconnect（N13） | 天亮找用品；改籃內排序／移動籃子位置 | B：「你保留籃內原來的放法，把小籃移到坐下時拿得到的位置。」不用「找回對話空間」或產生人際 repair |
| preschool-handoff-choice（N08） | 門口、折角的畫、老師忙；移到旁邊問孩子／等老師再提出看畫請求 | B 固定只記請求；若抽到老師「先接這一家」，只記回覆，不寫孩子已交接；none 不補老師台詞 |
| preschool-handoff-reconnect（N14） | 家中桌邊；蹲下說剛才太急／畫門口問想讓你看哪裡 | A：「你蹲到孩子身邊，把『剛才太急，沒有先聽你說』說完整，停下來等他的反應。」孩子可拒談，仍記玩家 repair 嘗試 |

這四個 choice 是第一批品質樣本；相依 AUTO 節點一併接通以執行完整鏈，不把四個孤立節點當可發布完成。每個樣本人工逐項檢查：能想像人與地點、看懂困難、兩行動有不同結果、年齡／人物成立、無危險捷徑、無空泛說教、無未證實他人行動、none 可讀、Journal 來源可追、舊 pending 不改。附 8 組選項結果及相關 Reaction／none 證據；品質尺規先用來約束本票，再套用 A2／A3。

### Compatibility

完整適用共通政策 V；特別保護舊 talk／pause、原 support／strain queue、原 repair memory 與 08A 所有原 choice。新版夜間 close 可改 routine，但不能把舊 history.kind／Review 引用一起改。首次 release 路由與相容邊界由本票負責，後票只擴充，不重做 reader。

### Blocked by

無。產品方向、Testing Seam 與三票拆分由本次使用者指示確認；文件 PR 是規格來源，無需等 #42 或重新批准 #52。此票已建規格不代表現在開工。

## NQ-A2｜餐桌、用品、公園、雨天與休息

### What to build

完成 N02／N05／N06／N07／N10 的五組一般生活故事，每組 1 個入口、1 個本題後續。玩家能選備餐先後、公園回程、補貨路線、雨天等待或返家、桌遊與短休息；保留第 6 階段實際工具支持／planning。沿 A1 已驗收版本機制新增後續 release，不修改 A1 目錄。

### Acceptance Criteria

- [ ] 五題各有具體場景、2 個無成人門檻的可行行動及各自結果；移除全題固定 handoff／ask-family，不以原 coordinate／carry 相同獎懲充當差異。
- [ ] 餐桌題只寫玩家自己的備餐取捨；公園題不以路人評論分工；雨天場景已接到孩子、可合法等候或走有遮蔽長路，不提供冒險趕路選項。
- [ ] N10 玩家與孩子同處可照看空間，休息不等於 #52 暫停、獨留幼兒或另一成人憑空接班；孩子可以催促／不願只玩一局，固定結果不保證配合。
- [ ] N06 的補貨／記清單結果各自成立；固定後續保留 support 工具與實際分類 planning 來源，所有合法路徑均到達，不靠詢問或資源值冒充支援。
- [ ] 各 reflection 是父選擇後都成立的具體落點；不固定孩子平靜、不重複講解隱形負擔。必要孩子反應用各題限定池，none 無可見回應或記憶；無需 Reaction 的家務題可無池。
- [ ] 既有兩跨 Turn 鏈、修復機會、Turn≤4／Stage≤6 保持；新版 12 階段完整局可完成，未整修內容與 #42 08A 保持原責任。
- [ ] 提交本票 ID／flag／pool／效果差異清單、新 release 與四家庭實跑 Journal；不覆寫 A1 或任何既有 binding，完整適用 V。
- [ ] 共通 Testing Seam 及 A2 的全部選項／none、零資源、無成人／availability=0、第 6 階段 support／planning 來源、Save／Restore、失敗重試與 Review 驗證通過。
- [ ] 獨立 Preview、npm 驗證、Standards／Spec Review 完成；不改 #52、自行 Merge／正式部署。

### Testing Seam

真實 ContentPack→公開 Engine→Journal／Review，串 Save／Restore；以四基準家庭與 48 配置驗證每題兩選項可執行，逐一執行全部五題行動。重點反例：公園沒有路人理解分工、雨天等待不保證雨停、休息不保證孩子等完、第 6 階段不是只有 support 資源數字。Session／瀏覽器只補已保存結果、2 選項、讀檔與既有自動敘事相容，無新增 timer 行為。

### Examples

- N06 A：「今天先去商店補貨，再到公園短暫走走」→實際補一包、少一段公園時間；B：「照原路去公園，出門前把補貨寫進手機清單」→保留公園時間、補貨待辦仍在。共同支持片段只建立袋內用品分類工具，不宣稱家人代買。
- N10 A 先喝水看兩頁書；若孩子實際問「兩頁是多久？」才附該 Reaction。B 先開一局；固定結果不可寫孩子已同意只玩一局。兩路 none 都只保留玩家已做動作。

### Compatibility

適用 V；特別保護原 shared-ownership-reflection 的 support 記憶／來源與舊 pending 四選項。新分類 planning 只在新 release 寫入，不補舊紀錄。不重用 A1 release ID 增改資料，不因減少成人抽樣而宣稱跨版本 RNG／結果相同。

### Blocked by

NQ-A1 的不可變目錄／版本路由與舊包相容邊界通過驗收（即使以已驗收未 Merge 分支接續，亦不得覆寫既存 release）。不依賴 NQ-A3、#42 或 #52 的後續修改。

## NQ-A3｜工作、作息、通知、相聚與新階段

### What to build

完成 N03／N04／N09／N11／N12 五組事件，讓工作／遠端長輩條件真的篩選場景；同時為不符合 N03／N04 的家庭提供中性變體，避免整修必須等待 #42 的新入口。每次只組裝工作／非工作、長輩／無長輩其中一版，都是同一母題的兩行動取捨，不擴張 #42 的多候選覆蓋目標。

### Acceptance Criteria

- [ ] 五題含變體皆有具體場景、2 個可行行動、各自玩家結果；不用共同協調／承接／求助模板，正文不泛談家庭類型。
- [ ] N03 工作會議只在 dualIncome／flexible／unstable 開放；singleFullTimeCare 組裝下述非工作生活安排變體。N04 遠端長輩場景須 support-1 實際存在；無長輩使用下述中性變體，不創造親屬。
- [ ] 兩個中性變體明列新 ID／選項／結果／後續、各最多 2 節點；48 配置／角色 mask 下各階段仍至少有一個可執行一般入口及 2 合法選項，不以 fallback 代替覆蓋。每階段≥2 一般候選的擴充仍由 #42 驗收。
- [ ] 遠端詢問限定正確 actor／場景／本題 flag；未詢問不出現答覆。回覆可提供具體資訊或不答應；詢問、同意、執行三者分開，不同住長輩不寫成進門／抱走孩子。
- [ ] 通知明示幼兒園替代材料；相聚仍可只是未寄草稿，不增加家人／節日；新教室題不推定特定教育制度、讀圖能力或獨立通學。不將家庭習慣當行動已發生證據。
- [ ] reflection 對所有本題選擇成立，無說教或未證實正向結論；child／adult／none 結果來源可追，未知親屬保持中性。
- [ ] 提交工作／非工作、有／無長輩同 seed 單維正反例與候選／選項表，明列作者目錄額外節點成本；各局只選一版，不暗增 4／6 預算或與另一版本根同時入選。
- [ ] 新 release 不覆寫 A1／A2；完整適用 V，兩既有鏈、工具 support／planning 與 12 階段完成持續通過；變體如與 #42 未來整合須重核總目錄，不冒稱原 90 配額自動涵蓋。
- [ ] 共通 Testing Seam、所有選項與遠端回應／none、48 配置、逐 checkpoint Save／Restore、失敗重試、Replay／Review 驗證通過；附實跑 Journal、獨立 Preview、npm 驗證與兩軸 Review。
- [ ] 不新增 Condition 語言、通用入學／承諾狀態或 Save schema；不修改 #42 08A、#52、不自行 Merge 或部署。

### Testing Seam

既有家庭作者組裝→真實 ContentPack→公開 Engine／Reaction→Journal→Save／Restore／Review。固定相同 rngState 與其他條件，只翻轉 workArrangement 或 support-1 成員資格，檢查相對應場景選入／排除與另一版可行性。每個變體與所有選項都實際執行；遠端同意、未回覆、未詢問負例分測，不用 UI 隱藏或換 seed 冒充資格。

### Examples

- N03 工作場景 A 無法出席並寫意見／B 詢問改明早；B 結果只寫送出時段。若抽到同事「先問主持人」，也不寫已改期。
- **N03 中性變體（10 月）：「門邊的袋子，還差最後一件」**。在家準備原訂散步，袋內備用品還未整理；A「現在補齊袋子，晚一點出門」→「你把這次要用的幾件放進袋裡，出門時間往後挪了一點。」B「今天改在家陪孩子，袋子下午再整理」→「你將袋子留在門邊，坐回孩子旁邊。今天這趟散步先取消。」共同 reflection：「你把外出袋放回門邊固定的位置。」不要求工作、成人或嬰兒說話。
- **N04 中性變體（15 月）：「下午原本想出門，鞋子還沒找齊」**。在家陪孩子，原訂下午走走，門邊待收物品擋著找鞋；A「先找齊鞋子，今天照原計畫出去」→「你在門邊找齊鞋子，把要帶的物品放在一起。」B「今天留在家，在地上排一條玩具路」→「你把玩具排成一條路，坐在孩子旁邊。這次外出先取消。」共同 reflection：「你將門邊散落的物品集中到一側。」不寫不存在的長輩曾建議，也不保證孩子配合玩法。
- N09 使用班上材料只代表已發回覆，不代表老師已讀；N11 只記邀請草稿；N12 紙上畫路不代表已實際認路。人物自主回應始終取實際 Reaction。

中性變體是建票階段為消除隱性 #42 依賴的範圍補充，不取代 N03／N04 的限定場景。正式作者文字仍應依同一品質尺規讀稿；不新增另一套固定休息／承接模板。

### Compatibility

適用 V；舊 backup-contact／grandparent-boundary 即使在新版不適用該家庭，也不能從原 release 刪除而拒收舊 pending。新版限定根與中性根用不同語意 ID，作者目錄記錄所有變體、各家庭 requiredEventIds 只含其可達集合；不能把舊 queue／歷史映射到中性版本。入學、工作時段與親屬不回填到 GameState。

### Blocked by

NQ-A1 的不可變目錄／版本路由與舊包相容邊界通過驗收。不依賴 NQ-A2；與 #42 共享品質門檻但無阻擋邊；#52 行為已是基線，不要求改動。

## 發布索引與本輪驗證

| 交付 | GitHub | 依賴與狀態 |
| --- | --- | --- |
| 文件 PR | [#59](https://github.com/gitmaruneko/parenthood-simulator/pull/59) | 獨立 docs 分支，以已合併 #52 的 main 為基準；未 Merge |
| NQ-A1 | [#60](https://github.com/gitmaruneko/parenthood-simulator/issues/60) | ready-for-agent；無阻擋票；先驗收四個 choice 樣本與相依完整鏈 |
| NQ-A2 | [#61](https://github.com/gitmaruneko/parenthood-simulator/issues/61) | ready-for-agent；Blocked by #60 的新版路由／相容基礎；不依賴 #62 |
| NQ-A3 | [#62](https://github.com/gitmaruneko/parenthood-simulator/issues/62) | ready-for-agent；Blocked by #60 的新版路由／相容基礎；不依賴 #61 |

Issues 使用本 PR 初始 commit `dcd6b39b0792123ffbcbc737322945d8e69a7553` 的永久文件連結，PR 未 Merge 時仍可閱讀；本索引補記發布結果，未更改該規格內容。現有連接器沒有原生 blocking-edge 寫入能力，依賴明載在各 Issue 的 Blocked by 欄位；未以提及 #42 偽裝父子或阻擋關係。

本輪文件檢查通過：4 份 Markdown、37 個唯一 Event ID、N01–N16 無遺漏、相對連結零失效；12＋10＋10 的 legacy 節點責任不重疊，A1→A2／A3 依賴無環；六個來源與遠端 main 一致，GitHub 正文回讀與本機一致。沒有執行尚未實作內容的功能測試，也未改正式事件、#42／#52 Issue 或任何程式碼。
