import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "Chaplain") {
    return NextResponse.json({ detail: "Not authorized." }, { status: 403 });
  }

  const users = await getCollection("users");
  const me = await users.findOne({ id: session.id });

  const officers = await users
    .find({ role: "Officer", active: true, district_id: me?.district_id ?? null })
    .project({ _id: 0, id: 1, full_name: 1, nickname: 1, photo: 1, points: 1 })
    .sort({ full_name: 1 })
    .toArray();

  return NextResponse.json({ officers });
}
