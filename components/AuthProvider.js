"use client";

import { createContext, useCallback, useContext, useState } from "react";

const AuthContext = createContext(null);

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

// initialUser comes from the root layout Server Component, which reads the
// session cookie fresh on every full page load — so no client-side refetch
// is needed on mount, only after explicit auth actions.
export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await parseJson(res);
    setUser(res.ok ? data.user : null);
  }, []);

  const signIn = useCallback(async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseJson(res);
    if (!res.ok) throw new Error(data.detail || "Login failed.");
    setUser(data.user);
    return data.user;
  }, []);

  const signUp = useCallback(async (payload) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseJson(res);
    if (!res.ok) throw new Error(data.detail || "Sign up failed.");
    setUser(data.user);
    return data.user;
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading: false, signIn, signUp, signOut, refresh, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
