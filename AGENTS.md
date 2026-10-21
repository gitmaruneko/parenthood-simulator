# Agent Guidelines

## Project structure

- `src/`: application source code.
- `tests/`: automated tests.
- `docs/`: product and implementation documentation.

## Working conventions

- Keep changes small and focused.
- Update documentation when behavior or requirements change.
- Add or update tests for functional changes.
- Use the npm scripts defined in `package.json` for local verification.

## Agent skills

Use the project workflow below for feature work. Keep `grill-me`, `to-spec`,
and `to-tickets` in one continuous context; then choose either `implement` for
ticket-by-ticket work or `implement-spec` for parallel implementation of the
whole spec.

1. `grill-me` → clarify the idea and resolve design branches.
2. `to-spec` → turn the agreed conversation into a GitHub issue spec.
3. `to-tickets` → split the spec into dependency-aware tickets.
4. `implement` **or** `implement-spec` → build the tickets.
5. `code-review` → review standards and spec compliance.
6. `pr` → prepare the pull-request body.
7. `retro` → capture improvements for the next cycle.

The active skills live under `skills/`. Supporting skills required by this
workflow are `grilling`, `tdd`, and `writing-for-agents`. No other project
skills are installed.

The issue tracker is GitHub; see `docs/agents/issue-tracker.md` and
`docs/agents/triage-labels.md`. Domain-document conventions are in
`docs/agents/domain.md`.
