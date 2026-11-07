import { eventNodeSchema, reactionPoolSchema, type Condition } from "../domain/schemas.js";

// Immutable A2 authoring manifest. Revisions need another release and ID namespace.
export const NARRATIVE_A2_RELEASE = "narrative-quality-a2-v1";
export const A2_STORIES = [
  { key: "meal", stage: 2, old: "meal-preparation", choices: ["nqa2-simplify", "nqa2-finish"] },
  { key: "park", stage: 5, old: "leaving-playground", choices: ["nqa2-loop", "nqa2-home"] },
  { key: "supplies", stage: 6, old: "shared-ownership", choices: ["nqa2-buy", "nqa2-list"] },
  { key: "rain", stage: 7, old: "rainy-pickup", choices: ["nqa2-wait", "nqa2-covered"] },
  { key: "rest", stage: 10, old: "quiet-time", choices: ["nqa2-read", "nqa2-play"] },
] as const;
export const a2Root = (key: string) => `nqa2-${key}-choice`;
export const a2Reflection = (key: string, choiceId: string) => ["meal", "supplies", "rain"].includes(key)
  ? `nqa2-${key}-after-${choiceId.slice("nqa2-".length)}` : `nqa2-${key}-reflection`;
export const NARRATIVE_A2_REPLACEMENTS: Readonly<Record<string, readonly string[]>> = Object.freeze(Object.fromEntries(
  A2_STORIES.flatMap(story => [[`${story.old}-choice`, [a2Root(story.key)]],
    [`${story.old}-reflection`, [...new Set(story.choices.map(id => a2Reflection(story.key, id)))]]]),
));
const completed = (eventId: string): Condition => ({ kind: "eventCompleted", eventId });
const afterAction = (key: string, flag: string): Condition => ({ kind: "all", conditions: [completed(a2Root(key)), { kind: "flag", flag }] });
const narrative = (text: string) => [{ kind: "narrative" as const, text }];

