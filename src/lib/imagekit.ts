import "server-only";
import ImageKit from "imagekit";

/**
 * Single ImageKit client for the whole app — product media is uploaded and deleted exclusively
 * through this module (server-side only). The private key never leaves the server: the browser
 * only ever talks to our own /api/admin/products/images route, never to ImageKit directly.
 */
let client: ImageKit | null = null;

function getClient(): ImageKit {
  if (client) return client;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      "ImageKit is not configured — set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.",
    );
  }
  client = new ImageKit({ publicKey, privateKey, urlEndpoint });
  return client;
}

export type UploadedImage = {
  fileId: string;
  url: string;
  filePath: string;
  name: string;
  width?: number;
  height?: number;
  size: number;
};

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function slugifyFileBase(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return base.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/-+/g, "-").slice(0, 60) || "image";
}

/**
 * Uploads one image to ImageKit under /rmax/products/{productSlug}/{imageType}/.
 * Validates MIME type and size before ever contacting ImageKit — a rejected validation never
 * produces an uploaded asset or a database record.
 */
export async function uploadProductImage(
  file: File,
  productSlug: string,
  imageType: "main" | "gallery" | "variants" | "thumbnails",
): Promise<UploadedImage> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Only JPEG, PNG, WEBP, AVIF or GIF images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be smaller than 10MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base = slugifyFileBase(file.name);
  const fileName = `${base}-${Date.now()}`;
  const folder = `/rmax/products/${productSlug}/${imageType}`;

  const result = await getClient().upload({
    file: buffer,
    fileName,
    folder,
    useUniqueFileName: true,
  });

  return {
    fileId: result.fileId,
    url: result.url,
    filePath: result.filePath,
    name: result.name,
    width: typeof result.width === "number" ? result.width : undefined,
    height: typeof result.height === "number" ? result.height : undefined,
    size: result.size ?? file.size,
  };
}

/** Deletes an asset by its ImageKit file id. Failures are caught by the caller — see callers for the "only delete after replacement succeeds" policy. */
export async function deleteProductImage(fileId: string): Promise<void> {
  await getClient().deleteFile(fileId);
}

/** Builds an ImageKit CDN URL with transformation params (e.g. responsive width, auto format). */
export function transformedUrl(url: string, opts: { width?: number; quality?: number } = {}): string {
  const params: string[] = [];
  if (opts.width) params.push(`w-${opts.width}`);
  params.push(`q-${opts.quality ?? 80}`);
  params.push("f-auto"); // automatic WebP/AVIF negotiation
  const tr = params.join(",");
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}tr=${tr}`;
}
