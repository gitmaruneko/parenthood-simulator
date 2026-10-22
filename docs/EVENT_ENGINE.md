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
- A Turn stops before processing more than its configured `maxNodeCount`.
- Automatic traversal stops at `maxAutoAdvanceNodes` and can continue from the returned state.
- Repeat visits stop at the event's `maxVisits` guard; unguarded repeat visits stop after one completed visit.
- If no entry event is eligible, the validated choice-free `AUTO_ADVANCE` fallback resolves without consuming PRNG state.
- Repeating `ADVANCE` while player input is pending is idempotent and does not consume PRNG state.

## Deliberate extension points

This ticket leaves later ticket ownership intact:

- Issue #5 owns the complete 12-AgeStage and multi-Turn lifecycle plus executable-choice filtering.
- Issue #6 owns immediate follow-ups, scheduled events, cooldowns, cancellation, and cross-Turn chains.
- Issue #7 owns reaction-pool resolution and will extend event results when reactions exist.
- Issue #8 owns planning-load, relationship-memory, support, and repair effects.
- Issue #9 owns serialization, migration, and storage adapters.

Later systems attach their results to the same public transition trace when their owning tickets are implemented; Issue #3 does not reserve or populate speculative reaction or scheduling fields.
