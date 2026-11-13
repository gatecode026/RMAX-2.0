/**
 * Idempotent catalogue import into the configured MongoDB (MONGODB_URI).
 *
 *   npm run import:products -- --dry-run   # show planned changes, write nothing
 *   npm run import:products                # upsert by slug; re-running changes nothing
 *
 * Existing seeded products keep their ImageKit photos; new products get none (the storefront
 * shows its photo-pending fallback) until a matching photo is uploaded via Admin → Products.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Product } from "../src/models/Product";
import { ProductCategory } from "../src/models/ProductCategory";
import { ProductBrand } from "../src/models/ProductBrand";
import { CATALOGUE, GROUPS, type CatalogueItem } from "./product-catalogue";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });

const dryRun = process.argv.includes("--dry-run");
const NS = "Not specified";
const point = (list: [string, string][] = [], icon: "cog" | "institution") =>
  list.map(([title, body], i) => ({ icon, title, body, order: i + 1, active: true }));

function contentFields(it: CatalogueItem, order: number, categoryId: unknown, brandId: unknown) {
  const d = it.docSpecs ?? {};
  return {
    name: it.name, title: it.name, shortName: it.name, category: it.category, categoryId, brandId,
    manufacturer: "RMAX Solutions", summary: it.summary, intro: it.summary, overview: it.overview, chips: it.chips,
    features: point(it.features, "cog"), applications: point(it.applications, "institution"),
    techSpecs: (it.specs ?? []).map(([label, value, unit], i) => ({ label, value, unit, order: i + 1, visible: true })),
    faqs: [],
    specs: {
      dailyCapacity: d.dailyCapacity ?? NS, batchCapacity: d.batchCapacity ?? NS, power: d.power ?? NS, weight: NS, colours: NS,
      cycleDuration: NS, chamber: d.chamber ?? NS, maintenance: NS, warranty: d.warranty ?? NS, delivery: NS,
    },
    // Quotation-only: no price is published anywhere in the source documents.
    price: 0, originalPrice: 0, discountPercent: 0, stockStatus: "enquiry-only", enableStockManagement: false,
    sortOrder: order, tags: [it.name], status: "published",
    ...(it.warranty ? { warranty: { available: true, ...it.warranty } } : {}),
    seo: { title: `${it.name} | RMAX Solutions`, metaDescription: it.summary, focusKeyword: it.name },
  };
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set.");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`${dryRun ? "[DRY RUN] " : ""}Connected to database "${mongoose.connection.name}".`);

  const brandDoc = await ProductBrand.findOne({ slug: "rmax-solutions" });
  const categoryIds: Record<string, unknown> = {};
  for (const [slug, g] of Object.entries(GROUPS)) {
    const found = await ProductCategory.findOne({ slug });
    console.log(`category ${slug}: ${found ? "exists" : "create"}`);
    if (found) categoryIds[slug] = found._id;
    else if (!dryRun) categoryIds[slug] = (await ProductCategory.create({ slug, name: g.name, sortOrder: g.sortOrder, active: true }))._id;
  }
  let brandId = brandDoc?._id;
  if (!brandId && !dryRun) {
    brandId = (await ProductBrand.create({ name: "RMAX Solutions", slug: "rmax-solutions", sortOrder: 1, active: true }))._id;
  }

  const failures: string[] = [];
  const tally = { created: 0, updated: 0, unchanged: 0 };
  for (const [i, it] of CATALOGUE.entries()) {
    try {
      const existing = await Product.findOne({ slug: it.slug }).select("images").lean();
      const photos = existing?.images?.length ?? 0;
      const label = `${it.slug.padEnd(52)} ${existing ? "update" : "create"}  photos: ${photos ? `${photos} existing ImageKit (kept)` : "none → fallback"}`;
      if (it.existing && !existing) throw new Error("expected an existing seeded product");
      if (dryRun) { console.log(`  ${label}`); continue; }

      const fields = contentFields(it, i + 1, categoryIds[it.group], brandId);
      const insertOnly = {
        slug: it.slug, image: { src: "", alt: "", width: 0, height: 0 }, images: [], gallery: [], colours: [],
        sku: `RMAX-${String(i + 1).padStart(3, "0")}`,
      };
      const res = await Product.updateOne({ slug: it.slug }, { $set: fields, $setOnInsert: insertOnly }, { upsert: true, runValidators: true });
      if (res.upsertedCount) tally.created++; else if (res.modifiedCount) tally.updated++; else tally.unchanged++;
      console.log(`  ${label}`);
    } catch (e) {
      failures.push(`${it.slug}: ${(e as Error).message}`);
    }
  }

  console.log(dryRun ? `Planned ${CATALOGUE.length} products; nothing written.` : `Done: ${JSON.stringify(tally)}`);
  if (failures.length) { console.error(`FAILED (${failures.length}):\n  ${failures.join("\n  ")}`); process.exitCode = 1; }
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
