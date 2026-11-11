"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  Check,
  AlertCircle,
  Loader2,
  Star,
  Trash2,
  ImageIcon,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/cn";

export interface UploadedProductImage {
  fileId: string;
  url: string;
  filePath: string;
  type: "main" | "front" | "side" | "rear" | "angle" | "gallery" | "variant" | "thumbnail";
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  width?: number;
  height?: number;
}

interface ProductImageUploaderProps {
  images: UploadedProductImage[];
  onChange: (images: UploadedProductImage[]) => void;
  /** Used to namespace the ImageKit folder (/rmax/products/{slug}/...) — pass a provisional slug while the product is still new. */
  productSlug: string;
}

const SLOT_LABELS: { type: UploadedProductImage["type"]; label: string }[] = [
  { type: "front", label: "Front View" },
  { type: "side", label: "Side View" },
  { type: "rear", label: "Rear View" },
  { type: "angle", label: "Angle View" },
];

/**
 * The first image marked primary (or, failing that, the first "main" slot image, or failing
 * that the first image overall) is the one used across product cards and listing pages — this
 * mirrors what src/app/api/admin/products handlers sync into the legacy `image` field.
 */
export function primaryImage(images: UploadedProductImage[]): UploadedProductImage | undefined {
  return images.find((i) => i.isPrimary) ?? images.find((i) => i.type === "main") ?? images[0];
}

