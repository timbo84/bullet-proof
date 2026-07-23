import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

const EDITABLE_FIELDS = [
  "title",
  "description",
  "date",
  "start_time",
  "end_time",
  "location",
  "district_id",
  "points",
];

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;

  const workshops = await getCollection("workshops");
  const workshop = await workshops.findOne({ id });
  if (!workshop) {
    return NextResponse.json({ detail: "Workshop not found." }, { status: 404 });
  }

  const completions = await getCollection("workshop_completions");
  const myCompletion = await completions.findOne({ user_id: session.id, workshop_id: id });

  return NextResponse.json({
    workshop: stripMongoId(workshop),
    completion: myCompletion ? stripMongoId(myCompletion) : null,
  });
}

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;

  const workshops = await getCollection("workshops");
  const workshop = await workshops.findOne({ id });
  if (!workshop) {
    return NextResponse.json({ detail: "Workshop not found." }, { status: 404 });
  }

  const isOwnerEditingPending =
    session.role === "Instructor" &&
    workshop.uploader_id === session.id &&
    workshop.status === "pending";
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
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ detail: "Nothing to update." }, { status: 400 });
  }

  await workshops.updateOne({ id }, { $set: update });
  const updated = await workshops.findOne({ id });
  return NextResponse.json({ workshop: stripMongoId(updated) });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can delete workshops." }, { status: 403 });
  }
  const { id } = await params;
  const workshops = await getCollection("workshops");
  const result = await workshops.deleteOne({ id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ detail: "Workshop not found." }, { status: 404 });
  }
  return NextResponse.json({ detail: "Deleted." });
}
