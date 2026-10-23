# Save and restore (issue #9)

Family Life Direction update (#28–#30): every change is saved immediately through
the existing boundary. Save v3 requires a known direction ID; legacy saves migrate
to `flexible` when absent, preserving committed data and RNG. Failures retain the
in-memory choice for retry; conflicts never overwrite newer data.

`src/persistence/index.ts` is the public Save / Restore Boundary. It owns save
validation, serialization, migration, local persistence, and recovery. The
engine remains pure; React and other callers submit commands through this
boundary rather than implement storage or migration rules.

## Save formats

| Save version | Shape | Restore behavior |
| --- | --- | --- |
| 1 | Unwrapped `GameState` with `schemaVersion: 1` | Explicitly migrate in memory to version 3; report `migratedFrom: 1` |
| 2 | `{ schemaVersion: 2, state: GameState }` | Explicitly migrate in memory to version 3; report `migratedFrom: 2` |
| 3 | `{ schemaVersion: 3, state: GameState }` with required direction | Validate and restore; report `migratedFrom: null` |
| Other | Unknown save or nested state version | Return `incompatible-version`, preserving the original bytes |

The save version is independent of the domain's `GameState.schemaVersion`,
which remains 1. Migration wraps the original state and adds the confirmed default direction; it does not regenerate the
family, reset the PRNG, reconstruct progress, or invent missing required data.
Unknown fields and invalid data are rejected instead of silently stripped.

All GameState fields are retained: seed and **current** `rngState`, family,
resources, tendencies, planning load, flags, relationship memories, stage and
Turn progress, pending EventNode, schedules (including conditions and immediate
Turn ownership), completed events, cooldown timestamps, choices, anticipated
judgment, reactions, story history, completed-stage timeline, and optional review.
Validation also checks linked stage/Turn identifiers, resolved-node counts, and
pending-input consistency. Required PRNG state cannot be substituted with seed.

## Public operations

- `serializeGame(state)` returns a version-3 JSON string. Invalid state throws a
  validation error; store operations convert that into a readable result.
- `restoreGame(rawData)` returns `restored` with state and migration information,
  or `error` with a stable code, Traditional Chinese message, and exact raw data.
  It never writes or deletes anything.
- `createLocalSaveStore(storage?)` uses browser `localStorage` by default, resolved
  lazily so denied access becomes an error. Tests and other hosts may supply
  the equivalent `SaveStorage.getItem/setItem` interface.
- `store.load()` returns `empty`, `restored`, or `error`. A blocked read is an
  error, never evidence that no save exists. Loading a legacy save is read-only.
- `store.save(state, expectedRawData)` commits a validated snapshot. Pass `null`
  only when the last load was empty; otherwise pass the last loaded/saved bytes.
  Stale bytes produce `save-changed`. Ordinary saves cannot overwrite damaged or
  unsupported data, bypass migration, or replace another seed's family story.
- `store.migrate(expectedRawData)` validates the migration, preserves original
  bytes, and then commits the current format. A failed backup or active write
  leaves the old active save intact.
- `store.replaceAfterConfirmation(state, expectedRawData)` preserves the current
  bytes before replacing an existing story, including damaged/unsupported data.
  Call only after showing the error/overwrite explanation and receiving explicit
  player confirmation for those exact bytes. Canceling performs no write.

Writes return `saved` with `rawData` and an optional `preservedKey`, or `error`
with readable details and the last known active bytes. Active saves use
`parenthood-simulator.save`. Preserved originals use `.preserved.0`, `.preserved.1`,
etc.; an earlier preserved story is never overwritten. There is no automatic
deletion or retention cleanup. Preservation can consume space; quota failures
are reported, and replacement is blocked until preservation succeeds.

## Checkpoints and continuation

```ts
const store = createLocalSaveStore();
const loaded = store.load();
if (loaded.status === "restored" && loaded.migratedFrom === null) {
  const result = transitionAndSave(
    loaded.state, content, { type: "ADVANCE" }, store, loaded.rawData,
  );
  // Render result.transition and result.save; retain both for a retry on failure.
}
```

`transitionAndSave` executes the real engine once and saves each trace snapshot:
completed nodes, pending input, Turn and stage lifecycle boundaries, and the
final state. A multi-node automatic transition therefore has complete intermediate
checkpoints. Writing stops at the first failure. The returned transition retains
the latest in-memory result; the save error contains the last known persisted
bytes. Retry that in-memory state with `store.save` rather than replaying a
player choice. Reopening after failure resumes the last successful checkpoint.

Restoration requires the same content pack and actor definitions as uninterrupted
play. Content and generated actors are supplied to the engine separately from
GameState; this boundary does not version or persist content catalogues.

## UI integration and limits

Callers must display the supplied message before offering a new story after a
restore error. Offer retry and preservation/export of `rawData`; do not present
an error as an empty slot. Never call the confirmation operation automatically.
Reload the latest state before using a recovery confirmation or replacing data.
The future UI integration belongs to issue #11; this issue supplies the tested
storage boundary and messages, without creating a UI.

LocalStorage replaces a single value atomically. Backups are written first, so
failure of the active write leaves the original active value. Expected-byte
checks reject stale snapshots; they are optimistic checks, not a cross-tab lock
or a multi-key transaction. There is no cloud sync or protection against the
player clearing browser data. Browser permission and quota errors are recoverable
results, not reasons to erase existing data.

`tests/persistence.test.ts` tests through this boundary with the real engine and
an equivalent storage adapter. It covers pending choices, Turn boundaries, exact
continuation/reaction traces, migrations, review data, damaged and unsupported
saves, confirmed recovery, stale writes, blocked storage, quotas, and per-node
checkpoint recovery. A recreated default store over the same localStorage
simulates reload; browser UI and real-device reload checks remain issue #11 work.
