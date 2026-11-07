# Narrative A3：實際 Journal 與條件對照

來源：`NQA3_WRITE_EVIDENCE=1 npm test -- tests/narrative-a3.test.ts tests/narrative-a3-distribution.test.ts --maxWorkers=2`。真實 ContentPack 經公開 Engine、Reaction 與 projectJournal 輸出，沒有靜態代寫 Journal。

七版本各兩路 × 四基準 seed；完整十二階段、Review 與逐 checkpoint 還原結果見 [原始 JSON](NARRATIVE-A3-RUNS.json)。固定 corpus 六方向另見 [分布](NARRATIVE-A3-DISTRIBUTION.json)。

作者總目錄 44 節點：A2 40 − 五組原節點 10 ＋ A3 14。兩個中性版本各多 2 作者節點；每局 N03／N04 各只選一版，不增加 Turn≤4／Stage≤6 預算，不宣稱納入 #42 原 90 配額。

## 同 seed、同 rngState 單維正反例

只變更 workArrangement 或 support-1 成員資格；沒有換 seed 或用 UI 隱藏。每列 requiredEventIds 見 JSON。

| 階段 | seed | rngState | 工作 | support-1 | 實際入口 | 候選 |
| --- | --- | --- | --- | --- | --- | --- |
| 3 | 9 | 2903413571 | dualIncome | true | nqa3-work-choice | nqa3-work-choice |
| 3 | 9 | 2903413571 | singleFullTimeCare | true | nqa3-bag-choice | nqa3-bag-choice |
| 4 | 9 | 2903413571 | dualIncome | true | nqa3-message-choice | nqa3-message-choice |
| 4 | 9 | 2903413571 | dualIncome | false | nqa3-shoes-choice | nqa3-shoes-choice |

## 48 配置 × 四角色 mask 的候選與合法選項

mask bit 1=長輩、bit 2=伴侶；四個角色集合獨立於家庭三維，availability=0、未知親屬、零資源。每階段皆有一般入口；A3 所有入選版本的兩個行動皆經 Engine 執行並保存還原。完整每階段候選／選項表列於原始 JSON eligibility rows。

