"use client";

import React, { useState } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Download, TrendingUp, ShieldCheck, Leaf, School, BarChart3, PieChart } from "lucide-react";
import { DEFAULT_SALES_OVERVIEW } from "@/lib/admin/types";

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("FY 2026-27");

  const impactMetrics = [
    {
      title: "Pads Safely Incinerated",
      value: "1,840,000+",
      sub: "+22% vs previous period",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Landfill Waste Diverted",
      value: "36.8 Tonnes",
      sub: "Bio-hazard waste averted",
      icon: Leaf,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Students & Staff Protected",
      value: "450,000+",
      sub: "Across 320 partner campuses",
      icon: School,
      color: "text-[#10469B]",
      bg: "bg-blue-50",
    },
    {
      title: "Annual Revenue Run Rate",
      value: "₹1.48 Cr",
      sub: "Institutional direct sales",
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  const stateBreakdown = [
    { state: "Rajasthan", units: 280, share: 31 },
    { state: "Maharashtra", units: 210, share: 24 },
    { state: "Delhi NCR", units: 175, share: 20 },
    { state: "Karnataka", units: 130, share: 15 },
    { state: "Other States", units: 95, share: 10 },
  ];

  const handleExportReport = () => {
    alert("Exporting comprehensive RMAX Institutional Impact & Sales Report (PDF/CSV)...");
  };

  return (
    <div>
      <AdminPageHeader
        title="Reports & Environmental Impact"
        subtitle="Track institutional hygiene outcomes, pads incinerated, environmental diversion metrics, and sales."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Reports" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="FY 2026-27">FY 2026-27 (Current)</option>
              <option value="FY 2025-26">FY 2025-26</option>
              <option value="Q2 2026">Q2 2026</option>
            </select>
            <button
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0B2450] transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Report
            </button>
          </div>
        }
      />

      {/* Environmental & Health Impact Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {impactMetrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="rounded-xl border border-[#E5EBF4] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {item.title}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">{item.value}</div>
              <div className="mt-1 text-xs text-slate-500">{item.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales & Orders Growth Table */}
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0B2450] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#10469B]" />
              Monthly Sales Performance Breakdown
            </h2>
            <span className="text-xs font-medium text-slate-400">Apr 2026 – Sep 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 pl-3 pr-3">Month</th>
                  <th className="px-3 py-3">Machine Units Sold</th>
                  <th className="px-3 py-3">Revenue (INR)</th>
                  <th className="px-3 py-3">Avg Order Value</th>
                  <th className="py-3 pl-3 pr-3 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF4]">
                {DEFAULT_SALES_OVERVIEW.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 pl-3 pr-3 font-semibold text-slate-800">{item.month} 2026</td>
                    <td className="px-3 py-3 font-medium text-slate-700">{item.orders} units</td>
                    <td className="px-3 py-3 font-bold text-slate-900">₹{item.revenue.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      ₹{Math.round(item.revenue / item.orders).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 pl-3 pr-3 text-right">
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                        ↑ +{10 + idx * 2}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* State Distribution Card */}
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0B2450] flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[#10469B]" />
              Deployment by State
            </h2>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Percentage share of RMAX incinerators installed across key states.
          </p>

          <div className="space-y-3.5">
            {stateBreakdown.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{s.state}</span>
                  <span className="text-slate-500">{s.units} units ({s.share}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#10469B]"
                    style={{ width: `${s.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg bg-[#F4F7FC] p-3 text-xs text-slate-600 leading-relaxed border border-blue-50">
            <span className="font-semibold text-[#0B2450] block mb-0.5">Campus Expansion Target</span>
            Onboarding 50+ additional rural schools under Swachh Bharat institutional procurement initiatives.
          </div>
        </div>
      </div>
    </div>
  );
}
