// Import legacy data from data-export/ into this app's MongoDB, using the
// same field mappings as the real backend's own migration script
// (emergeSave/backend/scripts/import_legacy_data.py) — not a raw 1:1 copy of
// the legacy JSON shape, which used different field/collection names.
//
// Usage:
//   node --env-file=.env.local scripts/import-legacy-data.mjs /path/to/data-export
//
// This WIPES the target collections before importing, so ids stay
// authoritative and re-running is always safe (idempotent).
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "test_database";

const COLLECTIONS_TO_WIPE = [
  "users",
  "districts",
  "media",
  "workshops",
  "workshop_completions",
  "media_completions",
  "events",
  "declarations_list",
  "daily_completions",
  "messages",
  "announcements",
  "rewards",
  "competitions",
  "chaplain_interactions",
];

function mapMediaType(t) {
  const type = (t || "").toLowerCase();
  if (type === "podcast" || type === "audio") return "audio";
  if (type === "video" || type === "youtube" || type === "vimeo") return "video";
  return "link";
}

function splitWorkshopDate(raw) {
  if (!raw || typeof raw !== "string") return [raw, null];
  if (raw.includes(" ")) {
    const [d, t] = raw.split(" ", 2);
    return [d.trim(), t.trim().slice(0, 5)];
  }
  return [raw.trim(), null];
}

async function loadJson(dir, file) {
  return JSON.parse(await readFile(path.join(dir, file), "utf8"));
}

