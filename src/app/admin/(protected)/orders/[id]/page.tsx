"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "1523";

  const [currentStatus, setCurrentStatus] = useState<"Processing" | "Shipped" | "Delivered" | "Cancelled">("Delivered");
  const [updateSaved, setUpdateSaved] = useState(false);

  const handleStatusChange = (status: "Processing" | "Shipped" | "Delivered" | "Cancelled") => {
    setCurrentStatus(status);
    setUpdateSaved(true);
    setTimeout(() => setUpdateSaved(false), 2500);
  };

  const steps = [
    { label: "Order Placed", date: "24 Oct 2026, 10:30 AM", done: true },
    { label: "Processing & QC", date: "24 Oct 2026, 02:15 PM", done: true },
    { label: "Dispatched / Shipped", date: "25 Oct 2026, 09:00 AM", done: currentStatus === "Shipped" || currentStatus === "Delivered" },
    { label: "Delivered & Inspected", date: "25 Oct 2026, 04:45 PM", done: currentStatus === "Delivered" },
  ];

  return (
    <div>
      <AdminPageHeader
        title={`Order #${orderId}`}
        subtitle="Manage dispatch, invoice generation, status pipeline, and delivery confirmation."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Orders", href: "/admin/orders" },
          { label: `#${orderId}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </button>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        }
      />

      {updateSaved && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          Order status updated to {currentStatus}. Notifications sent to customer.
        </div>
      )}

      {/* Progress Tracker */}
      <div className="mb-6 rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Fulfillment Pipeline</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-3">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step.done
                    ? "bg-[#10469B] text-white"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {step.done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
              </div>
              <div>
                <div className={`text-sm font-semibold ${step.done ? "text-slate-800" : "text-slate-400"}`}>
                  {step.label}
                </div>
                <div className="text-xs text-slate-400">{step.done ? step.date : "Pending"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Order Items & Pricing */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items Table */}
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450] mb-4">Ordered Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-[#E5EBF4] bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 pl-3 pr-3">Item</th>
                    <th className="px-3 py-3">Specs</th>
                    <th className="px-3 py-3">Qty</th>
                    <th className="py-3 pl-3 pr-3 text-right">Price</th>
                    <th className="py-3 pl-3 pr-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3.5 pl-3 pr-3 font-semibold text-slate-800">
                      RMAX Napkin Incinerator (Pro-Max)
                    </td>
                    <td className="px-3 py-3.5 text-xs text-slate-500">
                      1200W • 10kg • 400-500/day
                    </td>
                    <td className="px-3 py-3.5 font-medium text-slate-700">1</td>
                    <td className="py-3.5 pl-3 pr-3 text-right font-medium text-slate-700">₹6,500</td>
                    <td className="py-3.5 pl-3 pr-3 text-right font-semibold text-slate-900">₹6,500</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Price Calculations */}
            <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end">
              <div className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-medium text-slate-700">₹6,500</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping:</span>
                  <span className="font-medium text-emerald-600">Free PAN-India</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18% inclusive):</span>
                  <span className="font-medium text-slate-700">₹991.53</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                  <span>Total Amount:</span>
                  <span className="text-[#10469B]">₹6,500</span>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Shipping Details */}
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450] mb-4">Delivery & Institutional Address</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Building2 className="h-4 w-4 text-[#10469B]" />
                  Singhania School Campus
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Administrative Block, Sector 4, Jawahar Nagar, Jaipur, Rajasthan — 302004</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="font-semibold text-slate-800">Contact Person</div>
                <div className="text-slate-700">Balbir Singhania (Principal)</div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone className="h-3.5 w-3.5" /> +91 94140 55667
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="h-3.5 w-3.5" /> principal@singhaniaschool.org
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Status Updater & Payment Details */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#0B2450]">Update Status</h2>
            <p className="text-xs text-slate-500">
              Change status to update inventory and alert the institutional receiving department.
            </p>

            <div className="space-y-2">
              {(["Processing", "Shipped", "Delivered", "Cancelled"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`w-full flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    currentStatus === st
                      ? "border-[#10469B] bg-blue-50/60 text-[#10469B]"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{st}</span>
                  {currentStatus === st && <CheckCircle2 className="h-4 w-4 text-[#10469B]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm space-y-3 text-sm">
            <h2 className="text-base font-bold text-[#0B2450]">Payment & Verification</h2>
            <div className="flex items-center justify-between text-slate-600">
              <span>Payment Mode:</span>
              <span className="font-semibold text-slate-800">Institutional Net Banking</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Payment Status:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Paid
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>GST Invoice:</span>
              <span className="font-mono text-xs text-slate-700">INV-2026-RMAX-1523</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
