import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ success: true, products });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    await connectDB();
    const body = await req.json();

    const {
      name,
      shortName,
      slug,
      category = "incinerator",
      price,
      originalPrice,
      dailyCapacity,
      power,
      weight,
      summary,
      stock = 25,
      image,
    } = body;

    if (!name?.trim() || !price || !slug?.trim()) {
      return NextResponse.json({ error: "Product name, slug, and price are required." }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");

    const productPayload = {
      name: name.trim(),
      title: shortName?.trim() || name.trim(),
      shortName: shortName?.trim() || name.trim(),
      slug: cleanSlug,
      category: category.toLowerCase().includes("vending") ? "pad-vending" : "incinerator",
      colours: ["blue", "pink"],
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price) * 2,
      discountPercent: originalPrice ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100) : 50,
      summary: summary || "",
      stock: Number(stock) || 0,
      image: {
        src: image || "/images/products/list-pro.png",
        alt: name,
        width: 300,
        height: 300,
      },
      specs: {
        dailyCapacity: dailyCapacity || "200-250/day",
        batchCapacity: "4-6 at once",
        power: power || "1000 W",
        weight: weight || "9kg",
        colours: "Standard",
        cycleDuration: "3-4 minutes",
        chamber: "High grade insulated ceramic",
        maintenance: "Low maintenance",
        warranty: "1 year",
        delivery: "3-5 days · Free shipping",
      },
      sortOrder: Date.now(),
    };

    const created = await Product.findOneAndUpdate(
      { slug: cleanSlug },
      { $set: productPayload },
      { upsert: true, new: true }
    );

    // Record Immutable Audit Log
    await logAuditEvent({
      actor: user,
      action: "PRODUCT_CREATED",
      entityType: "product",
      entityId: String(created._id),
      metadata: {
        productName: created.name,
        slug: created.slug,
        price: created.price,
        stock: created.stock,
        category: created.category,
        details: `${user.name} (${user.role}) created new product "${created.name}" (Slug: ${cleanSlug}, Offer Price: ₹${created.price}, Initial Stock: ${created.stock})`,
      },
    });

    try {
      revalidateTag("products", "default");
    } catch {}

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (err) {
    console.error("Product create error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to create product" },
      { status: 500 }
    );
  }
}
