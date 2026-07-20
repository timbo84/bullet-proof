import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "test_database";

// Reuse the client across Hot Module Reloads in dev so we don't open a new
// connection pool on every edit.
const globalForMongo = globalThis;

function getClient() {
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(MONGO_URL);
    globalForMongo._mongoClientPromise = client.connect();
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb() {
  const client = await getClient();
  return client.db(DB_NAME);
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}

// Mongo's auto-generated _id isn't part of the original app's schema (which
// keyed everything on a UUID `id` field) — strip it before sending to the client.
export function stripMongoId(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest;
}
