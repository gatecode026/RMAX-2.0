import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { CheckoutForm } from "@/components/sections/CheckoutForm";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCart } from "@/lib/cart";
import { getCurrentUserProfile } from "@/lib/data/users";
import { formatINR } from "@/lib/format";
import type { CheckoutInput } from "@/lib/validations/schemas";

export const metadata: Metadata = { title: "Checkout" };

async function CheckoutContent() {
  const [cart, user] = await Promise.all([getCart(), getCurrentUserProfile()]);
  const empty = cart.lines.length === 0;
  const description = cart.lines.map((l) => `${l.quantity} ${l.product.name} ${l.quantity === 1 ? "unit" : "units"}`).join(" and ");

  const ship = user?.shippingAddress;
  const defaults: Partial<CheckoutInput> | undefined = user
    ? {
        fullName: user.name,
        email: user.email,
        phone: user.phone ?? "",
        organization: ship?.organization ?? user.organization ?? "",
        department: ship?.department ?? "",
        street: ship?.street ?? "",
        line2: ship?.line2 ?? "",
        city: ship?.city ?? "",
        state: ship?.state ?? "",
        postalCode: ship?.postalCode ?? "",
        country: ship?.country ?? "India",
        billingSameAsShipping: user.billingSameAsShipping,
        billingOrganization: user.billingAddress?.organization ?? user.organization ?? "",
      }
    : undefined;

  return (
    <>
      <PageHero
        breadcrumb="Checkout"
        eyebrow="Checkout"
        title="Complete your order."
        lead={
          empty
            ? "Checkout as a guest or log in to use your saved details."
            : `Checkout as a guest or log in to use your saved details. This illustrative checkout contains ${description}, with free shipping and a ${formatINR(cart.total)} total.`
        }
      />
      <Container className="mt-12 md:mt-16">
        {empty ? (
          <Card className="p-7 md:p-8">
            <h2 className="text-title">Your cart is empty</h2>
            <p className="mt-3 text-body text-muted">Add a model to your cart before checking out.</p>
            <ButtonLink href="/compare-models" className="mt-6">
              Browse products
            </ButtonLink>
          </Card>
        ) : (
          <CheckoutForm
            loggedIn={Boolean(user)}
            defaults={defaults}
            summary={{
              lines: cart.lines.map((l) => ({ quantity: l.quantity, shortName: l.product.shortName })),
              subtotal: cart.subtotal,
              shipping: cart.shipping,
              total: cart.total,
              description,
            }}
          />
        )}
      </Container>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={<PageHero breadcrumb="Checkout" eyebrow="Checkout" title="Complete your order." lead="Checkout as a guest or log in to use your saved details." />}
    >
      <CheckoutContent />
    </Suspense>
  );
}
