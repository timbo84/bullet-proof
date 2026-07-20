import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const competitions = await getCollection("competitions");
  const all = await competitions.find({}).sort({ created_at: -1 }).toArray();
  return NextResponse.json({ competitions: all.map(stripMongoId) });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can create competitions." }, { status: 403 });
  }

  const { name, description, end_date } = await request.json();
  if (!name || !end_date) {
    return NextResponse.json({ detail: "Name and end date are required." }, { status: 400 });
  }

  const doc = {
    id: randomUUID(),
    name,
    description: description || "",
    end_date,
    status: "active",
    winner_user_id: null,
    tournament_id: null,
    created_by: session.id,
    created_at: new Date().toISOString(),
  };

  const competitions = await getCollection("competitions");
  await competitions.insertOne(doc);

  return NextResponse.json({ competition: doc }, { status: 201 });
}
