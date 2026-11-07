# Narrative A2：實際 Journal

來源：`NQA2_WRITE_EVIDENCE=1 npm test -- tests/narrative-a2.test.ts`，真實 ContentPack 經公開 Engine 與 projectJournal 輸出。
五題兩行動 × 四基準家庭 seed 9／1／11／2，逐 checkpoint Save／Restore；未抽到的反應不補寫。
這些是各題實跑，完整 12 階段／Review 另列於 [原始 JSON](NARRATIVE-A2-RUNS.json)；[分布](NARRATIVE-A2-DISTRIBUTION.json) 另報。

## 五題雙分支（seed 9）

### 餐桌 / nqa2-simplify / seed 9

家庭：singleCaregiver／primaryAndBackup／dualIncome。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-2-turn-1-1`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你在可照看孩子的餐廚空間準備自己的晚餐。一道菜已備好，第二道才切到一半；桌邊還排著稍早用過的器具。離你原訂吃飯的時間不遠，現在要先完成哪邊？
  你選擇：今天少做一道菜，先空出吃飯的位置
- **result**（source=`choice-effect-age-stage-2-turn-1-1-0`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你收起第二道菜的備料，清出桌邊的位置。今天的晚餐少了一道菜，收起的食材之後仍要處理。
- **result**（source=`story-age-stage-2-turn-1-2`／anchor=`story-age-stage-2-turn-1-2`）
  少做一道菜後的桌邊：你把收起的第二道菜備料留待之後處理，再把今天用到的器具集中到桌邊，將椅子推回去。
- **daily**（source=`age-stage-2-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-2-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### 餐桌 / nqa2-finish / seed 9

家庭：singleCaregiver／primaryAndBackup／dualIncome。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-2-turn-1-1`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你在可照看孩子的餐廚空間準備自己的晚餐。一道菜已備好，第二道才切到一半；桌邊還排著稍早用過的器具。離你原訂吃飯的時間不遠，現在要先完成哪邊？
  你選擇：把第二道菜做完，桌邊只先挪出一個位置
- **result**（source=`choice-effect-age-stage-2-turn-1-1-0`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你把第二道菜做完，只在桌邊挪出一個位置。坐下時比原訂時間晚了一些，其餘器具還沒收。
- **result**（source=`story-age-stage-2-turn-1-2`／anchor=`story-age-stage-2-turn-1-2`）
  兩道菜用餐後的桌邊：兩道菜用餐後，你把做菜與吃飯用過的器具集中到桌邊，將椅子推回去。
- **daily**（source=`age-stage-2-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-2-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### 公園 / nqa2-loop / seed 9

家庭：singleCaregiver／primaryAndBackup／dualIncome。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-5-turn-1-1`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。
  你選擇：陪孩子沿小路繞一圈，到出口就回家
- **result**（source=`choice-effect-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你指著回到出口的小路，陪孩子繞了一圈，再把回家方向指給他看。晚餐要晚一點開始準備。
- **result**（source=`story-age-stage-5-turn-1-2`／anchor=`story-age-stage-5-turn-1-2`）
  外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- **daily**（source=`age-stage-5-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-5-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa2-park-response","reactionId":"nqa2-park-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa2-park-choice","ageStageId":"age-stage-5","turnId":"age-stage-5-turn-1"}]`

### 公園 / nqa2-home / seed 9

家庭：singleCaregiver／primaryAndBackup／dualIncome。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-5-turn-1-1`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。
  你選擇：現在往家走，路上一起找剛才看見的紅色車子
- **result**（source=`choice-effect-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你帶著孩子朝回家的路走，指給他看路邊停著的一台紅色車子。公園留在身後。
- **result**（source=`reaction-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈時，孩子：還往公園方向伸手。
- **result**（source=`story-age-stage-5-turn-1-2`／anchor=`story-age-stage-5-turn-1-2`）
  外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- **daily**（source=`age-stage-5-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-5-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa2-park-response","reactionId":"nqa2-reach-park","actorId":"child-1","kind":"neutral","text":"還往公園方向伸手。","eventId":"nqa2-park-choice","ageStageId":"age-stage-5","turnId":"age-stage-5-turn-1"}]`

### 用品 / nqa2-buy / seed 9

家庭：singleCaregiver／primaryAndBackup／dualIncome。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-6-turn-1-1`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你和孩子在家整理外出袋，發現濕紙巾只剩最後一包，仍夠這次使用。今天原訂只到公園；商店與公園都能步行到達，但多去一站會壓縮玩耍時間。
  你選擇：今天先去商店補貨，再到公園短暫走走
- **result**（source=`choice-effect-age-stage-6-turn-1-1-0`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你帶孩子先到商店補了一包濕紙巾，將多出的一包放進袋子，再往公園走。今天能停留的時間短了一點。
- **result**（source=`story-age-stage-6-turn-1-2`／anchor=`story-age-stage-6-turn-1-2`）
  清單上多了已有備用：回家後，你在外出袋的清單分出『待補』與『已有備用』兩格，把今天多買的一包記在『已有備用』。清單留在袋內側。
- **result**（source=`node-effect-age-stage-6-turn-1-2-0`／anchor=`story-age-stage-6-turn-1-2`）
  清單上多了已有備用：你把已補的一包記在袋內清單的『已有備用』格，留下這次實際盤點的記錄。
- **daily**（source=`age-stage-6-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-6-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 用品 / nqa2-list / seed 9

