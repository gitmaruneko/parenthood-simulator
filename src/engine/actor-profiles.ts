import type { ContentPack, EventNode, GameState } from "../domain/schemas.js";
import type { ActorProfiles } from "../domain/actor-profiles.js";

// v2 namespace, catalogue order and hash are frozen; old names are read from saves.
const names = {
  child: ["小禾", "小晴", "小安", "小樹", "小羽", "小澄", "小悠", "小光"],
  partner: ["庭安", "子寧", "以晨", "予希", "品言", "書禾", "宇安", "承恩"],
  husband: ["志豪", "建宏", "冠宇", "家銘", "俊傑", "宗翰", "承恩", "柏翰"],
  wife: ["怡君", "雅婷", "佳蓉", "欣怡", "詩涵", "婉婷", "郁雯", "佩珊"],
  elderMother: ["秀英", "美華", "淑芬", "麗華", "玉蘭", "美玲", "淑惠", "惠珍"],
  elderFather: ["文雄", "國榮", "志明", "建國", "明德", "清泉", "永成", "國華"],
} as const;
const legacyDetails = {
  toys: "常留意身邊的小玩具。", pictures: "喜歡看繪本裡的圖畫。", colours: "常被鮮明的顏色吸引。",
  notes: "安排事情前，習慣先和你確認時間。", tea: "喜歡在空檔泡一杯茶。", "check-in": "習慣先問問彼此今天的安排。",
} as const;
const details = { toys: "常伸手摸摸身邊的小玩具。", pictures: "喜歡翻看繪本裡的動物圖畫。", colours: "常被積木上鮮明的顏色吸引。",
  calendar: "習慣把接送時間記在冰箱上的月曆。", tea: "喜歡趁空檔泡杯茶，坐下來慢慢喝。", bags: "習慣出門前把鑰匙和購物袋放在門邊。" } as const;
const relationshipLabels = { child: "你的孩子", partner: "伴侶", husband: "先生", wife: "太太",
  playerParent: "你的家中長輩", partnerParent: "伴侶的家中長輩", unknownFamily: "家人（關係未確認）",
  mother: "媽媽", father: "爸爸", husbandMother: "婆婆", husbandFather: "公公",
  wifeMother: "岳母", wifeFather: "岳父", partnerMother: "伴侶的媽媽", partnerFather: "伴侶的爸爸" } as const;
const identityHash = (text: string) => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619) >>> 0;
  return hash;
};
export function generateActorProfiles(state: GameState, actors: ContentPack["actors"]): ActorProfiles {
  const profiles: ActorProfiles = {};
  const used = new Set<string>();
  // Establish a partner before binding any in-laws, regardless of actor order.
  const ordered = [...actors].sort((a, b) => Number(b.role === "partner") - Number(a.role === "partner") || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const actor of ordered) {
    const hash = identityHash(`family-identities/v2/${state.seed}/${actor.id}/${state.family.householdComposition}/${state.family.careParticipation}/${state.family.workArrangement}`);
    const partnerId = actors.find(actor => actor.role === "partner")?.id;
    const partner = partnerId ? profiles[partnerId] : undefined;
    const parentSide = (hash >>> 9) % 2 === 0 ? "Mother" : "Father";
    const relationshipToPlayer = actor.role === "child" ? "child"
      : actor.role === "partner" ? (["partner", "husband", "wife"] as const)[(hash >>> 8) % 3]!
      : partner && (hash >>> 8) % 2 ? `${partner.relationshipToPlayer}${parentSide}` as "husbandMother" | "husbandFather" | "wifeMother" | "wifeFather" | "partnerMother" | "partnerFather"
      : parentSide === "Mother" ? "mother" : "father";
    const catalogue = actor.role === "child" ? names.child : actor.role === "partner"
      ? names[relationshipToPlayer as "partner" | "husband" | "wife"]
      : parentSide === "Mother" ? names.elderMother : names.elderFather;
    let index = hash % catalogue.length;
    while (used.has(catalogue[index]!)) index = (index + 1) % catalogue.length;
    const name = catalogue[index]!;
    used.add(name);
    profiles[actor.id] = { profileVersion: 2, source: "generated-v2", name, relationshipToPlayer,
      ...(actor.role === "grandparent" && partner && (hash >>> 8) % 2 ? { relatedActorId: partnerId! } : {}),
      lifeDetail: { templateVersion: 2, source: "generated-v2", templateId: actor.role === "child"
        ? (["toys", "pictures", "colours"] as const)[(hash >>> 16) % 3]!
        : (["calendar", "tea", "bags"] as const)[(hash >>> 16) % 3]! } };
  }
  return profiles;
}

export function resolveFamilyMembers(state: GameState, actors: readonly ContentPack["actors"][number][]) {
  return [state.family.childId, ...state.family.persistentActorIds].map(id => {
    const actor = actors.find(actor => actor.id === id);
    const profile = state.actorProfiles?.[id];
    const generated = profile && profile.source !== "legacy-unknown" ? profile : null;
    const nonresident = actor?.role === "grandparent" && state.family.householdComposition !== "multigenerational";
    const relationship = generated ? relationshipLabels[generated.relationshipToPlayer]
      : id === state.family.childId ? "你的孩子" : actor?.role === "partner" ? "共同照顧者"
      : actor?.role === "grandparent" ? nonresident ? "不同住的支持家人" : "同住長輩" : "家人（關係未確認）";
    const label = generated && nonresident ? `${relationship}（不同住）` : relationship;
    return { id, displayName: id === state.family.childId ? generated ? `孩子（${generated.name}）` : actor?.displayName ?? "孩子" : label,
      relationship: label,
      lifeDetail: generated?.source === "generated-v1" ? legacyDetails[generated.lifeDetail.templateId]
        : generated?.source === "generated-v2" ? details[generated.lifeDetail.templateId] : null };
  });
}

// Explicit actor-bound authored text; callers never replace words in historical strings.
export function describeActor(state: GameState, actorId: string): string | null {
  if (![state.family.childId, ...state.family.persistentActorIds].includes(actorId)) return null;
  const profile = state.actorProfiles?.[actorId];
  if (!profile || profile.source === "legacy-unknown") return null;
  const label = relationshipLabels[profile.relationshipToPlayer];
  return profile.relationshipToPlayer === "child" ? `孩子（${profile.name}）` : label;
}

export function resolveEventIdentity(event: EventNode, state: GameState): EventNode {
  return { ...event, text: resolveNarrativeText(event, state),
    choices: event.choices.map(choice => ({ ...choice, text: resolveNarrativeText(choice, state) })) };
}

export function resolveNarrativeText(item: { text: string; actorText?: { actorId: string; prefix: string; suffix: string } | undefined }, state: GameState): string {
  const identity = item.actorText && describeActor(state, item.actorText.actorId);
  return identity ? `${item.actorText!.prefix}${identity}${item.actorText!.suffix}` : item.text;
}
