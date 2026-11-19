"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AlertCircle, ArrowLeft, Edit3, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";

interface PreviewProduct {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  status: "draft" | "published" | "archived";
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
};

/** Admin preview of a product exactly as customers see it, with Edit / Publish / Show-Hide / Delete actions. */
export default function AdminProductPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = (params?.id as string) || "";
  const { success: toastSuccess, error: toastError } = useToast();

  const [product, setProduct] = useState<PreviewProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Bumped after a status change so the preview frame reloads.
  const [frameKey, setFrameKey] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products/${idOrSlug}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Product not found");
      setProduct(json.product);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load product");
    }
  }, [idOrSlug]);

  useEffect(() => {
    if (idOrSlug) load();
  }, [idOrSlug, load]);

  async function setStatus(action: "publish" | "unpublish") {
    if (!product) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product._id}/${action}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `Failed to ${action}`);
      toastSuccess(action === "publish" ? "Product is now visible on the website." : "Product hidden from the website.");
      await load();
      setFrameKey((k) => k + 1);
    } catch (e) {
      toastError(e instanceof Error ? e.message : `Failed to ${action}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete");
      toastSuccess("Product deleted.");
      router.push("/admin/products");
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Failed to delete");
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-red-500" />
        <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>
        <Link href="/admin/products" className="mt-3 inline-block text-sm font-semibold text-[#10469B] hover:underline">
          Back to All Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-slate-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading preview…
      </div>
    );
  }

  const published = product.status === "published";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin/products" title="Back to products" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#10469B]">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[#0B2450]">{product.name}</p>
            <p className="truncate text-xs text-slate-400">
              /{product.slug}
              {product.sku ? ` · ${product.sku}` : ""}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[product.status]}`}>
            {product.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/products/${product.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Edit3 className="h-4 w-4" /> Edit
          </Link>
          {published ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setStatus("unpublish")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
            >
              <EyeOff className="h-4 w-4" /> Hide from website
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setStatus("publish")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50"
            >
              <Eye className="h-4 w-4" /> {product.status === "archived" ? "Show on website" : "Publish"}
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        <iframe key={frameKey} src={`/products/${product.slug}`} title={`Preview of ${product.name}`} className="h-[80vh] w-full border-0" />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete “${product.name}”?`}
        description="This permanently removes the product. If it's referenced by an existing order, deletion will be blocked — hide it instead."
        confirmLabel="Delete product"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
