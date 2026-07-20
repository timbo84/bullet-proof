import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/currentUser";
import { roleHome } from "@/lib/roles";

// proxy.js normally handles this redirect before the request ever reaches
// here; this is a fallback for direct/edge cases.
export default async function RootPage() {
  const user = await getCurrentUser();
  redirect(user ? roleHome(user.role) : "/login");
}
