## Summary

Issue #13 adds full-MVP save/replay acceptance coverage and runs desktop/mobile
player flows in CI. Acceptance evidence and parent #1 traceability are recorded
in [MVP_ACCEPTANCE.md](../MVP_ACCEPTANCE.md). The issue remains open for human
gameplay sign-off and a successful remote CI run.

```text
same seed + recorded public inputs
  → engine trace → checkpoint → restored continuation → same family review
CI
  → Vitest (including content validation), typecheck, build
  → Chromium desktop and mobile flows → failure artifacts
```

## Evidence

- **Before:** 195 Vitest tests and 20 local browser cases passed. CI omitted
  Playwright; persistence fixtures did not establish full-MVP checkpoint replay
  through all twelve stages and the generated ending review.
- **After:** 199 Vitest tests pass. Seed 42 plays `coordinate` and `carry` paths;
  each reload reproduces the recorded complete transition and final review.
  Divergent paths reach both support/strain chains, different memories and
  reviews; rest lowers burden. Seeds 0–31 show all four shipped reaction kinds
  for the same authored choice.
- **After:** All 22 desktop/mobile browser cases pass, including future-version
  save recovery and preserved original bytes. Typecheck and production build
  pass. CI now installs Chromium and retains browser failure evidence.
- **Human evidence:** User confirmed 12 minutes and two-parent care. Completion,
  path and blocker/comprehension findings remain unreported. Remote CI has not
  run for these local commits. Neither gate is recorded as a pass.

## Standards

No actionable findings. Changes stay within tests, CI and acceptance
documentation, use approved public boundaries and npm verification scripts.
The replay helper records explicit inputs for checkpoint comparisons, a
different purpose from the existing completion helper.

Standards: 0 findings; no documented-standard violations or material smells.

## Spec

No implementation findings or scope creep. The engine/save boundaries and
shipped content are exercised, and CI includes desktop/mobile Playwright.
Human playtest outcome evidence and a successful remote CI run remain pending.
The provisional local-results paragraph was updated after final verification.

Spec: 0 implementation findings; 2 external acceptance gates pending.

## Merge Danger

**Door:** two-way

Adds tests, CI and documentation. No save-format or gameplay changes.

**Blast Radius:** verification

CI adds a Chromium install and browser job. Failure screenshots/traces are
retained for seven days; tests use fictional families and local browser storage.