| 家庭 | 分工 | 工作 | mask | N03 | N04 |
| --- | --- | --- | --- | --- | --- |
| singleCaregiver | shared | dualIncome | 0 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | shared | dualIncome | 1 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | shared | dualIncome | 2 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | shared | dualIncome | 3 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | shared | singleFullTimeCare | 0 | nqa3-bag-choice | nqa3-shoes-choice |
| singleCaregiver | shared | singleFullTimeCare | 1 | nqa3-bag-choice | nqa3-message-choice |
| singleCaregiver | shared | singleFullTimeCare | 2 | nqa3-bag-choice | nqa3-shoes-choice |
| singleCaregiver | shared | singleFullTimeCare | 3 | nqa3-bag-choice | nqa3-message-choice |
| singleCaregiver | shared | flexible | 0 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | shared | flexible | 1 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | shared | flexible | 2 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | shared | flexible | 3 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | shared | unstable | 0 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | shared | unstable | 1 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | shared | unstable | 2 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | shared | unstable | 3 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | uneven | dualIncome | 0 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | uneven | dualIncome | 1 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | uneven | dualIncome | 2 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | uneven | dualIncome | 3 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | uneven | singleFullTimeCare | 0 | nqa3-bag-choice | nqa3-shoes-choice |
| singleCaregiver | uneven | singleFullTimeCare | 1 | nqa3-bag-choice | nqa3-message-choice |
| singleCaregiver | uneven | singleFullTimeCare | 2 | nqa3-bag-choice | nqa3-shoes-choice |
| singleCaregiver | uneven | singleFullTimeCare | 3 | nqa3-bag-choice | nqa3-message-choice |
| singleCaregiver | uneven | flexible | 0 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | uneven | flexible | 1 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | uneven | flexible | 2 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | uneven | flexible | 3 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | uneven | unstable | 0 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | uneven | unstable | 1 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | uneven | unstable | 2 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | uneven | unstable | 3 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | pseudoSingle | dualIncome | 0 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | pseudoSingle | dualIncome | 1 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | pseudoSingle | dualIncome | 2 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | pseudoSingle | dualIncome | 3 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | pseudoSingle | singleFullTimeCare | 0 | nqa3-bag-choice | nqa3-shoes-choice |
| singleCaregiver | pseudoSingle | singleFullTimeCare | 1 | nqa3-bag-choice | nqa3-message-choice |
| singleCaregiver | pseudoSingle | singleFullTimeCare | 2 | nqa3-bag-choice | nqa3-shoes-choice |
| singleCaregiver | pseudoSingle | singleFullTimeCare | 3 | nqa3-bag-choice | nqa3-message-choice |
| singleCaregiver | pseudoSingle | flexible | 0 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | pseudoSingle | flexible | 1 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | pseudoSingle | flexible | 2 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | pseudoSingle | flexible | 3 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | pseudoSingle | unstable | 0 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | pseudoSingle | unstable | 1 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | pseudoSingle | unstable | 2 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | pseudoSingle | unstable | 3 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | primaryAndBackup | dualIncome | 0 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | primaryAndBackup | dualIncome | 1 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | primaryAndBackup | dualIncome | 2 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | primaryAndBackup | dualIncome | 3 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | primaryAndBackup | singleFullTimeCare | 0 | nqa3-bag-choice | nqa3-shoes-choice |
| singleCaregiver | primaryAndBackup | singleFullTimeCare | 1 | nqa3-bag-choice | nqa3-message-choice |
| singleCaregiver | primaryAndBackup | singleFullTimeCare | 2 | nqa3-bag-choice | nqa3-shoes-choice |
| singleCaregiver | primaryAndBackup | singleFullTimeCare | 3 | nqa3-bag-choice | nqa3-message-choice |
| singleCaregiver | primaryAndBackup | flexible | 0 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | primaryAndBackup | flexible | 1 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | primaryAndBackup | flexible | 2 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | primaryAndBackup | flexible | 3 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | primaryAndBackup | unstable | 0 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | primaryAndBackup | unstable | 1 | nqa3-work-choice | nqa3-message-choice |
| singleCaregiver | primaryAndBackup | unstable | 2 | nqa3-work-choice | nqa3-shoes-choice |
| singleCaregiver | primaryAndBackup | unstable | 3 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | shared | dualIncome | 0 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | shared | dualIncome | 1 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | shared | dualIncome | 2 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | shared | dualIncome | 3 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | shared | singleFullTimeCare | 0 | nqa3-bag-choice | nqa3-shoes-choice |
| twoCaregivers | shared | singleFullTimeCare | 1 | nqa3-bag-choice | nqa3-message-choice |
| twoCaregivers | shared | singleFullTimeCare | 2 | nqa3-bag-choice | nqa3-shoes-choice |
| twoCaregivers | shared | singleFullTimeCare | 3 | nqa3-bag-choice | nqa3-message-choice |
| twoCaregivers | shared | flexible | 0 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | shared | flexible | 1 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | shared | flexible | 2 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | shared | flexible | 3 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | shared | unstable | 0 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | shared | unstable | 1 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | shared | unstable | 2 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | shared | unstable | 3 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | uneven | dualIncome | 0 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | uneven | dualIncome | 1 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | uneven | dualIncome | 2 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | uneven | dualIncome | 3 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | uneven | singleFullTimeCare | 0 | nqa3-bag-choice | nqa3-shoes-choice |
| twoCaregivers | uneven | singleFullTimeCare | 1 | nqa3-bag-choice | nqa3-message-choice |
| twoCaregivers | uneven | singleFullTimeCare | 2 | nqa3-bag-choice | nqa3-shoes-choice |
| twoCaregivers | uneven | singleFullTimeCare | 3 | nqa3-bag-choice | nqa3-message-choice |
| twoCaregivers | uneven | flexible | 0 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | uneven | flexible | 1 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | uneven | flexible | 2 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | uneven | flexible | 3 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | uneven | unstable | 0 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | uneven | unstable | 1 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | uneven | unstable | 2 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | uneven | unstable | 3 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | pseudoSingle | dualIncome | 0 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | pseudoSingle | dualIncome | 1 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | pseudoSingle | dualIncome | 2 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | pseudoSingle | dualIncome | 3 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | pseudoSingle | singleFullTimeCare | 0 | nqa3-bag-choice | nqa3-shoes-choice |
| twoCaregivers | pseudoSingle | singleFullTimeCare | 1 | nqa3-bag-choice | nqa3-message-choice |
| twoCaregivers | pseudoSingle | singleFullTimeCare | 2 | nqa3-bag-choice | nqa3-shoes-choice |
| twoCaregivers | pseudoSingle | singleFullTimeCare | 3 | nqa3-bag-choice | nqa3-message-choice |
| twoCaregivers | pseudoSingle | flexible | 0 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | pseudoSingle | flexible | 1 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | pseudoSingle | flexible | 2 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | pseudoSingle | flexible | 3 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | pseudoSingle | unstable | 0 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | pseudoSingle | unstable | 1 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | pseudoSingle | unstable | 2 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | pseudoSingle | unstable | 3 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | primaryAndBackup | dualIncome | 0 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | primaryAndBackup | dualIncome | 1 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | primaryAndBackup | dualIncome | 2 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | primaryAndBackup | dualIncome | 3 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | primaryAndBackup | singleFullTimeCare | 0 | nqa3-bag-choice | nqa3-shoes-choice |
| twoCaregivers | primaryAndBackup | singleFullTimeCare | 1 | nqa3-bag-choice | nqa3-message-choice |
| twoCaregivers | primaryAndBackup | singleFullTimeCare | 2 | nqa3-bag-choice | nqa3-shoes-choice |
| twoCaregivers | primaryAndBackup | singleFullTimeCare | 3 | nqa3-bag-choice | nqa3-message-choice |
| twoCaregivers | primaryAndBackup | flexible | 0 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | primaryAndBackup | flexible | 1 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | primaryAndBackup | flexible | 2 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | primaryAndBackup | flexible | 3 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | primaryAndBackup | unstable | 0 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | primaryAndBackup | unstable | 1 | nqa3-work-choice | nqa3-message-choice |
| twoCaregivers | primaryAndBackup | unstable | 2 | nqa3-work-choice | nqa3-shoes-choice |
| twoCaregivers | primaryAndBackup | unstable | 3 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | shared | dualIncome | 0 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | shared | dualIncome | 1 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | shared | dualIncome | 2 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | shared | dualIncome | 3 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | shared | singleFullTimeCare | 0 | nqa3-bag-choice | nqa3-shoes-choice |
| multigenerational | shared | singleFullTimeCare | 1 | nqa3-bag-choice | nqa3-message-choice |
| multigenerational | shared | singleFullTimeCare | 2 | nqa3-bag-choice | nqa3-shoes-choice |
| multigenerational | shared | singleFullTimeCare | 3 | nqa3-bag-choice | nqa3-message-choice |
| multigenerational | shared | flexible | 0 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | shared | flexible | 1 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | shared | flexible | 2 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | shared | flexible | 3 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | shared | unstable | 0 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | shared | unstable | 1 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | shared | unstable | 2 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | shared | unstable | 3 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | uneven | dualIncome | 0 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | uneven | dualIncome | 1 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | uneven | dualIncome | 2 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | uneven | dualIncome | 3 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | uneven | singleFullTimeCare | 0 | nqa3-bag-choice | nqa3-shoes-choice |
| multigenerational | uneven | singleFullTimeCare | 1 | nqa3-bag-choice | nqa3-message-choice |
| multigenerational | uneven | singleFullTimeCare | 2 | nqa3-bag-choice | nqa3-shoes-choice |
| multigenerational | uneven | singleFullTimeCare | 3 | nqa3-bag-choice | nqa3-message-choice |
| multigenerational | uneven | flexible | 0 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | uneven | flexible | 1 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | uneven | flexible | 2 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | uneven | flexible | 3 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | uneven | unstable | 0 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | uneven | unstable | 1 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | uneven | unstable | 2 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | uneven | unstable | 3 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | pseudoSingle | dualIncome | 0 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | pseudoSingle | dualIncome | 1 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | pseudoSingle | dualIncome | 2 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | pseudoSingle | dualIncome | 3 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | pseudoSingle | singleFullTimeCare | 0 | nqa3-bag-choice | nqa3-shoes-choice |
| multigenerational | pseudoSingle | singleFullTimeCare | 1 | nqa3-bag-choice | nqa3-message-choice |
| multigenerational | pseudoSingle | singleFullTimeCare | 2 | nqa3-bag-choice | nqa3-shoes-choice |
| multigenerational | pseudoSingle | singleFullTimeCare | 3 | nqa3-bag-choice | nqa3-message-choice |
| multigenerational | pseudoSingle | flexible | 0 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | pseudoSingle | flexible | 1 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | pseudoSingle | flexible | 2 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | pseudoSingle | flexible | 3 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | pseudoSingle | unstable | 0 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | pseudoSingle | unstable | 1 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | pseudoSingle | unstable | 2 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | pseudoSingle | unstable | 3 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | primaryAndBackup | dualIncome | 0 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | primaryAndBackup | dualIncome | 1 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | primaryAndBackup | dualIncome | 2 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | primaryAndBackup | dualIncome | 3 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | primaryAndBackup | singleFullTimeCare | 0 | nqa3-bag-choice | nqa3-shoes-choice |
| multigenerational | primaryAndBackup | singleFullTimeCare | 1 | nqa3-bag-choice | nqa3-message-choice |
| multigenerational | primaryAndBackup | singleFullTimeCare | 2 | nqa3-bag-choice | nqa3-shoes-choice |
| multigenerational | primaryAndBackup | singleFullTimeCare | 3 | nqa3-bag-choice | nqa3-message-choice |
| multigenerational | primaryAndBackup | flexible | 0 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | primaryAndBackup | flexible | 1 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | primaryAndBackup | flexible | 2 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | primaryAndBackup | flexible | 3 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | primaryAndBackup | unstable | 0 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | primaryAndBackup | unstable | 1 | nqa3-work-choice | nqa3-message-choice |
| multigenerational | primaryAndBackup | unstable | 2 | nqa3-work-choice | nqa3-shoes-choice |
| multigenerational | primaryAndBackup | unstable | 3 | nqa3-work-choice | nqa3-message-choice |

## seed 9：七版本各兩行動的實際 Journal

### N03 工作／nqa3-document

家庭：singleCaregiver／primaryAndBackup／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。
  你選擇：回覆無法出席，現在把意見寫進會議文件
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你回覆這次無法出席，把兩點意見寫進文件。會議怎麼決定，還要等紀錄。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[{"poolId":"nqa3-work-response","reactionId":"nqa3-work-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa3-work-choice","ageStageId":"age-stage-3","turnId":"age-stage-3-turn-1"}]`

### N03 工作／nqa3-reschedule

家庭：singleCaregiver／primaryAndBackup／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。
  你選擇：詢問能否改到明早，附上自己可用的時段
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你送出明早可用的時段。行事曆上的會議還沒變動，你先照原本的照顧安排走。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[{"poolId":"nqa3-work-response","reactionId":"nqa3-work-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa3-work-choice","ageStageId":"age-stage-3","turnId":"age-stage-3-turn-1"}]`

### N03 中性：外出袋／nqa3-pack

家庭：singleCaregiver／primaryAndBackup／singleFullTimeCare。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你在家照看孩子，準備原訂的散步。門邊外出袋裡的備用品還沒整理齊，離原本想出門的時間已經很近。
  你選擇：現在補齊袋子，晚一點出門
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你把這次要用的幾件放進袋裡，出門時間往後挪了一點。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  門邊的袋子，還差最後一件：收起手邊物品：你把外出袋放回門邊固定的位置。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### N03 中性：外出袋／nqa3-stay

