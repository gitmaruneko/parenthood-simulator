import { z } from "zod";
import { familyProfileSchema } from "./schemas.js";

export type FamilyProfile = z.infer<typeof familyProfileSchema>;
export type FamilyDimension = "householdComposition" | "careParticipation" | "workArrangement";

const conditionFields = {
  conditionId: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1),
  neutralSummary: z.string().trim().min(1),
  careImpacts: z.array(z.string().trim().min(1)).min(1),
  supportContext: z.string().trim().min(1),
  sourceReferences: z.array(z.object({
    title: z.string().trim().min(1),
    url: z.string().url().regex(/^https?:\/\//, "source must use an HTTP(S) URL"),
  }).strict()),
  reviewStatus: z.enum(["draft", "reviewed"]),
  // Explicit declarations also catch claims without numeric notation.
  statistics: z.array(z.string().trim().min(1)).default([]),
};

export const familyConditionSchema = z.discriminatedUnion("dimension", [
  z.object({ ...conditionFields, dimension: z.literal("householdComposition"), value: familyProfileSchema.shape.householdComposition }).strict(),
  z.object({ ...conditionFields, dimension: z.literal("careParticipation"), value: familyProfileSchema.shape.careParticipation }).strict(),
  z.object({ ...conditionFields, dimension: z.literal("workArrangement"), value: familyProfileSchema.shape.workArrangement }).strict(),
]).superRefine((condition, ctx) => {
  const text = [condition.title, condition.neutralSummary, ...condition.careImpacts,
    condition.supportContext, ...condition.statistics].join("\n");
  // Conservative lint for authored copy; source accuracy still requires editorial review.
  const hasStatistic = condition.statistics.length > 0 ||
    /[0-9０-９]|[零一二三四五六七八九十百兩两]+(?:成|％|%|分之)|百分之|統計|研究顯示|調查顯示|\b(?:percent|statistics|survey)\b/i.test(text);
  if (hasStatistic && (condition.sourceReferences.length === 0 || condition.reviewStatus !== "reviewed")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sourceReferences"],
      message: `${condition.conditionId}: statistics require verifiable sources and reviewed status` });
  }
  if (/(?:比較|更|較|最)(?:幸福|成功|負責任)|(?:必然|一定|必定|注定|保證)[^\n。]*(?:孩子|育兒|幸福|成功)|(?:好|壞)(?:父母|媽媽|爸爸)|診斷|成功率/.test(text)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["neutralSummary"],
      message: `${condition.conditionId}: explanations must not rank, diagnose or predict parenting outcomes` });
  }
});

export type FamilyCondition = z.infer<typeof familyConditionSchema>;

export const FAMILY_DIMENSIONS = ["householdComposition", "careParticipation", "workArrangement"] as const;

export const familyConditionCatalogueSchema = z.array(familyConditionSchema).superRefine((conditions, ctx) => {
  const ids = new Set<string>();
  const keys = new Set<string>();
  conditions.forEach((condition, index) => {
    const key = `${condition.dimension}/${condition.value}`;
    if (ids.has(condition.conditionId) || keys.has(key)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, "conditionId"],
        message: `${condition.conditionId}: duplicate condition ID or family dimension key` });
    }
    ids.add(condition.conditionId);
    keys.add(key);
  });
  for (const dimension of FAMILY_DIMENSIONS) {
    for (const value of familyProfileSchema.shape[dimension].options) {
      if (!keys.has(`${dimension}/${value}`)) ctx.addIssue({ code: z.ZodIssueCode.custom,
        message: `missing condition for ${dimension}/${value}` });
    }
  }
});

export const validateFamilyConditionCatalogue = (input: unknown) => familyConditionCatalogueSchema.safeParse(input);
