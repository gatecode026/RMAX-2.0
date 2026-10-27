"use client";

import React, { useState } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Search, Mail, Phone, Eye, Download } from "lucide-react";

interface CustomerItem {
  id: string;
  name: string;
  initials: string;
  organization: string;
  type: "School" | "Hospital" | "College" | "Workplace" | "Individual";
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastActive: string;
}

const CUSTOMERS_DATA: CustomerItem[] = [
  {
    id: "cust-1",
    name: "Balbir Singhania",
    initials: "BS",
    organization: "Singhania School, Jaipur",
    type: "School",
    email: "principal@singhaniaschool.org",
    phone: "+91 94140 55667",
    ordersCount: 4,
    totalSpent: 26000,
    lastActive: "25 Oct 2026",
  },
  {
    id: "cust-2",
    name: "Dr. Meera Iyer",
    initials: "MI",
    organization: "Sunrise Public School, Pune",
    type: "School",
    email: "facilities@sunrisepublic.in",
    phone: "+91 98220 11223",
    ordersCount: 6,
    totalSpent: 27000,
    lastActive: "24 Oct 2026",
  },
  {
    id: "cust-3",
    name: "Rajesh Khanna",
    initials: "RK",
    organization: "City Hospital, Jaipur",
    type: "Hospital",
    email: "hygiene@cityhospital.in",
    phone: "+91 94140 99887",
    ordersCount: 12,
    totalSpent: 78000,
    lastActive: "23 Oct 2026",
  },
  {
    id: "cust-4",
    name: "Principal N. Sharma",
    initials: "NS",
    organization: "Jain College, Jaipur",
    type: "College",
    email: "admin@jaincollege.ac.in",
    phone: "+91 94141 22334",
    ordersCount: 3,
    totalSpent: 9000,
    lastActive: "24 Oct 2026",
  },
  {
    id: "cust-5",
    name: "Dr. Ananya Rao",
    initials: "AR",
    organization: "CareFirst Hospital, Bengaluru",
    type: "Hospital",
    email: "care@carefirst.org",
    phone: "+91 98450 33445",
    ordersCount: 8,
    totalSpent: 52000,
    lastActive: "22 Oct 2026",
  },
  {
    id: "cust-6",
    name: "Amit Sharma",
    initials: "AS",
    organization: "Delhi Public School",
    type: "School",
    email: "asharma@dpsdelhi.edu.in",
    phone: "+91 98110 23456",
    ordersCount: 2,
    totalSpent: 13000,
    lastActive: "27 Oct 2026",
  },
];

export default function AdminCustomersPage() {
  const [customers] = useState<CustomerItem[]>(CUSTOMERS_DATA);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedCust, setSelectedCust] = useState<CustomerItem | null>(null);

  const types = ["All", "School", "Hospital", "College", "Workplace"];

  const filtered = customers.filter((c) => {
    const matchesType = filterType === "All" || c.type === filterType;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.organization.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    return matchesType && matchesSearch;
  });

  const handleExportCSV = () => {
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
        subtitle="Manage institutional buyers, representatives, order history, and account activity."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Customers" },
        ]}
        actions={
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export Customers
          </button>
        }
      />

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, school, email..."
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

      {/* Customers Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Customer</th>
                <th className="px-3 py-3.5">Organization</th>
                <th className="px-3 py-3.5">Contact Details</th>
                <th className="px-3 py-3.5">Orders</th>
                <th className="px-3 py-3.5">Total Spent</th>
                <th className="px-3 py-3.5">Last Active</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-[#10469B] text-xs">
                          {c.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{c.name}</div>
                          <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                            {c.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="font-medium text-slate-800">{c.organization}</div>
                    </td>
                    <td className="px-3 py-3.5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {c.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                        <Phone className="h-3 w-3" />
                        {c.phone}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap font-medium text-slate-700">
                      {c.ordersCount} units
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap font-semibold text-slate-900">
                      ₹{c.totalSpent.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {c.lastActive}
                    </td>
                    <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCust(c)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Quick Modal */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-[#10469B] text-sm">
                {selectedCust.initials}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedCust.name}</h3>
                <p className="text-xs text-slate-500">{selectedCust.organization}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-800">{selectedCust.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-800">{selectedCust.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Account Type:</span>
                <span className="font-medium text-slate-800">{selectedCust.type}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Machines Installed:</span>
                <span className="font-bold text-slate-900">{selectedCust.ordersCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lifetime Purchases:</span>
                <span className="font-bold text-[#10469B]">₹{selectedCust.totalSpent.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedCust(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <a
                href={`mailto:${selectedCust.email}`}
                className="rounded-lg bg-[#10469B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2450] transition-colors"
              >
                Email Customer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
