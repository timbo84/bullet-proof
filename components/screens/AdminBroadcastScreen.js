"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button, Card, Input, PageHeader, Spinner, Textarea } from "@/components/ui";
import { ROLES } from "@/lib/roles";

const EMPTY_FORM = { title: "", body: "", target_role: "All", target_district_id: "" };

export function AdminBroadcastScreen() {
  const { data: districtData } = useSWR("/api/districts", fetcher);
  const { data: announcementsData, mutate } = useSWR("/api/announcements", fetcher);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState(null);

  const districts = districtData?.districts ?? [];
  const announcements = announcementsData?.announcements ?? null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSentTo(null);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        target_district_id: form.target_district_id || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.detail || "Something went wrong.");
      return;
    }
    setSentTo(data.recipientCount);
    setForm(EMPTY_FORM);
    mutate();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Broadcast" subtitle="Send a message to everyone at once" />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            label="Message"
            required
            rows={4}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-secondary">Audience</span>
              <select
                value={form.target_role}
                onChange={(e) => setForm((f) => ({ ...f, target_role: e.target.value }))}
                className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text focus:border-primary focus:outline-none"
              >
                <option value="All">Everyone</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}s only
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-secondary">District (optional)</span>
              <select
                value={form.target_district_id}
                onChange={(e) => setForm((f) => ({ ...f, target_district_id: e.target.value }))}
                className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text focus:border-primary focus:outline-none"
              >
                <option value="">All districts</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          {sentTo !== null && (
            <p className="text-sm text-success">Sent to {sentTo} people.</p>
          )}
          <Button type="submit" loading={saving}>
            Send broadcast
          </Button>
        </form>
      </Card>

      {announcements === null && <Spinner />}
      <div className="space-y-2">
        {announcements?.map((a) => (
          <Card key={a.id}>
            <p className="font-semibold text-text">{a.title}</p>
            <p className="text-sm text-text-muted">{a.body}</p>
            <p className="mt-1 text-xs text-text-muted">
              To {a.target_role} · {new Date(a.sent_at).toLocaleString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