家庭：singleCaregiver／primaryAndBackup／dualIncome。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-6-turn-1-1`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你和孩子在家整理外出袋，發現濕紙巾只剩最後一包，仍夠這次使用。今天原訂只到公園；商店與公園都能步行到達，但多去一站會壓縮玩耍時間。
  你選擇：照原路去公園，出門前把補貨寫進手機清單
- **result**（source=`choice-effect-age-stage-6-turn-1-1-0`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你在手機寫下要補的品項，帶孩子和袋裡剩下的一包出門。這次仍照原路去公園，補貨還沒完成。
- **result**（source=`story-age-stage-6-turn-1-2`／anchor=`story-age-stage-6-turn-1-2`）
  清單上仍有待補的一格：回家後，你在外出袋的清單分出『待補』與『已有備用』兩格，把尚未補貨的濕紙巾記在『待補』。手機上的補貨待辦仍留著，袋內也有了可查的清單。
- **result**（source=`node-effect-age-stage-6-turn-1-2-0`／anchor=`story-age-stage-6-turn-1-2`）
  清單上仍有待補的一格：你把尚未補貨的濕紙巾記在袋內清單的『待補』格，補貨待辦沒有被當成已完成。
- **daily**（source=`age-stage-6-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-6-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 雨天 / nqa2-wait / seed 9

家庭：singleCaregiver／primaryAndBackup／dualIncome。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-7-turn-1-1`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你已在托育點門內接到孩子，兩人停在有遮蔽的等候區。外頭下著大雨，剛才走來時你的襪子已濕；托育點允許你們再等一會。回家有較長的有遮蔽步行路線，也可先待在這裡整理雨具。
  你選擇：留在等候區整理雨具，晚一點再出發
- **result**（source=`choice-effect-age-stage-7-turn-1-1-0`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你和孩子留在等候區，重新整理雨具。時間過了一會，門外仍聽得見雨聲，返家的路還沒走。
- **result**（source=`story-age-stage-7-turn-1-2`／anchor=`story-age-stage-7-turn-1-2`）
  等候後，再沿長路返家：整理好雨具後，你帶孩子離開等候區，沿有遮蔽的長路返家。沒有等到雨停；進門後，你把濕襪放進待洗籃，將外出袋留在門邊晾放。
- **daily**（source=`age-stage-7-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-7-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 雨天 / nqa2-covered / seed 9

家庭：singleCaregiver／primaryAndBackup／dualIncome。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-7-turn-1-1`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你已在托育點門內接到孩子，兩人停在有遮蔽的等候區。外頭下著大雨，剛才走來時你的襪子已濕；托育點允許你們再等一會。回家有較長的有遮蔽步行路線，也可先待在這裡整理雨具。
  你選擇：整理好雨具，沿有遮蔽的長路慢慢回家
- **result**（source=`choice-effect-age-stage-7-turn-1-1-0`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你整理好雨具，帶孩子沿有遮蔽的路往家走。這一趟繞遠了一些。
- **result**（source=`story-age-stage-7-turn-1-2`／anchor=`story-age-stage-7-turn-1-2`）
  繞過長路，回家收濕襪：沿有遮蔽的長路走回家後，你把濕襪放進待洗籃，將外出袋留在門邊晾放。繞遠的這段路已走完。
- **daily**（source=`age-stage-7-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-7-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 休息 / nqa2-read / seed 9

家庭：singleCaregiver／primaryAndBackup／dualIncome。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-10-turn-1-1`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。
  你選擇：先喝水、看兩頁書，再開一局
- **result**（source=`choice-effect-age-stage-10-turn-1-1-0`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你說自己先喝水、看兩頁書，喝了一口水，將書打開。桌遊盒暫時留在桌邊，你仍坐在孩子旁邊。
- **result**（source=`story-age-stage-10-turn-1-2`／anchor=`story-age-stage-10-turn-1-2`）
  書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- **daily**（source=`age-stage-10-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-10-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa2-rest-response","reactionId":"nqa2-rest-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa2-rest-choice","ageStageId":"age-stage-10","turnId":"age-stage-10-turn-1"}]`

### 休息 / nqa2-play / seed 9

家庭：singleCaregiver／primaryAndBackup／dualIncome。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-10-turn-1-1`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。
  你選擇：現在只玩一局，玩完就把遊戲收回盒子
- **result**（source=`choice-effect-age-stage-10-turn-1-1-0`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你說今天先玩一局，打開盒子排好遊戲。想休息的時間先往後挪，孩子是否願意只玩一局還沒說定。
- **result**（source=`story-age-stage-10-turn-1-2`／anchor=`story-age-stage-10-turn-1-2`）
  書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- **daily**（source=`age-stage-10-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-10-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa2-rest-response","reactionId":"nqa2-rest-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa2-rest-choice","ageStageId":"age-stage-10","turnId":"age-stage-10-turn-1"}]`

## 其餘三基準家庭完整 Journal

### 餐桌 / nqa2-simplify / seed 1

家庭：twoCaregivers／shared／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-2-turn-1-1`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你在可照看孩子的餐廚空間準備自己的晚餐。一道菜已備好，第二道才切到一半；桌邊還排著稍早用過的器具。離你原訂吃飯的時間不遠，現在要先完成哪邊？
  你選擇：今天少做一道菜，先空出吃飯的位置
- **result**（source=`choice-effect-age-stage-2-turn-1-1-0`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你收起第二道菜的備料，清出桌邊的位置。今天的晚餐少了一道菜，收起的食材之後仍要處理。
- **result**（source=`story-age-stage-2-turn-1-2`／anchor=`story-age-stage-2-turn-1-2`）
  少做一道菜後的桌邊：你把收起的第二道菜備料留待之後處理，再把今天用到的器具集中到桌邊，將椅子推回去。
- **daily**（source=`age-stage-2-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-2-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### 餐桌 / nqa2-simplify / seed 11

