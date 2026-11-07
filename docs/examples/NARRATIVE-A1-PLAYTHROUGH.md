# Narrative A1：實際遊玩紀錄

來源：`npm test -- tests/narrative-a1.test.ts` 的公開 Engine／Journal 輸出。
八組完整兩 Turn 路徑使用 seed 9、人物 availability=1；另外列出強制 rngState 的實際 Reaction／none。
固定分支可達性與自然分布分報：[corpus 報告](NARRATIVE-A1-DISTRIBUTION.json)。

完整 history、queue、來源與 Review 見 [原始 JSON](NARRATIVE-A1-RUNS.json)。

## nqa1-stock → nqa1-sort

Stage 1；2 Turn／6 節點；含 fallback，8 checkpoints 逐一 Restore。

- **choice**（age-stage-1-turn-1／source=`story-age-stage-1-turn-1-1`／anchor=`story-age-stage-1-turn-1-1`）
  小籃裡只剩一條乾淨圍兜：半夜，你在房內陪著醒來的孩子。乾淨小籃裡只剩一條圍兜，剛收回的衣物堆在旁邊。眼前夠用，但每次都要翻找；你也很想坐下。
  你選擇：從衣堆挑出今晚會用的幾件，放進手邊的小籃
- **result**（age-stage-1-turn-1／source=`choice-effect-age-stage-1-turn-1-1-0`／anchor=`story-age-stage-1-turn-1-1`）
  小籃裡只剩一條乾淨圍兜：你挑出幾件乾淨用品放進小籃，剩下的衣物仍堆在旁邊。
- **result**（age-stage-1-turn-1／source=`story-age-stage-1-turn-1-2`／anchor=`story-age-stage-1-turn-1-2`）
  天亮伸手拿起的一件：天亮時，小籃與那堆衣物還在房內。你伸手拿起今天要用的一件。
- **daily**（age-stage-1-turn-1／source=`age-stage-1-turn-1-completion-daily-v1-infant-hand`／anchor=`age-stage-1-turn-1-completion-daily-v1-infant-hand`）
  你把手指放在孩子的掌心，停了一會兒，再輕輕收回手。
- **result**（age-stage-1-turn-2／source=`story-age-stage-1-turn-2-1`／anchor=`story-age-stage-1-turn-2-1`）
  小籃靠近了坐下的位置：下一段照顧時間，你把昨夜整理的小籃放到坐下就能拿到的位置。
- **choice**（age-stage-1-turn-2／source=`story-age-stage-1-turn-2-2`／anchor=`story-age-stage-1-turn-2-2`）
  小籃放哪裡，下次才不用翻？：你在房裡拿著小籃。昨夜的圍兜已經用過，衣物還有幾件散在旁邊；你想替接下來找東西省一點手忙腳亂。先前有沒有整理整堆衣物，都可以從眼前這一小籃開始。
  你選擇：把最常找的用品放進小籃最前面
- **result**（age-stage-1-turn-2／source=`choice-effect-age-stage-1-turn-2-2-0`／anchor=`story-age-stage-1-turn-2-2`）
  小籃放哪裡，下次才不用翻？：你把最常找的幾件移到小籃前側，其他衣物仍留在原處。
- **result**（age-stage-1-turn-2／source=`story-age-stage-1-turn-2-3`／anchor=`story-age-stage-1-turn-2-3`）
  小籃留在房裡：你把小籃放穩，回到孩子旁邊。
