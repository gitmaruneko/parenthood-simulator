import { z } from "zod";

export const familyLifeDirectionIdSchema = z.enum([
  "flexible", "work-and-finances", "parent-child-time", "family-relationships",
  "caregiver-wellbeing", "life-exploration",
]);
export type FamilyLifeDirectionId = z.infer<typeof familyLifeDirectionIdSchema>;
export const FAMILY_LIFE_DIRECTIONS: readonly {
  id: FamilyLifeDirectionId; name: string; description: string;
}[] = [
  { id: "flexible", name: "彈性安排", description: "隨家庭當下需要保留調整空間" },
  { id: "work-and-finances", name: "工作與經濟", description: "留意工作安排、收支與生活穩定" },
  { id: "parent-child-time", name: "親子陪伴", description: "留意共同相處、傾聽與日常互動" },
  { id: "family-relationships", name: "家庭與關係", description: "留意家人協調、支持與關係維繫" },
  { id: "caregiver-wellbeing", name: "照顧者身心", description: "留意休息、自我照顧與照顧者需要" },
  { id: "life-exploration", name: "生活探索", description: "留意新體驗、興趣與生活環境" },
];