export default function ProductImageUploader({ images, onChange, productSlug }: ProductImageUploaderProps) {
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slugForUpload = productSlug?.trim() || `draft-${Date.now()}`;

  async function uploadOne(file: File, type: UploadedProductImage["type"]): Promise<UploadedProductImage> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("productSlug", slugForUpload);
    formData.append("imageType", type === "main" || type === "gallery" ? type : "gallery");

    const res = await fetch("/api/admin/products/images", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || "Upload failed.");
    const img = json.image as { fileId: string; url: string; filePath: string; width?: number; height?: number };
    return { ...img, type, alt: file.name.replace(/\.[^.]+$/, "") };
  }

  async function handleFiles(files: FileList | File[], type: UploadedProductImage["type"]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploadError("");
    setUploadingCount((n) => n + list.length);
    try {
      const uploaded: UploadedProductImage[] = [];
      for (const file of list) {
        try {
          uploaded.push(await uploadOne(file, type));
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : "One or more images failed to upload.");
        }
      }
      if (uploaded.length === 0) return;
      let next = [...images];
      // A slot type that should only ever hold one image (main/front/side/rear/angle) replaces
      // whatever was there before; gallery always appends.
      if (type !== "gallery") {
        const old = next.find((i) => i.type === type);
        if (old) next = next.filter((i) => i.type !== type);
        next = [...next, uploaded[0]];
      } else {
        const existingGalleryCount = next.filter((i) => i.type === "gallery").length;
        next = [...next, ...uploaded.map((img, idx) => ({ ...img, sortOrder: existingGalleryCount + idx }))];
      }
      if (!next.some((i) => i.isPrimary) && (type === "main" || next.length === uploaded.length)) {
        next = next.map((i, idx) => (idx === 0 ? { ...i, isPrimary: true } : i));
      }
      onChange(next);
    } finally {
      setUploadingCount((n) => Math.max(0, n - list.length));
    }
  }

  async function removeImage(target: UploadedProductImage) {
    onChange(images.filter((i) => i !== target));
    try {
      await fetch("/api/admin/products/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: target.fileId }),
      });
    } catch {
      // Non-fatal — the DB reference is already gone; a failed remote delete just leaves an
      // orphaned ImageKit asset, which the PRD explicitly treats as an acceptable degraded case.
    }
  }

  function setPrimary(target: UploadedProductImage) {
    onChange(images.map((i) => ({ ...i, isPrimary: i === target })));
  }

  function setAlt(target: UploadedProductImage, alt: string) {
    onChange(images.map((i) => (i === target ? { ...i, alt } : i)));
  }

  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [dragOverFileId, setDragOverFileId] = useState<string | null>(null);

  /** Drops `dragged` into `target`'s position within the gallery subset, re-numbers sortOrder, and leaves every non-gallery image untouched. */
  function reorderGallery(draggedId: string, targetId: string) {
    if (draggedId === targetId) return;
    const galleryItems = images.filter((i) => i.type === "gallery");
    const fromIndex = galleryItems.findIndex((i) => i.fileId === draggedId);
    const toIndex = galleryItems.findIndex((i) => i.fileId === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const reordered = [...galleryItems];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const withOrder = reordered.map((img, idx) => ({ ...img, sortOrder: idx }));
    const byFileId = new Map(withOrder.map((img) => [img.fileId, img]));
    onChange(images.map((i) => (i.type === "gallery" ? byFileId.get(i.fileId)! : i)));
  }

  const main = images.find((i) => i.type === "main");
  const gallery = images
    .filter((i) => i.type === "gallery")
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const slotted = SLOT_LABELS.map((s) => ({ ...s, image: images.find((i) => i.type === s.type) }));

  return (
    <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0B2450]">Product Images</h2>
          <p className="text-xs text-slate-500 mt-0.5">Hosted on ImageKit — uploads go live immediately, no rebuild required</p>
        </div>
        {images.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <Check className="h-3 w-3" /> {images.length} uploaded
          </span>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main image dropzone */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#0B2450] uppercase tracking-wider">Main Product Image *</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files, "main")}
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          className="hidden"
        />
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files, "main");
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all min-h-[160px]",
            isDragging ? "border-[#10469B] bg-blue-50/60" : "border-slate-300 hover:border-[#10469B] hover:bg-slate-50/70",
          )}
        >
          {main ? (
            <div className="relative group flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <div className="relative h-32 w-32">
                <Image src={main.url} alt={main.alt || "Main product image"} fill unoptimized className="object-contain" sizes="128px" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(main)}
                className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1.5 text-white shadow-md hover:bg-red-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : uploadingCount > 0 ? (
            <div className="flex flex-col items-center py-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#10469B]" />
              <span className="mt-2 text-xs font-medium text-slate-700">Uploading to ImageKit…</span>
            </div>
          ) : (
            <>
              <div className="rounded-full bg-blue-50 p-2.5 text-[#10469B] mb-2">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Click to browse <span className="font-normal text-slate-500">or drag and drop</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-400">JPEG, PNG, WEBP, AVIF or GIF (max 10MB)</p>
            </>
          )}
        </div>
      </div>

      {/* Front/Side/Rear/Angle slots */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-[#0B2450] uppercase tracking-wider">Additional Angles</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {slotted.map((slot) => (
            <SlotUploader
              key={slot.type}
              label={slot.label}
              image={slot.image}
              onUpload={(files) => handleFiles(files, slot.type)}
              onRemove={slot.image ? () => removeImage(slot.image!) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-[#0B2450] uppercase tracking-wider">
            Gallery Photos <span className="font-normal text-slate-400 lowercase">(optional)</span>
          </label>
          <span className="text-[11px] text-slate-500 font-medium">{gallery.length} added</span>
        </div>

        {gallery.length > 0 && (
          <>
            <p className="text-[11px] text-slate-400">Drag a photo to reorder — this is the order customers see on the product page.</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {gallery.map((img) => (
                <div
                  key={img.fileId}
                  draggable
                  onDragStart={() => setDraggedFileId(img.fileId)}
                  onDragEnter={() => draggedFileId && draggedFileId !== img.fileId && setDragOverFileId(img.fileId)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedFileId) reorderGallery(draggedFileId, img.fileId);
                    setDraggedFileId(null);
                    setDragOverFileId(null);
                  }}
                  onDragEnd={() => {
                    setDraggedFileId(null);
                    setDragOverFileId(null);
                  }}
                  className={cn(
                    "group relative h-16 cursor-grab rounded-lg border bg-[#F4F7FC] p-1 overflow-hidden active:cursor-grabbing transition-all",
                    dragOverFileId === img.fileId ? "border-[#10469B] ring-2 ring-[#10469B]/30" : "border-slate-200",
                    draggedFileId === img.fileId && "opacity-40",
                  )}
                >
                  <Image src={img.url} alt={img.alt || "Gallery image"} fill unoptimized className="object-contain pointer-events-none" sizes="64px" />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-center bg-gradient-to-b from-black/30 to-transparent py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-3 w-3 text-white" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrimary(img)}
                    title="Set as primary image"
                    className={cn(
                      "absolute top-1 left-1 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                      img.isPrimary ? "bg-amber-400 text-white opacity-100" : "bg-white/90 text-slate-500 hover:text-amber-500",
                    )}
                  >
                    <Star className="h-3 w-3" fill={img.isPrimary ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(img)}
                    className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <GalleryDropzone onUpload={(files) => handleFiles(files, "gallery")} busy={uploadingCount > 0} />
      </div>

      {/* Alt text editor for the images with alt set so far — lightweight, inline */}
      {images.length > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <label className="mb-1.5 block text-xs font-bold text-[#0B2450] uppercase tracking-wider">Image Alt Text</label>
          <div className="space-y-1.5">
            {images.map((img) => (
              <div key={img.fileId} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-[11px] font-medium capitalize text-slate-500">{img.type}</span>
                <input
                  type="text"
                  value={img.alt || ""}
                  onChange={(e) => setAlt(img, e.target.value)}
                  placeholder="Describe this image for accessibility and SEO"
                  className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SlotUploader({
  label,
  image,
  onUpload,
  onRemove,
}: {
  label: string;
  image?: UploadedProductImage;
  onUpload: (files: FileList) => void;
  onRemove?: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative">
      <input
        type="file"
        ref={ref}
        onChange={(e) => e.target.files && onUpload(e.target.files)}
        accept="image/*"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex h-20 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:border-[#10469B] hover:bg-blue-50/40 transition-colors overflow-hidden"
      >
        {image ? (
          <div className="relative h-full w-full">
            <Image src={image.url} alt={image.alt || label} fill unoptimized className="object-contain p-1" sizes="80px" />
          </div>
        ) : (
          <>
            <ImageIcon className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-500">{label}</span>
          </>
        )}
      </button>
      {image && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 p-1 text-white shadow"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}

function GalleryDropzone({ onUpload, busy }: { onUpload: (files: FileList) => void; busy: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        type="file"
        ref={ref}
        multiple
        onChange={(e) => e.target.files && onUpload(e.target.files)}
        accept="image/*"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#10469B] hover:bg-blue-50/40 hover:text-[#10469B] transition-colors disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
        {busy ? "Uploading…" : "Upload gallery photos"}
      </button>
    </>
  );
}
