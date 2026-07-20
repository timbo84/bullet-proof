"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Spinner,
  Textarea,
} from "@/components/ui";

const INTERACTION_TYPES = ["check_in", "counseling", "prayer", "crisis"];

function OfficerRow({ officer, onLog }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(INTERACTION_TYPES[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    await onLog(officer.id, type, notes);
    setSaving(false);
    setNotes("");
    setOpen(false);
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar src={officer.photo} name={officer.full_name} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-text">
            {officer.nickname || officer.full_name}
          </p>
          <p className="text-xs text-text-muted">{officer.points ?? 0} pts</p>
        </div>
        <Button variant="outline" onClick={() => setOpen((v) => !v)}>
          {open ? "Cancel" : "Log interaction"}
        </Button>
      </div>
      {open && (
        <form onSubmit={submit} className="space-y-3 border-t border-border pt-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-secondary">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text focus:border-primary focus:outline-none"
            >
              {INTERACTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <Textarea label="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button type="submit" loading={saving}>
            Save interaction
          </Button>
        </form>
      )}
    </Card>
  );
}

export function ChaplainOfficersScreen() {
  const { data: officersData } = useSWR("/api/chaplain/officers", fetcher);
  const { data: interactionsData, mutate } = useSWR("/api/chaplain-interactions", fetcher);
  const officers = officersData?.officers ?? null;
  const interactions = interactionsData?.interactions ?? [];

  async function handleLog(officer_id, type, notes) {
    await fetch("/api/chaplain-interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ officer_id, type, notes }),
    });
    mutate();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Officers" subtitle="Officers in your district" />

      {officers === null && <Spinner />}
      {officers?.length === 0 && (
        <EmptyState
          title="No officers in your district yet"
          description="Officers will appear here once they register in your district."
        />
      )}

      <div className="space-y-3">
        {officers?.map((o) => (
          <OfficerRow key={o.id} officer={o} onLog={handleLog} />
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Recent interactions
        </h2>
        {interactions.length === 0 && (
          <p className="text-sm text-text-muted">No interactions logged yet.</p>
        )}
        {interactions.map((i) => (
          <Card key={i.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-text">
              {i.officer_name} — {i.notes || "No notes"}
            </span>
            <Badge>{i.type.replace("_", " ")}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