家庭：singleCaregiver／primaryAndBackup／singleFullTimeCare。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你在家照看孩子，準備原訂的散步。門邊外出袋裡的備用品還沒整理齊，離原本想出門的時間已經很近。
  你選擇：今天改在家陪孩子，袋子下午再整理
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你將袋子留在門邊，坐回孩子旁邊。今天這趟散步先取消。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  門邊的袋子，還差最後一件：收起手邊物品：你把外出袋放回門邊固定的位置。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### N04 作息訊息／nqa3-decline

家庭：singleCaregiver／primaryAndBackup／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。
  你選擇：回訊說今天照原安排，下午外出改天再約
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：你回訊說今天照原安排，下午的外出改天再約。手機先放回桌邊。
- **result**（source=`reaction-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議時，支持家人（不同住）：回訊說：「好，那我們下次再約。」
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa3-message-response","reactionId":"nqa3-message-reply-0","actorId":"support-1","kind":"neutral","text":"回訊說：「好，那我們下次再約。」","eventId":"nqa3-message-choice","ageStageId":"age-stage-4","turnId":"age-stage-4-turn-1"}]`

### N04 作息訊息／nqa3-ask

家庭：singleCaregiver／primaryAndBackup／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。
  你選擇：先問下午原本想去哪裡，再決定要不要另約
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：你問起下午想去哪裡，沒有先答應改動今天的安排。
- **result**（source=`reaction-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議時，支持家人（不同住）：回訊說自己也還沒查時間。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa3-message-response","reactionId":"nqa3-message-reply-2","actorId":"support-1","kind":"neutral","text":"回訊說自己也還沒查時間。","eventId":"nqa3-message-choice","ageStageId":"age-stage-4","turnId":"age-stage-4-turn-1"}]`

### N04 中性：找鞋／nqa3-find

家庭：singleCaregiver／primaryAndBackup／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你在家陪孩子，原訂下午出去走走。門邊待收的物品擋著找鞋，外出用品也還分散在幾處。
  你選擇：先找齊鞋子，今天照原計畫出去
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你在門邊找齊鞋子，把要帶的物品放在一起。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  下午原本想出門，鞋子還沒找齊：收起手邊物品：你將門邊散落的物品集中到一側。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### N04 中性：找鞋／nqa3-toys

家庭：singleCaregiver／primaryAndBackup／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你在家陪孩子，原訂下午出去走走。門邊待收的物品擋著找鞋，外出用品也還分散在幾處。
  你選擇：今天留在家，在地上排一條玩具路
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你把玩具排成一條路，坐在孩子旁邊。這次外出先取消。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  下午原本想出門，鞋子還沒找齊：收起手邊物品：你將門邊散落的物品集中到一側。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### N09 通知／nqa3-box

家庭：singleCaregiver／primaryAndBackup／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-9-turn-1-1`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。
  你選擇：把鞋盒清出來，在盒上畫一扇門
- **result**（source=`choice-effect-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：你清出鞋盒，在盒上畫了一扇門，也在桌上的畫紙試畫了窗。移出的雜物暫時集中在桌邊。
- **result**（source=`reaction-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知時，孩子：把鞋盒另一邊指成車庫。
- **result**（source=`story-age-stage-9-turn-1-2`／anchor=`story-age-stage-9-turn-1-2`）
  明天要帶的紙盒，今晚才看到通知：收起手邊物品：你把今天畫過的紙張收成一疊，將手機通知標為已處理。
- **daily**（source=`age-stage-9-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-9-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-notice-response","reactionId":"nqa3-notice-reply-0","actorId":"child-1","kind":"neutral","text":"把鞋盒另一邊指成車庫。","eventId":"nqa3-notice-choice","ageStageId":"age-stage-9","turnId":"age-stage-9-turn-1"}]`

### N09 通知／nqa3-materials

家庭：singleCaregiver／primaryAndBackup／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-9-turn-1-1`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。
  你選擇：回覆明天使用班上材料，今晚照原本的約定畫畫
- **result**（source=`choice-effect-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：你回覆明天使用班上材料，把手機放下，坐回畫紙旁邊畫了幾筆。回覆已送出，還不知道老師是否看見。
- **result**（source=`reaction-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知時，孩子：把畫紙推過來。
- **result**（source=`story-age-stage-9-turn-1-2`／anchor=`story-age-stage-9-turn-1-2`）
  明天要帶的紙盒，今晚才看到通知：收起手邊物品：你把今天畫過的紙張收成一疊，將手機通知標為已處理。
- **daily**（source=`age-stage-9-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-9-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-notice-response","reactionId":"nqa3-notice-reply-1","actorId":"child-1","kind":"neutral","text":"把畫紙推過來。","eventId":"nqa3-notice-choice","ageStageId":"age-stage-9","turnId":"age-stage-9-turn-1"}]`

### N11 相聚草稿／nqa3-menu

家庭：singleCaregiver／primaryAndBackup／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-11-turn-1-1`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你在家看著週末相聚的草稿，原本想準備的菜已寫滿一張便條。孩子在旁邊畫桌上要放的小旗子。邀請訊息還沒送，收件人也還沒填；冰箱裡的食材只夠其中幾道。這次可以提議在家裡或外頭相聚。
  你選擇：保留在家吃飯，刪到現有食材能做的幾道菜
- **result**（source=`choice-effect-age-stage-11-turn-1-1-0`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你把菜單刪到冰箱現有食材能做的幾道，將在家相聚的提議寫進邀請草稿。訊息還沒寄出。
- **result**（source=`story-age-stage-11-turn-1-2`／anchor=`story-age-stage-11-turn-1-2`）
  相聚的菜單，冰箱貼不下了：收起手邊物品：你把改過的便條貼回冰箱，小旗子的畫留在旁邊。
- **daily**（source=`age-stage-11-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-11-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[]`

### N11 相聚草稿／nqa3-picnic

家庭：singleCaregiver／primaryAndBackup／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-11-turn-1-1`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你在家看著週末相聚的草稿，原本想準備的菜已寫滿一張便條。孩子在旁邊畫桌上要放的小旗子。邀請訊息還沒送，收件人也還沒填；冰箱裡的食材只夠其中幾道。這次可以提議在家裡或外頭相聚。
  你選擇：提議改在公園野餐，這次不在家開伙
- **result**（source=`choice-effect-age-stage-11-turn-1-1-0`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你把公園野餐寫進邀請草稿，另記下要查天氣與可用地點。訊息還沒寄出，地點還沒定案。
- **result**（source=`story-age-stage-11-turn-1-2`／anchor=`story-age-stage-11-turn-1-2`）
  相聚的菜單，冰箱貼不下了：收起手邊物品：你把改過的便條貼回冰箱，小旗子的畫留在旁邊。
- **daily**（source=`age-stage-11-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-11-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[]`

### N12 新教室／nqa3-walk

家庭：singleCaregiver／primaryAndBackup／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-12-turn-1-1`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。
  你選擇：帶著地圖走一趟到入口，只認路、不進教室
- **result**（source=`choice-effect-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：你帶孩子照地圖走到入口，在路上把兩個轉彎指給孩子看。今天沒有進教室。
- **result**（source=`reaction-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎時，孩子：指著入口旁的樹問是不是這棵。
- **result**（source=`story-age-stage-12-turn-1-2`／anchor=`story-age-stage-12-turn-1-2`）
  新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- **daily**（source=`age-stage-12-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-12-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-map-response","reactionId":"nqa3-map-reply-0","actorId":"child-1","kind":"neutral","text":"指著入口旁的樹問是不是這棵。","eventId":"nqa3-map-choice","ageStageId":"age-stage-12","turnId":"age-stage-12-turn-1"}]`

### N12 新教室／nqa3-draw