- **daily**（age-stage-1-turn-2／source=`age-stage-1-turn-2-completion-daily-v1-infant-voice`／anchor=`age-stage-1-turn-2-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

## nqa1-stock → nqa1-move

Stage 1；2 Turn／6 節點；含 fallback，8 checkpoints 逐一 Restore。

- **choice**（age-stage-1-turn-1／source=`story-age-stage-1-turn-1-1`／anchor=`story-age-stage-1-turn-1-1`）
  小籃裡只剩一條乾淨圍兜：半夜，你在房內陪著醒來的孩子。乾淨小籃裡只剩一條圍兜，剛收回的衣物堆在旁邊。眼前夠用，但每次都要翻找；你也很想坐下。
  你選擇：從衣堆挑出今晚會用的幾件，放進手邊的小籃
- **result**（age-stage-1-turn-1／source=`choice-effect-age-stage-1-turn-1-1-0`／anchor=`story-age-stage-1-turn-1-1`）
  小籃裡只剩一條乾淨圍兜：你挑出幾件乾淨用品放進小籃，剩下的衣物仍堆在旁邊。
- **result**（age-stage-1-turn-1／source=`story-age-stage-1-turn-1-2`／anchor=`story-age-stage-1-turn-1-2`）
  天亮伸手拿起的一件：天亮時，小籃與那堆衣物還在房內。你伸手拿起今天要用的一件。
- **daily**（age-stage-1-turn-1／source=`age-stage-1-turn-1-completion-daily-v1-infant-hand`／anchor=`age-stage-1-turn-1-completion-daily-v1-infant-hand`）
  你把手指放在孩子的掌心，停了一會兒，再輕輕收回手。
- **result**（age-stage-1-turn-2／source=`story-age-stage-1-turn-2-1`／anchor=`story-age-stage-1-turn-2-1`）
  小籃靠近了坐下的位置：下一段照顧時間，你把昨夜整理的小籃放到坐下就能拿到的位置。
- **choice**（age-stage-1-turn-2／source=`story-age-stage-1-turn-2-2`／anchor=`story-age-stage-1-turn-2-2`）
  小籃放哪裡，下次才不用翻？：你在房裡拿著小籃。昨夜的圍兜已經用過，衣物還有幾件散在旁邊；你想替接下來找東西省一點手忙腳亂。先前有沒有整理整堆衣物，都可以從眼前這一小籃開始。
  你選擇：不重排內容，把小籃移到坐下時拿得到的位置
- **result**（age-stage-1-turn-2／source=`choice-effect-age-stage-1-turn-2-2-0`／anchor=`story-age-stage-1-turn-2-2`）
  小籃放哪裡，下次才不用翻？：你保留籃內原來的放法，把小籃移到坐下時拿得到的位置。
- **result**（age-stage-1-turn-2／source=`story-age-stage-1-turn-2-3`／anchor=`story-age-stage-1-turn-2-3`）
  小籃留在房裡：你把小籃放穩，回到孩子旁邊。
- **daily**（age-stage-1-turn-2／source=`age-stage-1-turn-2-completion-daily-v1-infant-voice`／anchor=`age-stage-1-turn-2-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

## nqa1-sit → nqa1-sort

Stage 1；2 Turn／6 節點；含 fallback，8 checkpoints 逐一 Restore。

- **choice**（age-stage-1-turn-1／source=`story-age-stage-1-turn-1-1`／anchor=`story-age-stage-1-turn-1-1`）
  小籃裡只剩一條乾淨圍兜：半夜，你在房內陪著醒來的孩子。乾淨小籃裡只剩一條圍兜，剛收回的衣物堆在旁邊。眼前夠用，但每次都要翻找；你也很想坐下。
  你選擇：先把那條圍兜放到手邊，坐回孩子旁邊
- **result**（age-stage-1-turn-1／source=`choice-effect-age-stage-1-turn-1-1-0`／anchor=`story-age-stage-1-turn-1-1`）
  小籃裡只剩一條乾淨圍兜：你把眼前那條圍兜留在手邊，坐回孩子旁邊，衣堆先放著。
- **result**（age-stage-1-turn-1／source=`story-age-stage-1-turn-1-2`／anchor=`story-age-stage-1-turn-1-2`）
  天亮伸手拿起的一件：天亮時，小籃與那堆衣物還在房內。你伸手拿起今天要用的一件。
- **daily**（age-stage-1-turn-1／source=`age-stage-1-turn-1-completion-daily-v1-infant-hand`／anchor=`age-stage-1-turn-1-completion-daily-v1-infant-hand`）
  你把手指放在孩子的掌心，停了一會兒，再輕輕收回手。
- **result**（age-stage-1-turn-2／source=`story-age-stage-1-turn-2-1`／anchor=`story-age-stage-1-turn-2-1`）
  又翻開那堆衣物：下一段照顧時間，你又從衣堆翻出要用的一件。多找了一會，孩子還在你身邊。
- **choice**（age-stage-1-turn-2／source=`story-age-stage-1-turn-2-2`／anchor=`story-age-stage-1-turn-2-2`）
  小籃放哪裡，下次才不用翻？：你在房裡拿著小籃。昨夜的圍兜已經用過，衣物還有幾件散在旁邊；你想替接下來找東西省一點手忙腳亂。先前有沒有整理整堆衣物，都可以從眼前這一小籃開始。
  你選擇：把最常找的用品放進小籃最前面
