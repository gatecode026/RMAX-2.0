"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X, CheckCircle2, Clock, Truck, Ban } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { AdminOrder } from "@/lib/admin/types";

interface RecentOrdersTableProps {
  orders: AdminOrder[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const statusStyles: Record<AdminOrder["status"], { bg: string; text: string; icon: typeof CheckCircle2 }> = {
    Delivered: { bg: "bg-[#E8F8EE]", text: "text-[#16A34A]", icon: CheckCircle2 },
    Shipped: { bg: "bg-[#EBF2FC]", text: "text-[#10469B]", icon: Truck },
    Processing: { bg: "bg-[#FEF4E6]", text: "text-[#D97706]", icon: Clock },
    Cancelled: { bg: "bg-[#FEE2E2]", text: "text-[#DC2626]", icon: Ban },
  };

  return (
    <div className="flex flex-col rounded-2xl border border-[#E5EBF4] bg-white p-5 shadow-[0_2px_12px_rgb(35_42_50/0.03)] sm:p-6">
      {/* Panel Heading & Actions */}
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
        <div>
          <h3 className="font-jakarta text-[16px] font-bold text-[#202A36]">Recent Quotations & Proposals</h3>
        </div>
        <Link
          href="/admin/quotations"
          className="inline-flex items-center gap-1 text-[13px] font-bold text-[#10469B] hover:underline"
        >
          <span>View All</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Table starts immediately below header & divider */}
      <div className="mt-2 w-full overflow-x-auto [scrollbar-width:thin]">
        <table className="w-full text-left border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
              <th scope="col" className="py-2.5 pr-2 font-semibold">#</th>
              <th scope="col" className="py-2.5 px-2 font-semibold">Customer / Institution</th>
              <th scope="col" className="py-2.5 px-2 font-semibold">Product</th>
              <th scope="col" className="py-2.5 px-2 font-semibold">Amount</th>
              <th scope="col" className="py-2.5 px-2 font-semibold">Status</th>
              <th scope="col" className="py-2.5 pl-2 font-semibold text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[#202A36]">
            {orders.slice(0, 5).map((o) => {
              const style = statusStyles[o.status] || statusStyles.Processing;
              return (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="group cursor-pointer transition-colors hover:bg-[#F8FAFC]"
                >
                  <td className="py-3 pr-2 font-bold text-[#718096] whitespace-nowrap">
                    {o.orderNumber}
                  </td>
                  <td className="py-3 px-2 font-semibold">
                    <span className="block text-[#202A36] leading-tight group-hover:text-[#10469B] transition-colors whitespace-nowrap">
                      {o.institution}
                    </span>
                    <span className="block text-[11px] font-normal text-gray-400 mt-0.5 whitespace-nowrap">
                      {o.customerName}
                    </span>
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap font-medium text-gray-700">
                    {o.product}
                  </td>
                  <td className="py-3 px-2 font-bold whitespace-nowrap text-[#202A36] tabular-nums">
                    {formatINR(o.amount)}
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${style.bg} ${style.text}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 pl-2 text-right text-gray-500 whitespace-nowrap text-[11.5px]">
                    {o.date}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[12px] font-bold text-[#10469B]">Order Details</span>
                <h3 className="font-jakarta text-[18px] font-bold text-gray-900">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-[13px]">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#F4F7FC] p-3.5">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Institution</p>
                  <p className="font-bold text-gray-800">{selectedOrder.institution}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Customer</p>
                  <p className="font-semibold text-gray-700">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Item Purchased</p>
                  <p className="font-bold text-[#10469B]">{selectedOrder.product}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Total Amount</p>
                  <p className="font-extrabold text-gray-900">{formatINR(selectedOrder.amount)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Order Date</p>
                  <p className="text-gray-700">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Status</p>
                  <span className="inline-block mt-0.5 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-3 text-[12px] text-gray-600">
                <p><strong>Shipping Status:</strong> Standard Institutional Freight (Delivered with Installation Kit)</p>
                <p className="mt-1"><strong>Invoice Ref:</strong> INV-{selectedOrder.orderNumber.replace("#", "")}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <Link
                href={`/admin/orders/${selectedOrder.orderNumber.replace("#", "")}`}
                className="text-[12px] font-bold text-[#10469B] hover:underline"
              >
                Full Order View →
              </Link>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
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
}
