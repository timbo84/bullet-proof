import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";

const EDITABLE_FIELDS = ["nickname", "bio", "photo"];

export async function PATCH(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json();
  const update = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) update[field] = body[field];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ detail: "Nothing to update." }, { status: 400 });
  }

  const users = await getCollection("users");
  await users.updateOne({ id: session.id }, { $set: update });

  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
