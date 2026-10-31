# UX v2 全局整合驗收 — Issue #40（T6）

日期：2026-11-01（Asia/Taipei）。基準：`main@96f83dd`，已合併 #39／PR #49。
本票只做整合驗證、樣本及文件補正；不新增事件、不改 Engine、不發布正式版本。
本報告補充 [MVP 驗收](MVP_ACCEPTANCE.md)，不以舊版人測紀錄替代新版 UX 的人工簽核。

## 四種基準與完整流程

固定 seed，不在測試中搜尋「會通過的家庭」。Session 各走 coordinate／carry 兩條路徑，
修復選 pause；瀏覽器採下表路徑，在桌面與手機各跑四局。每局完整十二階段，逐次比對
真實 LocalStorage state 與 Engine 公開命令結果；沒有跳到預製終局。

| 基準家庭 | Seed | 瀏覽器路徑 | Journal 筆數 | 日常 | 玩家選擇 |
| --- | --- | --- | --- | --- | --- |
| 單一照顧者＋備援 | 9 | carry | 52 | 4 | 14 |
| 雙照顧者共同分工 | 1 | coordinate | 57 | 4 | 14 |
| 雙照顧者偽單親參與 | 11 | carry | 57 | 4 | 14 |
| 多世代、分工待協調 | 2 | coordinate | 55 | 4 | 14 |

每局到達 12 個 AgeStage、31 個不同 resolved Event ID（含共用 fallback），保留 18 筆
排程紀錄。這是既有 33 節點目錄中選定分支的結果，不代表新增事件。每個 Turn 最多
4 個節點、每階段最多 6 個；四筆 daily 不計入預算，也不進重大時刻或支持／修復候選。

證據接縫：`tests/ux-v2-integration.test.ts`、`tests/e2e/ux-v2-acceptance.spec.ts`。
瀏覽器逐局輸出 `test-results/<case>/family-acceptance.json` 與截圖；保留摘要見
[執行資料](examples/UX-V2-T6-RUNS.json)。

## 確定性與同一份事實

- 既有 `tests/journal.test.ts` 的八條 pre-T3 固定輸入 trace 持續通過。基準檔在敘事改版前產生，沒有以本輪結果重建；只排除文字、Journal、daily 及其時間線 ID，其餘資源、PRNG、事件、反應、排程、原 history 錨點及節點預算全保留。
- 例如 seed 42／coordinate 的完整機械 trace SHA-256 為 `db5a8f3747de5d54888293b7149c2962792163c7baf732f14f015d3f83e9a306`。其餘七條見 `tests/helpers/journal-mechanics-golden.json`。
- 新增八條四家庭 Session 全程測試，逐命令比對 Engine 完整 state；每個 trace checkpoint 均 round-trip，實際重建 Session 驗證 pending 及 Turn 中途恢復。
- Dialog 選項逐項比對公開 pendingEvent；選擇只送 CHOOSE，繼續只送 nextInput，沒有額外閱讀閘門。讀檔／手機換頁不改 bytes，日常不重複。
- Journal 最新在上，只有已確認選項原文粗體。時間線逐筆比對同源文字及唯一 journal ID，不把 reactionHistory 再附加一次。
- 反應必須對應實際 reactionHistory；家庭 actorId 必須屬於該局，none 不形成可見人物反應。每次尚待執行的 schedule 都驗證沒有提前形成 Event history／Journal；測試要求確實觀察到待排程狀態，避免空集合通過。
- 回顧保留十二段、三個可調整時刻、支持／修復、主題及分享 allowlist。daily 可在時間線閱讀，移除 daily 後主題不變，不能冒充選擇或支援證據。
- 四種家庭都驗證相同 seed 重玩與新 seed 家庭的實際開局；舊終局先備份，保存成功前不取代原檔。同 seed 保留 replayOrigin 開場，清空舊歷史；新家庭不繼承原 Journal。

## 存檔版本落差與驗收矩陣

**正式格式為 Save envelope v7／GameState v1。** #40 原始 AC 只列 v1／v2／v3，
早期影響分析還有 v4 提案；這些不是現行格式。已補正 UI/UX §11.8 及原計畫的版本註記，
本票沒有再升版本。

