import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;

  const media = await getCollection("media");
  const item = await media.findOne({ id });
  if (!item) {
    return NextResponse.json({ detail: "Media not found." }, { status: 404 });
  }

  const completions = await getCollection("media_completions");
  const myCompletion = await completions.findOne({ user_id: session.id, media_id: id });

  return NextResponse.json({
    media: stripMongoId(item),
    completion: myCompletion ? stripMongoId(myCompletion) : null,
  });
}
