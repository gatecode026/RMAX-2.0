import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "super_admin" && user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const products = await Product.find().sort({ sortOrder: 1 }).lean();

    const items = products.map((p) => {
      const stock = typeof p.stock === "number" ? p.stock : 25;
      const reorderPoint = 10;
      const status =
        stock === 0 ? "Out of Stock" : stock <= reorderPoint ? "Low Stock" : "In Stock";

      return {
        id: String(p._id),
        name: p.title || p.name,
        sku: `RMAX-${p.slug.toUpperCase().replace(/-/g, "")}`,
        category: p.category === "pad-vending" ? "Finished Machines" : "Finished Machines",
        inStock: stock,
        reorderPoint,
        unitCost: p.price,
        status,
        lastRestocked: new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
    });

    return NextResponse.json({ success: true, items });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load inventory" },
      { status: 500 }
    );
  }
}
