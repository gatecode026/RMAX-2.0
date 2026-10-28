"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Plus, Search, CheckCircle2, Clock, Calendar, AlertTriangle, User, MapPin, X, AlertCircle } from "lucide-react";

export interface ServiceRequestItem {
  _id?: string;
  id?: string;
  ticketId: string;
  institution: string;
  location: string;
  serviceType: "Installation" | "Routine Maintenance" | "Emergency Repair" | "Filter Replacement" | "Inspection";
  model: string;
  status: "Completed" | "In Progress" | "Scheduled" | "Pending";
  priority: "High" | "Medium" | "Low";
  scheduledDate: string;
  technician: string;
  contactPerson?: string;
  phone?: string;
  notes?: string;
}

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ServiceRequestItem | null>(null);

  const [newTicket, setNewTicket] = useState<Omit<ServiceRequestItem, "id" | "ticketId">>({
    institution: "",
    location: "",
    serviceType: "Installation",
    model: "Pro-Max",
    status: "Scheduled",
    priority: "High",
    scheduledDate: "",
    technician: "Assigned Engineer",
    contactPerson: "",
    phone: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const statuses = ["All", "Completed", "In Progress", "Scheduled", "Pending"];

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/service-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Failed to load service tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filtered = requests.filter((r) => {
    const matchesStatus = filterStatus === "All" || r.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      r.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      r.institution.toLowerCase().includes(search.toLowerCase()) ||
      r.technician.toLowerCase().includes(search.toLowerCase()) ||
      r.serviceType.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.institution.trim() || !newTicket.location.trim()) {
      setErrorMsg("Institution name and location are required");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create service ticket");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setNewTicket({
        institution: "",
        location: "",
        serviceType: "Installation",
        model: "Pro-Max",
        status: "Scheduled",
        priority: "High",
        scheduledDate: "",
        technician: "Assigned Engineer",
        contactPerson: "",
        phone: "",
        notes: "",
      });
      fetchTickets();
    } catch {
      setErrorMsg("Network error creating ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: ServiceRequestItem["status"]) => {
    try {
      const res = await fetch(`/api/admin/service-requests/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        if (selectedTicket && (selectedTicket._id === ticketId || selectedTicket.id === ticketId)) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
        fetchTickets();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const getPriorityBadge = (priority: ServiceRequestItem["priority"]) => {
    switch (priority) {
      case "High":
        return <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">High</span>;
      case "Medium":
        return <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Medium</span>;
      case "Low":
        return <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Low</span>;
    }
  };

  const getStatusBadge = (status: ServiceRequestItem["status"]) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#10469B]">
            <Clock className="h-3 w-3" />
            In Progress
          </span>
        );
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            <Calendar className="h-3 w-3" />
            Scheduled
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            <AlertTriangle className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  const totalCount = requests.length;
  const completedCount = requests.filter((r) => r.status === "Completed").length;
  const inProgressCount = requests.filter((r) => r.status === "In Progress").length;
  const scheduledCount = requests.filter((r) => r.status === "Scheduled").length;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  return (
    <div>
      <AdminPageHeader
        title="Service & Maintenance Requests"
        subtitle="Track machine installations, preventive maintenance, repair calls, and technician dispatching in real time."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Service Requests" },
        ]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0B2450] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Service Ticket
          </button>
        }
      />

      {/* Summary KPI Strip */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tickets</div>
          <div className="mt-1 text-2xl font-bold text-[#0B2450]">{totalCount}</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{completedCount}</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">In Progress</div>
          <div className="mt-1 text-2xl font-bold text-[#10469B]">{inProgressCount}</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scheduled</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">{scheduledCount}</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending</div>
          <div className="mt-1 text-2xl font-bold text-slate-700">{pendingCount}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by ID, institution, technician..."
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

      {/* Tickets List / Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm font-medium text-slate-500">
            Loading service requests from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-base font-bold text-slate-700">No Service Requests Found</p>
            <p className="mt-1 text-sm text-slate-400">
              There are no service tickets matching your criteria in the database.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B2450]"
            >
              <Plus className="size-3.5" />
              Create First Service Ticket
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E5EBF4] bg-[#F8FAFC] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Institution & Location</th>
                  <th className="px-5 py-3.5">Service Type</th>
                  <th className="px-5 py-3.5">Model</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Assigned Technician</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF4]">
                {filtered.map((r) => {
                  const targetId = r._id || r.id || "";
                  return (
                    <tr key={r.ticketId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#10469B]">{r.ticketId}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#0B2450]">{r.institution}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {r.location}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{r.serviceType}</td>
                      <td className="px-5 py-4">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {r.model}
                        </span>
                      </td>
                      <td className="px-5 py-4">{getPriorityBadge(r.priority)}</td>
                      <td className="px-5 py-4">{getStatusBadge(r.status)}</td>
                      <td className="px-5 py-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {r.technician}
                        </div>
                        {r.scheduledDate && (
                          <div className="text-xs text-slate-400 mt-0.5">Date: {r.scheduledDate}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <select
                          value={r.status}
                          onChange={(e) =>
                            handleUpdateStatus(targetId, e.target.value as ServiceRequestItem["status"])
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 focus:border-[#10469B] focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-jakarta text-lg font-bold text-slate-900">Create Service Ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="size-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Institution Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Hospital"
                  value={newTicket.institution}
                  onChange={(e) => setNewTicket({ ...newTicket, institution: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Campus / City Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jaipur, Rajasthan"
                  value={newTicket.location}
                  onChange={(e) => setNewTicket({ ...newTicket, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Service Type
                  </label>
                  <select
                    value={newTicket.serviceType}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        serviceType: e.target.value as ServiceRequestItem["serviceType"],
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:border-[#10469B] focus:outline-none"
                  >
                    <option value="Installation">Installation</option>
                    <option value="Routine Maintenance">Routine Maintenance</option>
                    <option value="Emergency Repair">Emergency Repair</option>
                    <option value="Filter Replacement">Filter Replacement</option>
                    <option value="Inspection">Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Machine Model
                  </label>
                  <select
                    value={newTicket.model}
                    onChange={(e) => setNewTicket({ ...newTicket, model: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:border-[#10469B] focus:outline-none"
                  >
                    <option value="Basic">Basic (80-100/day)</option>
                    <option value="Pro">Pro (200-250/day)</option>
                    <option value="Pro-Max">Pro-Max (400-500/day)</option>
                    <option value="Pad-Vending">Pad Vending Machine</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, priority: e.target.value as ServiceRequestItem["priority"] })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:border-[#10469B] focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Technician
                  </label>
                  <input
                    type="text"
                    value={newTicket.technician}
                    onChange={(e) => setNewTicket({ ...newTicket, technician: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#10469B] px-5 py-2 text-xs font-bold text-white hover:bg-[#0B2450] disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Log Ticket to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
