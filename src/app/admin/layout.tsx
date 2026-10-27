"use client";

import { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopbar } from "@/components/admin/layout/AdminTopbar";
import "./admin.css";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // The admin login page renders in full-screen split layout without the sidebar/topbar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="admin-body flex min-h-screen">
      {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0 w-full lg:pl-[260px]">
        <AdminTopbar onToggleMobile={() => setMobileSidebarOpen((prev) => !prev)} />

        <main className="flex-1 min-w-0 w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px] min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="admin-body min-h-screen" />}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
