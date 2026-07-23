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
  const { reflection, proof_image_base64 } = await request.json().catch(() => ({}));
  if (!reflection || !reflection.trim()) {
    return NextResponse.json({ detail: "A reflection is required." }, { status: 400 });
  }

  const workshops = await getCollection("workshops");
  const workshop = await workshops.findOne({ id });
  if (!workshop) {
    return NextResponse.json({ detail: "Workshop not found." }, { status: 404 });
  }

  const completions = await getCollection("workshop_completions");
  const already = await completions.findOne({ user_id: session.id, workshop_id: id });
  const points = already ? 0 : Number(workshop.points) || 20;

  const doc = {
    id: randomUUID(),
    workshop_id: id,
    user_id: session.id,
    reflection: reflection.trim(),
    proof_image_base64: proof_image_base64 || null,
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
    const body = `Workshop reflection from ${user.full_name} (${user.nickname})\n${workshop.title}\n\n${reflection.trim()}`;
    await sendSystemMessage(session.id, director.id, body);
  }

  return NextResponse.json({ detail: "Completed", points_awarded: points });
}
