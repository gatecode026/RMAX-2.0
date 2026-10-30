"use client";

import React, { useState } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Save, CheckCircle2, Building2, Bell, Sliders } from "lucide-react";

export default function AdminSettingsPage() {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [companyInfo, setCompanyInfo] = useState({
    name: "RMAX Solutions",
    tagline: "Let's build a better world.",
    gstin: "08AABCR1234F1Z8",
    email: "contact@rmaxsolutions.in",
    phone: "+91 94140 12345",
    address: "Plot 12, Industrial Area, Phase II, Jaipur, Rajasthan — 302013",
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    serviceTickets: true,
    weeklyReport: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div>
      <AdminPageHeader
        title="Admin Settings"
        subtitle="Manage brand profile, institutional invoicing details, tax configurations, and notification preferences."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Settings" },
        ]}
      />

      {savedSuccess && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Company Profile */}
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="h-5 w-5 text-[#10469B]" />
            <h2 className="text-base font-bold text-[#0B2450]">Company & Invoicing Profile</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Company Legal Name
              </label>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={companyInfo.tagline}
                onChange={(e) => setCompanyInfo({ ...companyInfo, tagline: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                GSTIN Identification Number
              </label>
              <input
                type="text"
                value={companyInfo.gstin}
                onChange={(e) => setCompanyInfo({ ...companyInfo, gstin: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Support Email
              </label>
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Registered Factory & Office Address
              </label>
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Invoicing and Taxation */}
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="h-5 w-5 text-[#10469B]" />
            <h2 className="text-base font-bold text-[#0B2450]">Tax & Shipping Rules</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Standard GST Rate for Incinerator Units
              </label>
              <div className="flex items-center rounded-lg border border-slate-200 px-3.5 py-2 text-sm bg-slate-50 text-slate-700 font-medium">
                18% GST (Harmonized System Code 8419)
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                PAN-India Delivery Policy
              </label>
              <div className="flex items-center rounded-lg border border-slate-200 px-3.5 py-2 text-sm bg-slate-50 text-emerald-700 font-medium">
                Free shipping for all institutional orders
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="h-5 w-5 text-[#10469B]" />
            <h2 className="text-base font-bold text-[#0B2450]">Automated Admin Alerts</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer py-1 border-b border-slate-50">
              <div>
                <span className="block text-sm font-semibold text-slate-800">New Institutional Order Alerts</span>
                <span className="text-xs text-slate-500">Send instant email & SMS notifications to dispatch team</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.newOrders}
                onChange={(e) => setNotifications({ ...notifications, newOrders: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-[#10469B] focus:ring-[#10469B]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1 border-b border-slate-50">
              <div>
                <span className="block text-sm font-semibold text-slate-800">Warehouse Low Stock Warnings</span>
                <span className="text-xs text-slate-500">Trigger alert when heating coils or machines fall below reorder point</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.lowStock}
                onChange={(e) => setNotifications({ ...notifications, lowStock: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-[#10469B] focus:ring-[#10469B]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <div>
                <span className="block text-sm font-semibold text-slate-800">Service Request Escalations</span>
                <span className="text-xs text-slate-500">Alert service managers for high-priority campus breakdown tickets</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.serviceTickets}
                onChange={(e) => setNotifications({ ...notifications, serviceTickets: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-[#10469B] focus:ring-[#10469B]"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-[#10469B] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#0B2450] transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
