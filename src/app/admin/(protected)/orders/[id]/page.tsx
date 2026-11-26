"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2, Loader2, Mail, MapPin, Phone, Printer } from "lucide-react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatINR } from "@/lib/format";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/enums";
import { STATUS_LABEL, STATUS_STYLE } from "@/lib/admin/order-ui";

interface AdminOrder {
  _id: string;
  reference: string;
  contact: { fullName: string; email: string; phone: string };
  items: { slug: string; title: string; variantLabel?: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: { organization: string; department?: string; street: string; line2?: string; city: string; state: string; postalCode: string; country: string; notes?: string };
  billing: { sameAsShipping: boolean; organization: string; poReference?: string };
  payment: { method: string; status: string };
  status: OrderStatus;
  timeline: { step: OrderStatus; at?: string }[];
  createdAt: string;
}

/** Order detail: customer, address, items, payment and the tracking timeline the customer sees. */
export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { success, error } = useToast();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Order not found");
      setOrder(json.order);
    } catch (e) {
      setFailed(e instanceof Error ? e.message : "Failed to load order");
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function changeStatus(next: OrderStatus) {
    if (!order || next === order.status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");
      setOrder(json.order);
      success("Order updated", `${order.reference} is now ${STATUS_LABEL[next]}. The customer sees this in order tracking.`);
    } catch (e) {
      error("Could not update order", e instanceof Error ? e.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  if (failed) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-700">
        {failed}
        <div className="mt-3"><Link href="/admin/orders" className="text-[#10469B] hover:underline">Back to Orders</Link></div>
      </div>
    );
  }
  if (!order) {
    return <div className="flex min-h-[300px] items-center justify-center text-slate-400"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading order…</div>;
  }

  // Older orders may lack some sub-documents; fall back to empty values.
  const a = order.shippingAddress ?? ({} as AdminOrder["shippingAddress"]);
  const contact = order.contact ?? { fullName: "—", email: "", phone: "" };
  const payment = order.payment ?? { method: "—", status: "" };
  const billing = order.billing ?? { sameAsShipping: true, organization: "" };
  const items = order.items ?? [];
  const timeline = order.timeline ?? [];
  return (
    <div>
      <AdminPageHeader
        title={`Order ${order.reference}`}
        subtitle={`Placed ${formatDate(order.createdAt)} · manage the delivery status the customer sees in tracking.`}
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Orders", href: "/admin/orders" }, { label: order.reference }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Printer className="h-4 w-4" /> Print
            </button>
            <Link href="/admin/orders" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-[#E5EBF4] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450]">Items</h2>
            <ul className="mt-3 divide-y divide-[#E5EBF4]">
              {items.map((i) => (
                <li key={i.slug} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-800">{i.title}</p>
                    {i.variantLabel && <p className="text-xs text-slate-500">{i.variantLabel}</p>}
                    <p className="text-xs text-slate-500">{formatINR(i.unitPrice)} × {i.quantity}</p>
                  </div>
                  <p className="font-semibold text-slate-800">{formatINR(i.unitPrice * i.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-[#E5EBF4] pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd>{order.shipping ? formatINR(order.shipping) : "Free"}</dd></div>
              <div className="flex justify-between text-base font-bold text-[#0B2450]"><dt>Total (excl. GST)</dt><dd>{formatINR(order.total)}</dd></div>
            </dl>
          </section>

          <section className="rounded-xl border border-[#E5EBF4] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450]">Order tracking</h2>
            <ol className="mt-4 space-y-4">
              {ORDER_STATUSES.map((s) => {
                const step = timeline.find((t) => t.step === s);
                const done = Boolean(step?.at);
                return (
                  <li key={s} className="flex items-start gap-3">
                    <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${done ? "text-emerald-600" : "text-slate-300"}`} />
                    <div>
                      <p className={`text-sm font-semibold ${done ? "text-slate-800" : "text-slate-400"}`}>{STATUS_LABEL[s]}</p>
                      <p className="text-xs text-slate-500">{done ? formatDate(step!.at!) : "Pending"}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-[#E5EBF4] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450]">Status</h2>
            <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={saving || s === order.status}
                  onClick={() => changeStatus(s)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Mark {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#E5EBF4] bg-white p-5 text-sm shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450]">Customer</h2>
            <p className="mt-3 font-semibold text-slate-800">{contact.fullName}</p>
            <p className="mt-2 flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4 text-slate-400" /> {contact.email}</p>
            <p className="mt-1 flex items-center gap-2 text-slate-600"><Phone className="h-4 w-4 text-slate-400" /> {contact.phone}</p>
          </section>

          <section className="rounded-xl border border-[#E5EBF4] bg-white p-5 text-sm shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450]">Delivery address</h2>
            <p className="mt-3 flex items-start gap-2 text-slate-600">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>{a.organization}{a.department ? ` · ${a.department}` : ""}</span>
            </p>
            <p className="mt-1 flex items-start gap-2 text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>{[a.street, a.line2, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(", ")}</span>
            </p>
            {a.notes && <p className="mt-2 text-xs text-slate-500">Note: {a.notes}</p>}
          </section>

          <section className="rounded-xl border border-[#E5EBF4] bg-white p-5 text-sm shadow-sm">
            <h2 className="text-base font-bold text-[#0B2450]">Payment & billing</h2>
            <p className="mt-3 text-slate-600">{payment.method}</p>
            <p className="mt-1 text-slate-600">Billing: {billing.sameAsShipping ? "same as delivery" : billing.organization}</p>
            {billing.poReference && <p className="mt-1 text-slate-600">PO: {billing.poReference}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
