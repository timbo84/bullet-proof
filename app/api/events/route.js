import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";
import { MEDIA_CATEGORIES } from "@/lib/constants";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const events = await getCollection("events");
  const all = await events.find({}).sort({ date: 1 }).toArray();

  return NextResponse.json({ events: all.map(stripMongoId) });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only the Director can create events." }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, date, start_time, end_time, location, category, rsvp_url, district_id } =
    body;
  if (!title || !date || !category) {
    return NextResponse.json({ detail: "Title, date, and category are required." }, { status: 400 });
  }
  if (!MEDIA_CATEGORIES.includes(category)) {
    return NextResponse.json({ detail: "Invalid category." }, { status: 400 });
  }

  const doc = {
    id: randomUUID(),
    title,
    description: description || "",
    date,
    start_time: start_time || null,
    end_time: end_time || null,
    location: location || null,
    category,
    rsvp_url: rsvp_url || null,
    district_id: district_id || null,
    created_by: session.id,
    created_at: new Date().toISOString(),
  };

  const events = await getCollection("events");
  await events.insertOne(doc);

  return NextResponse.json({ event: doc }, { status: 201 });
}
