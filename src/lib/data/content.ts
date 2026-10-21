import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Product, type IProduct } from "@/models/Product";
import { FaqItem, type IFaqItem } from "@/models/FaqItem";
import { PolicyPage, type IPolicyPage } from "@/models/PolicyPage";
import { Testimonial, type ITestimonial } from "@/models/Testimonial";
import { SiteSetting } from "@/models/SiteSetting";
import {
  faqItems as seedFaqs,
  homeStats as seedHomeStats,
  policyPages as seedPolicies,
  productTrust as seedProductTrust,
  products as seedProducts,
  reviewSummary as seedReviewSummary,
  testimonials as seedTestimonials,
} from "@/data/seed";

/** Strip Mongo-specific types (ObjectId, Date) so the result is serialisable for `use cache` and RSC. */
function plain<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export type ProductDTO = IProduct & { _id: string };
export type FaqDTO = IFaqItem & { _id: string };
export type PolicyDTO = IPolicyPage & { _id: string };

/**
 * Read content from MongoDB; if the database cannot be reached, serve the identical content
 * from the built-in seed data so every page still renders. (A failed read is never cached.)
 */
async function withSeedFallback<T>(read: () => Promise<T>, fallback: () => T, what: string): Promise<T> {
  try {
    return await read();
  } catch {
    console.warn(`[content] Could not read ${what} from MongoDB — using built-in seed content.`);
    return fallback();
  }
}

// Catalogue / help / policy content changes rarely → cached for hours, refreshed on demand with cacheTag.

/** The whole catalogue, including the vending machine. */
async function readAllProducts(): Promise<ProductDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  await connectDB();
  return plain<ProductDTO[]>(await Product.find().sort({ sortOrder: 1 }).lean());
}

/** Every catalogue item (listing page, product detail, related products, cart lookups). */
export function getAllProducts(): Promise<ProductDTO[]> {
  return withSeedFallback(
    readAllProducts,
    () => seedProducts.map((p) => ({ ...p, _id: `seed-${p.slug}` })),
    "products",
  );
}

/** The three incinerator models — used by Compare, the footer, search, quote and contact forms. */
export async function getProducts(): Promise<ProductDTO[]> {
  return (await getAllProducts()).filter((p) => p.category !== "pad-vending");
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export type TrustPoint = { icon: "shield" | "truck" | "cog"; title: string; body: string };

async function readTrust(): Promise<TrustPoint[] | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  await connectDB();
  const doc = await SiteSetting.findOne({ key: "product.trust" }).lean();
  return doc ? (plain<{ value: TrustPoint[] }>(doc).value) : null;
}

export function getTrustPoints(): Promise<TrustPoint[]> {
  return withSeedFallback(
    async () => (await readTrust()) ?? (seedProductTrust as TrustPoint[]),
    () => seedProductTrust as TrustPoint[],
    "trust points",
  );
}

/** Testimonial shown on a product's detail page (falls back to the first product testimonial). */
export async function getProductTestimonial(slug: string): Promise<TestimonialDTO | null> {
  const all = await getTestimonials();
  const forProducts = all.filter((t) => t.forProduct);
  return forProducts.find((t) => t.forProduct === slug) ?? forProducts[0] ?? null;
}

async function readFaqItems(): Promise<FaqDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("faq");
  await connectDB();
  return plain<FaqDTO[]>(await FaqItem.find().sort({ sortOrder: 1 }).lean());
}

export function getFaqItems(): Promise<FaqDTO[]> {
  return withSeedFallback(readFaqItems, () => seedFaqs.map((f) => ({ ...f, _id: `seed-faq-${f.sortOrder}` })), "FAQs");
}

export type TestimonialDTO = ITestimonial & { _id: string };
export type HomeStat = { value: string; label: string };
export type ReviewSummary = { rating: string; stars: number; label: string };

async function readTestimonials(): Promise<TestimonialDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("testimonials");
  await connectDB();
  const rows = plain<TestimonialDTO[]>(await Testimonial.find().sort({ sortOrder: 1 }).lean());
  // An empty collection means "not seeded yet" — throw so it is neither cached nor shown as an empty section.
  if (rows.length === 0) throw new Error("No testimonials in the database");
  return rows;
}

export function getTestimonials(): Promise<TestimonialDTO[]> {
  return withSeedFallback(
    readTestimonials,
    () => seedTestimonials.map((t) => ({ ...t, _id: `seed-testimonial-${t.sortOrder}` })),
    "testimonials",
  );
}

async function readSetting<T>(key: string): Promise<T | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  await connectDB();
  const doc = await SiteSetting.findOne({ key }).lean();
  return doc ? (plain<{ value: T }>(doc).value as T) : null;
}

export function getHomeStats(): Promise<HomeStat[]> {
  return withSeedFallback(
    async () => (await readSetting<HomeStat[]>("home.stats")) ?? seedHomeStats,
    () => seedHomeStats,
    "home stats",
  );
}

export function getReviewSummary(): Promise<ReviewSummary> {
  return withSeedFallback(
    async () => (await readSetting<ReviewSummary>("home.reviews")) ?? seedReviewSummary,
    () => seedReviewSummary,
    "review summary",
  );
}

async function readPolicyPage(slug: string): Promise<PolicyDTO | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("policies");
  await connectDB();
  const doc = await PolicyPage.findOne({ slug }).lean();
  return doc ? plain<PolicyDTO>(doc) : null;
}

export function getPolicyPage(slug: string): Promise<PolicyDTO | null> {
  return withSeedFallback(
    () => readPolicyPage(slug),
    () => {
      const page = seedPolicies.find((p) => p.slug === slug);
      return page ? { ...page, _id: `seed-${page.slug}` } : null;
    },
    `policy page "${slug}"`,
  );
}
