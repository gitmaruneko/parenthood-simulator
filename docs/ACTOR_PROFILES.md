# Family identities (UX v2 T2, issue #36)

New families store one `actorProfiles` entry for each `childId` and
`persistentActorIds` member: version 1, a generated source, a fictional name,
a controlled relationship and a versioned habit template. Mechanical actor roles
and participation remain separate. Adult ages are omitted; child age follows
the current stage.

`family-identities/v1` hashes seed, actor ID and all three generated family
dimensions with FNV-1a over UTF-16 code units (`Math.imul`, unsigned 32-bit).
Catalogue order, hash inputs, bit offsets and collision resolution in
`src/engine/actor-profiles.ts` are frozen for this version. This pure function
never consumes the game PRNG. Assessment answers do not affect identity.
The pre-T2 mechanics fixture was captured from `d5148d3` before edits.

Partners explicitly generate neutral partner, husband or wife. Elders explicitly
generate the player's parents or a partner's parents; the latter references a
confirmed partner profile. No parent gender or specific in-law title is inferred
from role or name. Nonresident supporters are labelled. Habits are generated
preferences, not observed care work or character judgments; adults share one
catalogue across roles.

`resolveFamilyMembers` supplies reveal, members and review. `resolveEventIdentity`
binds authored `actorText` to actual actor IDs in pending events and choices.
Missing identities use authored neutral fallback text. Content validation rejects
unknown actor references; membership and existing choice requirements prevent
absent relatives from becoming participants. Resolved event text becomes a saved
history snapshot. Existing history strings are never replaced.

Save v4 requires profiles and validates membership, unique opening actor
references, child/role relationships, partner-parent chains, template
compatibility and supported versions. `replayOrigin` snapshots opening profiles
beside actors, resources and PRNG. Replay restores those profiles; reroll uses a
new seed and new profiles. Legacy files without an origin retain the existing
seed-default mechanical replay downgrade with unknown identities, without
claiming to recover missing introductions or answers.

v1/v2/v3 saves explicitly migrate with `legacy-unknown` profiles for existing
members: no invented names, kinship or habits. Existing neutral actor names
remain available. Migration preserves original bytes before writing v4; failure
stops continuation and keeps the active original. Old bundles cannot read v4:
rollback needs a compatible repair build or explicit recovery, never deletion.

Verification covers generation, engine, save/restore, Session, React, and
desktop/mobile reveal → play → reload → review → replay. Sharing retains the
static allowlist and excludes names and habits.
