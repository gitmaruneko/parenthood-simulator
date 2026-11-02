# Narrative Review：原文目錄快照

原文快照版本 v1。基準：2026-11-02，HEAD `51a3b45`。由當前 factory 預設人物組合解析；不是玩家已發生歷史，也不代表部署狀態。正式 legacy 33 節點；08A 試玩另 4 節點。角色稱謂實際按各局 actorProfiles 解析。改寫與相容規格見 [主審查](NARRATIVE-QUALITY-REVIEW.md)。

## 01｜night-handoff-choice

- 範圍：legacy（bound 試玩亦沿用）；age-stage-1；choice／PLAYER_INPUT_REQUIRED。
- 標題：凌晨的交接
- 原情境：孩子醒來，你一邊安撫，一邊想著還沒洗的用品和明天的安排。輪班表上還有空白，眼前的照顧和之後要記住的事疊在一起。
- actorText：`{"actorId":"child-1","prefix":"與","suffix":"一起生活的日常。孩子醒來，你一邊安撫，一邊想著還沒洗的用品和明天的安排。輪班表上還有空白，眼前的照顧和之後要記住的事疊在一起。"}`
- 原 Journal 情境：凌晨孩子醒來，待洗的用品還放在桌邊，今晚的交接時段尚未確認。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `coordinate`：把今晚需要的事列出來，協調一段可交接的時間
  - 已寫作結果（planning）：你把待洗的用品、安撫和明早的準備寫成清單，在輪班表留出想協調的時段；能否交接還要等回覆。
- 原選項 `carry`：今晚先自己承接，明天再談安排
  - 已寫作結果（planning）：你把今晚的安撫和用品整理留在自己這一邊，將明天要談的交接時間記在輪班表旁。
- 原選項 `handoff`：詢問另一位照顧者能否完整接手這一段；requirements：`{"kind":"actorAvailable","actorId":"caregiver-2"}`
  - 已寫作結果（planning）：你向另一位照顧者提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
- 原選項 `ask-family`：與支持家人確認這次可支援的範圍；requirements：`{"kind":"actorAvailable","actorId":"support-1"}`
  - 已寫作結果（planning）：你向支持家人詢問可用時段，把這次需要的工作寫清楚；對方能接哪一段仍待回覆。
- 即時後續：night-handoff-reflection；節點排程：`[]`。

## 02｜night-handoff-reflection

- 範圍：legacy（bound 試玩亦沿用）；age-stage-1；routine／AUTO_ADVANCE。
- 標題：凌晨的交接之後
- 原情境：天亮後，用品和待辦仍在桌邊。你發現昨晚除了安撫，也花了力氣記住誰何時能接手。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"night-handoff-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 03｜night-handoff-support

- 範圍：legacy（bound 試玩亦沿用）；age-stage-1；support／AUTO_ADVANCE。
- 標題：把安排變成可用的支持
- 原情境：過了那一晚，你再次確認可用的協助，也把能延後的用品整理挪開。支持先從減少一段工作開始，不必等到有人能接下全部。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"night-handoff-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：night-handoff-reconnect；節點排程：`[]`。

## 04｜night-handoff-strain

