import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { ChevronRight } from "lucide-react";
import { getOwnedOrder, toOrderDTO, type OrderDTO } from "@/lib/data/orders";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { formatDate, formatINR } from "@/lib/format";
import { modelFromTitle, statusChipText, statusHeadline, STATUS_LABEL } from "@/lib/order-ui";
import { requireUserId } from "@/lib/session";
import { ORDER_STATUSES } from "@/lib/enums";
import { LAST_ORDER_COOKIE } from "@/lib/constants";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Order Detail & Tracking", robots: { index: false, follow: false } };

const DEMO_FALLBACK_ORDER: OrderDTO = {
  _id: "demo-rmax-001",
  reference: "RMAX-DEMO-001",
  contact: {
    fullName: "Asha Rao",
    email: "facilities@example.org",
    phone: "0000000000",
  },
  items: [
    {
      product: "pro",
      slug: "pro",
      title: "Napkin Incinerator Machine (Pro)",
      shortName: "Pro napkin incinerator",
      specLine: "1000 W · 9kg · 200–250/day · 4–5 at once",
      unitPrice: 4500,
      originalPrice: 9000,
      quantity: 1,
      image: "/images/home/card-pro.png",
    },
  ],
  subtotal: 4500,
  shipping: 0,
  total: 4500,
  shippingAddress: {
    organization: "Sample Campus",
    department: "Facilities team",
    street: "Building A, Example Road",
    city: "Pune",
    state: "Maharashtra",
    postalCode: "411001",
    country: "India",
  },
  billing: {
    sameAsShipping: true,
    organization: "Sample Campus",
  },
  payment: {
    method: "Online payment · example selection",
    status: "illustrative",
  },
  status: "preparing",
  timeline: [
    { step: "confirmed", at: "2026-10-08T09:00:00.000Z" },
    { step: "preparing" },
    { step: "dispatched" },
    { step: "delivered" },
  ],
  isIllustrative: true,
  createdAt: "2026-10-08T09:00:00.000Z",
  updatedAt: "2026-10-08T09:00:00.000Z",
};

