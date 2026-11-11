"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { ProductForm, type ProductFormInitial } from "@/components/admin/products/ProductForm";
import { Loader2, AlertCircle } from "lucide-react";

export default function AdminProductDetailPage() {
  const params = useParams();
  const idOrSlug = (params?.id as string) || "";

  const [product, setProduct] = useState<ProductFormInitial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idOrSlug) return;
    setLoading(true);
    fetch(`/api/admin/products/${idOrSlug}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || "Product not found");
        setProduct(json.product);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load product"))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-slate-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading product…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-red-500" />
        <p className="mt-2 text-sm font-semibold text-red-700">{error || "Product not found"}</p>
        <Link href="/admin/products" className="mt-3 inline-block text-sm font-semibold text-[#10469B] hover:underline">
          Back to All Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title={`Edit: ${product.name}`}
        subtitle={`SKU: ${product.sku || "—"} · Category: ${product.category}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/products" },
          { label: product.name || "Edit" },
        ]}
        actions={
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            View on Website
          </Link>
        }
      />
      <ProductForm mode="edit" initial={product} />
    </div>
  );
}
