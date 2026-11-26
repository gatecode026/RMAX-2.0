"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatINR } from "@/lib/format";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/enums";
import { STATUS_LABEL, STATUS_STYLE } from "@/lib/admin/order-ui";

interface AdminOrderRow {
  _id: string;
  reference: string;
  contact: { fullName: string; phone: string };
  shippingAddress: { organization: string; city: string };
  items: { title: string; quantity: number }[];
  total: number;
  payment: { method: string };
  status: OrderStatus;
  createdAt: string;
}

/** Orders management — customer orders live here, separate from Quotations. */
export default function AdminOrdersPage() {
  const { success, error } = useToast();
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), status, ...(debounced ? { search: debounced } : {}) });
      const res = await fetch(`/api/admin/orders?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load orders");
      setOrders(json.orders);
      setCounts(json.counts ?? {});
      setTotalPages(json.totalPages);
      setTotal(json.total);
    } catch (e) {
      error("Could not load orders", e instanceof Error ? e.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [page, status, debounced, error]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(o: AdminOrderRow, next: OrderStatus) {
    const prev = o.status;
    setOrders((l) => l.map((x) => (x._id === o._id ? { ...x, status: next } : x)));
    try {
      const res = await fetch(`/api/admin/orders/${o._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");
      success("Order updated", `${o.reference} is now ${STATUS_LABEL[next]}.`);
      load();
    } catch (e) {
      setOrders((l) => l.map((x) => (x._id === o._id ? { ...x, status: prev } : x)));
      error("Could not update order", e instanceof Error ? e.message : undefined);
    }
  }

  const all = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        subtitle="Customer orders and delivery tracking. Quotation requests are managed separately under Quotations."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Orders" }]}
        actions={
          <Link href="/admin/quotations" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Go to Quotations
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", ...ORDER_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${status === s ? "border-[#10469B] bg-[#10469B] text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            {s === "all" ? "All" : STATUS_LABEL[s]} · {s === "all" ? all : counts[s] ?? 0}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, customer, phone…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#10469B]"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5EBF4]">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading orders…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#0B2450]">{o.reference}</p>
                    <p className="text-xs text-slate-400">{formatDate(o.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{o.contact.fullName}</p>
                    <p className="text-xs text-slate-500">{o.shippingAddress.organization} · {o.shippingAddress.city}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {o.items[0]?.title}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ""} <span className="text-slate-400">× {o.items.reduce((n, i) => n + i.quantity, 0)}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{formatINR(o.total)}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{o.payment.method}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}
                      aria-label={`Status of ${o.reference}`}
                      className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold outline-none ${STATUS_STYLE[o.status]}`}
                    >
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${o._id}`} className="text-sm font-semibold text-[#10469B] hover:underline">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{total} {total === 1 ? "order" : "orders"}</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40">Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