家庭：twoCaregivers／pseudoSingle／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-2-turn-1-1`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你在可照看孩子的餐廚空間準備自己的晚餐。一道菜已備好，第二道才切到一半；桌邊還排著稍早用過的器具。離你原訂吃飯的時間不遠，現在要先完成哪邊？
  你選擇：今天少做一道菜，先空出吃飯的位置
- **result**（source=`choice-effect-age-stage-2-turn-1-1-0`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你收起第二道菜的備料，清出桌邊的位置。今天的晚餐少了一道菜，收起的食材之後仍要處理。
- **result**（source=`story-age-stage-2-turn-1-2`／anchor=`story-age-stage-2-turn-1-2`）
  少做一道菜後的桌邊：你把收起的第二道菜備料留待之後處理，再把今天用到的器具集中到桌邊，將椅子推回去。
- **daily**（source=`age-stage-2-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-2-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### 餐桌 / nqa2-simplify / seed 2

家庭：multigenerational／uneven／singleFullTimeCare。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-2-turn-1-1`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你在可照看孩子的餐廚空間準備自己的晚餐。一道菜已備好，第二道才切到一半；桌邊還排著稍早用過的器具。離你原訂吃飯的時間不遠，現在要先完成哪邊？
  你選擇：今天少做一道菜，先空出吃飯的位置
- **result**（source=`choice-effect-age-stage-2-turn-1-1-0`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你收起第二道菜的備料，清出桌邊的位置。今天的晚餐少了一道菜，收起的食材之後仍要處理。
- **result**（source=`story-age-stage-2-turn-1-2`／anchor=`story-age-stage-2-turn-1-2`）
  少做一道菜後的桌邊：你把收起的第二道菜備料留待之後處理，再把今天用到的器具集中到桌邊，將椅子推回去。
- **daily**（source=`age-stage-2-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-2-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### 餐桌 / nqa2-finish / seed 1

家庭：twoCaregivers／shared／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-2-turn-1-1`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你在可照看孩子的餐廚空間準備自己的晚餐。一道菜已備好，第二道才切到一半；桌邊還排著稍早用過的器具。離你原訂吃飯的時間不遠，現在要先完成哪邊？
  你選擇：把第二道菜做完，桌邊只先挪出一個位置
- **result**（source=`choice-effect-age-stage-2-turn-1-1-0`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你把第二道菜做完，只在桌邊挪出一個位置。坐下時比原訂時間晚了一些，其餘器具還沒收。
- **result**（source=`story-age-stage-2-turn-1-2`／anchor=`story-age-stage-2-turn-1-2`）
  兩道菜用餐後的桌邊：兩道菜用餐後，你把做菜與吃飯用過的器具集中到桌邊，將椅子推回去。
- **daily**（source=`age-stage-2-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-2-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### 餐桌 / nqa2-finish / seed 11

家庭：twoCaregivers／pseudoSingle／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-2-turn-1-1`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你在可照看孩子的餐廚空間準備自己的晚餐。一道菜已備好，第二道才切到一半；桌邊還排著稍早用過的器具。離你原訂吃飯的時間不遠，現在要先完成哪邊？
  你選擇：把第二道菜做完，桌邊只先挪出一個位置
- **result**（source=`choice-effect-age-stage-2-turn-1-1-0`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你把第二道菜做完，只在桌邊挪出一個位置。坐下時比原訂時間晚了一些，其餘器具還沒收。
- **result**（source=`story-age-stage-2-turn-1-2`／anchor=`story-age-stage-2-turn-1-2`）
  兩道菜用餐後的桌邊：兩道菜用餐後，你把做菜與吃飯用過的器具集中到桌邊，將椅子推回去。
- **daily**（source=`age-stage-2-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-2-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### 餐桌 / nqa2-finish / seed 2

家庭：multigenerational／uneven／singleFullTimeCare。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-2-turn-1-1`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你在可照看孩子的餐廚空間準備自己的晚餐。一道菜已備好，第二道才切到一半；桌邊還排著稍早用過的器具。離你原訂吃飯的時間不遠，現在要先完成哪邊？
  你選擇：把第二道菜做完，桌邊只先挪出一個位置
- **result**（source=`choice-effect-age-stage-2-turn-1-1-0`／anchor=`story-age-stage-2-turn-1-1`）
  菜切一半，桌邊的器具還沒收：你把第二道菜做完，只在桌邊挪出一個位置。坐下時比原訂時間晚了一些，其餘器具還沒收。
- **result**（source=`story-age-stage-2-turn-1-2`／anchor=`story-age-stage-2-turn-1-2`）
  兩道菜用餐後的桌邊：兩道菜用餐後，你把做菜與吃飯用過的器具集中到桌邊，將椅子推回去。
- **daily**（source=`age-stage-2-turn-1-completion-daily-v1-infant-voice`／anchor=`age-stage-2-turn-1-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

### 公園 / nqa2-loop / seed 1

家庭：twoCaregivers／shared／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-5-turn-1-1`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。
  你選擇：陪孩子沿小路繞一圈，到出口就回家
- **result**（source=`choice-effect-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你指著回到出口的小路，陪孩子繞了一圈，再把回家方向指給他看。晚餐要晚一點開始準備。
- **result**（source=`reaction-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈時，孩子：又指向另一條路。
- **result**（source=`story-age-stage-5-turn-1-2`／anchor=`story-age-stage-5-turn-1-2`）
  外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- **daily**（source=`age-stage-5-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-5-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa2-park-response","reactionId":"nqa2-another-path","actorId":"child-1","kind":"neutral","text":"又指向另一條路。","eventId":"nqa2-park-choice","ageStageId":"age-stage-5","turnId":"age-stage-5-turn-1"}]`

### 公園 / nqa2-loop / seed 11

