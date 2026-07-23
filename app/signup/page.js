"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/components/AuthProvider";
import { fetcher } from "@/lib/fetcher";
import { AuthShell } from "@/components/AuthShell";
import { Button, Input } from "@/components/ui";
import { ROLES, roleHome } from "@/lib/roles";

const SELF_SERVE_ROLES = ROLES.filter((role) => role !== "Director");

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { data: districtData } = useSWR("/api/districts", fetcher);
  const districts = districtData?.districts ?? [];
  const [form, setForm] = useState({
    full_name: "",
    nickname: "",
    email: "",
    password: "",
    role: "Officer",
    district_id: "",
    linked_officer_nickname: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  const needsDistrict = form.role === "Officer" || form.role === "Chaplain";
  const needsLinkedOfficer = form.role === "Partner";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signUp(form);
      router.replace(roleHome(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Join the Bulletproof Cop community">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Full name" required value={form.full_name} onChange={update("full_name")} />
        <Input
          label="Nickname"
          required
          value={form.nickname}
          onChange={update("nickname")}
          placeholder="What your team calls you"
        />
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={update("email")}
        />
        <Input
          label="Password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={form.password}
          onChange={update("password")}
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">I am a</span>
          <select
            value={form.role}
            onChange={update("role")}
            className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text focus:border-primary focus:outline-none"
          >
            {SELF_SERVE_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        {needsDistrict && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-secondary">District</span>
            <select
              required
              value={form.district_id}
              onChange={update("district_id")}
              className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text focus:border-primary focus:outline-none"
            >
              <option value="">Select a district…</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {needsLinkedOfficer && (
          <Input
            label="Your officer's nickname"
            required
            value={form.linked_officer_nickname}
            onChange={update("linked_officer_nickname")}
            placeholder="So your points count toward them"
          />
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-text-muted">
        By creating an account, you agree to our{" "}
        <Link href="/privacy-policy" className="font-semibold text-primary">
          Privacy Policy
        </Link>
        .
      </p>
      <p className="mt-2 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
