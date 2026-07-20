import { RoleShell } from "@/components/RoleShell";
import { ROLE_NAV } from "@/lib/roles";

export default function InstructorLayout({ children }) {
  return (
    <RoleShell role="Instructor" tabs={ROLE_NAV.Instructor}>
      {children}
    </RoleShell>
  );
}
