"use client";

import React, { useState } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Search, CheckCircle2, UserPlus } from "lucide-react";
import { DEFAULT_ADMIN_USERS, AdminUserItem } from "@/lib/admin/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>(DEFAULT_ADMIN_USERS);
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Support Staff" as AdminUserItem["role"],
  });

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;

    const user: AdminUserItem = {
      id: `usr-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "Active",
      lastActive: "Just invited",
    };

    setUsers([...users, user]);
    setShowInviteModal(false);
    setNewUser({ name: "", email: "", role: "Support Staff" });
  };

  const getRoleBadge = (role: AdminUserItem["role"]) => {
    switch (role) {
      case "Super Admin":
        return <span className="rounded-md bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">Super Admin</span>;
      case "Operations Admin":
        return <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#10469B]">Operations Admin</span>;
      case "Service Manager":
        return <span className="rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Service Manager</span>;
      case "Support Staff":
        return <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">Support Staff</span>;
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Admin & Team Users"
        subtitle="Manage administrative privileges, role-based access control, and team members."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Users" },
        ]}
        actions={
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0B2450] transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Invite Staff Member
          </button>
        }
      />

      {/* Search Bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by staff name, role, email..."
            className="w-full rounded-lg border border-slate-200 bg-[#F4F7FC]/50 pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-[#10469B] focus:bg-white focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} team members
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">User</th>
                <th className="px-3 py-3.5">Email</th>
                <th className="px-3 py-3.5">Role</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-3 py-3.5">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10469B] text-xs font-bold text-white">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="font-semibold text-slate-800">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-xs text-slate-600 font-mono">
                    {user.email}
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-xs text-slate-500">
                    {user.lastActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#0B2450] mb-4">Invite Admin Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Verma"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@rmaxsolutions.in"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Role & Permissions
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as AdminUserItem["role"] })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                >
                  <option value="Operations Admin">Operations Admin</option>
                  <option value="Service Manager">Service Manager</option>
                  <option value="Support Staff">Support Staff</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#10469B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2450]"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
