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

  const media = await getCollection("media");
  const filter =
    session.role === "Director"
      ? {}
      : { status: "approved", audience: session.role };
  const all = await media.find(filter).sort({ created_at: -1 }).toArray();

  const completions = await getCollection("media_completions");
  const myCompletions = await completions.find({ user_id: session.id }).toArray();
  const completedIds = new Set(myCompletions.map((c) => c.media_id));

  return NextResponse.json({
    media: all.map((m) => ({ ...stripMongoId(m), completed: completedIds.has(m.id) })),
  });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || !CAN_MANAGE_ROLES.includes(session.role)) {
    return NextResponse.json({ detail: "You can't add media." }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, type, category, url, thumbnail_url, points, duration_minutes, audience } =
    body;
  if (!title || !url) {
    return NextResponse.json({ detail: "Title and URL are required." }, { status: 400 });
  }

  const users = await getCollection("users");
  const creator = await users.findOne({ id: session.id });

  const doc = {
    id: randomUUID(),
    title,
    description: description || "",
    type: type || "video",
    category: category || "Training",
    url,
    thumbnail_url: thumbnail_url || null,
    points: Number(points) || 0,
    duration_minutes: Number(duration_minutes) || 0,
    audience: Array.isArray(audience) && audience.length ? audience : ["Officer"],
    status: session.role === "Director" ? "approved" : "pending",
    created_by: session.id,
    created_by_name: creator?.full_name || session.email,
    created_at: new Date().toISOString(),
  };

  const media = await getCollection("media");
  await media.insertOne(doc);

  return NextResponse.json({ media: doc }, { status: 201 });
}