export const narrativeA2Events = () => [
  eventNodeSchema.parse({ id: a2Root("meal"), ageStageId: "age-stage-2", kind: "choice", mode: "PLAYER_INPUT_REQUIRED", weight: 2,
    title: "菜切一半，桌邊的器具還沒收",
    text: "你在可照看孩子的餐廚空間準備自己的晚餐。一道菜已備好，第二道才切到一半；桌邊還排著稍早用過的器具。離你原訂吃飯的時間不遠，現在要先完成哪邊？",
    actorIds: ["child-1"], locationId: "home", contextTags: ["nqa2-meal"],
    clearFlags: ["nqa2-simplify", "nqa2-finish"], choices: [
      { id: "nqa2-simplify", text: "今天少做一道菜，先空出吃飯的位置", setFlags: ["nqa2-simplify"],
        immediateFollowUpEventIds: [a2Reflection("meal", "nqa2-simplify")],
        storyEntries: narrative("你收起第二道菜的備料，清出桌邊的位置。今天的晚餐少了一道菜，收起的食材之後仍要處理。") },
      { id: "nqa2-finish", text: "把第二道菜做完，桌邊只先挪出一個位置", setFlags: ["nqa2-finish"],
        immediateFollowUpEventIds: [a2Reflection("meal", "nqa2-finish")],
        storyEntries: narrative("你把第二道菜做完，只在桌邊挪出一個位置。坐下時比原訂時間晚了一些，其餘器具還沒收。") },
    ] }),
  eventNodeSchema.parse({ id: a2Reflection("meal", "nqa2-simplify"), ageStageId: "age-stage-2", kind: "routine", mode: "AUTO_ADVANCE", weight: 1,
    title: "少做一道菜後的桌邊", text: "你把收起的第二道菜備料留待之後處理，再把今天用到的器具集中到桌邊，將椅子推回去。", eligibility: afterAction("meal", "nqa2-simplify") }),
  eventNodeSchema.parse({ id: a2Reflection("meal", "nqa2-finish"), ageStageId: "age-stage-2", kind: "routine", mode: "AUTO_ADVANCE", weight: 1,
    title: "兩道菜用餐後的桌邊", text: "兩道菜用餐後，你把做菜與吃飯用過的器具集中到桌邊，將椅子推回去。", eligibility: afterAction("meal", "nqa2-finish") }),
  eventNodeSchema.parse({ id: a2Root("park"), ageStageId: "age-stage-5", kind: "choice", mode: "PLAYER_INPUT_REQUIRED", weight: 2,
    title: "公園出口前，還想再走一圈",
    text: "你與孩子走到公園出口，孩子指著旁邊的小路又往回看。袋子已收好，家裡晚餐還沒開始準備；你還有一小段可用時間，但不夠再玩一輪所有設施。",
    actorIds: ["child-1"], locationId: "park", contextTags: ["nqa2-park"], reactionPoolIds: ["nqa2-park-response"],
    clearFlags: ["nqa2-loop", "nqa2-home"], immediateFollowUpEventIds: [a2Reflection("park", "nqa2-loop")], choices: [
      { id: "nqa2-loop", text: "陪孩子沿小路繞一圈，到出口就回家", setFlags: ["nqa2-loop"],
        storyEntries: narrative("你指著回到出口的小路，陪孩子繞了一圈，再把回家方向指給他看。晚餐要晚一點開始準備。") },
      { id: "nqa2-home", text: "現在往家走，路上一起找剛才看見的紅色車子", setFlags: ["nqa2-home"],
        storyEntries: narrative("你帶著孩子朝回家的路走，指給他看路邊停著的一台紅色車子。公園留在身後。") },
    ] }),
  eventNodeSchema.parse({ id: a2Reflection("park", "nqa2-loop"), ageStageId: "age-stage-5", kind: "routine", mode: "AUTO_ADVANCE", weight: 1,
    title: "外出袋留在門邊", text: "回到家，你把外出袋放在門邊，開始準備晚餐。", eligibility: completed(a2Root("park")) }),
  eventNodeSchema.parse({ id: a2Root("supplies"), ageStageId: "age-stage-6", kind: "choice", mode: "PLAYER_INPUT_REQUIRED", weight: 2,
    title: "出門袋裡只剩最後一包濕紙巾",
    text: "你和孩子在家整理外出袋，發現濕紙巾只剩最後一包，仍夠這次使用。今天原訂只到公園；商店與公園都能步行到達，但多去一站會壓縮玩耍時間。",
    actorIds: ["child-1"], locationId: "home", contextTags: ["nqa2-supplies"],
    clearFlags: ["nqa2-buy", "nqa2-list"], choices: [
      { id: "nqa2-buy", text: "今天先去商店補貨，再到公園短暫走走", setFlags: ["nqa2-buy"],
        immediateFollowUpEventIds: [a2Reflection("supplies", "nqa2-buy")],
        storyEntries: narrative("你帶孩子先到商店補了一包濕紙巾，將多出的一包放進袋子，再往公園走。今天能停留的時間短了一點。") },
      { id: "nqa2-list", text: "照原路去公園，出門前把補貨寫進手機清單", setFlags: ["nqa2-list"],
        immediateFollowUpEventIds: [a2Reflection("supplies", "nqa2-list")],
        storyEntries: [{ kind: "planning", text: "你在手機寫下要補的品項，帶孩子和袋裡剩下的一包出門。這次仍照原路去公園，補貨還沒完成。" }] },
    ] }),
  eventNodeSchema.parse({ id: a2Reflection("supplies", "nqa2-buy"), ageStageId: "age-stage-6", kind: "support", mode: "AUTO_ADVANCE", weight: 1,
    title: "清單上多了已有備用",
    text: "回家後，你在外出袋的清單分出『待補』與『已有備用』兩格，把今天多買的一包記在『已有備用』。清單留在袋內側。",
    eligibility: afterAction("supplies", "nqa2-buy"),
    storyEntries: [{ kind: "planning", text: "你把已補的一包記在袋內清單的『已有備用』格，留下這次實際盤點的記錄。" }] }),
  eventNodeSchema.parse({ id: a2Reflection("supplies", "nqa2-list"), ageStageId: "age-stage-6", kind: "support", mode: "AUTO_ADVANCE", weight: 1,
    title: "清單上仍有待補的一格",
    text: "回家後，你在外出袋的清單分出『待補』與『已有備用』兩格，把尚未補貨的濕紙巾記在『待補』。手機上的補貨待辦仍留著，袋內也有了可查的清單。",
    eligibility: afterAction("supplies", "nqa2-list"),
    storyEntries: [{ kind: "planning", text: "你把尚未補貨的濕紙巾記在袋內清單的『待補』格，補貨待辦沒有被當成已完成。" }] }),
  eventNodeSchema.parse({ id: a2Root("rain"), ageStageId: "age-stage-7", kind: "choice", mode: "PLAYER_INPUT_REQUIRED", weight: 2,
    title: "大雨還在下，襪子已經濕了",
    text: "你已在托育點門內接到孩子，兩人停在有遮蔽的等候區。外頭下著大雨，剛才走來時你的襪子已濕；托育點允許你們再等一會。回家有較長的有遮蔽步行路線，也可先待在這裡整理雨具。",
    actorIds: ["child-1"], locationId: "school", contextTags: ["nqa2-rain"],
    clearFlags: ["nqa2-wait", "nqa2-covered"], choices: [
      { id: "nqa2-wait", text: "留在等候區整理雨具，晚一點再出發", setFlags: ["nqa2-wait"],
        immediateFollowUpEventIds: [a2Reflection("rain", "nqa2-wait")],
        storyEntries: narrative("你和孩子留在等候區，重新整理雨具。時間過了一會，門外仍聽得見雨聲，返家的路還沒走。") },
      { id: "nqa2-covered", text: "整理好雨具，沿有遮蔽的長路慢慢回家", setFlags: ["nqa2-covered"],
        immediateFollowUpEventIds: [a2Reflection("rain", "nqa2-covered")],
        storyEntries: narrative("你整理好雨具，帶孩子沿有遮蔽的路往家走。這一趟繞遠了一些。") },
    ] }),
  eventNodeSchema.parse({ id: a2Reflection("rain", "nqa2-wait"), ageStageId: "age-stage-7", kind: "routine", mode: "AUTO_ADVANCE", weight: 1,
    title: "等候後，再沿長路返家", text: "整理好雨具後，你帶孩子離開等候區，沿有遮蔽的長路返家。沒有等到雨停；進門後，你把濕襪放進待洗籃，將外出袋留在門邊晾放。", eligibility: afterAction("rain", "nqa2-wait") }),
  eventNodeSchema.parse({ id: a2Reflection("rain", "nqa2-covered"), ageStageId: "age-stage-7", kind: "routine", mode: "AUTO_ADVANCE", weight: 1,
    title: "繞過長路，回家收濕襪", text: "沿有遮蔽的長路走回家後，你把濕襪放進待洗籃，將外出袋留在門邊晾放。繞遠的這段路已走完。", eligibility: afterAction("rain", "nqa2-covered") }),
  eventNodeSchema.parse({ id: a2Root("rest"), ageStageId: "age-stage-10", kind: "choice", mode: "PLAYER_INPUT_REQUIRED", weight: 2,
    title: "剛坐到沙發，桌遊盒又推過來",
    text: "你在客廳剛坐下，杯裡的水還沒喝。孩子把熟悉的桌遊盒推到你面前，想現在玩；你原本想坐著翻幾頁書。你們都留在同一個可照看的空間。",
    actorIds: ["child-1"], locationId: "home", contextTags: ["nqa2-rest"], reactionPoolIds: ["nqa2-rest-response"],
    clearFlags: ["nqa2-read", "nqa2-play"], immediateFollowUpEventIds: [a2Reflection("rest", "nqa2-read")], choices: [
      { id: "nqa2-read", text: "先喝水、看兩頁書，再開一局", setFlags: ["nqa2-read"],
        storyEntries: narrative("你說自己先喝水、看兩頁書，喝了一口水，將書打開。桌遊盒暫時留在桌邊，你仍坐在孩子旁邊。") },
      { id: "nqa2-play", text: "現在只玩一局，玩完就把遊戲收回盒子", setFlags: ["nqa2-play"],
        storyEntries: narrative("你說今天先玩一局，打開盒子排好遊戲。想休息的時間先往後挪，孩子是否願意只玩一局還沒說定。") },
    ] }),
  eventNodeSchema.parse({ id: a2Reflection("rest", "nqa2-read"), ageStageId: "age-stage-10", kind: "routine", mode: "AUTO_ADVANCE", weight: 1,
    title: "書與桌遊盒放回原位", text: "那天晚些時候，你把書與桌遊盒各放回原位，杯子留在手邊。", eligibility: completed(a2Root("rest")) }),
];

