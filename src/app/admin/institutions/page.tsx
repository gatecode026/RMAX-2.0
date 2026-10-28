"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Plus, Search, Building2, MapPin, CheckCircle2, X, AlertCircle } from "lucide-react";

export interface InstitutionItem {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  contactPerson: string;
  email: string;
  phone: string;
  unitsInstalled: number;
  status: "Active" | "Pending" | "Inactive";
}

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Institution Form State
  const [newInst, setNewInst] = useState<Omit<InstitutionItem, "id">>({
    name: "",
    type: "School",
    city: "",
    state: "",
    contactPerson: "",
    email: "",
    phone: "",
    unitsInstalled: 1,
    status: "Active",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const types = ["All", "School", "Hospital", "College", "Workplace"];

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/institutions");
      if (res.ok) {
        const data = await res.json();
        setInstitutions(data.institutions || []);
      }
    } catch (err) {
      console.error("Failed to load institutions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const filtered = institutions.filter((inst) => {
    const matchesType = filterType === "All" || inst.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.city.toLowerCase().includes(search.toLowerCase()) ||
      inst.contactPerson.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleAddInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInst.name.trim() || !newInst.city.trim()) {
      setErrorMsg("Institution name and city are required");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInst),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to add institution");
        setSubmitting(false);
        return;
      }

      setShowAddModal(false);
      setNewInst({
        name: "",
        type: "School",
        city: "",
        state: "",
        contactPerson: "",
        email: "",
        phone: "",
        unitsInstalled: 1,
        status: "Active",
      });
      fetchInstitutions();
    } catch {
      setErrorMsg("Network error adding institution");
    } finally {
      setSubmitting(false);
    }
  };

  const totalUnits = institutions.reduce((sum, i) => sum + i.unitsInstalled, 0);

  return (
    <div>
      <AdminPageHeader
        title="Institutional Clients & Campuses"
        subtitle="Manage partner schools, colleges, universities, hospitals, and corporate facilities using RMAX."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Institutions" },
        ]}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0B2450] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Institution
          </button>
        }
      />

      {/* Overview Stat Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Partners</div>
          <div className="mt-1 text-2xl font-bold text-[#0B2450]">{institutions.length}</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Machines Installed</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{totalUnits}</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Campuses</div>
          <div className="mt-1 text-2xl font-bold text-[#10469B]">
            {institutions.filter((i) => i.status === "Active").length}
          </div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Review</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {institutions.filter((i) => i.status === "Pending").length}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, city, contact person..."
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

      {/* Institutions Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm font-medium text-slate-500">
            Loading institutions from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-base font-bold text-slate-700">No Institutions Found</p>
            <p className="mt-1 text-sm text-slate-400">
              When quotations are approved or institutions registered, they will appear here.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B2450]"
            >
              <Plus className="size-3.5" />
              Add First Institution
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E5EBF4] bg-[#F8FAFC] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Institution Name</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">City & State</th>
                  <th className="px-5 py-3.5">Contact Person</th>
                  <th className="px-5 py-3.5 text-center">Machines Installed</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF4]">
                {filtered.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EBF2FC] text-[#10469B]">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#0B2450]">{inst.name}</div>
                          <div className="text-xs text-slate-400">{inst.email || "No email on file"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {inst.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {inst.city}{inst.state ? `, ${inst.state}` : ""}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-700">{inst.contactPerson || "—"}</div>
                      <div className="text-xs text-slate-400">{inst.phone || ""}</div>
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-[#0B2450]">{inst.unitsInstalled}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          inst.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : inst.status === "Pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {inst.status === "Active" && <CheckCircle2 className="h-3 w-3" />}
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Institution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-jakarta text-lg font-bold text-slate-900">Add Institutional Client</h3>
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

            <form onSubmit={handleAddInstitution} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Institution Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Xavier's Senior Secondary School"
                  value={newInst.name}
                  onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Institution Type
                  </label>
                  <select
                    value={newInst.type}
                    onChange={(e) => setNewInst({ ...newInst, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:border-[#10469B] focus:outline-none"
                  >
                    <option value="School">School</option>
                    <option value="Hospital">Hospital</option>
                    <option value="College">College / University</option>
                    <option value="Workplace">Corporate / Workplace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Units Installed
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newInst.unitsInstalled}
                    onChange={(e) => setNewInst({ ...newInst, unitsInstalled: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur"
                    value={newInst.city}
                    onChange={(e) => setNewInst({ ...newInst, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajasthan"
                    value={newInst.state}
                    onChange={(e) => setNewInst({ ...newInst, state: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Principal Sharma"
                    value={newInst.contactPerson}
                    onChange={(e) => setNewInst({ ...newInst, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin@school.org"
                    value={newInst.email}
                    onChange={(e) => setNewInst({ ...newInst, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 94140..."
                    value={newInst.phone}
                    onChange={(e) => setNewInst({ ...newInst, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
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
                  {submitting ? "Saving..." : "Save Institution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
