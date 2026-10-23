## Summary

Closes #8. Repeated planning work changes later stories and reactions; rest,
support, delegation, and repair reduce burden while retaining concrete memories.

```text
planning choice → second planning task → fatigue → support
  next Turn → coordination: rest or delegate → repair
```

Node, choice, and reaction effects share the engine's transition boundary.
Planning load stays internal; relationship outcomes use memories, tendencies,
flags, and history. The reference chain uses six nodes across two Turns.

## Evidence

- **Before:** The repeated-planning test failed because choices rejected
  `planningLoadDelta`, `tendencyDeltas`, memories, and story effects.
  **After:** Tests cover all four responsibility types, state-triggered fatigue
  and support, partner responses, rest, delegation, repair, and retained memories.
- **Before:** Review reproduced `ADVANCE → CHOOSE pickup → ADVANCE` prematurely
  completing the reference story's stage.
  **After:** Both recovery choices follow ordinary advancement through the chain,
  replay identically, and complete all 12 stages from zero resources.
- **After:** `npm test`: 99 tests pass; `npm run typecheck` and `npm run build`
  pass. Independent Standards and Spec reviews have no remaining findings.

## Merge Danger

**Door:** two-way

New content fields and history provenance are optional; existing content and
GameState parsing remain supported. Changes can be reverted without a storage
migration.

**Blast Radius:** Engine

Node, selected-choice, and selected-reaction effects now run in that order.
Result resource deltas combine authored sources; balances clamp after each
source. Support/repair base history uses its corresponding kind, with explicit
`resolvedEventId` provenance for stage-budget recovery. UI consumers keep raw
planning values out of visible meters. The full MVP content catalogue remains
separate work.
