"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { Search, AlertTriangle, CheckCircle2, Edit3, X, RefreshCw } from "lucide-react";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  inStock: number;
  reorderPoint: number;
  unitCost: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastRestocked: string;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newStockVal, setNewStockVal] = useState("");
  const [saving, setSaving] = useState(false);

  const categories = ["All", "Finished Machines", "Spare Parts", "Vending Machines"];

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const filtered = items.filter((item) => {
    const matchesCat = filterCategory === "All" || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || newStockVal === "") return;

    const val = Number(newStockVal);
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/inventory/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: val }),
      });
      if (res.ok) {
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
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
    } finally {
      setSaving(false);
    }
  };

  const totalSKUs = items.length;
  const inStockCount = items.filter((i) => i.status === "In Stock").length;
  const lowStockCount = items.filter((i) => i.status === "Low Stock").length;
  const outOfStockCount = items.filter((i) => i.status === "Out of Stock").length;
  const totalValue = items.reduce((acc, i) => acc + i.inStock * i.unitCost, 0);

  return (
    <div>
      <AdminPageHeader
        title="Inventory & Warehouse Stock"
        subtitle="Manage live stock levels for RMAX incinerators and components connected directly to MongoDB."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Inventory" },
        ]}
        actions={
          <button
            onClick={fetchInventory}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Stock
          </button>
        }
      />

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total SKUs</div>
          <div className="mt-1 text-2xl font-bold text-[#0B2450]">{totalSKUs}</div>
          <div className="text-xs text-slate-500 mt-0.5">Active warehouse models</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Healthy Stock</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{inStockCount}</div>
          <div className="text-xs text-slate-500 mt-0.5">Above reorder threshold</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Low Stock Alert</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">{lowStockCount}</div>
          <div className="text-xs text-slate-500 mt-0.5">Requires replenishment</div>
        </div>
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Out of Stock</div>
          <div className="mt-1 text-2xl font-bold text-rose-600">{outOfStockCount}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total Valuation: ₹{totalValue.toLocaleString("en-IN")}</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKUs or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-[#10469B] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterCategory === c
                  ? "bg-[#10469B] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm font-medium text-slate-500">
            Loading real inventory from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No products found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E5EBF4] bg-[#F8FAFC] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">SKU & Item Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5 text-center">In Stock</th>
                  <th className="px-5 py-3.5 text-center">Reorder Point</th>
                  <th className="px-5 py-3.5">Unit Price</th>
                  <th className="px-5 py-3.5">Stock Status</th>
                  <th className="px-5 py-3.5">Last Restocked</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF4]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#0B2450]">{item.name}</div>
                      <div className="text-xs font-mono text-slate-400">{item.sku}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`text-base font-bold ${
                          item.inStock === 0
                            ? "text-rose-600"
                            : item.inStock <= item.reorderPoint
                            ? "text-amber-600"
                            : "text-[#0B2450]"
                        }`}
                      >
                        {item.inStock}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-xs text-slate-500 font-medium">
                      {item.reorderPoint} units
                    </td>
                    <td className="px-5 py-4 font-bold text-[#0B2450]">
                      ₹{item.unitCost.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.status === "In Stock"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.status === "Low Stock"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
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
                    <td className="px-5 py-4 text-xs text-slate-500">{item.lastRestocked}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setNewStockVal(String(item.inStock));
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Edit3 className="h-3 w-3" />
                        Update Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-jakarta text-base font-bold text-slate-900">Update Stock Level</h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-2 text-xs text-slate-500">{editingItem.name} ({editingItem.sku})</div>

            <form onSubmit={handleUpdateStock} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Quantity in Stock
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#10469B] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#10469B] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B2450] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
