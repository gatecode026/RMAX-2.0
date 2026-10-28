"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  Phone,
  Mail,
  Building2,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";

interface QuotationItem {
  _id: string;
  quoteNumber: string;
  organizationName: string;
  institutionType?: string;
  contactPerson: string;
  email: string;
  phone: string;
  preferredModel?: string;
  quantity?: number;
  expectedDailyUsage?: string;
  deliveryCityPostal?: string;
  useCase?: string;
  status: string;
  createdAt: string;
}

export default function ManagerQuotationsPage() {
  const [quotes, setQuotes] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [callModal, setCallModal] = useState<{
    open: boolean;
    quote: QuotationItem | null;
  }>({ open: false, quote: null });

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/quotations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuotations();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchQuotations]);

  const cleanPhone = (p: string) => p.replace(/[^0-9]/g, "");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 uppercase">
            <Clock className="size-3" /> New
          </span>
        );
      case "in_review":
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 uppercase">
            <AlertCircle className="size-3" /> In Review
          </span>
        );
      case "quote_sent":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 uppercase">
            <Mail className="size-3" /> Quote Sent
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 uppercase">
            <CheckCircle2 className="size-3" /> Approved
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700 uppercase">
            <XCircle className="size-3" /> Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EBF4] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#10469B] uppercase tracking-wider">
            Live Website Quotations
          </span>
          <h1 className="font-jakarta text-2xl font-bold text-slate-900 mt-1">
            Website Quotation Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct real-time institutional quote requests from the RMAX website with instant client dialing options.
          </p>
        </div>
        <button
          onClick={fetchQuotations}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#10469B]" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EBF4] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organization, contact person, phone..."
            className="w-full h-10 rounded-xl border border-slate-200 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#10469B] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-700 focus:border-[#10469B] focus:outline-none bg-white cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in_review">In Review</option>
            <option value="quote_sent">Quote Sent</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="rounded-2xl border border-[#E5EBF4] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#F8FAFC] border-b border-[#E5EBF4] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Quote #</th>
                <th className="py-3.5 px-3">Organization &amp; Client</th>
                <th className="py-3.5 px-3">Requirement</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 pr-5 text-right">Direct Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto size-6 animate-spin text-[#10469B] mb-2" />
                    Loading quotations...
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote._id} className="hover:bg-[#F4F7FC]/50 transition-colors">
                    {/* Quote Number */}
                    <td className="py-3.5 pl-5 pr-3">
                      <span className="font-mono text-[11px] font-bold text-[#10469B]">
                        {quote.quoteNumber}
                      </span>
                    </td>

                    {/* Organization & Contact */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-[13px]">
                          {quote.organizationName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-700">{quote.contactPerson}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <Phone className="size-3 text-slate-400" />
                            {quote.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Requirement */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">
                          {quote.preferredModel || "Standard Incinerator"} ({quote.quantity || 1} units)
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5">
                          Daily Usage: {quote.expectedDailyUsage || "Standard"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">{getStatusBadge(quote.status)}</td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-slate-500 font-medium">
                      {new Date(quote.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Direct Action: Call & WhatsApp */}
                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${quote.phone}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-xs transition cursor-pointer"
                          title={`Direct Call: ${quote.phone}`}
                        >
                          <Phone className="size-3" />
                          Call Client
                        </a>

                        <button
                          type="button"
                          onClick={() => setCallModal({ open: true, quote })}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call & Client Detail Modal */}
      {callModal.open && callModal.quote && (
        <div
          className="fixed inset-0 z-50 bg-[#0A214B]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setCallModal({ open: false, quote: null })}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-7 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#10469B]">
                  {callModal.quote.quoteNumber}
                </span>
                <h3 className="font-jakarta text-lg font-bold text-slate-900 mt-0.5">
                  {callModal.quote.organizationName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCallModal({ open: false, quote: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="rounded-xl bg-[#F8FAFC] p-3.5 space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Person:</span>
                  <span className="font-bold text-slate-900">{callModal.quote.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone Number:</span>
                  <span className="font-mono font-bold text-emerald-700">{callModal.quote.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-800">{callModal.quote.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Preferred Model:</span>
                  <span className="font-bold text-slate-900">
                    {callModal.quote.preferredModel || "Pro-Max Incinerator"} ({callModal.quote.quantity || 1} units)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Daily Disposal Usage:</span>
                  <span className="text-slate-800">{callModal.quote.expectedDailyUsage || "Standard"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Location:</span>
                  <span className="text-slate-800">{callModal.quote.deliveryCityPostal || "India"}</span>
                </div>
              </div>

              {callModal.quote.useCase && (
                <div className="rounded-xl bg-blue-50/60 p-3 border border-blue-100 text-blue-900">
                  <span className="font-bold block mb-1">Requirement Notes:</span>
                  <p className="text-[11px] leading-relaxed text-blue-800">{callModal.quote.useCase}</p>
                </div>
              )}

              {/* Call Action Panel */}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`tel:${callModal.quote.phone}`}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Phone className="size-4" />
                  Dial {callModal.quote.phone} Directly
                </a>

                <a
                  href={`https://wa.me/${cleanPhone(callModal.quote.phone)}?text=${encodeURIComponent(
                    `Hello ${callModal.quote.contactPerson}, I am reaching out from RMAX Solutions regarding your quotation request #${callModal.quote.quoteNumber} for ${callModal.quote.organizationName}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-10 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <MessageSquare className="size-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
