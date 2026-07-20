import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;
  const { reflection } = await request.json().catch(() => ({}));

  const media = await getCollection("media");
  const item = await media.findOne({ id });
  if (!item) {
    return NextResponse.json({ detail: "Media not found." }, { status: 404 });
  }

  const completions = await getCollection("media_completions");
  const existing = await completions.findOne({ user_id: session.id, media_id: id });
  if (existing) {
    return NextResponse.json({ detail: "You already completed this media item." }, { status: 409 });
  }

  const points = Number(item.points) || 0;
  const doc = {
    id: randomUUID(),
    user_id: session.id,
    user_role: session.role,
    media_id: id,
    media_title: item.title,
    reflection: reflection || "",
    points_awarded: points,
    completed_at: new Date().toISOString(),
  };
  await completions.insertOne(doc);

  const users = await getCollection("users");
  await users.updateOne({ id: session.id }, { $inc: { points } });

  return NextResponse.json({ completion: doc }, { status: 201 });
}
