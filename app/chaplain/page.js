import { getCurrentUser } from "@/lib/currentUser";
import { getCollection } from "@/lib/db";
import { Badge, StatCard } from "@/components/ui";

export default async function ChaplainHomePage() {
  const user = await getCurrentUser();
  const users = await getCollection("users");
  const events = await getCollection("events");
  const messages = await getCollection("messages");

  const today = new Date().toISOString().slice(0, 10);
  const [officerCount, upcomingEvents, unread] = await Promise.all([
    users.countDocuments({ role: "Officer", district_id: user.district_id }),
    events.countDocuments({ date: { $gte: today } }),
    messages.countDocuments({ to_user_id: user.id, read: false }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-muted">Welcome back,</p>
        <h1 className="text-2xl font-bold text-text">{user.nickname || user.full_name}</h1>
        <div className="mt-3">
          <Badge tone="primary">Chaplain</Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Officers in district" value={officerCount} />
        <StatCard label="Upcoming events" value={upcomingEvents} />
        <StatCard label="Unread messages" value={unread} />
      </div>
    </div>
  );
}
