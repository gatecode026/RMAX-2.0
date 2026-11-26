import "server-only";
import { after } from "next/server";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Product, type IProduct } from "@/models/Product";
import { ProductFamily } from "@/models/ProductFamily";
import type { FamilyDTO } from "@/lib/catalog";
import { FaqItem, type IFaqItem } from "@/models/FaqItem";
import { PolicyPage, type IPolicyPage } from "@/models/PolicyPage";
import { Testimonial, type ITestimonial } from "@/models/Testimonial";
import { SiteSetting } from "@/models/SiteSetting";
import {
  faqItems as seedFaqs,
  homeStats as seedHomeStats,
  policyPages as seedPolicies,
  productTrust as seedProductTrust,
  reviewSummary as seedReviewSummary,
  testimonials as seedTestimonials,
} from "@/data/seed";

/** Strip Mongo-specific types (ObjectId, Date) so the result is serialisable for `use cache` and RSC. */
function plain<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export type ProductDTO = Omit<IProduct, "familyId"> & { _id: string; familyId?: string };
/** Only what the listing page and product cards use. The full product (features, FAQs, galleries…) made the listing HTML ~270 KB. */
const LIST_KEYS = ["_id", "slug", "title", "name", "category", "price", "mrp", "originalPrice", "discountPercent", "image", "cardImage", "portraitImage", "listImage", "intro", "summary", "specs", "techSpecs", "chips", "colours", "familyId", "variantOptions", "stockStatus", "sortOrder", "badge", "highlight", "status"] as const;
export type ProductListDTO = Pick<ProductDTO, (typeof LIST_KEYS)[number]>;
export function toListDTO(p: ProductDTO): ProductListDTO {
  const out = {} as Record<string, unknown>;
  for (const k of LIST_KEYS) if (p[k] !== undefined) out[k] = p[k];
  return out as ProductListDTO;
}

export type FaqDTO = IFaqItem & { _id: string };
export type PolicyDTO = IPolicyPage & { _id: string };


// Catalogue / help / policy content changes rarely → cached for hours, refreshed on demand with cacheTag.

/**
 * The whole catalogue, including the vending machine.
 *
 * No seed/fallback content: the database is the only source of truth for products. If it's
 * unreachable, or the catalogue is genuinely empty, this returns an empty list rather than a
 * fixed set of built-in products — pages that list or search products are expected to render a
 * graceful "no products available" state for an empty result, not treat it as an error.
 */
/**
 * Cached read (hours; edits invalidate it by tag). Pages await this outside a Suspense boundary, so the
 * result must stay cacheable: throwing, or declaring a very short lifetime, makes Next render the page
 * as dynamic and the page 500s. A failed read therefore returns an empty list, and
 * `getAllProducts` below heals it: the first request that sees an empty catalogue checks, after the
 * response, whether the database now has published products and if so drops the cache.
 */
async function readAllProducts(): Promise<ProductDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  try {
    await connectDB();
    // Published only — this is the public catalogue. Draft and archived products never appear
    // here regardless of who's asking; see getProductBySlugAnyStatus for the admin preview path.
    const rows = await Product.find({ status: "published" }).sort({ sortOrder: 1 }).lean();
    // `images[]` (the admin uploader) is the source of truth; the legacy image/cardImage/gallery fields can be stale.
    // Derive them from it (primary first) so cards, listing and the detail page all show the same main photo.
    return plain<ProductDTO[]>(rows).map((p) => {
      const imgs = [...(p.images ?? [])].filter((i) => i?.url).sort((a, b) => Number(!!b.isPrimary) - Number(!!a.isPrimary) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      if (!imgs.length) return p;
      const main = { src: imgs[0].url, alt: imgs[0].alt || p.title, width: imgs[0].width || p.image?.width || 1024, height: imgs[0].height || p.image?.height || 1024 };
      return {
        ...p,
        image: main,
        cardImage: main,
        gallery: imgs.map((i) => ({ src: i.url, thumb: i.url, alt: i.alt || p.title, kind: "image" as const })),
      };
    });
  } catch {
    console.warn("[content] Could not read products from MongoDB — showing an empty catalogue.");
    return [];
  }
}

/** Every published catalogue item (listing page, product detail, related products, cart lookups). */
export async function getAllProducts(): Promise<ProductDTO[]> {
  const rows = await readAllProducts();
  if (rows.length === 0) {
    // Outside the cache: an empty list is either a real empty catalogue (cheap check, nothing to do) or
    // a failed read that was cached. Heal it once the database has products again.
    try {
      after(async () => {
        try {
          await connectDB();
          if (await Product.exists({ status: "published" })) revalidateTag("products", { expire: 0 });
        } catch {
          /* still down: the next request checks again */
        }
      });
    } catch {
      /* no request scope (build / prerender): nothing to schedule */
    }
  }
  return rows;
}

/**
 * Product families (option definitions). Same lifetime and tag as the products, so any product or family write
 * refreshes both together. Failure returns [] (every product then simply shows as standalone).
 */
export async function getFamilies(): Promise<FamilyDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  try {
    await connectDB();
    return plain<FamilyDTO[]>(await ProductFamily.find().sort({ sortOrder: 1, name: 1 }).lean());
  } catch {
    return [];
  }
}

export const INCINERATOR_ALIASES: Record<string, string> = {
  "small-automatic-sanitary-pad-incinerator": "sanitary-pad-disposal-machine-100-pad",
  "medium-automatic-sanitary-pad-incinerator": "sanitary-pad-disposal-machine",
  "large-automatic-sanitary-pad-incinerator": "sanitary-pad-disposal-machine-500-pad",
  basic: "sanitary-pad-disposal-machine-100-pad",
  pro: "sanitary-pad-disposal-machine",
  "pro-max": "sanitary-pad-disposal-machine-500-pad",
};

/** The three incinerator models — used by Compare, the footer, search, quote and contact forms. */
export async function getProducts(): Promise<ProductDTO[]> {
  return (await getAllProducts()).filter((p) => p.category !== "pad-vending");
}

/**
 * Status-agnostic, uncached single lookup — used only by the product detail page's admin
 * preview path (a draft or archived product, viewed by an authenticated staff session). Never
 * call this for an anonymous request: it does not filter by publication status.
 */
export async function getProductBySlugAnyStatus(slug: string): Promise<ProductDTO | null> {
  try {
    await connectDB();
    const targetSlug = INCINERATOR_ALIASES[slug] || slug;
    const doc = await Product.findOne({ slug: targetSlug }).lean();
    if (doc) return plain<ProductDTO>(doc);
    if (slug === "pad-vending") {
      const alt = await Product.findOne({ slug: "pad-vending-coin" }).lean();
      if (alt) return plain<ProductDTO>(alt);
    }
    return null;
  } catch {
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  const all = await getAllProducts();
  const targetSlug = INCINERATOR_ALIASES[slug] || slug;
  return (
    all.find((p) => p.slug === targetSlug) ??
    (slug === "pad-vending" ? all.find((p) => p.slug === "pad-vending-coin") : null) ??
    null
  );
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

/** Testimonial shown on a product's detail page (uses the homepage featured testimonial). */
export async function getProductTestimonial(_slug?: string): Promise<TestimonialDTO | null> {
  const all = await getTestimonials();
  return all.find((t) => t.featured) ?? all[0] ?? null;
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
