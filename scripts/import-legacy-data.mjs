// Import legacy data from the previous Bulletproof Cop build's data export
// into this app's MongoDB. Node port of the original Python import script
// shipped in the export's IMPORT_INSTRUCTIONS.md.
//
// Usage:
//   node --env-file=.env.local scripts/import-legacy-data.mjs /path/to/data-export
//
// - Uses replaceOne({ id }, doc, { upsert: true }) so re-running is safe.
// - Skips collections that don't belong in this app's schema (questionnaires,
//   checklist_*, declarations — see data-export/IMPORT_INSTRUCTIONS.md).
// - Preserves bcrypt password_hash so users can log in with existing passwords.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "test_database";

const IMPORT_LIST = [
  "districts",
  "users",
  "media",
  "workshops",
  "workshop_completions",
  "media_completions",
  "events",
  "declaration_items",
  "declaration_completions",
  "rewards",
  "messages",
  "announcements",
  "competitions",
  "chaplain_interactions",
  "settings",
];

async function main() {
  const exportDir = process.argv[2] || "./data-export";
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);

  let total = 0;
  for (const collectionName of IMPORT_LIST) {
    const file = path.join(exportDir, `${collectionName}.json`);
    let docs;
    try {
      docs = JSON.parse(await readFile(file, "utf8"));
    } catch {
      console.log(`  ${collectionName}.json missing — skipping`);
      continue;
    }
    if (!docs.length) {
      console.log(`  ${collectionName}: 0 docs, skipping`);
      continue;
    }

    const collection = db.collection(collectionName);
    for (const doc of docs) {
      if (!doc.id) {
        await collection.insertOne(doc);
      } else {
        await collection.replaceOne({ id: doc.id }, doc, { upsert: true });
      }
    }
    console.log(`  ${collectionName}: imported ${docs.length} docs`);
    total += docs.length;
  }

  console.log(`\nDone. ${total} documents imported into '${DB_NAME}'.`);

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ nickname: 1 });
  await db
    .collection("messages")
    .createIndex({ from_user_id: 1, to_user_id: 1, created_at: -1 });
  await db
    .collection("declaration_completions")
    .createIndex({ user_id: 1, date: 1 }, { unique: true });
  console.log("Indexes ensured.");

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
