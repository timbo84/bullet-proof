import { RoleShell } from "@/components/RoleShell";
import { ROLE_NAV } from "@/lib/roles";

export default function ChaplainLayout({ children }) {
  return (
    <RoleShell role="Chaplain" tabs={ROLE_NAV.Chaplain}>
      {children}
    </RoleShell>
  );
}