- 範圍：legacy（bound 試玩亦沿用）；age-stage-1；environment／AUTO_ADVANCE。
- 標題：又一個需要記住的提醒
- 原情境：到了下一段照顧時間，你才發現用品還沒整理。睡得零碎加上接連的提醒，讓你在交接時說得比原先想的急。
- 原 eligibility：`{"kind":"planningLoadAtLeast","value":3}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：night-handoff-reconnect；節點排程：`[]`。

## 05｜night-handoff-reconnect

- 範圍：legacy（bound 試玩亦沿用）；age-stage-1；choice／PLAYER_INPUT_REQUIRED。
- 標題：找回可以說話的空間
- 原情境：事情暫時告一段落，你回想剛才的交接。有些話可以現在慢慢說，也可以先留下一個約定，等彼此有力氣再接回來。
- 原 eligibility：`{"kind":"any","conditions":[{"kind":"eventCompleted","eventId":"night-handoff-support"},{"kind":"eventCompleted","eventId":"night-handoff-strain"}]}`
- 原選項 `talk`：說出剛才的感受，也聽聽對方
  - 已寫作結果（repair）：你留了一段時間，把匆忙中沒能說清楚的話重新接回來。
- 原選項 `pause`：先留一點休息時間，約定稍後再談
  - 已寫作結果（repair）：你承認現在需要休息，也留下了之後繼續對話的約定。
- 即時後續：night-handoff-repair；節點排程：`[]`。

## 06｜night-handoff-repair

- 範圍：legacy（bound 試玩亦沿用）；age-stage-1；repair／AUTO_ADVANCE。
- 標題：留下一個重新連上的起點
- 原情境：你讓對方知道剛才的匆忙不等於不在意，也確認接下來可以怎麼聯絡。問題還能再談，這次重新靠近的嘗試先留在你們的生活裡。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"night-handoff-reconnect"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 07｜meal-preparation-choice

- 範圍：legacy（bound 試玩亦沿用）；age-stage-2；choice／PLAYER_INPUT_REQUIRED。
- 標題：餐桌前的準備
- 原情境：到了準備餐點的時間，採買清單、清潔和陪伴都在等你。家人的做法各有習慣，今天你得先決定如何分配有限的時間。
- actorText：`{"actorId":"child-1","prefix":"與","suffix":"一起生活的日常。到了準備餐點的時間，採買清單、清潔和陪伴都在等你。家人的做法各有習慣，今天你得先決定如何分配有限的時間。"}`
- 原 Journal 情境：餐前的採買、備料和餐後清潔擠在同一段時間裡。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `coordinate`：簡化今天的備餐，留時間確認分工
  - 已寫作結果（planning）：你從今天的備餐清單刪去一道需要久煮的餐點，把採買與餐後清潔分開列出，準備逐項確認分工。
- 原選項 `carry`：先按原來的安排備齊用品並收尾
  - 已寫作結果（planning）：你把備餐用品排在桌上，先承接今天的準備與收尾，再把還沒談好的分工留在清單上。
- 原選項 `handoff`：詢問另一位照顧者能否完整接手這一段；requirements：`{"kind":"actorAvailable","actorId":"caregiver-2"}`
  - 已寫作結果（planning）：你向另一位照顧者提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
- 原選項 `ask-family`：與支持家人確認這次可支援的範圍；requirements：`{"kind":"actorAvailable","actorId":"support-1"}`
  - 已寫作結果（planning）：你向支持家人詢問可用時段，把這次需要的工作寫清楚；對方能接哪一段仍待回覆。
- 即時後續：meal-preparation-reflection；節點排程：`[]`。

## 08｜meal-preparation-reflection

- 範圍：legacy（bound 試玩亦沿用）；age-stage-2；routine／AUTO_ADVANCE。
- 標題：餐桌前的準備之後
- 原情境：餐點結束後，清理又花了一段時間。你把準備和收尾一起記進下次討論的分工，而不只計算端上桌的那一刻。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"meal-preparation-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 09｜backup-contact-choice

- 範圍：legacy（bound 試玩亦沿用）；age-stage-3；choice／PLAYER_INPUT_REQUIRED。
- 標題：臨時變動的工作時間
- 原情境：工作時段突然變了，原本留給照顧的時間也跟著移動。單一照顧者可能需要找不同住的親友，其他家庭也得重新確認誰真的能接手。
- actorText：`{"actorId":"child-1","prefix":"與","suffix":"一起生活的日常。工作時段突然變了，原本留給照顧的時間也跟著移動。單一照顧者可能需要找不同住的親友，其他家庭也得重新確認誰真的能接手。"}`
- 原 Journal 情境：工作時段臨時變動，原本的照顧時間需要重新安排。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `coordinate`：聯絡備援並說清楚這次需要的時間
  - 已寫作結果（planning）：你發出寫有開始、結束時間的備援詢問，把需要交接的物品列在訊息裡；目前還沒有確認誰會接手。
- 原選項 `carry`：先調整自己的工作與照顧安排
  - 已寫作結果（planning）：你先挪動自己的工作和照顧時段，把受影響的行程逐項記下，沒有把尚未回覆的備援算進安排。
- 原選項 `handoff`：詢問另一位照顧者能否完整接手這一段；requirements：`{"kind":"actorAvailable","actorId":"caregiver-2"}`
  - 已寫作結果（planning）：你向另一位照顧者提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
- 原選項 `ask-family`：與支持家人確認這次可支援的範圍；requirements：`{"kind":"actorAvailable","actorId":"support-1"}`
  - 已寫作結果（planning）：你向支持家人詢問可用時段，把這次需要的工作寫清楚；對方能接哪一段仍待回覆。
- 即時後續：backup-contact-reflection；節點排程：`[]`。

## 10｜backup-contact-reflection

- 範圍：legacy（bound 試玩亦沿用）；age-stage-3；routine／AUTO_ADVANCE。
- 標題：臨時變動的工作時間之後
- 原情境：訊息往返後，行程暫時接上了。你記下這次確認時間、交接物品與追蹤回覆所花的心力。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"backup-contact-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 11｜grandparent-boundary-choice

- 範圍：legacy（bound 試玩亦沿用）；age-stage-4；choice／PLAYER_INPUT_REQUIRED。
- 標題：作息安排的不同想法
- 原情境：你回想曾經聽過的作息建議，也想保留眼前試出的節奏。有些想法仍需要整理，今天先從哪一小段開始？
- actorText：`{"actorId":"support-1","prefix":"","suffix":"分享過去的照顧經驗，你也想保留眼前試出的節奏。這次要從哪一小段開始談？"}`
- 原 Journal 情境：回想不同的作息建議時，你想保留眼前試出的生活節奏。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `coordinate`：先說明這次希望被尊重的作息安排
  - 已寫作結果（planning）：你把想保留的作息時間寫下，整理成一段具體說明，準備在下次談照顧安排時表達界線。
- 原選項 `carry`：今天先沿用熟悉的安排，另找時間談
  - 已寫作結果（planning）：你把今天的作息照原來的順序排好，另記下一項想再談的差異，沒有替任何家人答應新的做法。
- 原選項 `handoff`：詢問另一位照顧者能否完整接手這一段；requirements：`{"kind":"actorAvailable","actorId":"caregiver-2"}`
  - 已寫作結果（planning）：你向另一位照顧者提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
- 原選項 `ask-family`：與支持家人確認這次可支援的範圍；requirements：`{"kind":"actorAvailable","actorId":"support-1"}`
  - 已寫作結果（planning）：你向支持家人詢問可用時段，把這次需要的工作寫清楚；對方能接哪一段仍待回覆。
- 即時後續：grandparent-boundary-reflection；節點排程：`[]`。

## 12｜grandparent-boundary-reflection

- 範圍：legacy（bound 試玩亦沿用）；age-stage-4；routine／AUTO_ADVANCE。
- 標題：作息安排的不同想法之後
- 原情境：對話告一段落，彼此仍保有不同經驗。你記住哪些提醒讓你感到被支持，哪些界線需要下次再說清楚。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"grandparent-boundary-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 13｜leaving-playground-choice

- 範圍：legacy（bound 試玩亦沿用）；age-stage-5；choice／PLAYER_INPUT_REQUIRED。
- 標題：遊戲還沒結束
- 原情境：你準備離開公園，孩子卻還想繼續玩。回家的交通和晚餐都在等，旁邊的人也看了過來；你的時間與孩子當下的心情暫時對不上。
- actorText：`{"actorId":"child-1","prefix":"與","suffix":"一起生活的日常。你準備離開公園，孩子卻還想繼續玩。回家的交通和晚餐都在等，旁邊的人也看了過來；你的時間與孩子當下的心情暫時對不上。"}`
- 原 Journal 情境：孩子還想留在公園，回家的交通和晚餐時間已經逼近。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `coordinate`：留一小段告別時間，同時調整晚餐安排
  - 已寫作結果（planning）：你留出一小段告別遊戲的時間，把晚餐準備往後挪，先和孩子說明接下來要回家。
- 原選項 `carry`：先帶孩子回家，再接住路上的情緒
  - 已寫作結果（planning）：你把回家的用品收進袋子，先帶孩子離開遊戲區，將路上安撫情緒的時間留在自己的安排裡。
- 原選項 `handoff`：詢問另一位照顧者能否完整接手這一段；requirements：`{"kind":"actorAvailable","actorId":"caregiver-2"}`
  - 已寫作結果（planning）：你向另一位照顧者提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
- 原選項 `ask-family`：與支持家人確認這次可支援的範圍；requirements：`{"kind":"actorAvailable","actorId":"support-1"}`
  - 已寫作結果（planning）：你向支持家人詢問可用時段，把這次需要的工作寫清楚；對方能接哪一段仍待回覆。
- 即時後續：leaving-playground-reflection；節點排程：`[]`。

## 14｜leaving-playground-reflection

- 範圍：legacy（bound 試玩亦沿用）；age-stage-5；routine／AUTO_ADVANCE。
- 標題：遊戲還沒結束之後
- 原情境：離開公園後，孩子慢慢安靜下來，你也整理剛才沒說完的話。那幾道目光留在心裡，卻沒有替你決定家庭下一步。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"leaving-playground-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 15｜shared-ownership-choice

- 範圍：legacy（bound 試玩亦沿用）；age-stage-6；choice／PLAYER_INPUT_REQUIRED。
- 標題：誰會記得補用品
- 原情境：用品又快用完了。有人願意幫忙購買，卻等著你提醒品項與數量。雙照顧者也可能像獨自照顧，執行有人接手，追蹤卻仍留在同一人身上。
- actorText：`{"actorId":"child-1","prefix":"與","suffix":"一起生活的日常。用品又快用完了。有人願意幫忙購買，卻等著你提醒品項與數量。雙照顧者也可能像獨自照顧，執行有人接手，追蹤卻仍留在同一人身上。"}`
- 原 Journal 情境：日常用品快用完，盤點品項和追蹤補貨仍需要有人記住。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `coordinate`：討論從盤點到補齊的完整責任
  - 已寫作結果（planning）：你把盤點、採買和確認補齊分成三項，寫下希望完整交接的範圍；是否有人承接仍待確認。
- 原選項 `carry`：這次先自己盤點和補貨
  - 已寫作結果（planning）：你先盤點剩下的用品，把數量記進採買清單，這次補貨與確認的工作仍由你追蹤。
- 原選項 `handoff`：詢問另一位照顧者能否完整接手這一段；requirements：`{"kind":"actorAvailable","actorId":"caregiver-2"}`
  - 已寫作結果（planning）：你向另一位照顧者提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
- 原選項 `ask-family`：與支持家人確認這次可支援的範圍；requirements：`{"kind":"actorAvailable","actorId":"support-1"}`
  - 已寫作結果（planning）：你向支持家人詢問可用時段，把這次需要的工作寫清楚；對方能接哪一段仍待回覆。
- 即時後續：shared-ownership-reflection；節點排程：`[]`。

## 16｜shared-ownership-reflection

- 範圍：legacy（bound 試玩亦沿用）；age-stage-6；support／AUTO_ADVANCE。
- 標題：誰會記得補用品之後
- 原情境：你找到一份可重複使用的用品清單，把每次都要憑記憶盤點的工作放下一小段。支持也可以是一個讓安排更省力的工具，不必等到有人能接手全部。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"shared-ownership-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 17｜rainy-pickup-choice

- 範圍：legacy（bound 試玩亦沿用）；age-stage-7；choice／PLAYER_INPUT_REQUIRED。
- 標題：雨天的接送變更
- 原情境：雨勢改變了原來的交通安排，你得重新確認接送地點。即使平常共同分擔，今天也可能各有工作卡住；備援是否有空還需要問過。
- actorText：`{"actorId":"child-1","prefix":"與","suffix":"一起生活的日常。雨勢改變了原來的交通安排，你得重新確認接送地點。即使平常共同分擔，今天也可能各有工作卡住；備援是否有空還需要問過。"}`
- 原 Journal 情境：雨勢打亂交通，接送地點和時間需要重新確認。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `coordinate`：重新確認接送時間與可用的備援
  - 已寫作結果（planning）：你傳出新的接送地點與時間，將備援聯絡順序寫在旁邊；沒有把尚未確認的人算作已到場。
- 原選項 `carry`：先自己改道接送，把其他工作延後
  - 已寫作結果（planning）：你改排自己的接送路線，把可以延後的工作移出眼前的行程，先承接這次交通變動。
- 原選項 `handoff`：詢問另一位照顧者能否完整接手這一段；requirements：`{"kind":"actorAvailable","actorId":"caregiver-2"}`
  - 已寫作結果（planning）：你向另一位照顧者提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
- 原選項 `ask-family`：與支持家人確認這次可支援的範圍；requirements：`{"kind":"actorAvailable","actorId":"support-1"}`
  - 已寫作結果（planning）：你向支持家人詢問可用時段，把這次需要的工作寫清楚；對方能接哪一段仍待回覆。
- 即時後續：rainy-pickup-reflection；節點排程：`[]`。

## 18｜rainy-pickup-reflection

- 範圍：legacy（bound 試玩亦沿用）；age-stage-7；environment／AUTO_ADVANCE。
- 標題：雨天的接送變更之後
- 原情境：抵達後你才有空收起濕掉的物品。交通變動也帶來聯絡與確認工作，這些時間沒有出現在原本的行程裡。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"rainy-pickup-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 19｜preschool-handoff-choice

- 範圍：legacy（bound 試玩亦沿用）；age-stage-8；choice／PLAYER_INPUT_REQUIRED。
- 標題：教室門口的停頓
- 原情境：孩子到了教室門口卻停住腳步。你想陪一會，也看見上班時間逼近；老師正在接待其他家庭，今天的交接需要重新安排。
- actorText：`{"actorId":"child-1","prefix":"與","suffix":"一起生活的日常。孩子到了教室門口卻停住腳步。你想陪一會，也看見上班時間逼近；老師正在接待其他家庭，今天的交接需要重新安排。"}`
- 原 Journal 情境：孩子停在教室門口，上班時間逼近，老師還在接待其他家庭。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `coordinate`：與老師約定交接方式並調整工作通知
  - 已寫作結果（planning）：你向老師提出想確認的交接方式，也把可能延後的工作通知寫好；老師能配合的細節還要再核對。
- 原選項 `carry`：先陪孩子安頓，自己承接後續工作協調
  - 已寫作結果（planning）：你先陪孩子度過門口的停頓，把要向工作端說明的時間變更記下，沒有把交接當成已經完成。
- 原選項 `handoff`：詢問另一位照顧者能否完整接手這一段；requirements：`{"kind":"actorAvailable","actorId":"caregiver-2"}`
  - 已寫作結果（planning）：你向另一位照顧者提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
- 原選項 `ask-family`：與支持家人確認這次可支援的範圍；requirements：`{"kind":"actorAvailable","actorId":"support-1"}`
  - 已寫作結果（planning）：你向支持家人詢問可用時段，把這次需要的工作寫清楚；對方能接哪一段仍待回覆。
- 即時後續：preschool-handoff-reflection；節點排程：`[]`。

## 20｜preschool-handoff-reflection

- 範圍：legacy（bound 試玩亦沿用）；age-stage-8；routine／AUTO_ADVANCE。
- 標題：教室門口的停頓之後
- 原情境：離開教室後，工作訊息接著響起。入園不只是一段告別，也連著接送、用品與誰負責追蹤今天的消息。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"preschool-handoff-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 21｜preschool-handoff-support

- 範圍：legacy（bound 試玩亦沿用）；age-stage-8；support／AUTO_ADVANCE。
- 標題：把安排變成可用的支持
- 原情境：下一次交接前，你和老師確認了聯絡方式，也把可延後的工作另作安排。有人接住一段訊息追蹤，並不表示每個困難都消失了。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"preschool-handoff-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：preschool-handoff-reconnect；節點排程：`[]`。

## 22｜preschool-handoff-strain

- 範圍：legacy（bound 試玩亦沿用）；age-stage-8；environment／AUTO_ADVANCE。
- 標題：又一個需要記住的提醒
- 原情境：下一次接送又碰上工作訊息，用品和回覆都等著確認。匆忙中，你與孩子的對話中斷了，彼此都有話沒說完。
- 原 eligibility：`{"kind":"planningLoadAtLeast","value":3}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：preschool-handoff-reconnect；節點排程：`[]`。

