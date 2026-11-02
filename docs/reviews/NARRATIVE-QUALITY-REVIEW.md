# 《今天也在養小孩》Narrative Quality & Choice Design Review

日期：2026-11-02。審查版本 v1；原始程式基準：`51a3b45`，原工作分支 `feat/automatic-story-t3`。使用者已確認產品方向與三票拆分，授權文件 PR 與正式建票；未修改正式內容或 #52。發布、依賴、樣本與變更分類以 [建票決議](NARRATIVE-TICKETING.md) 為準。

## 結論與範圍

需要修改的重點是「用同一套分工問題代替不同生活事件」，而不只是把抽象標題換成物件。12 個入口共用四選項與效果；兩條鏈共用修復問題；多數 reflection 再替玩家解說隱形負擔。現有 Journal 已比選項具體，但多停在列清單與等待回覆，玩家仍難以經歷備餐、外出、遊戲等不同活動。

本次盤點涵蓋實際發布路由可載入的內容，不以 Backlog 當成已上線：

| 內容集合 | 實際數量 | 本次處理 |
| --- | ---: | --- |
| legacy `createMvpContent` | 33 節點：12 入口 choice、12 reflection、兩鏈各 4 後續、1 fallback | 32 敘事節點逐項提案；fallback 保留靜默 |
| bound `family-events-08a-v1` | 上述 33＋小車故事 4＝37 | 另審 4 節點，不把試玩當成全量正式內容 |
| 無效果 daily-v1 | 4 模板，不是 EventNode | 全數審查，保留 |
| planning-story | 工具／測試故事，未由目前內容路由引用 | 排除正式事件統計，若未來啟用需另審 |
| #42 其他 35 候選 | 規劃資料 | 不算現有事件；沿原矩陣審查門檻，不在本次展開重寫 |

本機新家庭目前也會綁定 08A release；「試玩」指內容版本與核定範圍，不表示它只存在開發捷徑。未查證外部部署狀態。

完整原情境、選項、資格與已寫作結果見 [37 節點原文快照](NARRATIVE-ORIGINAL-CATALOGUE.md)。快照由當前 factory 解析，預設角色不是任一玩家的實際家庭。逐事件改稿見 [改寫規格](NARRATIVE-EVENT-REWRITES.md)；每個段落列出對應舊 ID，與快照一對一核對。

## 主要發現

| 等級／問題 | 證據 | 玩家影響與修正方向 |
| --- | --- | --- |
| 高：12 個入口共用行動模型 | 各 `*-choice` 都是 coordinate／carry，加上同一句 handoff／ask-family | 更換題材仍像回答同一份分工問卷。各題改為 2 個主要行動；角色限定選項只在確有獨特行動時增加 |
| 高：反應者與眼前行動不相符 | 每題 actorIds 包入全部 familyActors；同池供伴侶、長輩、老師、同事甚至路人回應安排 | 公園路人可以「說出自己能參與的範圍」；備餐也可能收到不在場家人的批評。依場景限定 actorIds／pool，詢問 flag 限定回覆 |
| 高：兩條鏈沒有確認「對方」 | night／preschool 的 reconnect 都是「找回可以說話的空間」，且沒 actorIds／location | 2 個月嬰兒與 39 個月孩子、成人交接混用相同對話。夜間改為用品位置；入園改為對孩子的具體補話 |
| 高：固定結果超過證據 | night support 寫可用協助；preschool support 寫與老師確認；repair 一律寫你們重新靠近，連 pause 也如此 | 按了詢問／暫停就得到並未發生的完成。共同 AUTO 僅記新場景與玩家動作；他人同意及執行放實際 Reaction |
| 中：正文混入系統層家庭論述 | backup「單一照顧者可能…其他家庭…」；shared「雙照顧者也可能像獨自…」；quiet 解說全職／彈性 | 玩家被帶離當下。家庭資料用來篩選場景，不直接拿來當正文 |
| 中：reflection 重複宣講 | school-notice「值得在分工時被看見」；school-transition「不是分數，而是…」等 | 每一小事都被課程式總結。改成桌上、袋中、路上的具體落點，不評分、不下親職結論 |
| 中：選項差異被機械模板抹平 | 所有 coordinate 都 planning +1／time -2／energy -1；carry 都 planning +3／energy -4／time +1 | 不同玩法仍被判成同一種優劣。先定實際機會成本，再核效果，不套通用懲罰 |
| 中：抽象緩解可能掩蓋照護前提 | 「休息」「交接」未交代誰仍在照看孩子 | 改稿把大人的活動放在可照看範圍；不提供獨留幼兒、未交接就離開、冒險趕路等普通選項 |
| 中：08A 根較具體，後半仍抽象 | 小車 listen／close 又回到「留位置」「不下結論」 | 保留不知道現場的事實，讓第二次選擇延續車輪、方向、放回玩具等可見行動 |