| 版本 | 真實契約／來源 | 本輪補充與沿用驗證 |
| --- | --- | --- |
| v1／v2 | 無人物檔案、無 Journal；v1 未包 envelope | 以真實 v3 狀態依舊契約移除 direction 形成明確標示的衍生案例；pending、中途、自選終局均驗證。不是聲稱取得當年實機檔案。 |
| v3 | direction 必填；歷史 `5680512` 的正式程式 | 真實 pending／中途／自選三個時刻終局；未知人物資訊保留 unknown，不重新命名。 |
| v4 | v1 人物檔案；沿用 T2 凍結樣本 | 開場與家庭配置、pending／中途，身份與原始 bytes 不變。 |
| v5 | 明確親屬稱謂／支援人物檔案版本；沿用 T3 凍結樣本 | 開場、pending、中途、終局；來源文字、人物與回顧引用不改寫。 |
| v6 | choice／result Journal；歷史 `9b1a3d2` 的正式程式 | 真實 pending／中途／自選終局；按 v6 舊 schema 驗證，不接受偽裝成 v6 的 daily。 |
| v7 | daily 快照，T5 沿用 | 每個全程 checkpoint 精確恢復；pending、中途、含 daily 的終局與自選時刻；不補造已完成 Turn。 |
| 無 replayOrigin | v6 真實終局衍生、再 round-trip 為 v7 | 原歷史與選擇可讀；重玩退回 seed 預設開場及中性未知身份，不能保證原姓名／問卷／開場資源。UI 在按鈕前及 aria-describedby 明示。 |
| 損壞／未知 | 負 PRNG、截斷 JSON、缺欄位、版本 8／99、來源錯掛等 | 保留 raw bytes、拒絕普通保存覆蓋；既有確認恢復、Quota、拒絕存取及跨分頁衝突 E2E 保留通過。 |

舊檔讀取不寫入；顯式 migrate 先保留原始 bytes，再保存 v7；`history`、資源、rngState、
排程與自選 keyMomentIds 保留。舊 history 的抽象敘事不依新版內容回填或變造。
遷移後續命令與不中斷的同一 state 完全相同。

來源、重建命令與樣本摘要見 [歷史樣本說明](implementation/UX-V2-T6-FIXTURES.md)。

## 實際 UI 與內容清單對照

| 年齡（月） | 正式選擇節點 | UI 核對重點 |
| --- | --- | --- |
| 2 | night-handoff-choice | 詢問／規劃不代表已完成交接；後續支援或壓力須等排程執行。 |
| 6 | meal-preparation-choice | 清單與分工詢問是已執行動作，沒有自動宣稱另一人完成家務。 |
| 10 | backup-contact-choice | 聯絡備援不寫成已接手；角色選項按家庭資格。 |
| 15 | grandparent-boundary-choice | 穩定 ID 不代表長輩必定出席；畫面標題是「作息安排的不同想法」，具體家人選項依資格顯示。 |
| 21 | leaving-playground-choice | 已選做法與離開／安撫情境分開，不預告不存在的反應。 |
| 27 | shared-ownership-choice | 記下／協調補用品不等於其他人已完成補貨。 |
| 33 | rainy-pickup-choice | 聯絡、時間變動與實際結果沿來源呈現，不把待排程當已發生。 |
| 39 | preschool-handoff-choice | 老師為此事件的既有暫時角色；家庭成員仍只取該局。 |
| 45 | school-notice-choice | 通知處理／準備不捏造家人參與。 |
| 52 | quiet-time-choice | 休息需求與當下行動正常字重，不推論已有人接手。 |
| 61 | family-ritual-choice | 中性家人稱呼不推定姻親／新增人物；只保留已選準備做法。 |
| 71 | school-transition-choice | 結果、時間線與回顧都引用原已保存紀錄。 |

四家庭每個 pending Dialog 的情境／所有選項逐字比對公開內容；每個主 Journal 與完整
回顧時間線逐筆對照已保存 Journal。單一照顧者不出現 handoff；沒有支持家人的家庭
不出現 ask-family。候選 actor 目錄含已知 ID 不等於人物在該局出席，不能用靜態 ID
搜尋取代實際家庭資格及反應檢查。回顧不同分類可引用同一來源，不把引用當新紀錄。

## 發現與處理

