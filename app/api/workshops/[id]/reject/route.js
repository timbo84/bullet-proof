import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can reject workshops." }, { status: 403 });
  }
  const { id } = await params;
  const workshops = await getCollection("workshops");
  const result = await workshops.updateOne({ id }, { $set: { status: "rejected" } });
  if (result.matchedCount === 0) {
    return NextResponse.json({ detail: "Workshop not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
