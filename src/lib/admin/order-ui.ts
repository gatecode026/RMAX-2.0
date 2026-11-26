import type { OrderStatus } from "@/lib/enums";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  confirmed: "Confirmed",
  preparing: "Preparing",
  dispatched: "Dispatched",
  delivered: "Delivered",
};

export const STATUS_STYLE: Record<OrderStatus, string> = {
  confirmed: "bg-slate-100 text-slate-700 border-slate-200",
  preparing: "bg-amber-50 text-amber-700 border-amber-200",
  dispatched: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};
