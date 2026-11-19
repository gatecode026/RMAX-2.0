import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { ProductFamily } from "@/models/ProductFamily";
import { checkApiRole } from "@/lib/session";
import { normaliseOptions } from "@/lib/admin/family";

type Ctx = { params: Promise<{ id: string }> };

const refresh = () => {
  try {
    revalidateTag("products", { expire: 0 });
  } catch {}
};

/** PATCH /api/admin/families/:id — { name?, options?, defaultProduct? }. Options in use by a member cannot be removed. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await checkApiRole(["super_admin", "admin"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid family." }, { status: 400 });
    const body = await req.json();
    await connectDB();
    const family = await ProductFamily.findById(id);
    if (!family) return NextResponse.json({ error: "Family not found." }, { status: 404 });

    if (typeof body.name === "string" && body.name.trim()) family.name = body.name.trim();

    if (body.options !== undefined) {
      const opts = normaliseOptions(body.options);
      if ("error" in opts) return NextResponse.json({ error: opts.error }, { status: 400 });
      const members = await Product.find({ familyId: family._id }, { name: 1, variantOptions: 1 }).lean();
      for (const m of members) {
        const have = (m.variantOptions ?? {}) as Record<string, string>;
        for (const [k, v] of Object.entries(have)) {
          const o = opts.options.find((x) => x.key === k);
          if (!o || !o.values.some((x) => x.value === v)) {
            return NextResponse.json({ error: `"${m.name}" uses ${k}: ${v}, which cannot be removed while that product is in the family.` }, { status: 409 });
          }
        }
        // a new option needs a value on every member, so add it only once members can carry it
        const missing = opts.options.find((o) => !have[o.key]);
        if (missing) return NextResponse.json({ error: `"${m.name}" has no "${missing.label}" value yet; an option cannot be added to a family with products that lack it.` }, { status: 409 });
      }
      family.set("options", opts.options);
    }

    if (body.defaultProduct !== undefined) {
      if (body.defaultProduct === null || body.defaultProduct === "") family.set("defaultProduct", undefined);
      else {
        if (!Types.ObjectId.isValid(body.defaultProduct) || !(await Product.exists({ _id: body.defaultProduct, familyId: family._id }))) {
          return NextResponse.json({ error: "Default product must belong to this family." }, { status: 422 });
        }
        family.set("defaultProduct", body.defaultProduct);
      }
    }
    await family.save();
    refresh();
    return NextResponse.json({ success: true, family });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed to update family" }, { status: 500 });
  }
}

/** DELETE /api/admin/families/:id — only an empty family can be removed. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await checkApiRole(["super_admin", "admin"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid family." }, { status: 400 });
    await connectDB();
    if (await Product.exists({ familyId: id })) return NextResponse.json({ error: "Remove or unlink the family's products first." }, { status: 409 });
    await ProductFamily.findByIdAndDelete(id);
    refresh();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed to delete family" }, { status: 500 });
  }
}
