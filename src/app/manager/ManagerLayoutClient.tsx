"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  CalendarCheck,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  BellRing,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useDesktopNotifications } from "@/hooks/useDesktopNotifications";
import { logoutAction } from "@/lib/actions/auth";

interface ManagerLayoutClientProps {
  children: React.ReactNode;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    department?: string | null;
  };
}

const MANAGER_NAV = [
  { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
  { label: "My Leads", href: "/manager/leads", icon: Target },
  { label: "Follow-Ups", href: "/manager/follow-ups", icon: CalendarCheck },
  { label: "My Profile", href: "/manager/profile", icon: User },
];

export function ManagerLayoutClient({ children, user }: ManagerLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    permission,
    isSupported,
    requestPermission,
    markAsRead,
    markAllAsRead,
  } = useDesktopNotifications();

  const handleSignOut = async () => {
    try {
      await logoutAction();
    } catch {
      router.push("/login");
    }
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "MG";

  return (
    <div className="flex min-h-screen bg-[#F4F7FC]">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col justify-between border-r border-[#E5EBF4] bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo */}
          <div className="flex h-[70px] items-center justify-between border-b border-[#E5EBF4] px-5">
            <Link href="/manager/dashboard" className="flex items-center gap-2">
              <Image
                src="/images/logo-navy.png"
                alt="RMAX Solutions"
                width={140}
                height={42}
                priority
                className="h-[34px] w-auto"
              />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Manager Badge */}
          <div className="m-3 rounded-xl bg-[#10469B]/5 border border-[#10469B]/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#10469B]">
              Manager Workspace
            </p>
            <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
              {user.department || "Institutional Sales"}
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 px-3 py-2">
            {MANAGER_NAV.map((item) => {
              const active =
                item.href === "/manager/dashboard"
                  ? pathname === "/manager/dashboard" || pathname === "/manager"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    active
                      ? "bg-[#10469B] text-white shadow-xs"
                      : "text-slate-600 hover:bg-[#F4F7FC] hover:text-[#10469B]"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Info & Sign Out */}
        <div className="border-t border-[#E5EBF4] p-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5 mb-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#10469B] text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="size-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-[#E5EBF4] bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="font-jakarta text-sm font-bold text-slate-900">
                Lead Operations Center
              </h2>
              <p className="text-[11px] text-slate-400">RMAX Sanitary Disposal Solutions</p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Bell className="size-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white ring-2 ring-white animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute top-[48px] right-0 z-50 w-[340px] sm:w-[380px] rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl">
                  <div className="flex items-center justify-between px-2 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <p className="font-jakarta text-[14px] font-bold text-gray-900">
                        Notifications
                      </p>
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
                        <p className="mt-2 text-[13px] font-medium text-gray-700">
                          All caught up!
                        </p>
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
                          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#10469B]">
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

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 p-1 sm:px-2.5 sm:py-1.5 hover:bg-slate-50 transition"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-[#10469B] text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-[10px] font-medium text-slate-400 leading-tight">Manager</p>
                </div>
                <ChevronDown className="hidden size-3 text-slate-400 sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute top-[48px] right-0 z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <Link
                    href="/manager/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#F4F7FC] hover:text-[#10469B]"
                  >
                    <User className="size-3.5" />
                    My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="size-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
