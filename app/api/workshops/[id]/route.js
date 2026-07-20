import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;

  const workshops = await getCollection("workshops");
  const workshop = await workshops.findOne({ id });
  if (!workshop) {
    return NextResponse.json({ detail: "Workshop not found." }, { status: 404 });
  }

  const completions = await getCollection("workshop_completions");
  const myCompletion = await completions.findOne({ user_id: session.id, workshop_id: id });

  return NextResponse.json({
    workshop: stripMongoId(workshop),
    completion: myCompletion ? stripMongoId(myCompletion) : null,
  });
}
