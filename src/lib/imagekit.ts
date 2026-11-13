import "server-only";
import ImageKit from "imagekit";
import sharp from "sharp";

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
const MAX_BYTES = 15 * 1024 * 1024; // 15MB

function slugifyFileBase(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return base.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/-+/g, "-").slice(0, 60) || "image";
}

/**
 * Uploads one image to ImageKit under /rmax/products/{productSlug}/{imageType}/.
 * Automatically converts and compresses every image to WebP format before storing in ImageKit.
 * Accepts either a browser File (from FormData) or a Node.js Buffer payload.
 */
export async function uploadProductImage(
  file: File | { buffer: Buffer; name: string; type?: string; size?: number },
  productSlug: string,
  imageType: "main" | "gallery" | "variants" | "thumbnails",
): Promise<UploadedImage> {
  const isBrowserFile = typeof (file as File).arrayBuffer === "function";
  const rawBuffer = isBrowserFile
    ? Buffer.from(await (file as File).arrayBuffer())
    : (file as { buffer: Buffer }).buffer;
  const fileNameInput = file.name;
  const mime = file.type || "image/jpeg";

  if (!ALLOWED_MIME.has(mime) && !fileNameInput.match(/\.(jpe?g|png|webp|avif|gif)$/i)) {
    throw new Error("Only JPEG, PNG, WEBP, AVIF or GIF images are allowed.");
  }
  if (rawBuffer.length > MAX_BYTES) {
    throw new Error("Image must be smaller than 15MB.");
  }

  // Convert to high-quality optimized WebP with EXIF auto-rotation
  const webpBuffer = await sharp(rawBuffer)
    .rotate()
    .webp({ quality: 88, effort: 4 })
    .toBuffer();

  const metadata = await sharp(webpBuffer).metadata();

  const base = slugifyFileBase(fileNameInput);
  const fileName = `${base}-${Date.now()}.webp`;
  const folder = `/rmax/products/${productSlug}/${imageType}`;

  const result = await getClient().upload({
    file: webpBuffer,
    fileName,
    folder,
    useUniqueFileName: true,
  });

  return {
    fileId: result.fileId,
    url: result.url,
    filePath: result.filePath,
    name: result.name,
    width: typeof result.width === "number" ? result.width : metadata.width,
    height: typeof result.height === "number" ? result.height : metadata.height,
    size: webpBuffer.length,
  };
}

/** Deletes an asset by its ImageKit file id. Failures are caught by the caller. */
export async function deleteProductImage(fileId: string): Promise<void> {
  await getClient().deleteFile(fileId);
}

/** Builds an ImageKit CDN URL with transformation params (e.g. responsive width, auto format). */
export function transformedUrl(url: string, opts: { width?: number; quality?: number } = {}): string {
  const params: string[] = [];
  if (opts.width) params.push(`w-${opts.width}`);
  params.push(`q-${opts.quality ?? 85}`);
  params.push("f-webp"); // WebP delivery
  const tr = params.join(",");
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}tr=${tr}`;
}
