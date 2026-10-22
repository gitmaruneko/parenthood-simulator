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
