import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can approve events." }, { status: 403 });
  }

  const { id } = await params;
  const events = await getCollection("events");
  const result = await events.updateOne({ id }, { $set: { status: "approved" } });
  if (result.matchedCount === 0) {
    return NextResponse.json({ detail: "Event not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
