# Formal Spec: 《今天也在養小孩》MVP 事件引擎與家庭生活回顧

設計補充（2026-10-23）：[家庭生活方向](../FAMILY_LIFE_DIRECTION.md) 定義主畫面隨時單選切換、只影響尚未抽選事件，以及 PRNG／AgeStage／Persistence／Gameplay UI 的邊界。本次使用者已確認將首版納入實作，補充 Spec #28 與 Tickets #29、#30 的範圍及驗收見 [實作決議](../FAMILY_LIFE_DIRECTION_IMPLEMENTATION.md)；不改變以下既有 MVP 核心規則。

## Problem Statement

《今天也在養小孩》目前有完整的遊戲理念與內容方向，但若把每個年齡階段簡化成一題選擇題，遊戲會變成問卷，而不是能呈現家庭因果關係的人生模擬。

MVP 需要一個可重現、可測試、可擴充的事件引擎，讓玩家的行動能透過家庭成員、外界反應、隱形負擔、排程事件與關係修復，持續影響之後的生活。

## Solution

建立一個與 React UI 分離的純 TypeScript 事件引擎。引擎以明確的狀態轉換處理家庭生活，並將時間與故事拆成三個不同層級：

- `AgeStage`：孩子成長的年齡階段，共 12 個固定里程碑。
- `EventNode`：事件圖中的單一故事節點，可以是玩家決策、人物反應、環境事件、支持或修復。
- `Turn`：一次完整的故事推進循環，包含一個或多個 `EventNode`。一個 `AgeStage` 可以包含多個 `Turn`。

一局遊戲目標為 10–15 分鐘。每個 `AgeStage` 通常處理 1–4 個 `EventNode`，硬上限為 6 個；每個 `Turn` 不固定節點數量，但硬上限為 4 個節點。每個 `Turn` 必須具備明確結束條件，並使用節點上限與循環保護確保終止。

故事推進形狀為：

```text
玩家行動或自動事件
  → 人物／環境反應
  → 即時家庭狀態變化
  → 關係記憶、旗標或排程後續
  → 同一 AgeStage 或後續 AgeStage 的事件
```

## User Stories

1. As a prospective or current caregiver, I want to start a game without an account, so that I can try the experience immediately.
2. As a player, I want to skip the five-question opening assessment, so that the assessment never blocks play.
3. As a player, I want the opening assessment to describe current situational tendencies rather than diagnose my personality, so that the game does not label me as a type of parent.
4. As a player, I want a family to be generated from a seed, so that each run has a distinct but reproducible starting situation.
5. As a player, I want to redraw the family, so that I can explore another situation without manually configuring every parameter.
5a. As a player, I want the generated family conditions explained in neutral everyday language, so that I understand how work, care participation, and household composition may affect routines without being told which family is better.
5b. As a player, I want any real-world statistics used in a family explanation to include a verifiable source, so that contextual information is not presented as an unsupported prediction about my family.
6. As a player, I want family composition, care participation, and work arrangement to vary independently, so that a two-caregiver household can still operate like a pseudo-single-parent household.
7. As a player, I want to use neutral caregiver language or a preferred form of address, so that the game does not assume that the mother is the primary caregiver.
8. As a player, I want an age stage to contain several connected story events, so that a situation such as starting preschool, refusing to enter the classroom, and arriving late to work can unfold as one lived experience.
9. As a player, I want a story turn to resolve one or more event nodes, so that reactions and consequences can happen without turning every beat into a separate question.
10. As a player, I want some event nodes to ask for input and others to advance automatically, so that the game can represent both decisions and ordinary life.
11. As a player, I want to see only choices that are currently executable, so that unavailable family members or resources do not create nonsensical options.
12. As a player, I want important choices to produce relationship memories, flags, or future events in addition to resource changes, so that choices affect the family rather than only a status bar.
13. As a player, I want partners, children, grandparents, teachers, colleagues, and strangers to react independently, so that the same action can receive support, criticism, neutrality, or no reaction.
14. As a player, I want external reactions to be uncertain but reproducible, so that social pressure is not a fixed moral punishment while the same run remains testable.
15. As a player, I want planning work such as remembering, coordinating, and following through to affect later scenes, so that invisible labor has narrative consequences.
16. As a player, I want rest, support, delegation, and repair to reduce or transform accumulated burden, so that fatigue is not an irreversible punishment.
17. As a player, I want every run to contain at least two multi-turn chains, a support event, a repair event, and an invisible-planning event, so that the MVP demonstrates its core identity.
18. As a player, I want the game to complete all 12 age stages even when resources are low, so that a single choice cannot end my family story.
19. As a player, I want optional knowledge cards after an event result, so that I can learn without being told which choice was correct.
20. As a player, I want a completed run to become a family-life record, so that I can review what happened instead of receiving a good/bad score.
21. As a player, I want the review to show key moments, support, repair, themes, and resource context, so that the ending reflects the whole run.
22. As a player, I want the system to choose three key moments and let me adjust them, so that the review is useful without requiring manual curation throughout play.
23. As a player, I want to replay the same seed with different choices, so that I can compare decisions under the same circumstances.
24. As a player, I want to redraw a new family after finishing, so that I can explore a different care situation.
25. As a player, I want a safe text summary to share, so that sharing does not accidentally expose real names, birthdays, health information, or sensitive resources.
26. As a content author, I want event nodes to reference follow-ups, reactions, and knowledge cards by stable IDs, so that content can grow without embedding rules in UI components.
27. As a content author, I want schema and cross-reference validation, so that invalid content fails before it reaches players.
28. As a developer, I want the same initial state and player action sequence to produce the same complete event trace, so that regression tests can reliably reproduce bugs.
29. As a developer, I want save files to preserve event progress and PRNG state, so that refreshing the page does not silently change the story.
30. As a developer, I want incompatible or damaged saves to produce a recoverable error path, so that player data is never silently discarded.

