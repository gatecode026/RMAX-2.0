"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Building2,
  MessageSquareQuote,
  Wrench,
  Layers,
  BarChart3,
  UserCog,
  Settings,
  Headphones,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Target,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  subItems?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/leads", icon: Target, badge: "Live" },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    subItems: [
      { label: "All Products", href: "/admin/products" },
      { label: "Add Product", href: "/admin/products/create" },
    ],
  },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Institutions", href: "/admin/institutions", icon: Building2 },
  { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquareQuote },
  { label: "Service Requests", href: "/admin/service-requests", icon: Wrench },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: Layers,
    subItems: [
      { label: "Stock Overview", href: "/admin/inventory" },
      { label: "Spare Parts", href: "/admin/inventory?tab=spares" },
    ],
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    subItems: [
      { label: "Sales & Orders", href: "/admin/reports" },
      { label: "Impact & Hygiene", href: "/admin/reports?tab=impact" },
    ],
  },
  { label: "Users & Managers", href: "/admin/users", icon: UserCog },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Products: false,
    Inventory: false,
    Reports: false,
  });
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const toggleGroup = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (item: NavItem) => {
    if (item.href === "/admin/dashboard") {
      return pathname === "/admin/dashboard" || pathname === "/admin";
    }
    return pathname.startsWith(item.href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto px-4 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Top Logo & Header */}
      <div>
        <div className="flex items-center justify-between px-3 pb-6">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2">
            <Image
              src="/images/logo-navy.png"
              alt="RMAX Solutions"
              width={160}
              height={50}
              priority
              className="h-[38px] w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav aria-label="Admin Navigation" className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const hasChildren = !!item.subItems;
            const isGroupExpanded = expanded[item.label] ?? false;
            const Icon = item.icon;

            return (
              <div key={item.label} className="space-y-0.5">
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (!hasChildren) onCloseMobile();
                    }}
                    className={cn(
                      "flex flex-1 items-center gap-3 rounded-xl px-3.5 py-2 text-[13.5px] font-medium transition-all duration-200",
                      active
                        ? "bg-[#0B2450] font-semibold text-white shadow-sm"
                        : "text-[#586574] hover:bg-[#EBF2FC] hover:text-[#10469B]"
                    )}
                  >
                    <Icon className={cn("size-[18px] shrink-0", active ? "text-white" : "text-[#718096]")} />
                    <span className="truncate">{item.label}</span>
                  </Link>

                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.label)}
                      className={cn(
                        "ml-1 flex size-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700",
                        active && "text-gray-300"
                      )}
                      aria-label={`Toggle ${item.label} sub-menu`}
                    >
                      {isGroupExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </button>
                  )}
                </div>

                {/* Submenu */}
                {hasChildren && isGroupExpanded && (
                  <div className="ml-8 space-y-1 pl-2 border-l border-gray-200 py-1">
                    {item.subItems?.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={onCloseMobile}
                          className={cn(
                            "block rounded-lg px-2 py-1 text-[12.5px] transition-colors",
                            isSubActive
                              ? "font-semibold text-[#10469B] bg-[#EBF2FC]"
                              : "text-gray-500 hover:text-[#10469B]"
                          )}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom "Need Help?" Card */}
      <div className="mt-4 pt-2">
        <div className="rounded-2xl border border-[#DCE6F5] bg-[#EEF4FC] p-3.5 text-center">
          <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-white text-[#10469B] shadow-sm">
            <Headphones className="size-4.5" />
          </div>
          <h4 className="mt-2 font-jakarta text-[13.5px] font-bold text-[#202A36]">Need Help?</h4>
          <p className="mt-0.5 text-[11.5px] text-[#718096]">Our team is here to assist you.</p>
          <button
            type="button"
            onClick={() => setSupportModalOpen(true)}
            className="mt-2.5 inline-flex w-full items-center justify-center rounded-full border border-[#D0DEF2] bg-white px-3 py-1.5 text-[12px] font-bold text-[#10469B] shadow-xs transition hover:bg-gray-50 active:scale-95"
          >
            Contact Support
          </button>
        </div>

        {/* Storefront Link */}
        <div className="mt-3 px-2 text-center">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-[#10469B]"
          >
            <span>View Public Store</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>

      {/* Contact Support Modal */}
      {supportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-[#10469B]">
                <Headphones className="size-5" />
                <h3 className="font-jakarta text-[16px] font-bold text-gray-900">RMAX Support Desk</h3>
              </div>
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-[13px] text-gray-600">
              <p>For urgent enterprise support, order escalations, or technician dispatches:</p>
              <div className="rounded-xl bg-[#F4F7FC] p-3 space-y-1.5">
                <p><strong>Hotline:</strong> +91 1800 233 4567 (Toll Free)</p>
                <p><strong>Direct Desk:</strong> +91 94140 88221</p>
                <p><strong>Email:</strong> admin-ops@rmaxsolutions.in</p>
                <p><strong>Hours:</strong> Mon - Sat, 9:00 AM - 7:00 PM IST</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className="rounded-full bg-[#0B2450] px-5 py-2 text-[12px] font-bold text-white hover:bg-[#10469B]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="fixed top-0 bottom-0 left-0 z-30 hidden w-[260px] border-r border-[#E5EBF4] bg-white lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          role="presentation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Mobile Sliding Drawer */}
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-[270px] bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}