以上是內容與來源契約發現，並非聲稱引擎已發生非法讀寫。沒有因原文出現飲食／睡眠就判定醫療錯誤，也不在本次提供照護操作指引。

## 作者契約與可用能力

1. 每段先寫可見的人、地點、物件、觸發與眼前困難。情境可以建立這一次的新事實，不能藉此宣稱上一題未確認的交接成功。用固定月齡定位題材，不把孩子能力寫成該月齡人人必達的里程碑。
2. 主要選項預設 2 個，皆不依賴其他成人；schema 原已允許 2–4，不需更改 Dialog／Engine。行動差異包含玩法、做事順序、保留什麼、如何發問與何時外出，不能每題都只比做多做少。
3. `actorAvailable` 在一般 eligibility／choice requirements 中檢查 childId／persistentActorIds；不查同住、不抽 availability，也不是同意證據。在 Reaction context 才檢查實際抽到的 availableActorIds。不可把它寫成「對方有空／在場」條件。
4. 家庭三維度與 requiredActorIds 使用既有 `assembleFamilyEntries` 作者邊界；Engine Condition 沒有 household／work／年齡比較的新種類。月齡以 AgeStage 配置；後續以 eventCompleted／旗標／contextTag 等既有條件實作。本文提到的入園、工作會議等是**擬議場景事實**，目前 state 沒有通用入學／工時日曆欄位。
5. 人物習慣可讓場景選用冰箱月曆、門邊袋子等物件；不能據此認定人物已接手、易生氣或必定配合。稱謂沿 actorProfiles／actorText，沒有伴侶就不寫配偶，未知親屬保持中性；不同住長輩以遠端聯絡為預設。
6. 玩家固定結果用 choice.storyEntries；一般動作用 `narrative`，實際規劃／工具支持／修復才用 planning／support／repair。node 層只寫所有選項都成立的內容。日常不自動加關係記憶或資源獎懲。
7. 成人／孩子的自主反應只由本題專用 Reaction 提供。選項先清本題舊 flag，再設選中行動 flag；回覆要求正確 contextTag、actor、flag，不能用另一題的詢問接回覆。Reaction 不另排分支以免改變保證鏈預算。none 或無可回應者不生成可見台詞、支持或衝突記憶。
8. 共用 AUTO 後續不得保證孩子已平靜、家人已認領或老師已回覆。分支結果放在各自 choice.storyEntries，或有 requirements 的實際 Reaction 及其 storyEntries；固定 storyEntry 本身沒有 requirements。共同 AUTO 正文需對所有路徑成立，不要求不存在的條件文字插值能力。

### 結果與 Journal 的提交邊界

現有順序是節點效果→選中 choice 效果→實際 Reaction 效果→Journal 快照→trace checkpoint。遵守原 history append 次序、sourceHistoryId、eventHistoryId、eventId、sequence、choiceHistoryIndex／reactionHistoryIndex；一般 narrative 不帶 resolvedEventId、不增加節點。Journal.kind 仍是 choice／result／daily，選項原文只由 choiceText 加粗。

改稿的 Journal 是編輯樣稿，並非真的執行紀錄。實作後顯示會有既有「標題：情境／你選擇：」包裝，這次不改 renderer 來刪包裝。每個結果取該次已保存的來源，不由 UI 代寫或以新版目錄回填。人物回應範例均標「若實際抽到」；未回應時只留玩家動作。必須保留 #52 的保存失敗、同一結果重試與閱讀佇列契約。

## ID、Save 與已發生歷史

適用所有改稿的共同相容政策 **V**：

