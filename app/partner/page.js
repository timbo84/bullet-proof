import { getCurrentUser } from "@/lib/currentUser";
import { getCollection } from "@/lib/db";
import { Badge, StatCard } from "@/components/ui";

export default async function PartnerHomePage() {
  const user = await getCurrentUser();
  const media = await getCollection("media");
  const messages = await getCollection("messages");

  const [mediaCount, unread] = await Promise.all([
    media.countDocuments({ status: "approved", audience: "Partner" }),
    messages.countDocuments({ to_user_id: user.id, read: false }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-muted">Welcome back,</p>
        <h1 className="text-2xl font-bold text-text">{user.nickname || user.full_name}</h1>
        <div className="mt-3">
          <Badge tone="primary">Partner</Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Media available" value={mediaCount} />
        <StatCard label="Unread messages" value={unread} />
      </div>
    </div>
  );
}
