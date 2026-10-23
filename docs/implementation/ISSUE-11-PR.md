## Summary

Closes #11. Adds the Traditional Chinese player UI with a narrative homepage,
optional assessment, family reveal/reroll, responsive gameplay and safe local saves.

```text
React presentation + local reading/tab state
  → player session commands
    → family generation / read-only engine view / transitionAndSave
    → classified persistence / confirmed replacement / migration
```

The homepage has five narrative sections, four original SVG household sketches
and a persistence-driven action bar. Gameplay presents engine-approved choices,
automatic story sequences, reactions, authored parent thoughts and accumulated
family records. Completion reopens the existing log read-only; later-ticket review
generation, themes, editable key moments and sharing remain out of scope.
The log uses one compact row per confirmed event, showing its title and choice
without repeating full narrative or creating separate planning/reaction records.

## Evidence

- **Before:** No browser application or player UI existed. The first public-view
  and session tests failed because the interfaces did not exist.
  **After:** The player can complete or skip the assessment, reroll and confirm
  a family, traverse all 12 stages and reopen the saved records without advancing.
- **Before:** Retrying a save conflict could replace another tab's newer progress;
  a later failed automatic checkpoint could prevent a valid retry.
  **After:** Regression tests verify conflict preservation and retrying the exact
  in-memory result without replaying choices or randomness.
- **After:** `npm test`: 166 tests in 10 files; `npm run test:e2e`: 16 Chromium
  desktop/mobile cases; `npm run typecheck`, `npm run build`, `git diff --check` pass.
  The compact-log follow-up additionally reran the two affected desktop/mobile flows.
- **Review:** Standards identified one duplicated choice renderer; Spec identified
  completed-record routing, missing polite story announcements and missing
  presentation-state tests. All four findings were fixed and independently rechecked.
- **Visual evidence:** Playwright writes homepage/gameplay/large-text screenshots
  to ignored `test-results/`. Local screenshot inspection verified the original
  homepage, three-column gameplay and mobile layout. Manual accessibility and
  physical-device validation remain listed in [Player UI](../PLAYER_UI.md).

## Merge Danger

**Door:** two-way

Code can be reverted. Starting a new story or migrating explicitly preserves the
original local data before replacement; cancelling never clears the old story.
Browser data deletion can still remove both active and preserved saves.

**Blast Radius:** UI

Adds React, Vite, component testing and Playwright. The existing engine algorithms
and save schema versions are unchanged; the engine gains a read-only presentation
boundary and persistence gains a classified homepage boundary. Existing CI runs
unit/component tests, typecheck and build. Playwright runs separately after browser
installation. Existing Vitest 3 development dependency audit advisories require a
separate toolchain upgrade; this issue does not upgrade the test runner major version.