## 23｜preschool-handoff-reconnect

- 範圍：legacy（bound 試玩亦沿用）；age-stage-8；choice／PLAYER_INPUT_REQUIRED。
- 標題：找回可以說話的空間
- 原情境：事情暫時告一段落，你回想剛才的交接。有些話可以現在慢慢說，也可以先留下一個約定，等彼此有力氣再接回來。
- 原 eligibility：`{"kind":"any","conditions":[{"kind":"eventCompleted","eventId":"preschool-handoff-support"},{"kind":"eventCompleted","eventId":"preschool-handoff-strain"}]}`
- 原選項 `talk`：說出剛才的感受，也聽聽對方
  - 已寫作結果（repair）：你留了一段時間，把匆忙中沒能說清楚的話重新接回來。
- 原選項 `pause`：先留一點休息時間，約定稍後再談
  - 已寫作結果（repair）：你承認現在需要休息，也留下了之後繼續對話的約定。
- 即時後續：preschool-handoff-repair；節點排程：`[]`。

## 24｜preschool-handoff-repair

- 範圍：legacy（bound 試玩亦沿用）；age-stage-8；repair／AUTO_ADVANCE。
- 標題：留下一個重新連上的起點
- 原情境：你讓對方知道剛才的匆忙不等於不在意，也確認接下來可以怎麼聯絡。問題還能再談，這次重新靠近的嘗試先留在你們的生活裡。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"preschool-handoff-reconnect"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 25｜school-notice-choice

