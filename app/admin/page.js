import { getCurrentUser } from "@/lib/currentUser";
import { getCollection, stripMongoId } from "@/lib/db";
import { Badge, StatCard, Card } from "@/components/ui";
import { DeclarationsManager } from "@/components/screens/DeclarationsManager";

export default async function AdminHomePage() {
  const user = await getCurrentUser();
  const users = await getCollection("users");
  const media = await getCollection("media");
  const workshops = await getCollection("workshops");
  const announcements = await getCollection("announcements");

  const [totalUsers, pendingMedia, pendingWorkshops, recentAnnouncements] = await Promise.all([
    users.countDocuments({ active: true }),
    media.countDocuments({ status: "pending" }),
    workshops.countDocuments({ status: "pending" }),
    announcements.find({}).sort({ sent_at: -1 }).limit(3).toArray(),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-muted">Welcome back,</p>
        <h1 className="text-2xl font-bold text-text">{user.nickname || user.full_name}</h1>
        <div className="mt-3">
          <Badge tone="primary">Director</Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active users" value={totalUsers} />
        <StatCard label="Media pending review" value={pendingMedia} />
        <StatCard label="Workshops pending review" value={pendingWorkshops} />
      </div>
      <DeclarationsManager />
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Recent broadcasts
        </h2>
        <ul className="space-y-3">
          {recentAnnouncements.map(stripMongoId).map((a) => (
            <li key={a.id} className="border-b border-border pb-2 last:border-0 last:pb-0">
              <p className="text-sm font-semibold text-text">{a.title}</p>
              <p className="text-sm text-text-muted">{a.body}</p>
            </li>
          ))}
          {recentAnnouncements.length === 0 && (
            <p className="text-sm text-text-muted">No broadcasts sent yet.</p>
          )}
        </ul>
      </Card>
    </div>
  );
}
