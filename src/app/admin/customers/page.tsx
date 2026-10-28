"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Search, Mail, Phone, Eye, Download, UserPlus, X, AlertCircle } from "lucide-react";

interface CustomerItem {
  id: string;
  name: string;
  initials: string;
  organization: string;
  type: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastActive: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedCust, setSelectedCust] = useState<CustomerItem | null>(null);

  // New Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCust, setNewCust] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    type: "School",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const types = ["All", "School", "Hospital", "College", "Workplace", "Individual"];

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.email) {
      setErrorMsg("Name and Email are required");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCust),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create customer");
        setSubmitting(false);
        return;
      }

      setShowAddModal(false);
      setNewCust({ name: "", email: "", phone: "", organization: "", type: "School" });
      fetchCustomers();
    } catch {
      setErrorMsg("Network error creating customer");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = customers.filter((c) => {
    const matchesType = filterType === "All" || c.type.toLowerCase() === filterType.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.organization.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    return matchesType && matchesSearch;
  });

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Customer Name", "Organization", "Type", "Email", "Phone", "Orders", "Total Spent", "Last Active"];
    const rows = filtered.map((c) => [
      `"${c.name}"`,
      `"${c.organization}"`,
      `"${c.type}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      c.ordersCount,
      c.totalSpent,
      `"${c.lastActive}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rmax-customers-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        subtitle="Manage institutional buyers, representatives, quote history, and account activity directly from MongoDB."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Customers" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <Download className="size-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#10469B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0B2450] transition"
            >
              <UserPlus className="size-4" />
              Add Customer
            </button>
          </div>
        }
      />

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, organization, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-[#10469B] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterType === t
                  ? "bg-[#10469B] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm font-medium text-slate-500">
            Loading customers from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-base font-bold text-slate-700">No Customers Found</p>
            <p className="mt-1 text-sm text-slate-400">
              Customers who register on the website or submit institutional quote requests will be listed here.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B2450]"
            >
              <UserPlus className="size-3.5" />
              Add Customer Manually
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E5EBF4] bg-[#F8FAFC] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Organization</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5 text-center">Quotes / Orders</th>
                  <th className="px-5 py-3.5">Total Value</th>
                  <th className="px-5 py-3.5">Last Active</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF4]">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EBF2FC] text-xs font-bold text-[#10469B]">
                          {c.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0B2450]">{c.name}</div>
                          <div className="text-xs text-slate-400">ID: {c.id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{c.organization}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {c.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {c.email}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-slate-500">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {c.phone}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-slate-700">{c.ordersCount}</td>
                    <td className="px-5 py-4 font-bold text-[#0B2450]">
                      ₹{c.totalSpent.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{c.lastActive}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedCust(c)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-jakarta text-lg font-bold text-slate-900">Add Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="size-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddCustomer} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Customer / Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Balbir Singhania"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  placeholder="e.g. principal@school.org"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  placeholder="+91 94140 00000"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={newCust.organization}
                    onChange={(e) => setNewCust({ ...newCust, organization: e.target.value })}
                    placeholder="e.g. Singhania School"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Institution Type
                  </label>
                  <select
                    value={newCust.type}
                    onChange={(e) => setNewCust({ ...newCust, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none bg-white"
                  >
                    <option value="School">School</option>
                    <option value="Hospital">Hospital</option>
                    <option value="College">College</option>
                    <option value="Workplace">Workplace</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#10469B] px-5 py-2 text-xs font-bold text-white hover:bg-[#0B2450] disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2FC] text-base font-bold text-[#10469B]">
                  {selectedCust.initials}
                </div>
                <div>
                  <h3 className="font-jakarta text-lg font-bold text-slate-900">{selectedCust.name}</h3>
                  <p className="text-xs text-slate-500">{selectedCust.organization}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCust(null)} className="text-gray-400 hover:text-gray-600">
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-50 py-2">
                <span className="text-slate-500">Institution Type</span>
                <span className="font-semibold text-slate-800">{selectedCust.type}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 py-2">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-800">{selectedCust.email}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 py-2">
                <span className="text-slate-500">Phone</span>
                <span className="font-semibold text-slate-800">{selectedCust.phone}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 py-2">
                <span className="text-slate-500">Quotes & Orders</span>
                <span className="font-bold text-[#10469B]">{selectedCust.ordersCount}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 py-2">
                <span className="text-slate-500">Total Value</span>
                <span className="font-bold text-emerald-600">₹{selectedCust.totalSpent.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Last Active</span>
                <span className="font-semibold text-slate-800">{selectedCust.lastActive}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCust(null)}
                className="rounded-xl bg-[#0B2450] px-5 py-2 text-xs font-bold text-white hover:bg-[#10469B]"
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
