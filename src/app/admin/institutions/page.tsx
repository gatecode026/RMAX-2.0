"use client";

import React, { useState } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Plus, Search, Building2, MapPin, CheckCircle2 } from "lucide-react";
import { DEFAULT_INSTITUTIONS, InstitutionItem } from "@/lib/admin/types";

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<InstitutionItem[]>(DEFAULT_INSTITUTIONS);
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

  const types = ["All", "School", "Hospital", "College / University", "Workplace"];

  const filtered = institutions.filter((inst) => {
    const matchesType = filterType === "All" || inst.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.city.toLowerCase().includes(search.toLowerCase()) ||
      inst.contactPerson.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleAddInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInst.name.trim() || !newInst.city.trim()) return;

    const item: InstitutionItem = {
      ...newInst,
      id: `inst-${Date.now()}`,
    };

    setInstitutions([item, ...institutions]);
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
  };

  return (
    <div>
      <AdminPageHeader
        title="Institutions"
        subtitle="Manage partner educational campuses, hospitals, healthcare clinics, and commercial facilities."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Institutions" },
        ]}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0B2450] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Institution
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Partner Campuses</div>
          <div className="mt-1 text-2xl font-bold text-[#0B2450]">320</div>
          <div className="text-xs text-emerald-600 mt-0.5">Across 18 States</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Schools & Colleges</div>
          <div className="mt-1 text-2xl font-bold text-slate-800">250</div>
          <div className="text-xs text-slate-500 mt-0.5">78% of network</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hospitals & Clinics</div>
          <div className="mt-1 text-2xl font-bold text-slate-800">48</div>
          <div className="text-xs text-slate-500 mt-0.5">Medical hygiene units</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Units Deployed</div>
          <div className="mt-1 text-2xl font-bold text-[#10469B]">890+</div>
          <div className="text-xs text-emerald-600 mt-0.5">Active Incinerators</div>
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
            placeholder="Search by institution name, city, person..."
            className="w-full rounded-lg border border-slate-200 bg-[#F4F7FC]/50 pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-[#10469B] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Institution Name</th>
                <th className="px-3 py-3.5">Type</th>
                <th className="px-3 py-3.5">Location</th>
                <th className="px-3 py-3.5">Contact Person</th>
                <th className="px-3 py-3.5">Units Installed</th>
                <th className="px-3 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No institutions found.
                  </td>
                </tr>
              ) : (
                filtered.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-5 pr-3 font-semibold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <Building2 className="h-4 w-4 text-[#10469B] flex-shrink-0" />
                        <span>{inst.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {inst.type}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {inst.city}, {inst.state}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="font-medium text-slate-800">{inst.contactPerson}</div>
                      <div className="text-xs text-slate-400">{inst.phone}</div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap font-bold text-slate-900">
                      {inst.unitsInstalled} units
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Institution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#0B2450] mb-4">Add Institutional Account</h3>
            <form onSubmit={handleAddInstitution} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Institution Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern School, Barakhamba"
                  value={newInst.name}
                  onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Institution Type
                  </label>
                  <select
                    value={newInst.type}
                    onChange={(e) => setNewInst({ ...newInst, type: e.target.value as InstitutionItem["type"] })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  >
                    <option value="School">School</option>
                    <option value="College / University">College / University</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Workplace">Workplace</option>
                    <option value="Government">Government Facility</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Units Installed
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newInst.unitsInstalled}
                    onChange={(e) => setNewInst({ ...newInst, unitsInstalled: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Delhi"
                    value={newInst.city}
                    onChange={(e) => setNewInst({ ...newInst, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi NCR"
                    value={newInst.state}
                    onChange={(e) => setNewInst({ ...newInst, state: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Principal S. Sen"
                    value={newInst.contactPerson}
                    onChange={(e) => setNewInst({ ...newInst, contactPerson: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98110 12345"
                    value={newInst.phone}
                    onChange={(e) => setNewInst({ ...newInst, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#10469B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2450] transition-colors"
                >
                  Save Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
