import { NextRequest, NextResponse } from "next/server";
import { checkApiRole } from "@/lib/session";
import { uploadProductImage, deleteProductImage } from "@/lib/imagekit";
import { limited } from "@/lib/api";

const IMAGE_TYPES = new Set(["main", "gallery", "variants", "thumbnails"]);

/** Uploads one product image to ImageKit. Admin/Super Admin only. */
export async function POST(req: NextRequest) {
  const auth = await checkApiRole(["super_admin", "admin"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rl = limited(req, "product-image-upload", 60, 60_000);
  if (rl) return rl;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const productSlug = String(formData.get("productSlug") || "").trim();
    const imageTypeRaw = String(formData.get("imageType") || "gallery");
    const imageType = IMAGE_TYPES.has(imageTypeRaw) ? (imageTypeRaw as "main" | "gallery" | "variants" | "thumbnails") : "gallery";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!productSlug) {
      return NextResponse.json({ error: "productSlug is required (use the in-progress product's slug)." }, { status: 400 });
    }

    const uploaded = await uploadProductImage(file, productSlug, imageType);
    return NextResponse.json({ success: true, image: uploaded });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    console.error("[admin/products/images] upload error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Deletes one ImageKit asset by fileId. Admin/Super Admin only. Caller is responsible for first removing the DB reference (see PRD: never delete before confirming replacement). */
export async function DELETE(req: NextRequest) {
  const auth = await checkApiRole(["super_admin", "admin"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { fileId } = await req.json();
    if (!fileId || typeof fileId !== "string") {
      return NextResponse.json({ error: "fileId is required." }, { status: 400 });
    }
    await deleteProductImage(fileId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed.";
    console.error("[admin/products/images] delete error:", err);
    // ImageKit API failures are handled gracefully — the caller already removed the DB
    // reference, so a failed remote delete just leaves an orphaned asset rather than breaking
    // the product edit flow.
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
