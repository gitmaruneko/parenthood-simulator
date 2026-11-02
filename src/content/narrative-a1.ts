import { eventNodeSchema, reactionPoolSchema, type Condition } from "../domain/schemas.js";

// Immutable A1 authoring manifest. New revisions must use another release/ID namespace.
export const NARRATIVE_RELEASE = "narrative-quality-a1-v1";
export const NIGHT = { root: "nqa1-night-choice", reflection: "nqa1-night-reflection", support: "nqa1-night-support", strain: "nqa1-night-strain", later: "nqa1-night-reorder", close: "nqa1-night-close" } as const;
export const DOOR = { root: "nqa1-door-choice", reflection: "nqa1-door-reflection", support: "nqa1-door-support", strain: "nqa1-door-strain", later: "nqa1-door-repair", close: "nqa1-door-close" } as const;
export const completed = (eventId: string): Condition => ({ kind: "eventCompleted", eventId });
export const actionFlag = (flag: string): Condition => ({ kind: "flag", flag });
const branch = (root: string, flag: string): Condition => ({ kind: "all", conditions: [completed(root), actionFlag(flag)] });
const afterBranch = (chain: typeof NIGHT | typeof DOOR): Condition => ({ kind: "any", conditions: [completed(chain.support), completed(chain.strain)] });
const narrative = (text: string) => [{ kind: "narrative" as const, text }];
const schedule = (eventId: string) => [{ eventId, delayTurns: 1, priority: 10 }];

