"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Plus, Search, Filter, Eye, Edit3, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  dailyCapacity: string;
  power: string;
  weight: string;
  stock: number;
  status: "Active" | "Draft";
  image: string;
}

const INITIAL_PRODUCTS: ProductRow[] = [
  {
    id: "prod-basic",
    slug: "basic",
    name: "Napkin Incinerator (Basic)",
    title: "Basic napkin incinerator",
    category: "Incinerator",
    price: 3000,
    originalPrice: 6000,
    dailyCapacity: "80–100/day",
    power: "800 W",
    weight: "8kg",
    stock: 42,
    status: "Active",
    image: "/images/products/list-basic.png",
  },
  {
    id: "prod-pro",
    slug: "pro",
    name: "Napkin Incinerator (Pro)",
    title: "Pro napkin incinerator",
    category: "Incinerator",
    price: 4500,
    originalPrice: 9000,
    dailyCapacity: "200–250/day",
    power: "1000 W",
    weight: "9kg",
    stock: 28,
    status: "Active",
    image: "/images/products/list-pro.png",
  },
  {
    id: "prod-pro-max",
    slug: "pro-max",
    name: "Napkin Incinerator (Pro-Max)",
    title: "Pro-Max napkin incinerator",
    category: "Incinerator",
    price: 6500,
    originalPrice: 13000,
    dailyCapacity: "400–500/day",
    power: "1200 W",
    weight: "10kg",
    stock: 19,
    status: "Active",
    image: "/images/products/list-pro-max.png",
  },
  {
    id: "prod-vending",
    slug: "pad-vending-coin",
    name: "Sanitary Pad Vending Machine",
    title: "Coin-operated pad vending machine",
    category: "Vending Machine",
    price: 8500,
    originalPrice: 10000,
    dailyCapacity: "100 pads coin vending",
    power: "Battery / 12V",
    weight: "6.5kg",
    stock: 6,
    status: "Active",
    image: "/images/products/pad-vending.png",
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const categories = ["All", "Incinerator", "Vending Machine"];

  const filtered = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.power.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle="Manage RMAX sanitary napkin incinerators, vending units, and inventory specifications."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Products" },
        ]}
        actions={
          <Link
            href="/admin/products/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0B2450] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, model, power..."
            className="w-full rounded-lg border border-slate-200 bg-[#F4F7FC]/50 pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-[#10469B] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-[#10469B] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Product</th>
                <th className="px-3 py-3.5">Category</th>
                <th className="px-3 py-3.5">Key Specs</th>
                <th className="px-3 py-3.5">Price (INR)</th>
                <th className="px-3 py-3.5">Stock</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-[#F4F7FC] p-1">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/admin/products/${product.slug}`}
                            className="font-semibold text-slate-800 hover:text-[#10469B] transition-colors"
                          >
                            {product.name}
                          </Link>
                          <div className="text-xs text-slate-400">Slug: {product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="text-xs text-slate-700 font-medium">{product.power} • {product.weight}</div>
                      <div className="text-xs text-slate-400">{product.dailyCapacity}</div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">₹{product.price.toLocaleString("en-IN")}</div>
                      {product.originalPrice > product.price && (
                        <div className="text-xs text-slate-400 line-through">
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                          product.stock > 10
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        {product.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          title="View on Storefront"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.slug}`}
                          title="Edit Product"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-blue-50 hover:text-[#10469B] transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          title="Delete Product"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-slate-900">Delete Product</h3>
            </div>
            <p className="mb-6 text-sm text-slate-600">
              Are you sure you want to remove this product? It will be archived and hidden from administrative views.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
