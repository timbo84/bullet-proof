import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can manage declarations." }, { status: 403 });
  }

  const { text } = await request.json();
  if (!text || !text.trim()) {
    return NextResponse.json({ detail: "Text is required." }, { status: 400 });
  }

  const declarationsList = await getCollection("declarations_list");
  const doc = await declarationsList.findOne({ id: "singleton" });
  const item = { id: randomUUID(), text: text.trim(), active: true, order: doc?.items?.length ?? 0 };

  if (!doc) {
    await declarationsList.insertOne({ id: "singleton", items: [item], points: 15 });
  } else {
    await declarationsList.updateOne({ id: "singleton" }, { $push: { items: item } });
  }

  return NextResponse.json({ item }, { status: 201 });
}
