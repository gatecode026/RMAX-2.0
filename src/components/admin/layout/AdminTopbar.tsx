"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Package,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

export function AdminTopbar({ onToggleMobile }: { onToggleMobile: () => void }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quick mock search matches
  const searchableItems = [
    { type: "Product", title: "Napkin Incinerator (Pro-Max)", href: "/admin/products" },
    { type: "Product", title: "Napkin Incinerator (Pro)", href: "/admin/products" },
    { type: "Product", title: "Napkin Incinerator (Basic)", href: "/admin/products" },
    { type: "Order", title: "#1523 - Singhania School (₹6,500)", href: "/admin/orders" },
    { type: "Order", title: "#1522 - Sunrise Public School (₹4,500)", href: "/admin/orders" },
    { type: "Institution", title: "Singhania School, Jaipur", href: "/admin/institutions" },
    { type: "Institution", title: "City Hospital, Jaipur", href: "/admin/institutions" },
    { type: "Enquiry", title: "Amit Sharma (Delhi Public School)", href: "/admin/enquiries" },
  ];

  const searchResults = searchQuery.trim()
    ? searchableItems.filter((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <header className="sticky top-0 z-20 flex h-[70px] w-full items-center justify-between border-b border-[#E5EBF4] bg-white px-4 sm:px-6">
      {/* Left side: Hamburger + Search */}
      <div className="flex flex-1 items-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={onToggleMobile}
          className="flex size-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </button>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative w-full max-w-[340px] md:max-w-[420px]">
          <div className="flex h-[42px] items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 transition focus-within:border-[#10469B] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#10469B]/15">
            <Search className="size-4 shrink-0 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search products, orders, institutions..."
              className="w-full bg-transparent text-[13px] text-[#202A36] placeholder-[#94A3B8] outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-[48px] left-0 z-50 w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-xl">
              <div className="p-2">
                <p className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Quick Search Results
                </p>
                {searchResults.length === 0 ? (
                  <p className="px-2.5 py-3 text-[13px] text-gray-500">No matching records found.</p>
                ) : (
                  <ul className="space-y-1">
                    {searchResults.map((item, idx) => (
                      <li key={idx}>
                        <Link
                          href={item.href}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] text-gray-700 hover:bg-[#F4F7FC] hover:text-[#10469B]"
                        >
                          <span className="font-medium truncate">{item.title}</span>
                          <span className="ml-2 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                            {item.type}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Notifications + Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Icon with Unread Indicator */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex size-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-100"
            aria-label="View notifications"
          >
            <Bell className="size-4.5" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute top-[48px] right-0 z-50 w-[320px] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-100">
                <p className="font-jakarta text-[14px] font-bold text-gray-900">Notifications</p>
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">3 New</span>
              </div>
              <ul className="mt-2 space-y-2 text-[12px]">
                <li className="flex items-start gap-2.5 rounded-xl p-2 hover:bg-gray-50">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Order #1523 delivered</p>
                    <p className="text-gray-500">Singhania School, Jaipur</p>
                    <span className="text-[10px] text-gray-400">10 mins ago</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5 rounded-xl p-2 hover:bg-gray-50">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#10469B]">
                    <Building2 className="size-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">New quote request</p>
                    <p className="text-gray-500">Amit Sharma (Delhi Public School)</p>
                    <span className="text-[10px] text-gray-400">2 hours ago</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5 rounded-xl p-2 hover:bg-gray-50">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <AlertCircle className="size-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Service scheduled</p>
                    <p className="text-gray-500">Pro-Max installation tomorrow</p>
                    <span className="text-[10px] text-gray-400">4 hours ago</span>
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-transparent p-1 transition hover:bg-gray-100 sm:border-gray-200 sm:px-2.5 sm:py-1.5"
            aria-label="User menu"
          >
            {/* Dark Navy Avatar with Initials "RK" */}
            <div className="flex size-9 items-center justify-center rounded-full bg-[#0B2450] text-[13px] font-bold text-white shadow-xs">
              RK
            </div>
            <div className="hidden text-left sm:block">
              <p className="font-jakarta text-[13px] font-bold leading-tight text-[#202A36]">Rahul Kumawat</p>
              <p className="text-[11px] font-medium leading-tight text-[#718096]">Admin</p>
            </div>
            <ChevronDown className="hidden size-3.5 text-gray-400 sm:block" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute top-[52px] right-0 z-50 w-[200px] rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-jakarta text-[13px] font-bold text-gray-900">Rahul Kumawat</p>
                <p className="text-[11px] text-gray-500 truncate">rahul@rmaxsolutions.in</p>
              </div>
              <div className="mt-1 space-y-0.5 text-[13px]">
                <Link
                  href="/admin/users"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-gray-700 hover:bg-[#F4F7FC] hover:text-[#10469B]"
                >
                  <User className="size-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-gray-700 hover:bg-[#F4F7FC] hover:text-[#10469B]"
                >
                  <Settings className="size-4" />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-gray-700 hover:bg-[#F4F7FC] hover:text-[#10469B]"
                >
                  <Package className="size-4" />
                  <span>Storefront</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/login");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
