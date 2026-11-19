"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { PERMISSION_GROUPS, PERMISSION_PARENT, normalizePermissions, type ManagerPermissions, type PermissionKey } from "@/lib/permissions";
import { AlertCircle, CheckCircle2, Loader2, Search, ShieldCheck } from "lucide-react";

interface ManagerRow {
  _id: string;
  name: string;
  email: string;
  status: string;
}

function Switch({ checked, disabled, label, onChange }: { checked: boolean; disabled?: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10469B] disabled:cursor-not-allowed disabled:opacity-40",
        checked ? "bg-[#10469B]" : "bg-slate-300",
      )}
    >
      <span className={cn("inline-block size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}

/** Admin-only: choose which pages and actions each manager gets. Saved per manager; applies to their next request and live to open sessions. */
export default function ManagerPermissionsPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [managers, setManagers] = useState<ManagerRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [saved, setSaved] = useState<ManagerPermissions | null>(null);
  const [draft, setDraft] = useState<ManagerPermissions | null>(null);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/managers")
      .then((r) => r.json())
      .then((json) => {
        const list: ManagerRow[] = json.managers ?? json.data ?? [];
        setManagers(list);
        if (list[0]) setSelectedId(list[0]._id);
      })
      .catch(() => setError("Could not load managers."))
      .finally(() => setLoadingList(false));
  }, []);

  const loadPermissions = useCallback(async (id: string) => {
    setLoadingPerms(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/managers/${id}/permissions`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load permissions");
      setSaved(json.permissions);
      setDraft(json.permissions);
    } catch (e) {
      setSaved(null);
      setDraft(null);
      setError(e instanceof Error ? e.message : "Failed to load permissions");
    } finally {
      setLoadingPerms(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) void loadPermissions(selectedId);
  }, [selectedId, loadPermissions]);

  const dirty = useMemo(() => Boolean(saved && draft && JSON.stringify(saved) !== JSON.stringify(draft)), [saved, draft]);

  function setSwitch(key: PermissionKey, value: boolean) {
    if (!draft) return;
    // Turning a page off also turns its actions off (the server normalises the same way).
    setDraft(normalizePermissions({ ...draft, [key]: value }, draft));
  }

  async function save() {
    if (!selectedId || !draft || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/managers/${selectedId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: draft }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to save permissions");
      setSaved(json.permissions);
      setDraft(json.permissions);
      const name = managers.find((m) => m._id === selectedId)?.name ?? "Manager";
      toastSuccess("Permissions saved", `Access updated for ${name}. Open sessions update automatically.`);
    } catch (e) {
      toastError("Permissions not saved", e instanceof Error ? e.message : "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  }

  const filtered = managers.filter((m) => `${m.name} ${m.email}`.toLowerCase().includes(search.trim().toLowerCase()));
  const selected = managers.find((m) => m._id === selectedId);

  return (
    <div>
      <AdminPageHeader
        title="Manager Permissions"
        subtitle="Control which pages and actions each manager can use."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Manager Permissions" }]}
      />

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Manager picker */}
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search managers…"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none"
            />
          </div>
          <div className="flex max-h-[360px] flex-col gap-1 overflow-y-auto lg:max-h-[560px]" role="listbox" aria-label="Managers">
            {loadingList ? (
              <p className="py-6 text-center text-sm text-slate-400">Loading managers…</p>
            ) : filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">{managers.length ? "No managers match." : "No manager accounts yet."}</p>
            ) : (
              filtered.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  role="option"
                  aria-selected={m._id === selectedId}
                  onClick={() => {
                    if (m._id === selectedId) return;
                    if (dirty && !window.confirm("Discard unsaved permission changes?")) return;
                    setSelectedId(m._id);
                  }}
                  className={cn(
                    "flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition",
                    m._id === selectedId ? "border-[#10469B] bg-[#10469B]/5" : "border-transparent hover:bg-slate-50",
                  )}
                >
                  <span className="text-sm font-semibold text-[#0B2450]">{m.name}</span>
                  <span className="text-xs text-slate-500">{m.email}</span>
                  {m.status === "inactive" && <span className="mt-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Inactive</span>}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Switches */}
        <div className="rounded-xl border border-[#E5EBF4] bg-white p-4 shadow-sm sm:p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {!selected ? (
            <p className="py-10 text-center text-sm text-slate-400">Select a manager to edit their permissions.</p>
          ) : loadingPerms || !draft ? (
            <div className="flex min-h-[200px] items-center justify-center text-slate-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading permissions…
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-[#10469B]/10 text-[#10469B]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-[#0B2450]">{selected.name}</p>
                  <p className="truncate text-xs text-slate-500">{selected.email}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {PERMISSION_GROUPS.map((g) => {
                  const pageOn = draft[g.page];
                  return (
                    <section key={g.page} className="rounded-xl border border-[#E5EBF4] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#0B2450]">{g.title}</h3>
                          <p className="text-xs text-slate-500">{g.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600">View</span>
                          <Switch checked={pageOn} label={`${g.title}: view`} onChange={(v) => setSwitch(g.page, v)} />
                        </div>
                      </div>
                      {g.actions.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2.5 border-t border-[#F0F3F9] pt-3">
                          {g.actions.map((a) => (
                            <div key={a.key} className="flex items-center justify-between gap-3">
                              <span className={cn("text-sm", pageOn ? "text-slate-700" : "text-slate-400")}>
                                {a.label}
                                {!pageOn && PERMISSION_PARENT[a.key] && <span className="ml-2 text-[11px] text-slate-400">(turn on View first)</span>}
                              </span>
                              <Switch checked={draft[a.key]} disabled={!pageOn} label={`${g.title}: ${a.label}`} onChange={(v) => setSwitch(a.key, v)} />
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                {dirty ? (
                  <p className="text-xs font-medium text-amber-600">Unsaved changes</p>
                ) : (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Saved — this is what the manager has now
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!dirty || saving}
                    onClick={() => setDraft(saved)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    disabled={!dirty || saving}
                    onClick={save}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#10469B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save permissions
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
