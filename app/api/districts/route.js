import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const districts = await getCollection("districts");
  const all = await districts.find({}).sort({ name: 1 }).toArray();
  return NextResponse.json({ districts: all.map(stripMongoId) });
}