- **result**（age-stage-1-turn-2／source=`choice-effect-age-stage-1-turn-2-2-0`／anchor=`story-age-stage-1-turn-2-2`）
  小籃放哪裡，下次才不用翻？：你把最常找的幾件移到小籃前側，其他衣物仍留在原處。
- **result**（age-stage-1-turn-2／source=`story-age-stage-1-turn-2-3`／anchor=`story-age-stage-1-turn-2-3`）
  小籃留在房裡：你把小籃放穩，回到孩子旁邊。
- **daily**（age-stage-1-turn-2／source=`age-stage-1-turn-2-completion-daily-v1-infant-voice`／anchor=`age-stage-1-turn-2-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

## nqa1-sit → nqa1-move

Stage 1；2 Turn／6 節點；含 fallback，8 checkpoints 逐一 Restore。

- **choice**（age-stage-1-turn-1／source=`story-age-stage-1-turn-1-1`／anchor=`story-age-stage-1-turn-1-1`）
  小籃裡只剩一條乾淨圍兜：半夜，你在房內陪著醒來的孩子。乾淨小籃裡只剩一條圍兜，剛收回的衣物堆在旁邊。眼前夠用，但每次都要翻找；你也很想坐下。
  你選擇：先把那條圍兜放到手邊，坐回孩子旁邊
- **result**（age-stage-1-turn-1／source=`choice-effect-age-stage-1-turn-1-1-0`／anchor=`story-age-stage-1-turn-1-1`）
  小籃裡只剩一條乾淨圍兜：你把眼前那條圍兜留在手邊，坐回孩子旁邊，衣堆先放著。
- **result**（age-stage-1-turn-1／source=`story-age-stage-1-turn-1-2`／anchor=`story-age-stage-1-turn-1-2`）
  天亮伸手拿起的一件：天亮時，小籃與那堆衣物還在房內。你伸手拿起今天要用的一件。
- **daily**（age-stage-1-turn-1／source=`age-stage-1-turn-1-completion-daily-v1-infant-hand`／anchor=`age-stage-1-turn-1-completion-daily-v1-infant-hand`）
  你把手指放在孩子的掌心，停了一會兒，再輕輕收回手。
- **result**（age-stage-1-turn-2／source=`story-age-stage-1-turn-2-1`／anchor=`story-age-stage-1-turn-2-1`）
  又翻開那堆衣物：下一段照顧時間，你又從衣堆翻出要用的一件。多找了一會，孩子還在你身邊。
- **choice**（age-stage-1-turn-2／source=`story-age-stage-1-turn-2-2`／anchor=`story-age-stage-1-turn-2-2`）
  小籃放哪裡，下次才不用翻？：你在房裡拿著小籃。昨夜的圍兜已經用過，衣物還有幾件散在旁邊；你想替接下來找東西省一點手忙腳亂。先前有沒有整理整堆衣物，都可以從眼前這一小籃開始。
  你選擇：不重排內容，把小籃移到坐下時拿得到的位置
- **result**（age-stage-1-turn-2／source=`choice-effect-age-stage-1-turn-2-2-0`／anchor=`story-age-stage-1-turn-2-2`）
  小籃放哪裡，下次才不用翻？：你保留籃內原來的放法，把小籃移到坐下時拿得到的位置。
- **result**（age-stage-1-turn-2／source=`story-age-stage-1-turn-2-3`／anchor=`story-age-stage-1-turn-2-3`）
  小籃留在房裡：你把小籃放穩，回到孩子旁邊。
- **daily**（age-stage-1-turn-2／source=`age-stage-1-turn-2-completion-daily-v1-infant-voice`／anchor=`age-stage-1-turn-2-completion-daily-v1-infant-voice`）
  你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。

實際 Reaction：`[]`

## nqa1-ask-child → nqa1-apologize

Stage 8；2 Turn／6 節點；含 fallback，8 checkpoints 逐一 Restore。

- **choice**（age-stage-8-turn-1／source=`story-age-stage-8-turn-1-1`／anchor=`story-age-stage-8-turn-1-1`）
  教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。
  你選擇：移到門邊空處，先問孩子想把畫給誰看
- **result**（age-stage-8-turn-1／source=`choice-effect-age-stage-8-turn-1-1-0`／anchor=`story-age-stage-8-turn-1-1`）
  教室門口，那句「快點」還停在嘴邊：你和孩子移到門邊空處，問他這張畫想給誰看。你還沒有把孩子交給老師。
- **result**（age-stage-8-turn-1／source=`story-age-stage-8-turn-1-2`／anchor=`story-age-stage-8-turn-1-2`）
  想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- **daily**（age-stage-8-turn-1／source=`age-stage-8-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-8-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- **result**（age-stage-8-turn-2／source=`story-age-stage-8-turn-2-1`／anchor=`story-age-stage-8-turn-2-1`）
  聯絡方式留在袋子內側：你照班級通知寫下聯絡管道，放進袋內側。下次需要詢問時，可以先從這裡找。