- 範圍：legacy（bound 試玩亦沿用）；age-stage-9；choice／PLAYER_INPUT_REQUIRED。
- 標題：通知上的截止時間
- 原情境：學校通知需要回覆，還要準備一份物品。你下班後才讀到訊息，家人也各有安排；表格不大，記住和追蹤的工作卻不會自己消失。
- actorText：`{"actorId":"child-1","prefix":"與","suffix":"一起生活的日常。學校通知需要回覆，還要準備一份物品。你下班後才讀到訊息，家人也各有安排；表格不大，記住和追蹤的工作卻不會自己消失。"}`
- 原 Journal 情境：學校通知有回覆期限，還需要另外準備物品。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `coordinate`：把回覆與準備工作一起攤開協調
  - 已寫作結果（planning）：你把通知的截止時間、要回覆的內容和準備物品分開列出，準備逐項確認誰能承接。
- 原選項 `carry`：這次先自己讀完、準備並追蹤回覆
  - 已寫作結果（planning）：你先讀完通知，把要準備的材料放進待辦清單，這次回覆與確認期限仍由你追蹤。
- 原選項 `handoff`：詢問另一位照顧者能否完整接手這一段；requirements：`{"kind":"actorAvailable","actorId":"caregiver-2"}`
  - 已寫作結果（planning）：你向另一位照顧者提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
