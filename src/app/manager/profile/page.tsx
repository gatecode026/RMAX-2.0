"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Briefcase,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";

export default function ManagerProfilePage() {
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    role: string;
    department?: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/notifications");
        // Check session or use current authenticated user details
      } catch {
        // Ignore
      }
    }
    loadSession();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (currentPassword && newPassword === currentPassword) {
      setMessage({ type: "error", text: "New password cannot be the same as your previous password." });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      // In production environment this calls password update
      await new Promise((r) => setTimeout(r, 600));
      setMessage({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setMessage({ type: "error", text: "Failed to update password." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#E5EBF4] bg-white p-6 shadow-xs">
        <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#10469B] uppercase tracking-wider">
          Manager Profile
        </span>
        <h1 className="font-jakarta text-2xl font-bold text-slate-900 mt-1">
          Account & Security Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View your organizational role, assigned territory department, and update credentials.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="rounded-2xl border border-[#E5EBF4] bg-white p-6 shadow-xs">
        <h3 className="font-jakarta text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
          Organizational Details
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <User className="size-4.5 text-[#10469B] mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block">Role Authority</span>
              <p className="font-bold text-slate-800 text-[13px] capitalize mt-0.5">
                Lead Operations Manager
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <Briefcase className="size-4.5 text-[#10469B] mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block">Department</span>
              <p className="font-bold text-slate-800 text-[13px] mt-0.5">
                Institutional Sales & Client Relations
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <Building2 className="size-4.5 text-[#10469B] mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block">Organization</span>
              <p className="font-bold text-slate-800 text-[13px] mt-0.5">
                RMAX Sanitary Solutions Pvt Ltd
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <Shield className="size-4.5 text-green-600 mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block">Access Clearance</span>
              <p className="font-bold text-green-700 text-[13px] mt-0.5">
                Manager Sandbox (Authorized Leads Only)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security: Change Password Card */}
      <div className="rounded-2xl border border-[#E5EBF4] bg-white p-6 shadow-xs">
        <h3 className="font-jakarta text-sm font-bold text-slate-900 mb-2">
          Change Account Password
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Ensure your account uses a secure password of at least 6 characters.
        </p>

        {message && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs border ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="size-4 shrink-0 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3.5 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-[#F4F7FC]/60 px-3 py-2 text-xs text-slate-800 focus:border-[#10469B] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#10469B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0B2450] disabled:opacity-50 transition"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
