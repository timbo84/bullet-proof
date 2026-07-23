import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";
import { MEDIA_CATEGORIES } from "@/lib/constants";

const EDITABLE_FIELDS = [
  "title",
  "description",
  "url",
  "category",
  "media_type",
  "audience",
  "points_on_complete",
];

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;

  const media = await getCollection("media");
  const item = await media.findOne({ id });
  if (!item) {
    return NextResponse.json({ detail: "Media not found." }, { status: 404 });
  }

  const completions = await getCollection("media_completions");
  const myCompletion = await completions.findOne({ user_id: session.id, media_id: id });

  return NextResponse.json({
    media: stripMongoId(item),
    completion: myCompletion ? stripMongoId(myCompletion) : null,
  });
}

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;

  const media = await getCollection("media");
  const item = await media.findOne({ id });
  if (!item) {
    return NextResponse.json({ detail: "Media not found." }, { status: 404 });
  }

  const isOwnerEditingPending =
    session.role === "Instructor" && item.uploader_id === session.id && item.status === "pending";
  if (session.role !== "Director" && !isOwnerEditingPending) {
    return NextResponse.json(
      { detail: "You can only edit your own submissions before they're reviewed." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const update = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) update[field] = body[field];
  }
  if (update.category && !MEDIA_CATEGORIES.includes(update.category)) {
    return NextResponse.json({ detail: "Invalid category." }, { status: 400 });
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ detail: "Nothing to update." }, { status: 400 });
  }

  await media.updateOne({ id }, { $set: update });
  const updated = await media.findOne({ id });
  return NextResponse.json({ media: stripMongoId(updated) });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can delete media." }, { status: 403 });
  }
  const { id } = await params;
  const media = await getCollection("media");
  const result = await media.deleteOne({ id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ detail: "Media not found." }, { status: 404 });
  }
  return NextResponse.json({ detail: "Deleted." });
}
