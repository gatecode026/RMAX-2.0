"use client";

import React, { useEffect, useState } from "react";
import { Loader2, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Assignee {
  id: string;
  name: string;
  role: string;
}

/**
 * Assign / reassign one lead through the existing lead PATCH (assignedManagerId). Keeps the dialog
 * open with the error on failure, blocks double submits, and hands the saved lead back on success
 * so the caller can update its row / detail view in place.
 */
export function AssignLeadModal({
  leadId,
  leadLabel,
  currentManagerId,
  onClose,
  onAssigned,
}: {
  leadId: string;
  leadLabel: string;
  currentManagerId?: string;
  onClose: () => void;
  onAssigned: (lead: { assignedManager?: { _id: string; name: string }; status: string }) => void;
}) {
  const { success: toastSuccess } = useToast();
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [selected, setSelected] = useState(currentManagerId ?? "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/manager/assignees")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || "Could not load people to assign to.");
        setAssignees(json.assignees);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load people to assign to."))
      .finally(() => setLoading(false));
  }, []);

  async function submit() {
    if (saving || !selected) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedManagerId: selected }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to assign lead.");
      toastSuccess("Lead assigned", `${leadLabel} is now assigned to ${json.lead?.assignedManager?.name ?? "the selected user"}.`);
      onAssigned(json.lead);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign lead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs" onClick={() => !saving && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Assign lead"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-[#10469B]">
            <UserCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-jakarta text-base font-bold text-slate-900">Assign lead</h3>
            <p className="truncate text-xs text-slate-500">{leadLabel}</p>
          </div>
        </div>

        <label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="assign-to">
          Assign to
        </label>
        <select
          id="assign-to"
          value={selected}
          disabled={loading || saving}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-hidden disabled:opacity-60"
        >
          <option value="" disabled>
            {loading ? "Loading…" : "Select a person"}
          </option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.role === "manager" ? "Manager" : "Admin"})
            </option>
          ))}
        </select>

        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}

        <div className="mt-6 flex justify-end gap-2.5">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving || !selected || selected === currentManagerId}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#10469B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50"
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            {saving ? "Assigning…" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
