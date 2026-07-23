import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCollection, stripMongoId } from "@/lib/db";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";
import { ROLES } from "@/lib/roles";

// Self-registration is for the field roles; Director accounts are provisioned
// by an existing admin (or the legacy data import), not signed up here.
const SELF_SERVE_ROLES = ROLES.filter((role) => role !== "Director");

export async function POST(request) {
  const { email, password, full_name, nickname, role, district_id, linked_officer_nickname } =
    await request.json();

  if (!email || !password || !full_name || !nickname) {
    return NextResponse.json(
      { detail: "Name, nickname, email, and password are required." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { detail: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }
  if (!SELF_SERVE_ROLES.includes(role)) {
    return NextResponse.json({ detail: "Invalid role." }, { status: 400 });
  }
  if ((role === "Officer" || role === "Chaplain") && !district_id) {
    return NextResponse.json({ detail: "District is required." }, { status: 400 });
  }
  if (role === "Partner" && !linked_officer_nickname) {
    return NextResponse.json(
      { detail: "Your officer's nickname is required." },
      { status: 400 }
    );
  }

  const users = await getCollection("users");
  const normalizedEmail = String(email).toLowerCase();
  const existing = await users.findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json(
      { detail: "An account with this email already exists." },
      { status: 409 }
    );
  }

  if (role === "Officer") {
    const nicknameTaken = await users.findOne({ nickname, role: "Officer" });
    if (nicknameTaken) {
      return NextResponse.json({ detail: "That nickname is already taken." }, { status: 409 });
    }
  }

  if (role === "Partner") {
    const officer = await users.findOne({ nickname: linked_officer_nickname, role: "Officer" });
    if (!officer) {
      return NextResponse.json({ detail: "No officer found with that nickname." }, { status: 400 });
    }
  }

  const user = {
    id: randomUUID(),
    email: normalizedEmail,
    password_hash: await hashPassword(password),
    full_name,
    nickname,
    role,
    district_id: district_id || null,
    linked_officer_nickname: role === "Partner" ? linked_officer_nickname : null,
    points: 0,
    active: true,
    created_at: new Date().toISOString(),
    bio: "",
    photo: null,
  };

  await users.insertOne(user);

  const token = await signSession({ id: user.id, email: user.email, role: user.role });
  const { password_hash, ...safeUser } = user;

  const response = NextResponse.json({ user: stripMongoId(safeUser) }, { status: 201 });
  setSessionCookie(response, token);
  return response;
}
