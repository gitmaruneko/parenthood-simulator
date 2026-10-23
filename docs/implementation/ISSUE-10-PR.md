## Summary

Closes #10. Adds an opt-in executable MVP ContentPack with 32 story nodes,
one safe fallback and 12 draft knowledge cards across all 12 AgeStages.

```text
seeded family actors → createMvpContent → existing transitionGame

night handoff / preschool handoff:
Turn 1: decision → reflection → Turn end
Turn 2: support or strain → reconnect decision → repair
```

Family-specific choices respect actor membership; reactions retain seeded
participation parameters. Different decisions leave different follow-ups,
planning load and story history. Result cards remain optional post-choice content.
See [content manifest and contract](../MVP_CONTENT.md).

## Evidence

- **Before:** Content contract test failed because the MVP module did not exist.
  **After:** The pack passes individual Zod checks and cross-event validation.
- **Before:** Full-run integration found no support moment on the carry-only
  path in all four family scenarios.
  **After:** A reusable checklist provides a reachable support moment and
  reduces invisible planning work regardless of the two chain decisions.
- **After:** All 33 Event IDs actually resolve across complete runs. Two
  cross-Turn chains replay identical full transitions with the same seed and
  decisions. Four family scenarios, actor-specific choices and exhausted
  resources complete all 12 stages within existing budgets.
- **After:** `npm test`: 143 tests across seven files pass;
  `npm run typecheck`, `npm run build` and `git diff --check` pass.
- **Review:** No documented-standard breaches or spec findings. The Standards
  review's positional-behavior concern was addressed by keeping chain and
  reflection metadata with each topic; verification passes after the change.

## Merge Danger

**Door:** two-way

Content is opt-in and changes no engine, domain or persistence contracts.

**Blast Radius:** Content

All knowledge cards remain visibly marked drafts pending editorial and
professional review; none claim reviewed medical or safety guidance.
Later UI presentation and generated family reviews remain outside this issue.
The candidate backlog retains its existing per-item status; similar themes
are not treated as completed designs.
