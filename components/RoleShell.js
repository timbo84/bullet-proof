"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Avatar } from "@/components/ui";
import { NavIcon } from "@/components/NavIcon";

export function RoleShell({ role, tabs, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  function isActive(tab) {
    return tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.webp" alt="" width={32} height={32} className="rounded-lg" />
            <div>
              <p className="font-heading text-sm font-bold uppercase leading-tight tracking-wide text-text">
                Bulletproof Cop
              </p>
              <p className="text-xs leading-tight text-text-muted">{role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`${tabs[tabs.length - 1].href}`} className="flex items-center gap-2">
              <Avatar src={user?.photo} name={user?.full_name} size={32} />
              <span className="hidden text-sm font-medium text-text sm:inline">
                {user?.nickname || user?.full_name}
              </span>
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm text-text-secondary hover:text-danger"
            >
              Sign out
            </button>
          </div>
        </div>
        {/* Desktop/tablet nav: text tabs. Hidden on mobile in favor of the
            fixed bottom icon bar below, which avoids label truncation. */}
        <nav className="mx-auto hidden max-w-5xl gap-1 overflow-x-auto px-4 pb-2 sm:flex">
          {tabs.map((tab) => {
            const active = isActive(tab);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap rounded-pill px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition ${
                  active ? "bg-primary text-bg" : "text-text-secondary hover:bg-surface-raised"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:pb-6">{children}</main>

      {/* Mobile: fixed bottom icon tab bar, matching the original app's nav. */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 ${
                active ? "text-primary" : "text-text-muted"
              }`}
            >
              <NavIcon name={tab.icon} size={22} strokeWidth={active ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
