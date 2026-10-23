# Issue #11 retrospective

Implementation baseline: `41a452d72a0f7df6a03942734960c4086d7fcbb3`.
The user confirmed this review base and the issue's public testing boundaries.

## Standards

Independent review found no documented-standard violations and one judgment-call
duplication: matching and presenting confirmed choices in both story and log.
Both now use `ConfirmedChoice`. Recheck left no unresolved Standards findings.

## Spec

Independent review identified three gaps: completed records initially opened the
life tab, story/reaction updates lacked a polite announcement, and component tests
did not cover every required presentation state. Explicit records navigation and
focus, a short live summary, and fixed-snapshot/command-spy cases resolved all three.
The reviewer rechecked each fix and found no obvious regression or later-issue scope creep.

## Verification lessons

- Test conflict retries and partial traversal failures separately. A newer foreign
  token never authorizes overwrite; a successfully written checkpoint from the
  same traversal must remain usable when storage becomes available again.
- Test the completed-record entry itself. Clicking another tab afterward can mask
  an incorrect landing view or focus target.
- Native modal background isolation did not provide the required Shift+Tab cycle
  in the tested Chromium environment. Explicit wrapping and focus-return assertions
  caught and fixed the gap. The shared `SaveNotice` now has focused recovery tests.
- Keep browser tests stable while they run. Vite reloads on source edits and can
  reset a live test's application; finish the run before changing source files.
- Typecheck caught an unbound variable in a new screenshot helper. Use explicit
  UTF-8 when reading and writing source in Windows PowerShell; its default decoding
  corrupted Chinese projection labels during a formatting cleanup, caught by tests.

## Environment and follow-up validation

`npm.cmd` avoids the local PowerShell script policy. The connected GitHub reader
provided issue #11 after sandboxed `gh` networking failed. Git branch/commit writes
and package/browser installation needed approved sandbox escalation.

The existing CI already runs `npm test`, typecheck and build on Node.js 22/24.
It now includes the component tests through `npm test`; Playwright is an explicit
separate script. A future toolchain maintenance change can address the existing
Vitest 3 development dependency audit advisories rather than mixing a major upgrade
into this UI ticket.

Automated results: 165 tests and 16 desktop/mobile browser cases pass. Screen reader,
physical Safe Area/keyboard, native browser zoom, full WCAG 2.2 AA and target play
duration validation remain manual work, documented in `docs/PLAYER_UI.md`.
