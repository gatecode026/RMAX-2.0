"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { useToast } from "@/components/ui/Toast";
import { Star, CheckCircle2, XCircle, EyeOff, Trash2, MessageSquareQuote } from "lucide-react";

interface Review {
  _id: string;
  productSlug: string;
  customerName: string;
  rating: number;
  title?: string;
  description: string;
  verifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected" | "hidden";
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  hidden: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function AdminProductReviewsPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = status ? `?status=${status}` : "";
      const res = await fetch(`/api/admin/product-reviews${qs}`);
      const json = await res.json();
      if (json.success) setReviews(json.reviews);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function moderate(review: Review, nextStatus: Review["status"]) {
    setBusyId(review._id);
    try {
      const res = await fetch(`/api/admin/product-reviews/${review._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to update review");
      toastSuccess(`Review ${nextStatus}.`);
      load();
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Failed to update review");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(review: Review) {
    if (!confirm("Delete this review permanently?")) return;
    setBusyId(review._id);
    try {
      const res = await fetch(`/api/admin/product-reviews/${review._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete review");
      toastSuccess("Review deleted.");
      load();
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Failed to delete review");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Product Reviews"
        subtitle="Approve, reject or hide customer reviews. Nothing is ever shown publicly until approved."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Products", href: "/admin/products" }, { label: "Reviews" }]}
      />

      <div className="mb-4 flex gap-2">
        {["", "pending", "approved", "rejected", "hidden"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${status === s ? "border-[#10469B] bg-blue-50 text-[#10469B]" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-10 text-center text-slate-400">Loading…</div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-10 text-center">
            <MessageSquareQuote className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No reviews here yet.</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#0B2450]">{r.customerName}</span>
                    {r.verifiedPurchase && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Verified Purchase</span>}
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                  </div>
                  <Link href={`/products/${r.productSlug}`} target="_blank" className="text-xs text-slate-400 hover:text-[#10469B]">
                    /{r.productSlug}
                  </Link>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                  ))}
                </div>
              </div>
              {r.title && <p className="mt-2 text-sm font-semibold text-slate-800">{r.title}</p>}
              <p className="mt-1 text-sm text-slate-600">{r.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  disabled={busyId === r._id}
                  onClick={() => moderate(r, "approved")}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
                <button
                  disabled={busyId === r._id}
                  onClick={() => moderate(r, "rejected")}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
                <button
                  disabled={busyId === r._id}
                  onClick={() => moderate(r, "hidden")}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <EyeOff className="h-3.5 w-3.5" /> Hide
                </button>
                <button
                  disabled={busyId === r._id}
                  onClick={() => remove(r)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
