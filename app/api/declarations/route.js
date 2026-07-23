import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";
import { todayCentral } from "@/lib/dates";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const declarationsList = await getCollection("declarations_list");
  const doc = await declarationsList.findOne({ id: "singleton" });

  if (!doc) {
    return NextResponse.json({ items: [], points: 15, completedToday: false });
  }

  const dailyCompletions = await getCollection("daily_completions");
  const completion = await dailyCompletions.findOne({
    user_id: session.id,
    completion_date: todayCentral(),
  });

  const items = [...(doc.items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return NextResponse.json({
    items: items.map(stripMongoId),
    points: doc.points ?? 15,
    completedToday: Boolean(completion),
  });
}
