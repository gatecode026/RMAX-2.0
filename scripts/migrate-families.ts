/**
 * Idempotent, backward-compatible migration: records the Incinerator and Vending Machine product families in
 * MongoDB and links the existing products to them. Nothing is deleted or re-priced; slugs, ids, images, specs and
 * stock are untouched. Re-running changes nothing. GPS tracker (and any product not listed) stays standalone.
 *
 *   npm run migrate:families -- --dry-run   # print the plan, write nothing
 *   npm run migrate:families
 *
 * Vending options without photos or specs are incomplete placeholders: they are linked to the family but moved to
 * draft so they are not shown to customers until the missing data is added and they are published from Admin.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Product } from "../src/models/Product";
import { ProductFamily } from "../src/models/ProductFamily";
import { variantKeyOf } from "../src/lib/catalog";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });

const dryRun = process.argv.includes("--dry-run");

const FAMILIES = [
  {
    slug: "incinerator",
    name: "Incinerator",
    sortOrder: 1,
    options: [{ key: "size", label: "Size", values: [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }] }],
    defaultSlug: "sanitary-pad-disposal-machine-100-pad",
    members: [
      { slug: "sanitary-pad-disposal-machine-100-pad", options: { size: "small" } },
      { slug: "sanitary-pad-disposal-machine", options: { size: "medium" } },
      { slug: "sanitary-pad-disposal-machine-500-pad", options: { size: "large" } },
    ],
  },
  {
    slug: "vending-machine",
    name: "Vending Machine",
    sortOrder: 2,
    options: [
      { key: "operation", label: "Operation", values: [{ value: "automatic", label: "Automatic" }, { value: "manual", label: "Manual" }] },
      { key: "capacity", label: "Capacity", values: [{ value: "25", label: "25 Pads" }, { value: "50", label: "50 Pads" }] },
    ],
    defaultSlug: "automatic-sanitary-napkin-vending-machine",
    members: [
      { slug: "automatic-sanitary-pad-vending-machine-25-pad", options: { operation: "automatic", capacity: "25" } },
      { slug: "automatic-sanitary-napkin-vending-machine", options: { operation: "automatic", capacity: "50" } },
      { slug: "sanitary-pad-vending-machine-25-pad", options: { operation: "manual", capacity: "25" } },
      { slug: "manual-sanitary-pad-vending-machine-50-pad", options: { operation: "manual", capacity: "50" } },
    ],
  },
];

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI);
  const log = (m: string) => console.log(`${dryRun ? "[dry-run] " : ""}${m}`);

  for (const def of FAMILIES) {
    let family = await ProductFamily.findOne({ slug: def.slug });
    if (!family) {
      log(`create family "${def.name}"`);
      if (!dryRun) family = await ProductFamily.create({ name: def.name, slug: def.slug, options: def.options, sortOrder: def.sortOrder });
    } else log(`family "${def.name}" exists`);

    for (const m of def.members) {
      const p = await Product.findOne({ slug: m.slug });
      if (!p) {
        log(`  skip ${m.slug}: no such product`);
        continue;
      }
      const key = variantKeyOf(m.options);
      const linked = family && String(p.familyId) === String(family._id) && p.variantKey === key;
      if (!linked) {
        log(`  link ${m.slug} → ${JSON.stringify(m.options)}`);
        if (!dryRun && family) await Product.updateOne({ _id: p._id }, { $set: { familyId: family._id, variantOptions: m.options, variantKey: key } });
      }
      // incomplete placeholder (no photo at all): keep it out of the storefront until it is completed
      if (p.status === "published" && !p.image?.src && !(p.images?.length ?? 0)) {
        log(`  draft ${m.slug}: no photos yet, hidden until completed and published from Admin`);
        if (!dryRun) await Product.updateOne({ _id: p._id }, { $set: { status: "draft" } });
      }
    }

    if (family && !family.defaultProduct) {
      const d = await Product.findOne({ slug: def.defaultSlug }, { _id: 1 });
      if (d) {
        log(`  default → ${def.defaultSlug}`);
        if (!dryRun) await ProductFamily.updateOne({ _id: family._id }, { $set: { defaultProduct: d._id } });
      }
    }
  }
  if (!dryRun) await Product.syncIndexes();
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
