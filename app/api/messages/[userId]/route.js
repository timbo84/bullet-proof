import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const { userId } = await params;

  const users = await getCollection("users");
  const otherUser = await users.findOne({ id: userId });
  if (!otherUser) {
    return NextResponse.json({ detail: "User not found." }, { status: 404 });
  }

  const messages = await getCollection("messages");
  const thread = await messages
    .find({
      $or: [
        { from_user_id: session.id, to_user_id: userId },
        { from_user_id: userId, to_user_id: session.id },
      ],
    })
    .sort({ created_at: 1 })
    .toArray();

  await messages.updateMany(
    { from_user_id: userId, to_user_id: session.id, read: false },
    { $set: { read: true } }
  );

  const { password_hash, ...safeOtherUser } = otherUser;

  return NextResponse.json({
    messages: thread.map(stripMongoId),
    otherUser: stripMongoId(safeOtherUser),
  });
}

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const { userId } = await params;
  const { content } = await request.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ detail: "Message can't be empty." }, { status: 400 });
  }

  const users = await getCollection("users");
  const [me, otherUser] = await Promise.all([
    users.findOne({ id: session.id }),
    users.findOne({ id: userId }),
  ]);
  if (!otherUser) {
    return NextResponse.json({ detail: "User not found." }, { status: 404 });
  }

  const doc = {
    id: randomUUID(),
    from_user_id: session.id,
    from_name: me?.nickname || me?.full_name || session.email,
    to_user_id: userId,
    content: content.trim(),
    read: false,
    created_at: new Date().toISOString(),
  };

  const messages = await getCollection("messages");
  await messages.insertOne(doc);

  return NextResponse.json({ message: doc }, { status: 201 });
}
