"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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

/**
 * Product list shared by the Admin portal (full management) and the Manager portal (view, plus
 * delete when granted). Multi-select + bulk delete apply to the products on the current page.
 */
export function ProductsManager({ mode, canDelete }: { mode: "admin" | "manager"; canDelete: boolean }) {
  const isAdmin = mode === "admin";
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

  // Bulk selection — scoped to the products currently on screen.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [failures, setFailures] = useState<{ id: string; name: string; error: string }[]>([]);

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

  // Changing search / status / sort / page changes what is on screen, so the selection starts over.
  useEffect(() => {
    setSelected(new Set());
    setFailures([]);
  }, [search, status, sort, page]);

  const pageIds = products.map((p) => p._id);
  const selectedCount = pageIds.filter((id) => selected.has(id)).length;
  const allSelected = pageIds.length > 0 && selectedCount === pageIds.length;
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(pageIds));

  async function handleBulkDelete() {
    const ids = pageIds.filter((id) => selected.has(id));
    if (!ids.length || bulkBusy) return;
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json();
      if (res.status === 401 || res.status === 403 || res.status === 422) throw new Error(json.error || "Not allowed");
      const deleted: string[] = json.deleted ?? [];
      const failed: { id: string; name: string; error: string }[] = json.failed ?? [];

      // Update the table, count and selection in place; failed products stay selected for a retry.
      const gone = new Set(deleted);
      setProducts((prev) => prev.filter((p) => !gone.has(p._id)));
      setSelected(new Set(failed.map((f) => f.id)));
      setFailures(failed);
      setSummary((prev) => ({ ...prev, total: Math.max(0, prev.total - deleted.length) }));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - deleted.length) }));

      if (deleted.length) toastSuccess(deleted.length + " product" + (deleted.length === 1 ? "" : "s") + " deleted.");
      if (failed.length) toastError(failed.length + " product" + (failed.length === 1 ? "" : "s") + " could not be deleted.");
      setBulkOpen(false);

      // The last page may now be empty: step back one page (filters are kept); otherwise refill the page.
      if (deleted.length) {
        if (gone.size >= pageIds.length && page > 1) setPage(page - 1);
        else void load();
      }
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Failed to delete selected products");
      setBulkOpen(false);
    } finally {
      setBulkBusy(false);
    }
  }

  async function runAction(id: string, action: "publish" | "unpublish" | "archive" | "duplicate") {
    setActioningId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}/${action}`, { method: "POST" });
      const json = await res.json();
      // Already removed elsewhere (stale list): just refresh instead of showing an error.
      if (res.status === 404) {
        toastSuccess("This product no longer exists — list refreshed.");
        load();
        return;
      }
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
      if (res.status === 404) {
        toastSuccess("This product was already deleted — list refreshed.");
        setConfirmDelete(null);
        load();
        return;
      }
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
        subtitle={isAdmin ? "Manage your entire RMAX product catalogue." : "Browse the RMAX product catalogue."}
        breadcrumbs={[{ label: "Dashboard", href: isAdmin ? "/admin/dashboard" : "/manager/dashboard" }, { label: "Products" }]}
        actions={
          isAdmin ? (
            <Link
              href="/admin/products/create"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#0B2450] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </Link>
          ) : undefined
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

      {/* Bulk selection bar */}
      {canDelete && selectedCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#10469B]/20 bg-[#10469B]/5 px-4 py-3" role="status">
          <p className="text-sm font-semibold text-[#0B2450]">
            {selectedCount} selected <span className="font-normal text-slate-500">on this page</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear selection
            </button>
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" /> Delete selected
            </button>
          </div>
        </div>
      )}

      {failures.length > 0 && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-red-700">
              {failures.length} product{failures.length === 1 ? "" : "s"} could not be deleted — still selected so you can retry:
            </p>
            <button type="button" onClick={() => setFailures([])} className="text-xs font-semibold text-red-700 hover:underline">
              Dismiss
            </button>
          </div>
          <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-red-700">
            {failures.map((f) => (
              <li key={f.id}>
                <span className="font-semibold">{f.name}</span> — {f.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#E5EBF4] bg-[#F4F7FC] text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                {canDelete && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = selectedCount > 0 && !allSelected;
                      }}
                      onChange={toggleAll}
                      disabled={pageIds.length === 0}
                      aria-label={`Select all ${pageIds.length} products on this page`}
                      title="Select all on this page"
                      className="size-4 cursor-pointer rounded border-slate-300 accent-[#10469B]"
                    />
                  </th>
                )}
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
                  <td colSpan={canDelete ? 9 : 8} className="px-4 py-10 text-center text-slate-400">
                    Loading products…
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={canDelete ? 9 : 8} className="px-4 py-14 text-center">
                    <Package className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm font-semibold text-slate-600">No products found</p>
                    <p className="text-xs text-slate-400">
                      {search || status ? "Try adjusting your search or filters." : "Add your first product to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p._id}
                    onClick={isAdmin ? () => router.push(`/admin/products/${p.slug}/preview`) : undefined}
                    className={`hover:bg-[#F8FAFD] ${isAdmin ? "cursor-pointer" : ""} ${selected.has(p._id) ? "bg-[#10469B]/5" : ""}`}
                  >
                    {canDelete && (
                      <td className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(p._id)}
                          onChange={() => toggleOne(p._id)}
                          aria-label={`Select ${p.name}`}
                          className="size-4 cursor-pointer rounded border-slate-300 accent-[#10469B]"
                        />
                      </td>
                    )}
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
                    {/* Action buttons must not trigger the row click that opens the product. */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          title="View on website"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#10469B]"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {isAdmin && (
                        <Link
                          href={`/admin/products/${p.slug}`}
                          title="Edit"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#10469B]"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        )}
                        {isAdmin && (
                        <button
                          type="button"
                          title="Duplicate"
                          disabled={actioningId === p._id}
                          onClick={() => runAction(p._id, "duplicate")}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#10469B] disabled:opacity-40"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        )}
                        {isAdmin && (p.status !== "published" ? (
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
                        ))}
                        {isAdmin && p.status !== "archived" && (
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
                        {canDelete && (
                        <button
                          type="button"
                          title="Delete"
                          disabled={actioningId === p._id}
                          onClick={() => setConfirmDelete(p)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        )}
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

      <ConfirmDialog
        open={bulkOpen}
        title={`Delete ${selectedCount} product${selectedCount === 1 ? "" : "s"}?`}
        description="This permanently removes the selected products. Products referenced by an order or quotation are skipped and stay selected so you can archive them instead."
        confirmLabel={`Delete ${selectedCount}`}
        busy={bulkBusy}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkOpen(false)}
      />
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={`Delete “${confirmDelete?.name ?? ""}”?`}
        description="This permanently removes the product. If it's referenced by an existing order, deletion will be blocked — archive it instead."
        confirmLabel="Delete product"
        busy={Boolean(confirmDelete) && actioningId === confirmDelete?._id}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
