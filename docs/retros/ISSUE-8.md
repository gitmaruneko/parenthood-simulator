# Issue #8 retrospective

## Review outcome

The Spec review caught a real integration gap: the first reference planning task
could fall through to stage completion. The original test sent `END_TURN` before
the player would encounter that gap. The corrected test uses ordinary `ADVANCE`
and explicit lifecycle commands only at returned Turn boundaries. Both rest and
delegation now reach repair within the six-node budget.

The Standards review identified stage-budget recovery coupled to story ID
formatting. Base node history now records `resolvedEventId`, and a regression
proves that an extra support note does not count as a resolved node.

Both review axes passed after fixes. Existing CI already runs tests, typecheck,
and build on Node 22 and 24; this session used those same npm scripts locally.

## Environment improvement candidates

1. **Workflow, medium:** Have `implement` record its starting commit and pass it
   to `code-review`. The review skill currently asks for a fixed point when the
   user omits one, although the implementation session already knows the correct
   baseline. This session used `ce1659bd4d258be2e0a42bd2a627b5a38adc51d4`.
   A future skill edit should make that handoff explicit; no new always-loaded
   instructions are needed.
2. **Windows verification, low:** Document `npm.cmd` for PowerShell environments
   that block `npm.ps1`. It runs the existing package scripts without changing
   execution policy. The first verification attempt hit that environment issue;
   later runs used `npm.cmd` successfully.

These are suggestions for a later workflow update. The functional regressions
found during this session are covered by automated tests in this change.
