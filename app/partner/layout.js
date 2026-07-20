import { RoleShell } from "@/components/RoleShell";
import { ROLE_NAV } from "@/lib/roles";

export default function PartnerLayout({ children }) {
  return (
    <RoleShell role="Partner" tabs={ROLE_NAV.Partner}>
      {children}
    </RoleShell>
  );
}
