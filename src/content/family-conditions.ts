import { familyConditionCatalogueSchema, type FamilyCondition } from "../domain/family-conditions.js";

// Fictional narrative context, not statistics or predictions about real families.
export const FAMILY_CONDITIONS: readonly FamilyCondition[] = familyConditionCatalogueSchema.parse([
  {
    dimension: "householdComposition", value: "singleCaregiver", conditionId: "household-single",
    title: "單一照顧者家庭", neutralSummary: "你是家中主要安排照顧的人，支持者也可能住在別處。",
    careImpacts: ["接送與備餐可能需要事先安排備援。"],
    supportContext: "可與不住在一起的家人或支持者協調可接手的時段。", sourceReferences: [], reviewStatus: "draft",
  },
  {
    dimension: "householdComposition", value: "twoCaregivers", conditionId: "household-two",
    title: "雙照顧者家庭", neutralSummary: "家中有另一位照顧者，實際參與仍需要協調。",
    careImpacts: ["接送、備餐與工作時間可能需要一起對照。"],
    supportContext: "同住不代表隨時能接手，可先確認彼此可用的時段。", sourceReferences: [], reviewStatus: "draft",
  },
  {
    dimension: "householdComposition", value: "multigenerational", conditionId: "household-multigenerational",
    title: "多代家庭", neutralSummary: "不同世代一起生活，作息與照顧期待可能需要協調。",
    careImpacts: ["備餐與照顧交接可能需要確認每個人的習慣和界線。"],
    supportContext: "家人可提供不同支持，也需要保留各自休息的空間。", sourceReferences: [], reviewStatus: "draft",
  },
  {
    dimension: "careParticipation", value: "shared", conditionId: "care-shared",
    title: "共同分擔照顧", neutralSummary: "你與支持者目前會一起安排照顧任務。",
    careImpacts: ["交接時可能需要說清楚誰規劃、誰執行、誰追蹤。"],
    supportContext: "共同分擔仍需要確認各自能投入的時間。", sourceReferences: [], reviewStatus: "draft",
  },
  {
    dimension: "careParticipation", value: "uneven", conditionId: "care-uneven",
    title: "分工尚待協調", neutralSummary: "目前照顧安排落在不同人身上的份量可能不一樣。",
    careImpacts: ["接送與備餐的提醒工作可能需要重新分配。"],
    supportContext: "可從一件具體任務開始討論完整交接。", sourceReferences: [], reviewStatus: "draft",
  },
  {
    dimension: "careParticipation", value: "pseudoSingle", conditionId: "care-pseudo-single",
    title: "多數照顧由你承接", neutralSummary: "即使有其他家人，目前日常照顧仍可能集中在你身上。",
    careImpacts: ["臨時加班或接送變動時，可能需要額外尋找接手的人。"],
    supportContext: "支持是否可用需要個別確認，家中人數不代表可接手的時段。", sourceReferences: [], reviewStatus: "draft",
  },
  {
    dimension: "careParticipation", value: "primaryAndBackup", conditionId: "care-primary-backup",
    title: "主要照顧加備援", neutralSummary: "你負責主要安排，另有可事先協調的備援支持。",
    careImpacts: ["備援接送可能需要提前準備聯絡與交接資訊。"],
    supportContext: "可先約定支援範圍與無法接手時的替代安排。", sourceReferences: [], reviewStatus: "draft",
  },
  {
    dimension: "workArrangement", value: "dualIncome", conditionId: "work-dual-income",
    title: "雙薪安排", neutralSummary: "家庭有兩份工作收入，收入提供者不一定都能參與日常照顧。",
    careImpacts: ["工作時段重疊時，接送與臨時請假可能需要協調。"],
    supportContext: "工作收入與可用照顧時間需要分開確認。", sourceReferences: [], reviewStatus: "draft",
  },
  {
    dimension: "workArrangement", value: "singleFullTimeCare", conditionId: "work-full-time-care",
    title: "全職照顧安排", neutralSummary: "目前有一位成人以全職照顧為主要日常安排。",
    careImpacts: ["備餐與照顧可能長時間交錯，休息時段也需要安排。"],
    supportContext: "全職照顧仍需要交接、休息與可協調的支持。", sourceReferences: [], reviewStatus: "draft",
  },
  {
    dimension: "workArrangement", value: "flexible", conditionId: "work-flexible",
    title: "彈性工作安排", neutralSummary: "工作時間可能有調整空間，仍需要與其他安排協調。",
    careImpacts: ["接送時間可能可以調整，但工作與休息界線需要保留。"],
    supportContext: "可確認彈性的實際範圍，不把所有臨時任務留給同一人。", sourceReferences: [], reviewStatus: "draft",
  },
  {
    dimension: "workArrangement", value: "unstable", conditionId: "work-unstable",
    title: "工作時段有變動", neutralSummary: "工作時段或收入可能變動，生活安排需要保留調整空間。",
    careImpacts: ["臨時排班可能需要重新協調接送與備餐。"],
    supportContext: "可先確認臨時支援方式；工作條件不代表照顧成果。", sourceReferences: [], reviewStatus: "draft",
  },
]);
