import { getCollection } from "@/lib/db";

export async function getDistrictMap() {
  const districts = await getCollection("districts");
  const all = await districts.find({}).toArray();
  return Object.fromEntries(all.map((d) => [d.id, d.name]));
}
