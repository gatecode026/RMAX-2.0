"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, RefreshCw, Search } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useManagerPermissions } from "@/components/manager/ManagerPermissionsContext";

interface CustomerItem {
  id: string;
  name: string;
  initials: string;
  organization: string;
  type: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastActive: string;
}

const TYPES = ["School", "Hospital", "College", "Workplace", "Individual"];
const PAGE_SIZE = 20;
const isEditable = (c: CustomerItem) => /^[0-9a-f]{24}$/i.test(c.id); // quote-only contacts are not accounts

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-hidden disabled:opacity-60";

/** Manager → Customers: view the directory; edit registered customers when "Edit customer" is on. */
export default function ManagerCustomersPage() {
  const { success: toastSuccess } = useToast();
  const { customersEdit: canEdit } = useManagerPermissions();

  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<CustomerItem | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", organization: "", type: "Individual" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/customers", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load customers");
      setCustomers(json.customers ?? []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter(
      (c) => (type === "All" || c.type === type) && (!q || `${c.name} ${c.organization} ${c.email} ${c.phone}`.toLowerCase().includes(q)),
    );
  }, [customers, search, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function openEdit(c: CustomerItem) {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone === "—" ? "" : c.phone, organization: c.organization === "Direct Client" ? "" : c.organization, type: TYPES.includes(c.type) ? c.type : "Individual" });
    setFieldErrors({});
    setFormError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || saving) return;
    setSaving(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const res = await fetch(`/api/admin/customers/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFieldErrors(json.fields ?? {});
        setFormError(json.error || "Failed to save customer.");
        return; // keep the dialog open with the typed values
      }
      // Patch just this row: search, type filter and page stay exactly as they were.
      setCustomers((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...json.customer } : c)));
      toastSuccess("Customer updated", `${json.customer.name}'s details were saved.`);
      setEditing(null);
    } catch {
      setFormError("A network error occurred — your changes are still here, please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EBF4] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-0.5 text-xs text-slate-500">{canEdit ? "View and update customer details." : "View customer details."}</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#10469B]" : ""}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EBF4] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, organization, email, phone…"
              className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
            />
          </div>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            aria-label="Customer type"
            className="rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-700 focus:border-[#10469B] focus:outline-hidden"
          >
            {["All", ...TYPES].map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All types" : t}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs font-medium text-slate-400">
          Showing {rows.length} of {filtered.length} customers
        </span>
      </div>

      {loadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{loadError}</p>}

      <div className="overflow-hidden rounded-2xl border border-[#E5EBF4] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Customer</th>
                <th className="px-3 py-3.5">Organization</th>
                <th className="px-3 py-3.5">Type</th>
                <th className="px-3 py-3.5">Contact</th>
                <th className="px-3 py-3.5">Orders / Quotes</th>
                <th className="py-3.5 pr-5 text-right">{canEdit ? "Action" : ""}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto mb-2 size-6 animate-spin text-[#10469B]" /> Loading customers…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    {customers.length ? "No customers match your search." : "No customers yet."}
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-[#F4F7FC]/50">
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#10469B]/10 text-[11px] font-bold text-[#10469B]">{c.initials}</span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-slate-900">{c.name}</p>
                          <p className="truncate text-[11px] text-slate-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-800">{c.organization}</td>
                    <td className="px-3 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{c.type}</span>
                    </td>
                    <td className="px-3 py-3.5">{c.phone}</td>
                    <td className="px-3 py-3.5 font-semibold text-slate-700">{c.ordersCount}</td>
                    <td className="whitespace-nowrap py-3.5 pr-5 text-right">
                      {canEdit &&
                        (isEditable(c) ? (
                          <button
                            onClick={() => openEdit(c)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#10469B] px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition hover:bg-[#0B2450]"
                          >
                            <Pencil className="size-3" /> Edit
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400" title="Quotation contact without an account">
                            No account
                          </span>
                        ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5EBF4] px-4 py-3 text-xs">
            <span className="text-slate-500">
              Page {current} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button disabled={current <= 1} onClick={() => setPage(current - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40">
                Previous
              </button>
              <button disabled={current >= totalPages} onClick={() => setPage(current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs" onClick={() => !saving && setEditing(null)}>
          <form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-label="Edit customer"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="font-jakarta text-base font-bold text-slate-900">Edit customer</h3>
            <p className="mb-4 truncate text-xs text-slate-500">{editing.email}</p>

            <div className="space-y-3.5">
              <div>
                <label htmlFor="cust-name" className="mb-1 block text-xs font-semibold text-slate-700">Name *</label>
                <input id="cust-name" className={inputCls} value={form.name} disabled={saving} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {fieldErrors.name && <p className="mt-1 text-[11px] text-red-600">{fieldErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="cust-org" className="mb-1 block text-xs font-semibold text-slate-700">Organization</label>
                <input id="cust-org" className={inputCls} value={form.organization} disabled={saving} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="cust-phone" className="mb-1 block text-xs font-semibold text-slate-700">Mobile number</label>
                  <input id="cust-phone" inputMode="tel" className={inputCls} value={form.phone} disabled={saving} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  {fieldErrors.phone && <p className="mt-1 text-[11px] text-red-600">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="cust-type" className="mb-1 block text-xs font-semibold text-slate-700">Type</label>
                  <select id="cust-type" className={inputCls} value={form.type} disabled={saving} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {formError && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{formError}</p>}

            <div className="mt-6 flex justify-end gap-2.5">
              <button type="button" onClick={() => setEditing(null)} disabled={saving} className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-[#10469B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50">
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
