"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { useToast } from "@/components/ui/Toast";
import {
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Copy,
  CheckCircle2,
  EyeOff,
  Archive,
  AlertCircle,
  Package,
  PackageCheck,
  PackageX,
  FileEdit,
  ImageOff,
} from "lucide-react";

interface ProductImage {
  src: string;
  alt?: string;
}

interface ProductRow {
  _id: string;
  name: string;
  title: string;
  slug: string;
  sku?: string;
  category: string;
  model?: string;
  price: number;
  originalPrice: number;
  stock: number;
  stockStatus: string;
  status: "draft" | "published" | "archived";
  image?: ProductImage;
  updatedAt: string;
}

interface Summary {
  total: number;
  published: number;
  draft: number;
  archived: number;
  outOfStock: number;
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
};

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: toastSuccess, error: toastError } = useToast();

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, published: 0, draft: 0, archived: 0, outOfStock: 0 });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProductRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (search) qs.set("search", search);
      if (status) qs.set("status", status);
      qs.set("sort", sort);
      qs.set("page", String(page));
      const res = await fetch(`/api/admin/products?${qs.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load products");
      setProducts(json.products);
      setSummary(json.summary);
      setPagination(json.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, status, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(id: string, action: "publish" | "unpublish" | "archive" | "duplicate") {
    setActioningId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}/${action}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `Failed to ${action}`);
      toastSuccess(
        action === "publish"
          ? "Product published."
          : action === "unpublish"
          ? "Product moved back to draft."
          : action === "archive"
          ? "Product archived."
          : "Product duplicated as a new draft.",
      );
      load();
    } catch (e) {
      toastError(e instanceof Error ? e.message : `Failed to ${action}`);
    } finally {
      setActioningId(null);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setActioningId(confirmDelete._id);
    try {
      const res = await fetch(`/api/admin/products/${confirmDelete._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete");
      toastSuccess("Product deleted.");
      setConfirmDelete(null);
      load();
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setActioningId(null);
    }
  }

  const cards: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
    { label: "Total Products", value: summary.total, icon: Package, tone: "text-[#10469B] bg-blue-50" },
    { label: "Published", value: summary.published, icon: PackageCheck, tone: "text-emerald-700 bg-emerald-50" },
    { label: "Draft", value: summary.draft, icon: FileEdit, tone: "text-amber-700 bg-amber-50" },
    { label: "Out of Stock", value: summary.outOfStock, icon: PackageX, tone: "text-red-700 bg-red-50" },
    { label: "Archived", value: summary.archived, icon: Archive, tone: "text-slate-600 bg-slate-100" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="All Products"
        subtitle="Manage your entire RMAX product catalogue."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Products" }]}
        actions={
          <Link
            href="/admin/products/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#0B2450] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Link>
        }
      />

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
            <div className={`mb-2 inline-flex size-9 items-center justify-center rounded-lg ${c.tone}`}>
              <c.icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-2xl font-bold text-[#0B2450]">{c.value}</p>
            <p className="text-xs font-medium text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, SKU or slug..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-[#10469B] focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-[#10469B] focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#E5EBF4] bg-[#F4F7FC] text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3F9]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    Loading products…
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <Package className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm font-semibold text-slate-600">No products found</p>
                    <p className="text-xs text-slate-400">
                      {search || status ? "Try adjusting your search or filters." : "Add your first product to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-[#F8FAFD]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-[#F4F7FC]">
                          {p.image?.src ? (
                            <Image src={p.image.src} alt={p.image.alt || p.name} fill unoptimized className="object-contain p-1" sizes="40px" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-300">
                              <ImageOff className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#0B2450]">{p.name}</p>
                          <p className="truncate text-xs text-slate-400">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.sku || "—"}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{p.category.replace(/-/g, " ")}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatINR(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stockStatus === "out-of-stock" ? "font-semibold text-red-600" : "text-slate-600"}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(p.updatedAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          title="View on website"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#10469B]"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${p.slug}`}
                          title="Edit"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#10469B]"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          title="Duplicate"
                          disabled={actioningId === p._id}
                          onClick={() => runAction(p._id, "duplicate")}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#10469B] disabled:opacity-40"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {p.status !== "published" ? (
                          <button
                            type="button"
                            title="Publish"
                            disabled={actioningId === p._id}
                            onClick={() => runAction(p._id, "publish")}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            title="Unpublish"
                            disabled={actioningId === p._id}
                            onClick={() => runAction(p._id, "unpublish")}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40"
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                        )}
                        {p.status !== "archived" && (
                          <button
                            type="button"
                            title="Archive"
                            disabled={actioningId === p._id}
                            onClick={() => runAction(p._id, "archive")}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Delete"
                          disabled={actioningId === p._id}
                          onClick={() => setConfirmDelete(p)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5EBF4] px-4 py-3 text-sm">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} product{pagination.total === 1 ? "" : "s"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B2450]">Delete &ldquo;{confirmDelete.name}&rdquo;?</h3>
            <p className="mt-1.5 text-sm text-slate-500">
              This permanently removes the product. If it&apos;s referenced by an existing order, deletion will be blocked —
              archive it instead.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actioningId === confirmDelete._id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
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
