import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { revalidateTag } from "next/cache";
import type { IProduct } from "@/models/Product";

/**
 * GET /api/admin/products — paginated, filterable, searchable list for the admin "All
 * Products" page, plus summary counts by status/stock for its dashboard cards. Admin/Super
 * Admin only: unlike the public /api/products, this can return draft and archived products.
 */
export async function GET(req: NextRequest) {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category");
    const brandId = searchParams.get("brandId");
    const status = searchParams.get("status"); // draft | published | archived
    const stockStatus = searchParams.get("stockStatus");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest"; // newest | oldest | price-asc | price-desc | name
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20));

    const filter: Record<string, unknown> = {};
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 40);
      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { title: { $regex: escapedSearch, $options: "i" } },
        { sku: { $regex: escapedSearch, $options: "i" } },
        { slug: { $regex: escapedSearch, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (brandId) filter.brandId = brandId;
    if (status) filter.status = status;
    if (stockStatus) filter.stockStatus = stockStatus;
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      filter.price = priceFilter;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      name: { name: 1 },
    };

    const [products, total, statusCounts, stockOutCount] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Product.countDocuments(filter),
      Product.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Product.countDocuments({ stockStatus: "out-of-stock" }),
    ]);

    const summary = { total: 0, published: 0, draft: 0, archived: 0, outOfStock: stockOutCount };
    for (const row of statusCounts as { _id: string; count: number }[]) {
      summary.total += row.count;
      if (row._id === "published") summary.published = row.count;
      if (row._id === "draft") summary.draft = row.count;
      if (row._id === "archived") summary.archived = row.count;
    }

    return NextResponse.json({
      success: true,
      products,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
      summary,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load products" },
      { status: 500 },
    );
  }
}

const DEFAULT_SPECS = {
  dailyCapacity: "Not specified",
  batchCapacity: "Not specified",
  power: "Not specified",
  weight: "Not specified",
  colours: "Standard",
  cycleDuration: "Not specified",
  chamber: "Not specified",
  maintenance: "Not specified",
  warranty: "1 year",
  delivery: "3–5 days · Free shipping",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSku(name: string): Promise<string> {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8) || "RMAX";
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
    const exists = await Product.exists({ sku: candidate });
    if (!exists) return candidate;
  }
  return `${base}-${Date.now()}`;
}

/** POST /api/admin/products — creates a product. Always starts as a draft unless `status` is explicitly "published". */
export async function POST(req: NextRequest) {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { user } = authResult;

  try {
    await connectDB();
    const body = await req.json();

    const name: string | undefined = body.name?.trim();
    const price = Number(body.price);
    if (!name || !Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Product name and a valid, non-negative price are required." }, { status: 400 });
    }

    let slug = slugify(body.slug?.trim() || name);
    if (!slug) return NextResponse.json({ error: "Could not derive a valid slug from the product name." }, { status: 400 });
    if (await Product.exists({ slug })) {
      return NextResponse.json({ error: `A product with slug "${slug}" already exists.` }, { status: 409 });
    }

    let sku: string = (body.sku?.trim() || "").toUpperCase();
    if (!sku) sku = await generateUniqueSku(name);
    else if (await Product.exists({ sku })) {
      return NextResponse.json({ error: `SKU "${sku}" is already in use.` }, { status: 409 });
    }

    const originalPrice = Number(body.originalPrice) || price;
    const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    const status: IProduct["status"] = body.status === "published" ? "published" : "draft";

    const created = await Product.create({
      name,
      title: body.title?.trim() || name,
      shortName: body.shortName?.trim() || name,
      slug,
      sku,
      productCode: body.productCode?.trim(),
      model: body.model?.trim(),
      manufacturer: body.manufacturer?.trim(),
      countryOfOrigin: body.countryOfOrigin?.trim() || "India",
      brandId: body.brandId || undefined,
      categoryId: body.categoryId || undefined,
      category: body.category || "incinerator",
      subcategory: body.subcategory?.trim(),
      productType: body.productType?.trim(),
      tags: Array.isArray(body.tags) ? body.tags : [],
      isFeatured: Boolean(body.isFeatured),
      isNewArrival: Boolean(body.isNewArrival),
      colours: Array.isArray(body.colours) ? body.colours : [],
      price,
      originalPrice,
      discountPercent: Math.max(0, Math.min(100, discountPercent)),
      gstApplicable: body.gstApplicable ?? true,
      gstRate: Number(body.gstRate) || 18,
      taxType: body.taxType === "inclusive" ? "inclusive" : "exclusive",
      priceHistory: [{ price, originalPrice, changedAt: new Date(), changedBy: user.name ?? undefined }],
      summary: body.summary?.trim() || "",
      intro: body.intro?.trim(),
      overview: body.overview?.trim(),
      image: body.image || { src: "", alt: name, width: 600, height: 600 },
      cardImage: body.cardImage,
      images: Array.isArray(body.images) ? body.images : [],
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      variants: Array.isArray(body.variants) ? body.variants : [],
      techSpecs: Array.isArray(body.techSpecs) ? body.techSpecs : [],
      features: Array.isArray(body.features) ? body.features : [],
      applications: Array.isArray(body.applications) ? body.applications : [],
      faqs: Array.isArray(body.faqs) ? body.faqs : [],
      warranty: body.warranty || undefined,
      seo: body.seo || undefined,
      relatedProductIds: Array.isArray(body.relatedProductIds) ? body.relatedProductIds : [],
      specs: body.specs || DEFAULT_SPECS,
      sortOrder: Number(body.sortOrder) || Date.now(),
      stock: Number(body.stock) || 0,
      enableStockManagement: body.enableStockManagement ?? true,
      stockStatus: body.stockStatus || "in-stock",
      allowBackorders: Boolean(body.allowBackorders),
      lowStockThreshold: Number(body.lowStockThreshold) || 5,
      status,
      publishedAt: status === "published" ? new Date() : undefined,
      createdBy: user.id,
      updatedBy: user.id,
    });

    await logAuditEvent({
      actor: user,
      action: "PRODUCT_CREATED",
      entityType: "product",
      entityId: String(created._id),
      metadata: {
        productName: created.name,
        slug: created.slug,
        sku: created.sku,
        price: created.price,
        status: created.status,
        details: `${user.name} (${user.role}) created product "${created.name}" (SKU: ${created.sku}, status: ${created.status})`,
      },
    });

    try {
      revalidateTag("products", { expire: 0 });
    } catch {}

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (err) {
    console.error("Product create error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to create product" },
      { status: 500 },
    );
  }
}
