import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCollection } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

export async function POST(request) {
  const { email } = await request.json();
  const users = await getCollection("users");
  const user = await users.findOne({ email: String(email || "").toLowerCase() });

  // Always respond with { ok: true } whether or not the account exists, so
  // this endpoint can't be used to enumerate registered emails.
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const resetToken = randomUUID();
  await users.updateOne(
    { id: user.id },
    {
      $set: {
        reset_token: resetToken,
        reset_token_expires: new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString(),
      },
    }
  );

  const origin = process.env.APP_PUBLIC_URL || request.nextUrl.origin;
  const resetUrl = `${origin}/reset-password?token=${resetToken}`;
  const { sent } = await sendPasswordResetEmail({ to: user.email, resetUrl });

  // If RESEND_API_KEY isn't configured, sendPasswordResetEmail is a no-op —
  // fall back to handing the token back directly so the flow is still
  // testable outside production.
  const devToken = !sent && process.env.NODE_ENV !== "production" ? resetToken : undefined;
  return NextResponse.json({ ok: true, dev_token: devToken });
}
