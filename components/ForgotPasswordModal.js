"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

export function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [devToken, setDevToken] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setDevToken(data.dev_token || null);
    setStatus("sent");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-border bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-base font-bold text-text">Reset your password</h2>
        <p className="mb-4 text-sm text-text-muted">
          Enter your account email and we&apos;ll send you reset instructions.
        </p>
        {status === "sent" ? (
          <div className="space-y-3">
            <p className="text-sm text-success">
              If that account exists, reset instructions are on the way.
            </p>
            {devToken && (
              <p className="rounded-md border border-dashed border-border p-3 text-xs text-text-muted">
                Dev mode (no email service configured):{" "}
                <Link
                  href={`/reset-password?token=${devToken}`}
                  className="font-semibold text-primary"
                >
                  Open reset link
                </Link>
              </p>
            )}
            <Button type="button" variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={status === "loading"} className="flex-1">
                Send
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
