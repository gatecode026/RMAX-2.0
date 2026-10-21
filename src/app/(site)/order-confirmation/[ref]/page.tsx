import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Check } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { LineItem, OrderSummary } from "@/components/sections/OrderParts";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { getOrderForConfirmation } from "@/lib/data/orders";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Order Confirmation", robots: { index: false, follow: false } };

async function Confirmation({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const order = await getOrderForConfirmation(ref);
  if (!order) notFound();

  return (
    <>
      <Container className="max-w-[860px] pt-10 md:pt-14">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-charcoal">
          <Check aria-hidden className="size-6" />
        </div>
        <h1 className="mt-8 text-display-sm md:text-display">Thank you. Your order is confirmed.</h1>
        <p className="mt-5 text-body text-muted">This is an illustrative order confirmation. No actual purchase or payment has been made.</p>
        <div className="mt-8 flex justify-center">
          <Pill>Illustrative order · {order.reference}</Pill>
        </div>
      </Container>

      <Container className="mt-12 grid items-start gap-6 md:mt-16 lg:grid-cols-[1fr_370px]">
        <div className="flex flex-col gap-6">
          <Card className="p-7">
            <h2 className="text-title">Your order</h2>
            <div className="mt-5 flex flex-col gap-6">
              {order.items.map((i) => (
                <LineItem key={i.slug} image={i.image} title={i.title} specLine={i.specLine} price={i.unitPrice * i.quantity}>
                  Quantity: {i.quantity}
                </LineItem>
              ))}
            </div>
            <p className="mt-5 text-body-sm text-muted">
              Illustrative order date: {formatDate(order.createdAt)} · {order.reference}
            </p>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-7">
              <h2 className="text-title">Delivery</h2>
              <p className="mt-4 text-body-sm leading-6 text-muted">
                3–5 day delivery · Free shipping
                <br />
                {order.shippingAddress.organization} · {order.shippingAddress.department}
                <br />
                Illustrative address on order detail
              </p>
            </Card>
            <Card className="p-7">
              <h2 className="text-title">What happens next?</h2>
              <p className="mt-4 text-body-sm leading-6 text-muted">
                Order preparation, dispatch and delivery updates appear in Order Detail &amp; Tracking.
              </p>
            </Card>
          </div>

          <div className="flex flex-wrap gap-4">
            <ButtonLink href={`/account/orders/${order.reference}`}>View order &amp; tracking</ButtonLink>
            <ButtonLink href="/compare-models" variant="secondary">
              Continue shopping
            </ButtonLink>
          </div>
        </div>

        <OrderSummary
          lines={order.items.map((i) => ({ quantity: i.quantity, shortName: i.shortName }))}
          subtotal={order.subtotal}
          shipping={order.shipping}
          total={order.total}
        />
      </Container>
    </>
  );
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ ref: string }> }) {
  return (
    <Suspense fallback={<Container className="pt-14"><div className="h-96 animate-pulse rounded-card bg-soft/70" /></Container>}>
      <Confirmation params={params} />
    </Suspense>
  );
}
