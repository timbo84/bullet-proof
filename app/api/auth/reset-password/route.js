import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request) {
  const { token, password } = await request.json();
  if (!token || !password) {
    return NextResponse.json(
      { detail: "A reset token and new password are required." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { detail: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const users = await getCollection("users");
  const user = await users.findOne({ reset_token: token });
  if (!user || !user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
    return NextResponse.json(
      { detail: "This reset link is invalid or has expired." },
      { status: 400 }
    );
  }

  await users.updateOne(
    { id: user.id },
    {
      $set: { password_hash: await hashPassword(password) },
      $unset: { reset_token: "", reset_token_expires: "" },
    }
  );

  return NextResponse.json({ ok: true });
}
