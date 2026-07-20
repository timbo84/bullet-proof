"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Badge, Button, Card, Input, PageHeader, SectionTitle, Spinner } from "@/components/ui";

const EMPTY_WORKSHOP = { title: "", description: "", date: "", location: "", points: "" };
const EMPTY_MEDIA = { title: "", description: "", url: "", type: "video", category: "Training", points: "" };

function WorkshopsSection() {
  const { data, mutate } = useSWR("/api/workshops", fetcher);
  const workshops = data?.workshops ?? null;
  const [form, setForm] = useState(EMPTY_WORKSHOP);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/workshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setForm(EMPTY_WORKSHOP);
    mutate();
  }

  async function handleApprove(id) {
    await fetch(`/api/workshops/${id}/approve`, { method: "POST" });
    mutate();
  }

  return (
    <div className="space-y-3">
      <SectionTitle>Workshops</SectionTitle>
      <Card>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Points"
            type="number"
            value={form.points}
            onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <div className="sm:col-span-2">
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <Button type="submit" loading={saving} className="sm:col-span-2">
            Add workshop
          </Button>
        </form>
      </Card>
      {workshops === null && <Spinner />}
      {workshops?.map((w) => (
        <Card key={w.id} className="flex items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-text">{w.title}</p>
            <p className="text-sm text-text-muted">{w.points} pts</p>
          </div>
          {w.status === "pending" ? (
            <Button variant="outline" onClick={() => handleApprove(w.id)}>
              Approve
            </Button>
          ) : (
            <Badge tone="success">Approved</Badge>
          )}
        </Card>
      ))}
    </div>
  );
}

function MediaSection() {
  const { data, mutate } = useSWR("/api/media", fetcher);
  const media = data?.media ?? null;
  const [form, setForm] = useState(EMPTY_MEDIA);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, audience: ["Officer"] }),
    });
    setSaving(false);
    setForm(EMPTY_MEDIA);
    mutate();
  }

  async function handleApprove(id) {
    await fetch(`/api/media/${id}/approve`, { method: "POST" });
    mutate();
  }

  return (
    <div className="space-y-3">
      <SectionTitle>Media</SectionTitle>
      <Card>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Points"
            type="number"
            value={form.points}
            onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
          />
          <div className="sm:col-span-2">
            <Input
              label="URL (YouTube, video, or audio file)"
              required
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <Button type="submit" loading={saving} className="sm:col-span-2">
            Add media
          </Button>
        </form>
      </Card>
      {media === null && <Spinner />}
      {media?.map((m) => (
        <Card key={m.id} className="flex items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-text">{m.title}</p>
            <p className="text-sm text-text-muted">{m.points} pts</p>
          </div>
          {m.status === "pending" ? (
            <Button variant="outline" onClick={() => handleApprove(m.id)}>
              Approve
            </Button>
          ) : (
            <Badge tone="success">Approved</Badge>
          )}
        </Card>
      ))}
    </div>
  );
}

export function AdminContentScreen() {
  return (
    <div className="space-y-8">
      <PageHeader title="Content" subtitle="Manage workshops and media" />
      <WorkshopsSection />
      <MediaSection />
    </div>
  );
}
