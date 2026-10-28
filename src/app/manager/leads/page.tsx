"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpDown,
} from "lucide-react";

interface LeadItem {
  _id: string;
  leadNumber: string;
  name: string;
  email: string;
  phone: string;
  institutionName?: string;
  institutionType?: string;
  source: string;
  status: string;
  priority: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  createdAt: string;
}

export default function ManagerLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timeout);
  }, [fetchLeads]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EBF4] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#10469B] uppercase tracking-wider">
            Assigned Leads Portfolio
          </span>
          <h1 className="font-jakarta text-2xl font-bold text-slate-900 mt-1">
            My Leads Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your assigned client records, lead progression, customer calls, and scheduling.
          </p>
        </div>
        <button
          onClick={fetchLeads}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#10469B]" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EBF4] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, institution, phone..."
              className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <span className="text-xs font-medium text-slate-400">
          Showing {leads.length} assigned leads
        </span>
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5EBF4] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Lead ID & Client</th>
                <th className="py-3.5 px-3">Institution</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-3">Last Contacted</th>
                <th className="py-3.5 px-3">Next Follow-Up</th>
                <th className="py-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto size-6 animate-spin text-[#10469B] mb-2" />
                    Loading your leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No leads assigned yet.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isOverdue =
                    lead.nextFollowUpAt &&
                    lead.status !== "converted" &&
                    lead.status !== "lost" &&
                    new Date(lead.nextFollowUpAt) < new Date();

                  return (
                    <tr key={lead._id} className="hover:bg-[#F4F7FC]/50 transition-colors">
                      {/* ID + Contact */}
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-[11px] font-bold text-[#10469B]">
                            {lead.leadNumber}
                          </span>
                          <span className="font-semibold text-slate-900 text-[13px] mt-0.5">
                            {lead.name}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Phone className="size-3 text-slate-400" />
                              {lead.phone}
                            </span>
                            {lead.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="size-3 text-slate-400" />
                                {lead.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Institution */}
                      <td className="py-3.5 px-3">
                        {lead.institutionName ? (
                          <div>
                            <p className="font-medium text-slate-800">{lead.institutionName}</p>
                            <span className="inline-block mt-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {lead.institutionType || "Institution"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Individual</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                            lead.status === "new"
                              ? "bg-blue-50 text-blue-700"
                              : lead.status === "contacted"
                              ? "bg-amber-50 text-amber-700"
                              : lead.status === "qualified"
                              ? "bg-purple-50 text-purple-700"
                              : lead.status === "converted"
                              ? "bg-green-50 text-green-700"
                              : lead.status === "lost"
                              ? "bg-red-50 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {lead.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            lead.priority === "urgent"
                              ? "bg-red-100 text-red-800 font-extrabold"
                              : lead.priority === "high"
                              ? "bg-amber-100 text-amber-800"
                              : lead.priority === "medium"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {lead.priority}
                        </span>
                      </td>

                      {/* Last Contacted */}
                      <td className="py-3.5 px-3">
                        {lead.lastContactedAt ? (
                          <span className="text-slate-700 font-medium">
                            {new Date(lead.lastContactedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Never</span>
                        )}
                      </td>

                      {/* Next Follow Up */}
                      <td className="py-3.5 px-3">
                        {lead.nextFollowUpAt ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar
                              className={`size-3.5 ${
                                isOverdue ? "text-red-500" : "text-slate-400"
                              }`}
                            />
                            <div>
                              <p
                                className={`font-semibold ${
                                  isOverdue ? "text-red-600" : "text-slate-700"
                                }`}
                              >
                                {new Date(lead.nextFollowUpAt).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              {isOverdue && (
                                <span className="inline-block rounded-xs bg-red-100 px-1 text-[9px] font-bold text-red-700">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-xs transition"
                              title={`Direct Call: ${lead.phone}`}
                            >
                              <Phone className="size-3" />
                              Call
                            </a>
                          )}
                          <Link
                            href={`/manager/leads/${lead._id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#10469B] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#0B2450] shadow-xs transition"
                          >
                            Manage
                            <ChevronRight className="size-3" />
                          </Link>
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
    </div>
  );
}
