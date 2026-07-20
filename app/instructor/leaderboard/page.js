"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, Badge, Card, EmptyState, PageHeader, Spinner } from "@/components/ui";

export default function LeaderboardPage() {
  const { user: me } = useAuth();
  const { data } = useSWR("/api/leaderboard", fetcher);
  const leaderboard = data?.leaderboard ?? null;

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard" subtitle="Officers & Chaplains" />
      {leaderboard === null && <Spinner />}
      {leaderboard?.length === 0 && <EmptyState title="No rankings yet" />}
      <div className="space-y-2">
        {leaderboard?.map((u, i) => (
          <Card
            key={u.id}
            className={`flex items-center gap-3 ${u.id === me?.id ? "border-primary" : ""}`}
          >
            <span className="w-6 text-center text-sm font-bold text-text-muted">{i + 1}</span>
            <Avatar src={u.photo} name={u.full_name} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-text">{u.nickname || u.full_name}</p>
              <p className="text-xs text-text-muted">{u.role}</p>
            </div>
            <Badge tone="primary">{u.points ?? 0} pts</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