async function main() {
  const exportDir = process.argv[2] || "./data-export";
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log(`Target DB: ${DB_NAME} @ ${MONGO_URL}`);
  console.log(`Export dir: ${exportDir}`);

  for (const name of COLLECTIONS_TO_WIPE) {
    const { deletedCount } = await db.collection(name).deleteMany({});
    console.log(`  wipe  ${name.padEnd(20)} deleted ${deletedCount}`);
  }

  const usersRaw = await loadJson(exportDir, "users.json");
  const legacyCj = usersRaw.find((u) => (u.email || "").toLowerCase() === "cj@cjellis.co");
  const legacyCjId = legacyCj?.id || null;
  console.log(`Legacy CJ id: ${legacyCjId}`);

  // users
  for (const u of usersRaw) {
    u.email = u.email.toLowerCase();
    if (u.linked_officer_nickname === undefined) u.linked_officer_nickname = null;
    if (u.points === undefined) u.points = 0;
    if (u.active === undefined) u.active = true;
    if (u.photo === undefined) u.photo = null;
    if (u.bio === undefined) u.bio = null;
    delete u.linked_officer_id; // stale field from an earlier, incorrect import
    await db.collection("users").replaceOne({ id: u.id }, u, { upsert: true });
  }
  console.log(`  ok    users                imported ${usersRaw.length}`);

  // districts
  const districts = await loadJson(exportDir, "districts.json");
  for (const d of districts) {
    await db.collection("districts").replaceOne({ id: d.id }, d, { upsert: true });
  }

  // Backfill a placeholder district for any user referencing a district_id
  // that isn't in districts.json (documented in test_credentials.md: 14
  // legacy users reference a district that was never exported).
  const knownDistrictIds = new Set(districts.map((d) => d.id));
  const missingDistrictIds = new Set(
    usersRaw
      .map((u) => u.district_id)
      .filter((id) => id && !knownDistrictIds.has(id))
  );
  for (const id of missingDistrictIds) {
    await db.collection("districts").replaceOne(
      { id },
      { id, name: "Unassigned (legacy)", created_at: new Date().toISOString() },
      { upsert: true }
    );
  }
  console.log(
    `  ok    districts            imported ${districts.length}` +
      (missingDistrictIds.size ? ` + ${missingDistrictIds.size} legacy placeholder(s)` : "")
  );

  // events (drop created_by_name, not part of the real schema)
  const events = await loadJson(exportDir, "events.json");
  for (const e of events) {
    delete e.created_by_name;
    await db.collection("events").replaceOne({ id: e.id }, e, { upsert: true });
  }
  console.log(`  ok    events               imported ${events.length}`);

  // media
  const mediaRaw = await loadJson(exportDir, "media.json");
  for (const m of mediaRaw) {
    const adapted = {
      id: m.id,
      title: m.title || "",
      description: m.description || "",
      url: m.url || "",
      category: m.category || "Wellness",
      media_type: mapMediaType(m.type),
      audience: m.audience?.length ? m.audience : ["Officer", "Chaplain", "Partner"],
      points_on_complete: Number(m.points ?? 10),
      status: m.status || "approved",
      uploader_id: m.created_by || null,
      created_at: m.created_at,
      legacy_thumbnail_url: m.thumbnail_url || null,
      legacy_duration_minutes: m.duration_minutes ?? null,
    };
    await db.collection("media").replaceOne({ id: adapted.id }, adapted, { upsert: true });
  }
  console.log(`  ok    media                imported ${mediaRaw.length}`);

  // workshops (split date/time, add status/uploader_id)
  const workshopsRaw = await loadJson(exportDir, "workshops.json");
  for (const w of workshopsRaw) {
    const [date, startTime] = splitWorkshopDate(w.date);
    const adapted = {
      id: w.id,
      title: w.title || "",
      description: w.description || "",
      date,
      start_time: startTime,
      end_time: null,
      location: w.location || null,
      district_id: w.district_id || null,
      status: "approved",
      points: Number(w.points ?? 20),
      uploader_id: null,
      created_at: w.created_at,
    };
    await db.collection("workshops").replaceOne({ id: adapted.id }, adapted, { upsert: true });
  }
  console.log(`  ok    workshops            imported ${workshopsRaw.length}`);

  // workshop_completions / media_completions — schema already matches
  const workshopCompletions = await loadJson(exportDir, "workshop_completions.json");
  for (const x of workshopCompletions) {
    await db.collection("workshop_completions").replaceOne({ id: x.id }, x, { upsert: true });
  }
  console.log(`  ok    workshop_completions imported ${workshopCompletions.length}`);

  const mediaCompletions = await loadJson(exportDir, "media_completions.json");
  for (const x of mediaCompletions) {
    await db.collection("media_completions").replaceOne({ id: x.id }, x, { upsert: true });
  }
  console.log(`  ok    media_completions    imported ${mediaCompletions.length}`);

  // messages — content/created_at -> body/sent_at
  const messagesRaw = await loadJson(exportDir, "messages.json");
  for (const m of messagesRaw) {
    const adapted = {
      id: m.id,
      from_user_id: m.from_user_id || null,
      to_user_id: m.to_user_id || null,
      body: m.content ?? m.body ?? "",
      sent_at: m.created_at || m.sent_at,
      read: Boolean(m.read),
    };
    await db.collection("messages").replaceOne({ id: adapted.id }, adapted, { upsert: true });
  }
  console.log(`  ok    messages             imported ${messagesRaw.length}`);

  // announcements — schema matches
  const announcements = await loadJson(exportDir, "announcements.json");
  for (const a of announcements) {
    await db.collection("announcements").replaceOne({ id: a.id }, a, { upsert: true });
  }
  console.log(`  ok    announcements        imported ${announcements.length}`);

  // rewards — zero out the dollar value, preserve it as legacy_value
  const rewardsRaw = await loadJson(exportDir, "rewards.json");
  for (const r of rewardsRaw) {
    const legacyValue = Number(r.value || 0);
    const adapted = {
      id: r.id,
      user_id: r.user_id,
      type: r.type || "reward",
      label: r.label || "",
      value: 0,
      legacy_value: legacyValue,
      points_awarded: legacyValue,
      competition_id: null,
      awarded_by: legacyCjId,
      awarded_at: r.awarded_at,
    };
    await db.collection("rewards").replaceOne({ id: adapted.id }, adapted, { upsert: true });
  }
  console.log(`  ok    rewards              imported ${rewardsRaw.length}`);

  // competitions — rename name -> title to match the real API's field name
  const competitionsRaw = await loadJson(exportDir, "competitions.json");
  for (const c of competitionsRaw) {
    const { name, ...rest } = c;
    const adapted = { ...rest, title: name ?? c.title };
    await db.collection("competitions").replaceOne({ id: adapted.id }, adapted, { upsert: true });
  }
  console.log(`  ok    competitions         imported ${competitionsRaw.length}`);

  // chaplain_interactions — archival only, no feature reads this
  const chaplainInteractions = await loadJson(exportDir, "chaplain_interactions.json");
  for (const x of chaplainInteractions) {
    await db.collection("chaplain_interactions").replaceOne({ id: x.id }, x, { upsert: true });
  }
  console.log(`  ok    chaplain_interactions imported ${chaplainInteractions.length} (archival)`);

  // declarations_list singleton (from declaration_items.json + settings.json)
  const declarationItems = await loadJson(exportDir, "declaration_items.json");
  const settings = await loadJson(exportDir, "settings.json");
  let points = 15;
  for (const s of settings) {
    if (s.key === "daily_declaration_points") {
      const n = Number(s.value);
      if (!Number.isNaN(n)) points = n;
    }
  }
  declarationItems.sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
  const items = declarationItems.map((di, i) => ({
    id: di.id,
    text: di.text || "",
    active: Boolean(di.active ?? true),
    order: i,
  }));
  await db
    .collection("declarations_list")
    .replaceOne({ id: "singleton" }, { id: "singleton", items, points }, { upsert: true });
  console.log(`  ok    declarations_list    ${items.length} items, points=${points}`);

  // daily_completions (from declaration_completions.json, date -> completion_date)
  const declarationCompletions = await loadJson(exportDir, "declaration_completions.json");
  let dcCount = 0;
  for (const d of declarationCompletions) {
    const completionDate = d.date || d.completion_date;
    if (!d.user_id || !completionDate) continue;
    await db.collection("daily_completions").replaceOne(
      { id: d.id },
      { id: d.id, user_id: d.user_id, completion_date: completionDate, created_at: d.created_at },
      { upsert: true }
    );
    dcCount += 1;
  }
  console.log(`  ok    daily_completions    imported ${dcCount}`);

  // indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ nickname: 1 });
  await db
    .collection("messages")
    .createIndex({ from_user_id: 1, to_user_id: 1, sent_at: -1 });
  await db
    .collection("daily_completions")
    .createIndex({ user_id: 1, completion_date: 1 }, { unique: true });
  console.log("Indexes ensured.");

  console.log("\nDone.");
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
