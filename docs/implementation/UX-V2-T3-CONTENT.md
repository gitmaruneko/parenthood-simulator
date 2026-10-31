# T3 正式內容敘事稽核

範圍為既有正式包 32 個敘事節點＋1 fallback，不新增事件或入口。
所有機械欄位不變；八條改版前 trace 驗證每個 checkpoint 的狀態、反應與排程。

## 十二個一般選擇節點

改前 `coordinate` 結果一律是「你為〈標題〉整理了可協調的工作，支持是否可用仍需確認」；
`carry` 一律是「你記住、安排並追蹤了〈標題〉的後續工作」。
現在每個 `<slug>-choice` 另有獨立、可保存的情境，以及以下已執行動作。
完整原文由 `src/content/mvp-journal.ts` 管理。

| slug | 情境事實 | coordinate 的具體結果 | carry 的具體結果 |
| --- | --- | --- | --- |
| night-handoff | 夜醒、待洗用品、空白輪班表 | 把用品／安撫／明早準備寫成清單，留下待協調時段 | 先承接今晚照顧，記下明天要談的時間 |
| meal-preparation | 備餐與收尾同時擠進行程 | 簡化一道餐點，分列採買及清潔 | 排好用品，先接準備與收尾 |
| backup-contact | 工作時間臨時改變 | 送出有起訖時間的備援詢問，等候確認 | 調動自己行程，不把未回覆備援算進安排 |
| grandparent-boundary | 不同作息建議與眼前節奏 | 寫下希望保留的時間及界線 | 維持原作息，記下待談差異 |
| leaving-playground | 想繼續玩與回家時間衝突 | 留告別時間、調整晚餐 | 收用品、先離開遊戲區、預留安撫時間 |
| shared-ownership | 用品盤點與補貨仍需追蹤 | 分列盤點／採買／確認，不宣稱已委派成功 | 盤點數量、追蹤本次補貨 |
| rainy-pickup | 雨勢改變接送 | 傳出新地點時間，列出待問備援 | 自己改路線、延後其他工作 |
| preschool-handoff | 教室門口停頓及工作時間壓力 | 提出交接方式、草擬工作通知，細節仍待核對 | 先陪門口停頓、記下工作時間變更 |
| school-notice | 通知期限與準備物品 | 分列期限／回覆／用品，待確認分工 | 讀完通知、列出材料，自己追蹤 |
| quiet-time | 陪伴與休息時段重疊 | 表達休息需求、分開安排，不假設有人接班 | 先陪伴、記下未安排的休息 |
| family-ritual | 相聚與採買聯絡清理 | 縮減清單、等待工作承接意願 | 保留規模，自己接下準備提醒 |
| school-transition | 新階段聯絡接送清單 | 圈出最先需確認的一件事 | 分三欄整理，再標記追蹤時間 |

十二節點的 handoff／ask-family 仍遵守原 actorAvailable requirements；
只綁定實際存在的 caregiver-2／support-1。改前是泛稱交接需求與討論時段，
改後快照使用已確認稱謂，記錄已提出詢問及已列出的工作，明確保留待回覆狀態。
不把任何人寫成已接班，不修改原 scheduledFollowUps。

## 其餘二十節點與 fallback

- 十二個 `<slug>-reflection` 保留既有具體結果原文：天亮用品、餐後清潔、訊息行程、作息思考、公園轉換、用品清單、濕物收拾、教室交接、通知準備、休息回看、相聚收拾與新階段清單。只有這些節點實際執行後才進 Journal。
- night-handoff／preschool-handoff 的 support、strain、reconnect、repair 共八節點保留原正文、效果與鏈。reconnect 的選項原文當下快照；原 repair storyEntries 是已執行自身動作，不據此推定另一角色已答應。support／strain／repair 的結果只在對應節點真正執行後顯示。
- mvp-breathing-space 保留原 ID、正文及完成邊界，但 Journal 不為湊筆數顯示一則沒有新事實的「留白」。原 history 錨點仍在。
- 四個 reaction entries 不改原文、權重或抽樣。只為非 none 且確有 actorId／reactionId 的解析結果加上已確認的回應者稱謂；none 不增可見紀錄，不把「理解」改寫成已完成支援。

## 可追溯性

選擇來源是原事件 history 與 choiceHistory 索引；結果來源是該轉換已執行的
storyEntries 或自動節點；人物反應來源是實際 reactionHistory 索引。
所有新增文字都在該節點的 trace.afterState 中保存。舊 history 不回填這些新版文案。
