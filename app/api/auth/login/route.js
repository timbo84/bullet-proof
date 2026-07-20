import { NextResponse } from "next/server";
import { getCollection, stripMongoId } from "@/lib/db";
import { verifyPassword, signSession, setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ detail: "Email and password are required." }, { status: 400 });
  }

  const users = await getCollection("users");
  const user = await users.findOne({ email: String(email).toLowerCase() });
  if (!user || !user.active) {
    return NextResponse.json({ detail: "Invalid email or password." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ detail: "Invalid email or password." }, { status: 401 });
  }

  const token = await signSession({ id: user.id, email: user.email, role: user.role });
  const { password_hash, ...safeUser } = user;

  const response = NextResponse.json({ user: stripMongoId(safeUser) });
  setSessionCookie(response, token);
  return response;
}
