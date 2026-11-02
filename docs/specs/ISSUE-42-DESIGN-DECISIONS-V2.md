# Issue #42｜設計決議第二版

> 使用者已核准對應固定鏈、narrative契約及87節點基準。本文保留規劃階段紀錄；相容落地、每局支持／規劃保證及08A試玩實作範圍，以[試玩切片紀錄](../implementation/ISSUE-42-08A-SLICE.md)為準。
狀態：**退修後提案，待確認事件鏈與結果契約；不開始實作**。2026-11-01。

本版承接使用者審查：採已保存家庭資料組裝入口、新舊內容分流；**維持每局兩條跨 Turn 鏈**。69節點不再是上限。36候選仍是選材基礎，不升為正式內容。本版是事件鏈、結果契約、版本欄位的唯一現行決議；[第一版規格](ISSUE-42-EVENT-EXPANSION.md)保留背景、資格／分布測試方法，[候選矩陣](../planning/ISSUE-42-CANDIDATE-MATRIX.md)同步修正樣稿。

## 1. 事件鏈：比較並選定對應固定鏈

比較範圍是第1階段（2個月）與第8階段（39個月）的E／A／B／C入口。其他階段不強制串鏈。既有E兩鏈保留原拓撲；新包只加一般根互斥及經核准的新版本文案，legacy完全不變。

| 方案 | 內容成本 | 玩家節奏 | 最差節點預算／限制 | 決定 |
| --- | --- | --- | --- | --- |
| 各候選有對應固定鏈 | 6個新根各加3後續＝18新節點；需寫6組連貫後續與12個後續選項 | 第一段的物件／選擇帶入下一Turn，只有這兩階段各多一次決策；不突然插入別的家庭故事 | 新根Turn1：根＋fallback＝2；Turn2：重訪＋選擇＋收束＋fallback＝4；階段6。E原鏈3＋3＝6 | **採用** |
| 保留獨立保證鏈機會 | 每階段共用重訪／choice／收束3節點，共多6；總目錄75。六個新根排共用鏈；E已帶鏈，不重複排 | 每個新故事後接同一段該年齡生活，節奏仍是兩Turn；須讓共用前提對所有根成立，容易與剛才的物件／選擇脫節 | 新根Turn1根＋fallback2；Turn2共用3＋fallback1＝4，Stage6。E原鏈仍6。**可在現有引擎與預算內成立**，不是必須重寫引擎 | 可行但不採；比對應方案省12節點，需接受後續故事共用或另寫多組條件文案 |

上述獨立方案的可行版本只需內容層選擇排程：E走原鏈，新根排同階段共用鏈，不需跨階段計數器。若要求「無論E是否已有鏈都再加一條」，才會超過E原有Stage6；若先演獨立鏈，也會擠掉原E長鏈，這兩種安排不採。兩個可行版本都可結構性保證，不能將75方案說成必然超預算；本案明確選擇多寫12個節點，以保留第一段物件與玩家選擇的連續性，避免又回到同一套泛用後續。後續choice的文案也各自寫，不共用提醒／承接模板。

### 結構性保證，不以seed抽中作證

新包在每個保證階段有至少A／B合法根；E及C是否可選不影響下列論證。

1. 每個可選根都屬該階段的chain manifest，沒有不帶鏈的一般入口。入口採正權重、既有抽選器，選任何一個都成立。
2. 每個新根在**節點層**無條件排同階段重訪，`delayTurns=1, priority=10`；不放在某個選項或某個Reaction才排。根所有合法選項都至少兩個，不設資源／成人可用門檻。所有其他根因完成根的互斥條件關閉。
3. Turn1無其他即時節點，ADVANCE只能進fallback；有下一Turn待處理排程，fallback只結束Turn，不結束階段。此時Stage用了2節點，仍有4個預算。
4. 下一個正常操作是既有`getPlayerView.nextInput=START_TURN`。重訪只有`eventCompleted(root)`條件，不綁成人、資源、支持flag、反應、冷卻或記憶；排程不可能因這些條件失效。
5. 重訪固定接對應的後續choice；choice固定接收束，兩者只要求直接前置已完成，至少兩項無門檻選項。Reaction不排其他節點、不改鏈條件、不取消queue；根旗標只用於文案／反應分支。
6. Turn2依序重訪1、choice1、收束1；根已互斥，最後fallback1。Turn2正好4，階段正好6，fallback在上限內完成；不需要第三Turn。**前版若把此路徑算成5，會漏掉最後fallback；本版一律按6預算。**
7. 原E鏈的每個選項仍有下一Turn分支：support無條件；carry使planningLoad至少3，滿足strain；只有選到一條分支，不會同時排兩條。原反應不得清掉此條件或增加插隊節點。沿原3＋3路徑完成，與新根相同地佔滿階段6。

