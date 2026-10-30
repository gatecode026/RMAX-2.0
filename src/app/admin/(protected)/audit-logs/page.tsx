"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import {
  Search,
  RefreshCw,
  Clock,
  User,
  Filter,
  CheckCircle2,
  Package,
  Target,
  FileText,
  Trash2,
  Edit3,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  Eye,
  X,
  ShieldAlert,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  _id: string;
  actorName: string;
  actorEmail?: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  details?: string | Record<string, any>;
  timestamp: string;
  createdAt?: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

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
      // Ignore network error
    } finally {
      setLoading(false);
    }
  }, [search, entityFilter]);

  // Initial load and live auto-refresh every 8 seconds
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 8000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          <PlusCircle className="size-3" />
          {action.replace(/_/g, " ")}
        </span>
      );
    }
    if (act.includes("DELETE") || act.includes("ARCHIVE")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
          <Trash2 className="size-3" />
          {action.replace(/_/g, " ")}
        </span>
      );
    }
    if (act.includes("ASSIGN")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
          <User className="size-3" />
          {action.replace(/_/g, " ")}
        </span>
      );
    }
    if (act.includes("STOCK")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-cyan-50 px-2 py-0.5 text-[11px] font-bold text-cyan-800">
          <TrendingUp className="size-3" />
          {action.replace(/_/g, " ")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#10469B]">
        <Edit3 className="size-3" />
        {action.replace(/_/g, " ")}
      </span>
    );
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case "product":
      case "inventory":
        return <Package className="size-3.5 text-teal-600" />;
      case "lead":
        return <Target className="size-3.5 text-purple-600" />;
      case "quotation":
        return <FileText className="size-3.5 text-amber-600" />;
      default:
        return <User className="size-3.5 text-slate-500" />;
    }
  };

  const formatLogSummary = (log: AuditLogItem): string => {
    if (log.metadata && typeof log.metadata.details === "string" && log.metadata.details) {
      return log.metadata.details;
    }
    if (typeof log.details === "string" && log.details) {
      return log.details;
    }

    const meta = log.metadata || {};
    const actor = log.actorName || "User";
    const act = log.action.toUpperCase();

    if (act.includes("STOCK") && meta.productName) {
      return `${actor} updated stock of "${meta.productName}" from ${meta.previousStock ?? "—"} to ${meta.newStock ?? "—"} units`;
    }
    if (act.includes("PRODUCT_CREATED") && meta.productName) {
      return `${actor} created product "${meta.productName}" (Price: ₹${meta.price || 0}, Stock: ${meta.stock || 0})`;
    }
    if (act.includes("PRODUCT_UPDATED") && meta.productName) {
      return `${actor} updated product "${meta.productName}" specifications and pricing`;
    }
    if (act.includes("PRODUCT_DELETED") && meta.productName) {
      return `${actor} deleted product "${meta.productName}"`;
    }
    if (act.includes("LEAD_DELETED") && meta.name) {
      return `${actor} deleted lead record ${meta.leadNumber || ""} (${meta.name})`;
    }
    if (act.includes("LEAD_CREATED") && meta.name) {
      return `${actor} created lead ${meta.leadNumber || ""} (${meta.name})`;
    }
    if (act.includes("LEAD_UPDATED") && meta.leadNumber) {
      return `${actor} updated lead ${meta.leadNumber}`;
    }

    return `${actor} performed ${log.action.replace(/_/g, " ")} on ${log.entityType}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit Logs & Activity Trail"
        subtitle="Real-time chronological record of who made changes, what product/stock/lead was updated or deleted, and when."
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
            Refresh Log
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EBF4] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name, action, lead ID, or product..."
              className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-slate-400" />
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
            >
              <option value="all">All Entity Logs</option>
              <option value="product">Products & Stock</option>
              <option value="lead">Leads & Customers</option>
              <option value="quotation">Quotations</option>
              <option value="order">Orders</option>
              <option value="user">Users & Staff</option>
              <option value="system">System Settings</option>
            </select>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#10469B]">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Tracking Active • {logs.length} events
        </span>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5EBF4] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Date & Time</th>
                <th className="py-3.5 px-3">User (Actor)</th>
                <th className="py-3.5 px-3">Action</th>
                <th className="py-3.5 px-3">Entity</th>
                <th className="py-3.5 px-3">Action Description & Changes</th>
                <th className="py-3.5 pr-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto size-6 animate-spin text-[#10469B] mb-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const summary = formatLogSummary(log);
                  const logDate = log.timestamp || log.createdAt;
                  return (
                    <tr key={log.id || log._id} className="hover:bg-[#F4F7FC]/50 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 pl-5 pr-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Clock className="size-3.5 text-slate-400" />
                          <span>
                            {logDate
                              ? new Date(logDate).toLocaleDateString([], {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {logDate
                              ? new Date(logDate).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                      </td>

                      {/* Actor (User) */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[11px]">
                            {log.actorName ? log.actorName.slice(0, 2).toUpperCase() : "US"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{log.actorName || "System"}</p>
                            <span className="rounded-xs bg-slate-100 px-1 py-0.2 text-[9px] font-bold text-slate-600 uppercase">
                              {log.actorRole || "User"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Entity */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 capitalize">
                          {getEntityIcon(log.entityType)}
                          {log.entityType}
                        </span>
                      </td>

                      {/* Description / Summary */}
                      <td className="py-3.5 px-3">
                        <p className="font-medium text-slate-800 leading-relaxed max-w-lg line-clamp-2">
                          {summary}
                        </p>
                      </td>

                      {/* View Metadata Action */}
                      <td className="py-3.5 pr-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Eye className="size-3" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-[#10469B]" />
                <h3 className="font-jakarta text-base font-bold text-slate-900">Audit Log Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">User / Actor</span>
                  <p className="font-bold text-slate-900">{selectedLog.actorName}</p>
                  <p className="text-slate-500 text-[11px]">{selectedLog.actorRole} {selectedLog.actorEmail ? `• ${selectedLog.actorEmail}` : ""}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time</span>
                  <p className="font-semibold text-slate-900">
                    {selectedLog.timestamp || selectedLog.createdAt
                      ? new Date(selectedLog.timestamp || selectedLog.createdAt || "").toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Action Name</span>
                  <p className="font-semibold text-slate-900">{selectedLog.action}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Entity</span>
                  <p className="font-semibold text-slate-900 uppercase">{selectedLog.entityType} {selectedLog.entityId ? `#${selectedLog.entityId}` : ""}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1 block">
                  Action Summary
                </span>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs font-medium text-slate-800">
                  {formatLogSummary(selectedLog)}
                </div>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1 block">
                    Raw Event Metadata
                  </span>
                  <pre className="max-h-48 overflow-y-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-emerald-400">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