- **choice**（age-stage-8-turn-2／source=`story-age-stage-8-turn-2-2`／anchor=`story-age-stage-8-turn-2-2`）
  那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。
  你選擇：蹲到孩子身邊，說「我剛才太急，沒有先聽你說」
- **result**（age-stage-8-turn-2／source=`choice-effect-age-stage-8-turn-2-2-0`／anchor=`story-age-stage-8-turn-2-2`）
  那句「快點」，現在想換個說法：你蹲到孩子身邊，把「剛才太急，沒有先聽你說」說完整，停下來等他的反應。
- **result**（age-stage-8-turn-2／source=`reaction-age-stage-8-turn-2-2-0`／anchor=`story-age-stage-8-turn-2-2`）
  那句「快點」，現在想換個說法時，孩子（小晴）：說：「我只是想給老師看。」
- **result**（age-stage-8-turn-2／source=`story-age-stage-8-turn-2-3`／anchor=`story-age-stage-8-turn-2-3`）
  畫紙留在桌邊：你收好自己的紙筆，把桌邊的位置留出來，這一段先停在這裡。

實際 Reaction：`[{"poolId":"nqa1-door-response","reactionId":"nqa1-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa1-door-choice","ageStageId":"age-stage-8","turnId":"age-stage-8-turn-1"},{"poolId":"nqa1-door-repair-response","reactionId":"nqa1-explain","actorId":"child-1","kind":"neutral","text":"說：「我只是想給老師看。」","eventId":"nqa1-door-repair","ageStageId":"age-stage-8","turnId":"age-stage-8-turn-2"}]`

## nqa1-ask-child → nqa1-draw

Stage 8；2 Turn／6 節點；含 fallback，8 checkpoints 逐一 Restore。

- **choice**（age-stage-8-turn-1／source=`story-age-stage-8-turn-1-1`／anchor=`story-age-stage-8-turn-1-1`）
  教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。
  你選擇：移到門邊空處，先問孩子想把畫給誰看
- **result**（age-stage-8-turn-1／source=`choice-effect-age-stage-8-turn-1-1-0`／anchor=`story-age-stage-8-turn-1-1`）
  教室門口，那句「快點」還停在嘴邊：你和孩子移到門邊空處，問他這張畫想給誰看。你還沒有把孩子交給老師。