## Implementation Decisions

### Core event engine

- The engine is pure TypeScript and independent of React.
- State transitions are explicit and deterministic.
- The engine exposes one public transition boundary for advancing a story turn from the current state and player input.
- A transition may emit one or more `EventNode` results until it reaches a player-input boundary or a terminal turn boundary.
- Each node explicitly declares whether it is `PLAYER_INPUT_REQUIRED` or `AUTO_ADVANCE`.
- The engine, not the UI, owns eligibility, event selection, reactions, follow-ups, state changes, and turn termination.
- A `Turn` has explicit terminal conditions, a per-turn maximum node count, and cycle protection.
- An `AgeStage` has a stage-level node budget and advances only after its active turns have ended.
- The 12 age milestones remain independently configurable. The initial GDD values are 2, 6, 10, 15, 21, 27, 33, 39, 45, 52, 61, and 71 months.

### Randomness and reproducibility

- `seed` is used only to initialise the PRNG.
- The current PRNG state is stored in `GameState` after every deterministic transition.
- No engine rule may use an uncontrolled random source, current time, network response, or iteration-order accident.
- The same initial state and the same player input sequence must reproduce the same event nodes, reactions, follow-ups, state changes, and final review.
- A family redraw creates a new seed and a new run.

### Event model

- `EventNode` is the atomic story node, not necessarily a question.
- Supported node roles include choice, reaction, routine, support, repair, and environment progression.
- Choice nodes expose 2–4 currently executable choices. Non-choice nodes may have no player input.
- A choice may produce any combination of resource deltas, relationship memories, flags, scheduled follow-ups, eligibility changes, and story entries.
- Immediate follow-ups may occur in the current Turn. Scheduled follow-ups may occur in a later Turn within the same AgeStage or in a later AgeStage.
- Event chains usually contain 2–4 nodes and may interact with other chains.
- Reasonable graph cycles are allowed in content, but runtime traversal must terminate through explicit conditions, node budgets, cooldowns, or visited-state guards.
- If no eligible event exists, the engine uses a safe fallback node that preserves progress without inventing an invalid choice.

### Reaction system

- Reactions are resolved by an independent mechanism rather than hard-coded to a particular player choice.
- A reaction resolver considers actor availability, role tendencies, current context, recent memories, event location, and the seeded PRNG.
- Reaction pools may yield support, neutral response, criticism, or no reaction.
- A player action may influence reaction weights, but no action is permanently mapped to a moral reaction.
- The observed reaction is recorded separately from the player's anticipated judgment.

### Family and player state