家庭：singleCaregiver／primaryAndBackup／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-12-turn-1-1`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。
  你選擇：在紙上畫兩個轉彎，把入口圈起來
- **result**（source=`choice-effect-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：你畫出兩個轉彎，圈起地圖上的入口。實際走起來要多久，還沒有確認。
- **result**（source=`reaction-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎時，孩子：說今天先不看。
- **result**（source=`story-age-stage-12-turn-1-2`／anchor=`story-age-stage-12-turn-1-2`）
  新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- **daily**（source=`age-stage-12-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-12-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-map-response","reactionId":"nqa3-map-reply-2","actorId":"child-1","kind":"neutral","text":"說今天先不看。","eventId":"nqa3-map-choice","ageStageId":"age-stage-12","turnId":"age-stage-12-turn-1"}]`


## seed 1：七版本各兩行動的實際 Journal

### N03 工作／nqa3-document

家庭：twoCaregivers／shared／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。
  你選擇：回覆無法出席，現在把意見寫進會議文件
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你回覆這次無法出席，把兩點意見寫進文件。會議怎麼決定，還要等紀錄。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[{"poolId":"nqa3-work-response","reactionId":"nqa3-work-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa3-work-choice","ageStageId":"age-stage-3","turnId":"age-stage-3-turn-1"}]`

### N03 工作／nqa3-reschedule

家庭：twoCaregivers／shared／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。
  你選擇：詢問能否改到明早，附上自己可用的時段
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你送出明早可用的時段。行事曆上的會議還沒變動，你先照原本的照顧安排走。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[{"poolId":"nqa3-work-response","reactionId":"nqa3-work-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa3-work-choice","ageStageId":"age-stage-3","turnId":"age-stage-3-turn-1"}]`

### N03 中性：外出袋／nqa3-pack

家庭：twoCaregivers／shared／singleFullTimeCare。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你在家照看孩子，準備原訂的散步。門邊外出袋裡的備用品還沒整理齊，離原本想出門的時間已經很近。
  你選擇：現在補齊袋子，晚一點出門
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你把這次要用的幾件放進袋裡，出門時間往後挪了一點。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  門邊的袋子，還差最後一件：收起手邊物品：你把外出袋放回門邊固定的位置。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### N03 中性：外出袋／nqa3-stay

家庭：twoCaregivers／shared／singleFullTimeCare。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你在家照看孩子，準備原訂的散步。門邊外出袋裡的備用品還沒整理齊，離原本想出門的時間已經很近。
  你選擇：今天改在家陪孩子，袋子下午再整理
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你將袋子留在門邊，坐回孩子旁邊。今天這趟散步先取消。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  門邊的袋子，還差最後一件：收起手邊物品：你把外出袋放回門邊固定的位置。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### N04 作息訊息／nqa3-decline

家庭：twoCaregivers／shared／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。
  你選擇：回訊說今天照原安排，下午外出改天再約
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：你回訊說今天照原安排，下午的外出改天再約。手機先放回桌邊。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa3-message-response","reactionId":"nqa3-message-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa3-message-choice","ageStageId":"age-stage-4","turnId":"age-stage-4-turn-1"}]`

### N04 作息訊息／nqa3-ask

家庭：twoCaregivers／shared／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。
  你選擇：先問下午原本想去哪裡，再決定要不要另約
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：你問起下午想去哪裡，沒有先答應改動今天的安排。
- **result**（source=`reaction-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議時，支持家人：傳來公園活動的時間，說只是先問問，還沒有約定一起去。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa3-message-response","reactionId":"nqa3-message-reply-1","actorId":"support-1","kind":"neutral","text":"傳來公園活動的時間，說只是先問問，還沒有約定一起去。","eventId":"nqa3-message-choice","ageStageId":"age-stage-4","turnId":"age-stage-4-turn-1"}]`

### N04 中性：找鞋／nqa3-find

家庭：twoCaregivers／shared／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你在家陪孩子，原訂下午出去走走。門邊待收的物品擋著找鞋，外出用品也還分散在幾處。
  你選擇：先找齊鞋子，今天照原計畫出去
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你在門邊找齊鞋子，把要帶的物品放在一起。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  下午原本想出門，鞋子還沒找齊：收起手邊物品：你將門邊散落的物品集中到一側。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### N04 中性：找鞋／nqa3-toys

家庭：twoCaregivers／shared／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你在家陪孩子，原訂下午出去走走。門邊待收的物品擋著找鞋，外出用品也還分散在幾處。
  你選擇：今天留在家，在地上排一條玩具路
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你把玩具排成一條路，坐在孩子旁邊。這次外出先取消。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  下午原本想出門，鞋子還沒找齊：收起手邊物品：你將門邊散落的物品集中到一側。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### N09 通知／nqa3-box

家庭：twoCaregivers／shared／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-9-turn-1-1`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。
  你選擇：把鞋盒清出來，在盒上畫一扇門
- **result**（source=`choice-effect-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：你清出鞋盒，在盒上畫了一扇門，也在桌上的畫紙試畫了窗。移出的雜物暫時集中在桌邊。
- **result**（source=`story-age-stage-9-turn-1-2`／anchor=`story-age-stage-9-turn-1-2`）
  明天要帶的紙盒，今晚才看到通知：收起手邊物品：你把今天畫過的紙張收成一疊，將手機通知標為已處理。
- **daily**（source=`age-stage-9-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-9-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-notice-response","reactionId":"nqa3-notice-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa3-notice-choice","ageStageId":"age-stage-9","turnId":"age-stage-9-turn-1"}]`

### N09 通知／nqa3-materials

家庭：twoCaregivers／shared／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-9-turn-1-1`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。
  你選擇：回覆明天使用班上材料，今晚照原本的約定畫畫
- **result**（source=`choice-effect-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：你回覆明天使用班上材料，把手機放下，坐回畫紙旁邊畫了幾筆。回覆已送出，還不知道老師是否看見。
- **result**（source=`story-age-stage-9-turn-1-2`／anchor=`story-age-stage-9-turn-1-2`）
  明天要帶的紙盒，今晚才看到通知：收起手邊物品：你把今天畫過的紙張收成一疊，將手機通知標為已處理。
- **daily**（source=`age-stage-9-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-9-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-notice-response","reactionId":"nqa3-notice-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa3-notice-choice","ageStageId":"age-stage-9","turnId":"age-stage-9-turn-1"}]`

### N11 相聚草稿／nqa3-menu

家庭：twoCaregivers／shared／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-11-turn-1-1`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你在家看著週末相聚的草稿，原本想準備的菜已寫滿一張便條。孩子在旁邊畫桌上要放的小旗子。邀請訊息還沒送，收件人也還沒填；冰箱裡的食材只夠其中幾道。這次可以提議在家裡或外頭相聚。
  你選擇：保留在家吃飯，刪到現有食材能做的幾道菜
- **result**（source=`choice-effect-age-stage-11-turn-1-1-0`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你把菜單刪到冰箱現有食材能做的幾道，將在家相聚的提議寫進邀請草稿。訊息還沒寄出。
- **result**（source=`story-age-stage-11-turn-1-2`／anchor=`story-age-stage-11-turn-1-2`）
  相聚的菜單，冰箱貼不下了：收起手邊物品：你把改過的便條貼回冰箱，小旗子的畫留在旁邊。
- **daily**（source=`age-stage-11-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-11-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[]`

### N11 相聚草稿／nqa3-picnic

家庭：twoCaregivers／shared／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-11-turn-1-1`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你在家看著週末相聚的草稿，原本想準備的菜已寫滿一張便條。孩子在旁邊畫桌上要放的小旗子。邀請訊息還沒送，收件人也還沒填；冰箱裡的食材只夠其中幾道。這次可以提議在家裡或外頭相聚。
  你選擇：提議改在公園野餐，這次不在家開伙
- **result**（source=`choice-effect-age-stage-11-turn-1-1-0`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你把公園野餐寫進邀請草稿，另記下要查天氣與可用地點。訊息還沒寄出，地點還沒定案。
- **result**（source=`story-age-stage-11-turn-1-2`／anchor=`story-age-stage-11-turn-1-2`）
  相聚的菜單，冰箱貼不下了：收起手邊物品：你把改過的便條貼回冰箱，小旗子的畫留在旁邊。
- **daily**（source=`age-stage-11-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-11-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[]`