- **result**（age-stage-8-turn-1／source=`story-age-stage-8-turn-1-2`／anchor=`story-age-stage-8-turn-1-2`）
  想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- **daily**（age-stage-8-turn-1／source=`age-stage-8-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-8-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- **result**（age-stage-8-turn-2／source=`story-age-stage-8-turn-2-1`／anchor=`story-age-stage-8-turn-2-1`）
  聯絡方式留在袋子內側：你照班級通知寫下聯絡管道，放進袋內側。下次需要詢問時，可以先從這裡找。
- **choice**（age-stage-8-turn-2／source=`story-age-stage-8-turn-2-2`／anchor=`story-age-stage-8-turn-2-2`）
  那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。
  你選擇：畫出教室門口，說「我剛才只顧著催，你想讓我看哪裡？」
- **result**（age-stage-8-turn-2／source=`choice-effect-age-stage-8-turn-2-2-0`／anchor=`story-age-stage-8-turn-2-2`）
  那句「快點」，現在想換個說法：你畫出門口，說自己剛才只顧著催，問他想讓你看哪裡。紙先留在兩人中間。
- **result**（age-stage-8-turn-2／source=`reaction-age-stage-8-turn-2-2-0`／anchor=`story-age-stage-8-turn-2-2`）
  那句「快點」，現在想換個說法時，孩子（小晴）：在門旁畫一個小方塊。
- **result**（age-stage-8-turn-2／source=`story-age-stage-8-turn-2-3`／anchor=`story-age-stage-8-turn-2-3`）
  畫紙留在桌邊：你收好自己的紙筆，把桌邊的位置留出來，這一段先停在這裡。

實際 Reaction：`[{"poolId":"nqa1-door-response","reactionId":"nqa1-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa1-door-choice","ageStageId":"age-stage-8","turnId":"age-stage-8-turn-1"},{"poolId":"nqa1-door-repair-response","reactionId":"nqa1-draw-square","actorId":"child-1","kind":"neutral","text":"在門旁畫一個小方塊。","eventId":"nqa1-door-repair","ageStageId":"age-stage-8","turnId":"age-stage-8-turn-2"}]`

## nqa1-ask-teacher → nqa1-apologize

Stage 8；2 Turn／6 節點；含 fallback，8 checkpoints 逐一 Restore。

- **choice**（age-stage-8-turn-1／source=`story-age-stage-8-turn-1-1`／anchor=`story-age-stage-8-turn-1-1`）
  教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。
  你選擇：陪孩子等老師空下來，先向老師提出一起看這張畫的請求
- **result**（age-stage-8-turn-1／source=`choice-effect-age-stage-8-turn-1-1-0`／anchor=`story-age-stage-8-turn-1-1`）
  教室門口，那句「快點」還停在嘴邊：你陪孩子等了一會，向老師提出想一起看畫的請求。請求已說出口，還沒確認老師何時有空。
- **result**（age-stage-8-turn-1／source=`story-age-stage-8-turn-1-2`／anchor=`story-age-stage-8-turn-1-2`）
  想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- **daily**（age-stage-8-turn-1／source=`age-stage-8-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-8-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- **result**（age-stage-8-turn-2／source=`story-age-stage-8-turn-2-1`／anchor=`story-age-stage-8-turn-2-1`）
  畫上的折角又讓你停下：下一次整理外出袋，你想到那張折角的畫，還記得門口自己那句「快點」。
- **choice**（age-stage-8-turn-2／source=`story-age-stage-8-turn-2-2`／anchor=`story-age-stage-8-turn-2-2`）
  那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。
  你選擇：蹲到孩子身邊，說「我剛才太急，沒有先聽你說」
- **result**（age-stage-8-turn-2／source=`choice-effect-age-stage-8-turn-2-2-0`／anchor=`story-age-stage-8-turn-2-2`）
  那句「快點」，現在想換個說法：你蹲到孩子身邊，把「剛才太急，沒有先聽你說」說完整，停下來等他的反應。
- **result**（age-stage-8-turn-2／source=`reaction-age-stage-8-turn-2-2-0`／anchor=`story-age-stage-8-turn-2-2`）
  那句「快點」，現在想換個說法時，孩子（小晴）：說：「我只是想給老師看。」
- **result**（age-stage-8-turn-2／source=`story-age-stage-8-turn-2-3`／anchor=`story-age-stage-8-turn-2-3`）
  畫紙留在桌邊：你收好自己的紙筆，把桌邊的位置留出來，這一段先停在這裡。

實際 Reaction：`[{"poolId":"nqa1-door-response","reactionId":"nqa1-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa1-door-choice","ageStageId":"age-stage-8","turnId":"age-stage-8-turn-1"},{"poolId":"nqa1-door-repair-response","reactionId":"nqa1-explain","actorId":"child-1","kind":"neutral","text":"說：「我只是想給老師看。」","eventId":"nqa1-door-repair","ageStageId":"age-stage-8","turnId":"age-stage-8-turn-2"}]`

## nqa1-ask-teacher → nqa1-draw

Stage 8；2 Turn／6 節點；含 fallback，8 checkpoints 逐一 Restore。

- **choice**（age-stage-8-turn-1／source=`story-age-stage-8-turn-1-1`／anchor=`story-age-stage-8-turn-1-1`）
  教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。
  你選擇：陪孩子等老師空下來，先向老師提出一起看這張畫的請求
