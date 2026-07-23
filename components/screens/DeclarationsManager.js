"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button, Card, Input, SectionTitle, Spinner } from "@/components/ui";

export function DeclarationsManager() {
  const { data, mutate } = useSWR("/api/declarations", fetcher);
  const [newText, setNewText] = useState("");
  const [saving, setSaving] = useState(false);
  const items = data?.items ?? null;

  async function handleAdd(e) {
    e.preventDefault();
    if (!newText.trim()) return;
    setSaving(true);
    await fetch("/api/declarations/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText.trim() }),
    });
    setSaving(false);
    setNewText("");
    mutate();
  }

  async function handleToggle(item) {
    await fetch(`/api/declarations/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    mutate();
  }

  async function handleDelete(id) {
    await fetch(`/api/declarations/items/${id}`, { method: "DELETE" });
    mutate();
  }

  async function handlePointsSubmit(e) {
    e.preventDefault();
    const points = new FormData(e.target).get("points");
    await fetch("/api/declarations/points", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: Number(points) }),
    });
    mutate();
  }

  return (
    <Card className="space-y-4">
      <SectionTitle>Daily Declarations</SectionTitle>

      {items === null && <Spinner />}

      <ul className="space-y-2">
        {items?.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
            <span className={item.active ? "text-text" : "text-text-muted line-through"}>
              {item.text}
            </span>
            <div className="flex shrink-0 gap-3">
              <button
                onClick={() => handleToggle(item)}
                className="text-text-secondary hover:text-primary"
              >
                {item.active ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-text-secondary hover:text-danger"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {items?.length === 0 && (
          <p className="text-sm text-text-muted">No declarations yet — add one below.</p>
        )}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a new declaration…"
          className="flex-1 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
        <Button type="submit" loading={saving}>
          Add
        </Button>
      </form>

      <form onSubmit={handlePointsSubmit} className="flex items-end gap-2 border-t border-border pt-3">
        <div className="flex-1">
          <Input
            label="Points per day"
            name="points"
            type="number"
            min="0"
            max="1000"
            key={data?.points ?? "unset"}
            defaultValue={data?.points ?? 15}
          />
        </div>
        <Button type="submit" variant="outline">
          Save points
        </Button>
      </form>
    </Card>
  );
}
