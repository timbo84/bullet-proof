import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || !["Chaplain", "Director"].includes(session.role)) {
    return NextResponse.json({ detail: "Not authorized." }, { status: 403 });
  }

  const interactions = await getCollection("chaplain_interactions");
  const filter = session.role === "Director" ? {} : { chaplain_id: session.id };
  const all = await interactions.find(filter).sort({ created_at: -1 }).toArray();

  return NextResponse.json({ interactions: all.map(stripMongoId) });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== "Chaplain") {
    return NextResponse.json({ detail: "Only Chaplains can log interactions." }, { status: 403 });
  }

  const { officer_id, type, notes } = await request.json();
  if (!officer_id || !type) {
    return NextResponse.json({ detail: "An officer and type are required." }, { status: 400 });
  }

  const users = await getCollection("users");
  const [chaplain, officer] = await Promise.all([
    users.findOne({ id: session.id }),
    users.findOne({ id: officer_id }),
  ]);
  if (!officer) {
    return NextResponse.json({ detail: "Officer not found." }, { status: 404 });
  }

  const doc = {
    id: randomUUID(),
    chaplain_id: session.id,
    chaplain_name: chaplain?.full_name || session.email,
    officer_id,
    officer_name: officer.full_name,
    type,
    notes: notes || "",
    created_at: new Date().toISOString(),
  };

  const interactions = await getCollection("chaplain_interactions");
  await interactions.insertOne(doc);

  return NextResponse.json({ interaction: doc }, { status: 201 });
}