- legacy v1–v7 繼續使用凍結的原包／原 ID／原選項／原反應／原排程，不能直接改 `createMvpContent` 影響舊 pending 及未來路徑。
- 已存在的 v8 `family-events-08a-v1` 也凍結。它目前仍依賴 legacy factory；後續作者應另建不可變新版目錄，不在共用 factory 偷改。既有 release reader 與 Replay 路由都保留。
- 另立新 release（名稱待核定）承載改稿；不是修改 assemblyVersion 讓同 release 換故事。未新增必要 state 欄位時不為文案強升 envelope；是否沿 v8，實作前核對其閉合驗證及 router。
- 同主題但行動語意已改的節點與 choice 配置新 ID；舊 ID 只作對照，不能把 coordinate／carry 偷換成完全不同的動作。下文 N01 等是文件代號，**不是已分配的 Event ID**。
- 新版 queue、requiredEventIds、root 互斥、chain manifest、來源／progress validator 全部指新版 ID；不要將舊 queue 重新指向新版。只在新家庭／明確重抽新故事使用新 release；同家庭 Replay 保留原 release。
- 既有 history／Journal／memory／Review 的字串、ID、來源與索引全部保持；不回填、不重新抽 Reaction、不把舊 pause 改成完成對話。沒有快照的 legacy 仍用既有保守投影。
- 新版本內同家庭、seed、命令、方向、內容重排及 checkpoint restore 必須可重現；不承諾不同 release 仍有相同抽選、PRNG 消耗或結局。未知 release 拒收並保留原 bytes，不猜最新版。

每個事件的補充影響列於改稿表；V 不代表本次執行任何遷移。

## #42、Narrative Quality 與 #52 邊界

