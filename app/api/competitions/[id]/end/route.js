import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can end competitions." }, { status: 403 });
  }
  const { id } = await params;
  const competitions = await getCollection("competitions");
  const result = await competitions.updateOne({ id }, { $set: { status: "ended" } });
  if (result.matchedCount === 0) {
    return NextResponse.json({ detail: "Competition not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
