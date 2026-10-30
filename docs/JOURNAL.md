# 可保存的生活紀錄（UX v2 T3，Issue #37）

本票只交付既有事件的選擇／結果快照、倒敘 Journal 與同源回顧。
不新增日常 EventNode、不改主畫面欄位位置、不移除既有閱讀控制，也不加入 Dialog。
「繼續生活」新主畫面與必要決策 Dialog 分別留給 #38／#39。

## 同一份已發生事實

`history` 保留原 id、kind、text、resolvedEventId、階段、Turn 與 append 順序。
新增選填 `journal` 集合；新轉換會明確寫入集合（也可以為空），舊資料不回填。

每筆快照保存：穩定 id、choice／result 類型、完整 text、sourceHistoryId、
eventHistoryId、eventId、來源內 sequence、actorIds；選擇另有 choiceText 與
choiceHistoryIndex，實際反應另有 reactionHistoryIndex。id 由父 history id 與
來源內序號決定。父 history 提供 AgeStage／Turn，不使用實際時鐘排序。

- eventHistoryId 是原事件錨點；effect／reaction 的來源各自保留原 history id。
- choiceText 是當下引擎接受的選項原文，已解析當時姓名／稱謂。text 保存必要情境與動作，畫面只將選項部分粗體，情境及結果為一般字重。
- 已執行 storyEntries 形成具體結果；人物反應只能取實際 resolver 結果及 actorId。none、未選出回應者不新增可見反應；原始 reactionHistory／history 仍完整保留，避免改動機械 trace。
- fallback 不為湊筆數新增「留白」紀錄；真正執行的節點／effects 依實際來源呈現。不從排程推論支援已落實，也不把詢問改寫成已完成交接。
- 一次事件內相同結果文字去重。Journal 只投影 history，不再另把 reactionHistory 附加一次。

`snapshotJournal` 在 Event Engine 完成該節點轉換、建立 trace 前執行；每個
trace.afterState 都含當下完整資料。`transitionAndSave` 沿用原來的逐 checkpoint
保存／失敗停止；重試保存同一結果，不重送選擇或重抽反應。

## 公開投影、顯示與回顧

`projectJournal` 是純讀取引擎邊界，輸出由舊到新的紀錄；UI 複製倒序，最近的
結果位於選擇上方。同 Turn 仍沿用同一天的 storyTimeLabels，來源內順序不變。
它只需要已保存資料，內容文案更新不會改寫過往快照。

FamilyLog 留在原本的位置及手機「紀錄」頁。原事件面板保留待選情境、內嵌選項
與「繼續故事」閱讀控制；已確認正文不再於事件串流重播，反應列表與心事正文
改為短提示／紀錄索引，以免同一段出現兩遍。索引、閱讀及換頁不提交引擎命令。

Family Review 的三個關鍵時刻、時間線、支持／修復與 planning 引用仍是原
history IDs。關鍵時刻可包含同一事件的已發生效果與反應；各時間線來源只呈現
一次同源 Journal。十二階段、自選三個時刻、主題及分享 allowlist 不變。

## Save v6 與舊故事

v5 已發布，因此本票使用新的 envelope v6，GameState 內層仍為 1；人物檔案
仍支援原本 v1／v2，沒有新增家庭生成或親屬關係。v1–v5 先按各自舊契約嚴格
驗證（舊 history 不得帶 journal），再顯式升版，先保存原始 bytes。未知版本、
來源、排序、choice／reaction 索引、角色或空白文字不通過驗證。

舊 history 沒有 journal 時，legacy 投影保留原正文。只有在同 event／Turn／
AgeStage 唯一配對時，才附「你在這次事件做了選擇。」；不取新版 ContentPack
的選項文字冒充歷史原文。同 Turn 重複事件若無法確定配對，就不猜。
只顯示舊 history 本身的反應，不另複製 reactionHistory；已能唯一確定為 none
的反應不顯示。舊抽象文字不改成沒有證據的新敘事。

升版保留 v5 的人物、既有歷史／回顧引用、資源、PRNG 與排程。v6 無法由舊
bundle 讀取；回滾需要相容修復版本，不能清除存檔或冒填舊版本號。

## 證據

- 改版前從 main `d20c847` 的 v5 建置擷取開場、pending、已選擇及完成／回顧存檔。
- 四組家庭種子 × coordinate／carry 共八條完整轉換 trace，以每個 checkpoint 的機械狀態、事件／反應及原 history 錨點比對 SHA-256；只排除敘事文字與 Journal 欄位，其他欄位全部保留。
- 正式內容仍為 32 個敘事節點＋1 fallback；ID、效果、反應權重、資格、鏈與節點預算不變。逐項文案對照見 [內容稽核](implementation/UX-V2-T3-CONTENT.md)。
- 完整可重現的詢問／未回應／已執行結果／排序／讀檔範例見 [遊玩範例](examples/ISSUE-37-PLAYTHROUGH.md)。
