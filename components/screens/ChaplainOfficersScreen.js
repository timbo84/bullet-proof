"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Avatar, Card, EmptyState, PageHeader, Spinner } from "@/components/ui";

export function ChaplainOfficersScreen() {
  const { data } = useSWR("/api/chaplain/officers", fetcher);
  const officers = data?.officers ?? null;

  return (
    <div className="space-y-6">
      <PageHeader title="Officers" subtitle="Officers in your district" />

      {officers === null && <Spinner />}
      {officers?.length === 0 && (
        <EmptyState
          title="No officers in your district yet"
          description="Officers will appear here once they register in your district."
        />
      )}

      <div className="space-y-3">
        {officers?.map((o) => (
          <Card key={o.id} className="flex items-center gap-3">
            <Avatar src={o.photo} name={o.full_name} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-text">{o.nickname || o.full_name}</p>
              <p className="text-xs text-text-muted">{o.points ?? 0} pts</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
