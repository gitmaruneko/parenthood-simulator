## Summary

Closes #12. Completed games now open a family-life retrospective with all twelve
AgeStages, three editable key choices, reactions, support, repair, planning work,
resource context and up to two narrative themes. Includes safe text sharing and
confirmed replay with the same seed or a newly generated family.

```text
completed GameState + ContentPack
  → engine review projection → ReviewScreen
  → selected moments → conflict-checked local save
  → replayOrigin → confirmed family reveal → preserved replacement
```

## Evidence

- **Before:** The first review boundary test failed because `createFamilyReview`
  did not exist. A replay regression then exposed ending tendencies being reused.
  **After:** Tests cover twelve stages, multiple Turns, stable generation, three
  selections, support/repair, six narrative labels, private-data exclusion and
  opening snapshots including rerolled families.
- **After:** 200 unit/component tests pass. All 20 desktop/mobile Playwright
  cases pass, including completing the game, reopening without writes, editing
  key moments and cancelling/confirming seed replay. Typecheck and build pass.
- **Visual evidence:** Browser screenshots in ignored `test-results/` include
  the desktop/mobile review. Mobile top/share/replay sections were inspected.
- Review findings and any fixes are recorded below after independent review.

## Merge Danger

**Door:** two-way

Uses existing original-save preservation and replacement confirmation. Reading
or cancelling does not replace a completed story. Browser data clearing can
still remove both current and preserved saves.

**Blast Radius:** gameplay

Adds optional `replayOrigin` to the v3 save contract. Existing saves still load;
without an opening snapshot, replay rebuilds the default seed opening and cannot
recover past assessment/reroll details. New saves retain the actual actor catalogue,
initial resources, tendencies and PRNG state. Sharing uses controlled static text.
