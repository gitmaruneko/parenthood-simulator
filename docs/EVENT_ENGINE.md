# Core Event Engine

Issue #3 establishes the pure event-transition boundary and deterministic PRNG used by later gameplay tickets.

Family Life Direction update (#28–#30): `SET_FAMILY_LIFE_DIRECTION(directionId)`
changes only the active preference, before lifecycle/budget processing. It emits
a `FAMILY_LIFE_DIRECTION_SET` trace without consuming PRNG. Same-selection commands
are idempotent; completed records reject changes. Only general entry selection
uses authored direction multipliers; pending stories, reactions and fixed follow-ups
are unchanged. See [implementation decisions](FAMILY_LIFE_DIRECTION_IMPLEMENTATION.md).

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

- `ADVANCE` processes immediate follow-ups, due scheduled events, then eligible AgeStage entry events. Entry selection uses stable ID ordering and seeded weighted selection. It resolves `AUTO_ADVANCE` nodes until it reaches player input or a safety boundary.
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
- If no queued or entry event is eligible, the validated choice-free `AUTO_ADVANCE` fallback resolves without consuming PRNG state and completes the stage, unless a same-stage schedule is waiting for a later Turn.
- Repeating `ADVANCE` while player input is pending is idempotent and does not consume PRNG state.

## Deliberate extension points

This ticket leaves later ticket ownership intact:

- Issue #7 adds reaction-pool resolution and observed reaction results (see below).
- Issue #8 adds planning-load, relationship-memory, support, and repair effects (see below).
- Issue #9 owns serialization, migration, and storage adapters.

Later systems attach their results to the same public transition trace when their owning tickets are implemented; Issue #3 does not reserve or populate speculative reaction or scheduling fields.

## Immediate and scheduled chains (issue #6)

Completing an EventNode queues its `immediateFollowUpEventIds` and
`scheduledFollowUps`, plus those of the chosen option. Only the chosen option
contributes follow-ups. `CHOOSE` still resolves one node; the next `ADVANCE`
continues the chain. A follow-up can be a reaction, environment event, or another
choice with narrative consequences. Reaction-pool selection is described below;
planning-load and family effects use the narrative effects described below.

All follow-ups use the serializable `GameState.scheduledFollowUps` queue:

- Immediate items have `immediateTurnId` and run only within that Turn. They
  take precedence over scheduled items; within each group, higher `priority`
  runs first, then ascending stable schedule ID breaks ties. IDs derive from
  the source Turn, node number, and declaration index (node declarations before
  choice declarations). Queue array order has no effect on selection.
- `delayTurns: 0` means the current Turn. A delay of one means the next Turn.
  For a later `targetAgeStageId`, zero means that stage's first Turn, one its
  second Turn. Stored `dueAfterTurns` is the zero-based target-stage Turn
  threshold, rather than a countdown decremented on every `ADVANCE`.
- A due item retains its authored `condition`, target stage, priority, and
  status. Conditions are evaluated when due, after prior choices have applied.
  A false condition, failed event eligibility/continuation guard, insufficient
  executable choices, or already-completed non-repeatable event expires the
  item. Missing targets and items for past stages or past immediate Turns also
  expire. Terminal items are retained for inspection and persistence.
- `CANCEL_SCHEDULED_EVENT` with `scheduledEventId` changes a pending item to
  `cancelled`. Unknown or terminal IDs are no-ops. Cancellation preserves pending
  player input, Turn progress, and PRNG state, and works at lifecycle boundaries.
- `cooldownTurns` and a `cooldown` termination guard use the larger interval.
  An interval of two permits recurrence in Turn N+2 after resolution in Turn N.
  Cooling events are excluded from entry selection; due schedules remain pending
  until cooling ends or their target stage/Turn expires. `turnNumber` is the
  run-wide clock and `eventLastResolvedTurn` records cooldown origins.
- A `condition` termination guard is a continuation condition: false makes
  the event ineligible. Existing per-Turn visit limits and four-node Turn and
  six-node stage limits also apply to chained events, so cycles terminate.

Scheduled dispatch consumes no randomness. Consuming, expiring, and creating
queue items is included in the event transition trace, with contiguous before
and after states. An automatic traversal budget can pause a chain; the returned
queue resumes on the next `ADVANCE`, including after JSON/schema restoration.
If no schedule is eligible, normal entry selection and safe fallback continue.
When a pending non-immediate follow-up targets a later Turn of the current stage
(including a due item waiting for cooldown), fallback completes only the Turn,
preserving the stage so `START_TURN` can reach that follow-up. This also lets
otherwise empty waiting Turns progress safely. Fallback nodes still count
toward the stage budget; the six-node cap takes precedence over waiting.
Queue metadata and cooldown clocks round-trip through `gameStateSchema` and
JSON; storage adapters and migrations remain owned by issue #9.

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

If no queued event or stage entry is executable, a choice-free fallback resolves
without a random draw and completes the Turn and stage (or only the Turn when
a later-Turn schedule remains in the current stage). Fallback is also used if an
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

## Independent character reactions (issue #7)

A completed choice or automatic node resolves each referenced reaction pool once.
Waiting for input never rolls reactions. Safe fallback nodes skip reactions and
preserve their existing no-randomness guarantee. Reactions are part of the source
node, so they do not consume extra node budget; their follow-up nodes do.

The resolver uses the post-choice resources, flags, and completed-event state.
All pools see that same snapshot; effects from one pool become visible to later
nodes, rather than changing the selection of another pool on the same node.
Choices do not name a fixed reaction. An optional choice `anticipatedJudgment`
is copied into choice history and never affects reaction selection.

Actors must be listed in the source event's `actorIds`. The child must match
`family.childId`; partners and grandparents must belong to `persistentActorIds`.
Teachers, colleagues, and strangers can appear as transient scene actors.
Availability is sampled once per scene actor, in stable ID order, and shared by
all pools. Within a reaction requirement or modifier, `actorAvailable` checks
that sampled scene availability. Elsewhere it retains the existing family
membership meaning. Household composition and resource levels do not implicitly
remove support candidates.

Pools and entries are processed in stable ID order. Each eligible entry/actor
pair is a candidate; `none` entries are actorless candidates and can be selected
even when actors are present. Each pool selects one candidate using its authored
weight and the saved PRNG state. If there are no candidates, it records an
actorless `none` result without a selection draw. Presence draws still count.
Pool IDs are deduplicated. Reordering actors, entries, or pools does not reroll
a run.

Support and understanding weights are multiplied by
`0.5 + (initiative + reliability + boundaryRespect) / 3`; criticism and conflict
weights by `1.5 - boundaryRespect`. Neutral and none have no trait multiplier.
These positive factors shift probabilities without assigning moral outcomes.
Optional `weightModifiers` multiply weights when their conditions match; zero
explicitly suppresses a candidate. Weights are normalized in log space to avoid
overflow from large finite authored weights.

Requirements and weight modifiers support existing conditions plus:

- `location` with `locationId`, matching the source event's optional `locationId`;
- `contextTag` with `tag`, matching the event's optional `contextTags`;
- `recentEvent` with `eventId` and `withinTurns`, using the run-wide resolution clock;
- `relationshipMemory` with `category` and `withinTurns`, matching the candidate
  actor's memories. Outside actor selection, it matches any actor's memory.

Recency includes the current Turn (age zero), rejects future timestamps, and
requires a recorded timestamp. Older memories without `createdAtTurn` remain in
the narrative but do not count as recent. These conditions can be composed with
`all`, `any`, and `not` and can also control later event eligibility.

Results expose optional `reactions` with pool ID, entry ID, actor ID, kind, and
text. Authored kinds are support, understanding, neutral, criticism, conflict,
and none. Implicit no-response results have null entry and actor IDs.
`GameState.reactionHistory` records these observations with source event, stage,
and Turn IDs; story history also receives reaction text. They round-trip through
JSON and `gameStateSchema`, independently of anticipated judgment.

Selected entries can add `setFlags`, concrete `relationshipMemories`, immediate
`followUpEventIds`, and `scheduledFollowUps`. Memories bind to the selected actor
and current stage/Turn clock; actorless entries produce unbound memories.
Reaction schedules use the same priority, delay, eligibility, cooldown, expiry,
and node-limit rules as other event chains. Their IDs use a separate
`reaction-scheduled` prefix to avoid collisions with node/choice schedules.
Relationship changes are concrete memories and flags rather than a relationship
score.

## Invisible planning, support, and repair (issue #8)

`planningLoad` is internal `GameState` data. It is excluded from the five visible
resources and `EngineEventResult.resourceDeltas`. Present its consequences through
story text, fatigue, interactions, and opportunities to redistribute work. UI
consumers must keep its number and authored deltas out of player-facing meters.

Events, chosen options, and independently selected reactions accept the same
optional narrative effects:

- `planningLoadDelta` increases or reduces burden, with a floor of zero.
- `tendencyDeltas` changes named tendencies; missing tendencies start at zero.
- `resourceDeltas` changes the existing five resources, each clamped to `0–100`.
- `clearFlags` removes flags; `setFlags` then adds unique flags. Setting a flag
  wins if both lists name it within the same effect source.
- `relationshipMemories` records concrete ID/category/text templates. Node and
  choice templates can name an actor; reaction templates bind to the selected
  actor. The engine stamps the current AgeStage and run-wide Turn number.
- `storyEntries` adds authored `planning`, `support`, or `repair` text for later
  review, with deterministic IDs distinct from the base event and reaction text.

Effects run once when a node resolves: node effects, then the selected choice's
effects, then selected reaction effects in stable pool order. Awaiting input and
unselected options apply nothing. All reaction pools see the same post-node,
post-choice snapshot, including its burden, tendencies, and memories. A selected
reaction's effects influence subsequent nodes, rather than another pool's draw
on the same node. Effects do not consume randomness or extra node budget.

Result `resourceDeltas` combines authored node, selected-choice, and reaction
deltas; inspect state for actual balances after each source's clamping. Burden
and tendency arithmetic saturates at finite machine bounds to remain JSON-safe;
this is not a gameplay score cap. Memories are append-only occurrences: repeating
a task preserves both occurrences with their Turn timestamps. Existing
`relationshipMemoryIds` remains legacy metadata; new effects use concrete
`relationshipMemories` templates.

Eligibility, choice requirements, reaction requirements/modifiers, and scheduled
conditions support `planningLoadAtLeast` / `planningLoadAtMost` (`value`), and
`tendencyAtLeast` / `tendencyAtMost` (`tendency`, `value`). Existing
`relationshipMemory` conditions optionally accept `memoryId` to select a specific
memory as well as its category and recency. Reaction checks retain their
actor-specific scope. These conditions compose with `all`, `any`, and `not`.

Support and repair nodes record their base text with the corresponding history
kind, so future review consumers can find them directly. Base node history records
`resolvedEventId`; lifecycle recovery counts this provenance rather than inferring
resolved nodes from story ID formatting. Older `event` history still counts.
Their story IDs remain
part of the completed stage's `storyEntryIds`; concrete memories and tendency
changes persist across stage boundaries and JSON/schema round trips.

### Reference planning story

`createPlanningStory(ageStageId)` in `src/content/planning-story.ts` returns five
stage-local event definitions with stage-prefixed IDs. Add them to a content
pack and add `<ageStageId>-planning` to that stage's entry IDs. Validate the
assembled pack normally. This is a mechanics reference story; the full 30-node
MVP catalogue and age-specific prose remain separate content work.

```text
planning choice (pickup / meals / school notices / household planning)
  repeat another task → fatigue → support
    coordination choice scheduled in the next Turn
    rest or delegate the complete workflow
      repair follows the coordination choice
```

Each planning choice records remembering, arranging, coordinating, tracking, and
following through, plus a distinct care memory and burden. Two such tasks unlock
fatigue and a strained handoff memory. Support reduces burden; coordination
offers rest or complete workflow delegation; a later check-in requires the
earlier conflict memory and records repair. Both recovery choices reduce burden
to zero over the chain, preserving the earlier memories. Support and recovery
have no minimum resource or partner-membership requirement, so single caregivers
can use a wider support network. The six resolved nodes fit the stage budget
across two Turns; ordinary Turn limits still apply. The planning self-follow-up
uses a two-visit guard; support schedules coordination after the first Turn's
four-node limit so the ordinary advance path preserves the whole chain.

Low resources and high burden never create a failure state. Rest, support,
delegation, and repair are authored reversible paths through the same engine,
with no duplicate eligibility rules in presentation code.
