import type { ContentPack, EventNode, GameState, ReactionPool } from "../domain/schemas.js";
import { conditionMatches, type ConditionContext } from "./conditions.js";
import { nextPrng } from "./prng.js";

type ReactionEntry = ReactionPool["entries"][number];
type Actor = ContentPack["actors"][number];

const compareIds = (a: { id: string }, b: { id: string }): number => a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

const reactionLogWeight = (
  entry: ReactionEntry, state: GameState, context: ConditionContext, actor?: Actor,
): number => {
  let weight = Math.log(entry.weight);
  if (actor) {
    if (entry.kind === "support" || entry.kind === "understanding") {
      weight += Math.log(0.5 + (actor.initiative + actor.reliability + actor.boundaryRespect) / 3);
    } else if (entry.kind === "criticism" || entry.kind === "conflict") {
      weight += Math.log(1.5 - actor.boundaryRespect);
    }
  }
  for (const modifier of entry.weightModifiers ?? []) {
    if (conditionMatches(modifier.condition, state, context)) weight += Math.log(modifier.multiplier);
  }
  return weight;
};

export interface ResolvedReaction {
  poolId: string;
  entry: ReactionEntry | null;
  actorId: string | null;
}

// Selection is independent of the chosen option. Event actors include transient people;
// household roles must also belong to this run's family.
export const resolveReactions = (state: GameState, event: EventNode, content: ContentPack): {
  reactions: ResolvedReaction[]; rngState: number;
} => {
  let rngState = state.rngState;
  const actors = content.actors.filter((actor) => event.actorIds.includes(actor.id) &&
    (actor.role === "child" ? actor.id === state.family.childId :
      actor.role === "partner" || actor.role === "grandparent"
        ? state.family.persistentActorIds.includes(actor.id) : true))
    .sort(compareIds);
  const present = actors.filter((actor) => {
    const random = nextPrng(rngState);
    rngState = random.state;
    return random.value < actor.availability;
  });
  const availableActorIds = present.map((actor) => actor.id);
  const reactions = [...new Set(event.reactionPoolIds)].sort().map((poolId): ResolvedReaction => {
    const pool = content.reactionPools.find((pool) => pool.id === poolId)!;
    const candidates = [...pool.entries].sort(compareIds).flatMap((entry) => {
      const responders = entry.kind === "none" ? [undefined] :
        present.filter((actor) => entry.actorRoles.includes(actor.role));
      return responders.flatMap((actor) => {
        const context: ConditionContext = { event, availableActorIds, ...(actor ? { actorId: actor.id } : {}) };
        if (entry.requirements && !conditionMatches(entry.requirements, state, context)) return [];
        const logWeight = reactionLogWeight(entry, state, context, actor);
        return Number.isFinite(logWeight) ? [{ entry, actorId: actor?.id ?? null, logWeight }] : [];
      });
    });
    if (!candidates.length) return { poolId, entry: null, actorId: null };
    const random = nextPrng(rngState);
    rngState = random.state;
    // Normalize in log space so large, finite authored weights do not overflow.
    const maximum = Math.max(...candidates.map((candidate) => candidate.logWeight));
    const weighted = candidates.map((candidate) => ({ ...candidate, weight: Math.exp(candidate.logWeight - maximum) }));
    const total = weighted.reduce((sum, candidate) => sum + candidate.weight, 0);
    let target = random.value * total;
    const selected = weighted.find((candidate) => (target -= candidate.weight) < 0) ?? weighted.at(-1)!;
    return { poolId, entry: selected.entry, actorId: selected.actorId };
  });
  return { reactions, rngState };
};