- Family generation separates household composition, care participation, and work arrangement.
- The MVP supports a primary caregiver, one child, and up to two persistent household or support actors. Other people may appear as transient event actors.
- Persistent actor behavior is described by availability, initiative, ownership of complete workflows, reliability, and boundary respect.
- Visible resources are `finances`, `energy`, `support`, `timeFlexibility`, and `connection`, each clamped to 0–100.
- `support` represents currently available support capacity, not the count of people in the player's life.
- `connection` represents overall caregiver-child connection, not a child approval score.
- `planningLoad` is an internal state whose narrative effects are visible but whose number is not shown as a player-facing score.
- Relationship outcomes use concrete memories, tendencies, flags, and history rather than a single relationship meter.
- Low resources never produce a Game Over or fixed failure ending.

### Family reveal, reroll, and condition explanations

- After family generation and before the first AgeStage, the player sees a family reveal that answers: 「從今天開始，我要經營一個怎樣的家庭？」
- The reveal summarises household composition, care participation, work arrangement, and available support context from the generated `FamilyProfile`.
- The player may reroll before starting. A reroll creates a new seed and a fresh initial `GameState`; it must not mutate the previous family in place or retain event progress, history, or scheduled events.
- The immediately rerolled family should not repeat the same household-composition, care-participation, and work-arrangement combination when another valid combination is available.
- Family-condition explanations are content keyed by existing family dimensions. They may describe possible effects on routines such as drop-off, meal preparation, scheduling, hand-offs, and access to support.
- Explanations must use conditional, non-judgmental language. They must not claim that one family structure is happier, that one income level determines parenting outcomes, or that a generated condition predicts success or failure.
- An explanation that uses a real-world statistic must include a verifiable source reference and review status. Unsourced statistics must not be shown in public MVP content.
- The explanation catalogue is presentation content derived from the existing family state; it does not create a second family model or place family-generation rules in React.

### Opening UX and visual direction

- Detailed homepage and gameplay UI contracts are maintained in [MVP UI/UX Spec](../UI_UX_SPEC.md). Section 10 defines the original family-life vignettes, homepage wireframes, component responsibilities, persistence-driven Floating Action Bar states, safe restart confirmation, accessibility, and homepage acceptance criteria for Issue #11.

- The family reveal may borrow the sense of ceremony associated with beginning a life story, but it must use an original visual language grounded in everyday family life.
- Visual motifs should come from household routines, shared spaces, schedules, bags, meals, toys, notes, and care hand-offs rather than imitating 《80億分之1》's identity, record, or life-summary presentation.
- The player is positioned as someone beginning to care for and organise a household, not as a child discovering which life they were born into.
- The opening must remain warm, mobile-first, accessible, and non-shaming.

### Gameplay UI and responsive information architecture

- The visual direction is a warm family-life journal combined with an information-rich simulation dashboard. 《80億分之1》 may inform the goal of keeping character, state, and history legible, but its visual style, layout, identity-record framing, and assets must not be reproduced.
- At desktop widths, gameplay uses three columns: family profile and resources on the left; scene, current event, and family log in the centre; family members, parent thoughts, and growth timeline on the right. The centre remains the primary interaction region.
- At mobile widths, gameplay uses a single-column story view with bottom tabs for life, family, records, and thoughts. Mobile is a reprioritised experience rather than a compressed three-column layout.
- The interface displays `AgeStage` and `Turn` separately and supports `PLAYER_INPUT_REQUIRED`, `AUTO_ADVANCE`, reactions, follow-up narrative, visible resources, accumulated family records, save status, and safe recovery errors.
- Invisible planning load is presented through authored parent-thought and follow-up narrative. The UI must not expose it as a moral score, diagnosis, or irreversible punishment meter.
- UI components render public engine and persistence outputs and submit commands. They do not own PRNG, eligibility, reaction selection, state transitions, scheduling, Turn termination, or save migration rules.
- The detailed wireframes, component responsibilities, responsive rules, accessibility requirements, and UI acceptance criteria are defined in `docs/UI_UX_SPEC.md`.

### Opening assessment

- The assessment has five optional situational questions. Dinner and restaurant each have six candidate actions (four initially visible, remainder expandable); the other questions have four. These are hypothetical scenarios before family generation and do not change the EventNode choice limit.
- Answers contribute a weighted vector across multiple narrative tendencies.
- The result displays two or three text descriptions as current tendencies, not a diagnosis or fixed type.
- Skipping uses neutral tendencies.
- Tendencies may shift through later choices.
- The assessment never determines family wealth, child temperament, fixed options, parenting success, or a fixed ending.

