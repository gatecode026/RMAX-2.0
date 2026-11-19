import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { ProductFamily } from "@/models/ProductFamily";
import { familyOf, variantLabel, type FamilyDTO } from "@/lib/catalog";

/**
 * Exact option of a product for quotes, orders and notifications, e.g. "Vending Machine · Manual · 50 Pads".
 * Null for standalone products or an unknown slug. Reads the database directly (never cached) and never throws.
 */
export async function getVariantLabel(slug: string | undefined | null): Promise<string | null> {
  if (!slug) return null;
  try {
    await connectDB();
    const p = await Product.findOne({ slug }, { familyId: 1, variantOptions: 1 }).lean();
    if (!p?.familyId) return null;
    const fam = await ProductFamily.findById(p.familyId).lean();
    if (!fam) return null;
    const f: FamilyDTO = { ...fam, _id: String(fam._id), defaultProduct: fam.defaultProduct ? String(fam.defaultProduct) : undefined };
    const m = { _id: "", slug, familyId: String(p.familyId), variantOptions: p.variantOptions as Record<string, string> | undefined };
    return variantLabel(m, familyOf(m, [f]));
  } catch {
    return null;
  }
}
