import { NextResponse } from "next/server";
import { getCollection, stripMongoId } from "@/lib/db";

// Public — the signup page needs this before the visitor has an account.
export async function GET() {
  const districts = await getCollection("districts");
  const all = await districts.find({}).sort({ name: 1 }).toArray();
  return NextResponse.json({ districts: all.map(stripMongoId) });
}
