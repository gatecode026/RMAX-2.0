"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import {
  Search,
  Plus,
  RefreshCw,
  Download,
  Calendar,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  FileText,
  X,
  AlertCircle,
  Eye,
  Trash2,
  Save,
  ChevronRight,
  ShieldCheck,
  Send,
  XCircle,
} from "lucide-react";

interface QuoteItem {
  _id: string;
  quoteNumber?: string;
  organizationName: string;
  institutionType: string;
  contactPerson: string;
  role?: string;
  email: string;
  phone?: string;
  preferredModel: string;
  quantity: number;
  expectedDailyUsage?: string;
  deliveryCityPostal?: string;
  useCase?: string;
  installationRequirements?: string;
  status: "new" | "in_review" | "quote_sent" | "approved" | "declined" | "closed" | "contacted";
  quotedAmount?: number;
  notes?: string;
  assignedManagerName?: string;
  createdAt: string;
}

const TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "New Requests" },
  { key: "in_review", label: "Under Review" },
  { key: "quote_sent", label: "Quote Sent" },
  { key: "approved", label: "Approved" },
  { key: "declined", label: "Declined" },
];

export default function AdminQuotationsPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Detail / Edit modal
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null);
  const [editStatus, setEditStatus] = useState<QuoteItem["status"]>("new");
  const [editAmount, setEditAmount] = useState<number | string>("");
  const [editNotes, setEditNotes] = useState("");
  const [savingAction, setSavingAction] = useState(false);

  // Create Quote modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuote, setNewQuote] = useState({
    organizationName: "",
    institutionType: "Schools",
    contactPerson: "",
    role: "",
    email: "",
    phone: "",
    preferredModel: "pro-max",
    quantity: 1,
    expectedDailyUsage: "50-100 pads",
    deliveryCityPostal: "",
    quotedAmount: "",
    notes: "",
  });

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeTab !== "all") params.set("status", activeTab);

      const res = await fetch(`/api/admin/quotations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(errData.error || "Failed to load quotations. Please ensure you are logged in as an Administrator.");
      }
    } catch {
      setErrorMessage("Network error: Could not reach the server to load quotations.");
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuotes();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchQuotes]);

  const handleOpenDetail = (quote: QuoteItem) => {
    setSelectedQuote(quote);
    setEditStatus(quote.status);
    setEditAmount(quote.quotedAmount ?? "");
    setEditNotes(quote.notes || "");
  };

  const handleSaveDetail = async () => {
    if (!selectedQuote) return;
    setSavingAction(true);
    try {
      const res = await fetch(`/api/admin/quotations/${selectedQuote._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          quotedAmount: editAmount ? Number(editAmount) : 0,
          notes: editNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedQuote(data.quote);
        fetchQuotes();
        alert("Quotation updated and saved to database!");
      }
    } catch {
      alert("Failed to save changes.");
    } finally {
      setSavingAction(false);
    }
  };

  const handleDelete = async (quote: QuoteItem) => {
    if (!confirm(`Are you sure you want to delete quotation for ${quote.organizationName}?`)) return;
    try {
      const res = await fetch(`/api/admin/quotations/${quote._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (selectedQuote?._id === quote._id) setSelectedQuote(null);
        fetchQuotes();
      }
    } catch {
      alert("Failed to delete quotation.");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.organizationName || !newQuote.contactPerson || !newQuote.email) return;
    setSavingAction(true);
    try {
      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuote),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewQuote({
          organizationName: "",
          institutionType: "Schools",
          contactPerson: "",
          role: "",
          email: "",
          phone: "",
          preferredModel: "pro-max",
          quantity: 1,
          expectedDailyUsage: "50-100 pads",
          deliveryCityPostal: "",
          quotedAmount: "",
          notes: "",
        });
        fetchQuotes();
      }
    } catch {
      alert("Failed to create quotation.");
    } finally {
      setSavingAction(false);
    }
  };

  const handleExportCSV = () => {
    if (quotes.length === 0) return;
    const headers = [
      "Quote #",
      "Organization",
      "Institution Type",
      "Contact Person",
      "Email",
      "Phone",
      "Model",
      "Quantity",
      "Quoted Price",
      "Status",
      "Date",
    ];

    const rows = quotes.map((q) => [
      q.quoteNumber || q._id.slice(-6).toUpperCase(),
      `"${q.organizationName.replace(/"/g, '""')}"`,
      q.institutionType,
      `"${q.contactPerson.replace(/"/g, '""')}"`,
      q.email,
      q.phone || "",
      q.preferredModel,
      q.quantity,
      q.quotedAmount || 0,
      q.status,
      new Date(q.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rmax-quotations-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: QuoteItem["status"]) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#10469B]">
            <Clock className="size-3" />
            New Request
          </span>
        );
      case "in_review":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            <Clock className="size-3" />
            In Review
          </span>
        );
      case "quote_sent":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
            <Send className="size-3" />
            Quote Sent
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="size-3" />
            Approved
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
            <XCircle className="size-3" />
            Declined
          </span>
        );
      case "closed":
      case "contacted":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Institutional Quotations"
        subtitle="Manage official quotation requests, estimate pricing, and track client proposal approvals."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Quotations" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={quotes.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <Download className="size-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#10469B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0B2450] transition"
            >
              <Plus className="size-4" />
              New Quotation
            </button>
          </div>
        }
      />

      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-amber-600 shrink-0" />
            <p className="text-sm font-medium text-amber-900">{errorMessage}</p>
          </div>
          <a
            href="/admin/login"
            className="shrink-0 rounded-lg bg-[#10469B] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0B2450] transition"
          >
            Log In as Admin
          </a>
        </div>
      )}

      {/* Filter and Search Bar matching Website Quote Style */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5EBF4] bg-white p-4 shadow-xs">
        {/* Top: Search + Refresh */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by quote #, organization, contact person, model..."
              className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500">
              {quotes.length} quotations found
            </span>
            <button
              onClick={fetchQuotes}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#10469B]" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Bottom: Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === tab.key
                  ? "bg-[#10469B] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5EBF4] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Quote # & Date</th>
                <th className="py-3.5 px-3">Organization</th>
                <th className="py-3.5 px-3">Contact Person</th>
                <th className="py-3.5 px-3">Product Model</th>
                <th className="py-3.5 px-3">Quantity</th>
                <th className="py-3.5 px-3">Quoted Amount</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto size-6 animate-spin text-[#10469B] mb-2" />
                    Loading quotations from database...
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No quotations found in database matching this criteria.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => {
                  const quoteId = quote.quoteNumber || `QT-${quote._id.slice(-4).toUpperCase()}`;

                  return (
                    <tr key={quote._id} className="hover:bg-[#F4F7FC]/50 transition-colors">
                      {/* Quote # + Date */}
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-[11px] font-bold text-[#10469B]">
                            {quoteId}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(quote.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="py-3.5 px-3">
                        <div>
                          <p className="font-semibold text-slate-900 text-[13px]">
                            {quote.organizationName}
                          </p>
                          <span className="inline-block mt-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {quote.institutionType}
                          </span>
                        </div>
                      </td>

                      {/* Contact Person */}
                      <td className="py-3.5 px-3">
                        <div>
                          <p className="font-medium text-slate-800">{quote.contactPerson}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            {quote.phone && <span>{quote.phone}</span>}
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{quote.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Product Model */}
                      <td className="py-3.5 px-3">
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold uppercase text-[11px] text-[#10469B]">
                          {quote.preferredModel}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-3 font-semibold text-slate-800 font-jakarta">
                        {quote.quantity} units
                      </td>

                      {/* Quoted Amount */}
                      <td className="py-3.5 px-3">
                        {quote.quotedAmount ? (
                          <span className="font-mono text-[13px] font-bold text-slate-900">
                            ₹{quote.quotedAmount.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not Quoted Yet</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">{getStatusBadge(quote.status)}</td>

                      {/* Actions */}
                      <td className="py-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(quote)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#10469B]/10 px-2.5 py-1 text-[11px] font-bold text-[#10469B] hover:bg-[#10469B]/20 transition"
                          >
                            <Eye className="size-3" />
                            Review
                          </button>
                          <button
                            onClick={() => handleDelete(quote)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete Quotation"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Edit Quotation Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#10469B]">
                  {selectedQuote.quoteNumber || `QT-${selectedQuote._id.slice(-4).toUpperCase()}`}
                </span>
                <h3 className="font-jakarta text-lg font-bold text-slate-900 mt-0.5">
                  {selectedQuote.organizationName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedQuote.institutionType} • Requested on{" "}
                  {new Date(selectedQuote.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Quote Requirement Specs */}
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs">
              <div>
                <span className="text-slate-400">Contact Person:</span>
                <p className="font-bold text-slate-800">{selectedQuote.contactPerson}</p>
                {selectedQuote.role && (
                  <p className="text-[11px] text-slate-500">{selectedQuote.role}</p>
                )}
              </div>
              <div>
                <span className="text-slate-400">Phone & Email:</span>
                <p className="font-bold text-slate-800">{selectedQuote.phone || "—"}</p>
                <p className="text-[11px] text-[#10469B]">{selectedQuote.email}</p>
              </div>
              <div>
                <span className="text-slate-400">Selected Product Model:</span>
                <p className="font-bold text-slate-800 capitalize">
                  {selectedQuote.preferredModel} ({selectedQuote.quantity} Units)
                </p>
              </div>
              <div>
                <span className="text-slate-400">Daily Disposal Usage:</span>
                <p className="font-bold text-slate-800">
                  {selectedQuote.expectedDailyUsage || "Standard"}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Delivery City / PIN:</span>
                <p className="font-bold text-slate-800">
                  {selectedQuote.deliveryCityPostal || "Not specified"}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Installation Notes:</span>
                <p className="font-bold text-slate-800">
                  {selectedQuote.installationRequirements || "Standard electrical setup"}
                </p>
              </div>
            </div>

            {/* Action Form (Directly updates MongoDB) */}
            <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
              <h4 className="font-jakarta text-xs font-bold text-slate-800 uppercase tracking-wider">
                Official Proposal & Action
              </h4>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quotation Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as QuoteItem["status"])}
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  >
                    <option value="new">New Request</option>
                    <option value="in_review">Under Review</option>
                    <option value="quote_sent">Quote Sent to Client</option>
                    <option value="approved">Approved & Accepted</option>
                    <option value="declined">Declined</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quoted Total Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="e.g. 52000"
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Proposal Notes / Discussion Summary
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record quotation pricing breakdown, delivery terms, or manager comments..."
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedQuote)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline"
                >
                  <Trash2 className="size-3.5" /> Delete Quotation
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQuote(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDetail}
                    disabled={savingAction}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#10469B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50 transition"
                  >
                    <Save className="size-3.5" />
                    {savingAction ? "Saving..." : "Save Quotation"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Quotation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-jakarta text-base font-bold text-slate-900">
                Create Institutional Quotation
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization / Institution *
                  </label>
                  <input
                    type="text"
                    required
                    value={newQuote.organizationName}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, organizationName: e.target.value })
                    }
                    placeholder="e.g. Cambridge School"
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institution Category
                  </label>
                  <select
                    value={newQuote.institutionType}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, institutionType: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  >
                    <option value="Schools">Schools</option>
                    <option value="Offices">Offices</option>
                    <option value="Hospitals">Hospitals</option>
                    <option value="Hostels">Hostels</option>
                    <option value="Public washrooms">Public washrooms</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={newQuote.contactPerson}
                    onChange={(e) => setNewQuote({ ...newQuote, contactPerson: e.target.value })}
                    placeholder="Dr. Suman"
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newQuote.email}
                    onChange={(e) => setNewQuote({ ...newQuote, email: e.target.value })}
                    placeholder="principal@school.org"
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newQuote.phone}
                    onChange={(e) => setNewQuote({ ...newQuote, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Model *
                  </label>
                  <select
                    value={newQuote.preferredModel}
                    onChange={(e) => setNewQuote({ ...newQuote, preferredModel: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  >
                    <option value="basic">Napkin Incinerator Basic</option>
                    <option value="pro">Napkin Incinerator Pro</option>
                    <option value="pro-max">Napkin Incinerator Pro-Max</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newQuote.quantity}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, quantity: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newQuote.quotedAmount}
                    onChange={(e) => setNewQuote({ ...newQuote, quotedAmount: e.target.value })}
                    placeholder="e.g. 45000"
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Location (City / PIN)
                </label>
                <input
                  type="text"
                  value={newQuote.deliveryCityPostal}
                  onChange={(e) =>
                    setNewQuote({ ...newQuote, deliveryCityPostal: e.target.value })
                  }
                  placeholder="Jaipur, Rajasthan - 302020"
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={newQuote.notes}
                  onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                  placeholder="Add quotation details or requirements..."
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="rounded-xl bg-[#10469B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50 transition"
                >
                  {savingAction ? "Saving..." : "Save to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
