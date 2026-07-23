import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

const CAN_CREATE_ROLES = ["Director", "Instructor"];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const workshops = await getCollection("workshops");
  let filter;
  if (session.role === "Director") {
    filter = {};
  } else if (session.role === "Officer") {
    // District scoping needs the full user doc (session only carries id/role/email).
    const users = await getCollection("users");
    const me = await users.findOne({ id: session.id });
    filter = { status: "approved", district_id: me?.district_id ?? null };
  } else if (session.role === "Instructor") {
    filter = { $or: [{ status: "approved" }, { uploader_id: session.id }] };
  } else {
    filter = { status: "approved" };
  }

  const all = await workshops.find(filter).sort({ date: -1 }).toArray();

  const completions = await getCollection("workshop_completions");
  const myCompletions = await completions.find({ user_id: session.id }).toArray();
  const completedIds = new Set(myCompletions.map((c) => c.workshop_id));

  return NextResponse.json({
    workshops: all.map((w) => ({ ...stripMongoId(w), completed: completedIds.has(w.id) })),
  });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || !CAN_CREATE_ROLES.includes(session.role)) {
    return NextResponse.json({ detail: "You can't create workshops." }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, date, start_time, end_time, location, district_id, points } = body;
  if (!title || !date) {
    return NextResponse.json({ detail: "Title and date are required." }, { status: 400 });
  }

  const doc = {
    id: randomUUID(),
    title,
    description: description || "",
    date,
    start_time: start_time || null,
    end_time: end_time || null,
    location: location || null,
    district_id: district_id || null,
    status: session.role === "Director" ? "approved" : "pending",
    points: Number(points) || 20,
    uploader_id: session.id,
    created_at: new Date().toISOString(),
  };

  const workshops = await getCollection("workshops");
  await workshops.insertOne(doc);

  return NextResponse.json({ workshop: doc }, { status: 201 });
}