已讀取 GitHub [#42](https://github.com/gitmaruneko/parenthood-simulator/issues/42) 與 [#52](https://github.com/gitmaruneko/parenthood-simulator/issues/52) 全文，兩者當時均無 comments。#42 的本機後續決議比 Issue 本文詳細；尤其逐局支持方案已把全量配額從 87 基準列為 90，不能只引用早期規格。

| 工作 | 歸屬 | 理由／依賴 |
| --- | --- | --- |
| 36 新候選使用具體生活場景、2–3 行動、家庭／Actor 過濾、逐選項結果審查 | #42 原範圍 | 本來就須內容審查與家庭條件生效，不需另建題材擴充票 |
| 尚未發布的候選退修、08A 下一版改稿 N15／N16 | #42 | 08A 是該票切片；既存 v1 仍凍結，新版與獨立 Preview 再核定 |
| 跨題共用 Reaction 池拆成場景池、現有 12 入口與兩鏈及反思全面改稿 N01–N14 | **另立 NQ-A** | 是存量品質修訂，不能把 #42 的「增加多入口」默認擴成全遊戲重寫；可在 #42 新 release 中整合，但驗收與工作量獨立 |
| 全新 eligibility 語言、通用人物在場／承諾／交接狀態模型 | 另案，這次不要求 | 現有能力可以用遠端與玩家動作完成本稿，不藉敘事整修擴張引擎 |
| daily-v1、fallback 及 Journal renderer | 保留 | daily 已具體；fallback 維持靜默，不為湊日常而加事件／筆數 |
| 自動推進、間隔、焦點、暫停、保存控制器 | #52，完全排除本次變更 | #52 明確不改事件內容／Engine／Save 契約；NQ 不阻塞該票合併審查 |

**整合規則：**#42 可先交付其新候選與 08A 新版，不因 NQ-A 未完成而自動 blocked；但若其新 release 採用某個 NQ 改稿，該批改稿與相容驗收必須先完成。NQ-A 可用自己的新 release／獨立 preview 驗證，不依賴 #42 全量 90 節點完成。保留第 1／8 階段兩跨 Turn 鏈、第 6 階段真實工具支持／planning 與第 8 階段修復機會；不能用刪光 AUTO 節點簡化審稿。

## Narrative Quality Ticket 拆分基礎

以下三票拆分已由使用者確認。正式發布內容、範圍補充與實際 Issue 連結以 [建票決議](NARRATIVE-TICKETING.md) 為準；保留本節作原拆分對照。

### NQ-A1｜兩條既有鏈：凌晨用品與教室門口

- **交付：**N01、N08、N13、N14，從具體入口、下一 Turn、玩家後續行動直到收束，可在獨立新 release 的 Preview 完整試讀；連同不可變版本路由與舊 release 保留。
- **Blocked by：**無；需本稿內容／相容設計核定才開始實作。不依賴 #52，也不依賴 #42 全量候選。
- **AC：**夜間不向嬰兒要求成人對話；無家人存在亦有 2 合法選項；support／strain 不偽造他人完成；所有正常選項路徑保留 2 Turn／Stage≤6／Turn≤4；第 8 階段有玩家修復嘗試；legacy 及現有 08A pending／queue／歷史續玩完全保留；保存重試不重抽。

### NQ-A2｜餐桌、用品、公園、雨天與休息

- **交付：**N02、N05、N06、N07、N10，在同一新版發行線中有各自具體行動、結果與場景池，完整 Journal／Review 可讀；第 6 階段保留實際工具支持與 planning。
- **Blocked by：**NQ-A1 的不可變新版目錄路由；內容審稿本身可先做，不需等待程式。
- **AC：**每題至少 2 無成人門檻可行選項；不出現共同照顧者／長輩憑空到場；雨天無危險趕路、休息不獨留幼兒；Reflection 不與所選行動矛盾；不以所有選項相同 planning 加減驗收差異；保留第 6 階段支持／planning 的來源證據。

### NQ-A3｜工作、作息、學校通知、相聚與新階段

- **交付：**N03、N04、N09、N11、N12；以家庭條件過濾工作／入園／成人聯絡內容，兩個行動都能得到各自結果與無回覆版本。
- **Blocked by：**NQ-A1 的新版路由；不依賴 NQ-A2 的題材內容。若共用待整合 release，可在最後發行前合驗，不能互相覆寫目錄。
- **AC：**無工作配置不出現下班會議；不同住長輩不寫現場動作；學校情境建立入園事實；聚會不自動添家人／節日；無超齡孩子台詞；固定語料下從入口到結果、讀檔與回顧皆有證據。

N15／N16 列為 #42 的內容修訂清單，無需再建重複票。使用者已授權發布三張 NQ Issues；本次無實作授權。

## 驗收規格

主要 seam 沿用真實 ContentPack→Core Event Engine→Save/Restore→Family Review 公開邊界；UI 僅補確認既有 Dialog／Journal 能顯示 2 選項與來源，不另造敘事執行器。

1. **逐題內容表：**37 個現有節點均有保留／改稿決議；每個改動的 choice 都列情境、動作、機會成本、固定結果、可選 Reaction、none、Actor／Eligibility、ID 對照與新 release。人工審查十項設計方向，不用關鍵字 lint 代替讀稿。
2. **條件正反例：**四個既有基準家庭、48 三維配置、無伴侶／無 support／不同住／availability=0、未知親屬；每個合法入口至少 2 可行選項。以同 seed 只翻轉一維證明工作／家庭限定生效；不把 actorAvailable 當同住／同意。
3. **行動與反應：**逐選項執行，結果只能描述該行動；人物回覆只出現在正確 pool／actor／flag 分支，none 不產生可見回覆或正向記憶。測未詢問、未到場、未發生衝突時不生成假修復完成。
4. **完整流程：**固定既有 #42 corpus；逐鏈選第一／最後／輪替選項與零資源；核 Turn≤4、Stage≤6、根互斥與固定後續無遺漏。第 6 階段 planning 與工具 support 有真實來源，不靠資源數字冒充。修改入口權重／池／配額時重新申報新版分布，不沿用舊報告。
5. **Save／Replay：**legacy v1–v7 與 08A-v1 的 pending、CHOOSE 後、跨 Turn queue、Stage 邊界、完成／Review；保留原字串與引用。新版相同 seed／內容／命令／方向，重排目錄、逐 checkpoint restore、寫入失敗重試結果一致。未知 release 拒收並保留 bytes。
6. **#52 隔離：**本輪文件變更不執行自動推進實作。未來內容票驗證已保存 Journal 可被既有佇列讀取，不改閱讀 timer、焦點、Session 命令、PRNG 或 Save 契約以配合文案。

本次只核對目錄、契約與文件，不聲稱改稿已通過可執行測試。後續功能改動須依 AGENTS.md 加／改測試並用 package.json 的 npm scripts 驗證。

## 來源與文件優先序

- 當前原始碼：[內容工廠](../../src/content/mvp.ts)、[12 題原文](../../src/content/mvp-topics.ts)、[原 Journal 結果](../../src/content/mvp-journal.ts)、[版本路由](../../src/content/releases.ts)、[小車故事](../../src/content/toy-car-story.ts)。
- 契約：[人物](../ACTOR_PROFILES.md)、[Journal](../JOURNAL.md)、[Engine](../EVENT_ENGINE.md)、[Save](../PERSISTENCE.md)，並以當前 schemas／conditions／reactions／snapshotJournal 程式核對實際能力。
- #42：[第二版決議](../specs/ISSUE-42-DESIGN-DECISIONS-V2.md)保留規劃歷史；已實作範圍與 90 節點配額修正以 [08A 切片](../implementation/ISSUE-42-08A-SLICE.md)為準；[候選矩陣](../planning/ISSUE-42-CANDIDATE-MATRIX.md)其餘 35 題仍為提案。
- #52：[自動生活敘事規格](../specs/AUTOMATIC-STORY-PROGRESSION.md)；本文件不改其已核准範圍。

本稿若核定，新增的是未來 release 的內容門檻；不反向把舊規格／過往驗收判成新版本已通過。未找到 GLOSSARY.md 或 docs/adr，按專案約定不因此阻塞。
