import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

const CAN_MANAGE_ROLES = ["Director", "Instructor"];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const workshops = await getCollection("workshops");
  const filter =
    session.role === "Director" ? {} : { $or: [{ status: { $exists: false } }, { status: "approved" }] };
  const all = await workshops.find(filter).sort({ created_at: -1 }).toArray();

  const completions = await getCollection("workshop_completions");
  const myCompletions = await completions.find({ user_id: session.id }).toArray();
  const completedIds = new Set(myCompletions.map((c) => c.workshop_id));

  return NextResponse.json({
    workshops: all.map((w) => ({ ...stripMongoId(w), completed: completedIds.has(w.id) })),
  });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || !CAN_MANAGE_ROLES.includes(session.role)) {
    return NextResponse.json({ detail: "You can't create workshops." }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, date, location, points, district_id } = body;
  if (!title) {
    return NextResponse.json({ detail: "Title is required." }, { status: 400 });
  }

  const users = await getCollection("users");
  const creator = await users.findOne({ id: session.id });

  const doc = {
    id: randomUUID(),
    title,
    description: description || "",
    date: date || null,
    location: location || "TBD",
    district_id: district_id || null,
    points: Number(points) || 0,
    status: session.role === "Director" ? "approved" : "pending",
    created_by: session.id,
    created_by_name: creator?.full_name || session.email,
    created_at: new Date().toISOString(),
  };

  const workshops = await getCollection("workshops");
  await workshops.insertOne(doc);

  return NextResponse.json({ workshop: doc }, { status: 201 });
}
