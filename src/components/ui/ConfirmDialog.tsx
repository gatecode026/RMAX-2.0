"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CheckCircle2, Loader2, Trash2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

/** Website-styled confirmation modal (design-system card, 28px action buttons). Esc and backdrop click cancel. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  hideCancel = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary" | "success";
  /** Single-button popup (e.g. a success message). Esc and backdrop click still call onCancel. */
  hideCancel?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    (cancelRef.current ?? confirmRef.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;
  const danger = tone === "danger";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/50 p-5 backdrop-blur-sm"
      onClick={() => !busy && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Confirmation"}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-card border border-line bg-card p-7 shadow-[0_24px_56px_rgba(35,42,50,0.18)]"
      >
        <div className={cn("grid size-12 place-items-center rounded-full", danger ? "bg-danger-soft text-danger" : tone === "success" ? "bg-success-soft text-success" : "bg-soft text-navy")}>
          {danger ? <Trash2 className="size-5" aria-hidden /> : tone === "success" ? <CheckCircle2 className="size-6" aria-hidden /> : <TriangleAlert className="size-5" aria-hidden />}
        </div>
        <h3 className="mt-5 font-heading text-[22px]/[30px] font-extrabold tracking-[-0.5px] text-charcoal">{title}</h3>
        {description && <p className="mt-2 text-body-sm text-muted">{description}</p>}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {!hideCancel && (
          <button
            ref={cancelRef}
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="inline-flex h-12 items-center justify-center rounded-action border border-line bg-card px-7 text-body font-bold text-navy transition hover:border-navy hover:bg-soft disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          )}
          <button
            ref={confirmRef}
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={cn(
              "inline-flex h-12 items-center justify-center gap-2 rounded-action px-7 text-body font-bold text-white transition hover:brightness-110 active:brightness-95 disabled:opacity-60",
              danger ? "bg-danger" : tone === "success" ? "bg-success" : "bg-linear-to-r from-navy to-navy-600",
            )}
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
