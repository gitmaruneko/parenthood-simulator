# Family generation and optional opening assessment

Issue #4 adds pure opening APIs to `src/engine/index.ts`. The player is the
caregiver addressed in the second person, not an additional actor with a
gendered role. A run includes one child and at most two persistent support
actors. Single-caregiver households can receive support from someone living
elsewhere; income contributors need not be resident caregivers.

## Public boundary

```ts
import {
  createFamilyRun,
  getAssessmentQuestions,
  rerollFamilyRun,
  describeFamily,
  describeTendencies,
} from "../src/engine/index.js";

const questions = getAssessmentQuestions(); // Five questions; dinner/restaurant have six candidates, others four.
const run = createFamilyRun({ seed: 42 }); // Omit answers or use null to skip.
const answered = createFamilyRun({
  seed: 42,
  answers: questions.map((question) => question.choices[0]!.id),
  preferredAddress: "阿晴",
});
const next = rerollFamilyRun(answered, { seed: 43 });
```

- `createFamilyRun` returns `{ state, actors, summary, assessment }`. `state`
  conforms to the existing `GameState` schema; `actors` supplies the definitions
  referenced by `state.family`. `summary` contains second-person opening copy
  and three condition records derived from the existing family dimensions.
- Household composition, care participation, and work arrangement are sampled
  separately. All 3 × 4 × 4 combinations are supported. Pseudo-single care is a
  participation arrangement, not an additional household or moral category.
- Adult availability, initiative, and workflow ownership reflect the current
  care participation configuration. Reliability and boundary respect are drawn
  separately. All generation probabilities, participation ranges, resource
  ranges, and assessment weights are fictional game parameters, not population
  statistics, psychological scales, or predictions of parenting outcomes.
- Generation consumes the seeded PRNG and saves its final state. Assessment
  answers consume no randomness and change only the mutable `state.tendencies`.
  They do not alter the family, actors, resources, eligibility, or ending rules.
- `firstAgeStageId` defaults to `age-stage-1`. This is the configured starting
  pointer required by the existing schema, not completed or active stage
  progress. A custom content pack can supply its first stage ID. No Turn or
  EventNode starts here: `currentTurnId`, `turn`, and `eventProgress` are null.
  Starting and advancing the stage/Turn lifecycle belongs to #5.

## Assessment and display

Questions cover dinner when tired, a child crying in a restaurant, chores
after bedtime, relatives' comments, and unexpected free time. Answers are
choice IDs in question order; callers must provide all five valid answers or
skip with null/omission. Partial or mismatched answers throw an error.

The UI receives question text and choice IDs/text without numeric weights.
`assessment` contains only a status and two or three descriptions of current
situational tendencies. Internal vectors use `responsibility`, `flexibility`,
`selfCare`, and `sharedCare`; positions A/B/C/D have no fixed scoring pattern.
Skipping initialises all four to zero. The vectors remain ordinary mutable
GameState data. `describeTendencies(state.tendencies)` regenerates display copy
after future event changes; #4 does not implement those event effects.
Only positive dimensions receive specific descriptions. If fewer than two
are present, neutral situational context supplies the remaining text.

## Reroll

`rerollFamilyRun(previousRun, input)` requires an explicit different uint32
seed, supplied by the caller. It does not use the clock, network, or uncontrolled
randomness. The previous family is part of the reroll input: repeating the same
previous run, new seed, and answers reproduces the same result.

If all three newly drawn family dimensions match the previous family, reroll
uses one additional PRNG draw to select a different work arrangement. This
bounded step always produces a different combination. A reroll can therefore
differ from `createFamilyRun` with that seed when repeat prevention applies.

The new run clears the old Turn, event progress, scheduled events, completed
events, choices, story history, flags, memories, planning load, and review. It
starts at `firstAgeStageId` (or the default), never at the previous run's stage.
It preserves the preferred address and current tendencies unless new answers
are supplied; explicit null resets the assessment to neutral. It never mutates
or aliases the previous run's state.

## Family condition content

`src/content/family-conditions.ts` provides one explanation per existing
FamilyProfile dimension/value. It is parsed at module load using the public
`familyConditionCatalogueSchema` from `src/domain/index.ts`.
`validateFamilyConditionCatalogue(unknown)` returns a Zod safe-parse result for
content tools. `describeFamily(profile)` derives fresh display copies without
generating or storing another family model.

Each record contains `conditionId`, `dimension`, `value`, `title`,
`neutralSummary`, `careImpacts`, `supportContext`, `sourceReferences`,
`reviewStatus`, and an optional `statistics` declaration (normalised to `[]`).
The validator checks valid dimension keys, complete coverage, unique IDs and
keys, nonempty text, HTTP(S) source references, and review status.

Statistical claims must be declared in `statistics`, including qualitative
research comparisons. Numeric and common percentage/research wording is also
linted across display text. A statistical claim requires source references
with titles/URLs and `reviewStatus: "reviewed"`; unsourced or draft statistical
claims are rejected. The shipped catalogue has no real-world statistics and
uses draft fictional context only. Common ranking, diagnosis, and deterministic
parenting-outcome language is rejected. These checks support editorial review;
they cannot verify a source's accuracy or understand every possible paraphrase.

## Acceptance and verification

- `tests/family-opening.test.ts`: seeded replay, valid GameState and actor IDs,
  all 48 family combinations, participation configuration, all 24 assessment
  branches, neutral skip, answer isolation, mutable descriptions, invalid input,
  fresh reroll, address preservation, and immediate-repeat protection.
- `tests/family-conditions.test.ts`: display lookup/isolation, content coverage,
  duplicate/mismatched keys, neutral wording, source URLs, review status, and
  explicit/inline statistical claims.
- Run `npm test`, `npm run typecheck`, and `npm run build`.

React UI (#11), lifecycle (#5), scheduling, reactions, later tendency effects,
and persistence remain with their respective tickets.

2026-10-24: Dinner and restaurant copy explicitly describes hypothetical situations
before family generation. Each offers six candidates; the UI initially shows four
and can expand the remainder. Phone/tablet and comfort-toy answers carry identical
neutral narrative weights. No EventNode cardinality or family contract changed.
See [impact analysis and contract gaps](implementation/OPENING-FAMILY-IMPACT.md).
