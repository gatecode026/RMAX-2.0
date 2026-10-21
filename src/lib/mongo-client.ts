import { MongoClient } from "mongodb";

/** Cached native MongoClient promise — required by the Auth.js MongoDB adapter. */
const globalCache = globalThis as unknown as { _mongoClient?: Promise<MongoClient> };

export function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Never throw at import time: the site must still start without a database.
    const missing = Promise.reject(new Error("MONGODB_URI is not set."));
    missing.catch(() => {});
    return missing;
  }
  if (!globalCache._mongoClient) {
    const p = new MongoClient(uri, { serverSelectionTimeoutMS: 2500 }).connect();
    // The adapter only awaits this on demand (OAuth flows, unused with credentials + JWT).
    // Swallow the rejection here so an unreachable database is not an unhandled rejection,
    // and allow a fresh attempt next time.
    p.catch(() => {
      if (globalCache._mongoClient === p) globalCache._mongoClient = undefined;
    });
    globalCache._mongoClient = p;
  }
  return globalCache._mongoClient;
}