- **result**（age-stage-8-turn-1／source=`choice-effect-age-stage-8-turn-1-1-0`／anchor=`story-age-stage-8-turn-1-1`）
  教室門口，那句「快點」還停在嘴邊：你陪孩子等了一會，向老師提出想一起看畫的請求。請求已說出口，還沒確認老師何時有空。
- **result**（age-stage-8-turn-1／source=`story-age-stage-8-turn-1-2`／anchor=`story-age-stage-8-turn-1-2`）
  想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- **daily**（age-stage-8-turn-1／source=`age-stage-8-turn-1-completion-daily-v1-young-drawing`／anchor=`age-stage-8-turn-1-completion-daily-v1-young-drawing`）
  你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- **result**（age-stage-8-turn-2／source=`story-age-stage-8-turn-2-1`／anchor=`story-age-stage-8-turn-2-1`）
  畫上的折角又讓你停下：下一次整理外出袋，你想到那張折角的畫，還記得門口自己那句「快點」。
- **choice**（age-stage-8-turn-2／source=`story-age-stage-8-turn-2-2`／anchor=`story-age-stage-8-turn-2-2`）
  那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。
  你選擇：畫出教室門口，說「我剛才只顧著催，你想讓我看哪裡？」
- **result**（age-stage-8-turn-2／source=`choice-effect-age-stage-8-turn-2-2-0`／anchor=`story-age-stage-8-turn-2-2`）
  那句「快點」，現在想換個說法：你畫出門口，說自己剛才只顧著催，問他想讓你看哪裡。紙先留在兩人中間。
- **result**（age-stage-8-turn-2／source=`reaction-age-stage-8-turn-2-2-0`／anchor=`story-age-stage-8-turn-2-2`）
  那句「快點」，現在想換個說法時，孩子（小晴）：在門旁畫一個小方塊。
- **result**（age-stage-8-turn-2／source=`story-age-stage-8-turn-2-3`／anchor=`story-age-stage-8-turn-2-3`）
  畫紙留在桌邊：你收好自己的紙筆，把桌邊的位置留出來，這一段先停在這裡。

實際 Reaction：`[{"poolId":"nqa1-door-response","reactionId":"nqa1-none","actorId":null,"kind":"none","text":"這次沒有新的回應。","eventId":"nqa1-door-choice","ageStageId":"age-stage-8","turnId":"age-stage-8-turn-1"},{"poolId":"nqa1-door-repair-response","reactionId":"nqa1-draw-square","actorId":"child-1","kind":"neutral","text":"在門旁畫一個小方塊。","eventId":"nqa1-door-repair","ageStageId":"age-stage-8","turnId":"age-stage-8-turn-2"}]`

## Reaction／拒談／none 強制可達性

以下只改公開 checkpoint 的 rngState，未 mock 抽選器、改權重或代填回應。none 的 history 保留抽選來源，但沒有可見 Journal 台詞，也不產生記憶。

### nqa1-door-response / nqa1-none

rngState=1；nqa1-ask-child → nqa1-apologize；actor=null；kind=none。

這次沒有新的回應。

該次完整 Journal：

- 教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。 / 你選擇：移到門邊空處，先問孩子想把畫給誰看
- 教室門口，那句「快點」還停在嘴邊：你和孩子移到門邊空處，問他這張畫想給誰看。你還沒有把孩子交給老師。
- 想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- 聯絡方式留在袋子內側：你照班級通知寫下聯絡管道，放進袋內側。下次需要詢問時，可以先從這裡找。
- 那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。 / 你選擇：蹲到孩子身邊，說「我剛才太急，沒有先聽你說」
- 那句「快點」，現在想換個說法：你蹲到孩子身邊，把「剛才太急，沒有先聽你說」說完整，停下來等他的反應。
- 那句「快點」，現在想換個說法時，孩子（小晴）：說現在不想講。

### nqa1-door-repair-response / nqa1-not-now

rngState=1；nqa1-ask-child → nqa1-apologize；actor=child-1；kind=neutral。

說現在不想講。

該次完整 Journal：

- 教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。 / 你選擇：移到門邊空處，先問孩子想把畫給誰看
- 教室門口，那句「快點」還停在嘴邊：你和孩子移到門邊空處，問他這張畫想給誰看。你還沒有把孩子交給老師。
- 想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- 聯絡方式留在袋子內側：你照班級通知寫下聯絡管道，放進袋內側。下次需要詢問時，可以先從這裡找。
- 那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。 / 你選擇：蹲到孩子身邊，說「我剛才太急，沒有先聽你說」
- 那句「快點」，現在想換個說法：你蹲到孩子身邊，把「剛才太急，沒有先聽你說」說完整，停下來等他的反應。
- 那句「快點」，現在想換個說法時，孩子（小晴）：說現在不想講。

