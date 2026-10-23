# Issue #9 retrospective

Implementation baseline: `ec571b50e7684a7392b230d13b1c58c95b0b95d1`.
Independent reviewers used the implementation diff against that baseline.

## Standards

No documented-standard breaches or actionable baseline smells found.

The change stays within persistence, documents the public contract, and adds
behavioral tests through the Save / Restore Boundary, real engine, and public
storage adapter. Storage inspection checks the documented raw-byte preservation
behavior. The delegation wrappers express distinct public operations: ordinary
save, confirmed replacement, and migration.

## Spec

The initial review found one P2: validation checked pending-input consistency
only when the Turn already said `awaitingInput`. A damaged save could change
the Turn to `active` while retaining its active event and awaiting-input progress.
Restoration accepted it, allowing a later `ADVANCE` to select again and consume
randomness instead of reporting damaged data.

The regression reproduced that failure before the fix. Validation now treats
any pending-input signal as requiring agreement across the Turn, active event,
and EventProgress. Re-review checked genuine engine checkpoints and confirmed
the fix is compatible with them. No scope creep or remaining spec findings.

Final review totals: Standards 0; Spec 0. The initial Spec P2 was fixed.

## Verification

All 127 tests pass, including 28 Save / Restore Boundary tests. Typecheck and
build pass. Existing CI runs those npm scripts on Node 22 and 24; no duplicate
guardrail is needed. Tests use the real engine and a storage adapter at the
approved seam, including recreation of the default localStorage store.

## Environment improvement candidates

1. **Tracker access, low:** `docs/agents/issue-tracker.md` names only `gh`, whose
   network access was blocked in this session. The connected GitHub tool read
   the issue and comments successfully. Document that read fallback so future
   sessions can proceed without unnecessary network escalation.
2. **Skill navigation, low:** The initial lookup assumed `skills/implement/`,
   while the installed skill lives at `skills/engineering/implement/`. A compact
   workflow index with actual relative paths would remove that failed lookup.

These are suggestions for a later environment update. No workflow instructions
or repository access settings were changed as part of issue #9.
