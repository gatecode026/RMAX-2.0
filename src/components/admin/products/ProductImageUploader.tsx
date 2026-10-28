"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

export const PRESET_IMAGES = [
  { label: "Basic Incinerator (Blue Cabinet)", src: "/images/products/list-basic.png" },
  { label: "Pro Incinerator (Blue Cabinet)", src: "/images/products/list-pro.png" },
  { label: "Pro-Max Incinerator (Heavy Blue)", src: "/images/products/list-pro-max.png" },
  { label: "Vending Machine (Off-white)", src: "/images/products/pad-vending.png" },
];

interface ProductImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  gallery?: string[];
  onGalleryChange?: (urls: string[]) => void;
}

export default function ProductImageUploader({
  value,
  onChange,
  gallery = [],
  onGalleryChange,
}: ProductImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "presets">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{ name: string; size: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file (PNG, JPG, WEBP, SVG).");
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Image must be smaller than 10MB.");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch {
      // Fall through to FileReader base64 on network/serverless errors
    }

    // Client-side fallback to base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  };

  const handleMainFileSelect = async (file: File) => {
    setUploadError("");
    setIsUploading(true);
    try {
      const imageUrl = await uploadFile(file);
      onChange(imageUrl);
      setUploadedFileInfo({
        name: file.name,
        size: formatFileSize(file.size),
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleMainFileSelect(files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setUploadError("Please enter a valid image URL");
      return;
    }
    setUploadError("");
    onChange(urlInput.trim());
    setUploadedFileInfo(null);
  };

  const handleGalleryFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !onGalleryChange) return;
    setIsGalleryUploading(true);
    setUploadError("");

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        newUrls.push(url);
      }
      onGalleryChange([...gallery, ...newUrls]);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Error uploading gallery image");
    } finally {
      setIsGalleryUploading(false);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!galleryUrlInput.trim() || !onGalleryChange) return;
    onGalleryChange([...gallery, galleryUrlInput.trim()]);
    setGalleryUrlInput("");
  };

  const handleRemoveGalleryImage = (index: number) => {
    if (!onGalleryChange) return;
    const updated = gallery.filter((_, i) => i !== index);
    onGalleryChange(updated);
  };

  return (
    <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0B2450]">Product Image</h2>
          <p className="text-xs text-slate-500 mt-0.5">Primary photo shown on catalog and product page</p>
        </div>
        {value && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <Check className="h-3 w-3" /> Selected
          </span>
        )}
      </div>

      {/* Main Preview Box */}
      <div className="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#F4F7FC]/70 p-4 min-h-[200px]">
        {value ? (
          <div className="relative group flex items-center justify-center">
            <div className="relative h-44 w-44">
              <Image
                src={value}
                alt="Product preview"
                fill
                unoptimized
                className="object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                sizes="176px"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setUploadedFileInfo(null);
                setUrlInput("");
              }}
              title="Remove image"
              className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1.5 text-white shadow-md hover:bg-red-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-6 text-slate-400">
            <ImageIcon className="h-12 w-12 text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-slate-600">No image chosen yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Upload a photo, enter a link, or pick a preset below</p>
          </div>
        )}

        {uploadedFileInfo && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-[#10469B]">
            <Check className="h-3 w-3" />
            <span className="max-w-[140px] truncate">{uploadedFileInfo.name}</span>
            <span className="text-slate-400">({uploadedFileInfo.size})</span>
          </div>
        )}
      </div>

      {/* Source Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
            activeTab === "upload"
              ? "bg-white text-[#10469B] shadow-sm font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UploadCloud className="h-3.5 w-3.5" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
            activeTab === "url"
              ? "bg-white text-[#10469B] shadow-sm font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          Image URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("presets")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
            activeTab === "presets"
              ? "bg-white text-[#10469B] shadow-sm font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Brand Presets
        </button>
      </div>

      {/* Error alert */}
      {uploadError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Tab 1: Upload from Device */}
      {activeTab === "upload" && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleMainFileSelect(e.target.files[0]);
              }
            }}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-[#10469B] bg-blue-50/60"
                : "border-slate-300 hover:border-[#10469B] hover:bg-slate-50/70"
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center py-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#10469B]" />
                <span className="mt-2 text-xs font-medium text-slate-700">Uploading image...</span>
              </div>
            ) : (
              <>
                <div className="rounded-full bg-blue-50 p-2.5 text-[#10469B] mb-2">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Click to browse <span className="font-normal text-slate-500">or drag and drop</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-400">PNG, JPG, WEBP, or SVG (max 10MB)</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Direct URL */}
      {activeTab === "url" && (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Enter Image Web URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/product-image.png"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="rounded-lg bg-[#10469B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] transition-colors"
            >
              Apply
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Paste any accessible online link or public asset path like <code>/images/products/...</code>
          </p>
        </div>
      )}

      {/* Tab 3: Brand Presets */}
      {activeTab === "presets" && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Choose from Standard RMAX Models
          </label>
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {PRESET_IMAGES.map((opt) => (
              <button
                key={opt.src}
                type="button"
                onClick={() => {
                  onChange(opt.src);
                  setUploadedFileInfo(null);
                }}
                className={`w-full flex items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                  value === opt.src
                    ? "border-[#10469B] bg-blue-50/60 shadow-sm"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-white p-1 border border-slate-100">
                  <Image src={opt.src} alt={opt.label} fill className="object-contain" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{opt.label}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{opt.src}</p>
                </div>
                {value === opt.src && <Check className="h-4 w-4 text-[#10469B] flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Additional Product Gallery Photos (Optional) */}
      {onGalleryChange && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#0B2450] uppercase tracking-wider">
              Product Gallery Photos <span className="font-normal text-slate-400 lowercase">(optional)</span>
            </label>
            <span className="text-[11px] text-slate-500 font-medium">{gallery.length} added</span>
          </div>

          <input
            type="file"
            ref={galleryFileInputRef}
            multiple
            onChange={(e) => handleGalleryFileSelect(e.target.files)}
            accept="image/*"
            className="hidden"
          />

          {/* Gallery Thumbnails List */}
          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {gallery.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="group relative h-16 rounded-lg border border-slate-200 bg-[#F4F7FC] p-1 overflow-hidden"
                >
                  <Image src={imgSrc} alt={`Gallery ${idx + 1}`} fill unoptimized className="object-contain" sizes="64px" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove this photo"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Add Gallery Buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                disabled={isGalleryUploading}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#10469B] hover:bg-blue-50/40 hover:text-[#10469B] transition-colors"
              >
                {isGalleryUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Upload Gallery Photos
                  </>
                )}
              </button>
            </div>

            {/* Quick URL input for gallery */}
            <div className="flex gap-1.5">
              <input
                type="url"
                placeholder="Or paste gallery image URL..."
                value={galleryUrlInput}
                onChange={(e) => setGalleryUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddGalleryUrl();
                  }
                }}
                className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#10469B] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                disabled={!galleryUrlInput.trim()}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

