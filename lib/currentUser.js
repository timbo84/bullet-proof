import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

// Full profile (points, photo, bio, etc.) for the logged-in user, server-side only.
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const users = await getCollection("users");
  const user = await users.findOne({ id: session.id });
  if (!user || !user.active) return null;
  const { password_hash, ...safe } = user;
  return stripMongoId(safe);
}
