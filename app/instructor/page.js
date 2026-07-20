import Link from "next/link";
import { getCurrentUser } from "@/lib/currentUser";
import { getCollection } from "@/lib/db";
import { Badge, StatCard, Card } from "@/components/ui";

export default async function InstructorHomePage() {
  const user = await getCurrentUser();
  const users = await getCollection("users");
  const workshops = await getCollection("workshops");
  const messages = await getCollection("messages");

  const [topUsers, workshopCount, unread] = await Promise.all([
    users
      .find({ role: { $in: ["Officer", "Chaplain"] }, active: true })
      .sort({ points: -1 })
      .limit(3)
      .toArray(),
    workshops.countDocuments({}),
    messages.countDocuments({ to_user_id: user.id, read: false }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-muted">Welcome back,</p>
        <h1 className="text-2xl font-bold text-text">{user.nickname || user.full_name}</h1>
        <div className="mt-3">
          <Badge tone="primary">Instructor</Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Workshops" value={workshopCount} />
        <StatCard label="Unread messages" value={unread} />
      </div>
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Top of the leaderboard
          </h2>
          <Link href="/instructor/leaderboard" className="text-sm font-semibold text-primary">
            View all
          </Link>
        </div>
        <ol className="space-y-2">
          {topUsers.map((u, i) => (
            <li key={u.id} className="flex items-center justify-between text-sm">
              <span className="text-text">
                <span className="mr-2 text-text-muted">#{i + 1}</span>
                {u.nickname || u.full_name}
              </span>
              <span className="font-semibold text-primary">{u.points ?? 0} pts</span>
            </li>
          ))}
          {topUsers.length === 0 && (
            <p className="text-sm text-text-muted">No ranked officers yet.</p>
          )}
        </ol>
      </Card>
    </div>
  );
}
