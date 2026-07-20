"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button, Card, Input, PageHeader, Spinner } from "@/components/ui";

const REWARD_TYPES = ["gift_card", "bonus", "cruise_entry"];

const EMPTY_FORM = { user_id: "", type: REWARD_TYPES[0], value: "", label: "", points_awarded: "" };

export function AdminRewardsScreen() {
  const { data: usersData } = useSWR("/api/users/directory", fetcher);
  const { data: rewardsData, mutate } = useSWR("/api/rewards", fetcher);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const users = usersData?.users ?? [];
  const rewards = rewardsData?.rewards ?? null;
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/rewards", {
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
    mutate();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Rewards" subtitle="Award points, gift cards, and bonuses" />

      <Card>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-text-secondary">Recipient</span>
            <select
              required
              value={form.user_id}
              onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
              className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text focus:border-primary focus:outline-none"
            >
              <option value="">Select a person…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-secondary">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text focus:border-primary focus:outline-none"
            >
              {REWARD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Dollar value"
            type="number"
            min="0"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
          />
          <Input
            label="Label"
            required
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="$100 Gift Card - Mindset Foundations"
          />
          <Input
            label="Bonus points (optional)"
            type="number"
            min="0"
            value={form.points_awarded}
            onChange={(e) => setForm((f) => ({ ...f, points_awarded: e.target.value }))}
          />
          {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
          <div className="flex items-end sm:col-span-2">
            <Button type="submit" loading={saving} className="w-full">
              Award reward
            </Button>
          </div>
        </form>
      </Card>

      {rewards === null && <Spinner />}
      <div className="space-y-2">
        {rewards?.map((r) => (
          <Card key={r.id} className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-text">{r.label}</p>
              <p className="text-sm text-text-muted">
                {userMap[r.user_id]?.full_name || r.user_id}
              </p>
            </div>
            {r.value > 0 && <span className="font-semibold text-primary">${r.value}</span>}
          </Card>
        ))}
      </div>
    </div>
  );
}
