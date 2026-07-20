import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const users = await getCollection("users");
  const ranked = await users
    .find({ role: { $in: ["Officer", "Chaplain"] }, active: true })
    .project({ _id: 0, id: 1, nickname: 1, full_name: 1, role: 1, points: 1, photo: 1 })
    .sort({ points: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({ leaderboard: ranked });
}
