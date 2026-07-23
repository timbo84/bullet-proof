import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const messages = await getCollection("messages");
  const meId = session.id;

  const conversations = await messages
    .aggregate([
      { $match: { $or: [{ from_user_id: meId }, { to_user_id: meId }] } },
      {
        $addFields: {
          otherId: {
            $cond: [{ $eq: ["$from_user_id", meId] }, "$to_user_id", "$from_user_id"],
          },
        },
      },
      { $sort: { sent_at: -1 } },
      {
        $group: {
          _id: "$otherId",
          lastMessage: { $first: "$body" },
          lastAt: { $first: "$sent_at" },
          unread: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$to_user_id", meId] }, { $eq: ["$read", false] }] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: { from: "users", localField: "_id", foreignField: "id", as: "user" },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $sort: { lastAt: -1 } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          lastMessage: 1,
          lastAt: 1,
          unread: 1,
          name: { $ifNull: ["$user.nickname", "$user.full_name"] },
          photo: "$user.photo",
          role: "$user.role",
        },
      },
    ])
    .toArray();

  return NextResponse.json({ conversations });
}
