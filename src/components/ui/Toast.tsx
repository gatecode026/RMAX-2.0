"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (opts: { type?: ToastType; title: string; message?: string; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      type = "success",
      title,
      message,
      duration = 3500,
    }: {
      type?: ToastType;
      title: string;
      message?: string;
      duration?: number;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ type: "success", title, message }),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => showToast({ type: "error", title, message }),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => showToast({ type: "info", title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Sweet Alert Style Toast Container */}
      <div
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3.5 rounded-2xl p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in border ${
              t.type === "success"
                ? "bg-white/95 text-slate-800 border-emerald-500/30 shadow-emerald-500/10"
                : t.type === "error"
                ? "bg-white/95 text-slate-800 border-rose-500/30 shadow-rose-500/10"
                : "bg-white/95 text-slate-800 border-blue-500/30 shadow-blue-500/10"
            }`}
          >
            {/* Sweet Alert Icon Circle */}
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
                t.type === "success"
                  ? "bg-emerald-500"
                  : t.type === "error"
                  ? "bg-rose-500"
                  : "bg-[#10469B]"
              }`}
            >
              {t.type === "success" && <CheckCircle2 className="size-5 stroke-[2.5]" />}
              {t.type === "error" && <AlertCircle className="size-5 stroke-[2.5]" />}
              {t.type === "info" && <Info className="size-5 stroke-[2.5]" />}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <p className="font-jakarta font-bold text-sm text-slate-900 leading-tight">
                {t.title}
              </p>
              {t.message && (
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {t.message}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition p-1 -mr-1 -mt-1 rounded-lg"
              aria-label="Close notification"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
