"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Badge, Card, CategoryTag, EmptyState, PageHeader, Spinner } from "@/components/ui";

export function MediaScreen() {
  const { data } = useSWR("/api/media", fetcher);
  const media = data?.media ?? null;

  return (
    <div className="space-y-6">
      <PageHeader title="Media" subtitle="Videos, podcasts, and resources" />
      {media === null && <Spinner />}
      {media?.length === 0 && (
        <EmptyState title="No media yet" description="Check back soon for new content." />
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {media?.map((m) => (
          <Link key={m.id} href={`/media-player/${m.id}`}>
            <Card className="h-full space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-text">{m.title}</p>
                {m.completed ? (
                  <Badge tone="success">Done</Badge>
                ) : (
                  <Badge tone="primary">{m.points} pts</Badge>
                )}
              </div>
              <p className="line-clamp-2 text-sm text-text-muted">{m.description}</p>
              <div className="flex items-center gap-2">
                <CategoryTag category={m.category} />
                {m.duration_minutes > 0 && (
                  <span className="text-xs text-text-muted">{m.duration_minutes} min</span>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
