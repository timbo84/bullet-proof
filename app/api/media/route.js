import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";
import { MEDIA_CATEGORIES } from "@/lib/constants";

const CAN_CREATE_ROLES = ["Director", "Instructor"];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const media = await getCollection("media");
  let filter;
  if (session.role === "Director") {
    filter = {};
  } else if (session.role === "Instructor") {
    filter = { $or: [{ status: "approved" }, { uploader_id: session.id }] };
  } else {
    filter = { status: "approved", audience: { $in: [session.role] } };
  }
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
  if (!session || !CAN_CREATE_ROLES.includes(session.role)) {
    return NextResponse.json({ detail: "You can't add media." }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, url, category, media_type, audience, points_on_complete } = body;
  if (!title || !url) {
    return NextResponse.json({ detail: "Title and URL are required." }, { status: 400 });
  }
  if (!MEDIA_CATEGORIES.includes(category)) {
    return NextResponse.json({ detail: "Invalid category." }, { status: 400 });
  }

  const doc = {
    id: randomUUID(),
    title,
    description: description || "",
    url,
    category,
    media_type: media_type || "video",
    audience: Array.isArray(audience) && audience.length ? audience : ["Officer", "Chaplain", "Partner"],
    points_on_complete: Number(points_on_complete) || 10,
    status: session.role === "Director" ? "approved" : "pending",
    uploader_id: session.id,
    created_at: new Date().toISOString(),
  };

  const media = await getCollection("media");
  await media.insertOne(doc);

  return NextResponse.json({ media: doc }, { status: 201 });
}
