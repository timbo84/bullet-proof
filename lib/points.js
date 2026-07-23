import { getCollection } from "@/lib/db";

// Credit points to a user; Partners forward points to their linked Officer
// (matched by nickname), mirroring the original backend's credit_points().
export async function creditPoints(user, points) {
  const users = await getCollection("users");
  let target = user;

  if (user.role === "Partner" && user.linked_officer_nickname) {
    const officer = await users.findOne({
      nickname: user.linked_officer_nickname,
      role: "Officer",
    });
    if (officer) target = officer;
  }

  await users.updateOne({ id: target.id }, { $inc: { points } });
  return users.findOne({ id: target.id });
}