### Content and validation

- The formal MVP release contains 30 complete event nodes or node definitions. Six to ten events are sufficient for the earlier playable prototype milestone.
- The 30 events are connected through event chains and eligibility rules rather than presented as 30 independent questions.
- All four baseline household situations must be able to complete the 12 age stages through the same content system.
- Content is stored as JSON or TypeScript data and validated through schemas before use.
- In addition to Zod schema validation, the content validator checks:
  - unique and valid Event IDs;
  - valid follow-up event references;
  - valid knowledge-card references;
  - valid reaction-pool references and reaction kinds;
  - legal weights and cooldowns;
  - valid age ranges and eligibility conditions;
  - graph reachability from configured entry points;
  - valid fallback coverage;
  - allowed cycles with runtime termination guarantees.
- Knowledge cards are optional and appear after results. Health, safety, and medical cards require reliable sources and review status; unreviewed cards must be explicitly marked as drafts and must not use authoritative wording.

### Persistence

- Local persistence stores `GameState`, PRNG state, current event progress, scheduled events, choice history, and schema version.
- Saves are written after each completed event node and at Turn boundaries.
- Restoring a save in the middle of an event and after a Turn must produce the same continuation as uninterrupted play.
- Save migrations are versioned and explicit.
- An incompatible or corrupted save must show a safe recovery path and preserve the original data for inspection or retry; it must never silently delete the player's run.

### Ending review

- Completing the final AgeStage produces a family-life review for the period from birth to approximately six years old.
- The review is a chapter record, not a lifetime forecast, ranking, or parenting judgment.
- It includes a family summary, narrative overview, 12-stage timeline, three system-selected key moments that the player may adjust, support and repair moments, end-state resource context, one or two soft narrative themes, and safe share text.
- The six GDD themes are labels for the review, not six fixed routes or family types.
- The review offers replay with the same seed and a new-family run.

### Acceptance Criteria

- A new player can start without registration and complete a full run in the target 10–15 minute range during usability validation.
- The opening assessment can be completed or skipped without changing the engine's ability to start a valid family run.
- Before the first AgeStage, the player can review the generated household composition, care participation, work arrangement, support context, and neutral condition explanations.
- Rerolling creates a new seed and a fresh initial GameState, clears all run progress, and avoids immediately repeating the same family-dimension combination when another valid combination exists.
- The same seed and assessment answers reproduce the same family and the same explanation IDs; the UI does not independently generate or reinterpret family conditions.
- Family explanations do not rank family structures, predict happiness, or present income as a deterministic parenting outcome.
- Any real-world statistic shown in a family explanation includes a visible, verifiable source; unsourced statistics are rejected from public MVP content.
- The opening family reveal communicates 「從今天開始，我要經營一個怎樣的家庭？」 through an original household-oriented visual language rather than reproducing 《80億分之1》's interface.
- At desktop widths, the gameplay view provides the defined three-column information architecture; at mobile widths, the story remains the primary single-column view and family, records, and thoughts remain available through bottom navigation.
- `AgeStage`, age context, current `Turn`, and save status remain understandable on desktop and mobile without treating an AgeStage as a Turn.
- `PLAYER_INPUT_REQUIRED` and `AUTO_ADVANCE` have distinct, accessible presentation states; reading controls for automatic narrative do not alter engine results.
- Person reactions, follow-up stories, family resources, parent thoughts, and committed family-life records remain traceable without revealing scheduled future events.
- Planning-load narrative can visibly change after support, rest, delegation, or relationship repair, and is not presented as a parenting score or diagnosis.
- Save failures and incompatible or corrupted saves show readable, non-destructive recovery choices.
- Responsive UI, keyboard navigation, focus management, reduced motion, colour-independent status, and Traditional Chinese readability meet the acceptance criteria in `docs/UI_UX_SPEC.md`.
- React UI does not implement PRNG, event eligibility, reaction selection, resource transitions, scheduling, Turn termination, or persistence migration rules.
- The engine distinguishes `AgeStage`, `Turn`, and `EventNode` in its observable progression data.
- One AgeStage can contain multiple Turns, and one Turn can contain multiple EventNodes.
- A Turn stops at player input, a valid terminal condition, or a configured node limit; it cannot run indefinitely.
- A content cycle that does not reach a terminal condition is stopped by cycle protection and produces a safe diagnostic or fallback result.
- Immediate and scheduled follow-ups can affect the same AgeStage and a later AgeStage.
- A choice can change future eligibility or schedule a later event without changing a visible resource immediately.
- Reactions are not hard-coded as one-to-one results of choices; the same reaction pool can produce different seeded outcomes.
- Reactions include support, neutral, criticism, and no-reaction outcomes where the content allows them.
- Repeated planning work can produce later fatigue, coordination, or repair content rather than only a numeric increment.
- Rest, support, delegation, and repair can reduce or transform planning burden and do not create an irreversible punishment.
- Every complete run contains at least two cross-Turn event chains, one support event, one repair event, and one invisible-planning event.
- All five visible resources remain within 0–100 and never independently cause Game Over.
- The same initial `GameState` and player action sequence produce the same complete event trace, reaction trace, scheduled events, final state, and ending review.
- The engine's continuation does not change when a saved PRNG state is restored.
- Content validation rejects duplicate IDs, missing references, invalid weights, invalid reaction definitions, unreachable required content, and unsafe fallback gaps.
- Content validation permits explicitly supported graph cycles only when runtime termination remains guaranteed.
- A save contains state, PRNG state, event progress, scheduled events, choice history, and schema version.
- A save made mid-event and a save made at a Turn boundary can be restored without silently changing the story.
- An incompatible or corrupted save shows a recoverable error state and does not silently delete player data.
- A completed review includes the required summary, timeline, key moments, support/repair history, theme labels, resource context, and safe share text.
- No public MVP content presents unreviewed health or safety information as authoritative advice.