### nqa1-door-response / nqa1-hold-drawing

rngState=2；nqa1-ask-child → nqa1-apologize；actor=child-1；kind=neutral。

把畫抱緊，暫時不說。

該次完整 Journal：

- 教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。 / 你選擇：移到門邊空處，先問孩子想把畫給誰看
- 教室門口，那句「快點」還停在嘴邊：你和孩子移到門邊空處，問他這張畫想給誰看。你還沒有把孩子交給老師。
- 教室門口，那句「快點」還停在嘴邊時，孩子（小晴）：把畫抱緊，暫時不說。
- 想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- 聯絡方式留在袋子內側：你照班級通知寫下聯絡管道，放進袋內側。下次需要詢問時，可以先從這裡找。
- 那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。 / 你選擇：蹲到孩子身邊，說「我剛才太急，沒有先聽你說」
- 那句「快點」，現在想換個說法：你蹲到孩子身邊，把「剛才太急，沒有先聽你說」說完整，停下來等他的反應。
- 那句「快點」，現在想換個說法時，孩子（小晴）：說現在不想講。

### nqa1-door-repair-response / nqa1-explain

rngState=4；nqa1-ask-child → nqa1-apologize；actor=child-1；kind=neutral。

說：「我只是想給老師看。」

該次完整 Journal：

- 教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。 / 你選擇：移到門邊空處，先問孩子想把畫給誰看
- 教室門口，那句「快點」還停在嘴邊：你和孩子移到門邊空處，問他這張畫想給誰看。你還沒有把孩子交給老師。
- 教室門口，那句「快點」還停在嘴邊時，孩子（小晴）：把畫抱緊，暫時不說。
- 想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- 聯絡方式留在袋子內側：你照班級通知寫下聯絡管道，放進袋內側。下次需要詢問時，可以先從這裡找。
- 那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。 / 你選擇：蹲到孩子身邊，說「我剛才太急，沒有先聽你說」
- 那句「快點」，現在想換個說法：你蹲到孩子身邊，把「剛才太急，沒有先聽你說」說完整，停下來等他的反應。
- 那句「快點」，現在想換個說法時，孩子（小晴）：說：「我只是想給老師看。」

### nqa1-door-repair-response / nqa1-none

rngState=6；nqa1-ask-child → nqa1-apologize；actor=null；kind=none。

這次沒有新的回應。

該次完整 Journal：

- 教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。 / 你選擇：移到門邊空處，先問孩子想把畫給誰看
- 教室門口，那句「快點」還停在嘴邊：你和孩子移到門邊空處，問他這張畫想給誰看。你還沒有把孩子交給老師。
- 想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- 聯絡方式留在袋子內側：你照班級通知寫下聯絡管道，放進袋內側。下次需要詢問時，可以先從這裡找。
- 那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。 / 你選擇：蹲到孩子身邊，說「我剛才太急，沒有先聽你說」
- 那句「快點」，現在想換個說法：你蹲到孩子身邊，把「剛才太急，沒有先聽你說」說完整，停下來等他的反應。

### nqa1-door-response / nqa1-show-teacher

rngState=7；nqa1-ask-child → nqa1-apologize；actor=child-1；kind=neutral。

說想把畫給老師看。

該次完整 Journal：

- 教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。 / 你選擇：移到門邊空處，先問孩子想把畫給誰看
- 教室門口，那句「快點」還停在嘴邊：你和孩子移到門邊空處，問他這張畫想給誰看。你還沒有把孩子交給老師。
- 教室門口，那句「快點」還停在嘴邊時，孩子（小晴）：說想把畫給老師看。
- 想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- 聯絡方式留在袋子內側：你照班級通知寫下聯絡管道，放進袋內側。下次需要詢問時，可以先從這裡找。
- 那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。 / 你選擇：蹲到孩子身邊，說「我剛才太急，沒有先聽你說」
- 那句「快點」，現在想換個說法：你蹲到孩子身邊，把「剛才太急，沒有先聽你說」說完整，停下來等他的反應。

