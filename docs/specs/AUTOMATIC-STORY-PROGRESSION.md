GitHub Issue：[規格 #52](https://github.com/gitmaruneko/parenthood-simulator/issues/52)

## Status / Approved Decisions

**2026-11-02 使用者已核准規格方向與 Testing Seam，授權整合修正、拆票、依序實作、每票獨立 Review／驗收與 PR。** 不自行 Merge 或部署正式站。

已核准修正：
- 每筆閱讀間隔 2–8 秒、AgeStage 提示約 2 秒，均為 UI 常數，不影響 GameState、PRNG、結果或保存內容。
- 第一版只有暫停／恢復及快速顯示，無完整速度選單。
- 快速顯示只揭露本次已成功保存的 Journal；不執行事件、不代選，之後無強制額外 3 秒等待。
- 閱讀舊紀錄時停止後續推進並保護捲動／焦點；pending 只顯示明確提示與入口，不強開 Dialog。
- 回最新可解除 context pause；手動暫停須跨換頁、重掛載、重新整理保留，以獨立 UI preference 保存，不改遊戲存檔契約。
- 已接受命令按原 checkpoint 契約完成；暫停只阻止後續命令。
- 真實 Session／SaveStorage／可控時鐘與可見性為主要 seam；補強同 seed 確定性、第 N checkpoint 失敗、跨重新整理暫停、舊紀錄 pending、StrictMode／重掛載／換頁／舊 timer。
- 保留 v7 legacy 與 v8 bound 回歸，不改引擎、Scheduler、PRNG、事件內容或存檔契約。

## Problem Statement

《今天也在養小孩》目前雖以 Journal 作為主畫面，玩家仍須反覆按「繼續生活」才能遇到日常。這個操作打斷生活自然發生的感受。直接連發現有命令則可能一次出現大量文字、連續開啟重大抉擇，或在讀取舊紀錄時搶走焦點。

## Solution

進入可互動的家庭生活後，使用既有公開 Session 命令，逐次推進生活；每次都等待命令與保存完成，並給已發生的紀錄閱讀時間，再決定是否繼續。一般事件不需要確認，只有 PLAYER_INPUT_REQUIRED 使用既有重大抉擇 Dialog。

玩家選擇成功保存後，返回 Journal，呈現選擇及實際結果，經過閱讀節奏後自動恢復。必要抉擇不會被略過，也不新增「閱讀完畢」關卡。

## Current Flow / Impact Analysis

- 主畫面「繼續生活」→ Session.advance → getPlayerView.nextInput → transitionAndSave → transitionGame → Session 更新 snapshot → Journal / Decision Dialog。
- nextInput 在待選或遊戲結束時為 null；AgeStage 已結束時為 NEXT_AGE_STAGE；Turn 已結束時為 START_TURN；其餘為 ADVANCE。這些判斷已有公開投影，UI 無須重做。
- ADVANCE 單次可處理多個 AUTO_ADVANCE EventNode，預設最多四個，可能同時產生多筆 Journal；在必要玩家輸入、fallback、cycle protection、Turn / AgeStage 預算等邊界停下。
- CHOOSE 只結算目前選擇；不自動送下一次推進。Session 以 run generation / Turn / event / node occurrence key、防忙碌與未保存檢查防止舊回呼與重複選擇。
- transitionAndSave 先執行純引擎，再逐一保存 trace checkpoints；第一個寫入失敗即停止寫入。記憶體可能已有尚未全部保存的結果，不能把命令 Promise 完成當成保存成功。
- Session 保留已接受但未保存的選擇及其結果。retrySave / retryDecisionSave 只重存同一狀態，不重送 CHOOSE、不重新抽選。
- Journal 已是同源投影、最新置頂，choiceText 已使用粗體；繼續沿用來源 ID 與保存文字。
- 現有 GameScreen 隨 event / history 更新聚焦標題；App 在選擇後聚焦最新紀錄。自動敘事須調整這兩處，避免自動更新干擾舊紀錄閱讀。
- 新家庭的 startFamily 已保存家庭並送首個 ADVANCE；控制器只能接續這次命令，不能另送一個「初始 ADVANCE」。
- 目前同時支援 legacy v7 與 content-bound preview v8；新故事已有 #42 的 08A preview 綁定。需兩條讀檔路徑回歸，但本票不修改內容綁定或版本。

## User Stories

1. 作為玩家，我希望開始家庭生活後日常自然出現，不必反覆按「繼續生活」。
2. 作為玩家，我希望只在必要選擇時被 Dialog 中斷。
3. 作為玩家，我希望選擇保存成功後直接看到實際結果，生活自動繼續。
4. 作為玩家，我希望有足夠時間閱讀一段紀錄，再遇到下一段或下一個 Dialog。
5. 作為玩家，我希望自己的選擇以粗體呈現，其餘已發生結果維持一般字重。
6. 作為玩家，我希望成長階段的轉換有簡短時間提示，無須額外確認。
7. 作為閱讀舊紀錄的玩家，我希望新內容不改變我正在看的位置。
8. 作為玩家，我希望隨時暫停、恢復或快速顯示目前已發生的內容。
9. 作為減少動態效果的玩家，我希望完整閱讀內容而不受動畫影響。
10. 作為手機或桌面玩家，我希望使用同一份故事、同一組進度規則。
11. 作為返回遊戲的玩家，我希望從最後成功保存的狀態繼續，不重播已結算事件。
12. 作為遇到保存失敗的玩家，我希望保留本次結果並安全重試，不重新抽選。
13. 作為使用鍵盤或螢幕閱讀器的玩家，我希望焦點與敘事提示可預期。
14. 作為完成遊戲的玩家，我希望最後紀錄可讀完，再進入既有回顧。

## Implementation Decisions（已核准）

### 1. 推進控制器與公開命令

- 在 Session / presentation 邊界新增可停止的敘事控制器。每個 Session 僅有一個控制器；React 元件透過可清理的訂閱或 attach / detach 表達可見性，重繪本身不發命令。
- 控制器只呼叫現有 advance；選擇仍由既有 choose 提交。不得直接修改 GameState、呼叫引擎推測結果、計算 eligibility、操控 Scheduler 或 PRNG。
- 若需額外公開資訊，只新增唯讀 presentation revision / run identity，或 Session 層 controller API；不更動 EngineInput、GameState、存檔 schema 或既有命令語義。
- 自動推進條件：game 頁、前景可見且具有有效互動宿主、Journal 敘事視圖啟用、未手動暫停、未讀舊紀錄、無 Dialog / pending decision、非 busy、無 error / unsaved、未完成、nextInput 非 null、先前顯示佇列與閱讀間隔已完成、無待處理的使用者 Session 命令。
- 一次最多一個 in-flight command、一個待觸發 timer。命令前再次讀取最新 snapshot 並驗證 run / revision 與可推進條件。await 後檢查 error、hasUnsavedChanges、decision 與 completed，而非只看 Promise。
- 家庭生活方向命令與自動推進序列化；已排隊的玩家方向更新先保存，再抽選下一個尚未選取的事件。方向更新本身不新增 Journal，也不觸發重複顯示。
- busy 或已接受命令無法回滾；暫停只禁止後續命令。這次命令的保存仍依原契約完成。

### 2. 閱讀節奏與多筆結果

- 引擎執行與文字顯示分離。單次命令產生的已保存紀錄，可在 presentation 佇列逐筆呈現；不可為了逐字動畫拆開引擎結算、改 maxAutoAdvanceNodes、少存 checkpoint 或延後必要保存。
- 以 Journal 穩定 ID 去重；依原始 history / source-local 順序逐筆揭露，新紀錄插入頂端，最終列表保持最新置頂。選擇與其結果來自實際投影，不由 UI 自行撰寫。
- 預設每筆顯示後的閱讀間隔為 依每秒約 12 字估算並限制於 2–8 秒；進入 AgeStage 的簡短時間／成長提示約 2 秒。以上為 UX 呈現常數，不進 PRNG 或存檔。
- 不採必要逐字動畫；可用短淡入，減少動態效果時立即完整顯示單筆。減少動態效果不等於取消閱讀間隔。
- 「快速顯示」只立即揭露目前命令已產生且已保存的佇列，完成後無強制額外 3 秒等待才開啟待選 Dialog；不批次執行未來命令、不代選。暫停時仍可顯示已保存內容。
- 只完成無可見紀錄的 START_TURN 等命令時，仍在下一個獨立排程 tick 推進（250ms），不可使用同步 while / 遞迴耗盡整局。
- 讀檔時已有的 Journal 視為已發生、直接可讀，不重播顯示佇列、不再執行事件。若重掛載發生在分批顯示中，可直接顯示當前已保存全文；不得重新生成事件或另開推進迴圈。

### 3. Dialog 與保存優先權

- Session 一出現 pending decision，立即停止命令推進。一般事件、Turn 或 AgeStage 不開抉擇 Dialog；既有新故事確認／存檔復原 Dialog 保留原用途。
- 若同一命令先產生日常再遇到 pending decision，先顯示已保存紀錄並完成間隔，再顯示唯一待選 Dialog；Session 的 pending 狀態與選項不被更改。等待顯示期間不發推進、選擇命令。
- 讀檔已有 pending decision：最新閱讀區恢復同一 occurrence Dialog；舊紀錄僅顯示待選入口，不強開 Dialog、不先送 advance。
- CHOOSE 成功且保存成功後關閉 Dialog，返回 Journal 並顯示本次選擇與實際結果；完成閱讀間隔後才可再推進。即使下一事件仍是必要抉擇，也先保留這段可閱讀時間，禁止 Dialog 疊開；快速顯示本次結果後可直接開啟待選 Dialog。
- pending checkpoint 寫入失敗，或 CHOOSE 已接受但保存失敗：保存復原 UI 優先於動畫與閱讀佇列，立即可操作，停止所有後續自動命令。已接受選擇仍保留原 Dialog 的 unsaved 結果與既有重試／重新讀取。
- 保存成功前，不將尚未保存結果混入「已保存紀錄」呈現佇列；如需呈現本次記憶體結果，限既有明確標示未保存的復原介面，不假稱已落盤。
- retry 成功只保存同一記憶體狀態，再將結果加入呈現佇列並恢復；仍 pending 的重試只恢復同一 Dialog，不自動選擇。不可重送已接受的 CHOOSE 或 ADVANCE。
- save-changed / invalid-data 等不可重試情況維持既有復原流程，不自動覆寫。最後成功 checkpoint 是重新開啟後的唯一恢復依據。

### 4. 停止、恢復、防重與有限執行

- 區分 running、waiting-for-display、waiting-for-choice、user-paused、context-paused、save-blocked、faulted、completed；可用等價內部狀態表示，外部行為必須可驗證。
- 離開 game、關閉互動宿主／卸載、hidden / pagehide、進入其他資訊視圖、讀舊紀錄時取消 timer 並使舊回呼失效。回前景可恢復 context-paused；手動暫停保留至玩家恢復，透過獨立 UI preference 跨重新整理保存；偏好寫入失敗時提示並保留本次暫停，不改遊戲存檔。恢復不補算離線時間、不追趕漏掉的 timer。
- run generation、owner token、snapshot revision 共同保護舊 timer、重掛載、換局／讀檔與重入。Session 自身 busy / needsSave 與 occurrence key 保護仍保留。
- 進度證明依 Session 的已確認狀態 revision / progress identity，而非畫面動畫或字數；無狀態變化卻仍要求同一命令時停止並呈現可恢復錯誤，不自動重試。
- 另設控制器 watchdog：同一 AgeStage 連續自動命令最多 64 次，遇必要玩家輸入或跨 Stage 才重置；超限停止並顯示診斷／返回首頁讀檔，不自動 reset 後繼續。這是排程防護，不改引擎 4 / 6 EventNode 預算。完整 12 階段測試必須證明合法內容不觸發此上限。
- 引擎安全結束某 Turn / AgeStage 後，只使用下一個公開 nextInput 接續；不把安全邊界當成可越過的 pending、不自行補事件。遊戲 completed 立即停止命令，最後佇列可讀完後進入既有回顧。

### 5. 桌面／手機、焦點與捲動

- 桌面保留家庭／心事側欄，中央 Journal 成為主要敘事。移除大型「繼續生活」標題與按鈕，提供小型狀態、暫停／恢復、快速顯示控制。
- 手機保留既有資訊導覽，生活／紀錄使用同一份 Journal 與顯示游標，不各建 Session 或計時器。切換非敘事資訊視圖暫停，返回才依條件恢復；桌面若進入遮住敘事的資訊視圖也採相同規則。
- 進入舊紀錄閱讀區域時 context-pause；回到最新處可自動恢復，若原為手動暫停仍保持暫停。pending 時提供明確待選提示與入口，閱讀舊紀錄時不強開 Dialog。可用非必要「有 N 筆新紀錄／回到最新」入口。
- 已在執行的命令仍可能插入新紀錄；以前方可見穩定 record ID 與 viewport offset 保存閱讀錨點，補償 prepend 的高度變化（包含延遲 layout），不得強制 scroll-to-top 或 focus。一般更新不移動焦點。
- 初次進入遊戲可聚焦 Journal 標題；只有實際開啟必要 Dialog 才將焦點移入並維持既有 inert、焦點限制、Escape 防略過及長選項操作。
- 選後若原在最新閱讀區，可定位本次新增紀錄；原在舊紀錄時，Dialog 關閉後以 preventScroll 恢復原焦點／錨點並提示有新內容。這是本需求對 #39「成功後一律定位最新」的明確調整。
- AgeStage 提示為非 modal 的呈現層時間／成長文字，取用既有 stage / age label；不新增歷史、事件、PRNG draw 或必要點擊。讀檔不補造跨 Stage 提示。
- 使用簡短 polite 狀態播報新增內容，避免反覆朗讀完整 Journal；320px、短螢幕、200% 文字、鍵盤與減少動態效果均可操作。

## Acceptance Criteria

- [ ] AC1 主敘事移除大型「繼續生活」標題與按鈕；開始／繼續家庭生活後，自動看見一般事件，不需確認。
- [ ] AC2 自動流程只呼叫公開 Session 命令；nextInput 決定 ADVANCE / START_TURN / NEXT_AGE_STAGE；UI 不修改 GameState、不自行判定結果。
- [ ] AC3 新紀錄依來源順序逐筆出現並最新置頂；choiceText 粗體，其餘結果一般字重，文字來自已發生 Journal。
- [ ] AC4 只有 PLAYER_INPUT_REQUIRED 觸發抉擇 Dialog；待選時零額外自動命令、不代選；任一時點最多一個抉擇 Dialog。
- [ ] AC5 選擇保存成功後返回 Journal，顯示選擇及實際結果，經閱讀間隔自動恢復；快速顯示可略過剩餘間隔，無額外 3 秒等待。
- [ ] AC6 多節點命令的文字分批顯示，佇列完成前不執行下一命令；閱讀間隔、快速顯示與減少動態效果遵守已核准規則（每筆 2–8 秒、Stage 約 2 秒，無速度選單）。
- [ ] AC7 AgeStage 轉換有無須確認的時間／成長提示；Turn、4 / 6 預算、安全終止與 completed 依既有語義處理；結尾紀錄可讀完。
- [ ] AC8 暫停、頁面 hidden、離開／卸載、資訊視圖切換、閱讀舊紀錄都可停止後續推進；安全恢復不補算離線事件；手動暫停跨重新整理保留。
- [ ] AC9 重繪、StrictMode effect 重啟、同 Session 重掛載、快速暫停恢復、舊 timer、讀檔或換局，不重複命令／事件／Journal／Dialog；最多一個命令在執行。
- [ ] AC10 所有已確認變化沿用現有 checkpoint 保存規則；任何保存失敗或命令錯誤立即停止後續自動命令，復原介面不受動畫阻擋。
- [ ] AC11 pending checkpoint、已接受 CHOOSE、多 checkpoint 中途保存失敗均保留既有重試；重試不重新抽選、不重送命令。衝突不覆寫他人存檔。
- [ ] AC12 讀檔恢復 pending occurrence、Turn 中途／結束、AgeStage 邊界與已完成狀態正確；只顯示已存歷史，不補造／重執行事件。
- [ ] AC13 閱讀舊紀錄時自動新增不強制變更可見 record 及 viewport offset、不搶焦點；Dialog 返回尊重原閱讀位置；舊紀錄 pending 僅提示入口、不強開。
- [ ] AC14 手機／桌面共用敘事資料、Session、顯示佇列與進度規則；鍵盤、長 Dialog、短螢幕與減少動態效果可用。
- [ ] AC15 同初始 state、內容版本、seed、選擇與方向命令順序下，手動與自動流程的 PRNG、資源、事件／反應／排程、預算、Journal 與回顧一致；改顯示速度不改結果。
- [ ] AC16 無進度與 watchdog 測試可有限停止；四種固定家庭完整 12 階段不漏必要選擇、不誤觸 watchdog。
- [ ] AC17 依核准規格拆票／實作；每票獨立 Review／驗收及 PR，完成時更新相關 UX／Journal／Dialog 文件並提供適用 npm 驗證證據；不自行 Merge 或部署。

## Dependencies

實作切片：#53 安全自動敘事與節奏 → #54 舊紀錄／待選保護與暫停偏好 → #55 整合驗收／Preview。每票獨立 Review、驗收與 PR；後票可基於前票已驗收但未 Merge 的分支接續。

- #38（已完成）：沿用 Journal 主畫面、來源與日常去重；本票替換其手動推進操作。
- #39（已完成）：沿用重大抉擇、occurrence 防重、保存失敗恢復；調整選後焦點以遵守舊紀錄閱讀保護。
- #40（已完成）：沿用完整遊戲、存檔、回顧與裝置驗收基線；自動推進需更新其中手動按鈕斷言。
- #42：平行內容工作，**不阻塞本需求，也不納入本票**。驗證目前已綁定 08A preview 的相容性，不擴充或重設內容。
- Blocked by：無規格確認阻擋，使用者已核准；依子票依賴實作。

## Testing Seam / Testing Decisions

主要 seam：**真實 PlayerSession + SaveStorage 公開行為**。沿用現有 Session / decision / persistence 測試寫法，以固定 seed、真實 ContentPack、可拒寫的儲存 adapter 與可控制時鐘驗證 snapshot 與實際落盤資料。只在時鐘／宿主可見性邊界注入，不 mock 引擎或複製 Scheduler 演算法。

輔助 seam：React 呈現及既有桌面／手機 Playwright；驗證瀏覽器原生 Dialog、實際捲動／焦點與 CSS 字重。偽時鐘測試控制閱讀間隔，不以真實長時間 sleep 驗證節奏；真實瀏覽器補足 layout 與互動。

| 案例 | 可觀察結果 |
| --- | --- |
| 新家庭／非 pending 讀檔 | 首個 ADVANCE 不重送；無額外點擊自動續進 |
| 單命令多筆 Journal | 依序揭露、最新置頂；佇列未完時無下一命令 |
| 日常後接 pending / 連續兩個抉擇 | 前文先可讀；最多一個 Dialog；選後結果有間隔 |
| pending 讀檔、重掛載、StrictMode、重複 callback | 同 occurrence，一次提交；歷史與 RNG 不變 |
| 同 tick 雙擊 / Enter + click | CHOOSE 只接受一次；未保存時不可另選 |
| Quota / Security、pending checkpoint 或第 N 次寫入失敗 | 後續自動命令停止；retry 只保存原結果 |
| save-changed / invalid-data | 不覆寫、不自動重試；提供既有復原 |
| busy／方向更新排隊／暫停恢復競態 | 一個 in-flight；使用者方向先保存；無 stale timer |
| hidden / pagehide／卸載／首頁／資訊視圖 | 停止後續命令；回前景不 catch-up；手動暫停跨重新整理保留，不被覆蓋 |
| Turn / Stage 邊界、fallback、cycle、4 / 6 預算 | 使用公開 nextInput；成長提示無點擊、無新 draw |
| 無進度／超 watchdog 的 session stub | 有限停止；明確 fault，不形成背景迴圈 |
| 手機與桌面捲讀舊紀錄，遇 in-flight 新增 | 同 record 同 offset；不搶焦點；可選擇回最新 |
| 快速顯示／減少動態效果／不同閱讀速度 | 只影響呈現；同命令序列的存檔與 RNG 相同 |
| v1–v6 既有遷移、v7 legacy、v8 bound、損壞／未知版本 | 保留既有遷移／拒絕規則；pending 不重抽 |
| 四種既有固定家庭完整 12 階段 | 選擇不漏、最終停止、最後結果可讀、回顧／重玩可用 |

既有機械一致性與歷史 save fixtures 繼續作為回歸來源。手動／自動比對須保持相同玩家命令及方向插入順序；不能以牆鐘時間推斷玩家輸入相同。

實作完成時使用 package.json scripts：npm test、npm run typecheck、npm run build、npm run test:e2e。測試新增聚焦控制器與外部行為；既有 UI/E2E 對「繼續生活」與立即定位最新的斷言改成新流程。真實手機與螢幕閱讀器人工驗收另記，不以模擬裝置結果冒充。

## Out of Scope

- Event Engine、Scheduler、PRNG、EventNode 預算、事件結果與存檔契約變更。
- #42 的生活事件擴充、候選矩陣、內容配額或分布調整。
- 離線收益、網站關閉後背景事件、跨裝置同步、多分頁分散鎖。
- 自動替玩家做選擇、跳過必要 Dialog、額外必按的閱讀確認。
- 自行 Merge 或直接部署正式站；僅提供獨立 Preview。

## Further Notes

本規格以目前 checkout 的程式與 #38 / #39 / #40 / #42 為分析依據。保存 expected-bytes 只是既有 optimistic conflict check，不宣稱本需求能提供跨分頁 exactly-once 交易。前景互動內以 Session 單一 owner 與保存邊界避免重入；重新開啟以最後成功保存 checkpoint 為準。

決議：使用者已核准上述修正版及 Testing Seam；依序拆票、實作、每票獨立 Review／驗收與 PR，提供 Preview／測試證據／人工驗收清單。