因此任何經正常遊戲流程完成12階段的新局，都在第1及第8階段各完成一條跨Turn鏈，與入口抽選及人物Reaction結果無關。第8階段每條新鏈都提供玩家可執行的「重新聽／重新說」修復機會，不要求對方原諒或對方在場；E也保留修復機會。保證的是**機會與連貫後續完成**，不是強迫孩子、伴侶或長輩產生正向情緒。

保證的命令域為正式Session的繼續生活／合法CHOOSE／方向切換／保存重試與讀檔。引擎另有開發／測試用`COMPLETE_AGE_STAGE`、`CANCEL_SCHEDULED_EVENT`等公開命令，可故意跳過／取消故事；不能宣稱對任意這類命令也保證。正式Session不得暴露提前結束或取消必經鏈的操作。非正常override若使鏈缺漏，報告明列「中止／跳過」，不可算為符合保證的完整遊程；不偷偷生成修復歷史。保存失敗停在checkpoint，恢復後接原queue，不算一局完成也不另排新鏈。

### 六組對應後續（規劃名稱，非正式ID）

每組均為「重訪AUTO→choice→收束AUTO」，本表先定語意，正式Event ID在內容核准後分配。兩個後續選項均無資源／成人門檻；不靠「先做一點／延後／刪一項」區分。

| 根 | 下一Turn重訪場景 | 後續選項與確定的玩家行動 | 收束與證據邊界 |
| --- | --- | --- | --- |
| 01A 圍兜／衣槽 | 天亮再找用品，回想昨夜對衣物的取捨；不論昨夜整理哪種範圍都成立 | ①把常找的那一件放回固定小籃；②把小籃移到自己較順手的位置 | 玩家完成選定的放置動作；不宣稱其他家人照新位置做 |
| 01B 小聲音 | 天亮想起昨夜停下來聽的片刻；不依賴玩家有錄音 | ①用自己的聲音回應眼前咿呀；②坐近一會安靜聽 | 玩家如何陪伴有narrative；孩子是否再次發聲只由Reaction記錄 |
| 01C 月曆空格 | 看見自己昨夜傳訊／縮小工作／寫下界線後，今天仍需核對的時段 | ①說明今晚自己能承擔的界線；②直接提出一段完整任務的詢問 | 兩選項都是玩家做出的表達；成人Reaction可具體同意、部分可用、不同意或無回應，不以取得同意作鏈條件 |
| 08A 小車故事 | 回想聽故事時，自己多想立刻給出答案；這次把不知道的部分留出來 | ①邀孩子補充自己剛才沒聽懂的那一段；②說清楚自己沒有看見現場，不替誰先下結論 | 兩項記玩家的repair嘗試，孩子可補充、說不想講或無回應；收束不判真相／原諒 |
| 08B 睡前補話 | 下一段平靜時間，回想自己上次選擇如何開口；不假設孩子已回應 | ①把對自己語氣的歉意說完整；②邀孩子指出自己漏聽的部分 | 記已說出的歉意／邀請，不能把②寫成已聽到孩子想法；延續修復而非重抽別的衝突 |
| 08C 校門與會議 | 回看昨天對老師的詢問／工作訊息／待查項目，分開已知與未確認 | ①向孩子說明自己的匆忙不代表不想聽；②重新問孩子哪一段想先說給你聽 | 記玩家主動重新連結的repair，不保證老師已回覆或會議已改期；與實際成人回覆分開保存 |

### 配額決議

| 類型 | 計畫目錄數 |
| --- | ---: |
| 既有節點（含fallback與兩條E鏈） | 33 |
| 新一般根（A／B／C×12） | 36 |
| 保證階段六個新根的固定後續（3×6） | 18 |
| **本版基準目錄配額** | **87** |

87是選定架構下可檢算的基準，不是先行核准的硬上限；若作者增加真正分支／後續須逐項核預算。沒有額外18個一般入口。第1／8階段每條路徑Stage6，其他新根root＋fallback＝2，普通E＝3。其餘10階段本輪不加跨Turn鏈，避免每段都被迫拉長。

## 2. 一般敘事結果契約：新增narrative，不借用planning

