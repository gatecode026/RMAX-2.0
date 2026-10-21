import { ORDER_STATUSES, type OrderStatus } from "@/lib/enums";
import { STATUS_LABEL } from "@/lib/order-ui";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Four-step delivery stepper: Confirmed → Preparing → Dispatched → Delivered. */
export function OrderTimeline({ status, timeline }: { status: OrderStatus; timeline: { step: OrderStatus; at?: string }[] }) {
  const currentIdx = ORDER_STATUSES.indexOf(status);
  return (
    <ol className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4" aria-label="Delivery progress">
      {ORDER_STATUSES.map((step, i) => {
        const reached = i <= currentIdx;
        const at = timeline.find((t) => t.step === step)?.at;
        const sub = i === currentIdx && step !== "confirmed" ? "Current status" : reached && at ? formatDate(at) : "Pending";
        return (
          <li key={step} aria-current={i === currentIdx ? "step" : undefined}>
            <div className="flex items-center gap-2" aria-hidden>
              <span className={cn("size-4 shrink-0 rounded-full", reached ? "bg-navy" : "bg-line")} />
              <span className="h-px flex-1 bg-line" />
            </div>
            <p className={cn("mt-3 text-body-sm font-bold", reached ? "text-navy" : "text-charcoal")}>{STATUS_LABEL[step]}</p>
            <p className="mt-3 text-body-sm text-muted">{sub}</p>
          </li>
        );
      })}
    </ol>
  );
}
