"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  PhoneCall,
  Save,
  ChevronRight,
  TrendingUp,
  Trash2,
} from "lucide-react";

interface ActivityItem {
  action: string;
  performedByName: string;
  timestamp: string;
  notes?: string;
}

interface LeadDetail {
  _id: string;
  leadNumber: string;
  name: string;
  email: string;
  phone: string;
  institutionName?: string;
  institutionType?: string;
  source: string;
  status: string;
  priority: string;
  estimatedValue?: number;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  notes?: string;
  activities?: ActivityItem[];
  createdAt: string;
}

export default function ManagerLeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.id as string;

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [newNote, setNewNote] = useState("");

  // Call record modal
  const [showCallModal, setShowCallModal] = useState(false);
  const [callOutcome, setCallOutcome] = useState("Connected - Positive");
  const [callNotes, setCallNotes] = useState("");

  const fetchLead = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`);
      if (!res.ok) {
        if (res.status === 403) {
          setError("Unauthorized: You do not have permission to view this lead.");
        } else {
          setError("Lead record not found.");
        }
        return;
      }
      const data = await res.json();
      const l: LeadDetail = data.lead;
      setLead(l);
      setStatus(l.status);
      setPriority(l.priority);
      setNextFollowUpAt(l.nextFollowUpAt ? l.nextFollowUpAt.slice(0, 10) : "");
    } catch {
      setError("Network error fetching lead details.");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleDeleteLead = async () => {
    if (!lead) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/manager/leads");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete lead");
      }
    } catch {
      alert("Error deleting lead");
    } finally {
      setIsDeleting(false);
    }
  };

  // Update Status & Priority & Follow Up Date
  const handleUpdatePipeline = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          priority,
          nextFollowUpAt: nextFollowUpAt || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
        alert("Lead status and schedule updated successfully!");
      }
    } catch {
      alert("Failed to update lead.");
    } finally {
      setSaving(false);
    }
  };

  // Add General Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newNote.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote }),
      });

      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
        setNewNote("");
      }
    } catch {
      alert("Failed to post note.");
    } finally {
      setSaving(false);
    }
  };

  // Record Phone Call
  const handleRecordCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordCall: true,
          callOutcome,
          callNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
        setShowCallModal(false);
        setCallNotes("");
      }
    } catch {
      alert("Failed to record call.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-3 border-[#10469B] border-t-transparent" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xs">
        <AlertCircle className="mx-auto size-10 text-red-500 mb-2" />
        <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
        <p className="mt-1 text-xs text-slate-500">{error || "Unable to display this lead."}</p>
        <Link
          href="/manager/leads"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#10469B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B2450]"
        >
          <ArrowLeft className="size-3.5" /> Return to My Leads
        </Link>
      </div>
    );
  }

  const isOverdue =
    lead.nextFollowUpAt &&
    lead.status !== "converted" &&
    lead.status !== "lost" &&
    new Date(lead.nextFollowUpAt) < new Date();

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/manager/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#10469B]"
        >
          <ArrowLeft className="size-4" /> Back to My Leads
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
          >
            <Trash2 className="size-3.5" /> Delete Lead
          </button>
          <span className="font-mono text-xs font-bold text-[#10469B] bg-blue-50 px-2.5 py-1 rounded-md">
            {lead.leadNumber}
          </span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-2xl border border-[#E5EBF4] bg-white p-6 shadow-xs flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-jakarta text-2xl font-bold text-slate-900">{lead.name}</h1>
            {isOverdue && (
              <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700">
                OVERDUE FOLLOW-UP
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>{lead.institutionName || "Individual Enquiry"}</span>
            {lead.institutionType && (
              <span className="rounded-sm bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600">
                {lead.institutionType}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCallModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-green-700 transition"
          >
            <PhoneCall className="size-3.5" /> Record Call Log
          </button>
          <a
            href={`tel:${lead.phone}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Phone className="size-3.5 text-[#10469B]" /> Call Client
          </a>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Client Data + Pipeline Controls (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status & Priority Control Box */}
          <div className="rounded-2xl border border-[#E5EBF4] bg-white p-5 shadow-xs">
            <h3 className="font-jakarta text-sm font-bold text-slate-900 mb-3">
              Lead Progression & Pipeline Stage
            </h3>

            {/* Quick Status Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
              {[
                { key: "new", label: "New Lead", color: "blue" },
                { key: "contacted", label: "Contacted", color: "amber" },
                { key: "qualified", label: "Qualified", color: "purple" },
                { key: "proposal_sent", label: "Proposal Sent", color: "indigo" },
                { key: "converted", label: "Converted", color: "green" },
                { key: "lost", label: "Lost", color: "red" },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key)}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    status === s.key
                      ? "border-[#10469B] bg-[#10469B] text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-slate-100 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Priority Rating
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Next Follow-Up Date
                </label>
                <input
                  type="date"
                  value={nextFollowUpAt}
                  onChange={(e) => setNextFollowUpAt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleUpdatePipeline}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#10469B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50 transition"
              >
                <Save className="size-3.5" />
                {saving ? "Saving..." : "Save Pipeline Changes"}
              </button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl border border-[#E5EBF4] bg-white p-5 shadow-xs">
            <h3 className="font-jakarta text-sm font-bold text-slate-900 mb-3">
              Call Logs & Activity Timeline
            </h3>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {lead.activities && lead.activities.length > 0 ? (
                lead.activities.map((act, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-slate-800 capitalize">
                        {act.action.replace(/_/g, " ")}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="size-3" />
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {act.notes && (
                      <p className="mt-2 text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                        {act.notes}
                      </p>
                    )}
                    <span className="mt-1.5 block text-[10px] font-medium text-slate-400">
                      Logged by: {act.performedByName}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-xs text-slate-400 italic">
                  No activities or calls recorded yet.
                </p>
              )}
            </div>

            {/* Quick Add Note Form */}
            <form onSubmit={handleAddNote} className="mt-4 pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Add Follow-Up Note
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record note, quotation details, or discussion..."
                  className="flex-1 rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={saving || !newNote.trim()}
                  className="rounded-xl bg-[#10469B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50 transition"
                >
                  Post Note
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Contact Metadata Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E5EBF4] bg-white p-5 shadow-xs text-xs space-y-3.5">
            <h3 className="font-jakarta text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
              Client & Lead Information
            </h3>

            <div>
              <span className="text-slate-400 text-[11px] block">Contact Person</span>
              <p className="font-semibold text-slate-800 text-[13px] mt-0.5">{lead.name}</p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Phone Number</span>
              <a
                href={`tel:${lead.phone}`}
                className="font-semibold text-[#10469B] hover:underline block mt-0.5"
              >
                {lead.phone}
              </a>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Email Address</span>
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="font-semibold text-[#10469B] hover:underline block mt-0.5 truncate"
                >
                  {lead.email}
                </a>
              ) : (
                <span className="text-slate-400 italic">Not provided</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Institution</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {lead.institutionName || "Individual"}
              </p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Acquisition Source</span>
              <p className="font-semibold text-slate-800 capitalize mt-0.5">{lead.source}</p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Last Contacted</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {lead.lastContactedAt
                  ? new Date(lead.lastContactedAt).toLocaleString()
                  : "Never"}
              </p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Lead Created</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {new Date(lead.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Record Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-jakarta text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Record Customer Call Log
            </h3>

            <form onSubmit={handleRecordCall} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Call Outcome
                </label>
                <select
                  value={callOutcome}
                  onChange={(e) => setCallOutcome(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                >
                  <option value="Connected - Positive Interest">Connected - Positive Interest</option>
                  <option value="Connected - Requested Quotation">Connected - Requested Quotation</option>
                  <option value="Connected - Demo Scheduled">Connected - Demo Scheduled</option>
                  <option value="Connected - Not Interested">Connected - Not Interested</option>
                  <option value="No Answer / Busy">No Answer / Busy</option>
                  <option value="Callback Requested">Callback Requested</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Call Summary & Client Feedback
                </label>
                <textarea
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Discussed incinerator specs, electrical requirements, and pricing..."
                  className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCallModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Call Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Lead Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3 text-red-600">
              <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="font-jakarta text-base font-bold text-slate-900">Delete Lead Record</h3>
                <p className="text-xs text-slate-500">{lead.leadNumber}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete lead <strong className="text-slate-900">{lead.name}</strong>? This action will remove the lead from your active pipeline.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteLead}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