- 原選項 `ask-family`：與支持家人確認這次可支援的範圍；requirements：`{"kind":"actorAvailable","actorId":"support-1"}`
  - 已寫作結果（planning）：你向支持家人詢問可用時段，把這次需要的工作寫清楚；對方能接哪一段仍待回覆。
- 即時後續：school-notice-reflection；節點排程：`[]`。

## 26｜school-notice-reflection

- 範圍：legacy（bound 試玩亦沿用）；age-stage-9；routine／AUTO_ADVANCE。
- 標題：通知上的截止時間之後
- 原情境：回覆送出後，你記下準備的過程。完成通知背後也有找材料、確認期限和提醒交接，值得在分工時被看見。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"school-notice-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 27｜quiet-time-choice

- 範圍：legacy（bound 試玩亦沿用）；age-stage-10；choice／PLAYER_INPUT_REQUIRED。
- 標題：留給自己的半小時
- 原情境：孩子想找你一起玩，你原本打算留一段安靜時間。全職照顧或彈性工作都不代表隨時有空，今天的陪伴與休息需要重新放進安排。
- actorText：`{"actorId":"child-1","prefix":"與","suffix":"一起生活的日常。孩子想找你一起玩，你原本打算留一段安靜時間。全職照顧或彈性工作都不代表隨時有空，今天的陪伴與休息需要重新放進安排。"}`
- 原 Journal 情境：孩子想一起玩，你原本替自己留下的一段安靜時間需要重新安排。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `coordinate`：把休息需求說出來，重新安排陪伴時段
  - 已寫作結果（planning）：你說出自己需要休息，把陪伴與安靜時間分成兩段寫下；還沒確認的交接不算進可休息的時間。
