import type { ReactNode } from "react";

interface MemberIntroduction {
  displayName: string;
  relationship: string;
  ageLabel?: string | null;
  lifeDetail?: string | null;
}

export function FamilyMemberCard({ member, children }: { member: MemberIntroduction; children?: ReactNode }) {
  return <article className="member" aria-label={member.displayName}>
    <header className="member-header">
      <h3>{member.displayName}</h3>
      {(member.relationship !== member.displayName || member.ageLabel) && <p className="member-relationship">
        {member.relationship}{member.ageLabel && ` · ${member.ageLabel}`}
      </p>}
    </header>
    {member.lifeDetail && <p>{member.lifeDetail}</p>}
    {children}
  </article>;
}
