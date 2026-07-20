"use client";

import { useState } from "react";
import { Button, Card, SectionTitle } from "@/components/ui";

export function DailyDeclarations({ items, initialCompleted }) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleComplete() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/declarations/complete", { method: "POST" });
    if (res.ok) {
      setCompleted(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.detail || "Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <Card className="space-y-3">
      <SectionTitle>Daily Declarations</SectionTitle>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2 text-sm text-text">
            <span className="text-primary">&rsaquo;</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="text-sm text-text-muted">No active declarations yet.</p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
      {completed ? (
        <p className="text-sm font-semibold text-success">Said today — see you tomorrow.</p>
      ) : (
        <Button onClick={handleComplete} loading={loading} disabled={items.length === 0}>
          I said them today
        </Button>
      )}
    </Card>
  );
}
