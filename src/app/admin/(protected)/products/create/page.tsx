"use client";

import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";

export default function AdminCreateProductPage() {
  return (
    <div>
      <AdminPageHeader
        title="Add New Product"
        subtitle="Create a new product in the RMAX catalogue."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/products" },
          { label: "Add New Product" },
        ]}
      />
      <ProductForm mode="create" />
    </div>
  );
}