### N12 新教室／nqa3-walk

家庭：twoCaregivers／shared／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-12-turn-1-1`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。
  你選擇：帶著地圖走一趟到入口，只認路、不進教室
- **result**（source=`choice-effect-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：你帶孩子照地圖走到入口，在路上把兩個轉彎指給孩子看。今天沒有進教室。
- **result**（source=`story-age-stage-12-turn-1-2`／anchor=`story-age-stage-12-turn-1-2`）
  新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- **daily**（source=`age-stage-12-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-12-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-map-response","reactionId":"nqa3-map-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa3-map-choice","ageStageId":"age-stage-12","turnId":"age-stage-12-turn-1"}]`

### N12 新教室／nqa3-draw

家庭：twoCaregivers／shared／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-12-turn-1-1`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。
  你選擇：在紙上畫兩個轉彎，把入口圈起來
- **result**（source=`choice-effect-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：你畫出兩個轉彎，圈起地圖上的入口。實際走起來要多久，還沒有確認。
- **result**（source=`reaction-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎時，孩子：在轉角旁畫一個問號。
- **result**（source=`story-age-stage-12-turn-1-2`／anchor=`story-age-stage-12-turn-1-2`）
  新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- **daily**（source=`age-stage-12-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-12-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-map-response","reactionId":"nqa3-map-reply-1","actorId":"child-1","kind":"neutral","text":"在轉角旁畫一個問號。","eventId":"nqa3-map-choice","ageStageId":"age-stage-12","turnId":"age-stage-12-turn-1"}]`


## seed 11：七版本各兩行動的實際 Journal

### N03 工作／nqa3-document

家庭：twoCaregivers／pseudoSingle／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。
  你選擇：回覆無法出席，現在把意見寫進會議文件
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你回覆這次無法出席，把兩點意見寫進文件。會議怎麼決定，還要等紀錄。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[{"poolId":"nqa3-work-response","reactionId":"nqa3-work-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa3-work-choice","ageStageId":"age-stage-3","turnId":"age-stage-3-turn-1"}]`

### N03 工作／nqa3-reschedule

家庭：twoCaregivers／pseudoSingle／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。
  你選擇：詢問能否改到明早，附上自己可用的時段
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你送出明早可用的時段。行事曆上的會議還沒變動，你先照原本的照顧安排走。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[{"poolId":"nqa3-work-response","reactionId":"nqa3-work-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa3-work-choice","ageStageId":"age-stage-3","turnId":"age-stage-3-turn-1"}]`

### N03 中性：外出袋／nqa3-pack

家庭：twoCaregivers／pseudoSingle／singleFullTimeCare。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你在家照看孩子，準備原訂的散步。門邊外出袋裡的備用品還沒整理齊，離原本想出門的時間已經很近。
  你選擇：現在補齊袋子，晚一點出門
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你把這次要用的幾件放進袋裡，出門時間往後挪了一點。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  門邊的袋子，還差最後一件：收起手邊物品：你把外出袋放回門邊固定的位置。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### N03 中性：外出袋／nqa3-stay

家庭：twoCaregivers／pseudoSingle／singleFullTimeCare。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你在家照看孩子，準備原訂的散步。門邊外出袋裡的備用品還沒整理齊，離原本想出門的時間已經很近。
  你選擇：今天改在家陪孩子，袋子下午再整理
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你將袋子留在門邊，坐回孩子旁邊。今天這趟散步先取消。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  門邊的袋子，還差最後一件：收起手邊物品：你把外出袋放回門邊固定的位置。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### N04 作息訊息／nqa3-decline

家庭：twoCaregivers／pseudoSingle／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。
  你選擇：回訊說今天照原安排，下午外出改天再約
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：你回訊說今天照原安排，下午的外出改天再約。手機先放回桌邊。
- **result**（source=`reaction-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議時，支持家人：回訊說：「好，那我們下次再約。」
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa3-message-response","reactionId":"nqa3-message-reply-0","actorId":"support-1","kind":"neutral","text":"回訊說：「好，那我們下次再約。」","eventId":"nqa3-message-choice","ageStageId":"age-stage-4","turnId":"age-stage-4-turn-1"}]`

### N04 作息訊息／nqa3-ask

家庭：twoCaregivers／pseudoSingle／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。
  你選擇：先問下午原本想去哪裡，再決定要不要另約
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：你問起下午想去哪裡，沒有先答應改動今天的安排。
- **result**（source=`reaction-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議時，支持家人：傳來公園活動的時間，說只是先問問，還沒有約定一起去。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa3-message-response","reactionId":"nqa3-message-reply-1","actorId":"support-1","kind":"neutral","text":"傳來公園活動的時間，說只是先問問，還沒有約定一起去。","eventId":"nqa3-message-choice","ageStageId":"age-stage-4","turnId":"age-stage-4-turn-1"}]`

### N04 中性：找鞋／nqa3-find

家庭：twoCaregivers／pseudoSingle／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你在家陪孩子，原訂下午出去走走。門邊待收的物品擋著找鞋，外出用品也還分散在幾處。
  你選擇：先找齊鞋子，今天照原計畫出去
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你在門邊找齊鞋子，把要帶的物品放在一起。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  下午原本想出門，鞋子還沒找齊：收起手邊物品：你將門邊散落的物品集中到一側。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### N04 中性：找鞋／nqa3-toys

家庭：twoCaregivers／pseudoSingle／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你在家陪孩子，原訂下午出去走走。門邊待收的物品擋著找鞋，外出用品也還分散在幾處。
  你選擇：今天留在家，在地上排一條玩具路
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你把玩具排成一條路，坐在孩子旁邊。這次外出先取消。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  下午原本想出門，鞋子還沒找齊：收起手邊物品：你將門邊散落的物品集中到一側。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### N09 通知／nqa3-box

家庭：twoCaregivers／pseudoSingle／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-9-turn-1-1`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。
  你選擇：把鞋盒清出來，在盒上畫一扇門
- **result**（source=`choice-effect-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：你清出鞋盒，在盒上畫了一扇門，也在桌上的畫紙試畫了窗。移出的雜物暫時集中在桌邊。
- **result**（source=`reaction-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知時，孩子：把鞋盒另一邊指成車庫。
- **result**（source=`story-age-stage-9-turn-1-2`／anchor=`story-age-stage-9-turn-1-2`）
  明天要帶的紙盒，今晚才看到通知：收起手邊物品：你把今天畫過的紙張收成一疊，將手機通知標為已處理。
- **daily**（source=`age-stage-9-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-9-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-notice-response","reactionId":"nqa3-notice-reply-0","actorId":"child-1","kind":"neutral","text":"把鞋盒另一邊指成車庫。","eventId":"nqa3-notice-choice","ageStageId":"age-stage-9","turnId":"age-stage-9-turn-1"}]`

### N09 通知／nqa3-materials

家庭：twoCaregivers／pseudoSingle／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-9-turn-1-1`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。
  你選擇：回覆明天使用班上材料，今晚照原本的約定畫畫
- **result**（source=`choice-effect-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：你回覆明天使用班上材料，把手機放下，坐回畫紙旁邊畫了幾筆。回覆已送出，還不知道老師是否看見。
- **result**（source=`reaction-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知時，孩子：把畫紙推過來。
- **result**（source=`story-age-stage-9-turn-1-2`／anchor=`story-age-stage-9-turn-1-2`）
  明天要帶的紙盒，今晚才看到通知：收起手邊物品：你把今天畫過的紙張收成一疊，將手機通知標為已處理。
- **daily**（source=`age-stage-9-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-9-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-notice-response","reactionId":"nqa3-notice-reply-1","actorId":"child-1","kind":"neutral","text":"把畫紙推過來。","eventId":"nqa3-notice-choice","ageStageId":"age-stage-9","turnId":"age-stage-9-turn-1"}]`

### N11 相聚草稿／nqa3-menu

