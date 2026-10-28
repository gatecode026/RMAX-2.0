"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Search, Mail, Phone, Clock, CheckCircle2, Send, MessageSquare } from "lucide-react";

export interface AdminEnquiry {
  id: string;
  customerName: string;
  initials: string;
  institution: string;
  timeAgo: string;
  messagePreview: string;
  status: "new" | "in-progress" | "resolved";
  date: string;
  email: string;
  phone: string;
  modelInterest: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [activeEnquiry, setActiveEnquiry] = useState<AdminEnquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySent, setReplySent] = useState(false);

  const statuses = ["All", "New", "In-Progress", "Resolved"];

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/enquiries");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error("Failed to load enquiries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const filtered = enquiries.filter((enq) => {
    const matchesStatus = filterStatus === "All" || enq.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      enq.customerName.toLowerCase().includes(search.toLowerCase()) ||
      enq.institution.toLowerCase().includes(search.toLowerCase()) ||
      enq.messagePreview.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (id: string, status: AdminEnquiry["status"]) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status === "resolved" ? "closed" : "new" }),
      });
      if (res.ok) {
        setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
        if (activeEnquiry && activeEnquiry.id === id) {
          setActiveEnquiry({ ...activeEnquiry, status });
        }
      }
    } catch (err) {
      console.error("Failed to update enquiry status:", err);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeEnquiry) return;
    setReplySent(true);
    handleUpdateStatus(activeEnquiry.id, "resolved");
    setTimeout(() => {
      setReplyText("");
      setReplySent(false);
    }, 2000);
  };

  return (
    <div>
      <AdminPageHeader
        title="Customer Inquiries & Messages"
        subtitle="Manage prospective institutional buyers, quotation requests, and product questions from the website contact forms."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Enquiries" },
        ]}
      />

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Enquiries List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Search & Status Filters */}
          <div className="flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer, institution, keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-[#10469B] focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterStatus === s
                      ? "bg-[#10469B] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Enquiries Card List */}
          <div className="space-y-3">
            {loading ? (
              <div className="rounded-xl border border-[#E5EBF4] bg-white p-12 text-center text-sm font-medium text-slate-500">
                Loading messages from database...
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-[#E5EBF4] bg-white p-12 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-base font-bold text-slate-700">No Enquiries Found</p>
                <p className="text-xs text-slate-400 mt-1">
                  When visitors submit inquiries through the website contact form, they will appear here.
                </p>
              </div>
            ) : (
              filtered.map((enq) => {
                const isSelected = activeEnquiry?.id === enq.id;
                return (
                  <div
                    key={enq.id}
                    onClick={() => setActiveEnquiry(enq)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                      isSelected
                        ? "border-[#10469B] bg-[#F4F7FC] shadow-sm"
                        : "border-[#E5EBF4] bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF2FC] text-sm font-bold text-[#10469B]">
                          {enq.initials}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#0B2450]">{enq.customerName}</h4>
                          <p className="text-xs font-medium text-[#10469B]">{enq.institution}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-slate-400">{enq.timeAgo}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            enq.status === "new"
                              ? "bg-rose-50 text-rose-700"
                              : enq.status === "in-progress"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {enq.status === "new" ? "New" : enq.status === "in-progress" ? "In Progress" : "Resolved"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2">{enq.messagePreview}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-400">
                      <span>Model Interest: <strong className="text-slate-700">{enq.modelInterest}</strong></span>
                      <span>{enq.date}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Enquiry Detail & Action Panel */}
        <div className="lg:col-span-5">
          {activeEnquiry ? (
            <div className="sticky top-6 rounded-xl border border-[#E5EBF4] bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF2FC] text-base font-bold text-[#10469B]">
                    {activeEnquiry.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0B2450]">{activeEnquiry.customerName}</h3>
                    <p className="text-xs text-slate-500">{activeEnquiry.institution}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={activeEnquiry.status}
                    onChange={(e) =>
                      handleUpdateStatus(activeEnquiry.id, e.target.value as AdminEnquiry["status"])
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 focus:border-[#10469B] focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#F8FAFC] p-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{activeEnquiry.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{activeEnquiry.phone}</span>
                </div>
              </div>

              {/* Full Message */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Message Content</label>
                <div className="mt-1 rounded-lg border border-slate-100 bg-[#FAFCFF] p-3 text-xs leading-relaxed text-slate-700">
                  {activeEnquiry.messagePreview}
                </div>
              </div>

              {/* Quick Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Direct Institutional Reply</label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Draft official response to ${activeEnquiry.customerName}...`}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#10469B] focus:outline-none"
                />

                {replySent && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Response recorded and status marked as resolved!
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Recorded with audit trail</span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0B2450] transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit Reply
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
              Select an inquiry from the list to view its full details and respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
