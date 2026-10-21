import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { LineItem, OrderSummary } from "@/components/sections/OrderParts";
import { OrderTimeline } from "@/components/sections/OrderTimeline";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill, StatusChip } from "@/components/ui/Pill";
import { getOwnedOrder } from "@/lib/data/orders";
import { formatDate, formatINR } from "@/lib/format";
import { modelFromTitle, statusChipText, statusHeadline } from "@/lib/order-ui";
import { requireUserId } from "@/lib/session";

export const metadata: Metadata = { title: "Order Detail & Tracking", robots: { index: false, follow: false } };

async function Detail({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  await requireUserId(`/account/orders/${ref}`);
  const o = await getOwnedOrder(ref);
  if (!o) notFound();

  const model = o.items.length === 1 ? `Your ${modelFromTitle(o.items[0].title)} order` : "Your order";
  const a = o.shippingAddress;
  return (
    <>
      <PageHero
        breadcrumb="Order Detail & Tracking"
        eyebrow="Order Detail & Tracking"
        title={`${model} ${statusHeadline(o.status)}.`}
        lead={`Order ${o.reference} · Placed ${formatDate(o.createdAt)} · All order, address and tracking information is illustrative.`}
      />
      <Container className="mt-12 grid items-start gap-6 md:mt-16 lg:grid-cols-[1fr_370px]">
        <div className="flex flex-col gap-6">
          <Card className="p-7">
            <Pill>Illustrative order · {o.reference}</Pill>
            <h2 className="mt-4 text-title">Delivery progress</h2>
            <StatusChip className="mt-4">{statusChipText(o.status, o.isIllustrative)}</StatusChip>
            <div className="mt-6">
              <OrderTimeline status={o.status} timeline={o.timeline} />
            </div>
            <p className="mt-6 text-body-sm text-muted">
              Supplied delivery window: 3–5 days. Courier and tracking reference will appear after dispatch; no live tracking details
              are provided in this sample.
            </p>
          </Card>

          <Card className="p-7">
            <h2 className="text-title">Purchased item</h2>
            <div className="mt-5 flex flex-col gap-6">
              {o.items.map((i) => (
                <LineItem key={i.slug} image={i.image} title={i.title} specLine={i.specLine} price={i.unitPrice * i.quantity}>
                  Quantity: {i.quantity}
                </LineItem>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-7">
              <h2 className="text-title">Shipping address</h2>
              <p className="mt-4 text-body-sm leading-6 text-muted">
                {a.organization}
                <br />
                {o.contact.fullName} · {a.department}
                <br />
                {[a.street, a.line2].filter(Boolean).join(", ")}
                <br />
                {a.city}, {a.state} {a.postalCode}
                <br />
                {a.country}
                <br />
                Illustrative address only
              </p>
            </Card>
            <Card className="p-7">
              <h2 className="text-title">Billing &amp; payment</h2>
              <p className="mt-4 text-body-sm leading-6 text-muted">
                {o.billing.organization}
                <br />
                {o.billing.sameAsShipping ? "Billing address same as shipping" : "Separate billing address"}
                <br />
                Order total: {formatINR(o.total)}
                <br />
                Payment status: illustrative only
                <br />
                No transaction or tax rate assumed.
                {o.billing.poReference && (
                  <>
                    <br />
                    PO reference: {o.billing.poReference}
                  </>
                )}
              </p>
            </Card>
          </div>

          <div className="flex flex-wrap gap-4">
            <ButtonLink href="/contact-us">Contact service</ButtonLink>
            <ButtonLink href="/account/orders" variant="secondary">
              Back to My Orders
            </ButtonLink>
          </div>
          <p className="text-body-sm text-muted">
            For service or exchanges, use the contact form with this order reference and model. 1 year warranty · Exchange only.
          </p>
        </div>

        <OrderSummary
          lines={o.items.map((i) => ({ quantity: i.quantity, shortName: i.shortName }))}
          subtotal={o.subtotal}
          shipping={o.shipping}
          total={o.total}
        />
      </Container>
    </>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  return (
    <Suspense fallback={<Container className="pt-14"><div className="h-96 animate-pulse rounded-card bg-soft/70" /></Container>}>
      <Detail params={params} />
    </Suspense>
  );
}