選定在新內容契約中增加`narrativeEffects.storyEntries[].kind = narrative`，並讓`history.kind`接受narrative。一般成長、玩樂、物件變化及玩家已做動作皆可有獨立結果正文；不再把效果擠進選項標籤，也不偽標planning／support／repair。

| 層次／欄位 | 用途與驗證規則 |
| --- | --- |
| 作者storyEntries.kind=narrative | 結果來源；只描述本來源真正執行的行動／確定結果。text非空、現有actorText引用有效。節點層只寫所有分支都成立的事，選項專屬內容放該choice |
| 新history.kind=narrative | 與原history同樣的唯一id、AgeStage／Turn及append順序；**不帶resolvedEventId**，不是EventNode、不加nodeCount、不作legacy節點恢復計數 |
| Journal.kind=result | 保持既有choice／result／daily三種，不新增第四種顯示卡。sourceHistoryId指該narrative history，eventHistoryId指最近同Turn／階段的已完成事件錨點，eventId吻合；sequence及ID規則照舊 |
| actorIds／reactionHistoryIndex | 玩家自己的narrative可以actorIds=[]；引用孩子／家庭角色須綁原ID。一般結果不得冒填reactionHistoryIndex。別人的未確定回覆／自主行動必須是實際Reaction結果，actorId、poolId、reactionId、history索引一致 |
| 效果與memory | 普通narrative無隱含資源加減、planningLoad或memory。需要才明列效果；關係記憶只記實際發生的事。none不製造支持／衝突記憶 |
| Review／人物檔案 | narrative進同源時間線與選中事件的正文；不自動列入supportMomentIds／repairMomentIds或支持主題，不增加關鍵選擇數。人物檔案只取有綁定的真實記憶／來源 |
| 舊資料 | 不回填、不改kind、不用新版內容重建舊結果。新kind只能由支援新內容契約的發布版本產生 |

沿用現有narrative-effects的「節點效果→選中選項效果→實際Reaction效果」順序、history及Journal建檔時間；本次只是規劃，尚未擴充schema或resolver。此契約不增加EventNode，也不增加PRNG呼叫。Reaction自身照既有規則抽樣；只有新增／調整Reaction池才影響新版的PRNG使用，不宣稱不同內容版本同分布。

### 一句結果的證據責任

- 「你把小車放在兩人中間」可為選中選項的narrative，因為是玩家已執行的動作。
- 「孩子把車轉向你，說不是那樣」只能在該child Reaction實際選中後保存；不能在固定結果裡寫。
- 「對方回傳已查好的路線」是Reaction可直接證明的具體行動成果，與「願意之後幫查」的承諾不同；不能把後者換成前者。
- Reaction可以同時描述該人物實際做出的動作和一句話，不必只剩理解／批評標籤。若需要玩家在收到資訊後再做選擇，另加合法choice節點並重審預算；不能在同節點Reaction暗中替玩家選。
- 「你們笑了一會」「孩子知道了」「家人照約定接手」均有他人參與，除非該來源有具體證據，不是作者填進固定narrative就成立。

## 3. 逐分支修訂與選項差異

已同步修正矩陣05C、11C、10B；下列是正式寫作約束，flag名稱均為提案名稱，非已存在功能。

| 題目 | 分支與結果來源 | 不相容分支 |
| --- | --- | --- |
| 05C | ①詢問路線：該choice設asked-route；Reaction須同時有此flag、caregiver-2經本場景可回應抽樣、正確route-query場景，才可回傳完整路線／指出資訊不足／無回覆；narrative只記玩家問了什麼 | ②走熟悉路、③少一站都不設asked-route；不能收到「答覆這次查詢」。支持標題改成尚未收到資訊的中性題名 |
| 11C | ①問可協助哪項：asked-help；②發出兩件物品的核對問題：asked-items。兩者分別開不同Reaction；②可回問替換物件，但不能認領任務 | ③自行準備無詢問flag；不得收到①或②的回覆。每個Reaction都寫與發出問題對應的句子 |
| 10B | 選項narrative只記玩家玩法。對應child Reaction可演規則、說明「這次不算」、笑或無回應；一個池選一個實際版本 | 選①不固定笑、選②不保證孩子等、選③不保證照玩家問題答。none只保留自己的結果 |

flag生命期：每次根開始先清該題所有舊詢問flag，選中選項才設該次flag；Reaction來源限定該event／contextTag及實際actor，不用全域asked flag串到下一題。固定後續若發出新問題使用該後續專屬flag；不得因舊問題把新回覆假接上。非repeatable／固定唯一occurence仍做場景限制，避免未來重複內容污染。

