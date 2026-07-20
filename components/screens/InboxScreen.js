"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, Spinner } from "@/components/ui";
import { NewMessagePicker } from "@/components/NewMessagePicker";
import { fetcher } from "@/lib/fetcher";

function timeAgo(iso) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function InboxScreen() {
  const { data } = useSWR("/api/messages", fetcher);
  const conversations = data?.conversations ?? null;
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        subtitle="Direct messages"
        action={<Button onClick={() => setShowPicker(true)}>New message</Button>}
      />

      {conversations === null && <Spinner />}

      {conversations?.length === 0 && (
        <EmptyState
          title="No conversations yet"
          description="Start a conversation from the New message button above."
        />
      )}

      <div className="space-y-2">
        {conversations?.map((c) => (
          <Link key={c.userId} href={`/chat/${c.userId}`}>
            <Card className="flex items-center gap-3">
              <Avatar src={c.photo} name={c.name} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-text">{c.name || "Unknown"}</p>
                  <span className="shrink-0 text-xs text-text-muted">{timeAgo(c.lastAt)}</span>
                </div>
                <p className="truncate text-sm text-text-muted">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && <Badge tone="primary">{c.unread}</Badge>}
            </Card>
          </Link>
        ))}
      </div>

      {showPicker && <NewMessagePicker onClose={() => setShowPicker(false)} />}
    </div>
  );
}
