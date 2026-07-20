"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { Button, Input } from "@/components/ui";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("loading");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.detail || "Something went wrong.");
      setStatus("idle");
      return;
    }
    setStatus("done");
  }

  if (!token) {
    return (
      <p className="text-sm text-danger">
        This reset link is missing a token. Request a new one from the login page.
      </p>
    );
  }

  if (status === "done") {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-success">Your password has been reset.</p>
        <Button className="w-full" onClick={() => router.replace("/login")}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="New password"
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={status === "loading"} className="w-full">
        Reset password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Set a new password" subtitle="Enter a new password for your account">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
      <p className="mt-4 text-center text-sm text-text-muted">
        <Link href="/login" className="font-semibold text-primary">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
