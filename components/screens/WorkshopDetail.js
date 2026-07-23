"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { formatTime12 } from "@/lib/dates";
import { Badge, Button, Card, Spinner, Textarea } from "@/components/ui";

export function WorkshopDetail({ id }) {
  const router = useRouter();
  const { data, mutate } = useSWR(`/api/workshops/${id}`, fetcher);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!data) return <Spinner />;
  const { workshop, completion } = data;

  async function handleComplete(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/workshops/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reflection }),
    });
    const resData = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(resData.detail || "Something went wrong.");
      return;
    }
    mutate();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-text-secondary hover:text-text"
      >
        &larr; Back
      </button>
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-text">{workshop.title}</h1>
          <Badge tone="primary">{workshop.points} pts</Badge>
        </div>
        <p className="text-sm text-text-muted">
          {workshop.date}
          {workshop.start_time ? ` · ${formatTime12(workshop.start_time)}` : ""}
          {workshop.end_time ? `–${formatTime12(workshop.end_time)}` : ""}
          {workshop.location ? ` · ${workshop.location}` : ""}
        </p>
        <p className="text-sm text-text">{workshop.description}</p>
      </Card>
      <Card className="space-y-3">
        {completion ? (
          <>
            <p className="text-sm font-semibold text-success">
              Completed — {completion.points_awarded} pts awarded.
            </p>
            {completion.reflection && (
              <p className="text-sm text-text-muted">Your reflection: {completion.reflection}</p>
            )}
          </>
        ) : (
          <form onSubmit={handleComplete} className="space-y-3">
            <Textarea
              label="Reflection"
              required
              rows={4}
              className="min-h-55"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What stood out to you? (sent to the Director)"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" loading={saving}>
              Mark complete
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
