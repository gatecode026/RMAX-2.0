"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Phone,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";

interface FollowUpItem {
  _id: string;
  leadNumber: string;
  name: string;
  phone: string;
  institutionName?: string;
  nextFollowUpAt?: string;
  status: string;
  priority: string;
}

export default function ManagerFollowUpsPage() {
  const [activeTab, setActiveTab] = useState<"overdue" | "dueToday" | "upcoming">("dueToday");
  const [dueToday, setDueToday] = useState<FollowUpItem[]>([]);
  const [overdue, setOverdue] = useState<FollowUpItem[]>([]);
  const [upcoming, setUpcoming] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manager/follow-ups");
      if (res.ok) {
        const data = await res.json();
        setDueToday(data.dueToday || []);
        setOverdue(data.overdue || []);
        setUpcoming(data.upcoming || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const currentList =
    activeTab === "overdue"
      ? overdue
      : activeTab === "dueToday"
      ? dueToday
      : upcoming;

  const filtered = currentList.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.leadNumber.toLowerCase().includes(search.toLowerCase()) ||
      (item.institutionName && item.institutionName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EBF4] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#10469B] uppercase tracking-wider">
            Call Scheduling & Reminders
          </span>
          <h1 className="font-jakarta text-2xl font-bold text-slate-900 mt-1">
            Follow-Up Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Never miss a client callback. Stay ahead of your follow-up pipeline.
          </p>
        </div>
        <button
          onClick={fetchFollowUps}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#10469B]" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("dueToday")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "dueToday"
              ? "bg-[#10469B] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Calendar className="size-4" />
          Due Today
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === "dueToday" ? "bg-white/20 text-white" : "bg-blue-50 text-[#10469B]"
            }`}
          >
            {dueToday.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("overdue")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "overdue"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-white text-red-600 hover:bg-red-50 border border-red-200"
          }`}
        >
          <AlertCircle className="size-4" />
          Overdue
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === "overdue" ? "bg-white/20 text-white" : "bg-red-100 text-red-700"
            }`}
          >
            {overdue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "upcoming"
              ? "bg-[#10469B] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Clock className="size-4" />
          Upcoming
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === "upcoming" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {upcoming.length}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter reminders by lead name or institution..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10469B] focus:outline-hidden"
        />
      </div>

      {/* Reminders List */}
      <div className="rounded-2xl border border-[#E5EBF4] bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="mx-auto size-6 animate-spin text-[#10469B] mb-2" />
            Loading follow-up reminders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <CheckCircle2 className="mx-auto size-8 text-green-500 opacity-60 mb-2" />
            No follow-ups in this category matching your search.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/70 transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
                      activeTab === "overdue"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-[#10469B]"
                    }`}
                  >
                    <Calendar className="size-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#10469B]">
                        {item.leadNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                      <span className="rounded-md bg-slate-100 px-2 py-0.2 text-[10px] font-bold text-slate-600 uppercase">
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.institutionName || "Individual Enquiry"} • Phone: {item.phone}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-slate-400">
                      <span>Scheduled Date:</span>
                      <span
                        className={
                          activeTab === "overdue"
                            ? "font-bold text-red-600"
                            : "font-semibold text-slate-700"
                        }
                      >
                        {item.nextFollowUpAt
                          ? new Date(item.nextFollowUpAt).toLocaleDateString([], {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })
                          : "Unscheduled"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <a
                    href={`tel:${item.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Phone className="size-3 text-[#10469B]" /> Call
                  </a>
                  <Link
                    href={`/manager/leads/${item._id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#10469B] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0B2450] transition"
                  >
                    Open Lead <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