家庭：twoCaregivers／pseudoSingle／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-5-turn-1-1`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。
  你選擇：陪孩子沿小路繞一圈，到出口就回家
- **result**（source=`choice-effect-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你指著回到出口的小路，陪孩子繞了一圈，再把回家方向指給他看。晚餐要晚一點開始準備。
- **result**（source=`reaction-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈時，孩子：跟著看出口。
- **result**（source=`story-age-stage-5-turn-1-2`／anchor=`story-age-stage-5-turn-1-2`）
  外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- **daily**（source=`age-stage-5-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-5-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa2-park-response","reactionId":"nqa2-look-exit","actorId":"child-1","kind":"neutral","text":"跟著看出口。","eventId":"nqa2-park-choice","ageStageId":"age-stage-5","turnId":"age-stage-5-turn-1"}]`

### 公園 / nqa2-loop / seed 2

家庭：multigenerational／uneven／singleFullTimeCare。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-5-turn-1-1`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。
  你選擇：陪孩子沿小路繞一圈，到出口就回家
- **result**（source=`choice-effect-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你指著回到出口的小路，陪孩子繞了一圈，再把回家方向指給他看。晚餐要晚一點開始準備。
- **result**（source=`story-age-stage-5-turn-1-2`／anchor=`story-age-stage-5-turn-1-2`）
  外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- **daily**（source=`age-stage-5-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-5-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa2-park-response","reactionId":"nqa2-park-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa2-park-choice","ageStageId":"age-stage-5","turnId":"age-stage-5-turn-1"}]`

### 公園 / nqa2-home / seed 1

家庭：twoCaregivers／shared／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-5-turn-1-1`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。
  你選擇：現在往家走，路上一起找剛才看見的紅色車子
- **result**（source=`choice-effect-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你帶著孩子朝回家的路走，指給他看路邊停著的一台紅色車子。公園留在身後。
- **result**（source=`reaction-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈時，孩子：停下來指著車子。
- **result**（source=`story-age-stage-5-turn-1-2`／anchor=`story-age-stage-5-turn-1-2`）
  外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- **daily**（source=`age-stage-5-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-5-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa2-park-response","reactionId":"nqa2-point-car","actorId":"child-1","kind":"neutral","text":"停下來指著車子。","eventId":"nqa2-park-choice","ageStageId":"age-stage-5","turnId":"age-stage-5-turn-1"}]`

### 公園 / nqa2-home / seed 11

家庭：twoCaregivers／pseudoSingle／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-5-turn-1-1`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。
  你選擇：現在往家走，路上一起找剛才看見的紅色車子
- **result**（source=`choice-effect-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你帶著孩子朝回家的路走，指給他看路邊停著的一台紅色車子。公園留在身後。
- **result**（source=`reaction-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈時，孩子：停下來指著車子。
- **result**（source=`story-age-stage-5-turn-1-2`／anchor=`story-age-stage-5-turn-1-2`）
  外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- **daily**（source=`age-stage-5-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-5-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa2-park-response","reactionId":"nqa2-point-car","actorId":"child-1","kind":"neutral","text":"停下來指著車子。","eventId":"nqa2-park-choice","ageStageId":"age-stage-5","turnId":"age-stage-5-turn-1"}]`

### 公園 / nqa2-home / seed 2

家庭：multigenerational／uneven／singleFullTimeCare。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-5-turn-1-1`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。
  你選擇：現在往家走，路上一起找剛才看見的紅色車子
- **result**（source=`choice-effect-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈：你帶著孩子朝回家的路走，指給他看路邊停著的一台紅色車子。公園留在身後。
- **result**（source=`reaction-age-stage-5-turn-1-1-0`／anchor=`story-age-stage-5-turn-1-1`）
  公園出口前，還想再走一圈時，孩子：還往公園方向伸手。
- **result**（source=`story-age-stage-5-turn-1-2`／anchor=`story-age-stage-5-turn-1-2`）
  外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- **daily**（source=`age-stage-5-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-5-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[{"poolId":"nqa2-park-response","reactionId":"nqa2-reach-park","actorId":"child-1","kind":"neutral","text":"還往公園方向伸手。","eventId":"nqa2-park-choice","ageStageId":"age-stage-5","turnId":"age-stage-5-turn-1"}]`

### 用品 / nqa2-buy / seed 1

家庭：twoCaregivers／shared／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-6-turn-1-1`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你和孩子在家整理外出袋，發現濕紙巾只剩最後一包，仍夠這次使用。今天原訂只到公園；商店與公園都能步行到達，但多去一站會壓縮玩耍時間。
  你選擇：今天先去商店補貨，再到公園短暫走走
- **result**（source=`choice-effect-age-stage-6-turn-1-1-0`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你帶孩子先到商店補了一包濕紙巾，將多出的一包放進袋子，再往公園走。今天能停留的時間短了一點。
- **result**（source=`story-age-stage-6-turn-1-2`／anchor=`story-age-stage-6-turn-1-2`）
  清單上多了已有備用：回家後，你在外出袋的清單分出『待補』與『已有備用』兩格，把今天多買的一包記在『已有備用』。清單留在袋內側。
- **result**（source=`node-effect-age-stage-6-turn-1-2-0`／anchor=`story-age-stage-6-turn-1-2`）
  清單上多了已有備用：你把已補的一包記在袋內清單的『已有備用』格，留下這次實際盤點的記錄。
- **daily**（source=`age-stage-6-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-6-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 用品 / nqa2-buy / seed 11