家庭：twoCaregivers／pseudoSingle／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-11-turn-1-1`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你在家看著週末相聚的草稿，原本想準備的菜已寫滿一張便條。孩子在旁邊畫桌上要放的小旗子。邀請訊息還沒送，收件人也還沒填；冰箱裡的食材只夠其中幾道。這次可以提議在家裡或外頭相聚。
  你選擇：保留在家吃飯，刪到現有食材能做的幾道菜
- **result**（source=`choice-effect-age-stage-11-turn-1-1-0`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你把菜單刪到冰箱現有食材能做的幾道，將在家相聚的提議寫進邀請草稿。訊息還沒寄出。
- **result**（source=`story-age-stage-11-turn-1-2`／anchor=`story-age-stage-11-turn-1-2`）
  相聚的菜單，冰箱貼不下了：收起手邊物品：你把改過的便條貼回冰箱，小旗子的畫留在旁邊。
- **daily**（source=`age-stage-11-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-11-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[]`

### N11 相聚草稿／nqa3-picnic

家庭：twoCaregivers／pseudoSingle／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-11-turn-1-1`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你在家看著週末相聚的草稿，原本想準備的菜已寫滿一張便條。孩子在旁邊畫桌上要放的小旗子。邀請訊息還沒送，收件人也還沒填；冰箱裡的食材只夠其中幾道。這次可以提議在家裡或外頭相聚。
  你選擇：提議改在公園野餐，這次不在家開伙
- **result**（source=`choice-effect-age-stage-11-turn-1-1-0`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你把公園野餐寫進邀請草稿，另記下要查天氣與可用地點。訊息還沒寄出，地點還沒定案。
- **result**（source=`story-age-stage-11-turn-1-2`／anchor=`story-age-stage-11-turn-1-2`）
  相聚的菜單，冰箱貼不下了：收起手邊物品：你把改過的便條貼回冰箱，小旗子的畫留在旁邊。
- **daily**（source=`age-stage-11-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-11-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[]`

### N12 新教室／nqa3-walk

家庭：twoCaregivers／pseudoSingle／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-12-turn-1-1`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。
  你選擇：帶著地圖走一趟到入口，只認路、不進教室
- **result**（source=`choice-effect-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：你帶孩子照地圖走到入口，在路上把兩個轉彎指給孩子看。今天沒有進教室。
- **result**（source=`reaction-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎時，孩子：指著入口旁的樹問是不是這棵。
- **result**（source=`story-age-stage-12-turn-1-2`／anchor=`story-age-stage-12-turn-1-2`）
  新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- **daily**（source=`age-stage-12-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-12-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-map-response","reactionId":"nqa3-map-reply-0","actorId":"child-1","kind":"neutral","text":"指著入口旁的樹問是不是這棵。","eventId":"nqa3-map-choice","ageStageId":"age-stage-12","turnId":"age-stage-12-turn-1"}]`

### N12 新教室／nqa3-draw

家庭：twoCaregivers／pseudoSingle／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-12-turn-1-1`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。
  你選擇：在紙上畫兩個轉彎，把入口圈起來
- **result**（source=`choice-effect-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：你畫出兩個轉彎，圈起地圖上的入口。實際走起來要多久，還沒有確認。
- **result**（source=`reaction-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎時，孩子：在轉角旁畫一個問號。
- **result**（source=`story-age-stage-12-turn-1-2`／anchor=`story-age-stage-12-turn-1-2`）
  新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- **daily**（source=`age-stage-12-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-12-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-map-response","reactionId":"nqa3-map-reply-1","actorId":"child-1","kind":"neutral","text":"在轉角旁畫一個問號。","eventId":"nqa3-map-choice","ageStageId":"age-stage-12","turnId":"age-stage-12-turn-1"}]`


## seed 2：七版本各兩行動的實際 Journal

### N03 工作／nqa3-document

家庭：multigenerational／uneven／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。
  你選擇：回覆無法出席，現在把意見寫進會議文件
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你回覆這次無法出席，把兩點意見寫進文件。會議怎麼決定，還要等紀錄。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[{"poolId":"nqa3-work-response","reactionId":"nqa3-work-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa3-work-choice","ageStageId":"age-stage-3","turnId":"age-stage-3-turn-1"}]`

### N03 工作／nqa3-reschedule

家庭：multigenerational／uneven／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。
  你選擇：詢問能否改到明早，附上自己可用的時段
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  手機跳出延後半小時的會議：你送出明早可用的時段。行事曆上的會議還沒變動，你先照原本的照顧安排走。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[{"poolId":"nqa3-work-response","reactionId":"nqa3-work-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa3-work-choice","ageStageId":"age-stage-3","turnId":"age-stage-3-turn-1"}]`

### N03 中性：外出袋／nqa3-pack

家庭：multigenerational／uneven／singleFullTimeCare。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你在家照看孩子，準備原訂的散步。門邊外出袋裡的備用品還沒整理齊，離原本想出門的時間已經很近。
  你選擇：現在補齊袋子，晚一點出門
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你把這次要用的幾件放進袋裡，出門時間往後挪了一點。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  門邊的袋子，還差最後一件：收起手邊物品：你把外出袋放回門邊固定的位置。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### N03 中性：外出袋／nqa3-stay

家庭：multigenerational／uneven／singleFullTimeCare。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-3-turn-1-1`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你在家照看孩子，準備原訂的散步。門邊外出袋裡的備用品還沒整理齊，離原本想出門的時間已經很近。
  你選擇：今天改在家陪孩子，袋子下午再整理
- **result**（source=`choice-effect-age-stage-3-turn-1-1-0`／anchor=`story-age-stage-3-turn-1-1`）
  門邊的袋子，還差最後一件：你將袋子留在門邊，坐回孩子旁邊。今天這趟散步先取消。
- **result**（source=`story-age-stage-3-turn-1-2`／anchor=`story-age-stage-3-turn-1-2`）
  門邊的袋子，還差最後一件：收起手邊物品：你把外出袋放回門邊固定的位置。
- **daily**（source=`age-stage-3-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-3-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### N04 作息訊息／nqa3-decline

家庭：multigenerational／uneven／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。
  你選擇：回訊說今天照原安排，下午外出改天再約
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：你回訊說今天照原安排，下午的外出改天再約。手機先放回桌邊。
- **result**（source=`reaction-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議時，同住長輩：回訊說：「好，那我們下次再約。」
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa3-message-response","reactionId":"nqa3-message-reply-0","actorId":"support-1","kind":"neutral","text":"回訊說：「好，那我們下次再約。」","eventId":"nqa3-message-choice","ageStageId":"age-stage-4","turnId":"age-stage-4-turn-1"}]`

### N04 作息訊息／nqa3-ask

家庭：multigenerational／uneven／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。
  你選擇：先問下午原本想去哪裡，再決定要不要另約
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議：你問起下午想去哪裡，沒有先答應改動今天的安排。
- **result**（source=`reaction-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  午睡前，手機傳來一段作息建議時，同住長輩：回訊說自己也還沒查時間。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa3-message-response","reactionId":"nqa3-message-reply-2","actorId":"support-1","kind":"neutral","text":"回訊說自己也還沒查時間。","eventId":"nqa3-message-choice","ageStageId":"age-stage-4","turnId":"age-stage-4-turn-1"}]`

### N04 中性：找鞋／nqa3-find

家庭：multigenerational／uneven／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你在家陪孩子，原訂下午出去走走。門邊待收的物品擋著找鞋，外出用品也還分散在幾處。
  你選擇：先找齊鞋子，今天照原計畫出去
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你在門邊找齊鞋子，把要帶的物品放在一起。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  下午原本想出門，鞋子還沒找齊：收起手邊物品：你將門邊散落的物品集中到一側。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### N04 中性：找鞋／nqa3-toys

