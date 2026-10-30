import { z } from "zod";
import type { GameState } from "./schemas.js";

const actorId = z.string().regex(/^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/i);
export const actorProfileSchema = z.discriminatedUnion("source", [
  z.object({
    profileVersion: z.literal(1), source: z.literal("generated-v1"),
    name: z.string().trim().min(1).max(30),
    relationshipToPlayer: z.enum(["child", "partner", "husband", "wife", "playerParent", "partnerParent"]),
    relatedActorId: actorId.optional(),
    lifeDetail: z.object({ templateVersion: z.literal(1),
      templateId: z.enum(["toys", "pictures", "colours", "notes", "tea", "check-in"]),
      source: z.literal("generated-v1"),
    }).strict(),
  }).strict(),
  z.object({ profileVersion: z.literal(1), source: z.literal("legacy-unknown"),
    relationshipToPlayer: z.enum(["child", "unknownFamily"]),
  }).strict(),
]);
export const actorProfilesSchema = z.record(actorId, actorProfileSchema);
export type ActorProfiles = z.infer<typeof actorProfilesSchema>;

export function profileMatchesActorRole(profile: ActorProfiles[string], role: string): boolean {
  if (profile.source === "legacy-unknown") return true;
  const relationship = profile.relationshipToPlayer;
  return role === "child" ? relationship === "child"
    : role === "partner" ? ["partner", "husband", "wife"].includes(relationship)
    : role === "grandparent" && ["playerParent", "partnerParent"].includes(relationship);
}

export function unknownActorProfiles(family: GameState["family"]): ActorProfiles {
  return Object.fromEntries([family.childId, ...family.persistentActorIds].map(id => [id, {
    profileVersion: 1, source: "legacy-unknown", relationshipToPlayer: id === family.childId ? "child" : "unknownFamily",
  }]));
}

// Shared by save validation and generation, without changing the engine's mechanical contract.
export function validateActorProfiles(state: GameState, ctx: z.RefinementCtx) {
  const ids = [state.family.childId, ...state.family.persistentActorIds];
  if (state.replayOrigin) {
    const actors = state.replayOrigin.actors;
    if (actors.length !== ids.length || new Set(actors.map(actor => actor.id)).size !== ids.length ||
        ids.some(id => !actors.some(actor => actor.id === id)) ||
        actors.some(actor => (actor.id === state.family.childId) !== (actor.role === "child") ||
          !["child", "partner", "grandparent"].includes(actor.role)))
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "invalid opening actor references" });
  }
  const check = (profiles: ActorProfiles | undefined) => {
    if (!profiles) return;
    const invalid = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    if (new Set(ids).size !== ids.length || Object.keys(profiles).length !== ids.length ||
        ids.some(id => !profiles[id]) || Object.keys(profiles).some(id => !ids.includes(id)))
      invalid("profiles must match existing family actors exactly");
    for (const [id, profile] of Object.entries(profiles)) {
      if ((id === state.family.childId) !== (profile.relationshipToPlayer === "child"))
        invalid("child relationship does not match childId");
      if (profile.source !== "generated-v1") continue;
      if ((profile.relationshipToPlayer === "child") !== ["toys", "pictures", "colours"].includes(profile.lifeDetail.templateId))
        invalid("life detail is incompatible with relationship");
      const relative = profile.relatedActorId ? profiles[profile.relatedActorId] : undefined;
      if (profile.relationshipToPlayer === "partnerParent") {
        if (!relative || !["partner", "husband", "wife"].includes(relative.relationshipToPlayer))
          invalid("partner parent requires a confirmed partner relationship");
      } else if (profile.relatedActorId) invalid("unexpected relationship chain");
      const actor = state.replayOrigin?.actors.find(actor => actor.id === id);
      if (actor && !profileMatchesActorRole(profile, actor.role))
        invalid("profile relationship contradicts actor role");
    }
  };
  check(state.actorProfiles);
  check(state.replayOrigin?.actorProfiles);
  if (state.actorProfiles && state.replayOrigin && !state.replayOrigin.actorProfiles)
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "missing opening profiles" });
}
