"use client";

import React, { useState } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Search, Mail, Phone, Clock, CheckCircle2, Send } from "lucide-react";
import { DEFAULT_RECENT_ENQUIRIES, AdminEnquiry } from "@/lib/admin/types";

const EXTENDED_ENQUIRIES: AdminEnquiry[] = [
  ...DEFAULT_RECENT_ENQUIRIES,
  {
    id: "enq-005",
    customerName: "Sanjay Singhal",
    initials: "SS",
    institution: "St. Xavier's Senior Secondary School",
    timeAgo: "2 days ago",
    messagePreview: "Requesting formal quotation for 4 units of Pro incinerators with installation in Jaipur campus.",
    status: "in-progress",
    date: "25 Oct 2026",
    email: "admin@stxaviersjaipur.org",
    phone: "+91 94140 88776",
    modelInterest: "Pro (4 units)",
  },
  {
    id: "enq-006",
    customerName: "Dr. Sunita Patel",
    initials: "SP",
    institution: "LifeLine Multi-Specialty Clinic",
    timeAgo: "3 days ago",
    messagePreview: "Inquiring about emission certification and biomedical waste norms compliance for hospital wing.",
    status: "resolved",
    date: "24 Oct 2026",
    email: "compliance@lifelineclinics.in",
    phone: "+91 98220 99001",
    modelInterest: "Pro-Max",
  },
];

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>(EXTENDED_ENQUIRIES);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [activeEnquiry, setActiveEnquiry] = useState<AdminEnquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySent, setReplySent] = useState(false);

  const statuses = ["All", "New", "In-Progress", "Resolved"];

  const filtered = enquiries.filter((enq) => {
    const matchesStatus = filterStatus === "All" || enq.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      enq.customerName.toLowerCase().includes(search.toLowerCase()) ||
      enq.institution.toLowerCase().includes(search.toLowerCase()) ||
      enq.messagePreview.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = (id: string, status: AdminEnquiry["status"]) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    if (activeEnquiry && activeEnquiry.id === id) {
      setActiveEnquiry({ ...activeEnquiry, status });
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeEnquiry) return;

    handleUpdateStatus(activeEnquiry.id, "in-progress");
    setReplySent(true);
    setTimeout(() => {
      setReplySent(false);
      setReplyText("");
      setActiveEnquiry(null);
    }, 1500);
  };

  return (
    <div>
      <AdminPageHeader
        title="Enquiries & Quotes"
        subtitle="Review institutional procurement inquiries, sanitary napkin incinerator quotes, and contact leads."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Enquiries" },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by school, applicant, message..."
            className="w-full rounded-lg border border-slate-200 bg-[#F4F7FC]/50 pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-[#10469B] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStatus === st
                  ? "bg-[#10469B] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="col-span-2 rounded-xl border border-[#E5EBF4] bg-white p-12 text-center text-slate-400">
            No enquiries found matching your search.
          </div>
        ) : (
          filtered.map((enq) => (
            <div
              key={enq.id}
              className="flex flex-col justify-between rounded-xl border border-[#E5EBF4] bg-white p-5 shadow-sm hover:shadow transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-[#10469B] text-xs">
                      {enq.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{enq.customerName}</h3>
                      <div className="text-xs font-medium text-slate-500">{enq.institution}</div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      enq.status === "new"
                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                        : enq.status === "in-progress"
                        ? "bg-blue-50 text-[#10469B]"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        enq.status === "new"
                          ? "bg-emerald-500 animate-pulse"
                          : enq.status === "in-progress"
                          ? "bg-[#10469B]"
                          : "bg-slate-400"
                      }`}
                    />
                    {enq.status}
                  </span>
                </div>

                <div className="my-3.5 rounded-lg bg-[#F4F7FC]/70 p-3 text-sm text-slate-700 leading-relaxed">
                  &ldquo;{enq.messagePreview}&rdquo;
                </div>

                {enq.modelInterest && (
                  <div className="mb-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">Model of Interest:</span> {enq.modelInterest}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {enq.timeAgo}
                </div>

                <button
                  onClick={() => setActiveEnquiry(enq)}
                  className="rounded-lg bg-slate-50 px-3 py-1.5 font-semibold text-[#10469B] hover:bg-blue-50 transition-colors"
                >
                  Reply & Actions →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{activeEnquiry.customerName}</h3>
                <p className="text-xs text-slate-500">{activeEnquiry.institution}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <a
                  href={`mailto:${activeEnquiry.email}`}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  title="Direct Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
                {activeEnquiry.phone && (
                  <a
                    href={`tel:${activeEnquiry.phone}`}
                    className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                    title="Call"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-[#F4F7FC] p-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-900 block mb-1">Original Request:</span>
              {activeEnquiry.messagePreview}
            </div>

            {replySent ? (
              <div className="my-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Official quote response sent to {activeEnquiry.email}!
              </div>
            ) : (
              <form onSubmit={handleSendReply} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Quotation & Follow-up Response
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Dear Principal / Facility Head, Thank you for reaching out to RMAX Solutions regarding our incinerators..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Mark Status:</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(activeEnquiry.id, "resolved")}
                      className={`rounded px-2.5 py-1 text-xs font-semibold ${
                        activeEnquiry.status === "resolved"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Resolved
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveEnquiry(null)}
                      className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#0B2450]"
                    >
                      <Send className="h-4 w-4" />
                      Send Response
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
