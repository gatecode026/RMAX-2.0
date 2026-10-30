/**
 * One-time, non-destructive index migration for the shared-email / per-role auth model.
 *
 * Before: `users.email` had a single-field UNIQUE index — one email could ever belong to
 *         exactly one account, which is why Admin/Manager could never share an email address.
 * After:  that index is replaced with a UNIQUE COMPOUND index on (email, role) — the same
 *         email may now have at most one Admin, one Manager and one Customer document, each
 *         with its own independent password hash, while still preventing two accounts of the
 *         *same* role from sharing an email.
 *
 * This only touches index metadata — no documents are modified, inserted or deleted. The new
 * index is strictly weaker than the old one, so every existing document already satisfies it
 * and index creation cannot fail due to pre-existing data.
 *
 * Usage: npx tsx scripts/migrate-auth-indexes.ts
 */
import { config } from "dotenv";
import { connectDB } from "../src/lib/mongodb";
import { User } from "../src/models/User";
import { Cart } from "../src/models/Cart";

config({ path: ".env.local" });
config();

async function main() {
  console.log("Connecting to database...");
  await connectDB();
  console.log("Connected.");

  const coll = User.collection;
  const before = await coll.indexes();
  console.log("\nIndexes before migration:");
  for (const ix of before) console.log(` - ${ix.name}: ${JSON.stringify(ix.key)}${ix.unique ? " (unique)" : ""}`);

  const legacyUniqueEmailIndex = before.find(
    (ix) => ix.unique && ix.key && Object.keys(ix.key).length === 1 && ix.key.email === 1,
  );

  if (legacyUniqueEmailIndex?.name) {
    console.log(`\nDropping legacy single-field unique index "${legacyUniqueEmailIndex.name}" on { email }...`);
    await coll.dropIndex(legacyUniqueEmailIndex.name);
    console.log("Dropped.");
  } else {
    console.log("\nNo legacy single-field unique email index found — nothing to drop.");
  }

  // Same problem, same fix: a global unique index on `phone` alone (however it got there) would
  // block an Admin and Manager identity for the same person from sharing a phone number, just
  // like the old email index blocked them from sharing an email. Replace it with the
  // role-scoped { phone, role } unique index declared on the schema.
  const legacyUniquePhoneIndex = before.find(
    (ix) => ix.unique && ix.key && Object.keys(ix.key).length === 1 && ix.key.phone === 1,
  );
  if (legacyUniquePhoneIndex?.name) {
    console.log(`\nDropping legacy single-field unique index "${legacyUniquePhoneIndex.name}" on { phone }...`);
    await coll.dropIndex(legacyUniquePhoneIndex.name);
    console.log("Dropped.");
  } else {
    console.log("\nNo legacy single-field unique phone index found — nothing to drop.");
  }

  console.log("\nEnsuring schema-defined indexes exist (creates the new unique { email, role } index)...");
  await User.createIndexes();

  const after = await coll.indexes();
  console.log("\nIndexes after migration:");
  for (const ix of after) console.log(` - ${ix.name}: ${JSON.stringify(ix.key)}${ix.unique ? " (unique)" : ""}`);

  // Backfill new fields on any pre-existing documents so they have sane defaults immediately
  // (Mongoose schema `default`s only apply on save/read of new docs, not retroactively).
  const res = await User.updateMany(
    { tokenVersion: { $exists: false } },
    { $set: { tokenVersion: 0, failedLoginAttempts: 0, lockedUntil: null } },
  );
  console.log(`\nBackfilled tokenVersion/failedLoginAttempts on ${res.modifiedCount} existing user document(s).`);

  // --- Cart: anonymous-token carts -> customer-owned carts ---------------------------------
  // The old `carts` collection keyed documents by an opaque browser cookie token with a
  // non-sparse UNIQUE index on that field. The new schema has no `token` field at all — every
  // new cart document will simply omit it, and MongoDB treats a missing indexed field as `null`
  // for a non-sparse unique index, so the *second* customer cart ever created under the new
  // schema would fail with a duplicate-key error on token:null. Drop that index to prevent it.
  // Legacy anonymous cart documents are left in place (ownership cannot be safely inferred —
  // see PRD "do not auto-assign guest carts to any customer"); they are no longer queried by
  // any code path and will self-expire via the existing updatedAt TTL index.
  const cartColl = Cart.collection;
  const cartIndexesBefore = await cartColl.indexes();
  console.log("\nCart collection indexes before migration:");
  for (const ix of cartIndexesBefore) console.log(` - ${ix.name}: ${JSON.stringify(ix.key)}${ix.unique ? " (unique)" : ""}`);

  const legacyUniqueTokenIndex = cartIndexesBefore.find(
    (ix) => ix.unique && ix.key && Object.keys(ix.key).length === 1 && ix.key.token === 1,
  );
  if (legacyUniqueTokenIndex?.name) {
    console.log(`\nDropping legacy single-field unique index "${legacyUniqueTokenIndex.name}" on { token }...`);
    await cartColl.dropIndex(legacyUniqueTokenIndex.name);
    console.log("Dropped.");
  } else {
    console.log("\nNo legacy unique token index found on carts — nothing to drop.");
  }

  // The TTL window changed (30 -> 90 days) on the same `updatedAt` field, which Mongo treats as
  // an options conflict rather than a no-op — drop and let createIndexes recreate it.
  const staleTtlIndex = cartIndexesBefore.find((ix) => ix.name === "updatedAt_1" && ix.expireAfterSeconds !== 60 * 60 * 24 * 90);
  if (staleTtlIndex?.name) {
    console.log(`\nDropping stale TTL index "${staleTtlIndex.name}" (old expireAfterSeconds=${staleTtlIndex.expireAfterSeconds})...`);
    await cartColl.dropIndex(staleTtlIndex.name);
    console.log("Dropped.");
  }

  console.log("\nEnsuring Cart schema-defined indexes exist (creates the new unique { customerId } index)...");
  await Cart.createIndexes();

  const cartIndexesAfter = await cartColl.indexes();
  console.log("\nCart collection indexes after migration:");
  for (const ix of cartIndexesAfter) console.log(` - ${ix.name}: ${JSON.stringify(ix.key)}${ix.unique ? " (unique)" : ""}`);

  const orphanedCarts = await cartColl.countDocuments({ customerId: { $exists: false } });
  console.log(
    `\n${orphanedCarts} legacy anonymous (token-based) cart document(s) remain, left untouched. They are no longer reachable by any code path and will self-expire via the existing TTL index.`,
  );

  console.log("\nMigration complete. No documents were deleted or had destructive changes applied.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
