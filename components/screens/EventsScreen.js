"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/components/AuthProvider";
import { fetcher } from "@/lib/fetcher";
import { MEDIA_CATEGORIES } from "@/lib/constants";
import { formatTime12 } from "@/lib/dates";
import {
  Button,
  Card,
  CategoryTag,
  EmptyState,
  Input,
  PageHeader,
  Spinner,
  Textarea,
} from "@/components/ui";

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  start_time: "",
  end_time: "",
  location: "",
  category: MEDIA_CATEGORIES[0],
  rsvp_url: "",
};

export function EventsScreen() {
  const { user } = useAuth();
  const { data, mutate } = useSWR("/api/events", fetcher);
  const events = data?.events ?? null;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.detail || "Something went wrong.");
      return;
    }
    setForm(EMPTY_FORM);
    setShowForm(false);
    mutate();
  }

  const canCreate = user?.role === "Director";

  async function handleDelete(id) {
    if (!window.confirm("Delete this event? This can't be undone.")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        subtitle="Community calendar"
        action={
          canCreate && (
            <Button variant={showForm ? "outline" : "primary"} onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Cancel" : "New event"}
            </Button>
          )
        }
      />

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-secondary">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text focus:border-primary focus:outline-none"
              >
                {MEDIA_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
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
            <Input
              label="Start time"
              type="time"
              value={form.start_time}
              onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
            />
            <Input
              label="End time"
              type="time"
              value={form.end_time}
              onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <Input
              label="RSVP link (optional)"
              value={form.rsvp_url}
              onChange={(e) => setForm((f) => ({ ...f, rsvp_url: e.target.value }))}
            />
            <div className="flex items-end">
              <Button type="submit" loading={saving} className="w-full">
                Create event
              </Button>
            </div>
            {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
          </form>
        </Card>
      )}

      {events === null && <Spinner />}

      {events?.length === 0 && (
        <EmptyState title="No events yet" description="Check back soon for upcoming events." />
      )}

      <div className="space-y-3">
        {events?.map((event) => (
          <Card key={event.id} className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-text">{event.title}</p>
                <p className="text-sm text-text-muted">
                  {event.date}
                  {event.start_time ? ` · ${formatTime12(event.start_time)}` : ""}
                  {event.end_time ? `–${formatTime12(event.end_time)}` : ""}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
              </div>
              <CategoryTag category={event.category} />
            </div>
            {event.description && <p className="text-sm text-text">{event.description}</p>}
            <div className="flex items-center gap-3">
              {event.rsvp_url && (
                <a
                  href={event.rsvp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary"
                >
                  RSVP
                </a>
              )}
              {user?.role === "Director" && (
                <button
                  onClick={() => handleDelete(event.id)}
                  className="ml-auto text-sm text-text-secondary hover:text-danger"
                >
                  Delete
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
