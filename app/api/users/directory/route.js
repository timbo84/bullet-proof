import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const users = await getCollection("users");
  const list = await users
    .find({ active: true, id: { $ne: session.id } })
    .project({ id: 1, full_name: 1, nickname: 1, role: 1, photo: 1, _id: 0 })
    .sort({ full_name: 1 })
    .toArray();

  return NextResponse.json({ users: list });
}