家庭：twoCaregivers／pseudoSingle／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-6-turn-1-1`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你和孩子在家整理外出袋，發現濕紙巾只剩最後一包，仍夠這次使用。今天原訂只到公園；商店與公園都能步行到達，但多去一站會壓縮玩耍時間。
  你選擇：今天先去商店補貨，再到公園短暫走走
- **result**（source=`choice-effect-age-stage-6-turn-1-1-0`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你帶孩子先到商店補了一包濕紙巾，將多出的一包放進袋子，再往公園走。今天能停留的時間短了一點。
- **result**（source=`story-age-stage-6-turn-1-2`／anchor=`story-age-stage-6-turn-1-2`）
  清單上多了已有備用：回家後，你在外出袋的清單分出『待補』與『已有備用』兩格，把今天多買的一包記在『已有備用』。清單留在袋內側。
- **result**（source=`node-effect-age-stage-6-turn-1-2-0`／anchor=`story-age-stage-6-turn-1-2`）
  清單上多了已有備用：你把已補的一包記在袋內清單的『已有備用』格，留下這次實際盤點的記錄。
- **daily**（source=`age-stage-6-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-6-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 用品 / nqa2-buy / seed 2

家庭：multigenerational／uneven／singleFullTimeCare。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-6-turn-1-1`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你和孩子在家整理外出袋，發現濕紙巾只剩最後一包，仍夠這次使用。今天原訂只到公園；商店與公園都能步行到達，但多去一站會壓縮玩耍時間。
  你選擇：今天先去商店補貨，再到公園短暫走走
- **result**（source=`choice-effect-age-stage-6-turn-1-1-0`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你帶孩子先到商店補了一包濕紙巾，將多出的一包放進袋子，再往公園走。今天能停留的時間短了一點。
- **result**（source=`story-age-stage-6-turn-1-2`／anchor=`story-age-stage-6-turn-1-2`）
  清單上多了已有備用：回家後，你在外出袋的清單分出『待補』與『已有備用』兩格，把今天多買的一包記在『已有備用』。清單留在袋內側。
- **result**（source=`node-effect-age-stage-6-turn-1-2-0`／anchor=`story-age-stage-6-turn-1-2`）
  清單上多了已有備用：你把已補的一包記在袋內清單的『已有備用』格，留下這次實際盤點的記錄。
- **daily**（source=`age-stage-6-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-6-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 用品 / nqa2-list / seed 1

家庭：twoCaregivers／shared／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-6-turn-1-1`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你和孩子在家整理外出袋，發現濕紙巾只剩最後一包，仍夠這次使用。今天原訂只到公園；商店與公園都能步行到達，但多去一站會壓縮玩耍時間。
  你選擇：照原路去公園，出門前把補貨寫進手機清單
- **result**（source=`choice-effect-age-stage-6-turn-1-1-0`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你在手機寫下要補的品項，帶孩子和袋裡剩下的一包出門。這次仍照原路去公園，補貨還沒完成。
- **result**（source=`story-age-stage-6-turn-1-2`／anchor=`story-age-stage-6-turn-1-2`）
  清單上仍有待補的一格：回家後，你在外出袋的清單分出『待補』與『已有備用』兩格，把尚未補貨的濕紙巾記在『待補』。手機上的補貨待辦仍留著，袋內也有了可查的清單。
- **result**（source=`node-effect-age-stage-6-turn-1-2-0`／anchor=`story-age-stage-6-turn-1-2`）
  清單上仍有待補的一格：你把尚未補貨的濕紙巾記在袋內清單的『待補』格，補貨待辦沒有被當成已完成。
- **daily**（source=`age-stage-6-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-6-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 用品 / nqa2-list / seed 11

家庭：twoCaregivers／pseudoSingle／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-6-turn-1-1`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你和孩子在家整理外出袋，發現濕紙巾只剩最後一包，仍夠這次使用。今天原訂只到公園；商店與公園都能步行到達，但多去一站會壓縮玩耍時間。
  你選擇：照原路去公園，出門前把補貨寫進手機清單
- **result**（source=`choice-effect-age-stage-6-turn-1-1-0`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你在手機寫下要補的品項，帶孩子和袋裡剩下的一包出門。這次仍照原路去公園，補貨還沒完成。
- **result**（source=`story-age-stage-6-turn-1-2`／anchor=`story-age-stage-6-turn-1-2`）
  清單上仍有待補的一格：回家後，你在外出袋的清單分出『待補』與『已有備用』兩格，把尚未補貨的濕紙巾記在『待補』。手機上的補貨待辦仍留著，袋內也有了可查的清單。
- **result**（source=`node-effect-age-stage-6-turn-1-2-0`／anchor=`story-age-stage-6-turn-1-2`）
  清單上仍有待補的一格：你把尚未補貨的濕紙巾記在袋內清單的『待補』格，補貨待辦沒有被當成已完成。
- **daily**（source=`age-stage-6-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-6-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 用品 / nqa2-list / seed 2

家庭：multigenerational／uneven／singleFullTimeCare。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-6-turn-1-1`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你和孩子在家整理外出袋，發現濕紙巾只剩最後一包，仍夠這次使用。今天原訂只到公園；商店與公園都能步行到達，但多去一站會壓縮玩耍時間。
  你選擇：照原路去公園，出門前把補貨寫進手機清單
- **result**（source=`choice-effect-age-stage-6-turn-1-1-0`／anchor=`story-age-stage-6-turn-1-1`）
  出門袋裡只剩最後一包濕紙巾：你在手機寫下要補的品項，帶孩子和袋裡剩下的一包出門。這次仍照原路去公園，補貨還沒完成。
- **result**（source=`story-age-stage-6-turn-1-2`／anchor=`story-age-stage-6-turn-1-2`）
  清單上仍有待補的一格：回家後，你在外出袋的清單分出『待補』與『已有備用』兩格，把尚未補貨的濕紙巾記在『待補』。手機上的補貨待辦仍留著，袋內也有了可查的清單。
- **result**（source=`node-effect-age-stage-6-turn-1-2-0`／anchor=`story-age-stage-6-turn-1-2`）
  清單上仍有待補的一格：你把尚未補貨的濕紙巾記在袋內清單的『待補』格，補貨待辦沒有被當成已完成。
- **daily**（source=`age-stage-6-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-6-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 雨天 / nqa2-wait / seed 1

