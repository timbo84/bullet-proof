"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Avatar, Badge, Button, Input } from "@/components/ui";
import { fetcher } from "@/lib/fetcher";

export function NewMessagePicker({ onClose }) {
  const router = useRouter();
  const { data } = useSWR("/api/users/directory", fetcher);
  const users = data?.users ?? null;
  const [query, setQuery] = useState("");

  const filtered = (users || []).filter((u) => {
    const q = query.toLowerCase();
    return (u.full_name || "").toLowerCase().includes(q) || (u.nickname || "").toLowerCase().includes(q);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[70vh] w-full max-w-sm flex-col rounded-lg border border-border bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-base font-bold text-text">New message</h2>
        <Input placeholder="Search people…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="mt-3 flex-1 space-y-1 overflow-y-auto">
          {users === null && <p className="text-sm text-text-muted">Loading…</p>}
          {filtered.map((u) => (
            <button
              key={u.id}
              onClick={() => router.push(`/chat/${u.id}`)}
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-surface-raised"
            >
              <Avatar src={u.photo} name={u.full_name} size={32} />
              <span className="flex-1">
                <span className="block text-sm font-medium text-text">
                  {u.nickname || u.full_name}
                </span>
              </span>
              <Badge>{u.role}</Badge>
            </button>
          ))}
          {users?.length === 0 && <p className="text-sm text-text-muted">No one to message yet.</p>}
        </div>
        <Button variant="ghost" className="mt-3" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
