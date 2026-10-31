// Pinned against the shipped family generator; never search for a passing seed.
export const UX_V2_FAMILIES = [
  { name: "single-backup", seed: 9, household: "singleCaregiver", care: "primaryAndBackup", path: "carry" },
  { name: "shared-care", seed: 1, household: "twoCaregivers", care: "shared", path: "coordinate" },
  { name: "pseudo-single", seed: 11, household: "twoCaregivers", care: "pseudoSingle", path: "carry" },
  { name: "multigenerational", seed: 2, household: "multigenerational", care: "uneven", path: "coordinate" },
] as const;
