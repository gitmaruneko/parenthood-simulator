# MVP integration acceptance — Issue #13

UX v2 T6 (#40), 2026-11-01: current UX and Save v1–v7 verification is recorded in
[UX v2 integration acceptance](UX_V2_ACCEPTANCE.md). Counts and the human
playtest below are historical MVP evidence, not a sign-off for the redesigned UI.

Acceptance date: 2026-10-24 (Asia/Taipei). Parent: GitHub #1. Dependencies
#9, #10, #11 and #12 were CLOSED when checked. This report records evidence;
it does not declare the MVP formally accepted while sign-offs remain pending.

## Verification

Run from the repository root (use `npm.cmd` instead of `npm` in Windows
PowerShell if execution policy blocks `npm.ps1`):

```sh
npm test
npm run typecheck
npm run build
npm run test:e2e
```

The Vitest command includes content schema validation and engine integration.
The CI `verify` job runs it, typechecking and build on Node 22 and 24. The new
`browser` job installs Chromium and runs both desktop and mobile projects;
failed runs retain `test-results/` for seven days. Local execution is evidence
for this checkout, not proof that a remote GitHub Actions run passed.

Local final verification passed: **199 Vitest tests across 13 files**, **22
Playwright cases** (11 each desktop/mobile), typechecking and the production
build. The acceptance-only Vitest file also passed independently (four cases).
These tests verify existing product behavior; no new gameplay implementation
or artificial failing test was needed.

Remote CI run [40104636559](https://github.com/gitmaruneko/parenthood-simulator/actions/runs/40104636559)
passed both Node verification jobs but failed nine browser cases. The tests
read storage before yielded startup saves completed, checked a controlled radio
before its asynchronous update, and inspected the ending before the last
transition completed. Browser tests now wait for the header's saved status
after starting a family and after each playthrough action, and assert radio
selection with a retrying expectation after clicking. A temporary 100 ms delay
on zero-delay browser timers reproduced all failure types before the fix;
all 22 cases passed with that delay after the fix. The timer override was
removed afterward. A successful remote run of the fix remains required.

## Issue #13 technical criteria

| Criterion | Evidence |
| --- | --- |
| Identical initial family, seed and explicit actions reproduce events, reactions, schedules, state and review | `tests/mvp-acceptance.test.ts`: seed 42, `coordinate` and `carry`; record public inputs, compare every complete transition on replay, then compare final state and generated review. |
| Mid-event and Turn-boundary restore preserves continuation | Same test reloads the public local-save store after every transition; asserts pending-choice, completed-turn and pending-schedule checkpoints were reached. Automatic resolved-node checkpoints also round-trip and reproduce their next transition. `tests/persistence.test.ts` covers smaller diagnostic fixtures. |
| Damaged/incompatible saves preserve player data | `tests/persistence.test.ts`: raw bytes retained, conflict checks, explicit backup/replacement, quota failures. `tests/e2e/player-flow.spec.ts`: corrupt and future-version saves preserve original bytes through recovery and only replace after confirmation. |
| At least 30 MVP EventNodes validate and execute | `tests/mvp-content-validation.test.ts` validates schemas and references; `tests/mvp-content-engine.test.ts` actually reaches every authored ID across complete runs. Current catalogue: 32 story nodes plus one safe fallback, 12 knowledge cards. |
| Turn limit, AgeStage limit, cycle protection | `tests/event-engine.test.ts`: four-node Turn limit, six-node stage budget across Turns, guarded repeats and safe cycle diagnostics. MVP integration asserts trace budgets throughout real content. |
| Browser start, assessment, choices, save, restore, review | `tests/e2e/player-flow.spec.ts`: both desktop and mobile; complete/skip assessment, start/reroll, choice/reaction, refresh/restore, complete 12 stages, edit/reopen review, replay confirmation. |

## Issue #13 gameplay criteria

| Criterion | Evidence / status |
| --- | --- |
| All 12 AgeStages, including stages with multiple Turns | `tests/mvp-content-engine.test.ts` completes four household/care scenarios with both base decisions; `tests/family-review.test.ts` verifies multiple Turns and full timeline. Browser completion reaches `AgeStage 12 / 12` and all twelve timeline entries. |
| Two cross-Turn chains actually occur | MVP engine tests locate `night-handoff` and `preschool-handoff` choices, subsequent support/strain and repair, require different Turn IDs and consumed schedules. New acceptance tests also locate both later strain branches. |
| Diverse reactions independent of a single choice | New acceptance test chooses `coordinate` at the same opening event for seeds 0–31 and observes all four shipped outcomes: understanding, neutral, criticism, none. Engine tests additionally cover independently weighted reactions and saved PRNG traces. |
| Invisible labor produces later narrative | Seed 42 `carry` reaches both scheduled strain scenes. Assertions require the night scene's broken sleep and the preschool scene's interrupted conversation, with different later relationship memories from `coordinate`. |
| Support, rest, delegation or repair can relieve burden | Full MVP `carry` run chooses `pause` at repair decisions and proves the transition reduces planningLoad; later support and repair remain reachable. Engine tests separately exercise rest, delegation and repair. |
| 10–15 minute human playtest and recorded issues | User confirmed a **12-minute** playtest and **雙親照顧** (two-parent care). Completion, seed, decision path, confusing states and blockers have not yet been supplied. Human outcome/sign-off remains pending; browser automation is not substituted for it. |
| Different decisions under one seed affect the family | Seed 42 `coordinate` vs `carry`: same opening, different support/strain follow-ups, relationship memories and generated reviews. Both complete twelve stages. |
| Knowledge cards avoid one correct parenting answer; health/safety advice sourced or draft | All 12 shipped cards carry visible draft labels, `reviewStatus: draft` and a professional-advice disclaimer; schema tests enforce reviewed-card source requirements. Optional result cards are tested by content validation. Editorial assessment of tone remains part of human sign-off. |
| Review describes family context without score/ranking/fixed ending | `tests/family-review.test.ts`: family summary, timeline, key choices, support/repair, one or two themes, resources and safe share text. Theme reachability is tested through actual games. Human assessment of the narrative remains pending. |
| Low-resource, single-caregiver, pseudo-single, two-caregiver and varied care setups complete | MVP engine matrix covers single with backup, shared two caregivers, pseudo-single, multigenerational uneven care, both decision paths; separate exhausted-resource runs complete twelve stages. Browser tests cover desktop/mobile interaction. Human comprehensibility for all setups is not established by engine completion. |

## Parent #1 acceptance traceability

The rows below follow the parent spec's Acceptance Criteria in order. The local
spec additionally expands UI requirements; those are mapped in the final rows.
Paths in the tables refer to tests under `tests/` unless otherwise stated.

| Parent criterion | Evidence / owning ticket |
| --- | --- |
| Registration-free full run in 10–15 minutes | `e2e/player-flow.spec.ts` start/completion (#11/#12); user reports 12 minutes, outcome pending (#13). |
| Complete or skip the optional assessment | `family-opening.test.ts`, browser assessment flows (#9/#11). |
| Reveal family, work, care and neutral explanations before stage one | `family-opening.test.ts`, `family-conditions.test.ts`, `player-session.test.ts`, browser reveal (#9/#11). |
| Fresh reroll clears progress and avoids repeating dimensions | `family-opening.test.ts`: fresh state and all 48 combinations (#9). |
| Seed + answers reproduce family and explanation IDs | `family-opening.test.ts`, `family-conditions.test.ts` (#9). |
| Explanations do not rank structures or predict outcomes | `family-conditions.test.ts` validation; authored catalogue in `src/content/family-conditions.ts` (#9); human tone review pending. |
| Statistics require visible verifiable sources | `family-conditions.test.ts` rejects unsourced/unreviewed statistics (#9). |
| Original household-oriented opening communicates care responsibility | `player-ui.test.tsx`, browser opening screenshots, `docs/FAMILY_OPENING.md` (#9/#11); visual human sign-off pending. |
| Distinct AgeStage, Turn, EventNode | `event-engine.test.ts`, `player-view.test.ts`, browser stage/Turn labels (#4/#11). |
| Multiple Turns per stage and multiple nodes per Turn | `event-engine.test.ts`, `mvp-content-engine.test.ts`, `family-review.test.ts` (#4/#10/#12). |
| Turns stop at input/terminal/node limit | `event-engine.test.ts` (#4). |
| Nonterminating cycles produce safe diagnostics | `event-engine.test.ts`, `content-validation.test.ts` (#3/#4). |
| Immediate and scheduled follow-ups in same/later stages | `event-engine.test.ts` chronological scheduling cases (#4/#5). |
| Non-resource choices change eligibility or schedule events | `event-engine.test.ts` planning, flags and chained scheduling (#5/#6). |
| Reactions not hard-coded to choices | `event-engine.test.ts`, `mvp-acceptance.test.ts` (#5/#13). |
| Support, neutral, criticism and no reaction possible | Same engine cases; shipped content uses `understanding` for supportive response (#5/#10/#13). |
| Repeated planning has later narrative effects | `event-engine.test.ts`, `mvp-acceptance.test.ts` (#6/#13). |
| Rest/support/delegation/repair transform burden | Same tests, plus full content playthroughs (#6/#10/#13). |
| Every full run includes two chains, support, repair, planning | `mvp-content-engine.test.ts` complete-run matrix (#10). |
| Resources clamp to 0–100; no resource Game Over | `event-engine.test.ts`, exhausted MVP runs (#4/#10). |
| Same state/actions reproduce traces, schedule, ending review | `mvp-acceptance.test.ts` full explicit-input replay (#13). |
| Restored PRNG continuation unchanged | `persistence.test.ts`, `mvp-acceptance.test.ts` (#7/#13). |
| Reject bad IDs/references/weights/reactions/reachability/fallbacks | `content-validation.test.ts` (#3). |
| Only guarded content cycles accepted | `content-validation.test.ts`, runtime cycle tests (#3/#4). |
| Save state, PRNG, event progress, schedules, choices, schema version | `persistence.test.ts` (#7). |
| Restore mid-event/Turn without story changes | `persistence.test.ts`, `mvp-acceptance.test.ts` (#7/#13). |
| Recoverable non-destructive incompatible/corrupt saves | `persistence.test.ts`, browser recovery flows (#7/#11/#13). |
| Full review summary/timeline/moments/support/repair/themes/resources/share | `family-review.test.ts`, browser review editing and reopening (#12). |
| Unreviewed health/safety content not authoritative | `mvp-content-validation.test.ts`, `content-validation.test.ts`; draft catalogue (#3/#10); human editorial sign-off pending. |
| Desktop columns and mobile story/navigation | `player-ui.test.tsx`, desktop/mobile browser flow, viewport screenshots (#11). |
| Understandable age, stage, Turn and save status | `player-view.test.ts`, browser labels/save status (#11); human comprehension pending. |
| Accessible distinct input/automatic reading states | `player-ui.test.tsx`, browser reading-without-save-mutation checks (#11). |
| Reactions, resources, thoughts and records without future spoilers | `player-view.test.ts`, `player-ui.test.tsx`, `player-session.test.ts` (#11). |
| Narrative planning effects without player-facing score | `player-view.test.ts`, `player-ui.test.tsx`, planning engine tests (#6/#11). |
| Readable save-error recovery | Browser damaged/incompatible save, storage denial, migration quota flows (#7/#11/#13). |
| Responsive/keyboard/focus/reduced-motion/Traditional Chinese | `player-ui.test.tsx`, browser direction keyboard, dialog focus, 320–1440px, 200% text and reduced-motion flows (#11); subjective readability pending. |
| React excludes engine/randomness/migration rules | Engine/session/persistence public boundaries; `docs/PLAYER_UI.md`, code review (#11/#13). |

## Human follow-up and release gate

Continue the confirmed playtest record with the family seed (if available),
decision path, whether the family review was reached, and any blockers or
confusing states (explicitly say none if there were none). Record fixes and
rechecks for any reported blocker. Use additional household runs to assess
comprehensibility where the automated matrix cannot establish it.

Issue #13 must remain open until human gameplay/editorial sign-off and a
successful remote CI run are recorded. No pending criterion is treated as a pass.
