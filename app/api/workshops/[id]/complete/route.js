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

  const workshops = await getCollection("workshops");
  const workshop = await workshops.findOne({ id });
  if (!workshop) {
    return NextResponse.json({ detail: "Workshop not found." }, { status: 404 });
  }

  const completions = await getCollection("workshop_completions");
  const existing = await completions.findOne({ user_id: session.id, workshop_id: id });
  if (existing) {
    return NextResponse.json({ detail: "You already completed this workshop." }, { status: 409 });
  }

  const points = Number(workshop.points) || 0;
  const doc = {
    id: randomUUID(),
    user_id: session.id,
    workshop_id: id,
    workshop_title: workshop.title,
    reflection: reflection || "",
    points_awarded: points,
    completed_at: new Date().toISOString(),
  };
  await completions.insertOne(doc);

  const users = await getCollection("users");
  await users.updateOne({ id: session.id }, { $inc: { points } });

  return NextResponse.json({ completion: doc }, { status: 201 });
}
