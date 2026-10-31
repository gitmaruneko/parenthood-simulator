import { z } from "zod";

// Closed, effect-free catalogue. IDs, ordering and eligibility are versioned as v1.
export const dailyTemplateSchema = z.object({
  id: z.string().regex(/^daily-v1-[a-z-]+$/),
  minMonths: z.number().int().min(0), maxMonths: z.number().int().min(0),
  text: z.string().trim().min(1),
}).strict().refine(row => row.minMonths <= row.maxMonths, "invalid daily age range");

export function validateDailyTemplates(input: unknown) {
  return z.array(dailyTemplateSchema).superRefine((rows, ctx) => {
    if (new Set(rows.map(row => row.id)).size !== rows.length)
      ctx.addIssue({ code: "custom", message: "duplicate daily template IDs" });
  }).parse(input);
}

// Only player/child activities, established by this commit. Membership never
// implies that a partner, elder or teacher was present or delivered support.
export const DAILY_TEMPLATES = validateDailyTemplates([
  { id: "daily-v1-infant-hand", minMonths: 0, maxMonths: 5,
    text: "你把手指放在孩子的掌心，停了一會兒，再輕輕收回手。" },
  { id: "daily-v1-infant-voice", minMonths: 0, maxMonths: 11,
    text: "你在孩子身旁輕聲說了幾句今天的事，說完後停下來陪了一會兒。" },
  { id: "daily-v1-toddler-window", minMonths: 12, maxMonths: 35,
    text: "你和孩子在窗邊看了一會兒外頭的光，你指了指窗外，再把手放下。" },
  { id: "daily-v1-young-drawing", minMonths: 36, maxMonths: 72,
    text: "你在紙上畫了一個圓，讓孩子看，再在旁邊添上一個小圓。" },
]);