### nqa1-door-repair-response / nqa1-push-paper

rngState=1；nqa1-ask-child → nqa1-draw；actor=child-1；kind=neutral。

把紙推開，說想玩別的。

該次完整 Journal：

- 教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。 / 你選擇：移到門邊空處，先問孩子想把畫給誰看
- 教室門口，那句「快點」還停在嘴邊：你和孩子移到門邊空處，問他這張畫想給誰看。你還沒有把孩子交給老師。
- 想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- 聯絡方式留在袋子內側：你照班級通知寫下聯絡管道，放進袋內側。下次需要詢問時，可以先從這裡找。
- 那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。 / 你選擇：畫出教室門口，說「我剛才只顧著催，你想讓我看哪裡？」
- 那句「快點」，現在想換個說法：你畫出門口，說自己剛才只顧著催，問他想讓你看哪裡。紙先留在兩人中間。
- 那句「快點」，現在想換個說法時，孩子（小晴）：把紙推開，說想玩別的。

### nqa1-door-repair-response / nqa1-draw-square

rngState=4；nqa1-ask-child → nqa1-draw；actor=child-1；kind=neutral。

在門旁畫一個小方塊。

該次完整 Journal：

- 教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。 / 你選擇：移到門邊空處，先問孩子想把畫給誰看
- 教室門口，那句「快點」還停在嘴邊：你和孩子移到門邊空處，問他這張畫想給誰看。你還沒有把孩子交給老師。
- 教室門口，那句「快點」還停在嘴邊時，孩子（小晴）：把畫抱緊，暫時不說。
- 想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- 聯絡方式留在袋子內側：你照班級通知寫下聯絡管道，放進袋內側。下次需要詢問時，可以先從這裡找。
- 那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。 / 你選擇：畫出教室門口，說「我剛才只顧著催，你想讓我看哪裡？」
- 那句「快點」，現在想換個說法：你畫出門口，說自己剛才只顧著催，問他想讓你看哪裡。紙先留在兩人中間。
- 那句「快點」，現在想換個說法時，孩子（小晴）：在門旁畫一個小方塊。

### nqa1-door-response / nqa1-teacher-basket

rngState=1；nqa1-ask-teacher → nqa1-apologize；actor=teacher-1；kind=neutral。

說今天可以先放作品籃，還沒走過來。

該次完整 Journal：

- 教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。 / 你選擇：陪孩子等老師空下來，先向老師提出一起看這張畫的請求
- 教室門口，那句「快點」還停在嘴邊：你陪孩子等了一會，向老師提出想一起看畫的請求。請求已說出口，還沒確認老師何時有空。
- 教室門口，那句「快點」還停在嘴邊時，老師：說今天可以先放作品籃，還沒走過來。
- 想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- 畫上的折角又讓你停下：下一次整理外出袋，你想到那張折角的畫，還記得門口自己那句「快點」。
- 那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。 / 你選擇：蹲到孩子身邊，說「我剛才太急，沒有先聽你說」
- 那句「快點」，現在想換個說法：你蹲到孩子身邊，把「剛才太急，沒有先聽你說」說完整，停下來等他的反應。
- 那句「快點」，現在想換個說法時，孩子（小晴）：說現在不想講。

### nqa1-door-response / nqa1-teacher-wait

rngState=7；nqa1-ask-teacher → nqa1-apologize；actor=teacher-1；kind=neutral。

說：「我先接這一家，等一下來看。」

該次完整 Journal：

- 教室門口，那句「快點」還停在嘴邊：教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。 / 你選擇：陪孩子等老師空下來，先向老師提出一起看這張畫的請求
- 教室門口，那句「快點」還停在嘴邊：你陪孩子等了一會，向老師提出想一起看畫的請求。請求已說出口，還沒確認老師何時有空。
- 教室門口，那句「快點」還停在嘴邊時，老師：說：「我先接這一家，等一下來看。」
- 想起那張畫的折角：下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。
- 你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。
- 畫上的折角又讓你停下：下一次整理外出袋，你想到那張折角的畫，還記得門口自己那句「快點」。
- 那句「快點」，現在想換個說法：回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。 / 你選擇：蹲到孩子身邊，說「我剛才太急，沒有先聽你說」
- 那句「快點」，現在想換個說法：你蹲到孩子身邊，把「剛才太急，沒有先聽你說」說完整，停下來等他的反應。
