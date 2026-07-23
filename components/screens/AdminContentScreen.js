"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Badge, Button, Card, Input, PageHeader, SectionTitle, Spinner } from "@/components/ui";
import { MEDIA_CATEGORIES } from "@/lib/constants";

const EMPTY_WORKSHOP = { title: "", description: "", date: "", location: "", points: "" };
const EMPTY_MEDIA = {
  title: "",
  description: "",
  url: "",
  media_type: "video",
  category: MEDIA_CATEGORIES[0],
  points_on_complete: "",
};

function CategorySelect({ value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text-secondary">Category</span>
      <select
        value={value}
        onChange={onChange}
        className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text focus:border-primary focus:outline-none"
      >
        {MEDIA_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}

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

  async function handleModerate(id, action) {
    await fetch(`/api/workshops/${id}/${action}`, { method: "POST" });
    mutate();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this workshop? This can't be undone.")) return;
    await fetch(`/api/workshops/${id}`, { method: "DELETE" });
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
            required
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
          <div className="flex items-center gap-2">
            {w.status === "pending" ? (
              <>
                <Button variant="outline" onClick={() => handleModerate(w.id, "reject")}>
                  Reject
                </Button>
                <Button onClick={() => handleModerate(w.id, "approve")}>Approve</Button>
              </>
            ) : (
              <Badge tone={w.status === "rejected" ? "danger" : "success"}>{w.status}</Badge>
            )}
            <button
              onClick={() => handleDelete(w.id)}
              className="text-sm text-text-secondary hover:text-danger"
            >
              Delete
            </button>
          </div>
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
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, audience: ["Officer", "Chaplain", "Partner"] }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.detail || "Something went wrong.");
      return;
    }
    setForm(EMPTY_MEDIA);
    mutate();
  }

  async function handleModerate(id, action) {
    await fetch(`/api/media/${id}/${action}`, { method: "POST" });
    mutate();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this media item? This can't be undone.")) return;
    await fetch(`/api/media/${id}`, { method: "DELETE" });
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
            value={form.points_on_complete}
            onChange={(e) => setForm((f) => ({ ...f, points_on_complete: e.target.value }))}
          />
          <CategorySelect
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-secondary">Type</span>
            <select
              value={form.media_type}
              onChange={(e) => setForm((f) => ({ ...f, media_type: e.target.value }))}
              className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text focus:border-primary focus:outline-none"
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="link">Link</option>
            </select>
          </label>
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
          {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
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
            <p className="text-sm text-text-muted">{m.points_on_complete} pts</p>
          </div>
          <div className="flex items-center gap-2">
            {m.status === "pending" ? (
              <>
                <Button variant="outline" onClick={() => handleModerate(m.id, "reject")}>
                  Reject
                </Button>
                <Button onClick={() => handleModerate(m.id, "approve")}>Approve</Button>
              </>
            ) : (
              <Badge tone={m.status === "rejected" ? "danger" : "success"}>{m.status}</Badge>
            )}
            <button
              onClick={() => handleDelete(m.id)}
              className="text-sm text-text-secondary hover:text-danger"
            >
              Delete
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function FaqSection() {
  const { data, mutate } = useSWR("/api/program-pdf", fetcher);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const pdf_url = new FormData(e.target).get("pdf_url");
    const res = await fetch("/api/program-pdf", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf_url, filename: "FAQ" }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.detail || "Something went wrong.");
      return;
    }
    mutate();
  }

  async function handleClear() {
    await fetch("/api/program-pdf", { method: "DELETE" });
    mutate();
  }

  return (
    <div className="space-y-3">
      <SectionTitle>FAQ Link</SectionTitle>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="FAQ URL"
              name="pdf_url"
              key={data?.pdf_url || "empty"}
              defaultValue={data?.pdf_url || ""}
              placeholder="https://…"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              Save
            </Button>
            {data?.pdf_url && (
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </form>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </Card>
    </div>
  );
}

export function AdminContentScreen() {
  return (
    <div className="space-y-8">
      <PageHeader title="Content" subtitle="Manage workshops, media, and the FAQ link" />
      <WorkshopsSection />
      <MediaSection />
      <FaqSection />
    </div>
  );
}
