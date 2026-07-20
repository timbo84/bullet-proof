import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const items = await getCollection("declaration_items");
  const completions = await getCollection("declaration_completions");

  const activeItems = await items.find({ active: true }).sort({ created_at: 1 }).toArray();
  const today = new Date().toISOString().slice(0, 10);
  const completion = await completions.findOne({ user_id: session.id, date: today });

  return NextResponse.json({
    items: activeItems.map(stripMongoId),
    completedToday: Boolean(completion),
  });
}
