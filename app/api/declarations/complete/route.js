import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { todayCentral } from "@/lib/dates";
import { creditPoints } from "@/lib/points";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const declarationsList = await getCollection("declarations_list");
  const listDoc = await declarationsList.findOne({ id: "singleton" });
  const points = listDoc?.points ?? 15;

  const dailyCompletions = await getCollection("daily_completions");
  const day = todayCentral();

  const existing = await dailyCompletions.findOne({ user_id: session.id, completion_date: day });
  if (existing) {
    return NextResponse.json({ detail: "Already completed today.", points_awarded: 0 });
  }

  try {
    await dailyCompletions.insertOne({
      id: randomUUID(),
      user_id: session.id,
      completion_date: day,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Unique index race — someone else's request beat us to it.
    return NextResponse.json({ detail: "Already completed today.", points_awarded: 0 });
  }

  const users = await getCollection("users");
  const user = await users.findOne({ id: session.id });
  await creditPoints(user, points);

  return NextResponse.json({ detail: "Completed", points_awarded: points });
}