保留並改寫04A積木、06A襪子、09A紙箱、10B教遊戲及08A小車：至少五題以**玩法、觀點與表達方式**提供不同選擇；02C、05C、09C、11C至少四題可由實際Reaction得到回問、資訊、誤會或已做的小動作，不全停在訊息待回。這是作者交付門檻，不保證每一個seed都收到支持。

矩陣全部36題的Journal也按相同規則複查：孩子繼續抓袋、伸手想再玩、替你選紙片、和你一起收拾或知道了等，均不能是無條件結果。自動節點可以呈現下一段**新場景的可觀察前提**，但不得用場景前提偷渡上一個選項已獲他人同意／支援的結論。

## 4. 一條完整故事的Journal呈現：08A小車

這是**依新契約製作的靜態呈現樣例，不是遊戲已執行紀錄或UI截圖**。用來確認讀感與來源，不假裝已實作。選定路徑：根①「用玩具演一遍，讓孩子改正你的猜想」→child實際抽到「不是那樣」→下一Turn後續①「邀他補充沒聽懂的一段」→child實際抽到補充；抽到none的替代也列出。姓名以既有child-1檔案解析，此處顯示「孩子」。

### 玩家實際會讀到的正文（依發生順序列出供審稿）

> 搶回來的那台小車：孩子拿著小車說起今天和別人都想玩的那一台。你沒在現場，桌上剛好還有另一台玩具車。  
> 你選擇：**用玩具演一遍，讓孩子改正你的猜想。**
>
> 搶回來的那台小車：你把兩台小車放到桌邊，先用自己的那台演出猜想，把不知道的部分留給他說。你還沒有判定事情是怎麼發生的。
>
> 搶回來的那台小車時，孩子：把你的那台車轉了個方向，說：「不是這邊，他是從那裡來的。」

Turn1在fallback完成，fallback不新增留白正文。可能存在的daily按既有規則獨立顯示，與本故事來源分開，這裡不捏造一定抽到的日常。下一次繼續生活進Turn2：

> 小車故事還沒說完：你想到自己剛才多想直接給出答案。回想那段小車故事，你想把不知道的那一段重新留出來。
>
> 把沒聽懂的部分接回來：有些事情還沒有聽明白。你可以再邀他補充，也可以先說清楚自己沒有看見現場。  
> 你選擇：**邀他補充你剛才沒聽懂的那一段。**
>
> 把沒聽懂的部分接回來：你問「你最想讓我知道哪一段」，不替另一個孩子猜理由。這次的邀請已說出口，是否繼續說由孩子決定。
>
> 把沒聽懂的部分接回來時，孩子：指著車輪說：「我本來只是想讓他看這裡。」
>
> 留一個可以再說的位置：你把自己沒看見的部分留作不知道。這一段先停在這裡，不用現在就替故事判輸贏。

正式主畫面仍倒序呈現，最上方是「留一個可以再說的位置」，往下才是補充、repair、後續choice、重訪與第一Turn；同源回顧使用相同快照，不再生成另一份結局。以上不是把整段文字塞進一筆選項，也不是每次按繼續就重述前情。

### 每段的機械來源

| 顯示段 | 來源 | 保存與分類 |
| --- | --- | --- |
| 根情境＋粗體選項 | 根choice accepted；history錨點h1 | Journal choice，choiceHistoryIndex=該次索引，eventHistoryId=h1 |
| 玩家擺車／留問號 | 根選中choice.storyEntries | history.kind=narrative，Journal result，sourceHistoryId=該效果history，eventHistoryId=h1 |
| 孩子改車方向 | 根選中的child Reaction | reactionHistoryIndex=r1，actorId=child-1，kind=neutral；只有此Reaction可寫這句動作／話 |
| 下一Turn重訪 | 該根固定scheduled revisit AUTO | 新事件錨點h2，routine基底結果；不是根多抽一次 |
| 後續情境＋選項 | 固定follow-up choice | 新錨點h3及新的choice索引 |
| 換問法的修復 | 選中follow-up choice.storyEntries | history.kind=repair；只記玩家嘗試，eventHistoryId=h3，不記孩子已被安撫 |
| 孩子補充車輪 | 後續choice實際child Reaction | 新reaction索引r2，actorId=child-1；不是由repair推斷 |
| 最後收束 | 固定close AUTO | routine節點基底結果，新錨點h4，無支援／原諒推斷 |

