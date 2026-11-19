"use client";

import { ProductsManager } from "@/components/admin/products/ProductsManager";
import { useManagerPermissions } from "@/components/manager/ManagerPermissionsContext";

/** Manager → Products: browse the catalogue; delete (single or bulk) only with "Delete products". */
export default function ManagerProductsPage() {
  const { productsDelete } = useManagerPermissions();
  return <ProductsManager mode="manager" canDelete={productsDelete} />;
}