- 原選項 `carry`：今天先陪孩子，記下還沒安排的休息
  - 已寫作結果（planning）：你先把陪孩子的時間留出來，另記下今天還沒安排的休息，沒有把換做別的家務當成休息。
- 原選項 `handoff`：詢問另一位照顧者能否完整接手這一段；requirements：`{"kind":"actorAvailable","actorId":"caregiver-2"}`
  - 已寫作結果（planning）：你向另一位照顧者提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
- 原選項 `ask-family`：與支持家人確認這次可支援的範圍；requirements：`{"kind":"actorAvailable","actorId":"support-1"}`
  - 已寫作結果（planning）：你向支持家人詢問可用時段，把這次需要的工作寫清楚；對方能接哪一段仍待回覆。
- 即時後續：quiet-time-reflection；節點排程：`[]`。

## 28｜quiet-time-reflection

- 範圍：legacy（bound 試玩亦沿用）；age-stage-10；routine／AUTO_ADVANCE。
- 標題：留給自己的半小時之後
- 原情境：一天將近結束，你回看哪些時間真的能休息，哪些只是換一件工作。陪伴和自己的需要都留在今天的紀錄裡。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"quiet-time-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 29｜family-ritual-choice

- 範圍：legacy（bound 試玩亦沿用）；age-stage-11；choice／PLAYER_INPUT_REQUIRED。
- 標題：今年想怎麼相聚
- 原情境：家人想安排一次相聚，孩子也有期待。不同世代對準備的想像不一樣，有人想到熱鬧，有人已經在想採買、聯絡與清理。
- actorText：`{"actorId":"child-1","prefix":"與","suffix":"一起生活的日常。家人想安排一次相聚，孩子也有期待。不同世代對準備的想像不一樣，有人想到熱鬧，有人已經在想採買、聯絡與清理。"}`
- 原 Journal 情境：準備家庭相聚時，採買、聯絡與清理也跟著排進行程。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `coordinate`：縮小活動規模，先確認每個人願意接的工作
  - 已寫作結果（planning）：你縮減聚會清單，把採買、聯絡和收尾分開列出，等待參與的人確認願意承接的工作。
