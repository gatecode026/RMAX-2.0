"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Calendar,
  Building2,
  Phone,
  Mail,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  UserCheck,
  RefreshCw,
  Plus,
  MessageSquare,
  FileText,
  X,
} from "lucide-react";

interface ManagerOption {
  _id: string;
  name: string;
  email: string;
}

interface LeadActivity {
  action: string;
  performedByName: string;
  timestamp: string;
  notes?: string;
}

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
  assignedManager?: {
    _id: string;
    name: string;
    email: string;
  };
  estimatedValue?: number;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  createdAt: string;
  notes?: string;
  activities?: LeadActivity[];
}

export default function SuperAdminLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [reassignModalLead, setReassignModalLead] = useState<LeadItem | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // New Lead form
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    institutionName: "",
    institutionType: "School",
    source: "website",
    priority: "medium",
    assignedManagerId: "",
    estimatedValue: "",
    nextFollowUpAt: "",
    notes: "",
  });

  // Note/Activity form for selected lead
  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Fetch managers for assignment dropdowns
  const fetchManagers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/managers");
      if (res.ok) {
        const data = await res.json();
        setManagers(data.managers || []);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Fetch leads with active filters
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (managerFilter !== "all") params.set("managerId", managerFilter);
      if (unassignedOnly) params.set("unassigned", "true");

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch {
      // Offline/error
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, managerFilter, unassignedOnly]);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timeout);
  }, [fetchLeads]);

  // Handle Lead Creation
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.phone) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLead,
          estimatedValue: newLead.estimatedValue ? Number(newLead.estimatedValue) : undefined,
          assignedManagerId: newLead.assignedManagerId || undefined,
          nextFollowUpAt: newLead.nextFollowUpAt || undefined,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewLead({
          name: "",
          email: "",
          phone: "",
          institutionName: "",
          institutionType: "School",
          source: "website",
          priority: "medium",
          assignedManagerId: "",
          estimatedValue: "",
          nextFollowUpAt: "",
          notes: "",
        });
        fetchLeads();
      }
    } catch {
      // Error
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Lead Reassignment
  const handleReassign = async () => {
    if (!reassignModalLead) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${reassignModalLead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedManagerId: selectedManagerId || null }),
      });
      if (res.ok) {
        setReassignModalLead(null);
        setSelectedManagerId("");
        fetchLeads();
      }
    } catch {
      // Error
    } finally {
      setActionLoading(false);
    }
  };

  // Add Note / Activity to Selected Lead
  const handleAddNote = async () => {
    if (!selectedLead || !newNote.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${selectedLead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedLead(updated.lead);
        setNewNote("");
        fetchLeads();
      }
    } catch {
      // Error
    } finally {
      setActionLoading(false);
    }
  };

  // Update Status of Selected Lead
  const handleUpdateStatus = async (status: string) => {
    if (!selectedLead) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${selectedLead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedLead(updated.lead);
        fetchLeads();
      }
    } catch {
      // Error
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = [
      "Lead ID",
      "Name",
      "Institution",
      "Phone",
      "Email",
      "Status",
      "Priority",
      "Assigned Manager",
      "Next Follow Up",
      "Created At",
    ];

    const rows = leads.map((l) => [
      l.leadNumber,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.institutionName || "").replace(/"/g, '""')}"`,
      l.phone,
      l.email || "",
      l.status,
      l.priority,
      `"${(l.assignedManager?.name || "Unassigned").replace(/"/g, '""')}"`,
      l.nextFollowUpAt ? new Date(l.nextFollowUpAt).toLocaleDateString() : "",
      new Date(l.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rmax-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics overview
  const totalCount = leads.length;
  const newCount = leads.filter((l) => l.status === "new").length;
  const contactedCount = leads.filter((l) => l.status === "contacted").length;
  const qualifiedCount = leads.filter((l) => l.status === "qualified").length;
  const convertedCount = leads.filter((l) => l.status === "converted").length;
  const overdueCount = leads.filter((l) => {
    if (!l.nextFollowUpAt || l.status === "converted" || l.status === "lost") return false;
    return new Date(l.nextFollowUpAt) < new Date();
  }).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Global Lead Pipeline & Management"
        subtitle="Full organizational visibility across leads, assignments, follow-ups, and conversion tracking."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Leads" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              disabled={leads.length === 0}
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
              Create Lead
            </button>
          </div>
        }
      />

      {/* KPI Metric Chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Leads</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 font-jakarta">{totalCount}</p>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">New Enquiries</p>
          <p className="mt-1 text-2xl font-bold text-blue-600 font-jakarta">{newCount}</p>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">In Contact</p>
          <p className="mt-1 text-2xl font-bold text-amber-600 font-jakarta">{contactedCount}</p>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-purple-500 uppercase tracking-wider">Qualified</p>
          <p className="mt-1 text-2xl font-bold text-purple-600 font-jakarta">{qualifiedCount}</p>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wider">Converted</p>
          <p className="mt-1 text-2xl font-bold text-green-700 font-jakarta">{convertedCount}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/40 p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">Overdue Alerts</p>
          <p className="mt-1 text-2xl font-bold text-red-600 font-jakarta">{overdueCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EBF4] bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, institution, phone..."
              className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
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

          {/* Priority Filter */}
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

          {/* Manager Filter */}
          <select
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Managers</option>
            {managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Unassigned Toggle */}
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unassignedOnly}
              onChange={(e) => setUnassignedOnly(e.target.checked)}
              className="size-3.5 rounded-sm border-slate-300 text-[#10469B] focus:ring-[#10469B]"
            />
            Unassigned Only
          </label>
        </div>

        <button
          onClick={fetchLeads}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#10469B]" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5EBF4] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Lead ID & Info</th>
                <th className="py-3.5 px-3">Institution</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-3">Assigned Manager</th>
                <th className="py-3.5 px-3">Next Follow-Up</th>
                <th className="py-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto size-6 animate-spin text-[#10469B] mb-2" />
                    Loading leads pipeline...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No leads found matching the selected filters.
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
                      {/* Lead Number + Contact */}
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

                      {/* Assigned Manager */}
                      <td className="py-3.5 px-3">
                        {lead.assignedManager ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex size-6 items-center justify-center rounded-full bg-[#10469B]/10 text-[10px] font-bold text-[#10469B]">
                              {lead.assignedManager.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800">
                              {lead.assignedManager.name}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReassignModalLead(lead);
                              setSelectedManagerId("");
                            }}
                            className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition"
                          >
                            <UserPlus className="size-3" />
                            Assign
                          </button>
                        )}
                      </td>

                      {/* Next Follow-Up */}
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
                      <td className="py-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setReassignModalLead(lead);
                              setSelectedManagerId(lead.assignedManager?._id || "");
                            }}
                            title="Reassign Lead"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          >
                            <UserCheck className="size-4" />
                          </button>
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#10469B]/10 px-2.5 py-1 text-[11px] font-bold text-[#10469B] hover:bg-[#10469B]/20 transition"
                          >
                            View
                            <ChevronRight className="size-3" />
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

      {/* Reassign Modal */}
      {reassignModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-jakarta text-base font-bold text-slate-900">
                  Assign / Reassign Lead
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {reassignModalLead.leadNumber} — {reassignModalLead.name}
                </p>
              </div>
              <button
                onClick={() => setReassignModalLead(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Assigned Manager
                </label>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                >
                  <option value="">-- Unassigned --</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignModalLead(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReassign}
                  disabled={actionLoading}
                  className="rounded-xl bg-[#10469B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Confirm Assignment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-jakarta text-base font-bold text-slate-900">
                Create New Lead
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Verma"
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="rajesh@institution.org"
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    value={newLead.institutionName}
                    onChange={(e) => setNewLead({ ...newLead, institutionName: e.target.value })}
                    placeholder="e.g. DPS International School"
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institution Type
                  </label>
                  <select
                    value={newLead.institutionType}
                    onChange={(e) => setNewLead({ ...newLead, institutionType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  >
                    <option value="School">School</option>
                    <option value="College/University">College/University</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Corporate Office">Corporate Office</option>
                    <option value="Government Body">Government Body</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lead Source
                  </label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  >
                    <option value="website">Website Enquiry</option>
                    <option value="phone">Direct Phone Call</option>
                    <option value="referral">Referral / Word of Mouth</option>
                    <option value="field_visit">Field Visit / Expo</option>
                    <option value="tender">Institutional Tender</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newLead.priority}
                    onChange={(e) => setNewLead({ ...newLead, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assign Manager
                  </label>
                  <select
                    value={newLead.assignedManagerId}
                    onChange={(e) => setNewLead({ ...newLead, assignedManagerId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  >
                    <option value="">-- Unassigned --</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={newLead.nextFollowUpAt}
                    onChange={(e) => setNewLead({ ...newLead, nextFollowUpAt: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Notes / Requirements
                </label>
                <textarea
                  rows={2}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="e.g. Interested in 5 units of Pro-Max incinerator for girl hostels..."
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
                  disabled={actionLoading}
                  className="rounded-xl bg-[#10469B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50"
                >
                  {actionLoading ? "Creating..." : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Lead Drawer / Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="h-full w-full max-w-lg bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[#10469B]">
                    {selectedLead.leadNumber}
                  </span>
                  <h3 className="font-jakarta text-lg font-bold text-slate-900 mt-0.5">
                    {selectedLead.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedLead.institutionName || "Individual Enquiry"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Status Bar */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {["new", "contacted", "qualified", "proposal_sent", "converted", "lost"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition ${
                        selectedLead.status === st
                          ? "bg-[#10469B] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  )
                )}
              </div>

              {/* Lead Details */}
              <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-[#F4F7FC]/50 p-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-800">{selectedLead.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{selectedLead.email || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source:</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedLead.source}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Priority:</span>
                  <span className="font-semibold text-slate-800 uppercase">
                    {selectedLead.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Manager:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedLead.assignedManager?.name || "Unassigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Follow-Up:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedLead.nextFollowUpAt
                      ? new Date(selectedLead.nextFollowUpAt).toLocaleDateString()
                      : "Not Scheduled"}
                  </span>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="mt-6">
                <h4 className="font-jakarta text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Activity & Audit Trail
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {selectedLead.activities && selectedLead.activities.length > 0 ? (
                    selectedLead.activities.map((act, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-100 bg-white p-3 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-700 capitalize">
                            {act.action.replace("_", " ")}
                          </span>
                          <span>{new Date(act.timestamp).toLocaleString()}</span>
                        </div>
                        {act.notes && <p className="mt-1 text-slate-600">{act.notes}</p>}
                        <span className="mt-1 block text-[10px] text-slate-400 font-medium">
                          By: {act.performedByName}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No recorded activity yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Add Note */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Add Note or Call Log
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record summary of discussion..."
                  className="flex-1 rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                />
                <button
                  onClick={handleAddNote}
                  disabled={actionLoading || !newNote.trim()}
                  className="rounded-xl bg-[#10469B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
