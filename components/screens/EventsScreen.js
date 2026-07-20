"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/components/AuthProvider";
import { fetcher } from "@/lib/fetcher";
import {
  Button,
  Card,
  CATEGORY_COLORS,
  CategoryTag,
  EmptyState,
  Input,
  PageHeader,
  Spinner,
  Textarea,
} from "@/components/ui";

const CATEGORIES = Object.keys(CATEGORY_COLORS);
const CAN_CREATE_ROLES = ["Director", "Instructor"];

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  start_time: "",
  end_time: "",
  location: "",
  category: CATEGORIES[0],
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

  async function handleApprove(id) {
    await fetch(`/api/events/${id}/approve`, { method: "POST" });
    mutate();
  }

  const canCreate = CAN_CREATE_ROLES.includes(user?.role);

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
                {CATEGORIES.map((c) => (
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
                  {event.start_time ? ` · ${event.start_time}` : ""}
                  {event.end_time ? `–${event.end_time}` : ""} · {event.location}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {event.status === "pending" && (
                  <span className="rounded-pill border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    Pending
                  </span>
                )}
                <CategoryTag category={event.category} />
              </div>
            </div>
            {event.description && <p className="text-sm text-text">{event.description}</p>}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {event.rsvp_url && (
                <a
                  href={event.rsvp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary"
                >
                  RSVP
                </a>
              )}
              {event.created_by_name && (
                <span className="text-text-muted">Added by {event.created_by_name}</span>
              )}
              {user?.role === "Director" && event.status === "pending" && (
                <Button variant="outline" onClick={() => handleApprove(event.id)} className="ml-auto">
                  Approve
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