家庭：twoCaregivers／shared／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-7-turn-1-1`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你已在托育點門內接到孩子，兩人停在有遮蔽的等候區。外頭下著大雨，剛才走來時你的襪子已濕；托育點允許你們再等一會。回家有較長的有遮蔽步行路線，也可先待在這裡整理雨具。
  你選擇：留在等候區整理雨具，晚一點再出發
- **result**（source=`choice-effect-age-stage-7-turn-1-1-0`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你和孩子留在等候區，重新整理雨具。時間過了一會，門外仍聽得見雨聲，返家的路還沒走。
- **result**（source=`story-age-stage-7-turn-1-2`／anchor=`story-age-stage-7-turn-1-2`）
  等候後，再沿長路返家：整理好雨具後，你帶孩子離開等候區，沿有遮蔽的長路返家。沒有等到雨停；進門後，你把濕襪放進待洗籃，將外出袋留在門邊晾放。
- **daily**（source=`age-stage-7-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-7-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 雨天 / nqa2-wait / seed 11

家庭：twoCaregivers／pseudoSingle／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-7-turn-1-1`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你已在托育點門內接到孩子，兩人停在有遮蔽的等候區。外頭下著大雨，剛才走來時你的襪子已濕；托育點允許你們再等一會。回家有較長的有遮蔽步行路線，也可先待在這裡整理雨具。
  你選擇：留在等候區整理雨具，晚一點再出發
- **result**（source=`choice-effect-age-stage-7-turn-1-1-0`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你和孩子留在等候區，重新整理雨具。時間過了一會，門外仍聽得見雨聲，返家的路還沒走。
- **result**（source=`story-age-stage-7-turn-1-2`／anchor=`story-age-stage-7-turn-1-2`）
  等候後，再沿長路返家：整理好雨具後，你帶孩子離開等候區，沿有遮蔽的長路返家。沒有等到雨停；進門後，你把濕襪放進待洗籃，將外出袋留在門邊晾放。
- **daily**（source=`age-stage-7-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-7-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 雨天 / nqa2-wait / seed 2

家庭：multigenerational／uneven／singleFullTimeCare。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-7-turn-1-1`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你已在托育點門內接到孩子，兩人停在有遮蔽的等候區。外頭下著大雨，剛才走來時你的襪子已濕；托育點允許你們再等一會。回家有較長的有遮蔽步行路線，也可先待在這裡整理雨具。
  你選擇：留在等候區整理雨具，晚一點再出發
- **result**（source=`choice-effect-age-stage-7-turn-1-1-0`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你和孩子留在等候區，重新整理雨具。時間過了一會，門外仍聽得見雨聲，返家的路還沒走。
- **result**（source=`story-age-stage-7-turn-1-2`／anchor=`story-age-stage-7-turn-1-2`）
  等候後，再沿長路返家：整理好雨具後，你帶孩子離開等候區，沿有遮蔽的長路返家。沒有等到雨停；進門後，你把濕襪放進待洗籃，將外出袋留在門邊晾放。
- **daily**（source=`age-stage-7-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-7-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 雨天 / nqa2-covered / seed 1

家庭：twoCaregivers／shared／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-7-turn-1-1`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你已在托育點門內接到孩子，兩人停在有遮蔽的等候區。外頭下著大雨，剛才走來時你的襪子已濕；托育點允許你們再等一會。回家有較長的有遮蔽步行路線，也可先待在這裡整理雨具。
  你選擇：整理好雨具，沿有遮蔽的長路慢慢回家
- **result**（source=`choice-effect-age-stage-7-turn-1-1-0`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你整理好雨具，帶孩子沿有遮蔽的路往家走。這一趟繞遠了一些。
- **result**（source=`story-age-stage-7-turn-1-2`／anchor=`story-age-stage-7-turn-1-2`）
  繞過長路，回家收濕襪：沿有遮蔽的長路走回家後，你把濕襪放進待洗籃，將外出袋留在門邊晾放。繞遠的這段路已走完。
- **daily**（source=`age-stage-7-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-7-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 雨天 / nqa2-covered / seed 11

家庭：twoCaregivers／pseudoSingle／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-7-turn-1-1`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你已在托育點門內接到孩子，兩人停在有遮蔽的等候區。外頭下著大雨，剛才走來時你的襪子已濕；托育點允許你們再等一會。回家有較長的有遮蔽步行路線，也可先待在這裡整理雨具。
  你選擇：整理好雨具，沿有遮蔽的長路慢慢回家
- **result**（source=`choice-effect-age-stage-7-turn-1-1-0`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你整理好雨具，帶孩子沿有遮蔽的路往家走。這一趟繞遠了一些。
- **result**（source=`story-age-stage-7-turn-1-2`／anchor=`story-age-stage-7-turn-1-2`）
  繞過長路，回家收濕襪：沿有遮蔽的長路走回家後，你把濕襪放進待洗籃，將外出袋留在門邊晾放。繞遠的這段路已走完。
- **daily**（source=`age-stage-7-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-7-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 雨天 / nqa2-covered / seed 2

家庭：multigenerational／uneven／singleFullTimeCare。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-7-turn-1-1`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你已在托育點門內接到孩子，兩人停在有遮蔽的等候區。外頭下著大雨，剛才走來時你的襪子已濕；托育點允許你們再等一會。回家有較長的有遮蔽步行路線，也可先待在這裡整理雨具。
  你選擇：整理好雨具，沿有遮蔽的長路慢慢回家
- **result**（source=`choice-effect-age-stage-7-turn-1-1-0`／anchor=`story-age-stage-7-turn-1-1`）
  大雨還在下，襪子已經濕了：你整理好雨具，帶孩子沿有遮蔽的路往家走。這一趟繞遠了一些。
- **result**（source=`story-age-stage-7-turn-1-2`／anchor=`story-age-stage-7-turn-1-2`）
  繞過長路，回家收濕襪：沿有遮蔽的長路走回家後，你把濕襪放進待洗籃，將外出袋留在門邊晾放。繞遠的這段路已走完。
- **daily**（source=`age-stage-7-turn-1-completion-daily-v1-toddler-window`／anchor=`age-stage-7-turn-1-completion-daily-v1-toddler-window`）
  你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

實際 Reaction：`[]`

### 休息 / nqa2-read / seed 1

家庭：twoCaregivers／shared／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-10-turn-1-1`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。
  你選擇：先喝水、看兩頁書，再開一局
