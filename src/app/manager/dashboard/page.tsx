"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ChevronRight,
  TrendingUp,
  UserCheck,
  RefreshCw,
  Phone,
  Mail,
  ArrowUpRight,
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

interface ActivityItem {
  action: string;
  performedByName: string;
  timestamp: string;
  notes?: string;
}

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    newLeads: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
    dueToday: 0,
    overdue: 0,
  });
  const [dueTodayList, setDueTodayList] = useState<FollowUpItem[]>([]);
  const [overdueList, setOverdueList] = useState<FollowUpItem[]>([]);
  const [upcomingList, setUpcomingList] = useState<FollowUpItem[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch follow-ups
      const fuRes = await fetch("/api/manager/follow-ups");
      if (fuRes.ok) {
        const fuData = await fuRes.json();
        setDueTodayList(fuData.dueToday || []);
        setOverdueList(fuData.overdue || []);
        setUpcomingList(fuData.upcoming || []);
      }

      // Fetch manager leads to calculate metrics
      const leadsRes = await fetch("/api/admin/leads?limit=100");
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        const leads = leadsData.leads || [];

        const totalAssigned = leads.length;
        const newLeads = leads.filter((l: any) => l.status === "new").length;
        const contacted = leads.filter((l: any) => l.status === "contacted").length;
        const qualified = leads.filter((l: any) => l.status === "qualified").length;
        const converted = leads.filter((l: any) => l.status === "converted").length;
        const lost = leads.filter((l: any) => l.status === "lost").length;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const overdue = leads.filter((l: any) => {
          if (!l.nextFollowUpAt || l.status === "converted" || l.status === "lost") return false;
          return new Date(l.nextFollowUpAt) < startOfToday;
        }).length;

        const dueToday = leads.filter((l: any) => {
          if (!l.nextFollowUpAt || l.status === "converted" || l.status === "lost") return false;
          const d = new Date(l.nextFollowUpAt);
          return d >= startOfToday && d <= endOfToday;
        }).length;

        setStats({
          totalAssigned,
          newLeads,
          contacted,
          qualified,
          converted,
          lost,
          dueToday,
          overdue,
        });
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EBF4] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#10469B] uppercase tracking-wider">
            Lead Management Workspace
          </span>
          <h1 className="font-jakarta text-2xl font-bold text-slate-900 mt-1">
            Manager Overview & Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time track of your assigned institutional enquiries, daily calls, and scheduled follow-ups.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#10469B]" : ""}`} />
            Refresh
          </button>
          <Link
            href="/manager/leads"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#10469B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] shadow-xs transition"
          >
            <Target className="size-3.5" />
            My Active Leads
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned</p>
          <p className="mt-1 text-xl font-bold text-slate-900 font-jakarta">{stats.totalAssigned}</p>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">New</p>
          <p className="mt-1 text-xl font-bold text-blue-600 font-jakarta">{stats.newLeads}</p>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Contacted</p>
          <p className="mt-1 text-xl font-bold text-amber-600 font-jakarta">{stats.contacted}</p>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Qualified</p>
          <p className="mt-1 text-xl font-bold text-purple-600 font-jakarta">{stats.qualified}</p>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Converted</p>
          <p className="mt-1 text-xl font-bold text-green-700 font-jakarta">{stats.converted}</p>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lost</p>
          <p className="mt-1 text-xl font-bold text-slate-600 font-jakarta">{stats.lost}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Due Today</p>
          <p className="mt-1 text-xl font-bold text-blue-700 font-jakarta">{stats.dueToday}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Overdue</p>
          <p className="mt-1 text-xl font-bold text-red-600 font-jakarta">{stats.overdue}</p>
        </div>
      </div>

      {/* Main Split: Due Today & Overdue Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Due Today Card */}
        <div className="rounded-2xl border border-[#E5EBF4] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-4.5 text-[#10469B]" />
                <h3 className="font-jakarta text-sm font-bold text-slate-900">
                  Follow-Ups Due Today
                </h3>
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#10469B]">
                {dueTodayList.length} Scheduled
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {dueTodayList.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="mx-auto size-7 text-green-500 opacity-60 mb-1" />
                  No follow-ups due today. You are up to date!
                </div>
              ) : (
                dueTodayList.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between py-3 hover:bg-slate-50/60 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#10469B]">
                          {item.leadNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{item.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.institutionName || "Individual"} • {item.phone}
                      </p>
                    </div>
                    <Link
                      href={`/manager/leads/${item._id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#10469B] hover:bg-blue-100 transition"
                    >
                      Open <ChevronRight className="size-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <Link
              href="/manager/follow-ups"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#10469B] hover:underline"
            >
              View all follow-ups <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Overdue Alerts Card */}
        <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4.5 text-red-600" />
                <h3 className="font-jakarta text-sm font-bold text-slate-900">
                  Overdue Follow-Up Action Required
                </h3>
              </div>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                {overdueList.length} Overdue
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {overdueList.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="mx-auto size-7 text-green-500 opacity-60 mb-1" />
                  Great job! Zero overdue follow-up calls pending.
                </div>
              ) : (
                overdueList.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between py-3 hover:bg-red-50/30 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-red-600">
                          {item.leadNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{item.name}</span>
                        <span className="rounded-sm bg-red-100 px-1 py-0.2 text-[9px] font-extrabold text-red-700">
                          OVERDUE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.institutionName || "Individual"} • Was due:{" "}
                        {item.nextFollowUpAt
                          ? new Date(item.nextFollowUpAt).toLocaleDateString()
                          : "Past"}
                      </p>
                    </div>
                    <Link
                      href={`/manager/leads/${item._id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700 transition"
                    >
                      Call Now <ChevronRight className="size-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <Link
              href="/manager/follow-ups?tab=overdue"
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
            >
              Resolve overdue leads <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
