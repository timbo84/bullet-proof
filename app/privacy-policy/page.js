import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Bulletproof Cop",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12 text-text">
      <div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-1 text-sm text-text-muted">Last updated: placeholder — replace with real content.</p>
      </div>

      <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
        <p>
          This is placeholder text. Bulletproof Cop should replace this page with its actual
          privacy policy before launch.
        </p>
        <p>
          In general, a privacy policy should explain what personal information is collected
          (e.g. name, email, photo, messages, points/activity), why it&apos;s collected, how it&apos;s
          stored and secured, who it&apos;s shared with (if anyone), and how a user can request
          their data be corrected or deleted.
        </p>
        <p>
          Questions about this policy can be directed to the Director through the app&apos;s
          Help tab.
        </p>
      </div>

      <Link href="/login" className="inline-block text-sm font-semibold text-primary">
        &larr; Back to sign in
      </Link>
    </main>
  );
}
