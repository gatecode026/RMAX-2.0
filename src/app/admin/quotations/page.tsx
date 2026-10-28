"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { useToast } from "@/components/ui/Toast";
import {
  Search,
  Plus,
  RefreshCw,
  Download,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  Eye,
  Trash2,
  Save,
  Send,
  XCircle,
  Users,
  CheckSquare,
  Square,
  AlertTriangle,
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
  const toast = useToast();

  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // SweetAlert modal state
  const [sweetAlert, setSweetAlert] = useState<{
    open: boolean;
    title: string;
    message: string;
    detail?: string;
    confirmText?: string;
    confirmType?: "danger" | "primary";
    actionLoading?: boolean;
    onConfirm: () => Promise<void>;
  } | null>(null);

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
        setErrorMessage(
          errData.error || "Failed to load quotations. Please ensure you are logged in as an Administrator."
        );
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

  // Clean up selection when quotes change
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => quotes.some((q) => q._id === id)));
  }, [quotes]);

  const allVisibleSelected = useMemo(() => {
    if (quotes.length === 0) return false;
    return quotes.every((q) => selectedIds.includes(q._id));
  }, [quotes, selectedIds]);

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(quotes.map((q) => q._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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
        toast.success("Quotation Saved", "Quotation updated and saved to database!");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Save Failed", err.error || "Could not update quotation.");
      }
    } catch {
      toast.error("Network Error", "Failed to save quotation changes.");
    } finally {
      setSavingAction(false);
    }
  };

  // 1. Single quotation delete with SweetAlert
  const triggerDeleteSingle = (quote: QuoteItem) => {
    const quoteCode = quote.quoteNumber || `QT-${quote._id.slice(-4).toUpperCase()}`;
    setSweetAlert({
      open: true,
      title: "Delete Quotation?",
      message: `Are you sure you want to delete quotation ${quoteCode} for "${quote.organizationName}"?`,
      detail: "This action cannot be undone and will permanently remove this record.",
      confirmText: "Yes, Delete It",
      confirmType: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/quotations/${quote._id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            toast.success("Deleted Successfully", `Quotation ${quoteCode} has been removed.`);
            if (selectedQuote?._id === quote._id) setSelectedQuote(null);
            setSelectedIds((prev) => prev.filter((id) => id !== quote._id));
            fetchQuotes();
          } else {
            const err = await res.json().catch(() => ({}));
            toast.error("Delete Failed", err.error || "Could not delete quotation.");
          }
        } catch {
          toast.error("Error", "Network error while deleting quotation.");
        }
      },
    });
  };

  // 2. Multiple / Bulk Delete with SweetAlert
  const triggerDeleteMultiple = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    setSweetAlert({
      open: true,
      title: `Delete ${count} Quotation${count > 1 ? "s" : ""}?`,
      message: `You are about to permanently delete ${count} selected quotation request${
        count > 1 ? "s" : ""
      } from the database.`,
      detail: "All selected quotes and their negotiation histories will be removed.",
      confirmText: `Yes, Delete All (${count})`,
      confirmType: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/quotations", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds }),
          });

          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            toast.success(
              "Bulk Deletion Complete",
              data.message || `Successfully removed ${count} quotation(s).`
            );
            setSelectedIds([]);
            if (selectedQuote && selectedIds.includes(selectedQuote._id)) {
              setSelectedQuote(null);
            }
            fetchQuotes();
          } else {
            toast.error("Bulk Delete Failed", data.error || "Could not complete bulk deletion.");
          }
        } catch {
          toast.error("Error", "Network error during bulk deletion.");
        }
      },
    });
  };

  // 3. Delete all quotations of a specific user with SweetAlert
  const triggerDeleteUserQuotes = (email: string, contactPerson?: string) => {
    if (!email) return;
    const userQuotesCount = quotes.filter(
      (q) => q.email.toLowerCase().trim() === email.toLowerCase().trim()
    ).length;

    setSweetAlert({
      open: true,
      title: "Delete All Quotes for this User?",
      message: `Are you sure you want to delete ALL quotation requests submitted by "${
        contactPerson || email
      }" (${email})?`,
      detail: `This will remove all current and historical quotation records associated with ${email} (${
        userQuotesCount > 0 ? `${userQuotesCount} visible on page` : "all user quotes"
      }).`,
      confirmText: `Yes, Delete All for ${email}`,
      confirmType: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/quotations", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail: email }),
          });

          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            toast.success(
              "User Quotes Deleted",
              data.message || `Deleted all quotations for ${email}.`
            );
            if (
              selectedQuote &&
              selectedQuote.email.toLowerCase().trim() === email.toLowerCase().trim()
            ) {
              setSelectedQuote(null);
            }
            setSelectedIds([]);
            fetchQuotes();
          } else {
            toast.error("Deletion Failed", data.error || "Could not delete user quotations.");
          }
        } catch {
          toast.error("Error", "Network error while deleting user quotations.");
        }
      },
    });
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
        toast.success("Quotation Created", "New quotation request saved to database!");
        fetchQuotes();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Creation Failed", err.error || "Could not create quotation.");
      }
    } catch {
      toast.error("Network Error", "Failed to create quotation.");
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
    toast.info("Export Started", "Downloading quotations as CSV.");
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

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-30 flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50/95 px-5 py-3 shadow-lg backdrop-blur-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-rose-600 font-mono text-xs font-bold text-white">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-rose-950">
              Quotation{selectedIds.length > 1 ? "s" : ""} selected for bulk action
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition"
            >
              Clear Selection
            </button>
            <button
              onClick={triggerDeleteMultiple}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition"
            >
              <Trash2 className="size-3.5" />
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Quotations Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5EBF4] bg-white shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1050px] text-left text-xs text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                {/* Select All Checkbox */}
                <th className="py-3.5 pl-4 pr-2 w-10 text-center whitespace-nowrap">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-700 transition"
                    title={allVisibleSelected ? "Deselect All" : "Select All"}
                    aria-label="Toggle select all"
                  >
                    {allVisibleSelected && quotes.length > 0 ? (
                      <CheckSquare className="size-4 text-[#10469B]" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 pl-2 pr-4 whitespace-nowrap">Quote # & Date</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Organization</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Contact Person & User</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Product Model</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Quantity</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Quoted Amount</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 pr-5 pl-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 whitespace-nowrap">
                    <RefreshCw className="mx-auto size-6 animate-spin text-[#10469B] mb-2" />
                    Loading quotations from database...
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 whitespace-nowrap">
                    No quotations found in database matching this criteria.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => {
                  const quoteId = quote.quoteNumber || `QT-${quote._id.slice(-4).toUpperCase()}`;
                  const isSelected = selectedIds.includes(quote._id);

                  return (
                    <tr
                      key={quote._id}
                      className={`transition-colors ${
                        isSelected ? "bg-blue-50/60" : "hover:bg-[#F4F7FC]/50"
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td className="py-3.5 pl-4 pr-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => toggleSelectOne(quote._id)}
                          className="text-slate-400 hover:text-[#10469B] transition"
                          aria-label={`Select quotation ${quoteId}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="size-4 text-[#10469B]" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </button>
                      </td>

                      {/* Quote # + Date (Single line) */}
                      <td className="py-3.5 pl-2 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#10469B]">
                            {quoteId}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            •{" "}
                            {new Date(quote.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Organization (Single line) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-xs">
                            {quote.organizationName}
                          </span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {quote.institutionType}
                          </span>
                        </div>
                      </td>

                      {/* Contact Person & Email (Single line) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-slate-800">{quote.contactPerson}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-mono text-[11px]" title={quote.email}>
                            {quote.email}
                          </span>
                          {quote.phone && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400 text-[11px]">{quote.phone}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Product Model */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold uppercase text-[11px] text-[#10469B]">
                          {quote.preferredModel}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 font-jakarta whitespace-nowrap">
                        {quote.quantity} units
                      </td>

                      {/* Quoted Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {quote.quotedAmount ? (
                          <span className="font-mono text-xs font-bold text-slate-900">
                            ₹{quote.quotedAmount.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not Quoted Yet</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(quote.status)}</td>

                      {/* Actions */}
                      <td className="py-3.5 pr-5 pl-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Review Detail */}
                          <button
                            onClick={() => handleOpenDetail(quote)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#10469B]/10 px-2.5 py-1 text-[11px] font-bold text-[#10469B] hover:bg-[#10469B]/20 transition"
                            title="Review and Edit Quotation"
                          >
                            <Eye className="size-3" />
                            Review
                          </button>

                          {/* Delete All Quotes by this User */}
                          <button
                            onClick={() => triggerDeleteUserQuotes(quote.email, quote.contactPerson)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-700 transition"
                            title={`Delete ALL quotations from user: ${quote.email}`}
                          >
                            <Users className="size-3.5" />
                          </button>

                          {/* Delete This Single Quote */}
                          <button
                            onClick={() => triggerDeleteSingle(quote)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete this quotation"
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

      {/* SweetAlert Custom Modal */}
      {sweetAlert && sweetAlert.open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            {/* Animated Warning Icon */}
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-inner">
              <AlertTriangle className="size-8 stroke-[2.2] animate-bounce" />
            </div>

            <div className="mt-4 text-center">
              <h3 className="font-jakarta text-lg font-extrabold text-slate-900">
                {sweetAlert.title}
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                {sweetAlert.message}
              </p>
              {sweetAlert.detail && (
                <p className="mt-2 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 border border-slate-100 leading-normal">
                  {sweetAlert.detail}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSweetAlert(null)}
                disabled={sweetAlert.actionLoading}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sweetAlert.actionLoading}
                onClick={async () => {
                  setSweetAlert((prev) => (prev ? { ...prev, actionLoading: true } : null));
                  try {
                    await sweetAlert.onConfirm();
                  } finally {
                    setSweetAlert(null);
                  }
                }}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50 ${
                  sweetAlert.confirmType === "danger"
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                    : "bg-[#10469B] hover:bg-[#0B2450] shadow-blue-600/20"
                }`}
              >
                {sweetAlert.actionLoading && (
                  <RefreshCw className="size-3.5 animate-spin text-white" />
                )}
                {sweetAlert.confirmText || "Yes, Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

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

              {/* Actions Footer */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerDeleteSingle(selectedQuote)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="size-3.5" /> Delete Quotation
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      triggerDeleteUserQuotes(selectedQuote.email, selectedQuote.contactPerson)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition"
                  >
                    <Users className="size-3.5" /> Delete All Quotes from this User
                  </button>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedQuote(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
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
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
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
