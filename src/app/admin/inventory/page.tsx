"use client";

import React, { useState } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Search, AlertTriangle, CheckCircle2, Edit3 } from "lucide-react";
import { DEFAULT_INVENTORY, InventoryItem } from "@/lib/admin/types";

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(DEFAULT_INVENTORY);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newStockVal, setNewStockVal] = useState("");

  const categories = ["All", "Finished Machines", "Heating Coils", "Filters", "Spare Parts"];

  const filtered = items.filter((item) => {
    const matchesCat = filterCategory === "All" || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || newStockVal === "") return;

    const val = Number(newStockVal);
    setItems((prev) =>
      prev.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              inStock: val,
              status: val <= i.reorderPoint ? (val === 0 ? "Out of Stock" : "Low Stock") : "In Stock",
            }
          : i
      )
    );
    setEditingItem(null);
  };

  return (
    <div>
      <AdminPageHeader
        title="Inventory & Spare Parts"
        subtitle="Manage warehouse stock levels for RMAX incinerators, heating coils, odour filters, and components."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Inventory" },
        ]}
      />

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total SKUs</div>
          <div className="mt-1 text-2xl font-bold text-[#0B2450]">{items.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Active warehouse items</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Finished Units In Stock</div>
          <div className="mt-1 text-2xl font-bold text-slate-800">
            {items
              .filter((i) => i.category === "Finished Machines")
              .reduce((sum, i) => sum + i.inStock, 0)}
          </div>
          <div className="text-xs text-emerald-600 mt-0.5">Ready for PAN-India dispatch</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Low Stock Alerts</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {items.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock").length}
          </div>
          <div className="text-xs text-amber-600 mt-0.5">Reorder recommended</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Stock Value</div>
          <div className="mt-1 text-2xl font-bold text-[#10469B]">
            ₹{items.reduce((sum, i) => sum + i.inStock * i.unitCost, 0).toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Cost valuation</div>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, product, component..."
            className="w-full rounded-lg border border-slate-200 bg-[#F4F7FC]/50 pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-[#10469B] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-[#10469B] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-[#E5EBF4] bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">SKU</th>
                <th className="px-3 py-3.5">Item Name</th>
                <th className="px-3 py-3.5">Category</th>
                <th className="px-3 py-3.5">Available Stock</th>
                <th className="px-3 py-3.5">Allocated</th>
                <th className="px-3 py-3.5">Reorder Point</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF4]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pl-5 pr-3 font-mono text-xs font-bold text-slate-800 whitespace-nowrap">
                    {item.sku}
                  </td>
                  <td className="px-3 py-3.5 font-semibold text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.inStock}</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            item.inStock > item.reorderPoint ? "bg-[#10469B]" : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(100, (item.inStock / (item.reorderPoint * 2)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-slate-500">
                    {item.allocated}
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-slate-500">
                    {item.reorderPoint}
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === "In Stock"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.status === "In Stock" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setNewStockVal(String(item.inStock));
                      }}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-[#10469B] hover:bg-blue-50 transition-colors"
                    >
                      <Edit3 className="h-3 w-3" />
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#0B2450] mb-2">Adjust Warehouse Stock</h3>
            <p className="text-xs text-slate-500 mb-4">{editingItem.name} ({editingItem.sku})</p>

            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Physical Stock Count
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#10469B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2450]"
                >
                  Update Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