家庭：multigenerational／uneven／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-4-turn-1-1`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你在家陪孩子，原訂下午出去走走。門邊待收的物品擋著找鞋，外出用品也還分散在幾處。
  你選擇：今天留在家，在地上排一條玩具路
- **result**（source=`choice-effect-age-stage-4-turn-1-1-0`／anchor=`story-age-stage-4-turn-1-1`）
  下午原本想出門，鞋子還沒找齊：你把玩具排成一條路，坐在孩子旁邊。這次外出先取消。
- **result**（source=`story-age-stage-4-turn-1-2`／anchor=`story-age-stage-4-turn-1-2`）
  下午原本想出門，鞋子還沒找齊：收起手邊物品：你將門邊散落的物品集中到一側。
- **daily**（source=`age-stage-4-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-4-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### N09 通知／nqa3-box

家庭：multigenerational／uneven／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-9-turn-1-1`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。
  你選擇：把鞋盒清出來，在盒上畫一扇門
- **result**（source=`choice-effect-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：你清出鞋盒，在盒上畫了一扇門，也在桌上的畫紙試畫了窗。移出的雜物暫時集中在桌邊。
- **result**（source=`reaction-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知時，孩子：把鞋盒另一邊指成車庫。
- **result**（source=`story-age-stage-9-turn-1-2`／anchor=`story-age-stage-9-turn-1-2`）
  明天要帶的紙盒，今晚才看到通知：收起手邊物品：你把今天畫過的紙張收成一疊，將手機通知標為已處理。
- **daily**（source=`age-stage-9-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-9-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-notice-response","reactionId":"nqa3-notice-reply-0","actorId":"child-1","kind":"neutral","text":"把鞋盒另一邊指成車庫。","eventId":"nqa3-notice-choice","ageStageId":"age-stage-9","turnId":"age-stage-9-turn-1"}]`

### N09 通知／nqa3-materials

家庭：multigenerational／uneven／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-9-turn-1-1`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。
  你選擇：回覆明天使用班上材料，今晚照原本的約定畫畫
- **result**（source=`choice-effect-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知：你回覆明天使用班上材料，把手機放下，坐回畫紙旁邊畫了幾筆。回覆已送出，還不知道老師是否看見。
- **result**（source=`reaction-age-stage-9-turn-1-1-0`／anchor=`story-age-stage-9-turn-1-1`）
  明天要帶的紙盒，今晚才看到通知時，孩子：把畫紙推過來。
- **result**（source=`story-age-stage-9-turn-1-2`／anchor=`story-age-stage-9-turn-1-2`）
  明天要帶的紙盒，今晚才看到通知：收起手邊物品：你把今天畫過的紙張收成一疊，將手機通知標為已處理。
- **daily**（source=`age-stage-9-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-9-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-notice-response","reactionId":"nqa3-notice-reply-1","actorId":"child-1","kind":"neutral","text":"把畫紙推過來。","eventId":"nqa3-notice-choice","ageStageId":"age-stage-9","turnId":"age-stage-9-turn-1"}]`

### N11 相聚草稿／nqa3-menu

家庭：multigenerational／uneven／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-11-turn-1-1`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你在家看著週末相聚的草稿，原本想準備的菜已寫滿一張便條。孩子在旁邊畫桌上要放的小旗子。邀請訊息還沒送，收件人也還沒填；冰箱裡的食材只夠其中幾道。這次可以提議在家裡或外頭相聚。
  你選擇：保留在家吃飯，刪到現有食材能做的幾道菜
- **result**（source=`choice-effect-age-stage-11-turn-1-1-0`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你把菜單刪到冰箱現有食材能做的幾道，將在家相聚的提議寫進邀請草稿。訊息還沒寄出。
- **result**（source=`story-age-stage-11-turn-1-2`／anchor=`story-age-stage-11-turn-1-2`）
  相聚的菜單，冰箱貼不下了：收起手邊物品：你把改過的便條貼回冰箱，小旗子的畫留在旁邊。
- **daily**（source=`age-stage-11-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-11-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[]`

### N11 相聚草稿／nqa3-picnic

家庭：multigenerational／uneven／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-11-turn-1-1`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你在家看著週末相聚的草稿，原本想準備的菜已寫滿一張便條。孩子在旁邊畫桌上要放的小旗子。邀請訊息還沒送，收件人也還沒填；冰箱裡的食材只夠其中幾道。這次可以提議在家裡或外頭相聚。
  你選擇：提議改在公園野餐，這次不在家開伙
- **result**（source=`choice-effect-age-stage-11-turn-1-1-0`／anchor=`story-age-stage-11-turn-1-1`）
  相聚的菜單，冰箱貼不下了：你把公園野餐寫進邀請草稿，另記下要查天氣與可用地點。訊息還沒寄出，地點還沒定案。
- **result**（source=`story-age-stage-11-turn-1-2`／anchor=`story-age-stage-11-turn-1-2`）
  相聚的菜單，冰箱貼不下了：收起手邊物品：你把改過的便條貼回冰箱，小旗子的畫留在旁邊。
- **daily**（source=`age-stage-11-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-11-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[]`

### N12 新教室／nqa3-walk

家庭：multigenerational／uneven／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-12-turn-1-1`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。
  你選擇：帶著地圖走一趟到入口，只認路、不進教室
- **result**（source=`choice-effect-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：你帶孩子照地圖走到入口，在路上把兩個轉彎指給孩子看。今天沒有進教室。
- **result**（source=`reaction-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎時，孩子：指著入口旁的樹問是不是這棵。
- **result**（source=`story-age-stage-12-turn-1-2`／anchor=`story-age-stage-12-turn-1-2`）
  新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- **daily**（source=`age-stage-12-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-12-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-map-response","reactionId":"nqa3-map-reply-0","actorId":"child-1","kind":"neutral","text":"指著入口旁的樹問是不是這棵。","eventId":"nqa3-map-choice","ageStageId":"age-stage-12","turnId":"age-stage-12-turn-1"}]`

### N12 新教室／nqa3-draw

家庭：multigenerational／uneven／dualIncome。4 checkpoints 全部 Restore；本階段 3 節點（含靜默 fallback）。

- **choice**（source=`story-age-stage-12-turn-1-1`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。
  你選擇：在紙上畫兩個轉彎，把入口圈起來
- **result**（source=`choice-effect-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎：你畫出兩個轉彎，圈起地圖上的入口。實際走起來要多久，還沒有確認。
- **result**（source=`reaction-age-stage-12-turn-1-1-0`／anchor=`story-age-stage-12-turn-1-1`）
  新教室的路，地圖上有兩個轉彎時，孩子：說今天先不看。
- **result**（source=`story-age-stage-12-turn-1-2`／anchor=`story-age-stage-12-turn-1-2`）
  新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- **daily**（source=`age-stage-12-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-12-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa3-map-response","reactionId":"nqa3-map-reply-2","actorId":"child-1","kind":"neutral","text":"說今天先不看。","eventId":"nqa3-map-choice","ageStageId":"age-stage-12","turnId":"age-stage-12-turn-1"}]`

## 每種限定 Reaction 與 none

只固定公開 checkpoint 的 rngState；沒有改 pool／權重或 mock 抽選器。none 不補台詞或記憶。基準 availability=0 指家庭人物，瞬時同事另有全 actor unavailable 負例。

### nqa3-document／nqa3-work-reply-0

rngState=1；actor=colleague-1；kind=neutral。

- 手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。 / 你選擇：回覆無法出席，現在把意見寫進會議文件
- 手機跳出延後半小時的會議：你回覆這次無法出席，把兩點意見寫進文件。會議怎麼決定，還要等紀錄。
- 手機跳出延後半小時的會議時，同事：在工作群組回覆：「文件收到了，我會在會上提出。」
- 手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- 你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

### nqa3-document／nqa3-work-none

rngState=2；actor=none；kind=none。

- 手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。 / 你選擇：回覆無法出席，現在把意見寫進會議文件
- 手機跳出延後半小時的會議：你回覆這次無法出席，把兩點意見寫進文件。會議怎麼決定，還要等紀錄。
- 手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- 你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

### nqa3-reschedule／nqa3-work-reply-1

rngState=1；actor=colleague-1；kind=neutral。

