"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import ProductImageUploader from "@/components/admin/products/ProductImageUploader";
import { ArrowLeft, Save, ExternalLink, CheckCircle2 } from "lucide-react";
import { products as seedProducts } from "@/data/seed";

export default function AdminProductDetailPage() {
  const params = useParams();
  const idOrSlug = (params?.id as string) || "pro-max";

  const seed = seedProducts.find((p) => p.slug === idOrSlug) || seedProducts[2];

  const defaultImage =
    seed.slug === "basic"
      ? "/images/products/list-basic.png"
      : seed.slug === "pro"
      ? "/images/products/list-pro.png"
      : seed.slug === "pro-max"
      ? "/images/products/list-pro-max.png"
      : "/images/products/pad-vending.png";

  const [formData, setFormData] = useState({
    name: seed.name,
    title: seed.title,
    slug: seed.slug,
    category: seed.category as string,
    price: seed.price,
    originalPrice: seed.originalPrice || seed.price * 2,
    dailyCapacity: seed.specs.dailyCapacity,
    power: seed.specs.power,
    weight: seed.specs.weight,
    summary: seed.summary,
    stock: 28,
    status: "Active",
    image: defaultImage,
  });

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const stored = localStorage.getItem("rmax_admin_products");
      if (stored) {
        const list = JSON.parse(stored) as Array<Record<string, unknown>>;
        const idx = list.findIndex((p) => p.slug === formData.slug || p.id === formData.slug);
        if (idx >= 0) {
          list[idx] = {
            ...list[idx],
            ...formData,
            gallery: galleryImages,
          };
          localStorage.setItem("rmax_admin_products", JSON.stringify(list));
        }
      }
    } catch (err) {
      console.error("Local storage update error:", err);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div>
      <AdminPageHeader
        title={formData.title}
        subtitle={`Managing SKU: RMAX-${formData.slug.toUpperCase()} • Category: ${formData.category}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/products" },
          { label: formData.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/products/${formData.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View on Website
            </Link>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        }
      />

      {savedSuccess && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          Product specifications, visual media, and pricing updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Product Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Overview */}
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450] mb-4">Product Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Summary Description
                </label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Technical Specs */}
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450] mb-4">Technical Specifications</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Capacity
                </label>
                <input
                  type="text"
                  value={formData.dailyCapacity}
                  onChange={(e) => setFormData({ ...formData, dailyCapacity: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Power
                </label>
                <input
                  type="text"
                  value={formData.power}
                  onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Weight
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450] mb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Offer Price (₹ INR)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  M.R.P. (₹ INR)
                </label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Units in Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Media Preview & Actions */}
        <div className="space-y-6">
          <ProductImageUploader
            value={formData.image}
            onChange={(img) => setFormData((prev) => ({ ...prev, image: img }))}
            gallery={galleryImages}
            onGalleryChange={setGalleryImages}
          />

          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#0B2450]">Save Changes</h2>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#10469B] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#0B2450] transition-colors"
            >
              <Save className="h-4 w-4" />
              Update Product
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
