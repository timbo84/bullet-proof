import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const completions = await getCollection("declaration_completions");
  const existing = await completions.findOne({ user_id: session.id, date: today });
  if (existing) {
    return NextResponse.json({ detail: "Already completed today." }, { status: 409 });
  }

  const settings = await getCollection("settings");
  const pointsSetting = await settings.findOne({ key: "daily_declaration_points" });
  const points = pointsSetting?.value ?? 15;

  const doc = {
    id: randomUUID(),
    user_id: session.id,
    date: today,
    created_at: new Date().toISOString(),
    points_awarded: points,
  };
  await completions.insertOne(doc);

  const users = await getCollection("users");
  await users.updateOne({ id: session.id }, { $inc: { points } });

  return NextResponse.json({ ok: true, points_awarded: points });
}
