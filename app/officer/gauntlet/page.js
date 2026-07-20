"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Badge, Card, EmptyState, PageHeader, Spinner } from "@/components/ui";

export default function GauntletPage() {
  const { data } = useSWR("/api/competitions", fetcher);
  const competitions = data?.competitions ?? null;

  return (
    <div className="space-y-6">
      <PageHeader title="Gauntlet" subtitle="Active competitions" />
      {competitions === null && <Spinner />}
      {competitions?.length === 0 && (
        <EmptyState
          title="No active competitions"
          description="Check back when the next Gauntlet kicks off."
        />
      )}
      <div className="space-y-3">
        {competitions?.map((c) => (
          <Card key={c.id} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-text">{c.name}</p>
              <Badge tone={c.status === "active" ? "primary" : "neutral"}>{c.status}</Badge>
            </div>
            {c.description && <p className="text-sm text-text">{c.description}</p>}
            <p className="text-sm text-text-muted">Ends {new Date(c.end_date).toLocaleDateString()}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
