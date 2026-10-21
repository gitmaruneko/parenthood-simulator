# Implementation Plan

## Phase 1: Foundation

- Define the core simulation state and turn/day loop.
- Add a minimal application entry point under `src/`.
- Establish a test setup under `tests/`.

## Phase 2: Core simulation

- Implement needs, resources, relationships, and event resolution.
- Add deterministic randomization for reproducible tests.
- Document the public interfaces and state transitions.

## Phase 3: Player experience

- Build the decision and feedback flow.
- Add persistence for a family run.
- Validate balancing through scenarios and playtests.