- 原選項 `carry`：保留原來的聚會安排，先接下準備工作
  - 已寫作結果（planning）：你保留原來的聚會規模，先接下準備清單，把採買和聯絡的提醒排進自己的行程。
- 原選項 `handoff`：詢問另一位照顧者能否完整接手這一段；requirements：`{"kind":"actorAvailable","actorId":"caregiver-2"}`
  - 已寫作結果（planning）：你向另一位照顧者提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
- 原選項 `ask-family`：與支持家人確認這次可支援的範圍；requirements：`{"kind":"actorAvailable","actorId":"support-1"}`
  - 已寫作結果（planning）：你向支持家人詢問可用時段，把這次需要的工作寫清楚；對方能接哪一段仍待回覆。
- 即時後續：family-ritual-reflection；節點排程：`[]`。

## 30｜family-ritual-reflection

- 範圍：legacy（bound 試玩亦沿用）；age-stage-11；routine／AUTO_ADVANCE。
- 標題：今年想怎麼相聚之後
- 原情境：相聚留下了一些片刻，也留下需要收拾的物品。你把喜歡的回憶和籌備的心力一起留下，作為下次安排的參考。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"family-ritual-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 31｜school-transition-choice

- 範圍：legacy（bound 試玩亦沿用）；age-stage-12；choice／PLAYER_INPUT_REQUIRED。
- 標題：下一段生活的清單
- 原情境：新的學習階段快到了，孩子問起接下來的生活。你看著聯絡、接送與用品清單，也想到這些年曾經重新協調過的分工。
- actorText：`{"actorId":"child-1","prefix":"與","suffix":"一起生活的日常。新的學習階段快到了，孩子問起接下來的生活。你看著聯絡、接送與用品清單，也想到這些年曾經重新協調過的分工。"}`
- 原 Journal 情境：新的學習階段將近，聯絡、接送與用品清單還有許多待確認的項目。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `coordinate`：一起挑出最需要先確認的一件事
  - 已寫作結果（planning）：你從清單圈出最需要先確認的一件事，把其他還不確定的項目留在下一次討論欄。
- 原選項 `carry`：先整理全部清單，再逐項安排
  - 已寫作結果（planning）：你把聯絡、接送與用品分成三欄，先整理全部待辦，再逐項標記需要追蹤的時間。
- 原選項 `handoff`：詢問另一位照顧者能否完整接手這一段；requirements：`{"kind":"actorAvailable","actorId":"caregiver-2"}`
  - 已寫作結果（planning）：你向另一位照顧者提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
- 原選項 `ask-family`：與支持家人確認這次可支援的範圍；requirements：`{"kind":"actorAvailable","actorId":"support-1"}`
  - 已寫作結果（planning）：你向支持家人詢問可用時段，把這次需要的工作寫清楚；對方能接哪一段仍待回覆。
- 即時後續：school-transition-reflection；節點排程：`[]`。

## 32｜school-transition-reflection

- 範圍：legacy（bound 試玩亦沿用）；age-stage-12；routine／AUTO_ADVANCE。
- 標題：下一段生活的清單之後
- 原情境：清單還沒全部完成，但你們已有可以再談的起點。這段家庭生活留下的不是分數，而是那些承接、求助與重新連上的時刻。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"school-transition-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 33｜mvp-breathing-space

- 範圍：legacy（bound 試玩亦沿用）；age-stage-1；routine／AUTO_ADVANCE。
- 標題：讓日常留一點空白
- 原情境：這一段暫時沒有新的安排。你讓生活留一點空白，等待下一次交接，或帶著今天的經驗走向下一個階段。
- 原 eligibility：`{"kind":"always"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## 34｜toy-car-story-choice

- 範圍：08A bound 試玩專用；age-stage-8；choice／PLAYER_INPUT_REQUIRED。
- 標題：搶回來的那台小車
- 原情境：孩子拿著小車說起今天和別人都想玩的那一台。你沒在現場，桌上剛好還有另一台玩具車。
- 原 Journal 情境：孩子拿著小車說起今天和別人都想玩的那一台。你沒在現場，桌上剛好還有另一台玩具車。
- 原 eligibility：`{"kind":"always"}`
- 原選項 `enact`：用玩具演一遍，讓孩子改正你的猜想
  - 已寫作結果（narrative）：你把兩台小車放到桌邊，先用自己的那台演出猜想，把不知道的部分留給他說。你還沒有判定事情是怎麼發生的。
- 原選項 `ask`：只問他最想讓你知道的一句話
  - 已寫作結果（narrative）：你只問他最想讓你知道哪一句，沒有替沒看見的現場先下結論。
- 原選項 `acknowledge`：說清楚自己沒有看見現場，不替誰判輸贏
  - 已寫作結果（narrative）：你說自己沒有看見那一刻，不替任何一個孩子猜理由。
- 即時後續：無；節點排程：`[{"eventId":"toy-car-story-revisit","delayTurns":1,"priority":10}]`。

## 35｜toy-car-story-revisit

- 範圍：08A bound 試玩專用；age-stage-8；routine／AUTO_ADVANCE。
- 標題：小車故事還沒說完
- 原情境：你想到自己剛才多想直接給出答案。回想那段小車故事，你想把不知道的那一段重新留出來。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"toy-car-story-choice"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：toy-car-story-listen；節點排程：`[]`。

## 36｜toy-car-story-listen

- 範圍：08A bound 試玩專用；age-stage-8；choice／PLAYER_INPUT_REQUIRED。
- 標題：把沒聽懂的部分接回來
- 原情境：有些事情還沒有聽明白。你可以再邀他補充，也可以先說清楚自己沒有看見現場。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"toy-car-story-revisit"}`
- 原選項 `invite`：邀他補充你剛才沒聽懂的那一段
  - 已寫作結果（repair）：你問「你最想讓我知道哪一段」，不替另一個孩子猜理由。這次的邀請已說出口，是否繼續說由孩子決定。