async function Detail({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;

  let o: OrderDTO | null = null;
  try {
    o = await getOwnedOrder(ref);
    if (!o) {
      const cookieStore = await cookies();
      const lastCookie = cookieStore.get(LAST_ORDER_COOKIE)?.value;
      if (ref === "RMAX-DEMO-001" || ref.startsWith("RMAX-DEMO") || lastCookie === ref) {
        await connectDB();
        const doc = await Order.findOne({ reference: ref }).lean();
        if (doc) o = toOrderDTO(doc);
      }
    }
  } catch {
    // Database or connection fallback
  }

  if (!o && (ref === "RMAX-DEMO-001" || ref.startsWith("RMAX-DEMO"))) {
    o = DEMO_FALLBACK_ORDER;
  }

  if (!o) {
    await requireUserId(`/account/orders/${ref}`);
    notFound();
  }

  const model = o.items.length === 1 ? `Your ${modelFromTitle(o.items[0].title)} order` : "Your order";
  const a = o.shippingAddress;
  const currentIdx = ORDER_STATUSES.indexOf(o.status);

  return (
    <div className="w-full -mb-16 md:-mb-24 pb-16 md:pb-24 pt-6 sm:pt-8 bg-[linear-gradient(90deg,#E1F5FF_0%,#FFFFFF_48%,#EAF1FF_100%)]">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 xl:px-0">
        {/* Page introduction matching Figma 18 Order Detail & Tracking */}
        <div className="flex flex-col items-start gap-4.5 pt-2 pb-8 sm:pb-10">
          {/* Breadcrumb trail */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-sans text-[14px]">
            <Link href="/" className="text-[#64748B] hover:text-[#0B62FF] transition-colors">
              Home
            </Link>
            <ChevronRight className="size-4 text-[#64748B]" aria-hidden="true" />
            <span className="font-sans text-[12px] font-normal leading-4 text-[#0B62FF]" aria-current="page">
              Order Detail &amp; Tracking
            </span>
          </nav>

          {/* Eyebrow */}
          <p className="font-sans text-[12px] font-extrabold leading-4 tracking-wider text-[#0B62FF] uppercase">
            ORDER DETAIL &amp; TRACKING
          </p>

          {/* Heading & Description */}
          <div className="flex flex-col items-start gap-3.5 max-w-[940px]">
            <h1 className="font-jakarta text-[32px]/[38px] sm:text-[42px]/[48px] md:text-[52px]/[60px] font-extrabold tracking-[-1.5px] text-[#020618]">
              {model} {statusHeadline(o.status)}.
            </h1>
            <p className="font-sans text-[15px] sm:text-[16px]/[28px] text-[#62748E]">
              Order {o.reference} · Placed {formatDate(o.createdAt)} · All order, address and tracking information is illustrative.
            </p>
          </div>
        </div>

        {/* Content Section: 786px left column + 370px right column with 24px gap */}
        <div className="grid lg:grid-cols-[786px_370px] gap-6 items-start">
          {/* Left Column (786px width) */}
          <div className="flex flex-col gap-6">
            {/* Card 1: Delivery progress */}
            <div className="rounded-[30px] border border-[#94A3B8]/20 bg-white p-7 shadow-sm flex flex-col gap-5">
              {/* Illustrative Order Pill */}
              <div className="inline-flex items-center self-start px-3.5 py-1.75 rounded-full bg-[#EFF6FF]">
                <span className="font-sans font-extrabold text-[12px] leading-4 text-[#0B62FF] uppercase tracking-wider">
                  {o.isIllustrative ? `ILLUSTRATIVE ORDER · ${o.reference}` : `ORDER · ${o.reference}`}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-jakarta font-extrabold text-[24px]/[28px] text-[#020618]">
                Delivery progress
              </h2>

              {/* Status Pill */}
              <div className="inline-flex items-center self-start px-3.5 py-1.75 rounded-full bg-[#EFF6FF]">
                <span className="font-sans font-extrabold text-[12px] leading-4 text-[#0B62FF]">
                  {statusChipText(o.status, o.isIllustrative)}
                </span>
              </div>

              {/* Tracking steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-1" aria-label="Delivery progress">
                {ORDER_STATUSES.map((step, i) => {
                  const reached = i <= currentIdx;
                  const at = o.timeline.find((t) => t.step === step)?.at;
                  const sub =
                    i === currentIdx && step !== "confirmed"
                      ? "Current status"
                      : reached && at
                      ? formatDate(at)
                      : "Pending";

                  return (
                    <div key={step} className="flex flex-col items-start gap-3 flex-1 min-w-0">
                      {/* Step marker row with connector */}
                      <div className="flex items-center gap-2 w-full h-4" aria-hidden="true">
                        <span
                          className={cn(
                            "size-4 shrink-0 rounded-full",
                            reached ? "bg-[#0B62FF]" : "bg-[#CBD5E1]"
                          )}
                        />
                        {i < ORDER_STATUSES.length - 1 && (
                          <span className="h-[2px] flex-1 bg-[#E2E8F0]" />
                        )}
                      </div>

                      {/* Milestone Title */}
                      <p
                        className={cn(
                          "font-sans text-[13px] font-bold leading-[18px]",
                          reached ? "text-[#0B62FF]" : "text-[#62748E]"
                        )}
                      >
                        {STATUS_LABEL[step]}
                      </p>

                      {/* Subtext */}
                      <p className="font-sans text-[14px] leading-[23px] text-[#62748E]">
                        {sub}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Helper note */}
              <p className="font-sans text-[14px]/[23px] text-[#62748E]">
                Supplied delivery window: 3–5 days. Courier and tracking reference will appear after dispatch; no live tracking details are provided in this sample.
              </p>
            </div>

            {/* Card 2: Purchased item */}
            <div className="rounded-[30px] border border-[#94A3B8]/20 bg-white p-7 shadow-sm flex flex-col gap-5">
              <h2 className="font-jakarta font-extrabold text-[24px]/[28px] text-[#020618]">
                Purchased item
              </h2>
              <div className="flex flex-col gap-6">
                {o.items.map((i) => {
                  const itemImage =
                    i.slug === "basic"
                      ? "/images/home/card-basic.png"
                      : i.slug === "pro"
                      ? "/images/home/card-pro.png"
                      : i.slug === "pro-max"
                      ? "/images/home/card-pro-max.png"
                      : (i.image || "/images/home/card-pro.png");

                  return (
                    <div key={i.slug} className="flex flex-wrap sm:flex-nowrap items-center gap-5 w-full">
                      <div className="relative size-[118px] shrink-0 overflow-hidden rounded-[18px] bg-[#F1F5F9]">
                        <Image
                          src={itemImage}
                          alt={i.title}
                          fill
                          className="object-cover"
                          sizes="118px"
                        />
                      </div>
                      <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
                        <h3 className="font-jakarta font-extrabold text-[20px]/[23px] text-[#020618]">
                          {i.title}
                        </h3>
                        <p className="font-sans text-[14px]/[23px] text-[#62748E]">
                          {i.specLine}
                        </p>
                        <p className="font-sans font-bold text-[14px] leading-[19px] text-[#0F172A]">
                          Quantity: {i.quantity}
                        </p>
                      </div>
                      <p className="font-jakarta font-extrabold text-[24px]/[30px] text-[#020618] sm:ml-auto shrink-0">
                        {formatINR(i.unitPrice * i.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content Row: 2 Cards side by side (381px each in Figma) */}
            <div className="grid sm:grid-cols-2 gap-6 w-full">
              {/* Card 3: Shipping address */}
              <div className="rounded-[30px] border border-[#94A3B8]/20 bg-white p-7 shadow-sm flex flex-col gap-5">
                <h2 className="font-jakarta font-extrabold text-[20px]/[23px] text-[#020618]">
                  Shipping address
                </h2>
                <div className="font-sans text-[14px]/[23px] text-[#62748E] flex flex-col">
                  <p>{a.organization}</p>
                  <p>{o.contact.fullName} · {a.department}</p>
                  <p>{[a.street, a.line2].filter(Boolean).join(", ")}</p>
                  <p>{a.city}, {a.state} {a.postalCode}</p>
                  <p>{a.country}</p>
                  <p>Illustrative address only</p>
                </div>
              </div>

              {/* Card 4: Billing & payment */}
              <div className="rounded-[30px] border border-[#94A3B8]/20 bg-white p-7 shadow-sm flex flex-col gap-5">
                <h2 className="font-jakarta font-extrabold text-[20px]/[23px] text-[#020618]">
                  Billing &amp; payment
                </h2>
                <div className="font-sans text-[14px]/[23px] text-[#62748E] flex flex-col">
                  <p>{o.billing.organization || a.organization}</p>
                  <p>
                    {o.billing.sameAsShipping ? "Billing address same as shipping" : "Separate billing address"}
                  </p>
                  <p>Order total: {formatINR(o.total)}</p>
                  <p>Payment status: illustrative only</p>
                  <p>No transaction or tax rate assumed.</p>
                  {o.billing.poReference && <p>PO reference: {o.billing.poReference}</p>}
                </div>
              </div>
            </div>

            {/* Order Support Actions */}
            <div className="flex flex-col items-start gap-3 w-full pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/contact-us"
                  className="inline-flex items-center justify-center h-[50px] px-5 rounded-full bg-[linear-gradient(90deg,#0B62FF_0%,#0EA5E9_100%)] text-white font-sans font-bold text-[14px] leading-5 shadow-sm hover:opacity-95 transition-opacity"
                >
                  Contact service
                </Link>
                <Link
                  href="/account/orders"
                  className="inline-flex items-center justify-center h-[50px] px-5 rounded-full bg-white border border-[#0B62FF]/18 text-[#0B62FF] font-sans font-bold text-[14px] leading-5 hover:bg-[#EFF6FF] transition-colors"
                >
                  Back to My Orders
                </Link>
              </div>
              <p className="font-sans text-[14px]/[23px] text-[#62748E]">
                For service or exchanges, use the contact form with this order reference and model. 1 year warranty · Exchange only.
              </p>
            </div>
          </div>

          {/* Right Column (370px width) */}
          <div className="w-full">
            <div className="rounded-[30px] border border-[#94A3B8]/20 bg-white p-7 shadow-sm flex flex-col gap-5 w-full">
              <h2 className="font-jakarta font-extrabold text-[24px]/[28px] text-[#020618]">
                Order summary
              </h2>

              <div className="flex flex-col gap-1">
                {o.items.map((i) => (
                  <p key={i.slug} className="font-sans text-[14px]/[23px] text-[#62748E]">
                    {i.quantity} × {i.shortName}
                  </p>
                ))}
              </div>

              <div className="h-[1px] w-full bg-[#E2E8F0]" />

              <div className="flex items-center justify-between font-sans text-[14px]">
                <span className="font-bold text-[#0F172A]">Subtotal</span>
                <span className="font-bold text-[#0F172A]">{formatINR(o.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between font-sans text-[14px]">
                <span className="font-bold text-[#0F172A]">Shipping</span>
                <span className="font-bold text-[#0B62FF]">
                  {o.shipping === 0 ? "Free" : formatINR(o.shipping)}
                </span>
              </div>

              <div className="h-[1px] w-full bg-[#E2E8F0]" />

              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-[14px] text-[#0F172A]">Total</span>
                <span className="font-jakarta font-extrabold text-[28px]/[35px] text-[#020618]">
                  {formatINR(o.total)}
                </span>
              </div>

              <div className="flex flex-col gap-3 pt-1">
                <p className="font-sans text-[14px]/[23px] text-[#62748E]">
                  No tax rate is assumed in this illustrative order.
                </p>
                <p className="font-sans text-[14px]/[23px] text-[#62748E]">
                  Free shipping · 3–5 day delivery
                  <br />
                  1 year warranty · Exchange only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[600px] pt-8 bg-[linear-gradient(90deg,#E1F5FF_0%,#FFFFFF_48%,#EAF1FF_100%)]">
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 xl:px-0">
            <div className="h-64 animate-pulse rounded-[30px] bg-white/70" />
          </div>
        </div>
      }
    >
      <Detail params={params} />
    </Suspense>
  );
}
