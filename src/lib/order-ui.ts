import { ORDER_STATUSES, type OrderStatus } from "@/lib/enums";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  confirmed: "Confirmed",
  preparing: "Preparing",
  dispatched: "Dispatched",
  delivered: "Delivered",
};

/** "Preparing · Example" for illustrative orders. */
export function statusChipText(status: OrderStatus, illustrative = true): string {
  return illustrative ? `${STATUS_LABEL[status]} · Example` : STATUS_LABEL[status];
}

/** Headline verb phrase for the order detail page. */
export function statusHeadline(status: OrderStatus): string {
  switch (status) {
    case "confirmed":
      return "is confirmed";
    case "preparing":
      return "is being prepared";
    case "dispatched":
      return "has been dispatched";
    case "delivered":
      return "has been delivered";
  }
}

export const STATUS_OPTIONS = ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }));

/** "Pro" from "Napkin Incinerator Machine (Pro)" */
export function modelFromTitle(title: string): string {
  return /\(([^)]+)\)/.exec(title)?.[1] ?? title;
}
