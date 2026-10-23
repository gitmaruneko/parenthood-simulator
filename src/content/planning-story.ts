import { eventNodeSchema, type EventNode } from "../domain/schemas.js";

// A small, stage-local story for the planning-load mechanics. Full MVP content
// can use these same effects without importing rules into the presentation layer.
export const createPlanningStory = (ageStageId: string): EventNode[] => {
  const id = (name: string) => `${ageStageId}-${name}`;
  const responsibilities = [
    { id: "pickup", text: "記住接送時間，安排交接並確認抵達", memory: "你記住時間、協調接送，最後確認孩子已經抵達。" },
    { id: "meals", text: "安排餐點，確認食材並收尾", memory: "你記住家裡需要什麼、備好餐點，也處理了收尾。" },
    { id: "school-notices", text: "讀完學校通知，安排回覆並追蹤", memory: "你把通知的期限記下來，協調安排後追蹤回覆。" },
    { id: "household", text: "盤點家務，分配時間並確認完成", memory: "你記住待辦、安排家務，最後逐一確認完成。" },
  ];
  const nodes: unknown[] = [
    {
      id: id("planning"), ageStageId, kind: "choice", mode: "PLAYER_INPUT_REQUIRED",
      title: "還有那些要記住的事", text: "完成一件事之前，往往還得先記住、安排、協調，再追蹤到收尾。今天你接起哪一段？",
      weight: 1, repeatable: true, cooldownTurns: 1, terminationGuard: { kind: "maxVisits", count: 1 },
      eligibility: { kind: "all", conditions: [
        { kind: "planningLoadAtMost", value: 2 },
        { kind: "not", condition: { kind: "flag", flag: "shared-plan" } },
      ] },
      choices: responsibilities.map((task) => ({
        id: task.id, text: task.text, planningLoadDelta: 2,
        tendencyDeltas: { responsibility: 1 }, setFlags: ["carrying-alone"],
        relationshipMemories: [{ id: id(task.id), category: "care", text: task.memory }],
        storyEntries: [{ kind: "planning", text: task.memory }],
        immediateFollowUpEventIds: [id("fatigue")],
      })),
    },
    {
      id: id("fatigue"), ageStageId, kind: "routine", mode: "AUTO_ADVANCE",
      title: "交接時的一口氣", text: "又一次要交接時，你發現自己連下一個提醒都還得先想好，語氣也急了一點。",
      weight: 1, eligibility: { kind: "planningLoadAtLeast", value: 4 },
      resourceDeltas: { energy: -8 }, setFlags: ["strained"],
      relationshipMemories: [{ id: id("rushed-handoff"), category: "conflict", text: "那次交接太趕，彼此都沒能好好說完。" }],
      storyEntries: [{ kind: "planning", text: "一直記住和追蹤安排，讓交接時剩下的力氣變少了。" }],
      immediateFollowUpEventIds: [id("support")],
    },
    {
      id: id("support"), ageStageId, kind: "support", mode: "AUTO_ADVANCE",
      title: "有人接住一小段", text: "你把還要記住的事說出來。身邊的支持者陪你整理，先接下一段提醒與確認。",
      weight: 1, eligibility: { kind: "all", conditions: [
        { kind: "planningLoadAtLeast", value: 4 }, { kind: "flag", flag: "strained" },
      ] },
      planningLoadDelta: -1, resourceDeltas: { support: 5 }, setFlags: ["accepted-support"],
      relationshipMemories: [{ id: id("help-with-reminders"), category: "support", text: "有人接下提醒和確認，讓支持不只停在口頭。" }],
      immediateFollowUpEventIds: [id("coordinate")],
    },
    {
      id: id("coordinate"), ageStageId, kind: "choice", mode: "PLAYER_INPUT_REQUIRED",
      title: "重新分配接下來的事", text: "你和支持者把工作從記住到收尾攤開來，也替休息留一點空間。對方可以是伴侶、親友或其他支持你的人。",
      weight: 1, eligibility: { kind: "flag", flag: "accepted-support" },
      choices: [
        {
          id: "rest", text: "先放下可延後的事，留一段休息時間", planningLoadDelta: -2,
          resourceDeltas: { energy: 8 }, tendencyDeltas: { selfCare: 1 },
          setFlags: ["repair-ready"], clearFlags: ["carrying-alone"],
          relationshipMemories: [{ id: id("rest-agreed"), category: "support", text: "你們同意延後一些安排，讓休息不必等全部做完。" }],
          storyEntries: [{ kind: "support", text: "今天有些事可以等等；你先休息了一會。" }],
        },
        {
          id: "delegate", text: "約定由支持者完整接手一段工作", planningLoadDelta: -2,
          tendencyDeltas: { sharedCare: 1, responsibility: -1 },
          setFlags: ["repair-ready", "workflow-delegated"], clearFlags: ["carrying-alone"],
          relationshipMemories: [{ id: id("workflow-handed-over"), category: "support", text: "對方接手記住、安排、協調、追蹤與收尾，你不必逐項提醒。" }],
          storyEntries: [{ kind: "planning", text: "工作有了新的負責人，連提醒與追蹤也一起交接。" }],
        },
      ],
      scheduledFollowUps: [{ eventId: id("repair"), delayTurns: 1 }],
    },
    {
      id: id("repair"), ageStageId, kind: "repair", mode: "AUTO_ADVANCE",
      title: "把剛才沒說完的話接回來", text: "你們重新談起那次匆忙的交接，承認彼此累的地方，再約好下一次如何確認安排。",
      weight: 1, eligibility: { kind: "all", conditions: [
        { kind: "flag", flag: "repair-ready" },
        { kind: "relationshipMemory", category: "conflict", memoryId: id("rushed-handoff"), withinTurns: 6 },
      ] },
      planningLoadDelta: -1, resourceDeltas: { connection: 3 },
      clearFlags: ["strained", "repair-ready"], setFlags: ["shared-plan"],
      relationshipMemories: [{ id: id("checked-in-again"), category: "repair", text: "你們把交接時沒說完的話接回來，約好重新確認分工。" }],
    },
  ];
  return nodes.map((node) => eventNodeSchema.parse(node));
};
