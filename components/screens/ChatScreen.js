"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/components/AuthProvider";
import { fetcher } from "@/lib/fetcher";
import { Avatar, Badge, Button, Spinner } from "@/components/ui";

export function ChatScreen({ userId }) {
  const router = useRouter();
  const { user: me } = useAuth();
  const { data, mutate } = useSWR(`/api/messages/${userId}`, fetcher);
  const thread = data?.messages ?? null;
  const otherUser = data?.otherUser ?? null;
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [thread]);

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    const res = await fetch(`/api/messages/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });
    if (res.ok) {
      setDraft("");
      await mutate();
    }
    setSending(false);
  }

  return (
    <div className="flex h-screen flex-col bg-bg">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <button
          onClick={() => router.back()}
          className="text-text-secondary hover:text-text"
          aria-label="Back"
        >
          &larr;
        </button>
        {otherUser && (
          <>
            <Avatar src={otherUser.photo} name={otherUser.full_name} size={32} />
            <div>
              <p className="text-sm font-semibold text-text">
                {otherUser.nickname || otherUser.full_name}
              </p>
            </div>
            <Badge className="ml-auto">{otherUser.role}</Badge>
          </>
        )}
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {thread === null && <Spinner />}
        {thread?.map((msg) => {
          const mine = msg.from_user_id === me?.id;
          return (
            <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                  mine ? "bg-primary text-bg" : "border border-border bg-surface text-text"
                }`}
              >
                {msg.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-border bg-surface p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
        <Button type="submit" loading={sending}>
          Send
        </Button>
      </form>
    </div>
  );
}
