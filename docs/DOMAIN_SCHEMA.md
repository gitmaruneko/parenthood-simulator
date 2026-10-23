# Domain Schema and Content Validation

Issue #2 establishes the data contract used by later engine, persistence, content, and UI work. It does not implement event progression.

## Public modules

- `src/domain/schemas.ts` contains the Zod schemas and inferred TypeScript types.
- `src/domain/content-validation.ts` exposes the `validateContentPack` seam and the throwing `parseContentPack` helper.
- `src/domain/index.ts` is the public export surface for domain contracts.
- `src/domain/family-conditions.ts` validates the Issue #4 explanation catalogue
  against existing family dimensions. See [Family opening](FAMILY_OPENING.md)
  for generation, assessment, and reroll contracts.

## Model boundaries

- `AgeStage` is a configured growth stage. The MVP contains 12 stages and each stage has entry events and a six-node stage budget.
- `Turn` is a serializable story-progress contract with a four-node limit and explicit terminal states. It is not an AgeStage and is not an EventNode.
- `EventNode` is one story node. It declares its input mode, node kind, eligibility, choices, reactions, follow-ups, knowledge cards, and cycle guard metadata.
- `GameState` contains the current stage and turn progress, PRNG state fields, resources, family configuration, planning load, relationship memories, scheduled events, choice history, story history, and optional review data.

## Validation responsibilities

Zod validates individual shapes, required fields, value bounds, stable identifiers, choice cardinality, resource ranges, reaction-card structure, and review-card source requirements.

The content validator additionally checks:

- duplicate IDs and all event, actor, stage, reaction-pool, and knowledge-card references;
- nested condition references, immediate follow-ups, scheduled follow-ups, reaction follow-ups, and termination guards;
- positive reaction weights and non-empty reaction pools;
- ordered AgeStages, stage-owned entry events, and non-backward scheduled stage targets;
- reachability of required events from global and AgeStage entry roots;
- safe AUTO_ADVANCE fallback coverage;
- cycles only when a participating node declares a `maxVisits` termination guard.

Validation returns structured issues with a stable code and a precise data path. `parseContentPack` throws `ContentValidationError` without discarding the original input.

## Scope boundary

The event engine will later consume these contracts and enforce runtime traversal. This ticket intentionally does not select events, advance turns, resolve reactions, or render UI.

## Reaction contracts (issue #7)

Reaction entries support six kinds: `support`, `understanding`, `neutral`,
`criticism`, `conflict`, and `none`. Optional `weightModifiers` contain a
condition and a finite nonnegative multiplier. Optional effects are `setFlags`,
`relationshipMemories` (ID, category, text templates), and `scheduledFollowUps`;
existing `followUpEventIds` are immediate reactions chains.

Events optionally declare `locationId` and `contextTags`. Conditions also support
location, context tag, recent event, and recent relationship-memory checks.
Recency uses a nonnegative integer `withinTurns` and optional memory
`createdAtTurn` timestamps. See [Event engine](EVENT_ENGINE.md) for evaluation
and candidate weighting semantics.

Choice `anticipatedJudgment` is optional text preserved separately in choice
history. Observed reactions use `observedReactionSchema`; optional
`GameState.reactionHistory` adds the source event, stage, and Turn to each result.
These additions are optional so previous states and content remain parseable.

The validator checks unique reaction entry IDs within each pool, nested modifier
condition references, and reaction schedule event/stage/condition references.
Reaction schedules contribute graph edges for reachability and guarded-cycle
validation. Their target chronology is checked against every event using the
pool, so a shared pool cannot silently schedule into a past stage.

## Planning and relationship effects (issue #8)

`narrativeEffectsSchema` defines optional burden, tendency, resource, flag,
concrete memory, and story effects shared by nodes, choices, and reactions.
Choice resource deltas and flag additions keep their existing empty defaults;
new fields are optional, preserving existing content and state parsing.
Memory actor references on nodes and choices are checked against the pack's
actor catalogue. Reaction memory actors are supplied by the resolver.

Conditions include hidden planning-load thresholds, named tendency thresholds,
and optional concrete `memoryId` matching within the existing category/recency
condition. Numeric changes must be finite; planning thresholds are nonnegative.
`planningLoad` remains separate from `resourceKeySchema` and resource state.
No relationship score is introduced. See [Event engine](EVENT_ENGINE.md#invisible-planning-support-and-repair-issue-8)
for effect order, recovery, narrative history, and reference-story integration.
Base node history optionally records `resolvedEventId` for lifecycle recovery;
additional authored story effects do not count as resolved nodes.
