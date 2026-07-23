import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only the Director can delete events." }, { status: 403 });
  }
  const { id } = await params;
  const events = await getCollection("events");
  const result = await events.deleteOne({ id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ detail: "Event not found." }, { status: 404 });
  }
  return NextResponse.json({ detail: "Deleted." });
}
