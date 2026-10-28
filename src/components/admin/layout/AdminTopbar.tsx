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

import { useDesktopNotifications } from "@/hooks/useDesktopNotifications";
import { logoutAction } from "@/lib/actions/auth";
import { BellRing, CheckCheck } from "lucide-react";

export function AdminTopbar({ onToggleMobile }: { onToggleMobile: () => void }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    permission,
    isSupported,
    requestPermission,
    markAsRead,
    markAllAsRead,
  } = useDesktopNotifications();

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

  // Quick search matches
  const searchableItems = [
    { type: "Lead", title: "Leads Management & Pipeline", href: "/admin/leads" },
    { type: "Quote", title: "Institutional Quotations & Proposals", href: "/admin/quotations" },
    { type: "Product", title: "Napkin Incinerator (Pro-Max)", href: "/admin/products" },
    { type: "Product", title: "Napkin Incinerator (Pro)", href: "/admin/products" },
    { type: "Product", title: "Napkin Incinerator (Basic)", href: "/admin/products" },
    { type: "Audit", title: "Audit Trail & Compliance", href: "/admin/audit-logs" },
    { type: "Users", title: "Manager & Team Administration", href: "/admin/users" },
  ];

  const searchResults = searchQuery.trim()
    ? searchableItems.filter((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSignOut = async () => {
    try {
      await logoutAction("/admin/login");
    } finally {
      window.location.href = "/admin/login";
    }
  };

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
              placeholder="Search leads, products, orders, institutions..."
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
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white ring-2 ring-white animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute top-[48px] right-0 z-50 w-[340px] sm:w-[380px] rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl">
              <div className="flex items-center justify-between px-2 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <p className="font-jakarta text-[14px] font-bold text-gray-900">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#10469B] hover:underline"
                  >
                    <CheckCheck className="size-3.5" /> Mark all read
                  </button>
                )}
              </div>

              {/* Desktop Alerts Banner */}
              {isSupported && (
                <div className="mt-2 flex items-center justify-between rounded-xl bg-[#F4F7FC] px-3 py-2 border border-[#E5EBF4]">
                  <div className="flex items-center gap-2 text-[12px] text-gray-700">
                    <BellRing className="size-4 text-[#10469B]" />
                    <span>Desktop Alerts</span>
                  </div>
                  {permission === "granted" ? (
                    <span className="rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                      Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={requestPermission}
                      className="rounded-md bg-[#10469B] px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-[#0B2450] transition-colors"
                    >
                      Enable
                    </button>
                  )}
                </div>
              )}

              {/* Notification List */}
              <div className="mt-2 max-h-[340px] overflow-y-auto divide-y divide-gray-100 pr-1 [scrollbar-width:thin]">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="mx-auto size-8 text-green-500 opacity-60" />
                    <p className="mt-2 text-[13px] font-medium text-gray-700">All caught up!</p>
                    <p className="text-[11px] text-gray-400">No recent notifications.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => {
                        if (!notif.read) markAsRead(notif._id);
                        if (notif.link) {
                          setNotificationsOpen(false);
                          router.push(notif.link);
                        }
                      }}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-xl p-2.5 transition hover:bg-[#F4F7FC] ${
                        !notif.read ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
                          notif.type === "lead_assigned"
                            ? "bg-purple-100 text-purple-700"
                            : notif.type === "follow_up_due" || notif.type === "follow_up_overdue"
                            ? "bg-amber-100 text-amber-700"
                            : notif.type === "lead_converted"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-[#10469B]"
                        }`}
                      >
                        <Bell className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[12px] text-gray-900 truncate">
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="size-1.5 rounded-full bg-[#10469B] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
            {/* Dark Navy Avatar with First Letter "S" */}
            <div className="flex size-9 items-center justify-center rounded-full bg-[#0B2450] text-[14px] font-bold text-white shadow-xs uppercase">
              S
            </div>
            <div className="hidden text-left sm:block">
              <p className="font-jakarta text-[13px] font-bold leading-tight text-[#202A36]">Super Admin</p>
              <p className="text-[11px] font-medium leading-tight text-[#718096]">Super Admin</p>
            </div>
            <ChevronDown className="hidden size-3.5 text-gray-400 sm:block" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute top-[52px] right-0 z-50 w-[210px] rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-jakarta text-[13px] font-bold text-gray-900">RMAX Administration</p>
                <p className="text-[11px] text-gray-500 truncate">admin@rmax.in</p>
              </div>
              <div className="mt-1 space-y-0.5 text-[13px]">
                <Link
                  href="/admin/users"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-gray-700 hover:bg-[#F4F7FC] hover:text-[#10469B]"
                >
                  <User className="size-4" />
                  <span>Users & Managers</span>
                </Link>
                <Link
                  href="/admin/leads"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-gray-700 hover:bg-[#F4F7FC] hover:text-[#10469B]"
                >
                  <Building2 className="size-4" />
                  <span>Lead Pipeline</span>
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
                  onClick={handleSignOut}
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
