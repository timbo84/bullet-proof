import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can reject media." }, { status: 403 });
  }
  const { id } = await params;
  const media = await getCollection("media");
  const result = await media.updateOne({ id }, { $set: { status: "rejected" } });
  if (result.matchedCount === 0) {
    return NextResponse.json({ detail: "Media not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
