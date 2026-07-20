import { getCurrentUser } from "@/lib/currentUser";
import { getCollection, stripMongoId } from "@/lib/db";
import { Card, Badge } from "@/components/ui";
import { DailyDeclarations } from "@/components/DailyDeclarations";

export default async function OfficerHomePage() {
  const user = await getCurrentUser();

  const declarationItems = await getCollection("declaration_items");
  const declarationCompletions = await getCollection("declaration_completions");

  const activeItems = (
    await declarationItems.find({ active: true }).sort({ created_at: 1 }).toArray()
  ).map(stripMongoId);

  const today = new Date().toISOString().slice(0, 10);
  const completedToday = Boolean(
    await declarationCompletions.findOne({ user_id: user.id, date: today })
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-muted">Welcome back,</p>
        <h1 className="text-2xl font-bold text-text">{user.nickname || user.full_name}</h1>
        <div className="mt-3">
          <Badge tone="primary">{user.points ?? 0} pts</Badge>
        </div>
      </div>

      <DailyDeclarations items={activeItems} initialCompleted={completedToday} />

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          The Program
        </h2>
        <p className="mt-2 text-sm text-text">
          Finish strong — mindset, training, and community built for the badge. Work through
          training in the Training tab, keep up with your daily declarations, and check Events
          for what&apos;s coming up in your district.
        </p>
      </Card>
    </div>
  );
}
