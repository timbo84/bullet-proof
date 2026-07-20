import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getCollection, stripMongoId } from "@/lib/db";
import { ROLES } from "@/lib/roles";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }
  const announcements = await getCollection("announcements");
  const all = await announcements.find({}).sort({ sent_at: -1 }).toArray();
  return NextResponse.json({ announcements: all.map(stripMongoId) });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== "Director") {
    return NextResponse.json({ detail: "Only Directors can send broadcasts." }, { status: 403 });
  }

  const { title, body, target_role, target_district_id } = await request.json();
  if (!title || !body) {
    return NextResponse.json({ detail: "Title and body are required." }, { status: 400 });
  }
  if (target_role && target_role !== "All" && !ROLES.includes(target_role)) {
    return NextResponse.json({ detail: "Invalid target role." }, { status: 400 });
  }

  const users = await getCollection("users");
  const sender = await users.findOne({ id: session.id });

  const announcement = {
    id: randomUUID(),
    title,
    body,
    target_role: target_role || "All",
    target_district_id: target_district_id || null,
    sent_by: session.id,
    sent_at: new Date().toISOString(),
  };
  const announcements = await getCollection("announcements");
  await announcements.insertOne(announcement);

  // Fan out as direct messages so recipients see it in their inbox.
  const recipientFilter = {
    active: true,
    id: { $ne: session.id },
    ...(announcement.target_role !== "All" ? { role: announcement.target_role } : {}),
    ...(announcement.target_district_id ? { district_id: announcement.target_district_id } : {}),
  };
  const recipients = await users.find(recipientFilter).project({ id: 1 }).toArray();

  if (recipients.length > 0) {
    const messages = await getCollection("messages");
    const now = new Date().toISOString();
    await messages.insertMany(
      recipients.map((r) => ({
        id: randomUUID(),
        from_user_id: session.id,
        from_name: sender?.full_name || "Director",
        to_user_id: r.id,
        content: `${title}\n\n${body}`,
        read: false,
        created_at: now,
      }))
    );
  }

  return NextResponse.json({ announcement, recipientCount: recipients.length }, { status: 201 });
}
