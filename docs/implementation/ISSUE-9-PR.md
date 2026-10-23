## Summary

Closes #9. Local saves retain the complete GameState and current PRNG state.
Pending choices and Turn boundaries restore with identical continuation.

```text
engine transition
  → persist each node / pending choice / Turn boundary
  → reload → validate → restore current progress and PRNG

legacy save → validate migration → preserve original → commit version 2
damaged save → readable error → player confirms → preserve original → new story
```

The public persistence module supplies Traditional Chinese recovery messages,
explicit migration, confirmed replacement, and stale-write checks. UI integration
remains issue #11. See [Save and restore](../PERSISTENCE.md) for the contract.

## Evidence

- **Before:** The first Save / Restore Boundary test failed because no persistence
  module existed.
  **After:** 28 boundary tests cover pending input, Turn boundaries, real seeded
  reactions, scheduling, all GameState fields and review data, version migration,
  corrupt/incompatible saves, preserved originals, stale writes, blocked storage,
  quota failures, and automatic-node checkpoints.
- **Before:** Spec review reproduced a shape-valid damaged save with an active
  Turn and awaiting-input EventProgress. Restoration accepted it and could
  reroll the event.
  **After:** Reverse pending-input validation rejects it; the regression failed
  before the fix and passes afterward. Spec re-review has no remaining findings.
- **After:** `npm test`: 127 tests pass across five files. `npm run typecheck`
  and `npm run build` pass. Standards review has no findings.

## Merge Danger

**Door:** two-way

GameState's domain version remains 1; save version 2 wraps it. Explicit migration
and confirmed replacement preserve original bytes before committing the active
value. No automatic deletion occurs. Restoring an original to an older build
requires deliberately selecting those preserved bytes.

**Blast Radius:** Persistence

No existing engine transitions or domain contracts change. Callers opt into
`transitionAndSave` for checkpoints. Storage failures retain the last successful
checkpoint and return the full in-memory transition for retry. Expected-byte
checks are optimistic, not cross-tab locking. The same content and actor
definitions are required for deterministic continuation. Browser UI verification
belongs to issue #11; this change tests the default localStorage boundary with
an equivalent adapter and recreated stores.
