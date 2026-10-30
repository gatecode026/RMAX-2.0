import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { CartIntentHandler } from "@/components/sections/CartIntentHandler";
import { CartLineControls } from "@/components/sections/CartLineControls";
import { LineItem, OrderSummary } from "@/components/sections/OrderParts";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCart } from "@/lib/cart";
import { getSessionUser } from "@/lib/session";
import { formatINR, pluralItems } from "@/lib/format";
import { buildSpecLine } from "@/lib/specs";

export const metadata: Metadata = { title: "Shopping Cart" };

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

function describe(lines: { quantity: number; product: { name: string } }[]) {
  const parts = lines.map((l) => `${WORDS[l.quantity] ?? l.quantity} ${l.product.name} ${l.quantity === 1 ? "unit" : "units"}`);
  return `Your cart contains ${parts.join(" and ")}.`;
}

const BASE_LEAD = "Review your model and quantity before checkout.";

async function CartContent() {
  const [cart, customer] = await Promise.all([getCart(), getSessionUser("customer")]);
  const empty = cart.lines.length === 0;
  const hasMaxQuantity = cart.lines.some((l) => l.quantity >= 5);

  return (
    <>
      <CartIntentHandler />
      <PageHero
        breadcrumb="Shopping Cart"
        eyebrow="Shopping Cart"
        title="One step closer to better hygiene."
        lead={empty ? BASE_LEAD : `${BASE_LEAD} ${describe(cart.lines)}`}
      />
      <Container className="mt-12 md:mt-16">
        {!customer ? (
          <Card className="p-7 md:p-8">
            <h2 className="text-title">Your cart</h2>
            <p className="mt-3 text-body text-muted">
              Please log in to your RMAX customer account to access your shopping cart.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/?auth=login&next=/cart">Login</ButtonLink>
              <ButtonLink href="/?auth=register&next=/cart" variant="secondary">
                Create Account
              </ButtonLink>
            </div>
          </Card>
        ) : empty ? (
          // ASSUMED: the designs only show a filled cart.
          <Card className="p-7 md:p-8">
            <h2 className="text-title">Your cart is empty</h2>
            <p className="mt-3 text-body text-muted">Choose a model to get started.</p>
            <ButtonLink href="/compare-models" className="mt-6">
              Browse products
            </ButtonLink>
          </Card>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_370px]">
            <div>
              <Card className="p-7">
                <h2 className="text-title">Your cart · {pluralItems(cart.lines.length)}</h2>
                <div className="mt-5 flex flex-col gap-6">
                  {cart.lines.map((l) => (
                    <div key={l.product.slug}>
                      <LineItem
                        image={l.product.image.src}
                        title={l.product.title}
                        specLine={buildSpecLine(l.product.specs)}
                        price={l.lineTotal}
                      >
                        <CartLineControls slug={l.product.slug} quantity={l.quantity} />
                      </LineItem>
                      <p className="mt-5 text-body-sm text-muted">
                        Launch price {formatINR(l.product.price)} · Original price {formatINR(l.product.originalPrice)} ·{" "}
                        {l.product.discountPercent}% off
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {hasMaxQuantity && (
                <div className="mt-6 rounded-[16px] bg-[#EFF6FF] border border-[#BFDBFE] p-4 text-body-sm text-[#1E40AF]">
                  <p className="font-bold">Direct orders are limited to 5 units max per item.</p>
                  <p className="mt-1 text-[#3B82F6]">
                    Need more units for your campus or hospital? Submit an{" "}
                    <a href="/institutional-quote" className="font-bold underline hover:text-[#1D4ED8]">
                      institutional bulk inquiry
                    </a>{" "}
                    or email us at{" "}
                    <a href="mailto:mukesh@rmaxelectro.com" className="font-bold underline hover:text-[#1D4ED8]">
                      mukesh@rmaxelectro.com
                    </a>{" "}
                    for wholesale pricing and custom installation.
                  </p>
                </div>
              )}

              <Card tone="tint" className="mt-6 rounded-input p-5">
                <p className="text-body-sm font-bold">Buying for an institution?</p>
                <p className="mt-2 text-body-sm text-muted">
                  Direct online orders are capped at 5 max. For 6+ units, tender inquiries, or tailored delivery, please{" "}
                  <a href="/institutional-quote" className="font-bold text-navy hover:underline">
                    request an institutional quote
                  </a>{" "}
                  or write to{" "}
                  <a href="mailto:mukesh@rmaxelectro.com" className="font-bold text-navy hover:underline">
                    mukesh@rmaxelectro.com
                  </a>.
                </p>
                <div className="mt-4 pt-3 border-t border-line/60 text-[12px] text-muted flex flex-wrap gap-x-4 gap-y-1">
                  <span>✓ 1 Year Warranty</span>
                  <span>✓ Piece-to-piece return for defects</span>
                  <span>✓ 100% Made in India</span>
                  <span>✓ Spare parts available post-warranty</span>
                </div>
              </Card>

              <div className="mt-6 flex flex-wrap gap-4">
                <ButtonLink href="/compare-models" variant="secondary">
                  Continue shopping
                </ButtonLink>
                <ButtonLink href="/institutional-quote" variant="secondary">
                  Request institutional quote
                </ButtonLink>
              </div>
              <p className="mt-6 text-body-sm text-muted">Illustrative cart for this website design. No order has been placed.</p>
            </div>

            <OrderSummary
              lines={cart.lines.map((l) => ({ quantity: l.quantity, shortName: l.product.shortName }))}
              subtotal={cart.subtotal}
              shipping={cart.shipping}
              total={cart.total}
            >
              <ButtonLink href="/checkout" className="mt-6 w-full">
                Proceed to checkout
              </ButtonLink>
            </OrderSummary>
          </div>
        )}
      </Container>
    </>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <PageHero breadcrumb="Shopping Cart" eyebrow="Shopping Cart" title="One step closer to better hygiene." lead={BASE_LEAD} />
      }
    >
      <CartContent />
    </Suspense>
  );
}
