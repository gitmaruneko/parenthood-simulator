import type { ContentPack, EventNode, GameState } from "../domain/schemas.js";
import type { ActorProfiles } from "../domain/actor-profiles.js";

// v1 catalogue order and FNV-1a over UTF-16 code units are part of the saved identity contract.
const names = ["小禾", "小晴", "小安", "小樹", "小羽", "小澄", "小悠", "小光"] as const;
const details = {
  toys: "常留意身邊的小玩具。", pictures: "喜歡看繪本裡的圖畫。", colours: "常被鮮明的顏色吸引。",
  notes: "安排事情前，習慣先和你確認時間。", tea: "喜歡在空檔泡一杯茶。", "check-in": "習慣先問問彼此今天的安排。",
} as const;
const relationshipLabels = { child: "你的孩子", partner: "伴侶", husband: "先生", wife: "妻子",
  playerParent: "你的父母", partnerParent: "伴侶的父母", unknownFamily: "家人（關係未確認）" } as const;
const identityHash = (text: string) => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619) >>> 0;
  return hash;
};
export function generateActorProfiles(state: GameState, actors: ContentPack["actors"]): ActorProfiles {
  const profiles: ActorProfiles = {};
  const used = new Set<string>();
  for (const actor of actors) {
    const hash = identityHash(`family-identities/v1/${state.seed}/${actor.id}/${state.family.householdComposition}/${state.family.careParticipation}/${state.family.workArrangement}`);
    let index = hash % names.length;
    while (used.has(names[index]!)) index = (index + 1) % names.length;
    const name = names[index]!;
    used.add(name);
    const partnerId = actors.find(actor => actor.role === "partner")?.id;
    const relationshipToPlayer = actor.role === "child" ? "child"
      : actor.role === "partner" ? (["partner", "husband", "wife"] as const)[(hash >>> 8) % 3]!
      : partnerId && (hash >>> 8) % 2 ? "partnerParent" : "playerParent";
    profiles[actor.id] = { profileVersion: 1, source: "generated-v1", name, relationshipToPlayer,
      ...(relationshipToPlayer === "partnerParent" ? { relatedActorId: partnerId! } : {}),
      lifeDetail: { templateVersion: 1, source: "generated-v1", templateId: actor.role === "child"
        ? (["toys", "pictures", "colours"] as const)[(hash >>> 16) % 3]!
        : (["notes", "tea", "check-in"] as const)[(hash >>> 16) % 3]! } };
  }
  return profiles;
}

export function resolveFamilyMembers(state: GameState, actors: readonly ContentPack["actors"][number][]) {
  return [state.family.childId, ...state.family.persistentActorIds].map(id => {
    const actor = actors.find(actor => actor.id === id);
    const profile = state.actorProfiles?.[id];
    const generated = profile?.source === "generated-v1" ? profile : null;
    const nonresident = actor?.role === "grandparent" && state.family.householdComposition !== "multigenerational";
    const relationship = generated ? relationshipLabels[generated.relationshipToPlayer]
      : id === state.family.childId ? "你的孩子" : actor?.role === "partner" ? "共同照顧者"
      : actor?.role === "grandparent" ? nonresident ? "不同住的支持家人" : "同住長輩" : "家人（關係未確認）";
    return { id, displayName: generated?.name ?? actor?.displayName ?? (id === state.family.childId ? "孩子" : "家人"),
      relationship: generated && nonresident ? `${relationship}（不同住）` : relationship,
      lifeDetail: generated ? details[generated.lifeDetail.templateId] : null };
  });
}

// Explicit actor-bound authored text; callers never replace words in historical strings.
export function describeActor(state: GameState, actorId: string): string | null {
  if (![state.family.childId, ...state.family.persistentActorIds].includes(actorId)) return null;
  const profile = state.actorProfiles?.[actorId];
  return profile?.source === "generated-v1" ? `${profile.name}（${relationshipLabels[profile.relationshipToPlayer]}）` : null;
}

export function resolveEventIdentity(event: EventNode, state: GameState): EventNode {
  const render = (item: { text: string; actorText?: { actorId: string; prefix: string; suffix: string } | undefined }) => {
    const identity = item.actorText && describeActor(state, item.actorText.actorId);
    return identity ? `${item.actorText!.prefix}${identity}${item.actorText!.suffix}` : item.text;
  };
  return { ...event, text: render(event), choices: event.choices.map(choice => ({ ...choice, text: render(choice) })) };
}
