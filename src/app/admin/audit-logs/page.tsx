"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import {
  Search,
  ShieldCheck,
  RefreshCw,
  Clock,
  User,
  Filter,
  FileText,
  Activity,
} from "lucide-react";

interface AuditLogItem {
  _id: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (entityFilter !== "all") params.set("entityType", entityFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [search, entityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit Logs & Compliance Trail"
        subtitle="Immutable security record of administrative actions, lead assignments, and system updates."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Audit Logs" },
        ]}
        actions={
          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#10469B]" : ""}`} />
            Refresh Trail
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EBF4] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by actor, action name, or details..."
              className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
            />
          </div>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Entities</option>
            <option value="lead">Leads</option>
            <option value="user">Users / Managers</option>
            <option value="system">System Settings</option>
          </select>
        </div>
        <span className="text-xs font-medium text-slate-400">
          Showing {logs.length} logged events
        </span>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5EBF4] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Timestamp</th>
                <th className="py-3.5 px-3">Actor</th>
                <th className="py-3.5 px-3">Action</th>
                <th className="py-3.5 px-3">Entity</th>
                <th className="py-3.5 pr-5">Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto size-6 animate-spin text-[#10469B] mb-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#F4F7FC]/50 transition-colors">
                    <td className="py-3.5 pl-5 pr-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                        <Clock className="size-3.5 text-slate-400" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-semibold text-slate-900">{log.actorName}</p>
                        <span className="rounded-sm bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 uppercase">
                          {log.actorRole}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-800 capitalize">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#10469B] uppercase">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-3.5 pr-5">
                      <div className="max-w-md truncate font-mono text-[11px] text-slate-500">
                        {log.details ? JSON.stringify(log.details) : "—"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
