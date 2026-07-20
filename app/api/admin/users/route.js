import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Not authorized." }, { status: 403 });
  }

  const users = await getCollection("users");
  const all = await users
    .find({})
    .project({ password_hash: 0 })
    .sort({ created_at: -1 })
    .toArray();

  return NextResponse.json({ users: all.map(stripMongoId) });
}
