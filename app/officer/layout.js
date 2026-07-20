import { RoleShell } from "@/components/RoleShell";
import { ROLE_NAV } from "@/lib/roles";

export default function OfficerLayout({ children }) {
  return (
    <RoleShell role="Officer" tabs={ROLE_NAV.Officer}>
      {children}
    </RoleShell>
  );
}
