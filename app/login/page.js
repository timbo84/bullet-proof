"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { AuthShell } from "@/components/AuthShell";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";
import { Button, Input } from "@/components/ui";
import { roleHome } from "@/lib/roles";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signIn(email, password);
      router.replace(roleHome(user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>
      <div className="mt-4 flex flex-col items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setShowForgot(true)}
          className="text-text-secondary hover:text-primary"
        >
          Forgot password?
        </button>
        <p className="text-text-muted">
          No account?{" "}
          <Link href="/signup" className="font-semibold text-primary">
            Sign up
          </Link>
        </p>
      </div>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </AuthShell>
  );
}
