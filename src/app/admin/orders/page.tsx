"use client";

import React, { useState } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import {
  Search,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import { DEFAULT_RECENT_ORDERS, AdminOrder } from "@/lib/admin/types";

const EXTENDED_ORDERS: AdminOrder[] = [
  ...DEFAULT_RECENT_ORDERS,
  {
    id: "ord-1518",
    orderNumber: "#1518",
    customerName: "Sanjay Singhal",
    institution: "St. Xavier's Senior Secondary School",
    product: "Pro-Max",
    productSlug: "pro-max",
    amount: 6500,
    status: "Delivered",
    date: "21 Oct 2026",
    createdAt: "2026-10-21T11:20:00Z",
  },
  {
    id: "ord-1517",
    orderNumber: "#1517",
    customerName: "Dr. Sunita Patel",
    institution: "LifeLine Multi-Specialty Clinic",
    product: "Pro",
    productSlug: "pro",
    amount: 4500,
    status: "Shipped",
    date: "20 Oct 2026",
    createdAt: "2026-10-20T14:45:00Z",
  },
  {
    id: "ord-1516",
    orderNumber: "#1516",
    customerName: "Rakesh Bansal",
    institution: "Government Girls College, Kota",
    product: "Basic",
    productSlug: "basic",
    amount: 3000,
    status: "Processing",
    date: "19 Oct 2026",
    createdAt: "2026-10-19T08:15:00Z",
  },
];

export default function AdminOrdersPage() {
  const [orders] = useState<AdminOrder[]>(EXTENDED_ORDERS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const tabs = ["All", "Delivered", "Shipped", "Processing", "Cancelled"];

  const filtered = orders.filter((o) => {
    const matchesTab = activeTab === "All" || o.status === activeTab;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.institution.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: AdminOrder["status"]) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Delivered
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#10469B]">
            <Truck className="h-3 w-3" />
            Shipped
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer Name", "Institution", "Product", "Amount (INR)", "Status", "Date"];
    const rows = filtered.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.customerName}"`,
      `"${o.institution}"`,
      `"${o.product}"`,
      o.amount,
      `"${o.status}"`,
      `"${o.date}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rmax-orders-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        subtitle="Track institutional purchases, shipments, dispatch statuses, and payment amounts."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Orders" },
        ]}
        actions={
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export CSV
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer, institution..."
            className="w-full rounded-lg border border-slate-200 bg-[#F4F7FC]/50 pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-[#10469B] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#10469B] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Order #</th>
                <th className="px-3 py-3.5">Customer / Institution</th>
                <th className="px-3 py-3.5">Product</th>
                <th className="px-3 py-3.5">Amount</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-3 py-3.5">Date</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-5 pr-3 whitespace-nowrap font-semibold text-slate-800">
                      <Link
                        href={`/admin/orders/${order.orderNumber.replace("#", "")}`}
                        className="hover:text-[#10469B] transition-colors"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="font-medium text-slate-800">{order.institution}</div>
                      <div className="text-xs text-slate-400">{order.customerName}</div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap font-medium text-slate-700">
                      {order.product}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap font-semibold text-slate-900">
                      ₹{order.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {order.date}
                    </td>
                    <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Quick View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/orders/${order.orderNumber.replace("#", "")}`}
                          className="rounded-md px-2.5 py-1 text-xs font-semibold text-[#10469B] hover:bg-blue-50 transition-colors"
                        >
                          Details →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Order {selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-400">Placed on {selectedOrder.date}</p>
              </div>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="rounded-lg bg-[#F4F7FC]/70 p-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Institution & Contact
                </div>
                <div className="font-semibold text-slate-800">{selectedOrder.institution}</div>
                <div className="text-xs text-slate-600">Contact: {selectedOrder.customerName}</div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-slate-600">Product Model:</span>
                <span className="font-semibold text-slate-800">{selectedOrder.product}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Order Total:</span>
                <span className="text-base font-bold text-[#10469B]">₹{selectedOrder.amount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <Link
                href={`/admin/orders/${selectedOrder.orderNumber.replace("#", "")}`}
                className="rounded-lg bg-[#10469B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2450] transition-colors"
              >
                Full Order View
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
