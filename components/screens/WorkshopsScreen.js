"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Badge, Card, EmptyState, PageHeader, Spinner } from "@/components/ui";

export function WorkshopsScreen() {
  const { data } = useSWR("/api/workshops", fetcher);
  const workshops = data?.workshops ?? null;

  return (
    <div className="space-y-6">
      <PageHeader title="Training" subtitle="Workshops to build the mindset" />
      {workshops === null && <Spinner />}
      {workshops?.length === 0 && (
        <EmptyState title="No workshops yet" description="Check back soon for new training." />
      )}
      <div className="space-y-3">
        {workshops?.map((w) => (
          <Link key={w.id} href={`/workshop/${w.id}`}>
            <Card className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-text">{w.title}</p>
                <p className="text-sm text-text-muted">
                  {w.date} {w.location ? `· ${w.location}` : ""}
                </p>
              </div>
              {w.completed ? (
                <Badge tone="success">Done</Badge>
              ) : (
                <Badge tone="primary">{w.points} pts</Badge>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
