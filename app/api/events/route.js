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

  const events = await getCollection("events");
  const filter =
    session.role === "Director" ? {} : { $or: [{ status: { $exists: false } }, { status: "approved" }] };
  const all = await events.find(filter).sort({ date: 1 }).toArray();

  return NextResponse.json({ events: all.map(stripMongoId) });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || !CAN_CREATE_ROLES.includes(session.role)) {
    return NextResponse.json({ detail: "You can't create events." }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, date, start_time, end_time, location, category, rsvp_url, district_id } =
    body;
  if (!title || !date || !category) {
    return NextResponse.json({ detail: "Title, date, and category are required." }, { status: 400 });
  }

  const users = await getCollection("users");
  const creator = await users.findOne({ id: session.id });

  const doc = {
    id: randomUUID(),
    title,
    description: description || "",
    date,
    start_time: start_time || null,
    end_time: end_time || null,
    location: location || "TBD",
    category,
    rsvp_url: rsvp_url || null,
    district_id: district_id || null,
    status: session.role === "Director" ? "approved" : "pending",
    created_by: session.id,
    created_by_name: creator?.full_name || session.email,
    created_at: new Date().toISOString(),
  };

  const events = await getCollection("events");
  await events.insertOne(doc);

  return NextResponse.json({ event: doc }, { status: 201 });
}