h1–h4、r1–r2為閱讀用符號，實際ID沿既有Turn／node／來源序號規則產生。最後fallback第6節點完成Stage；不輸出可見空白結果。若r1或r2=none，只省略對應的孩子回應段，所有玩家narrative、後續排程與修復嘗試仍成立；如果孩子說「我現在不想講」，只替換該Reaction，不接車輪補充那句，也不寫「你們已談清楚」。

對照另兩個根選項：②只問最想說的一句→narrative記提出開放問題，Reaction可只回一小句／拒絕／none；③承認沒看到、不判輸贏→narrative記玩家說明，Reaction可更正或不回應。兩條都仍排同一組重訪，重訪文字不要求先出現「轉車方向」；不存在只有①能完成鏈的缺口。

## 5. 家庭組裝與版本欄位定案

採使用者認可的內容組裝方式，不新增家庭enum Condition。以**保存的family、persistentActorIds及replayOrigin人物**組裝頂層及各stage的入口集合，穩定排序、無PRNG；不從當前seed重新生成家庭、姓名或可用性。重載與Replay都走同一個release registry／assembler。配方不以history或當前rngState改入口集合；引擎再按state做去重／選項資格及冷卻。

以下是下次實作的具體版本提案，不是本次已變更的schema：save envelope **v8**、GameState **v2**（新增必要綁定及結果kind）、新內容schema **v2**；legacy ContentPack維持v1，由相容路徑使用。三種版本用途不同，不能互代。

| 持久欄位 | 用途 | 驗證／相容規則 |
| --- | --- | --- |
| envelope.schemaVersion=8 | 選擇存檔reader／migration | strict object；未知版本保留raw bytes並拒絕。不讓舊v7reader接受v8 |
| state.schemaVersion=2 | 辨識含contentBinding／narrative的新狀態契約 | v1–v7先用各自凍結的舊schema驗證，再遷移；不能因共用enum擴充而讓舊檔接受narrative或新欄位 |
| state.contentBinding.releaseId | 指向不可變內容發布清單，如mvp-legacy-v1／family-events-v1 | 已知白名單；一個ID永久綁同一份文案、節點、Reaction、Journal目錄與manifest摘要；未知或檔案缺失拒絕，不降到最新版 |
| state.contentBinding.assemblyVersion | 指定該release採用的組裝規則 | 整數且須與release manifest相符，不是隨存檔任意指定的開關；legacy=1、擴充首版=2 |
| state.contentBinding.familyKey | 偵測保存家庭與組裝目標不一致 | SHA-256小寫64hex；對固定鍵序的JSON `{householdComposition,careParticipation,workArrangement,childId,persistentActors}`（無空白，UTF-8）計算；persistentActors為實際成員的`{id,role}`依id升序。角色來自該release已知actor目錄，非預覽人物成員推定。比對不符拒絕，不自行修正家庭或key |

familyKey**不是防竄改簽章**、不納入姓名／資源／反應／rngState／目前進度；它只核對組裝資格的輸入。同一家庭換角色參數不應改入口資格；actor參數仍由既有保存的replayOrigin供引擎使用。release manifest摘要存於隨程式發布的registry，用建置／測試驗證；不在state再放一份可自行宣稱正確的catalog hash。人物角色缺失或不符先報錯，不以忽略角色補過驗證。

綁定只在state一處保存，Replay將同一binding複製到重建的初始state，不在replayOrigin放第二份可互相衝突的版本。新包要求完整replayOrigin與actorProfiles；legacy無origin仍保留現有「同seed重建、無法保證原始開局」的已知限制，不偽造當時資源或人物。v1–v7合法舊局一律綁legacy、assemblyVersion=1，由原family算key；不把缺版本視為可以使用新包。

restore先讀版本並做純驗證／migration，綁定解析及組裝後再檢查pending／queue／history引用屬於該release，最後才可續玩；讀檔不寫回。確認遷移後沿現有備份與expectedRawData規則保存v8。release綁定在一局內不可變；選新故事可用新包，相同家庭Replay不得偷升內容。方向切換不影響familyKey或組裝集合。

legacy回歸沿用舊golden；跨格式比較僅允許envelope版本、state版本與新增contentBinding的明列metadata差異，原人物、資源、rngState、命令、事件、反應、排程、history與Journal正文／來源不能列入忽略欄位。同一新內容版本的不中斷／重載／Replay比較仍包含全部欄位，不排除metadata。原始存檔bytes以備份保留，遷移後新格式bytes不宣稱與原檔完全一致。

