import { randomUUID } from "crypto";
import { getCollection } from "@/lib/db";

// Insert a system-originated direct message (reflections to the Director,
// reward notifications, broadcast fan-out, etc.).
export async function sendSystemMessage(fromUserId, toUserId, body) {
  const messages = await getCollection("messages");
  const doc = {
    id: randomUUID(),
    from_user_id: fromUserId,
    to_user_id: toUserId,
    body,
    sent_at: new Date().toISOString(),
    read: false,
  };
  await messages.insertOne(doc);
  return doc;
}
