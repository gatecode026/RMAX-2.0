import React, { Suspense } from "react";
import { requireRole } from "@/lib/session";
import { ManagerLayoutClient } from "./ManagerLayoutClient";

export const instant = false;

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Manager Dashboard requires its own Manager session — an Admin session never substitutes
  // for it, even for the same person; they must separately authenticate as Manager.
  const user = await requireRole(["manager"]);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F4F7FC]">
          <div className="size-8 animate-spin rounded-full border-3 border-[#10469B] border-t-transparent" />
        </div>
      }
    >
      <ManagerLayoutClient user={user}>{children}</ManagerLayoutClient>
    </Suspense>
  );
}
