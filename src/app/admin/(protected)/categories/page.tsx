"use client";

import React, { useEffect, useState, useCallback } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2, Loader2, FolderTree, Pencil, Check, X } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
}

export default function AdminCategoriesPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) setCategories(json.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to create category");
      toastSuccess(`Category "${name}" created.`);
      setName("");
      setDescription("");
      load();
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Failed to create category");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(cat: Category) {
    const res = await fetch(`/api/admin/categories/${cat._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !cat.active }),
    });
    const json = await res.json();
    if (json.success) load();
  }

  async function handleRename(cat: Category) {
    if (!editName.trim()) return;
    const res = await fetch(`/api/admin/categories/${cat._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    const json = await res.json();
    if (json.success) {
      setEditingId(null);
      load();
    } else {
      toastError(json.error || "Failed to rename");
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${cat._id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toastSuccess("Category deleted.");
      load();
    } else {
      toastError(json.error || "Failed to delete category");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        subtitle="Organize the product catalogue into categories."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Products", href: "/admin/products" }, { label: "Categories" }]}
      />

      <form onSubmit={handleCreate} className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">Category Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Incinerators" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#10469B] focus:outline-none" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#10469B] focus:outline-none" />
        </div>
        <button type="submit" disabled={creating || !name.trim()} className="inline-flex items-center gap-1.5 rounded-lg bg-[#10469B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Category
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-[#E5EBF4] bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Loading…</div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center">
            <FolderTree className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No categories yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E5EBF4] bg-[#F4F7FC] text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3F9]">
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td className="px-4 py-3 font-semibold text-[#0B2450]">
                    {editingId === cat._id ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded border border-slate-200 px-2 py-1 text-sm" />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{cat.slug}</td>
                  <td className="px-4 py-3 text-slate-500">{cat.description || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cat.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}
                    >
                      {cat.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === cat._id ? (
                        <>
                          <button onClick={() => handleRename(cat)} className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"><Check className="h-4 w-4" /></button>
                          <button onClick={() => setEditingId(null)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(cat._id);
                            setEditName(cat.name);
                          }}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#10469B]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(cat)} className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
