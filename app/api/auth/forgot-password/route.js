import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCollection } from "@/lib/db";

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

  // NOTE: no email delivery is wired up — sending the reset link is out of
  // scope for now. In development we hand back the token directly so the
  // reset-password flow can still be exercised end-to-end.
  const devToken = process.env.NODE_ENV !== "production" ? resetToken : undefined;
  return NextResponse.json({ ok: true, dev_token: devToken });
}
