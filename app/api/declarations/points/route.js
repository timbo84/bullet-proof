import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function PUT(request) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can manage declarations." }, { status: 403 });
  }
  const { points } = await request.json();
  const n = Number(points);
  if (!Number.isFinite(n) || n < 0 || n > 1000) {
    return NextResponse.json({ detail: "Points must be between 0 and 1000." }, { status: 400 });
  }

  const declarationsList = await getCollection("declarations_list");
  await declarationsList.updateOne(
    { id: "singleton" },
    { $set: { points: n } },
    { upsert: true }
  );
  return NextResponse.json({ detail: "Updated" });
}