- **result**（source=`choice-effect-age-stage-10-turn-1-1-0`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你說自己先喝水、看兩頁書，喝了一口水，將書打開。桌遊盒暫時留在桌邊，你仍坐在孩子旁邊。
- **result**（source=`reaction-age-stage-10-turn-1-1-0`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來時，孩子：問：「兩頁是多久？」
- **result**（source=`story-age-stage-10-turn-1-2`／anchor=`story-age-stage-10-turn-1-2`）
  書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- **daily**（source=`age-stage-10-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-10-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa2-rest-response","reactionId":"nqa2-how-long","actorId":"child-1","kind":"neutral","text":"問：「兩頁是多久？」","eventId":"nqa2-rest-choice","ageStageId":"age-stage-10","turnId":"age-stage-10-turn-1"}]`

### 休息 / nqa2-read / seed 11

家庭：twoCaregivers／pseudoSingle／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-10-turn-1-1`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。
  你選擇：先喝水、看兩頁書，再開一局
- **result**（source=`choice-effect-age-stage-10-turn-1-1-0`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你說自己先喝水、看兩頁書，喝了一口水，將書打開。桌遊盒暫時留在桌邊，你仍坐在孩子旁邊。
- **result**（source=`reaction-age-stage-10-turn-1-1-0`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來時，孩子：拿另一個玩具坐到旁邊。
- **result**（source=`story-age-stage-10-turn-1-2`／anchor=`story-age-stage-10-turn-1-2`）
  書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- **daily**（source=`age-stage-10-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-10-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa2-rest-response","reactionId":"nqa2-other-toy","actorId":"child-1","kind":"neutral","text":"拿另一個玩具坐到旁邊。","eventId":"nqa2-rest-choice","ageStageId":"age-stage-10","turnId":"age-stage-10-turn-1"}]`

### 休息 / nqa2-read / seed 2

家庭：multigenerational／uneven／singleFullTimeCare。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-10-turn-1-1`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。
  你選擇：先喝水、看兩頁書，再開一局
- **result**（source=`choice-effect-age-stage-10-turn-1-1-0`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你說自己先喝水、看兩頁書，喝了一口水，將書打開。桌遊盒暫時留在桌邊，你仍坐在孩子旁邊。
- **result**（source=`story-age-stage-10-turn-1-2`／anchor=`story-age-stage-10-turn-1-2`）
  書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- **daily**（source=`age-stage-10-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-10-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa2-rest-response","reactionId":"nqa2-rest-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa2-rest-choice","ageStageId":"age-stage-10","turnId":"age-stage-10-turn-1"}]`

### 休息 / nqa2-play / seed 1

家庭：twoCaregivers／shared／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-10-turn-1-1`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。
  你選擇：現在只玩一局，玩完就把遊戲收回盒子
- **result**（source=`choice-effect-age-stage-10-turn-1-1-0`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你說今天先玩一局，打開盒子排好遊戲。想休息的時間先往後挪，孩子是否願意只玩一局還沒說定。
- **result**（source=`reaction-age-stage-10-turn-1-1-0`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來時，孩子：說想再玩一局。
- **result**（source=`story-age-stage-10-turn-1-2`／anchor=`story-age-stage-10-turn-1-2`）
  書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- **daily**（source=`age-stage-10-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-10-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa2-rest-response","reactionId":"nqa2-another-game","actorId":"child-1","kind":"neutral","text":"說想再玩一局。","eventId":"nqa2-rest-choice","ageStageId":"age-stage-10","turnId":"age-stage-10-turn-1"}]`

### 休息 / nqa2-play / seed 11

家庭：twoCaregivers／pseudoSingle／flexible。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-10-turn-1-1`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。
  你選擇：現在只玩一局，玩完就把遊戲收回盒子
- **result**（source=`choice-effect-age-stage-10-turn-1-1-0`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你說今天先玩一局，打開盒子排好遊戲。想休息的時間先往後挪，孩子是否願意只玩一局還沒說定。
- **result**（source=`reaction-age-stage-10-turn-1-1-0`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來時，孩子：開始擺第一個配件。
- **result**（source=`story-age-stage-10-turn-1-2`／anchor=`story-age-stage-10-turn-1-2`）
  書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- **daily**（source=`age-stage-10-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-10-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa2-rest-response","reactionId":"nqa2-first-piece","actorId":"child-1","kind":"neutral","text":"開始擺第一個配件。","eventId":"nqa2-rest-choice","ageStageId":"age-stage-10","turnId":"age-stage-10-turn-1"}]`

### 休息 / nqa2-play / seed 2

家庭：multigenerational／uneven／singleFullTimeCare。

1 Turn／3 節點（含靜默 fallback）；4 checkpoints 全部 Restore。

- **choice**（source=`story-age-stage-10-turn-1-1`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。
  你選擇：現在只玩一局，玩完就把遊戲收回盒子
- **result**（source=`choice-effect-age-stage-10-turn-1-1-0`／anchor=`story-age-stage-10-turn-1-1`）
  剛坐到沙發，桌遊盒又推過來：你說今天先玩一局，打開盒子排好遊戲。想休息的時間先往後挪，孩子是否願意只玩一局還沒說定。
