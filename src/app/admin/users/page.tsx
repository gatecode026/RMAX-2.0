"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import {
  Search,
  UserPlus,
  RefreshCw,
  Shield,
  Briefcase,
  Mail,
  KeyRound,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Target,
  X,
  AlertCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface ManagerItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  department?: string;
  assignedLeadsCount?: number;
  convertedLeadsCount?: number;
  conversionRate?: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const toast = useToast();
  const [managers, setManagers] = useState<ManagerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetPasswordModalUser, setResetPasswordModalUser] = useState<ManagerItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // SweetAlert modal state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    manager: ManagerItem;
    deleting: boolean;
  } | null>(null);

  const [newManager, setNewManager] = useState({
    name: "",
    email: "",
    password: "",
    department: "Institutional Sales",
    phone: "",
  });

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/managers");
      if (res.ok) {
        const data = await res.json();
        setManagers(data.managers || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManager.name || !newManager.email || !newManager.password) return;
    setActionLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newManager),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to create manager account.");
        return;
      }

      setShowCreateModal(false);
      setNewManager({
        name: "",
        email: "",
        password: "",
        department: "Institutional Sales",
        phone: "",
      });
      fetchManagers();
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (manager: ManagerItem) => {
    const nextStatus = manager.status === "active" ? "inactive" : "active";
    if (
      !confirm(
        `Are you sure you want to ${
          nextStatus === "inactive" ? "deactivate" : "activate"
        } ${manager.name}?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/managers/${manager._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchManagers();
      }
    } catch {
      // Error
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordModalUser || !newPassword.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/managers/${resetPasswordModalUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetPassword: newPassword }),
      });
      if (res.ok) {
        setResetPasswordModalUser(null);
        setNewPassword("");
        toast.success("Password Updated", "Manager password was successfully updated.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Update Failed", err.error || "Could not update password.");
      }
    } catch {
      toast.error("Error", "Network error while updating password.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeleteManager = async () => {
    if (!deleteModal?.manager) return;
    const target = deleteModal.manager;
    setDeleteModal((prev) => (prev ? { ...prev, deleting: true } : null));

    try {
      const res = await fetch(`/api/admin/managers/${target._id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Manager Deleted", data.message || `Manager ${target.name} was removed.`);
        setDeleteModal(null);
        fetchManagers();
      } else {
        toast.error("Delete Failed", data.error || "Could not delete manager account.");
        setDeleteModal((prev) => (prev ? { ...prev, deleting: false } : null));
      }
    } catch {
      toast.error("Error", "Network error while deleting manager.");
      setDeleteModal((prev) => (prev ? { ...prev, deleting: false } : null));
    }
  };

  const filtered = managers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalManagers = managers.length;
  const activeCount = managers.filter((m) => m.status === "active").length;
  const totalAssignedLeads = managers.reduce((acc, m) => acc + (m.assignedLeadsCount || 0), 0);
  const totalConvertedLeads = managers.reduce((acc, m) => acc + (m.convertedLeadsCount || 0), 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manager & Team Administration"
        subtitle="Provision manager credentials, configure lead routing quotas, and monitor team conversion metrics."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Users & Managers" },
        ]}
        actions={
          <button
            onClick={() => {
              setErrorMessage("");
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#10469B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0B2450] transition"
          >
            <UserPlus className="size-4" />
            Create Manager Account
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Managers
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 font-jakarta">{totalManagers}</p>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wider">
            Active Accounts
          </p>
          <p className="mt-1 text-2xl font-bold text-green-600 font-jakarta">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-[#10469B] uppercase tracking-wider">
            Assigned Leads
          </p>
          <p className="mt-1 text-2xl font-bold text-[#10469B] font-jakarta">{totalAssignedLeads}</p>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">
            Team Conversions
          </p>
          <p className="mt-1 text-2xl font-bold text-purple-600 font-jakarta">
            {totalConvertedLeads}
          </p>
        </div>
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
              placeholder="Search by manager name, email, department..."
              className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <button
          onClick={fetchManagers}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#10469B]" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Managers Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5EBF4] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Manager Profile</th>
                <th className="py-3.5 px-3">Role & Dept</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-center">Assigned Leads</th>
                <th className="py-3.5 px-3 text-center">Conversions</th>
                <th className="py-3.5 px-3 text-center">Conversion Rate</th>
                <th className="py-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto size-6 animate-spin text-[#10469B] mb-2" />
                    Loading manager roster...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No managers found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((manager) => (
                  <tr key={manager._id} className="hover:bg-[#F4F7FC]/50 transition-colors">
                    {/* Name + Email */}
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-full bg-[#10469B] text-xs font-bold text-white">
                          {(manager.name || "M").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-[13px]">{manager.name || "Unnamed Manager"}</p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Mail className="size-3" />
                            {manager.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 uppercase">
                          {(manager.role || "manager").replace("_", " ")}
                        </span>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {manager.department || "Lead Operations"}
                        </p>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleToggleStatus(manager)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase transition ${
                          manager.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                        title="Click to toggle status"
                      >
                        {manager.status === "active" ? (
                          <>
                            <CheckCircle2 className="size-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3" /> Inactive
                          </>
                        )}
                      </button>
                    </td>

                    {/* Assigned Leads */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-slate-800 font-jakarta">
                        {manager.assignedLeadsCount || 0}
                      </span>
                    </td>

                    {/* Conversions */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-green-700 font-jakarta">
                        {manager.convertedLeadsCount || 0}
                      </span>
                    </td>

                    {/* Conversion Rate */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                        {manager.conversionRate || 0}%
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/leads?managerId=${manager._id}`}
                          title="View Assigned Leads"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Target className="size-3 text-[#10469B]" />
                          Leads
                        </Link>
                        <button
                          onClick={() => {
                            setResetPasswordModalUser(manager);
                            setNewPassword("");
                          }}
                          title="Reset Password"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        >
                          <KeyRound className="size-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              open: true,
                              manager,
                              deleting: false,
                            })
                          }
                          title={`Delete Manager: ${manager.name}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="size-4" />
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

      {/* Create Manager Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-jakarta text-base font-bold text-slate-900">
                  Create Manager Account
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provision new manager credentials with restricted lead access.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateManager} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newManager.name}
                  onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                  placeholder="e.g. Rahul Kumawat"
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
                  value={newManager.email}
                  onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                  placeholder="rahul.manager@rmax.in"
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newManager.password}
                  onChange={(e) => setNewManager({ ...newManager, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={newManager.department}
                  onChange={(e) => setNewManager({ ...newManager, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                >
                  <option value="Institutional Sales">Institutional Sales</option>
                  <option value="School & College Relations">School & College Relations</option>
                  <option value="Healthcare & Hospitals">Healthcare & Hospitals</option>
                  <option value="Government & Tenders">Government & Tenders</option>
                  <option value="North Zone Operations">North Zone Operations</option>
                  <option value="South Zone Operations">South Zone Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={newManager.phone}
                  onChange={(e) => setNewManager({ ...newManager, phone: e.target.value })}
                  placeholder="+91 98765 43210"
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
                  {actionLoading ? "Provisioning..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-jakarta text-base font-bold text-slate-900">
                  Reset Password
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {resetPasswordModalUser.name} ({resetPasswordModalUser.email})
                </p>
              </div>
              <button
                onClick={() => setResetPasswordModalUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordModalUser(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={actionLoading || newPassword.length < 6}
                  className="rounded-xl bg-[#10469B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SweetAlert Delete Confirmation Modal */}
      {deleteModal && deleteModal.open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            {/* Animated Warning Icon */}
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-inner">
              <AlertTriangle className="size-8 stroke-[2.2] animate-bounce" />
            </div>

            <div className="mt-4 text-center">
              <h3 className="font-jakarta text-lg font-extrabold text-slate-900">
                Delete Manager Account?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                Are you sure you want to remove{" "}
                <span className="font-bold text-slate-900">{deleteModal.manager.name}</span> (
                {deleteModal.manager.email}) from the management team?
              </p>
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-100 text-left">
                <p>• The manager will no longer be able to log in to the manager portal.</p>
                <p className="mt-1">• Any active leads assigned to this manager will be safely unassigned for reassignment.</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={deleteModal.deleting}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteModal.deleting}
                onClick={confirmDeleteManager}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 disabled:opacity-50 transition"
              >
                {deleteModal.deleting && <RefreshCw className="size-3.5 animate-spin text-white" />}
                Yes, Delete Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
