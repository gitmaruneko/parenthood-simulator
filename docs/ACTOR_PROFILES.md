# Family identities (#36, #45–#46)

Every child and persistent family actor has a saved profile. Actor roles and
mechanical participation remain separate from presentation identity. New runs
use `profileVersion: 2`, `source: generated-v2`; existing `generated-v1` and
`legacy-unknown` profiles remain readable and are never regenerated on load.

## Player-view kinship

Member cards, opening reveal, pending actor-bound events and review share one
resolver. Cards show `孩子（姓名）` for known children, and kinship titles for
adults. Adult names remain in the model; elder names are not displayed. A
nonresident elder's card explicitly adds `（不同住）`.

| Saved relationship | Title | Required related profile |
| --- | --- | --- |
| husband / wife / partner | 先生 / 太太 / 伴侶 | None |
| mother / father | 媽媽 / 爸爸 | None |
| husbandMother / husbandFather | 婆婆 / 公公 | husband |
| wifeMother / wifeFather | 岳母 / 岳父 | wife |
| partnerMother / partnerFather | 伴侶的媽媽 / 伴侶的爸爸 | neutral partner |
| v1 playerParent / partnerParent | 你的家中長輩 / 伴侶的家中長輩 | v1 partnerParent retains its confirmed partner chain |
| legacy-unknown | Existing neutral child / caregiver / elder labels | No guessed kinship |

Names, household composition and actor role never supply missing gender or
kinship. Precise relationships are explicit fictional facts generated only for
new families. No player gender or real personal data is added. All in-law
references must identify a matching existing partner. Profiles must agree with
installed actor roles and their opening snapshots.

## Versioned generation and habits

`family-identities/v2` hashes seed, actor ID and all three family dimensions
with FNV-1a over UTF-16 code units (`Math.imul`, unsigned 32-bit). Partners are
established first, then other actors in stable ID order. Namespace, catalogue
order, bit offsets and collision resolution are frozen for v2. Identity generation
never consumes the game PRNG; assessment answers do not change identities.

The curated fictional catalogues separate child nicknames, adult names keyed by
the confirmed partner relationship, and mother/father elder names. Names are selected after the explicit relationship;
they are not evidence used to infer it. Existing names are kept unchanged.
New v2 habits use concrete everyday templates (a fridge calendar, tea, bags at
the door); the same adult catalogue applies across roles. Habits describe a
generated preference, never evidence that a specific care task already happened.
Version-1 templates keep their original wording.

## Events and saved history

Authored `actorText` binds to actual actor IDs; missing actors use validated
neutral fallback. Current and future events use the shared kinship labels.
Resolved text is saved as a history snapshot: existing strings are never globally
replaced, including names recorded by an earlier build. Review reads those same
historical strings while its member cards use current title presentation. Safe
sharing keeps its existing allowlist and excludes names and private details.

## Save v5 and compatibility

Save v5 requires profiles and validates membership, profile/template versions,
child/role relationships, matching in-law chains, unique opening actor references,
and equality with opening identity snapshots. `replayOrigin` preserves profiles
beside actors, resources and PRNG; same-family replay restores them. Reroll uses
a new seed and v2 profiles, without changing family-generation mechanics.

v4 is validated against its frozen v1-profile contract before migration. Its
names, coarse relationships, habits, history and RNG are preserved exactly;
only the envelope becomes v5. v1/v2/v3 strictly reject identity fields and migrate
to `legacy-unknown` profiles. Six real v4 fixtures were captured from `a40aa18`
before editing, covering all three family structures, both coarse parent branches,
pending input and resolved history.

Migration preserves original bytes before the active write. Failure stops
continuation and retains the active original for retry. Old bundles cannot read
v5; rollback requires a compatible repair bundle or explicit recovery, never
deleting saves. Missing replay origins retain the existing seed-default replay
downgrade with unknown identities; missing introductions or answers are not
reconstructed.