export const narrativeA1Events = () => [
  eventNodeSchema.parse({ id: NIGHT.root, ageStageId: "age-stage-1", kind: "choice", mode: "PLAYER_INPUT_REQUIRED",
    title: "小籃裡只剩一條乾淨圍兜",
    text: "半夜，你在房內陪著醒來的孩子。乾淨小籃裡只剩一條圍兜，剛收回的衣物堆在旁邊。眼前夠用，但每次都要翻找；你也很想坐下。",
    actorIds: ["child-1"], locationId: "home", contextTags: ["nqa1-night"], weight: 2,
    clearFlags: ["nqa1-night-stock", "nqa1-night-sit"], immediateFollowUpEventIds: [NIGHT.reflection],
    choices: [
      { id: "nqa1-stock", text: "從衣堆挑出今晚會用的幾件，放進手邊的小籃", setFlags: ["nqa1-night-stock"], scheduledFollowUps: schedule(NIGHT.support),
        storyEntries: narrative("你挑出幾件乾淨用品放進小籃，剩下的衣物仍堆在旁邊。") },
      { id: "nqa1-sit", text: "先把那條圍兜放到手邊，坐回孩子旁邊", setFlags: ["nqa1-night-sit"], scheduledFollowUps: schedule(NIGHT.strain),
        storyEntries: narrative("你把眼前那條圍兜留在手邊，坐回孩子旁邊，衣堆先放著。") },
    ] }),
  eventNodeSchema.parse({ id: NIGHT.reflection, ageStageId: "age-stage-1", kind: "routine", mode: "AUTO_ADVANCE", weight: 1,
    title: "天亮伸手拿起的一件", text: "天亮時，小籃與那堆衣物還在房內。你伸手拿起今天要用的一件。", eligibility: completed(NIGHT.root) }),
  eventNodeSchema.parse({ id: NIGHT.support, ageStageId: "age-stage-1", kind: "support", mode: "AUTO_ADVANCE", weight: 1,
    title: "小籃靠近了坐下的位置", text: "下一段照顧時間，你把昨夜整理的小籃放到坐下就能拿到的位置。",
    eligibility: branch(NIGHT.root, "nqa1-night-stock"), immediateFollowUpEventIds: [NIGHT.later] }),
  eventNodeSchema.parse({ id: NIGHT.strain, ageStageId: "age-stage-1", kind: "environment", mode: "AUTO_ADVANCE", weight: 1,
    title: "又翻開那堆衣物", text: "下一段照顧時間，你又從衣堆翻出要用的一件。多找了一會，孩子還在你身邊。",
    eligibility: branch(NIGHT.root, "nqa1-night-sit"), immediateFollowUpEventIds: [NIGHT.later] }),
  eventNodeSchema.parse({ id: NIGHT.later, ageStageId: "age-stage-1", kind: "choice", mode: "PLAYER_INPUT_REQUIRED", weight: 1,
    title: "小籃放哪裡，下次才不用翻？", text: "你在房裡拿著小籃。昨夜的圍兜已經用過，衣物還有幾件散在旁邊；你想替接下來找東西省一點手忙腳亂。先前有沒有整理整堆衣物，都可以從眼前這一小籃開始。",
    actorIds: ["child-1"], locationId: "home", eligibility: afterBranch(NIGHT), immediateFollowUpEventIds: [NIGHT.close],
    choices: [
      { id: "nqa1-sort", text: "把最常找的用品放進小籃最前面", storyEntries: narrative("你把最常找的幾件移到小籃前側，其他衣物仍留在原處。") },
      { id: "nqa1-move", text: "不重排內容，把小籃移到坐下時拿得到的位置", storyEntries: narrative("你保留籃內原來的放法，把小籃移到坐下時拿得到的位置。") },
    ] }),
  eventNodeSchema.parse({ id: NIGHT.close, ageStageId: "age-stage-1", kind: "routine", mode: "AUTO_ADVANCE", weight: 1,
    title: "小籃留在房裡", text: "你把小籃放穩，回到孩子旁邊。", eligibility: completed(NIGHT.later) }),
  eventNodeSchema.parse({ id: DOOR.root, ageStageId: "age-stage-8", kind: "choice", mode: "PLAYER_INPUT_REQUIRED", weight: 2,
    title: "教室門口，那句「快點」還停在嘴邊",
    text: "教室門口又來了幾個家庭。孩子停在你身邊，你已脫口說了一句「快點」，說完才發現他一直看著手裡那張折了角的畫。老師正在另一邊接待，你們仍站在門外。門口越來越擠，你還沒聽見孩子要說什麼。",
    actorIds: ["child-1", "teacher-1"], locationId: "school", contextTags: ["nqa1-door"],
    familyLifeDirectionWeights: { "parent-child-time": 1.25 },
    clearFlags: ["nqa1-door-child", "nqa1-door-teacher"], reactionPoolIds: ["nqa1-door-response"], immediateFollowUpEventIds: [DOOR.reflection],
    choices: [
      { id: "nqa1-ask-child", text: "移到門邊空處，先問孩子想把畫給誰看", setFlags: ["nqa1-door-child"], scheduledFollowUps: schedule(DOOR.support),
        storyEntries: narrative("你和孩子移到門邊空處，問他這張畫想給誰看。你還沒有把孩子交給老師。") },
      { id: "nqa1-ask-teacher", text: "陪孩子等老師空下來，先向老師提出一起看這張畫的請求", setFlags: ["nqa1-door-teacher"], scheduledFollowUps: schedule(DOOR.strain),
        storyEntries: narrative("你陪孩子等了一會，向老師提出想一起看畫的請求。請求已說出口，還沒確認老師何時有空。") },
    ] }),
  eventNodeSchema.parse({ id: DOOR.reflection, ageStageId: "age-stage-8", kind: "routine", mode: "AUTO_ADVANCE", weight: 1,
    title: "想起那張畫的折角", text: "下一次翻外出袋時，你想起那張畫的折角，也想起門口自己那句「快點」。", eligibility: completed(DOOR.root) }),
  eventNodeSchema.parse({ id: DOOR.support, ageStageId: "age-stage-8", kind: "support", mode: "AUTO_ADVANCE", weight: 1,
    title: "聯絡方式留在袋子內側", text: "你照班級通知寫下聯絡管道，放進袋內側。下次需要詢問時，可以先從這裡找。",
    eligibility: branch(DOOR.root, "nqa1-door-child"), immediateFollowUpEventIds: [DOOR.later] }),
  eventNodeSchema.parse({ id: DOOR.strain, ageStageId: "age-stage-8", kind: "environment", mode: "AUTO_ADVANCE", weight: 1,
    title: "畫上的折角又讓你停下", text: "下一次整理外出袋，你想到那張折角的畫，還記得門口自己那句「快點」。",
    eligibility: branch(DOOR.root, "nqa1-door-teacher"), immediateFollowUpEventIds: [DOOR.later] }),
  eventNodeSchema.parse({ id: DOOR.later, ageStageId: "age-stage-8", kind: "choice", mode: "PLAYER_INPUT_REQUIRED", weight: 1,
    title: "那句「快點」，現在想換個說法",
    text: "回家後，你與孩子在客廳，桌邊留有紙筆。你想起教室門口自己那句「快點」；那時還沒問清楚，他拿畫是想做什麼。孩子現在願不願意談，仍由他決定。",
    actorIds: ["child-1"], locationId: "home", contextTags: ["nqa1-door-repair"], eligibility: afterBranch(DOOR),
    clearFlags: ["nqa1-door-apologize", "nqa1-door-draw"], reactionPoolIds: ["nqa1-door-repair-response"], immediateFollowUpEventIds: [DOOR.close],
    choices: [
      { id: "nqa1-apologize", text: "蹲到孩子身邊，說「我剛才太急，沒有先聽你說」", setFlags: ["nqa1-door-apologize"],
        storyEntries: [{ kind: "repair", text: "你蹲到孩子身邊，把「剛才太急，沒有先聽你說」說完整，停下來等他的反應。" }] },
      { id: "nqa1-draw", text: "畫出教室門口，說「我剛才只顧著催，你想讓我看哪裡？」", setFlags: ["nqa1-door-draw"],
        storyEntries: [{ kind: "repair", text: "你畫出門口，說自己剛才只顧著催，問他想讓你看哪裡。紙先留在兩人中間。" }] },
    ] }),
  eventNodeSchema.parse({ id: DOOR.close, ageStageId: "age-stage-8", kind: "routine", mode: "AUTO_ADVANCE", weight: 1,
    title: "畫紙留在桌邊", text: "你收好自己的紙筆，把桌邊的位置留出來，這一段先停在這裡。", eligibility: completed(DOOR.later) }),
];

