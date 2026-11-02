import { eventNodeSchema, reactionPoolSchema } from "../domain/schemas.js";

export const TOY_CAR_ROOT = "toy-car-story-choice";
export const TOY_CAR_CHAIN = [TOY_CAR_ROOT, "toy-car-story-revisit", "toy-car-story-listen", "toy-car-story-close"] as const;
const child = { kind: "actorAvailable" as const, actorId: "child-1" };
const flag = (name: string) => ({ kind: "flag" as const, flag: name });
const narrative = (text: string) => [{ kind: "narrative" as const, text }];

export const toyCarEvents = () => [
  eventNodeSchema.parse({ id: TOY_CAR_ROOT, ageStageId: "age-stage-8", kind: "choice", mode: "PLAYER_INPUT_REQUIRED",
    title: "搶回來的那台小車", text: "孩子拿著小車說起今天和別人都想玩的那一台。你沒在現場，桌上剛好還有另一台玩具車。",
    journalContext: { text: "孩子拿著小車說起今天和別人都想玩的那一台。你沒在現場，桌上剛好還有另一台玩具車。" },
    actorIds: ["child-1"], locationId: "home", contextTags: ["toy-car-story"], weight: 2,
    familyLifeDirectionWeights: { "parent-child-time": 1.15 },
    clearFlags: ["toy-car-enact", "toy-car-ask", "toy-car-acknowledge"],
    scheduledFollowUps: [{ eventId: TOY_CAR_CHAIN[1], delayTurns: 1, priority: 10 }],
    reactionPoolIds: ["toy-car-first-response"], choices: [
      { id: "enact", text: "用玩具演一遍，讓孩子改正你的猜想", setFlags: ["toy-car-enact"],
        storyEntries: narrative("你把兩台小車放到桌邊，先用自己的那台演出猜想，把不知道的部分留給他說。你還沒有判定事情是怎麼發生的。") },
      { id: "ask", text: "只問他最想讓你知道的一句話", setFlags: ["toy-car-ask"],
        storyEntries: narrative("你只問他最想讓你知道哪一句，沒有替沒看見的現場先下結論。") },
      { id: "acknowledge", text: "說清楚自己沒有看見現場，不替誰判輸贏", setFlags: ["toy-car-acknowledge"],
        storyEntries: narrative("你說自己沒有看見那一刻，不替任何一個孩子猜理由。") },
    ] }),
  eventNodeSchema.parse({ id: TOY_CAR_CHAIN[1], ageStageId: "age-stage-8", kind: "routine", mode: "AUTO_ADVANCE",
    title: "小車故事還沒說完", text: "你想到自己剛才多想直接給出答案。回想那段小車故事，你想把不知道的那一段重新留出來。",
    eligibility: { kind: "eventCompleted", eventId: TOY_CAR_ROOT }, weight: 1,
    immediateFollowUpEventIds: [TOY_CAR_CHAIN[2]] }),
  eventNodeSchema.parse({ id: TOY_CAR_CHAIN[2], ageStageId: "age-stage-8", kind: "choice", mode: "PLAYER_INPUT_REQUIRED",
    title: "把沒聽懂的部分接回來", text: "有些事情還沒有聽明白。你可以再邀他補充，也可以先說清楚自己沒有看見現場。",
    eligibility: { kind: "eventCompleted", eventId: TOY_CAR_CHAIN[1] }, weight: 1,
    actorIds: ["child-1"], locationId: "home", contextTags: ["toy-car-repair"],
    clearFlags: ["toy-car-invite", "toy-car-clarify"], reactionPoolIds: ["toy-car-later-response"],
    immediateFollowUpEventIds: [TOY_CAR_CHAIN[3]], choices: [
      { id: "invite", text: "邀他補充你剛才沒聽懂的那一段", setFlags: ["toy-car-invite"],
        storyEntries: [{ kind: "repair", text: "你問「你最想讓我知道哪一段」，不替另一個孩子猜理由。這次的邀請已說出口，是否繼續說由孩子決定。" }] },
      { id: "clarify", text: "說清楚自己沒有看見現場，不替誰先下結論", setFlags: ["toy-car-clarify"],
        storyEntries: [{ kind: "repair", text: "你重新說明自己不知道現場發生了什麼，把想立刻判斷的話收回。你沒有替孩子決定是否繼續談。" }] },
    ] }),
  eventNodeSchema.parse({ id: TOY_CAR_CHAIN[3], ageStageId: "age-stage-8", kind: "routine", mode: "AUTO_ADVANCE",
    title: "留一個可以再說的位置", text: "你把自己沒看見的部分留作不知道。這一段先停在這裡，不用現在就替故事判輸贏。",
    eligibility: { kind: "eventCompleted", eventId: TOY_CAR_CHAIN[2] }, weight: 1 }),
];

export const toyCarPools = () => [
  reactionPoolSchema.parse({ id: "toy-car-first-response", entries: [
    { id: "correct-direction", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: { kind: "all", conditions: [child, flag("toy-car-enact")] },
      text: "把你的那台車轉了個方向，說：「不是這邊，他是從那裡來的。」" },
    { id: "one-sentence", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: { kind: "all", conditions: [child, flag("toy-car-ask")] }, text: "指著車輪說：「我只是想讓他看這個。」" },
    { id: "keep-question", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: { kind: "all", conditions: [child, flag("toy-car-acknowledge")] }, text: "把小車拿近一點，問你還要不要看。" },
    { id: "not-now", kind: "neutral", actorRoles: ["child"], weight: 1, text: "抱著小車說現在不想講。" },
    { id: "none", kind: "none", actorRoles: ["child"], weight: 1, text: "這次沒有新的回應。" },
  ] }),
  reactionPoolSchema.parse({ id: "toy-car-later-response", entries: [
    { id: "wheel", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: { kind: "all", conditions: [child, flag("toy-car-invite")] }, text: "指著車輪說：「我本來只是想讓他看這裡。」" },
    { id: "leave-it", kind: "neutral", actorRoles: ["child"], weight: 2,
      requirements: { kind: "all", conditions: [child, flag("toy-car-clarify")] }, text: "把小車轉了一圈，說這件事先放著。" },
    { id: "not-now", kind: "neutral", actorRoles: ["child"], weight: 1, text: "說現在想玩，不想再說剛才的事。" },
    { id: "none", kind: "none", actorRoles: ["child"], weight: 1, text: "這次沒有新的回應。" },
  ] }),
];
