"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Avatar, Badge, Card, Input, PageHeader, Spinner } from "@/components/ui";
import { ROLES } from "@/lib/roles";

function UserRow({ user, districts, onUpdate }) {
  const [saving, setSaving] = useState(false);

  async function update(field, value) {
    setSaving(true);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setSaving(false);
    onUpdate();
  }

  return (
    <Card className="flex flex-wrap items-center gap-3">
      <Avatar src={user.photo} name={user.full_name} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-text">{user.full_name}</p>
        <p className="truncate text-xs text-text-muted">{user.email}</p>
      </div>
      <select
        defaultValue={user.role}
        onChange={(e) => update("role", e.target.value)}
        disabled={saving}
        className="rounded-md border border-border bg-surface-raised px-2 py-1.5 text-sm text-text focus:border-primary focus:outline-none"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <select
        defaultValue={user.district_id || ""}
        onChange={(e) => update("district_id", e.target.value || null)}
        disabled={saving}
        className="rounded-md border border-border bg-surface-raised px-2 py-1.5 text-sm text-text focus:border-primary focus:outline-none"
      >
        <option value="">No district</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <button onClick={() => update("active", !user.active)} className="shrink-0" disabled={saving}>
        <Badge tone={user.active ? "success" : "danger"}>
          {user.active ? "Active" : "Disabled"}
        </Badge>
      </button>
    </Card>
  );
}

export function AdminUsersScreen() {
  const { data, mutate } = useSWR("/api/admin/users", fetcher);
  const { data: districtData } = useSWR("/api/districts", fetcher);
  const [query, setQuery] = useState("");

  const users = data?.users ?? null;
  const districts = districtData?.districts ?? [];

  const filtered = (users || []).filter((u) => {
    const q = query.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle={`${users?.length ?? 0} accounts`} />
      <Input
        placeholder="Search by name or email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {users === null && <Spinner />}
      <div className="space-y-2">
        {filtered.map((u) => (
          <UserRow key={u.id} user={u} districts={districts} onUpdate={mutate} />
        ))}
      </div>
    </div>
  );
}