1. **規格落差：** 歷史版本清單未明示 v7，已補正並擴充 v1–v7 驗收。沒有必要修改正式存檔版本或做額外遷移。
2. **證據缺口：** 原有 Engine 四家庭流程及單局瀏覽器回歸不足以展示 UX v2 四家庭全程；新增固定配置、逐次狀態／Dialog／Journal／回顧及兩種重玩驗證，沿用原 MVP 機械 golden。
3. **驗證環境干擾：** 同時在 Vite 工作目錄產生歷史專案觸發重載，造成一輪 3 個案例失敗；樣本產生器暫存改至 watcher 忽略的 node_modules 快取，與正式瀏覽器驗證分開執行。不是以放寬斷言或增加重試掩蓋產品錯誤。
4. **舊檔重玩提示錯誤：** 沒有 replayOrigin 時仍一律宣稱保留開場處境。新增 React 回歸先重現缺少正確描述，再依實際快照可用性顯示預設開場降級說明，並與重玩按鈕做無障礙關聯；新增桌面／手機真實 v6 舊檔遷移及 fallback 開局驗證。

唯一 `src/` 改動為 ReviewScreen 的上述提示與無障礙關聯。未發現需要修改 Engine、
正式事件內容或保存規則的缺陷。

## 自動檢查

| 命令 | 結果 |
| --- | --- |
| `npm.cmd test -- --maxWorkers=2` | 最終 22 檔案／288 項，含新增整合、遷移與舊檔提示 19 項；執行結果在 PR 確認。 |
| `npm.cmd run typecheck` | 通過。 |
| `npm.cmd run build` | 通過，77 modules，沿用 Save v7。 |
| `npm.cmd run test:e2e -- --workers=2` | 原 50 項完整通過；新增舊檔降級桌面／手機後為 52 項，最終結果在 PR 確認。 |

本地結果只代表此 checkout；未宣稱遠端 CI、正式站或預覽部署已驗收。

## 未解決風險與你需要手動試玩的情境

以下均為**待人工驗證**，不是自動化已通過或已發現失敗。原 MVP 曾記錄的 12 分鐘
試玩不代表此次 UX v2 簽核。未發布／回滾演練留給 #41，不在本票部署。

| 人工項目 | 操作與期待 | 狀態 |
| --- | --- | --- |
| 10–15 分鐘完整體驗 | 優先 seed 9：無伴侶的備援安排，走完 12 階段；記錄是否知道下一步、重複點擊感、敘事真假、總時間與阻塞步驟。 | 未執行 |
| 家庭差異 | seed 1／11／2 各讀幾次重大選擇並完成一局；確認共同分工、偽單親參與與多世代沒有被呈現成相同的人物故事或好壞評分。 | 未執行 |
| 螢幕閱讀器 | Windows NVDA／實機 VoiceOver 或 TalkBack：讀 Dialog 標題／描述，背景不可瀏覽，保存失敗與成功有播報，返回最新紀錄可理解。 | 未執行 |
| 原生 400% 縮放 | 真實瀏覽器放大，使用長選項及保存錯誤：所有按鈕可達、不遮住焦點、不被雙層捲動困住。 | 未執行 |
| 手機 Safe Area／橫向 | 真機 iOS／Android 操作 Dialog、紀錄分頁、分享文字；檢查系統工具列、觸控與旋轉後焦點。 | 未執行 |
| 保存失敗與離頁認知 | 在獨立測試瀏覽器環境拒絕保存，確認已選結果仍在；重試後不再選一次。閱讀限制後重新整理，理解只能恢復最後成功版本。 | 未執行 |
| 編輯／專業審閱 | 既有知識卡仍標示 draft；本票未代替內容專業審核。 | 沿用未完成項 |

實機瀏覽器可能不顯示 beforeunload 提示；遭拒保存的記憶體結果不保證跨關頁保留。
未取得當年實機 v1／v2 檔案，現有衍生案例驗證其合約分支；若有實際舊檔，仍應另作
匯入試玩，不以 v3／v6 真實捕捉樣本冒充所有歷史來源。

本機固定家庭試玩：`npm.cmd run dev`，使用獨立測試瀏覽器 profile 開啟 localhost，
在 Console 執行下列設定（會取代該測試 profile 的本機故事；不要在正式站執行）：

```js
const { createFamilyRun } = await import('/src/engine/index.ts');
const { serializeGame } = await import('/src/persistence/index.ts');
localStorage.setItem('parenthood-simulator.save', serializeGame(createFamilyRun({ seed: 9 }).state));
location.reload();
```

改 seed 為 1、11、2 可換基準家庭。請回報：seed、主要選擇路徑、裝置／輔具、花費分鐘、
看到不合理或不知道如何繼續的畫面，以及結果是否符合選擇。