const responseRequirement = (contextTag: string, flag: string): Condition => ({ kind: "all", conditions: [
  { kind: "contextTag", tag: contextTag }, { kind: "flag", flag }, { kind: "actorAvailable", actorId: "child-1" },
] });
export const narrativeA2Pools = () => [
  reactionPoolSchema.parse({ id: "nqa2-park-response", entries: [
    { id: "nqa2-another-path", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: responseRequirement("nqa2-park", "nqa2-loop"), text: "又指向另一條路。" },
    { id: "nqa2-look-exit", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: responseRequirement("nqa2-park", "nqa2-loop"), text: "跟著看出口。" },
    { id: "nqa2-point-car", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: responseRequirement("nqa2-park", "nqa2-home"), text: "停下來指著車子。" },
    { id: "nqa2-reach-park", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: responseRequirement("nqa2-park", "nqa2-home"), text: "還往公園方向伸手。" },
    { id: "nqa2-park-none", kind: "none", actorRoles: ["child"], weight: 1, text: "這次沒有新的回應。" },
  ] }),
  reactionPoolSchema.parse({ id: "nqa2-rest-response", entries: [
    { id: "nqa2-how-long", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: responseRequirement("nqa2-rest", "nqa2-read"), text: "問：「兩頁是多久？」" },
    { id: "nqa2-other-toy", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: responseRequirement("nqa2-rest", "nqa2-read"), text: "拿另一個玩具坐到旁邊。" },
    { id: "nqa2-another-game", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: responseRequirement("nqa2-rest", "nqa2-play"), text: "說想再玩一局。" },
    { id: "nqa2-first-piece", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: responseRequirement("nqa2-rest", "nqa2-play"), text: "開始擺第一個配件。" },
    { id: "nqa2-rest-none", kind: "none", actorRoles: ["child"], weight: 1, text: "這次沒有新的回應。" },
  ] }),
];
