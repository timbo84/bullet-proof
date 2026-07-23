import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can manage declarations." }, { status: 403 });
  }
  const { id } = await params;
  const { text, active } = await request.json();

  const declarationsList = await getCollection("declarations_list");
  const set = {};
  if (text !== undefined) set["items.$.text"] = text;
  if (active !== undefined) set["items.$.active"] = active;
  if (Object.keys(set).length === 0) {
    return NextResponse.json({ detail: "Nothing to update." }, { status: 400 });
  }

  await declarationsList.updateOne({ id: "singleton", "items.id": id }, { $set: set });
  return NextResponse.json({ detail: "Updated" });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can manage declarations." }, { status: 403 });
  }
  const { id } = await params;

  const declarationsList = await getCollection("declarations_list");
  await declarationsList.updateOne({ id: "singleton" }, { $pull: { items: { id } } });
  return NextResponse.json({ detail: "Deleted" });
}
