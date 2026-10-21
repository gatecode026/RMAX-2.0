import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { AccountShell } from "@/components/sections/AccountShell";
import { AddressCard } from "@/components/sections/AddressCard";
import { LineItem } from "@/components/sections/OrderParts";
import { ProfileForm } from "@/components/sections/ProfileForm";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill, StatusChip } from "@/components/ui/Pill";
import { getCurrentUserProfile } from "@/lib/data/users";
import { listOwnedOrders } from "@/lib/data/orders";
import { formatDate, formatINR } from "@/lib/format";
import { statusChipText } from "@/lib/order-ui";
import { requireUserId } from "@/lib/session";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

async function Overview() {
  await requireUserId("/account");
  const [user, orders] = await Promise.all([getCurrentUserProfile(), listOwnedOrders({})]);
  if (!user) return null;
  const ship = user.shippingAddress;
  const bill = user.billingAddress;
  const recent = orders[0];
  const first = recent?.items[0];

  return (
    <>
      <PageHero
        breadcrumb="My Account"
        eyebrow="My Account"
        title={`Welcome, ${user.name.split(" ")[0]}.`}
        lead="Your profile, addresses and orders in one place. All account and order information shown below is illustrative."
      />
      <AccountShell active="overview">
        <ProfileForm
          initial={{ name: user.name, organization: user.organization ?? "", email: user.email, phone: user.phone ?? "" }}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <AddressCard kind="shipping" heading="Shipping address" actionLabel="Edit address" initial={ship}>
            <h2 className="mt-4 text-title">{ship?.organization ?? "No address saved"}</h2>
            <p className="mt-4 text-body-sm leading-6 text-muted">
              {ship ? (
                <>
                  {[ship.recipient, ship.department].filter(Boolean).join(" · ")}
                  <br />
                  {[ship.street, ship.line2].filter(Boolean).join(", ")}
                  <br />
                  {ship.city}, {ship.state} {ship.postalCode}, {ship.country}
                  <br />
                  Illustrative address only
                </>
              ) : (
                "Add a shipping address to speed up checkout."
              )}
            </p>
          </AddressCard>

          <AddressCard
            kind="billing"
            heading="Billing address"
            actionLabel="Add / edit billing"
            initial={bill}
            sameAsShipping={user.billingSameAsShipping}
          >
            <h2 className="mt-4 text-title">{(user.billingSameAsShipping ? ship?.organization : bill?.organization) ?? "No billing address"}</h2>
            <p className="mt-4 text-body-sm leading-6 text-muted">
              {user.billingSameAsShipping ? (
                <>
                  Same as shipping
                  <br />
                  {[ship?.department, ship?.city].filter(Boolean).join(" · ")}
                </>
              ) : (
                bill && (
                  <>
                    {bill.street}
                    <br />
                    {bill.city}, {bill.state} {bill.postalCode}
                  </>
                )
              )}
              <br />
              Illustrative billing details
              <br />
              Add a separate address if needed.
            </p>
          </AddressCard>
        </div>

        <Card className="p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-title">Recent order</h2>
            {recent && <StatusChip>{statusChipText(recent.status, recent.isIllustrative)}</StatusChip>}
          </div>
          {recent && first ? (
            <>
              <Pill className="mt-4">Illustrative order · {recent.reference}</Pill>
              <div className="mt-5">
                <LineItem image={first.image} title={first.title} specLine={first.specLine} price={first.unitPrice * first.quantity}>
                  Quantity: {first.quantity}
                </LineItem>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-body-sm text-muted">
                  Free shipping · Total {formatINR(recent.total)} · {formatDate(recent.createdAt)}
                </p>
                <ButtonLink href={`/account/orders/${recent.reference}`} variant="secondary" size="sm">
                  View order
                </ButtonLink>
              </div>
            </>
          ) : (
            <>
              <p className="mt-4 text-body text-muted">You have no orders yet.</p>
              <ButtonLink href="/compare-models" size="sm" className="mt-5">
                Browse products
              </ButtonLink>
            </>
          )}
        </Card>
      </AccountShell>
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={<PageHero breadcrumb="My Account" eyebrow="My Account" title="Welcome." lead="Your profile, addresses and orders in one place." />}
    >
      <Overview />
    </Suspense>
  );
}
