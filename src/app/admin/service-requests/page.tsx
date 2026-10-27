"use client";

import React, { useState } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Plus, Search, CheckCircle2, Clock, Calendar, AlertTriangle, User, MapPin } from "lucide-react";
import { DEFAULT_SERVICE_REQUESTS, DEFAULT_SERVICE_SUMMARY, ServiceRequestItem } from "@/lib/admin/types";

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequestItem[]>(DEFAULT_SERVICE_REQUESTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [newTicket, setNewTicket] = useState<Omit<ServiceRequestItem, "id" | "ticketId">>({
    institution: "",
    location: "",
    serviceType: "Installation",
    model: "Pro-Max",
    status: "Scheduled",
    priority: "High",
    scheduledDate: "30 Oct 2026",
    technician: "Ramesh Verma",
  });

  const statuses = ["All", "Completed", "In Progress", "Scheduled", "Pending"];

  const filtered = requests.filter((r) => {
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    const matchesSearch =
      r.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      r.institution.toLowerCase().includes(search.toLowerCase()) ||
      r.technician.toLowerCase().includes(search.toLowerCase()) ||
      r.serviceType.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.institution.trim()) return;

    const item: ServiceRequestItem = {
      ...newTicket,
      id: `sr-${Date.now()}`,
      ticketId: `SR-2026-${100 + requests.length + 1}`,
    };

    setRequests([item, ...requests]);
    setShowModal(false);
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
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#10469B]">
            <Clock className="h-3 w-3" /> In Progress
          </span>
        );
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            <Calendar className="h-3 w-3" /> Scheduled
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            <AlertTriangle className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Service & Installation"
        subtitle="Schedule engineer visits, track warranty maintenance, and record institutional installations."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Service Requests" },
        ]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0B2450] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Service Ticket
          </button>
        }
      />

      {/* Overview Cards matching the PRD totals */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Requests</div>
          <div className="mt-1 text-2xl font-bold text-[#0B2450]">{DEFAULT_SERVICE_SUMMARY.total}</div>
          <div className="text-xs text-slate-500 mt-0.5">This Month</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{DEFAULT_SERVICE_SUMMARY.completed}</div>
          <div className="text-xs text-slate-500 mt-0.5">67% done</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">In Progress</div>
          <div className="mt-1 text-2xl font-bold text-[#10469B]">{DEFAULT_SERVICE_SUMMARY.inProgress}</div>
          <div className="text-xs text-slate-500 mt-0.5">Underway</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scheduled</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">{DEFAULT_SERVICE_SUMMARY.scheduled}</div>
          <div className="text-xs text-slate-500 mt-0.5">Upcoming</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending</div>
          <div className="mt-1 text-2xl font-bold text-slate-700">{DEFAULT_SERVICE_SUMMARY.pending}</div>
          <div className="text-xs text-slate-500 mt-0.5">Unassigned</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket #, school, technician..."
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

      {/* Tickets Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Ticket ID</th>
                <th className="px-3 py-3.5">Institution & Location</th>
                <th className="px-3 py-3.5">Service Type</th>
                <th className="px-3 py-3.5">Model</th>
                <th className="px-3 py-3.5">Priority</th>
                <th className="px-3 py-3.5">Assigned Engineer</th>
                <th className="px-3 py-3.5">Scheduled Date</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No service requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-5 pr-3 font-semibold text-slate-900 whitespace-nowrap">
                      {item.ticketId}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="font-semibold text-slate-800">{item.institution}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" /> {item.location}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap font-medium text-slate-700">
                      {item.serviceType}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-slate-600">
                      {item.model}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {getPriorityBadge(item.priority)}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <User className="h-3 w-3 text-slate-400" />
                        {item.technician}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {item.scheduledDate}
                    </td>
                    <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Service Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#0B2450] mb-4">Create Service & Maintenance Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Institution Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delhi Public School"
                  value={newTicket.institution}
                  onChange={(e) => setNewTicket({ ...newTicket, institution: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Campus Address / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathura Road, New Delhi"
                  value={newTicket.location}
                  onChange={(e) => setNewTicket({ ...newTicket, location: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Service Type
                  </label>
                  <select
                    value={newTicket.serviceType}
                    onChange={(e) => setNewTicket({ ...newTicket, serviceType: e.target.value as ServiceRequestItem["serviceType"] })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  >
                    <option value="Installation">New Machine Installation</option>
                    <option value="Routine Maintenance">Routine Maintenance</option>
                    <option value="Heating Element Check">Heating Element Check</option>
                    <option value="Filter Replacement">Filter Replacement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as ServiceRequestItem["priority"] })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Field Technician
                  </label>
                  <input
                    type="text"
                    value={newTicket.technician}
                    onChange={(e) => setNewTicket({ ...newTicket, technician: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="text"
                    value={newTicket.scheduledDate}
                    onChange={(e) => setNewTicket({ ...newTicket, scheduledDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#10469B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2450] transition-colors"
                >
                  Dispatch Service Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
