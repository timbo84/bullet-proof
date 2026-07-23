import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { creditPoints } from "@/lib/points";
import { sendSystemMessage } from "@/lib/messages";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;
  const { reflection } = await request.json().catch(() => ({}));
  if (!reflection || !reflection.trim()) {
    return NextResponse.json({ detail: "A reflection is required." }, { status: 400 });
  }

  const media = await getCollection("media");
  const item = await media.findOne({ id });
  if (!item) {
    return NextResponse.json({ detail: "Media not found." }, { status: 404 });
  }

  const completions = await getCollection("media_completions");
  const already = await completions.findOne({ user_id: session.id, media_id: id });
  const points = already ? 0 : Number(item.points_on_complete) || 10;

  const doc = {
    id: randomUUID(),
    media_id: id,
    user_id: session.id,
    reflection: reflection.trim(),
    points_awarded: points,
    submitted_at: new Date().toISOString(),
  };
  await completions.insertOne(doc);

  const users = await getCollection("users");
  const user = await users.findOne({ id: session.id });
  if (points > 0) {
    await creditPoints(user, points);
  }

  const director = await users.findOne({ role: "Director" });
  if (director) {
    const body = `Media reflection from ${user.full_name} (${user.nickname})\n${item.title}\n\n${reflection.trim()}`;
    await sendSystemMessage(session.id, director.id, body);
  }

  return NextResponse.json({ detail: "Completed", points_awarded: points });
}
