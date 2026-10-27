"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { ArrowLeft, Save, ExternalLink, CheckCircle2 } from "lucide-react";
import { products as seedProducts } from "@/data/seed";

export default function AdminProductDetailPage() {
  const params = useParams();
  const idOrSlug = (params?.id as string) || "pro-max";

  const seed = seedProducts.find((p) => p.slug === idOrSlug) || seedProducts[2];

  const [formData, setFormData] = useState({
    name: seed.name,
    title: seed.title,
    slug: seed.slug,
    category: seed.category,
    price: seed.price,
    originalPrice: seed.originalPrice || seed.price * 2,
    dailyCapacity: seed.specs.dailyCapacity,
    power: seed.specs.power,
    weight: seed.specs.weight,
    summary: seed.summary,
    stock: 28,
    status: "Active",
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const productImage =
    seed.slug === "basic"
      ? "/images/products/list-basic.png"
      : seed.slug === "pro"
      ? "/images/products/list-pro.png"
      : seed.slug === "pro-max"
      ? "/images/products/list-pro-max.png"
      : "/images/products/pad-vending.png";

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
          Product specifications and pricing updated successfully!
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
                    Model Code
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
                    disabled
                    value={formData.slug}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institutional Summary
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

          {/* Specifications */}
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
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450] mb-4">Product Visual</h2>
            <div className="flex justify-center rounded-lg border border-slate-100 bg-[#F4F7FC] p-6">
              <div className="relative h-48 w-48">
                <Image
                  src={productImage}
                  alt={formData.title}
                  fill
                  className="object-contain"
                  sizes="192px"
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active on Storefront
              </span>
            </div>
          </div>

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
