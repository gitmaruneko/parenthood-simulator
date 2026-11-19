# Issue #67 — Decision Dialog delivery

2026-11-19 (Asia/Taipei). Scope: [#67](https://github.com/gitmaruneko/parenthood-simulator/issues/67).
Review baseline: `e319d09759e361104d1c80a0ea9745b9a26ed61d`; implementation: `3f0a7d5`.

## Standards

No findings. The changes are focused, functional behavior has React and browser
coverage, and the affected contracts are documented as required by `AGENTS.md`.
The optional annotation follows the existing Zod/inferred-type pattern. No
actionable baseline code smells were identified.

## Spec

No findings. Both fixed prompts and option hints are removed. Author
classifications have a neutral fallback; description references and save/error
states remain readable. Modal behavior, focus, Session commands, engine mechanics,
event copy, and persistence are preserved. The optional classification field is
the presentation boundary; #68 supplies the versioned author catalogue.

Review totals: Standards 0; Spec 0. No outstanding issue on either axis.

## Verification

- Red: the restored Session/React test failed on the old category; the four
  authored-category tests failed because the annotation was not yet supported.
- Focused Session/React: 11 tests passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run build`: passed.
- `npm.cmd run test:e2e -- tests/e2e/decision-dialog.spec.ts tests/e2e/story-reading.spec.ts`:
  12 passed across desktop and mobile. Covers native modal/inert background,
  keyboard trapping, restored pending, large text and short viewport, save errors,
  duplicate choice, exact-result retry, conflicts, and old-record focus/viewport.
- Visually inspected generated `test-results/decision-modal-mobile.png` and
  `test-results/decision-short-desktop.png`: action text wraps; the final action
  remains reachable. These generated files are ignored and can be regenerated
  with the browser command above.
- `npm.cmd test`: 800 tests passed across 35 files, including legacy saves,
  frozen release catalogues, complete checkpoint/restore, Journal, review and replay.

Manual validation remains: physical screen-reader announcements, physical device
Safe Area, and native 400% browser zoom. Chromium emulation does not establish
those results. No release/default-content switch or deployment was performed.

## Prepared PR body

### Summary

Closes #67. Normal decisions show the category, title, situation, and actions.

```diff
 DecisionDialog
-  Fixed selection prompts and anticipated-judgment hints
+  Authored experienceType label, or neutral 生活抉擇
   Submission, save recovery, modal, and focus behavior
```

### Evidence

**Before:** restored-dialog and authored-category tests failed against the old
implementation. **After:** focused Session/React tests, desktop/mobile browser
checks, typecheck, and production build pass; see verification above.

### Merge Danger

**Door:** two-way. No save migration or content rewrite.

**Blast Radius:** Dialog. Existing releases receive the simplified presentation;
#68 must supply same-release author classifications through the documented field.

## Retrospective

The workflow pointer in `AGENTS.md` names skills under `skills/`, while the actual
implementation skill is `skills/engineering/implement/SKILL.md`. A direct path
would avoid the failed initial lookup. No workflow changes were made in this
feature. Existing CI already runs tests, typecheck, build, and browser acceptance.