const response = (id: string, actorId: string, tag: string, flag: string, text: string) => ({
  id: `nqa1-${id}`, kind: "neutral", actorRoles: [actorId === "teacher-1" ? "teacher" : "child"], weight: 1, text,
  requirements: { kind: "all", conditions: [{ kind: "actorAvailable", actorId }, { kind: "contextTag", tag }, actionFlag(flag)] },
});
const none = { id: "nqa1-none", kind: "none", actorRoles: ["child"], weight: 1, text: "這次沒有新的回應。" };
export const narrativeA1Pools = () => [
  reactionPoolSchema.parse({ id: "nqa1-door-response", entries: [
    response("show-teacher", "child-1", "nqa1-door", "nqa1-door-child", "說想把畫給老師看。"),
    response("hold-drawing", "child-1", "nqa1-door", "nqa1-door-child", "把畫抱緊，暫時不說。"),
    response("teacher-wait", "teacher-1", "nqa1-door", "nqa1-door-teacher", "說：「我先接這一家，等一下來看。」"),
    response("teacher-basket", "teacher-1", "nqa1-door", "nqa1-door-teacher", "說今天可以先放作品籃，還沒走過來。"), none,
  ] }),
  reactionPoolSchema.parse({ id: "nqa1-door-repair-response", entries: [
    response("explain", "child-1", "nqa1-door-repair", "nqa1-door-apologize", "說：「我只是想給老師看。」"),
    response("not-now", "child-1", "nqa1-door-repair", "nqa1-door-apologize", "說現在不想講。"),
    response("draw-square", "child-1", "nqa1-door-repair", "nqa1-door-draw", "在門旁畫一個小方塊。"),
    response("push-paper", "child-1", "nqa1-door-repair", "nqa1-door-draw", "把紙推開，說想玩別的。"), none,
  ] }),
];
