"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, SlidersHorizontal, Search, Mail, Phone, Eye, Download, UserPlus, X, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

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
  lastActiveAt: string;
  /** true = account holder; false = contact who only sent a quotation request */
  registered: boolean;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedCust, setSelectedCust] = useState<CustomerItem | null>(null);

  // New Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCust, setNewCust] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    type: "School",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const types = ["All", "School", "Hospital", "College", "Workplace", "Individual"];

  // Filters (every one maps to a column of the table)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [orgFilter, setOrgFilter] = useState("All");
  const [account, setAccount] = useState<"all" | "registered" | "quote">("all");
  const [activity, setActivity] = useState<"all" | "active" | "none">("all");
  const [ordersMin, setOrdersMin] = useState("");
  const [ordersMax, setOrdersMax] = useState("");
  const [valueMin, setValueMin] = useState("");
  const [valueMax, setValueMax] = useState("");
  const [period, setPeriod] = useState<"all" | "today" | "7" | "30" | "90" | "custom">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  type SortKey = "name" | "organization" | "type" | "ordersCount" | "totalSpent" | "lastActiveAt";
  const [sortKey, setSortKey] = useState<SortKey>("lastActiveAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [clock, setClock] = useState(() => Date.now()); // refreshed whenever the period filter changes

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const { success, error } = useToast();

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.email) {
      setErrorMsg("Name and Email are required");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCust),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create customer");
        error("Creation Failed", data.error || "Failed to create customer");
        setSubmitting(false);
        return;
      }

      setShowAddModal(false);
      setNewCust({ name: "", email: "", phone: "", organization: "", type: "School" });
      success("Customer Created", `${newCust.name} has been added to the database.`);
      fetchCustomers();
    } catch {
      setErrorMsg("Network error creating customer");
      error("Network Error", "Unable to create customer at this time.");
    } finally {
      setSubmitting(false);
    }
  };

  const organizations = useMemo(() => ["All", ...Array.from(new Set(customers.map((c) => c.organization))).sort((a, b) => a.localeCompare(b))], [customers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    const [oMin, oMax, vMin, vMax] = [num(ordersMin), num(ordersMax), num(valueMin), num(valueMax)];
    const now = clock;
    const DAY = 86_400_000;
    const startOfToday = new Date(clock).setHours(0, 0, 0, 0);
    const from = period === "custom" && dateFrom ? new Date(dateFrom + "T00:00:00").getTime() : null;
    const to = period === "custom" && dateTo ? new Date(dateTo + "T23:59:59.999").getTime() : null;

    const list = customers.filter((c) => {
      if (filterType !== "All" && c.type.toLowerCase() !== filterType.toLowerCase()) return false;
      if (orgFilter !== "All" && c.organization !== orgFilter) return false;
      if (account !== "all" && (account === "registered") !== c.registered) return false;
      if (activity === "active" && c.ordersCount === 0) return false;
      if (activity === "none" && c.ordersCount > 0) return false;
      if (oMin !== null && c.ordersCount < oMin) return false;
      if (oMax !== null && c.ordersCount > oMax) return false;
      if (vMin !== null && c.totalSpent < vMin) return false;
      if (vMax !== null && c.totalSpent > vMax) return false;
      const t = new Date(c.lastActiveAt).getTime();
      if (period === "today" && t < startOfToday) return false;
      if ((period === "7" || period === "30" || period === "90") && t < now - Number(period) * DAY) return false;
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      if (q) {
        const hay = [c.name, c.organization, c.email, c.phone, c.id.slice(-6), c.type].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      const av = sortKey === "lastActiveAt" ? new Date(a.lastActiveAt).getTime() : a[sortKey];
      const bv = sortKey === "lastActiveAt" ? new Date(b.lastActiveAt).getTime() : b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [customers, search, filterType, orgFilter, account, activity, ordersMin, ordersMax, valueMin, valueMax, period, dateFrom, dateTo, sortKey, sortDir, clock]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const typeCount = (t: string) => customers.filter((c) => t === "All" || c.type.toLowerCase() === t.toLowerCase()).length;

  // Removable chips for every active filter
  const activeFilters: { label: string; clear: () => void }[] = [];
  if (filterType !== "All") activeFilters.push({ label: "Type: " + filterType, clear: () => setFilterType("All") });
  if (orgFilter !== "All") activeFilters.push({ label: "Organization: " + orgFilter, clear: () => setOrgFilter("All") });
  if (account !== "all") activeFilters.push({ label: account === "registered" ? "Registered accounts" : "Quote contacts only", clear: () => setAccount("all") });
  if (activity !== "all") activeFilters.push({ label: activity === "active" ? "Has quotes / orders" : "No quotes / orders", clear: () => setActivity("all") });
  if (ordersMin || ordersMax) activeFilters.push({ label: "Quotes / orders: " + (ordersMin || "0") + "–" + (ordersMax || "∞"), clear: () => { setOrdersMin(""); setOrdersMax(""); } });
  if (valueMin || valueMax) activeFilters.push({ label: "Value: ₹" + (valueMin || "0") + " – " + (valueMax ? "₹" + valueMax : "∞"), clear: () => { setValueMin(""); setValueMax(""); } });
  if (period !== "all") {
    const label = period === "today" ? "Active today" : period === "custom" ? "Active " + (dateFrom || "…") + " → " + (dateTo || "…") : "Active in last " + period + " days";
    activeFilters.push({ label, clear: () => { setPeriod("all"); setDateFrom(""); setDateTo(""); } });
  }
  if (search.trim()) activeFilters.push({ label: "Search: “" + search.trim() + "”", clear: () => setSearch("") });
  const clearAll = () => {
    setSearch(""); setFilterType("All"); setOrgFilter("All"); setAccount("all"); setActivity("all");
    setOrdersMin(""); setOrdersMax(""); setValueMin(""); setValueMax(""); setPeriod("all"); setDateFrom(""); setDateTo(""); setPage(1);
  };
  const advancedCount = [orgFilter !== "All", account !== "all", activity !== "all", ordersMin || ordersMax, valueMin || valueMax, period !== "all"].filter(Boolean).length;

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "name" || key === "organization" || key === "type" ? "asc" : "desc"); }
    setPage(1);
  };
  const sortIcon = (key: SortKey) =>
    key !== sortKey ? <ArrowUpDown className="size-3 opacity-40" /> : sortDir === "asc" ? <ArrowUp className="size-3 text-[#10469B]" /> : <ArrowDown className="size-3 text-[#10469B]" />;
  const sortTh = (k: SortKey, label: string, className = "") => (
    <th key={k} className={"px-5 py-3.5 " + className} aria-sort={k === sortKey ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => toggleSort(k)} className="inline-flex items-center gap-1.5 uppercase tracking-wider hover:text-[#10469B]">
        {label} {sortIcon(k)}
      </button>
    </th>
  );
  const fieldCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#10469B] focus:outline-none";
  const labelCls = "mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500";

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Customer Name", "Organization", "Type", "Email", "Phone", "Orders", "Total Spent", "Last Active"];
    const rows = filtered.map((c) => [
      `"${c.name}"`,
      `"${c.organization}"`,
      `"${c.type}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      c.ordersCount,
      c.totalSpent,
      `"${c.lastActive}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rmax-customers-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        subtitle="Manage institutional buyers, representatives, quote history, and account activity directly from MongoDB."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Customers" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <Download className="size-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#10469B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0B2450] transition"
            >
              <UserPlus className="size-4" />
              Add Customer
            </button>
          </div>
        }
      />

      {/* Search and Filters */}
      <div className="mb-6 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, organization, email, phone, ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              aria-label="Search customers"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-[#10469B] focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => { setFilterType(t); setPage(1); }}
                aria-pressed={filterType === t}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filterType === t ? "bg-[#10469B] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t}
                <span className={`rounded-full px-1.5 text-[10px] ${filterType === t ? "bg-white/20" : "bg-white text-slate-500"}`}>{typeCount(t)}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
              className={`ml-1 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                showAdvanced || advancedCount ? "border-[#10469B] bg-[#10469B]/5 text-[#10469B]" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="size-3.5" /> More filters
              {advancedCount > 0 && <span className="rounded-full bg-[#10469B] px-1.5 text-[10px] text-white">{advancedCount}</span>}
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="mt-4 grid gap-4 border-t border-[#F0F3F9] pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelCls} htmlFor="f-org">Organization</label>
              <select id="f-org" className={fieldCls} value={orgFilter} onChange={(e) => { setOrgFilter(e.target.value); setPage(1); }}>
                {organizations.map((o) => <option key={o} value={o}>{o === "All" ? "All organizations" : o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="f-account">Account</label>
              <select id="f-account" className={fieldCls} value={account} onChange={(e) => { setAccount(e.target.value as typeof account); setPage(1); }}>
                <option value="all">All contacts</option>
                <option value="registered">Registered accounts</option>
                <option value="quote">Quote contacts only</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="f-activity">Quotes / orders</label>
              <select id="f-activity" className={fieldCls} value={activity} onChange={(e) => { setActivity(e.target.value as typeof activity); setPage(1); }}>
                <option value="all">Any</option>
                <option value="active">Has quotes or orders</option>
                <option value="none">None yet</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="f-period">Last active</label>
              <select id="f-period" className={fieldCls} value={period} onChange={(e) => { setPeriod(e.target.value as typeof period); setClock(Date.now()); setPage(1); }}>
                <option value="all">Any time</option>
                <option value="today">Today</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="custom">Custom range…</option>
              </select>
            </div>
            <div>
              <span className={labelCls}>Number of quotes / orders</span>
              <div className="flex items-center gap-2">
                <input type="number" min={0} inputMode="numeric" placeholder="Min" aria-label="Minimum quotes or orders" className={fieldCls} value={ordersMin} onChange={(e) => { setOrdersMin(e.target.value); setPage(1); }} />
                <span className="text-slate-400">–</span>
                <input type="number" min={0} inputMode="numeric" placeholder="Max" aria-label="Maximum quotes or orders" className={fieldCls} value={ordersMax} onChange={(e) => { setOrdersMax(e.target.value); setPage(1); }} />
              </div>
            </div>
            <div>
              <span className={labelCls}>Total value (₹)</span>
              <div className="flex items-center gap-2">
                <input type="number" min={0} inputMode="numeric" placeholder="Min" aria-label="Minimum total value" className={fieldCls} value={valueMin} onChange={(e) => { setValueMin(e.target.value); setPage(1); }} />
                <span className="text-slate-400">–</span>
                <input type="number" min={0} inputMode="numeric" placeholder="Max" aria-label="Maximum total value" className={fieldCls} value={valueMax} onChange={(e) => { setValueMax(e.target.value); setPage(1); }} />
              </div>
            </div>
            {period === "custom" && (
              <div className="sm:col-span-2">
                <span className={labelCls}>Active between</span>
                <div className="flex items-center gap-2">
                  <input type="date" aria-label="Active from" className={fieldCls} value={dateFrom} max={dateTo || undefined} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
                  <span className="text-slate-400">to</span>
                  <input type="date" aria-label="Active until" className={fieldCls} value={dateTo} min={dateFrom || undefined} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600" role="status">
            Showing {filtered.length} of {customers.length} customers
          </span>
          {activeFilters.map((f) => (
            <button key={f.label} type="button" onClick={() => { f.clear(); setPage(1); }} className="inline-flex items-center gap-1 rounded-full bg-[#10469B]/10 px-2.5 py-1 font-semibold text-[#10469B] hover:bg-[#10469B]/20" aria-label={"Remove filter " + f.label}>
              {f.label} <X className="size-3" />
            </button>
          ))}
          {activeFilters.length > 0 && (
            <button type="button" onClick={clearAll} className="font-semibold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm font-medium text-slate-500">
            Loading customers from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-base font-bold text-slate-700">{customers.length > 0 ? "No customers match these filters" : "No Customers Found"}</p>
            <p className="mt-1 text-sm text-slate-400">
              {customers.length > 0 ? "Try removing a filter or widening the range." : "Customers who register on the website or submit institutional quote requests will be listed here."}
            </p>
            {customers.length > 0 && (
              <button onClick={clearAll} className="mt-4 mr-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                Clear all filters
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B2450]"
            >
              <UserPlus className="size-3.5" />
              Add Customer Manually
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <thead className="whitespace-nowrap border-b border-[#E5EBF4] bg-[#F8FAFC] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  {sortTh("name", "Customer Name")}
                  {sortTh("organization", "Organization")}
                  {sortTh("type", "Type")}
                  <th className="px-5 py-3.5">Contact Details</th>
                  {sortTh("ordersCount", "Quotes / Orders", "text-center")}
                  {sortTh("totalSpent", "Total Value")}
                  {sortTh("lastActiveAt", "Last Active")}
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF4]">
                {paged.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EBF2FC] text-xs font-bold text-[#10469B]">
                          {c.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0B2450]">{c.name}</div>
                          <div className="text-xs text-slate-400">ID: {c.id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{c.organization}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {c.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {c.email}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-slate-500">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {c.phone}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-slate-700">{c.ordersCount}</td>
                    <td className="px-5 py-4 font-bold text-[#0B2450]">
                      ₹{c.totalSpent.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{c.lastActive}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedCust(c)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[#E5EBF4] px-5 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <label htmlFor="page-size">Rows per page</label>
              <select id="page-size" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-[#10469B] focus:outline-none">
                {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page" className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                <ChevronLeft className="size-4" />
              </button>
              <span className="px-2 font-semibold text-slate-700">Page {currentPage} of {totalPages}</span>
              <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page" className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-jakarta text-lg font-bold text-slate-900">Add Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="size-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddCustomer} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Customer / Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Balbir Singhania"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  placeholder="e.g. principal@school.org"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  placeholder="+91 94140 00000"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={newCust.organization}
                    onChange={(e) => setNewCust({ ...newCust, organization: e.target.value })}
                    placeholder="e.g. Singhania School"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Institution Type
                  </label>
                  <select
                    value={newCust.type}
                    onChange={(e) => setNewCust({ ...newCust, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none bg-white"
                  >
                    <option value="School">School</option>
                    <option value="Hospital">Hospital</option>
                    <option value="College">College</option>
                    <option value="Workplace">Workplace</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#10469B] px-5 py-2 text-xs font-bold text-white hover:bg-[#0B2450] disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2FC] text-base font-bold text-[#10469B]">
                  {selectedCust.initials}
                </div>
                <div>
                  <h3 className="font-jakarta text-lg font-bold text-slate-900">{selectedCust.name}</h3>
                  <p className="text-xs text-slate-500">{selectedCust.organization}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCust(null)} className="text-gray-400 hover:text-gray-600">
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-50 py-2">
                <span className="text-slate-500">Institution Type</span>
                <span className="font-semibold text-slate-800">{selectedCust.type}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 py-2">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-800">{selectedCust.email}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 py-2">
                <span className="text-slate-500">Phone</span>
                <span className="font-semibold text-slate-800">{selectedCust.phone}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 py-2">
                <span className="text-slate-500">Quotes & Orders</span>
                <span className="font-bold text-[#10469B]">{selectedCust.ordersCount}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 py-2">
                <span className="text-slate-500">Total Value</span>
                <span className="font-bold text-emerald-600">₹{selectedCust.totalSpent.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Last Active</span>
                <span className="font-semibold text-slate-800">{selectedCust.lastActive}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCust(null)}
                className="rounded-xl bg-[#0B2450] px-5 py-2 text-xs font-bold text-white hover:bg-[#10469B]"
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