## Testing Decisions

Tests should verify externally observable behavior through the highest useful boundary and should not assert React implementation details or private helper structure.

### 1. Core Event Engine Public Boundary

Test the pure engine transition boundary with fixed initial state and explicit player inputs. Cover AgeStage/Turn/EventNode progression, player-input and auto-advance nodes, node limits, cycle guards, event eligibility, reactions, planning-load consequences, follow-ups, fallback behavior, endings, and full deterministic replay.

Use property-style cases where useful: resources remain clamped, every automatic traversal terminates, and identical inputs produce identical traces.

### 2. Content Schema Validation

Test valid and invalid event data through the content validator. Cover schemas, unique IDs, cross-event references, knowledge cards, reaction pools, weights, age ranges, reachability, fallback coverage, and permitted cycles.

### 3. Save / Restore Boundary

Test serialization and restoration at an event boundary and a Turn boundary, including PRNG state, scheduled events, choice history, schema version, migrations, corrupted data, incompatible versions, and safe recovery behavior.

The existing repository has no established UI test suite yet. The implementation phase should use component tests with fixed presentation snapshots and command spies, without recreating engine rules in test fixtures. Playwright should cover player-visible flows such as completing or skipping the assessment, viewing family-condition explanations, rerolling a family, starting, traversing `AUTO_ADVANCE`, choosing at `PLAYER_INPUT_REQUIRED`, seeing a person reaction and follow-up, completing a Turn, switching mobile information tabs without changing game state, refreshing, restoring, recovering from a save error, and completing a review. Desktop and mobile viewports must both be covered.

## Out of Scope

- Implementing the engine, UI, schemas, or tests in this specification task.
- A complete simulation beyond approximately six years old.
- Seven-to-eighteen-year-old content.
- 100 or 150 event expansions.
- A full free-roaming daily schedule or real-time sandbox.
- User accounts, backend services, cross-device saves, or a database.
- A CMS or spreadsheet import pipeline before JSON/TypeScript content proves insufficient.
- Parenting scores, rankings, good/bad parent judgments, or fixed failure endings.
- Diagnosing player psychology, child personality, or future life outcomes.
- Automatically importing private forum posts or treating social media discussion as representative statistics.
- A complete final visual-art system beyond the defined mobile-first, warm, non-shaming, household-oriented opening principles.

## Further Notes

- The GDD remains the product baseline; this spec resolves its MVP event-engine ambiguities.
- The system should keep event rules, content data, persistence, and UI responsibilities separate so content can expand without rewriting the engine.
- A later `/to-tickets` pass should split this spec into content model and validator, deterministic engine, reaction and scheduling system, persistence and migrations, opening flow, review page, and automated test tickets.
- The exact 30-event content list, detailed art system, prose, and professional review workflow should be refined as implementation-ready tickets, not improvised inside the engine.
