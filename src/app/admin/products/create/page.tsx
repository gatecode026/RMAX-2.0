"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from "lucide-react";

const IMAGE_OPTIONS = [
  { label: "Basic Incinerator (Blue Cabinet)", src: "/images/products/list-basic.png" },
  { label: "Pro Incinerator (Blue Cabinet)", src: "/images/products/list-pro.png" },
  { label: "Pro-Max Incinerator (Heavy Blue)", src: "/images/products/list-pro-max.png" },
  { label: "Vending Machine (Off-white)", src: "/images/products/pad-vending.png" },
];

export default function AdminProductCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    slug: "",
    category: "Incinerator",
    price: "",
    originalPrice: "",
    dailyCapacity: "",
    power: "1000 W",
    weight: "9kg",
    dimensions: "650 × 400 × 300 mm",
    warranty: "1 year",
    summary: "",
    stock: "25",
    image: IMAGE_OPTIONS[1].src,
    status: "Active",
  });

  const [features, setFeatures] = useState({
    autoCutoff: true,
    smokeAbsorption: true,
    ceramicInsulation: true,
    wallMountable: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSlugGenerate = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === "" || prev.slug === handleSlugGenerate(prev.name) ? handleSlugGenerate(val) : prev.slug,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Product name is required.");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setErrorMsg("Valid price in INR is required.");
      return;
    }

    setErrorMsg("");
    setSavedSuccess(true);
    setTimeout(() => {
      router.push("/admin/products");
    }, 1500);
  };

  return (
    <div>
      <AdminPageHeader
        title="Add New Product"
        subtitle="Create a new sanitary napkin incinerator or institutional hygiene product."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/products" },
          { label: "Create" },
        ]}
        actions={
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        }
      />

      {savedSuccess && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          Product successfully created! Redirecting to products list...
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Product Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info Card */}
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450] mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Napkin Incinerator (Pro-Max Plus)"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Short Name / Display Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pro-Max Plus"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pro-max-plus"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Summary / Institutional Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description for schools, hospitals, and campus facilities..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450] mb-4">Technical Specifications</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Daily Disposal Capacity
                </label>
                <input
                  type="text"
                  placeholder="e.g. 250–300/day"
                  value={formData.dailyCapacity}
                  onChange={(e) => setFormData({ ...formData, dailyCapacity: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Power Rating
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1000 W"
                  value={formData.power}
                  onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9kg"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dimensions (H × W × D)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 650 × 400 × 300 mm"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
            </div>

            {/* Feature Checkboxes */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                Key Features
              </span>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-sm text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={features.autoCutoff}
                    onChange={(e) => setFeatures({ ...features, autoCutoff: e.target.checked })}
                    className="rounded border-slate-300 text-[#10469B] focus:ring-[#10469B]"
                  />
                  <span>Automatic Temperature Cut-off</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={features.smokeAbsorption}
                    onChange={(e) => setFeatures({ ...features, smokeAbsorption: e.target.checked })}
                    className="rounded border-slate-300 text-[#10469B] focus:ring-[#10469B]"
                  />
                  <span>Low Odour / Smoke Filter</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={features.ceramicInsulation}
                    onChange={(e) => setFeatures({ ...features, ceramicInsulation: e.target.checked })}
                    className="rounded border-slate-300 text-[#10469B] focus:ring-[#10469B]"
                  />
                  <span>Ceramic Chamber Insulation</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={features.wallMountable}
                    onChange={(e) => setFeatures({ ...features, wallMountable: e.target.checked })}
                    className="rounded border-slate-300 text-[#10469B] focus:ring-[#10469B]"
                  />
                  <span>Wall Mount & Floor Stand</span>
                </label>
              </div>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450] mb-4">Pricing & Stock</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Offer Price (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 4500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Original M.R.P. (₹ INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 9000"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Initial Stock Count
                </label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Media & Publication */}
        <div className="space-y-6">
          {/* Product Image Selection */}
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450] mb-3">Product Image</h2>
            <div className="mb-4 flex justify-center rounded-lg border border-dashed border-slate-200 bg-[#F4F7FC]/70 p-4">
              <div className="relative h-44 w-44">
                <Image
                  src={formData.image}
                  alt="Product preview"
                  fill
                  className="object-contain"
                  sizes="176px"
                />
              </div>
            </div>

            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Preset Brand Asset
            </label>
            <div className="space-y-2">
              {IMAGE_OPTIONS.map((opt) => (
                <label
                  key={opt.src}
                  onClick={() => setFormData({ ...formData, image: opt.src })}
                  className={`flex items-center gap-3 rounded-lg border p-2 cursor-pointer transition-colors ${
                    formData.image === opt.src
                      ? "border-[#10469B] bg-blue-50/50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-white p-1 border border-slate-100">
                    <Image src={opt.src} alt={opt.label} fill className="object-contain" sizes="40px" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status and Action */}
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#0B2450]">Publishing Status</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Visibility
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#10469B] focus:outline-none"
              >
                <option value="Active">Active (Visible in Catalog)</option>
                <option value="Draft">Draft (Internal Only)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#10469B] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#0B2450] transition-colors"
              >
                <Save className="h-4 w-4" />
                Save & Publish Product
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
