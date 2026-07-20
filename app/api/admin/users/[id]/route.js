import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { ROLES } from "@/lib/roles";

const EDITABLE_FIELDS = ["role", "district_id", "active", "linked_officer_id"];

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();

  const update = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) update[field] = body[field];
  }
  if (update.role && !ROLES.includes(update.role)) {
    return NextResponse.json({ detail: "Invalid role." }, { status: 400 });
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ detail: "Nothing to update." }, { status: 400 });
  }

  const users = await getCollection("users");
  const result = await users.updateOne({ id }, { $set: update });
  if (result.matchedCount === 0) {
    return NextResponse.json({ detail: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
