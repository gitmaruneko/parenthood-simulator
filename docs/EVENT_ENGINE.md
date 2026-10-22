# Core Event Engine

Issue #3 establishes the pure event-transition boundary and deterministic PRNG used by later gameplay tickets.

## Public modules

- `src/engine/index.ts` is the public export surface.
- `initializePrngState(seed)` validates and stores a 32-bit seed as the initial PRNG state.
- `nextPrng(rngState)` returns the next immutable PRNG state and a value in `[0, 1)`.
- `transitionGame(state, content, input, options?)` is the single Core Event Engine Public Boundary.
- Issue #4 adds `createFamilyRun`, `rerollFamilyRun`, assessment questions, and
  display helpers to the same export surface. They initialise family state
  without starting or advancing a Turn; see [Family opening](FAMILY_OPENING.md).

## Transition contract

`transitionGame` accepts a complete `GameState`, a validated `ContentPack`, and one explicit input:

- `ADVANCE` selects eligible AgeStage entry events through stable ID ordering and seeded weighted selection. It resolves `AUTO_ADVANCE` nodes until it reaches player input or a safety boundary.
- `CHOOSE` resolves one choice for the current `PLAYER_INPUT_REQUIRED` node.

The function never mutates its input. It returns:

- the next `GameState`;
- an explicit `PLAYER_INPUT_REQUIRED` or `AUTO_ADVANCE` mode;
- a stop reason;
- the pending player-input event, when present;
- ordered event results;
- an ordered trace containing the before state, input, PRNG state before and after, after state, and event result for every state transition.

The seed is not read during transitions. Callers initialise `rngState` once, after which every random selection consumes and stores the previous transition's PRNG state. Candidate events are sorted by stable ID before weighted selection so source-array or set iteration order cannot change a run.

## Safety behavior

- All five visible resources are clamped to `0–100`; reaching zero does not produce Game Over.
- A Turn ends safely before processing more than four nodes (or its configured lower runtime limit).
- Automatic traversal stops at `maxAutoAdvanceNodes` and can continue from the returned state.
- Repeat visits stop at the event's `maxVisits` guard; unguarded repeat visits stop after one completed visit.
- If no entry event is eligible, the validated choice-free `AUTO_ADVANCE` fallback resolves without consuming PRNG state and completes the stage.
- Repeating `ADVANCE` while player input is pending is idempotent and does not consume PRNG state.

## Deliberate extension points

This ticket leaves later ticket ownership intact:

- Issue #6 owns immediate follow-ups, scheduled events, cooldowns, cancellation, and cross-Turn chains.
- Issue #7 owns reaction-pool resolution and will extend event results when reactions exist.
- Issue #8 owns planning-load, relationship-memory, support, and repair effects.
- Issue #9 owns serialization, migration, and storage adapters.

Later systems attach their results to the same public transition trace when their owning tickets are implemented; Issue #3 does not reserve or populate speculative reaction or scheduling fields.

## AgeStage and Turn lifecycle (issue #5)

`ADVANCE` starts the first Turn when called on a family-opening state. Stages
follow their validated `order`, covering the milestones 2, 6, 10, 15, 21, 27,
33, 39, 45, 52, 61, and 71 months. Content array order does not control progression.

The same transition boundary accepts these lifecycle commands:

- `END_TURN` completes a Turn after at least one resolved node, with no pending
  choice. It leaves the current stage active.
- `START_TURN` starts another Turn after the previous Turn has ended. It resets
  the Turn counter while preserving the stage counter.
- `COMPLETE_AGE_STAGE` ends the current Turn and stage after a resolved node,
  with no pending choice. This is an explicit terminal condition for callers
  coordinating story content; the engine enforces the boundary.
- `NEXT_AGE_STAGE` enters the next stage only after the current stage ends.
  It clears the active Turn and event progress; the next `ADVANCE` starts a Turn.
  At the final milestone it returns `GAME_COMPLETED` without changing state.

A Turn can contain multiple nodes and a stage can contain multiple Turns.
Normal stage content targets 1?4 nodes; this is a content-authoring target,
not an engine minimum or forced cutoff. Four nodes end the Turn safely; six
nodes across all Turns end the stage safely. Limits take precedence over an
identical automatic traversal budget. A cycle-protected Turn also remains
stopped until an explicit lifecycle command. `ADVANCE` on an ended Turn or
stage is idempotent and never silently starts another Turn or stage.

If no stage entry is executable, a choice-free fallback resolves without a
random draw and completes the Turn and stage. Fallback is also used if an
already pending event loses enough executable choices to become invalid.
Player-input candidates must expose at least two executable choices; only
choices satisfying their requirements are returned, and `CHOOSE` rechecks
those requirements. Content validation limits authored choices to four.

`ageStageProgress` records the active stage status, cumulative node count, and
Turn count. `completedAgeStages` preserves each completed or safely ended stage
and its story entry IDs for later review. Turn IDs include stage and Turn
number, so story entry IDs remain distinct across Turns. These fields, along
with pending input and event progress, round-trip through `gameStateSchema`
and JSON. They are optional on pre-lifecycle state; the first transition
initializes progress from recorded event history. Storage and migration
adapters remain owned by issue #9; full ending-review generation remains a
separate concern.
