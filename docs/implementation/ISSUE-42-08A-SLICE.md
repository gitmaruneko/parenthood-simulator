# Issue #42：相容基礎與08A試玩切片

本切片依使用者核准的[第二版](../specs/ISSUE-42-DESIGN-DECISIONS-V2.md)實作：家庭資料組裝入口、narrative結果、legacy分流、08A完整跨Turn故事。87為全量基準，不將此次試玩冒稱36候選全部完成。Review基準為已合併T6的main `097ba65`。

## 每局保證對照（先於實作）

| 保證 | 本次試玩包所有正常完整局 | 全量候選交付時的義務 | 不算證據 |
| --- | --- | --- | --- |
| 至少兩條跨Turn鏈 | 第1階段仍只有原夜間鏈；第8階段E或08A，各自帶固定鏈，普通根互斥 | 第1／8階段每個可入池根都有對應固定鏈；沿第二版結構證明 | seed偶然抽到／只在目錄有資料 |
| 至少一次支持事件 | 第6階段shared-ownership-reflection無條件提供重複使用清單工具，實際kind=support；非他人承諾 | 第6階段每個新根也固定接**本題專用支持片段**，無資源／成人門檻；不可僅靠可能抽中的成人Reaction | support資源數值、詢問支援、虛構別人同意 |
| 至少一次隱形規劃事件 | 第6階段E每個合法選項都有planning來源，分別記盤點／確認／追蹤或明確詢問範圍；支持節點不抹掉原規劃歷史 | 每個新根的對應支持片段同時呈現玩家實際做的規劃動作：06A留下分類位置、06B更新用品記錄、06C劃分尚未確認的任務；storyEntries.kind=planning，非只加planningLoad | 隨便把玩樂結果標planning、只看planningLoad>0 |
| 至少一次修復機會 | 第8階段E或08A固定後續choice均有無門檻的玩家修復嘗試 | 第8階段所有對應鏈維持，不保證孩子／成人原諒 | 把none寫成已談清楚 |

支持可以是實際可用的工具／環境支持；**無成人可用時不能保證人際支援**。人物支持仍依實際Reaction，與上述確定的工具支持分開統計。不把清單本身當成另一個選項模板：06A／B／C後續各寫成自己的生活物件與行動。

配額核算：本次33既有＋08A的根／重訪／choice／收束4＝**37**。全量87基準若按此逐局支持方案交付，第6階段三個新根各加一個專用支持節點＝**90**；原E支持已存在，不重複新增。這3節點是逐局支持／規劃的明列成本，尚未在本切片製作，不暗藏於87。普通新第6階段根＋支持＋fallback＝3，仍低於4／6。其餘候選批次前須以90的明細再核配額，87仍是核准架構的基準而非硬上限。

## 相容實作的收斂

以擴充方式保留既有v1–v7 reader與legacy內容：舊局仍沿原v7 writer／GameState v1保存，版本本身明確路由到legacy，不為試玩強制搬動已穩定的舊故事。新試玩局用save v8／GameState v2及必要contentBinding，且Replay保留此綁定。這是第二版全格式遷移的保守落地：新格式已提供，legacy不重寫升版；舊格式不能接收narrative或contentBinding。未來如要統一搬移legacy至v8，另作遷移切片，不藉此PR改舊golden。

試玩release獨立命名family-events-08a-v1，不使用未完成的全量發布ID。其他階段沿legacy內容；只有第8階段有兩個自然抽選入口。此PR不關閉#42、不宣稱已完成12階段多入口或全量分布驗收。

## 驗證範圍

既定公開邊界：內容schema／組裝、transitionGame、serialize／restore、Family Review，以及Session／瀏覽器試玩。逐項覆蓋所有08A根與後續選項、none及具體回應、4／6預算、每局支持／planning／修復、固定語料分布、資料重排、逐checkpoint續玩、Replay、舊格式拒收新資料與保存失敗重試。對缺queue／未知release／不符familyKey／來源錯掛必須拒收，不重建虛構歷史。

## 試玩與證據

執行`npm run dev`，開啟`http://127.0.0.1:5173/preview-08a.html`可直接試玩08A。
此開發捷徑使用獨立sessionStorage，不寫原localStorage；重新整理接續本次試玩，
「重新體驗這段故事」另開新的試玩記錄。它釘選入口以方便試讀，**不作抽選證據**，
也不包進預設production build。正常首頁的新局仍自然抽選第8階段E／08A。

- [桌機截圖](../examples/ISSUE-42-08A-DESKTOP.png)、[手機截圖](../examples/ISSUE-42-08A-MOBILE.png)：實際瀏覽器結果，已視覺檢查；只有選項加粗、結果各顯示一次。
- [真實Journal輸出](../examples/ISSUE-42-08A-JOURNAL.json)、[待選checkpoint](../examples/ISSUE-42-08A-PENDING.json)：seed9、釘選08A、enact／invite，實際引擎產生；6節點／2 Turn。不是全局覆蓋證據。
- [自然入口統計](../examples/ISSUE-42-DISTRIBUTION.json)：核准4096 seed語料×6方向。一般方向08A為2042／4096（49.8535%，期望50%）；親子方向1952／4096（47.6563%，期望47.9167%）；全部在事前容差內。這是隔離第8階段固定家庭的24,576次抽選，不冒稱全48家庭／12階段的大樣本分布已完成。
- [兩路Review](ISSUE-42-REVIEW.md)：Standards首次2項、Spec首次1項，修正及複審後各0 open。

最終驗證：`npm test` 25檔／323測試全部通過；`npm run typecheck`及`npm run build`通過；
`npm run test:e2e`桌機／手機56項全部通過。既有golden、v1–v7歷史fixture未改寫。

回滾注意：舊bundle不能讀新preview v8；若回退UI仍須保留此reader及release。舊局v7路徑與原始備份繼續保留。本PR不合併、不發布正式內容，也不關閉#42；先由使用者試玩確認再批次擴充。
