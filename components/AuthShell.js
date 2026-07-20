import Image from "next/image";
import { Card } from "@/components/ui";

export function AuthShell({ title, subtitle, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/logo.webp"
            alt="Bulletproof Cop"
            width={72}
            height={72}
            className="rounded-2xl"
            priority
          />
          <div>
            <h1 className="text-lg font-bold text-text">{title}</h1>
            {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
          </div>
        </div>
        <Card>{children}</Card>
      </div>
    </main>
  );
}
