import mongoose from "mongoose";

/**
 * Cached Mongoose connection. In development, hot reload re-evaluates modules,
 * and on serverless every invocation may reuse a warm instance — keeping the
 * connection promise on `globalThis` avoids opening a new pool each time.
 *
 * When MongoDB is unreachable the connection fails fast and further
 * attempts are skipped for a short cool-down, so pages can fall back to the
 * built-in seed content instead of hanging.
 */
type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  failedAt: number;
  warned: boolean;
};

const globalCache = globalThis as unknown as { _mongoose?: Cache };
const cache: Cache = (globalCache._mongoose ??= { conn: null, promise: null, failedAt: 0, warned: false });

const RETRY_AFTER_MS = 10_000;

export class DatabaseUnavailableError extends Error {
  constructor(message = "The database is not connected.") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

/** True for connection-level failures (as opposed to bugs or validation errors). */
export function isDatabaseUnavailable(err: unknown): boolean {
  if (err instanceof DatabaseUnavailableError) return true;
  const e = err as { name?: string; message?: string; code?: string } | null;
  return Boolean(
    e &&
      (e.name === "DatabaseUnavailableError" ||
        /ServerSelection|MongoNetwork|MongoNotConnected/.test(e.name ?? "") ||
        e.code === "ECONNREFUSED" ||
        /ECONNREFUSED|MONGODB_URI is not set/.test(e.message ?? "")),
  );
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new DatabaseUnavailableError("MONGODB_URI is not set. Copy .env.example to .env.local and set it.");

  // If connection is already alive and active, reuse immediately without reconnecting
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  // If previous connection dropped, reset cache to establish fresh connection
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cache.conn = null;
    cache.promise = null;
  }

  if (cache.failedAt && Date.now() - cache.failedAt < RETRY_AFTER_MS) throw new DatabaseUnavailableError();

  cache.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 10,
    minPoolSize: 2, // Keeps warm connections ready so requests don't suffer a 1s handshake delay
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  try {
    cache.conn = await cache.promise;
    cache.failedAt = 0;
    cache.warned = false;
  } catch {
    cache.conn = null;
    cache.promise = null;
    cache.failedAt = Date.now();
    if (!cache.warned) {
      cache.warned = true;
      console.warn(
        "[db] MongoDB is unreachable — serving the built-in seed content. Cart, orders, accounts and forms are disabled until it is back.",
      );
    }
    throw new DatabaseUnavailableError();
  }
  return cache.conn;
}
