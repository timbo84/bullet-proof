import { RoleShell } from "@/components/RoleShell";
import { ROLE_NAV } from "@/lib/roles";

export default function AdminLayout({ children }) {
  return (
    <RoleShell role="Director" tabs={ROLE_NAV.Director}>
      {children}
    </RoleShell>
  );
}