- **result**（source=`story-age-stage-10-turn-1-2`／anchor=`story-age-stage-10-turn-1-2`）
  書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- **daily**（source=`age-stage-10-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-10-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

實際 Reaction：`[{"poolId":"nqa2-rest-response","reactionId":"nqa2-rest-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa2-rest-choice","ageStageId":"age-stage-10","turnId":"age-stage-10-turn-1"}]`

## 每種限定 Reaction 與 none

以下僅固定公開 checkpoint 的 rngState，沒有改 pool／權重或 mock 抽選器。none 沒有可見台詞與記憶；每筆列出完整本題 Journal。

### nqa2-loop / nqa2-another-path

rngState=1；kind=neutral。

- 公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。 / 你選擇：陪孩子沿小路繞一圈，到出口就回家
- 公園出口前，還想再走一圈：你指著回到出口的小路，陪孩子繞了一圈，再把回家方向指給他看。晚餐要晚一點開始準備。
- 公園出口前，還想再走一圈時，孩子：又指向另一條路。
- 外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- 你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

### nqa2-loop / nqa2-look-exit

rngState=5；kind=neutral。

- 公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。 / 你選擇：陪孩子沿小路繞一圈，到出口就回家
- 公園出口前，還想再走一圈：你指著回到出口的小路，陪孩子繞了一圈，再把回家方向指給他看。晚餐要晚一點開始準備。
- 公園出口前，還想再走一圈時，孩子：跟著看出口。
- 外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- 你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

### nqa2-loop / nqa2-park-none

rngState=9；kind=none。

- 公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。 / 你選擇：陪孩子沿小路繞一圈，到出口就回家
- 公園出口前，還想再走一圈：你指著回到出口的小路，陪孩子繞了一圈，再把回家方向指給他看。晚餐要晚一點開始準備。
- 外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- 你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

### nqa2-home / nqa2-park-none

rngState=1；kind=none。

- 公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。 / 你選擇：現在往家走，路上一起找剛才看見的紅色車子
- 公園出口前，還想再走一圈：你帶著孩子朝回家的路走，指給他看路邊停著的一台紅色車子。公園留在身後。
- 外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- 你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

### nqa2-home / nqa2-point-car

rngState=2；kind=neutral。

- 公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。 / 你選擇：現在往家走，路上一起找剛才看見的紅色車子
- 公園出口前，還想再走一圈：你帶著孩子朝回家的路走，指給他看路邊停著的一台紅色車子。公園留在身後。
- 公園出口前，還想再走一圈時，孩子：停下來指著車子。
- 外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- 你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

### nqa2-home / nqa2-reach-park

rngState=5；kind=neutral。

- 公園出口前，還想再走一圈：你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。 / 你選擇：現在往家走，路上一起找剛才看見的紅色車子
- 公園出口前，還想再走一圈：你帶著孩子朝回家的路走，指給他看路邊停著的一台紅色車子。公園留在身後。
- 公園出口前，還想再走一圈時，孩子：還往公園方向伸手。
- 外出袋留在門邊：回到家，你把外出袋放在門邊，開始準備晚餐。
- 你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。

### nqa2-read / nqa2-how-long

rngState=1；kind=neutral。

- 剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。 / 你選擇：先喝水、看兩頁書，再開一局
- 剛坐到沙發，桌遊盒又推過來：你說自己先喝水、看兩頁書，喝了一口水，將書打開。桌遊盒暫時留在桌邊，你仍坐在孩子旁邊。
- 剛坐到沙發，桌遊盒又推過來時，孩子：問：「兩頁是多久？」
- 書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa2-read / nqa2-other-toy

rngState=5；kind=neutral。

- 剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。 / 你選擇：先喝水、看兩頁書，再開一局
- 剛坐到沙發，桌遊盒又推過來：你說自己先喝水、看兩頁書，喝了一口水，將書打開。桌遊盒暫時留在桌邊，你仍坐在孩子旁邊。
- 剛坐到沙發，桌遊盒又推過來時，孩子：拿另一個玩具坐到旁邊。
- 書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa2-read / nqa2-rest-none

rngState=9；kind=none。

- 剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。 / 你選擇：先喝水、看兩頁書，再開一局
- 剛坐到沙發，桌遊盒又推過來：你說自己先喝水、看兩頁書，喝了一口水，將書打開。桌遊盒暫時留在桌邊，你仍坐在孩子旁邊。
- 書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa2-play / nqa2-another-game

rngState=1；kind=neutral。

- 剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。 / 你選擇：現在只玩一局，玩完就把遊戲收回盒子
- 剛坐到沙發，桌遊盒又推過來：你說今天先玩一局，打開盒子排好遊戲。想休息的時間先往後挪，孩子是否願意只玩一局還沒說定。
- 剛坐到沙發，桌遊盒又推過來時，孩子：說想再玩一局。
- 書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa2-play / nqa2-first-piece

rngState=5；kind=neutral。

- 剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。 / 你選擇：現在只玩一局，玩完就把遊戲收回盒子
- 剛坐到沙發，桌遊盒又推過來：你說今天先玩一局，打開盒子排好遊戲。想休息的時間先往後挪，孩子是否願意只玩一局還沒說定。
- 剛坐到沙發，桌遊盒又推過來時，孩子：開始擺第一個配件。
- 書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。

### nqa2-play / nqa2-rest-none

rngState=9；kind=none。

- 剛坐到沙發，桌遊盒又推過來：你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。 / 你選擇：現在只玩一局，玩完就把遊戲收回盒子
- 剛坐到沙發，桌遊盒又推過來：你說今天先玩一局，打開盒子排好遊戲。想休息的時間先往後挪，孩子是否願意只玩一局還沒說定。
- 書與桌遊盒放回原位：那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
