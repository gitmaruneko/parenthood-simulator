import { eventNodeSchema, reactionPoolSchema, type Condition } from "../domain/schemas.js";
export const NARRATIVE_A3_RELEASE = "narrative-quality-a3-v1";
export const A3_STORIES = [
  { key: "work", stage: 3, old: "backup-contact", choices: ["nqa3-document", "nqa3-reschedule"] },
  { key: "bag", stage: 3, old: "backup-contact", choices: ["nqa3-pack", "nqa3-stay"] },
  { key: "message", stage: 4, old: "grandparent-boundary", choices: ["nqa3-decline", "nqa3-ask"] },
  { key: "shoes", stage: 4, old: "grandparent-boundary", choices: ["nqa3-find", "nqa3-toys"] },
  { key: "notice", stage: 9, old: "school-notice", choices: ["nqa3-box", "nqa3-materials"] },
  { key: "gathering", stage: 11, old: "family-ritual", choices: ["nqa3-menu", "nqa3-picnic"] },
  { key: "map", stage: 12, old: "school-transition", choices: ["nqa3-walk", "nqa3-draw"] },
] as const;
export const a3Root = (key: string) => `nqa3-${key}-choice`;
export const a3Reflection = (key: string) => `nqa3-${key}-reflection`;
export const NARRATIVE_A3_REPLACEMENTS: Readonly<Record<string, readonly string[]>> = Object.freeze(Object.fromEntries(
  [...new Set(A3_STORIES.map(story => story.old))].flatMap(old => [
    [`${old}-choice`, A3_STORIES.filter(story => story.old === old).map(story => a3Root(story.key))],
    [`${old}-reflection`, A3_STORIES.filter(story => story.old === old).map(story => a3Reflection(story.key))],
  ]),
));
const scenes = {
  work: ["手機跳出延後半小時的會議", "你在家，一邊照看孩子，一邊看工作訊息。原訂今天結束前的線上會議被挪後半小時，正撞上你要準備下一段照顧的時間。群組還在等你回覆是否出席。", "你關小工作訊息視窗，將下一段照顧要用的袋子放回手邊。",
    ["回覆無法出席，現在把意見寫進會議文件", "你回覆這次無法出席，把兩點意見寫進文件。會議怎麼決定，還要等紀錄。"],
    ["詢問能否改到明早，附上自己可用的時段", "你送出明早可用的時段。行事曆上的會議還沒變動，你先照原本的照顧安排走。"]],
  bag: ["門邊的袋子，還差最後一件", "你在家照看孩子，準備原訂的散步。門邊外出袋裡的備用品還沒整理齊，離原本想出門的時間已經很近。", "你把外出袋放回門邊固定的位置。",
    ["現在補齊袋子，晚一點出門", "你把這次要用的幾件放進袋裡，出門時間往後挪了一點。"],
    ["今天改在家陪孩子，袋子下午再整理", "你將袋子留在門邊，坐回孩子旁邊。今天這趟散步先取消。"]],
  message: ["午睡前，手機傳來一段作息建議", "午睡前，你坐在房內陪孩子，手機收到支持家人的訊息：「今天要不要晚一點睡，下午出門比較好排？」你原本沒安排下午外出，還沒回覆這個提議。這次透過手機聯絡，對方不在房內。", "你把今天原有的安排留在便條上，手機停在剛才的對話頁。",
    ["回訊說今天照原安排，下午外出改天再約", "你回訊說今天照原安排，下午的外出改天再約。手機先放回桌邊。"],
    ["先問下午原本想去哪裡，再決定要不要另約", "你問起下午想去哪裡，沒有先答應改動今天的安排。"]],
  shoes: ["下午原本想出門，鞋子還沒找齊", "你在家陪孩子，原訂下午出去走走。門邊待收的物品擋著找鞋，外出用品也還分散在幾處。", "你將門邊散落的物品集中到一側。",
    ["先找齊鞋子，今天照原計畫出去", "你在門邊找齊鞋子，把要帶的物品放在一起。"],
    ["今天留在家，在地上排一條玩具路", "你把玩具排成一條路，坐在孩子旁邊。這次外出先取消。"]],
  notice: ["明天要帶的紙盒，今晚才看到通知", "晚上在家，你讀到幼兒園通知：明天做紙盒城市，可帶一個乾淨空盒，沒有也可用班上材料。家裡只有一個還裝著雜物的鞋盒；孩子已把畫紙放在桌上，等你一起畫。", "你把今天畫過的紙張收成一疊，將手機通知標為已處理。",
    ["把鞋盒清出來，在盒上畫一扇門", "你清出鞋盒，在盒上畫了一扇門，也在桌上的畫紙試畫了窗。移出的雜物暫時集中在桌邊。"],
    ["回覆明天使用班上材料，今晚照原本的約定畫畫", "你回覆明天使用班上材料，把手機放下，坐回畫紙旁邊畫了幾筆。回覆已送出，還不知道老師是否看見。"]],
  gathering: ["相聚的菜單，冰箱貼不下了", "你在家看著週末相聚的草稿，原本想準備的菜已寫滿一張便條。孩子在旁邊畫桌上要放的小旗子。邀請訊息還沒送，收件人也還沒填；冰箱裡的食材只夠其中幾道。這次可以提議在家裡或外頭相聚。", "你把改過的便條貼回冰箱，小旗子的畫留在旁邊。",
    ["保留在家吃飯，刪到現有食材能做的幾道菜", "你把菜單刪到冰箱現有食材能做的幾道，將在家相聚的提議寫進邀請草稿。訊息還沒寄出。"],
    ["提議改在公園野餐，這次不在家開伙", "你把公園野餐寫進邀請草稿，另記下要查天氣與可用地點。訊息還沒寄出，地點還沒定案。"]],
  map: ["新教室的路，地圖上有兩個轉彎", "在家看新教室寄來的地圖時，孩子問門口那棵樹在哪裡。你還沒和孩子走過這條路，地圖上有兩個轉彎；入口可沿人行路線安全步行到達。今天有一段外出時間，也能留在家裡先看看。", "你把那張地圖摺好，放進下次出門要帶的袋子。",
    ["帶著地圖走一趟到入口，只認路、不進教室", "你帶孩子照地圖走到入口，在路上把兩個轉彎指給孩子看。今天沒有進教室。"],
    ["在紙上畫兩個轉彎，把入口圈起來", "你畫出兩個轉彎，圈起地圖上的入口。實際走起來要多久，還沒有確認。"]],
} as const;
const actors = { work: ["child-1", "colleague-1"], bag: ["child-1"], message: ["support-1"], shoes: ["child-1"], notice: ["child-1"], gathering: ["child-1"], map: ["child-1"] };
export const narrativeA3Events = () => A3_STORIES.flatMap(story => {
  const [title, text, reflection, ...actions] = scenes[story.key];
  return [eventNodeSchema.parse({ id: a3Root(story.key), ageStageId: `age-stage-${story.stage}`, kind: "choice", mode: "PLAYER_INPUT_REQUIRED", weight: 2,
    title, text, locationId: "home", actorIds: actors[story.key], contextTags: [`nqa3-${story.key}`], clearFlags: [...story.choices],
    reactionPoolIds: ["work", "message", "notice", "map"].includes(story.key) ? [`nqa3-${story.key}-response`] : [],
    immediateFollowUpEventIds: [a3Reflection(story.key)],
    choices: actions.map(([text, result], i) => ({ id: story.choices[i], text, setFlags: [story.choices[i]], storyEntries: [{ kind: "narrative", text: result }] })),
  }), eventNodeSchema.parse({ id: a3Reflection(story.key), ageStageId: `age-stage-${story.stage}`, kind: "routine", mode: "AUTO_ADVANCE", weight: 1,
    title: `${title}：收起手邊物品`, text: reflection, eligibility: { kind: "eventCompleted", eventId: a3Root(story.key) } }), ];
});
const requirement = (key: string, flag: string, actorId: string): Condition => ({ kind: "all", conditions: [
  { kind: "contextTag", tag: `nqa3-${key}` }, { kind: "flag", flag }, { kind: "actorAvailable", actorId },
] });
export const narrativeA3Pools = () => [
  { key: "work", actorId: "colleague-1", role: "colleague", rows: [
    ["document", "在工作群組回覆：「文件收到了，我會在會上提出。」"],
    ["reschedule", "在工作群組回覆：「我先問主持人，還不能答應。」"],
    ["reschedule", "在工作群組回覆：「已看到你的時段，這次仍照原時間。」"],
  ] },
  { key: "message", actorId: "support-1", role: "grandparent", rows: [
    ["decline", "回訊說：「好，那我們下次再約。」"],
    ["ask", "傳來公園活動的時間，說只是先問問，還沒有約定一起去。"],
    ["ask", "回訊說自己也還沒查時間。"],
  ] },
  { key: "notice", actorId: "child-1", role: "child", rows: [
    ["box", "把鞋盒另一邊指成車庫。"], ["materials", "把畫紙推過來。"],
  ] },
  { key: "map", actorId: "child-1", role: "child", rows: [
    ["walk", "指著入口旁的樹問是不是這棵。"], ["draw", "在轉角旁畫一個問號。"], ["draw", "說今天先不看。"],
  ] },
].map(pool => reactionPoolSchema.parse({ id: `nqa3-${pool.key}-response`, entries: [
  ...pool.rows.map(([flag, text], i) => ({ id: `nqa3-${pool.key}-reply-${i}`, kind: "neutral", actorRoles: [pool.role], weight: 2,
    requirements: requirement(pool.key, `nqa3-${flag}`, pool.actorId), text })),
  { id: `nqa3-${pool.key}-none`, kind: "none", actorRoles: [pool.role], weight: 1, text: "這次沒有新的回應。" },
] }));
