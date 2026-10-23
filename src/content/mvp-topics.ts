import type { NarrativeEffects } from "../domain/schemas.js";

interface MvpTopic {
  slug: string;
  title: string;
  location: string;
  text: string;
  plan: string;
  carry: string;
  reflection: string;
  reflectionKind?: "routine" | "support" | "environment";
  reflectionEffects?: NarrativeEffects;
  chain?: "night" | "preschool";
  topic: string;
  summary: string;
  tip: string;
}

// Fictional scenes, not developmental deadlines or medical instructions.
export const MVP_TOPICS: readonly MvpTopic[] = [
  {
    slug: "night-handoff", title: "凌晨的交接", location: "home", chain: "night",
    text: "孩子醒來，你一邊安撫，一邊想著還沒洗的用品和明天的安排。輪班表上還有空白，眼前的照顧和之後要記住的事疊在一起。",
    plan: "把今晚需要的事列出來，協調一段可交接的時間", carry: "今晚先自己承接，明天再談安排",
    reflection: "天亮後，用品和待辦仍在桌邊。你發現昨晚除了安撫，也花了力氣記住誰何時能接手。",
    topic: "夜間照顧與交接", summary: "夜間照顧包含準備、記錄與收尾；不同家庭能協調的支持時段不同。",
    tip: "事後回看哪一段最耗力，再確認可交接的範圍與支持者是否同意。",
  },
  {
    slug: "meal-preparation", title: "餐桌前的準備", location: "home",
    text: "到了準備餐點的時間，採買清單、清潔和陪伴都在等你。家人的做法各有習慣，今天你得先決定如何分配有限的時間。",
    plan: "簡化今天的備餐，留時間確認分工", carry: "先按原來的安排備齊用品並收尾",
    reflection: "餐點結束後，清理又花了一段時間。你把準備和收尾一起記進下次討論的分工，而不只計算端上桌的那一刻。",
    topic: "備餐也是照顧工作", summary: "安排、採買與清潔都會占用照顧時間；餐桌上的選擇需要考慮各自的生活條件。",
    tip: "列出餐前與餐後的工作，討論哪些可以簡化；飲食與吞嚥疑問另向專業人員確認。",
  },
  {
    slug: "backup-contact", title: "臨時變動的工作時間", location: "work",
    text: "工作時段突然變了，原本留給照顧的時間也跟著移動。單一照顧者可能需要找不同住的親友，其他家庭也得重新確認誰真的能接手。",
    plan: "聯絡備援並說清楚這次需要的時間", carry: "先調整自己的工作與照顧安排",
    reflection: "訊息往返後，行程暫時接上了。你記下這次確認時間、交接物品與追蹤回覆所花的心力。",
    topic: "備援需要確認", summary: "家中人數與實際可用支持是不同的事；備援也需要事先確認界線與時間。",
    tip: "留下已同意的聯絡方式，並討論對方臨時無法支援時的替代安排。",
  },
  {
    slug: "grandparent-boundary", title: "長輩帶來的作息建議", location: "home",
    text: "長輩分享過去照顧的習慣，你也想保留眼前試出的節奏。同住或來探望都可能需要談界線，今天的對話要從哪一小段開始？",
    plan: "先說明這次希望被尊重的作息安排", carry: "今天先沿用熟悉的安排，另找時間談",
    reflection: "對話告一段落，彼此仍保有不同經驗。你記住哪些提醒讓你感到被支持，哪些界線需要下次再說清楚。",
    topic: "跨世代照顧界線", summary: "照顧經驗可能不同；感謝協助與表達界線可以同時存在，也需要逐次協調。",
    tip: "用具體的時間與任務描述需求，避免把不同做法解讀為誰比較愛孩子。",
  },
  {
    slug: "leaving-playground", title: "遊戲還沒結束", location: "park",
    text: "你準備離開公園，孩子卻還想繼續玩。回家的交通和晚餐都在等，旁邊的人也看了過來；你的時間與孩子當下的心情暫時對不上。",
    plan: "留一小段告別時間，同時調整晚餐安排", carry: "先帶孩子回家，再接住路上的情緒",
    reflection: "離開公園後，孩子慢慢安靜下來，你也整理剛才沒說完的話。那幾道目光留在心裡，卻沒有替你決定家庭下一步。",
    topic: "轉換活動的情緒", summary: "活動轉換可能讓大人與孩子都感到急迫；一次反應不代表固定的性格或照顧成敗。",
    tip: "事後回想當時的時間壓力與情緒訊號，再找下次可以調整的一小段。",
  },
  {
    slug: "shared-ownership", title: "誰會記得補用品", location: "home",
    text: "用品又快用完了。有人願意幫忙購買，卻等著你提醒品項與數量。雙照顧者也可能像獨自照顧，執行有人接手，追蹤卻仍留在同一人身上。",
    plan: "討論從盤點到補齊的完整責任", carry: "這次先自己盤點和補貨",
    reflection: "你找到一份可重複使用的用品清單，把每次都要憑記憶盤點的工作放下一小段。支持也可以是一個讓安排更省力的工具，不必等到有人能接手全部。",
    reflectionKind: "support",
    reflectionEffects: { planningLoadDelta: -1, relationshipMemories: [
      { id: "shared-ownership-checklist-support", category: "support", text: "重複使用的用品清單，接住了一部分需要記住的事。" },
    ] },
    topic: "完整接手與幫忙", summary: "共同分工不只是執行，也包含記住、規劃與追蹤；照顧參與可能隨工作條件改變。",
    tip: "挑一項工作確認負責範圍和回報方式，並保留重新協調的機會。",
  },
  {
    slug: "rainy-pickup", title: "雨天的接送變更", location: "street", reflectionKind: "environment",
    text: "雨勢改變了原來的交通安排，你得重新確認接送地點。即使平常共同分擔，今天也可能各有工作卡住；備援是否有空還需要問過。",
    plan: "重新確認接送時間與可用的備援", carry: "先自己改道接送，把其他工作延後",
    reflection: "抵達後你才有空收起濕掉的物品。交通變動也帶來聯絡與確認工作，這些時間沒有出現在原本的行程裡。",
    topic: "環境變動下的協調", summary: "臨時狀況可能壓縮時間彈性；重新安排的心力也是家庭工作的一部分。",
    tip: "在平靜時討論一個備援聯絡順序，並確認每個人能承接的範圍。",
  },
  {
    slug: "preschool-handoff", title: "教室門口的停頓", location: "school", chain: "preschool",
    text: "孩子到了教室門口卻停住腳步。你想陪一會，也看見上班時間逼近；老師正在接待其他家庭，今天的交接需要重新安排。",
    plan: "與老師約定交接方式並調整工作通知", carry: "先陪孩子安頓，自己承接後續工作協調",
    reflection: "離開教室後，工作訊息接著響起。入園不只是一段告別，也連著接送、用品與誰負責追蹤今天的消息。",
    topic: "入園與家庭節奏", summary: "入園適應牽動孩子、大人與工作安排；同一次交接可能伴隨多種感受。",
    tip: "事後與老師交換觀察，討論可持續的交接方式，不用把一次哭泣當成評分。",
  },
  {
    slug: "school-notice", title: "通知上的截止時間", location: "home",
    text: "學校通知需要回覆，還要準備一份物品。你下班後才讀到訊息，家人也各有安排；表格不大，記住和追蹤的工作卻不會自己消失。",
    plan: "把回覆與準備工作一起攤開協調", carry: "這次先自己讀完、準備並追蹤回覆",
    reflection: "回覆送出後，你記下準備的過程。完成通知背後也有找材料、確認期限和提醒交接，值得在分工時被看見。",
    topic: "學校聯絡的隱形工作", summary: "通知不只需要閱讀，也需要安排、確認和收尾；同住不代表工作自然平均分配。",
    tip: "討論誰主動讀取與追蹤通知，避免所有提醒仍集中在同一人身上。",
  },
  {
    slug: "quiet-time", title: "留給自己的半小時", location: "home",
    text: "孩子想找你一起玩，你原本打算留一段安靜時間。全職照顧或彈性工作都不代表隨時有空，今天的陪伴與休息需要重新放進安排。",
    plan: "把休息需求說出來，重新安排陪伴時段", carry: "今天先陪孩子，記下還沒安排的休息",
    reflection: "一天將近結束，你回看哪些時間真的能休息，哪些只是換一件工作。陪伴和自己的需要都留在今天的紀錄裡。",
    topic: "休息也是安排的一部分", summary: "照顧者可能同時想陪伴與休息；表達需要不代表對家庭投入不足。",
    tip: "確認休息時由誰承接哪些事；若長期困擾身心，可尋求專業支持。",
  },
  {
    slug: "family-ritual", title: "今年想怎麼相聚", location: "home",
    text: "家人想安排一次相聚，孩子也有期待。不同世代對準備的想像不一樣，有人想到熱鬧，有人已經在想採買、聯絡與清理。",
    plan: "縮小活動規模，先確認每個人願意接的工作", carry: "保留原來的聚會安排，先接下準備工作",
    reflection: "相聚留下了一些片刻，也留下需要收拾的物品。你把喜歡的回憶和籌備的心力一起留下，作為下次安排的參考。",
    topic: "家庭儀式與負擔", summary: "相聚可以帶來連結，也可能增加籌備工作；不同家庭可以有不同規模與形式。",
    tip: "回顧哪些片刻想保留，哪些準備可以省下，讓參與者能表達意願。",
  },
  {
    slug: "school-transition", title: "下一段生活的清單", location: "home",
    text: "新的學習階段快到了，孩子問起接下來的生活。你看著聯絡、接送與用品清單，也想到這些年曾經重新協調過的分工。",
    plan: "一起挑出最需要先確認的一件事", carry: "先整理全部清單，再逐項安排",
    reflection: "清單還沒全部完成，但你們已有可以再談的起點。這段家庭生活留下的不是分數，而是那些承接、求助與重新連上的時刻。",
    topic: "面對新的生活階段", summary: "轉換階段需要新的協調，不是檢驗過去是否完美；已有的支持與修復經驗可以成為起點。",
    tip: "與孩子和支持者交換各自的期待，把還不確定的事情留作下一次討論。",
  },
];
