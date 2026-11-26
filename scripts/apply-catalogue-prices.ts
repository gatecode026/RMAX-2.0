/**
 * Applies the 2025 price catalogue (prices are ex-GST; GST 18% is the model default). Idempotent.
 *   npm run apply:prices -- --dry-run
 *   npm run apply:prices
 * Also restores the archived 100-pad automatic vending machine as the "100 pads" option of the Vending family,
 * and publishes the manual 50-pad machine using the manual 25-pad photos (same unit in the catalogue).
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Product } from "../src/models/Product";
import { ProductFamily } from "../src/models/ProductFamily";
import { variantKeyOf } from "../src/lib/catalog";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });
const dryRun = process.argv.includes("--dry-run");

// slug → [selling price, struck-through MRP]
const PRICES: Record<string, [number, number]> = {
  "automatic-sanitary-napkin-vending-machine": [5499, 6500], // Basic, 50 pads
  "100-pad-sanitary-napkin-vending-machine": [7499, 8500], // Pro, 100 pads
  "sanitary-pad-vending-machine-25-pad": [2399, 3400], // manual Basic, 25 pads
  "manual-sanitary-pad-vending-machine-50-pad": [3599, 4600], // manual Pro, 50 pads
  "sanitary-pad-disposal-machine-100-pad": [3199, 4200], // disposal Basic
  "sanitary-pad-disposal-machine": [4999, 6000], // disposal Pro
  "sanitary-pad-disposal-machine-500-pad": [6499, 7500], // disposal Pro Max
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const log = (m: string) => console.log(`${dryRun ? "[dry-run] " : ""}${m}`);

  const family = await ProductFamily.findOne({ slug: "vending-machine" });
  if (!family) throw new Error("vending-machine family missing: run npm run migrate:families first");
  const cap = family.options.find((o) => o.key === "capacity");
  if (cap && !cap.values.some((v) => v.value === "100")) {
    log("family: add capacity value 100");
    if (!dryRun) await ProductFamily.updateOne({ _id: family._id, "options.key": "capacity" }, { $push: { "options.$.values": { value: "100", label: "100 Pads" } } });
  }

  const m25 = await Product.findOne({ slug: "sanitary-pad-vending-machine-25-pad" }).lean();
  for (const [slug, [price, mrp]] of Object.entries(PRICES)) {
    const p = await Product.findOne({ slug }).lean();
    if (!p) { log(`SKIP ${slug}: not found`); continue; }
    const $set: Record<string, unknown> = {
      price, originalPrice: mrp, discountPercent: Math.round((1 - price / mrp) * 100),
      gstApplicable: true, gstRate: 18, stockStatus: "made-to-order", mrp, status: "published",
    };
    if (slug === "100-pad-sanitary-napkin-vending-machine") {
      const o = { operation: "automatic", capacity: "100" };
      Object.assign($set, { familyId: family._id, variantOptions: o, variantKey: variantKeyOf(o) });
    }
    if (slug === "manual-sanitary-pad-vending-machine-50-pad" && !p.images?.length && m25) {
      for (const k of ["image", "cardImage", "overviewImage", "images", "gallery"] as const) $set[k] = (m25 as never)[k];
    }
    log(`${slug}: ₹${price} (MRP ${mrp}, -${$set.discountPercent}%) ${p.status !== "published" ? `[${p.status} → published]` : ""}`);
    if (!dryRun) await Product.updateOne({ slug }, { $set }, { runValidators: true });
  }
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
