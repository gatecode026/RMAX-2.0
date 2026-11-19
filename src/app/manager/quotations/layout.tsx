import React from "react";
import { requireManagerPermission } from "@/lib/permissions-server";

/** Server-side gate: a manager without this page's permission is redirected, whatever URL they type. */
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireManagerPermission("leadsView");
  return <>{children}</>;
}
