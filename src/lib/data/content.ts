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


// Catalogue / help / policy content changes rarely → cached for hours, refreshed on demand with cacheTag.

/** The whole catalogue, including the vending machine. */
async function readAllProducts(): Promise<ProductDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  try {
    await connectDB();
    const rows = await Product.find().sort({ sortOrder: 1 }).lean();
    if (rows && rows.length > 0) {
      return plain<ProductDTO[]>(rows);
    }
  } catch {
    console.warn("[content] Could not read products from MongoDB — using built-in seed content.");
  }
  return seedProducts.map((p) => ({ ...p, _id: `seed-${p.slug}` }));
}

/** Every catalogue item (listing page, product detail, related products, cart lookups). */
export function getAllProducts(): Promise<ProductDTO[]> {
  return readAllProducts();
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

async function readTrust(): Promise<TrustPoint[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  try {
    await connectDB();
    const doc = await SiteSetting.findOne({ key: "product.trust" }).lean();
    if (doc) return plain<{ value: TrustPoint[] }>(doc).value;
  } catch {
    console.warn("[content] Could not read trust points from MongoDB — using built-in seed content.");
  }
  return seedProductTrust as TrustPoint[];
}

export function getTrustPoints(): Promise<TrustPoint[]> {
  return readTrust();
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
  try {
    await connectDB();
    const rows = await FaqItem.find().sort({ sortOrder: 1 }).lean();
    if (rows && rows.length > 0) return plain<FaqDTO[]>(rows);
  } catch {
    console.warn("[content] Could not read FAQs from MongoDB — using built-in seed content.");
  }
  return seedFaqs.map((f) => ({ ...f, _id: `seed-faq-${f.sortOrder}` }));
}

export function getFaqItems(): Promise<FaqDTO[]> {
  return readFaqItems();
}

export type TestimonialDTO = ITestimonial & { _id: string };
export type HomeStat = { value: string; label: string };
export type ReviewSummary = { rating: string; stars: number; label: string };

async function readTestimonials(): Promise<TestimonialDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("testimonials");
  try {
    await connectDB();
    const rows = plain<TestimonialDTO[]>(await Testimonial.find().sort({ sortOrder: 1 }).lean());
    if (rows && rows.length > 0) return rows;
  } catch {
    console.warn("[content] Could not read testimonials from MongoDB — using built-in seed content.");
  }
  return seedTestimonials.map((t) => ({ ...t, _id: `seed-testimonial-${t.sortOrder}` }));
}

export function getTestimonials(): Promise<TestimonialDTO[]> {
  return readTestimonials();
}

async function readSetting<T>(key: string, fallback: T): Promise<T> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  try {
    await connectDB();
    const doc = await SiteSetting.findOne({ key }).lean();
    if (doc) return plain<{ value: T }>(doc).value as T;
  } catch {
    console.warn(`[content] Could not read setting ${key} from MongoDB — using built-in seed content.`);
  }
  return fallback;
}

export function getHomeStats(): Promise<HomeStat[]> {
  return readSetting<HomeStat[]>("home.stats", seedHomeStats);
}

export function getReviewSummary(): Promise<ReviewSummary> {
  return readSetting<ReviewSummary>("home.reviews", seedReviewSummary);
}

async function readPolicyPage(slug: string): Promise<PolicyDTO | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("policies");
  try {
    await connectDB();
    const doc = await PolicyPage.findOne({ slug }).lean();
    if (doc) return plain<PolicyDTO>(doc);
  } catch {
    console.warn(`[content] Could not read policy page "${slug}" from MongoDB — using built-in seed content.`);
  }
  const page = seedPolicies.find((p) => p.slug === slug);
  return page ? { ...page, _id: `seed-${page.slug}` } : null;
}

export function getPolicyPage(slug: string): Promise<PolicyDTO | null> {
  return readPolicyPage(slug);
}
