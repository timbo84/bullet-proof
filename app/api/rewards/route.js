import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";
import { creditPoints } from "@/lib/points";
import { sendSystemMessage } from "@/lib/messages";

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const rewards = await getCollection("rewards");
  const filter = session.role === "Director" ? {} : { user_id: session.id };
  const list = await rewards.find(filter).sort({ awarded_at: -1 }).toArray();
  return NextResponse.json({ rewards: list.map(stripMongoId) });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can award rewards." }, { status: 403 });
  }

  const { user_id, label, points, competition_id, type } = await request.json();
  const pointsNum = Number(points);
  if (!user_id || !label) {
    return NextResponse.json({ detail: "A recipient and label are required." }, { status: 400 });
  }
  if (!Number.isFinite(pointsNum) || pointsNum <= 0) {
    return NextResponse.json({ detail: "Points must be a positive number." }, { status: 400 });
  }

  const users = await getCollection("users");
  const target = await users.findOne({ id: user_id });
  if (!target) {
    return NextResponse.json({ detail: "User not found." }, { status: 404 });
  }

  const doc = {
    id: randomUUID(),
    user_id,
    type: type || "reward",
    label,
    value: 0,
    points_awarded: pointsNum,
    competition_id: competition_id || null,
    awarded_by: session.id,
    awarded_at: new Date().toISOString(),
  };

  const rewards = await getCollection("rewards");
  await rewards.insertOne(doc);
  await creditPoints(target, pointsNum);

  const body = `Reward from CJ: ${label}\n\n+${pointsNum} pts credited to your account. Finish Strong.`;
  await sendSystemMessage(session.id, target.id, body);

  return NextResponse.json({ reward: doc }, { status: 201 });
}