- 手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。 / 你選擇：詢問能否改到明早，附上自己可用的時段
- 手機跳出延後半小時的會議：你送出明早可用的時段。行事曆上的會議還沒變動，你先照原本的照顧安排走。
- 手機跳出延後半小時的會議時，同事：在工作群組回覆：「我先問主持人，還不能答應。」
- 手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- 你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

### nqa3-reschedule／nqa3-work-reply-2

rngState=6；actor=colleague-1；kind=neutral。

- 手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。 / 你選擇：詢問能否改到明早，附上自己可用的時段
- 手機跳出延後半小時的會議：你送出明早可用的時段。行事曆上的會議還沒變動，你先照原本的照顧安排走。
- 手機跳出延後半小時的會議時，同事：在工作群組回覆：「已看到你的時段，這次仍照原時間。」
- 手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- 你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

### nqa3-reschedule／nqa3-work-none

rngState=9；actor=none；kind=none。

- 手機跳出延後半小時的會議：你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。 / 你選擇：詢問能否改到明早，附上自己可用的時段
- 手機跳出延後半小時的會議：你送出明早可用的時段。行事曆上的會議還沒變動，你先照原本的照顧安排走。
- 手機跳出延後半小時的會議：收起手邊物品：你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。
- 你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

### nqa3-decline／nqa3-message-none

rngState=1；actor=none；kind=none。

- 午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。 / 你選擇：回訊說今天照原安排，下午外出改天再約
- 午睡前，手機傳來一段作息建議：你回訊說今天照原安排，下午的外出改天再約。手機先放回桌邊。
- 午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- 你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

### nqa3-decline／nqa3-message-reply-0

rngState=5；actor=support-1；kind=neutral。

- 午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。 / 你選擇：回訊說今天照原安排，下午外出改天再約
- 午睡前，手機傳來一段作息建議：你回訊說今天照原安排，下午的外出改天再約。手機先放回桌邊。
- 午睡前，手機傳來一段作息建議時，支持家人（不同住）：回訊說：「好，那我們下次再約。」
- 午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- 你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

### nqa3-ask／nqa3-message-none

rngState=1；actor=none；kind=none。

- 午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。 / 你選擇：先問下午原本想去哪裡，再決定要不要另約
- 午睡前，手機傳來一段作息建議：你問起下午想去哪裡，沒有先答應改動今天的安排。
- 午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- 你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

### nqa3-ask／nqa3-message-reply-1

rngState=2；actor=support-1；kind=neutral。

- 午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。 / 你選擇：先問下午原本想去哪裡，再決定要不要另約
- 午睡前，手機傳來一段作息建議：你問起下午想去哪裡，沒有先答應改動今天的安排。
- 午睡前，手機傳來一段作息建議時，支持家人（不同住）：傳來公園活動的時間，說只是先問問，還沒有約定一起去。
- 午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- 你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

### nqa3-ask／nqa3-message-reply-2

rngState=5；actor=support-1；kind=neutral。

- 午睡前，手機傳來一段作息建議：午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。 / 你選擇：先問下午原本想去哪裡，再決定要不要另約
- 午睡前，手機傳來一段作息建議：你問起下午想去哪裡，沒有先答應改動今天的安排。
- 午睡前，手機傳來一段作息建議時，支持家人（不同住）：回訊說自己也還沒查時間。
- 午睡前，手機傳來一段作息建議：收起手邊物品：你把今天原有的安排留在便條上，手機停在剛才的對話頁。
- 你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

### nqa3-box／nqa3-notice-none

rngState=1；actor=none；kind=none。

- 明天要帶的紙盒，今晚才看到通知：晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。 / 你選擇：把鞋盒清出來，在盒上畫一扇門
- 明天要帶的紙盒，今晚才看到通知：你清出鞋盒，在盒上畫了一扇門，也在桌上的畫紙試畫了窗。移出的雜物暫時集中在桌邊。
- 明天要帶的紙盒，今晚才看到通知：收起手邊物品：你把今天畫過的紙張收成一疊，將手機通知標為已處理。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa3-box／nqa3-notice-reply-0

rngState=5；actor=child-1；kind=neutral。

- 明天要帶的紙盒，今晚才看到通知：晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。 / 你選擇：把鞋盒清出來，在盒上畫一扇門
- 明天要帶的紙盒，今晚才看到通知：你清出鞋盒，在盒上畫了一扇門，也在桌上的畫紙試畫了窗。移出的雜物暫時集中在桌邊。
- 明天要帶的紙盒，今晚才看到通知時，孩子：把鞋盒另一邊指成車庫。
- 明天要帶的紙盒，今晚才看到通知：收起手邊物品：你把今天畫過的紙張收成一疊，將手機通知標為已處理。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa3-materials／nqa3-notice-none

rngState=1；actor=none；kind=none。

- 明天要帶的紙盒，今晚才看到通知：晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。 / 你選擇：回覆明天使用班上材料，今晚照原本的約定畫畫
- 明天要帶的紙盒，今晚才看到通知：你回覆明天使用班上材料，把手機放下，坐回畫紙旁邊畫了幾筆。回覆已送出，還不知道老師是否看見。
- 明天要帶的紙盒，今晚才看到通知：收起手邊物品：你把今天畫過的紙張收成一疊，將手機通知標為已處理。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa3-materials／nqa3-notice-reply-1

rngState=5；actor=child-1；kind=neutral。

- 明天要帶的紙盒，今晚才看到通知：晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。 / 你選擇：回覆明天使用班上材料，今晚照原本的約定畫畫
- 明天要帶的紙盒，今晚才看到通知：你回覆明天使用班上材料，把手機放下，坐回畫紙旁邊畫了幾筆。回覆已送出，還不知道老師是否看見。
- 明天要帶的紙盒，今晚才看到通知時，孩子：把畫紙推過來。
- 明天要帶的紙盒，今晚才看到通知：收起手邊物品：你把今天畫過的紙張收成一疊，將手機通知標為已處理。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa3-walk／nqa3-map-none

rngState=1；actor=none；kind=none。

- 新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。 / 你選擇：帶著地圖走一趟到入口，只認路、不進教室
- 新教室的路，地圖上有兩個轉彎：你帶孩子照地圖走到入口，在路上把兩個轉彎指給孩子看。今天沒有進教室。
- 新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa3-walk／nqa3-map-reply-0

rngState=5；actor=child-1；kind=neutral。

- 新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。 / 你選擇：帶著地圖走一趟到入口，只認路、不進教室
- 新教室的路，地圖上有兩個轉彎：你帶孩子照地圖走到入口，在路上把兩個轉彎指給孩子看。今天沒有進教室。
- 新教室的路，地圖上有兩個轉彎時，孩子：指著入口旁的樹問是不是這棵。
- 新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa3-draw／nqa3-map-none

rngState=1；actor=none；kind=none。

- 新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。 / 你選擇：在紙上畫兩個轉彎，把入口圈起來
- 新教室的路，地圖上有兩個轉彎：你畫出兩個轉彎，圈起地圖上的入口。實際走起來要多久，還沒有確認。
- 新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa3-draw／nqa3-map-reply-1

rngState=2；actor=child-1；kind=neutral。

- 新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。 / 你選擇：在紙上畫兩個轉彎，把入口圈起來
- 新教室的路，地圖上有兩個轉彎：你畫出兩個轉彎，圈起地圖上的入口。實際走起來要多久，還沒有確認。
- 新教室的路，地圖上有兩個轉彎時，孩子：在轉角旁畫一個問號。
- 新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa3-draw／nqa3-map-reply-2

rngState=5；actor=child-1；kind=neutral。

- 新教室的路，地圖上有兩個轉彎：在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。 / 你選擇：在紙上畫兩個轉彎，把入口圈起來
- 新教室的路，地圖上有兩個轉彎：你畫出兩個轉彎，圈起地圖上的入口。實際走起來要多久，還沒有確認。
- 新教室的路，地圖上有兩個轉彎時，孩子：說今天先不看。
- 新教室的路，地圖上有兩個轉彎：收起手邊物品：你把那張地圖摺好，放進下次出門要帶的袋子。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
