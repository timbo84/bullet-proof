import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const rewards = await getCollection("rewards");
  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get("userId");

  let filter = { user_id: session.id };
  if (session.role === "Director") {
    filter = requestedUserId ? { user_id: requestedUserId } : {};
  }

  const list = await rewards.find(filter).sort({ awarded_at: -1 }).toArray();
  return NextResponse.json({ rewards: list.map(stripMongoId) });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can award rewards." }, { status: 403 });
  }

  const { user_id, type, value, label, points_awarded } = await request.json();
  if (!user_id || !label) {
    return NextResponse.json({ detail: "A user and label are required." }, { status: 400 });
  }

  const users = await getCollection("users");
  const recipient = await users.findOne({ id: user_id });
  if (!recipient) {
    return NextResponse.json({ detail: "User not found." }, { status: 404 });
  }

  const doc = {
    id: randomUUID(),
    user_id,
    type: type || "bonus",
    value: Number(value) || 0,
    label,
    competition_id: null,
    awarded_by: session.id,
    ...(points_awarded ? { points_awarded: Number(points_awarded) } : {}),
    awarded_at: new Date().toISOString(),
  };

  const rewards = await getCollection("rewards");
  await rewards.insertOne(doc);

  if (points_awarded) {
    await users.updateOne({ id: user_id }, { $inc: { points: Number(points_awarded) } });
  }

  return NextResponse.json({ reward: doc }, { status: 201 });
}