- 原選項 `clarify`：說清楚自己沒有看見現場，不替誰先下結論
  - 已寫作結果（repair）：你重新說明自己不知道現場發生了什麼，把想立刻判斷的話收回。你沒有替孩子決定是否繼續談。
- 即時後續：toy-car-story-close；節點排程：`[]`。

## 37｜toy-car-story-close

- 範圍：08A bound 試玩專用；age-stage-8；routine／AUTO_ADVANCE。
- 標題：留一個可以再說的位置
- 原情境：你把自己沒看見的部分留作不知道。這一段先停在這裡，不用現在就替故事判輸贏。
- 原 eligibility：`{"kind":"eventCompleted","eventId":"toy-car-story-listen"}`
- 原選項：無（AUTO_ADVANCE）。
- 即時後續：無；節點排程：`[]`。

## Reaction 原文

### everyday-responses

- `understanding`（understanding）：對方表示聽見了你的安排，也說出自己能參與的範圍。；roles：partner／grandparent／teacher／colleague；requirements：`null`
- `different-expectation`（criticism）：對方提出不同期待。你聽見了意見，仍需要按眼前的條件安排。；roles：partner／grandparent／teacher／colleague／stranger；requirements：`null`
- `child-response`（neutral）：孩子用聲音和動作回應，今天的節奏還需要慢慢磨合。；roles：child；requirements：`null`
- `no-comment`（none）：這一次沒有收到新的回應，安排先留待之後確認。；roles：child；requirements：`null`

### toy-car-first-response

- `correct-direction`（neutral）：把你的那台車轉了個方向，說：「不是這邊，他是從那裡來的。」；roles：child；requirements：`{"kind":"all","conditions":[{"kind":"actorAvailable","actorId":"child-1"},{"kind":"flag","flag":"toy-car-enact"}]}`
- `one-sentence`（neutral）：指著車輪說：「我只是想讓他看這個。」；roles：child；requirements：`{"kind":"all","conditions":[{"kind":"actorAvailable","actorId":"child-1"},{"kind":"flag","flag":"toy-car-ask"}]}`
- `keep-question`（neutral）：把小車拿近一點，問你還要不要看。；roles：child；requirements：`{"kind":"all","conditions":[{"kind":"actorAvailable","actorId":"child-1"},{"kind":"flag","flag":"toy-car-acknowledge"}]}`
- `not-now`（neutral）：抱著小車說現在不想講。；roles：child；requirements：`null`
- `none`（none）：這次沒有新的回應。；roles：child；requirements：`null`

### toy-car-later-response

- `wheel`（neutral）：指著車輪說：「我本來只是想讓他看這裡。」；roles：child；requirements：`{"kind":"all","conditions":[{"kind":"actorAvailable","actorId":"child-1"},{"kind":"flag","flag":"toy-car-invite"}]}`
- `leave-it`（neutral）：把小車轉了一圈，說這件事先放著。；roles：child；requirements：`{"kind":"all","conditions":[{"kind":"actorAvailable","actorId":"child-1"},{"kind":"flag","flag":"toy-car-clarify"}]}`
- `not-now`（neutral）：說現在想玩，不想再說剛才的事。；roles：child；requirements：`null`
- `none`（none）：這次沒有新的回應。；roles：child；requirements：`null`

