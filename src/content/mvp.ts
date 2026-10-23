import type { z } from "zod";
import { AGE_STAGE_MONTHS, type ContentPack, type eventNodeSchema } from "../domain/schemas.js";
import { parseContentPack } from "../domain/content-validation.js";
import { MVP_TOPICS } from "./mvp-topics.js";

type Actor = ContentPack["actors"][number];

const actor = (id: string, role: Actor["role"], displayName: string, availability: number): Actor => ({
  id, role, displayName, availability, initiative: 0.5, workflowOwnership: 0.5,
  reliability: 0.6, boundaryRespect: 0.7,
});

const defaultFamilyActors = [
  actor("child-1", "child", "孩子", 1),
  actor("caregiver-2", "partner", "共同照顧者", 0.6),
  actor("support-1", "grandparent", "支持家人", 0.5),
];

// Pass createFamilyRun(...).actors to retain the seeded family's participation.
// Every call returns an independently parsed, mutable content pack.
export const createMvpContent = (familyActors: readonly Actor[] = defaultFamilyActors): ContentPack => {
  const events: z.input<typeof eventNodeSchema>[] = [];
  const stageEntries: string[][] = [];
  MVP_TOPICS.forEach((scene, index) => {
    const ageStageId = `age-stage-${index + 1}`;
    const id = (suffix: string) => `${scene.slug}-${suffix}`;
    const cardId = `${scene.slug}-card`;
    const chain = scene.chain !== undefined;
    const resultCard = { knowledgeCardIds: [cardId] };
    const scheduled = (suffix: string) => chain
      ? [{ eventId: id(suffix), delayTurns: 1, priority: 10 }] : [];
    const planningText = `你記住、安排並追蹤了「${scene.title}」的後續工作。`;
    events.push({
      id: id("choice"), ageStageId, kind: "choice", mode: "PLAYER_INPUT_REQUIRED",
      title: scene.title, text: scene.text, locationId: scene.location,
      contextTags: [scene.slug, "everyday-care"], weight: 2,
      familyLifeDirectionWeights: scene.directionWeights,
      actorIds: familyActors.map((person) => person.id).concat(
        scene.location === "school" ? ["teacher-1"] : scene.location === "work" ? ["colleague-1"] :
          scene.location === "park" ? ["stranger-1"] : []),
      reactionPoolIds: ["everyday-responses"],
      immediateFollowUpEventIds: [id("reflection")],
      choices: [
        {
          id: "coordinate", text: scene.plan, ...resultCard,
          planningLoadDelta: 1, resourceDeltas: { timeFlexibility: -2, energy: -1 },
          tendencyDeltas: { sharedCare: 1 }, scheduledFollowUps: scheduled("support"),
          storyEntries: [{ kind: "planning", text: `你為「${scene.title}」整理了可協調的工作，支持是否可用仍需確認。` }],
        },
        {
          id: "carry", text: scene.carry, ...resultCard,
          planningLoadDelta: 3, resourceDeltas: { energy: -4, timeFlexibility: 1 },
          tendencyDeltas: { responsibility: 1 }, scheduledFollowUps: scheduled("strain"),
          storyEntries: [{ kind: "planning", text: planningText }],
        },
        {
          id: "handoff", text: "詢問另一位照顧者能否完整接手這一段", ...resultCard,
          requirements: { kind: "actorAvailable", actorId: "caregiver-2" },
          planningLoadDelta: 1, resourceDeltas: { timeFlexibility: -1 },
          scheduledFollowUps: scheduled("support"),
          storyEntries: [{ kind: "planning", text: "你提出完整交接的需求，包含提醒、追蹤與收尾，等待一起確認。" }],
        },
        {
          id: "ask-family", text: "與支持家人確認這次可支援的範圍", ...resultCard,
          requirements: { kind: "actorAvailable", actorId: "support-1" },
          planningLoadDelta: 1, resourceDeltas: { timeFlexibility: -1 },
          scheduledFollowUps: scheduled("support"),
          storyEntries: [{ kind: "planning", text: "你與支持家人討論可用的時段，也留下對方無法接手時的調整空間。" }],
        },
      ],
    });
    events.push({
      id: id("reflection"), ageStageId, kind: scene.reflectionKind ?? "routine",
      mode: "AUTO_ADVANCE", title: `${scene.title}之後`, text: scene.reflection,
      weight: 1, knowledgeCardIds: [cardId],
      eligibility: { kind: "eventCompleted", eventId: id("choice") },
      ...scene.reflectionEffects,
    });
    stageEntries.push([id("choice")]);
    if (!chain) return;

    events.push({
      id: id("support"), ageStageId, kind: "support", mode: "AUTO_ADVANCE",
      title: "把安排變成可用的支持",
      text: scene.chain === "night"
        ? "過了那一晚，你再次確認可用的協助，也把能延後的用品整理挪開。支持先從減少一段工作開始，不必等到有人能接下全部。"
        : "下一次交接前，你和老師確認了聯絡方式，也把可延後的工作另作安排。有人接住一段訊息追蹤，並不表示每個困難都消失了。",
      weight: 1, eligibility: { kind: "eventCompleted", eventId: id("choice") },
      planningLoadDelta: -1, resourceDeltas: { support: 4 },
      relationshipMemories: [{ id: id("support-memory"), category: "support", text: "你確認了一段可用的支持，也減少了需要獨自追蹤的事。" }],
      immediateFollowUpEventIds: [id("reconnect")],
    }, {
      id: id("strain"), ageStageId, kind: "environment", mode: "AUTO_ADVANCE",
      title: "又一個需要記住的提醒",
      text: scene.chain === "night"
        ? "到了下一段照顧時間，你才發現用品還沒整理。睡得零碎加上接連的提醒，讓你在交接時說得比原先想的急。"
        : "下一次接送又碰上工作訊息，用品和回覆都等著確認。匆忙中，你與孩子的對話中斷了，彼此都有話沒說完。",
      weight: 1, eligibility: { kind: "planningLoadAtLeast", value: 3 },
      resourceDeltas: { energy: -3 },
      relationshipMemories: [{ id: id("rushed-memory"), category: "conflict", text: "那次匆忙的交接，留下了還沒說完的話。" }],
      immediateFollowUpEventIds: [id("reconnect")],
    }, {
      id: id("reconnect"), ageStageId, kind: "choice", mode: "PLAYER_INPUT_REQUIRED",
      title: "找回可以說話的空間",
      text: "事情暫時告一段落，你回想剛才的交接。有些話可以現在慢慢說，也可以先留下一個約定，等彼此有力氣再接回來。",
      weight: 1, eligibility: { kind: "any", conditions: [
        { kind: "eventCompleted", eventId: id("support") },
        { kind: "eventCompleted", eventId: id("strain") },
      ] },
      choices: [
        { id: "talk", text: "說出剛才的感受，也聽聽對方", ...resultCard,
          planningLoadDelta: -1, resourceDeltas: { timeFlexibility: -1 },
          storyEntries: [{ kind: "repair", text: "你留了一段時間，把匆忙中沒能說清楚的話重新接回來。" }] },
        { id: "pause", text: "先留一點休息時間，約定稍後再談", ...resultCard,
          planningLoadDelta: -1, resourceDeltas: { energy: 2 },
          storyEntries: [{ kind: "repair", text: "你承認現在需要休息，也留下了之後繼續對話的約定。" }] },
      ],
      immediateFollowUpEventIds: [id("repair")],
    }, {
      id: id("repair"), ageStageId, kind: "repair", mode: "AUTO_ADVANCE",
      title: "留下一個重新連上的起點",
      text: "你讓對方知道剛才的匆忙不等於不在意，也確認接下來可以怎麼聯絡。問題還能再談，這次重新靠近的嘗試先留在你們的生活裡。",
      weight: 1, eligibility: { kind: "eventCompleted", eventId: id("reconnect") },
      resourceDeltas: { connection: 3 },
      relationshipMemories: [{ id: id("repair-memory"), category: "repair", text: "你們留下一個重新對話的起點，並確認下一次的聯絡方式。" }],
    });
  });
  events.push({ id: "mvp-breathing-space", ageStageId: "age-stage-1", kind: "routine", mode: "AUTO_ADVANCE",
    title: "讓日常留一點空白", text: "這一段暫時沒有新的安排。你讓生活留一點空白，等待下一次交接，或帶著今天的經驗走向下一個階段。", weight: 1 });

  return parseContentPack({
    schemaVersion: 1, entryEventIds: [...stageEntries.flat(), "mvp-breathing-space"],
    fallbackEventId: "mvp-breathing-space", requiredEventIds: events.map((event) => event.id),
    ageStages: AGE_STAGE_MONTHS.map((childAgeMonths, order) => ({
      id: `age-stage-${order + 1}`, order, childAgeMonths, entryEventIds: stageEntries[order],
    })), events,
    // Include known family IDs for conditional-choice references even when absent in this run.
    actors: [...defaultFamilyActors.filter((person) => !familyActors.some((other) => other.id === person.id)),
      ...familyActors, actor("teacher-1", "teacher", "老師", 0.8),
      actor("colleague-1", "colleague", "同事", 0.7), actor("stranger-1", "stranger", "路人", 0.5)],
    reactionPools: [{ id: "everyday-responses", entries: [
      { id: "understanding", kind: "understanding", text: "對方表示聽見了你的安排，也說出自己能參與的範圍。", weight: 3,
        actorRoles: ["partner", "grandparent", "teacher", "colleague"], followUpEventIds: [],
        relationshipMemories: [{ id: "heard-the-plan", category: "connection", text: "你們交換了各自能承接的範圍。" }] },
      { id: "different-expectation", kind: "criticism", text: "對方提出不同期待。你聽見了意見，仍需要按眼前的條件安排。", weight: 1,
        actorRoles: ["partner", "grandparent", "teacher", "colleague", "stranger"], followUpEventIds: [],
        weightModifiers: [{ condition: { kind: "planningLoadAtLeast", value: 4 }, multiplier: 1.2 }] },
      { id: "child-response", kind: "neutral", text: "孩子用聲音和動作回應，今天的節奏還需要慢慢磨合。", weight: 2,
        actorRoles: ["child"], followUpEventIds: [] },
      { id: "no-comment", kind: "none", text: "這一次沒有收到新的回應，安排先留待之後確認。", weight: 1,
        actorRoles: ["child"], followUpEventIds: [] },
    ] }],
    knowledgeCards: MVP_TOPICS.map((scene, index) => ({
      id: `${scene.slug}-card`, topic: scene.topic,
      ageRange: { minMonths: AGE_STAGE_MONTHS[index], maxMonths: AGE_STAGE_MONTHS[index] },
      summary: `【待專業與編輯審閱草稿】${scene.summary}`,
      practicalTips: [scene.tip], reviewStatus: "draft",
      medicalDisclaimer: "本卡為生活情境草稿，不提供診斷或醫療、安全操作指引；健康、飲食、睡眠與安全疑問請向合適的專業人員確認。",
    })),
  });
};