新包restore還要核對chain manifest的**進度義務**，不能只檢查引用ID存在：根已完成但重訪未發生時，須有對應pending排程；重訪後須有下一choice的immediate queue或正在等待該choice；choice後須有close的queue或已完成close。保證階段已結束須具備該根對應的完整後續歷史（包括E分支），不能在queue被刪掉後靠fallback冒充完成。跨checkpoint允許的狀態逐一列在manifest驗證器；不符回報invalid-data並保留原檔，不自動重建排程。這項新包語意驗證不對legacy補造新義務。

## 6. 驗收：結構證明、分支窮舉與固定語料各負其責

沿用第一版固定4096語料、48家庭×12階段×6方向與事前分布容差。保證鏈是排程，不列一般候選抽選；新增後續Reaction會改變新版後面stage的rngState，所以完整局頻率重新報告，不與legacy宣稱同分布。

實作前作者必須交付chain manifest（8根：兩E＋六新根、stage、schedule、立即後續、保證修復機會、每路徑Turn／Stage預算）。validators以內容圖／實際條件檢查「每個可選根都滿足」，而不是抽幾個seed碰巧看見兩鏈：

1. 列出第1／8階段各家庭組裝後全部根；逐根、逐合法root choice、逐follow-up choice檢查無條件排程與至少兩合法選項。E的carry→strain以狀態下界證明planningLoad≥3；若修改Reaction會破壞下界則拒絕內容。
2. 檢查新鏈後續無資源／成人／反應門檻、無冷卻／重訪、無新增queue、無其他入口可再入池。所有反應的資源及旗標效果不能使後續失效；zero資源與成人availability=0仍完成。對故意少排一個根、插入第三候選、加入條件、增加一個節點的破壞性fixture，驗證器必須拒絕。
3. 在核心公開邊界逐路徑執行（非統計抽選測試可以釘選根），核對每局兩階段都有已消耗的跨Turn排程、實際重訪／後續選擇／收束及第8階段repair機會；root只出現一次，Turn≤4、Stage≤6。不以fallback安全結束取代缺失後續。
4. 48家庭及角色mask都測組裝：原局、serialize/restore後、Replay後的排序entry集合與binding完全一致；改來源陣列順序仍一致。資源／進度／方向改動只影響引擎資格與權重，不影響組裝身份。保存Turn1 fallback之後的queue，重載不重排、不重抽，Turn2能如期接續。
5. 結果契約測試：narrative確實成為獨立可見result；未選分支無結果；none無假對白；05C②／③永不出現asked-route回覆；11C兩種問題不串台；10B固定結果不含孩子笑。每筆Journal可追到唯一history／event錨點，Reaction回應索引正確。
6. narrative不增加nodeCount／關鍵選擇／support或repair統計；Stage恢復計數不誤計；新增結果的checkpoint、失敗重試、資料重排、Review全文及Replay相同。不回填舊history，舊v1–v7 reader拒收新kind；binding錯誤／未知release／familyKey不符保留原檔。
7. 四基準家庭固定seed9／1／11／2及長程語料再作整局回歸／分布；它們是執行證據，**不是逐局保證的邏輯根據**。正式Session無提前COMPLETE／取消保證鏈命令；若將來開放，必須重新審查保證域。

## 7. CSV清理與本輪交付界線

原CSV的Source欄確實直接帶入146個Markdown連結；本機檢查未發現使用者提到的`**`、HTML entity或Markdown反斜線跳脫，但仍作完整清理：純文字欄位與SourceRefs分開、解碼entity、移除排版標記、連結目標正規化成repository-relative路徑或https URL。清理後維持143唯一ID、原Idea／Unassigned、36候選對應及49母題關聯；不得因清理增加／合併紀錄。

本輪只修改本文件、第一版的現行指標、候選樣稿與盤點CSV。沒有新增EventNode、一般結果schema、save v8或測試程式，也沒有發布／改GitHub。下一步只待確認本版的**逐局兩鏈方案與narrative結果契約**，確認後才進相容邊界及36候選的分批實作；87基準配額、具體欄位與樣稿可一併審查。

本輪文件檢查：36候選段落、143唯一盤點ID、49母題對應與來源路徑均一致；CSV排版標記檢查通過，兩方案配額75／87與最差Stage6已核算，固定語料摘要維持第一版。沒有重跑遊戲測試；前輪56項通過只屬既有基線，不是本版契約或事件鏈已實作的證據。
