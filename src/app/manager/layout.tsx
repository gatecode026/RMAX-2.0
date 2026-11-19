import React, { Suspense } from "react";
import { requireRole } from "@/lib/session";
import { ManagerLayoutClient } from "./ManagerLayoutClient";
import { ManagerPermissionsProvider } from "@/components/manager/ManagerPermissionsContext";
import { getManagerPermissions } from "@/lib/permissions-server";

export const instant = false;

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Manager Dashboard requires its own Manager session — an Admin session never substitutes
  // for it, even for the same person; they must separately authenticate as Manager.
  const user = await requireRole(["manager"]);
  const permissions = await getManagerPermissions(user.id);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F4F7FC]">
          <div className="size-8 animate-spin rounded-full border-3 border-[#10469B] border-t-transparent" />
        </div>
      }
    >
      <ManagerPermissionsProvider initial={permissions}>
        <ManagerLayoutClient user={user}>{children}</ManagerLayoutClient>
      </ManagerPermissionsProvider>
    </Suspense>
  );
}
