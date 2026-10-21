import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { AccountShell } from "@/components/sections/AccountShell";
import { OrderFilters } from "@/components/sections/OrderFilters";
import { LineItem } from "@/components/sections/OrderParts";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill, StatusChip } from "@/components/ui/Pill";
import { listOwnedOrders } from "@/lib/data/orders";
import { formatDate, formatINR, pluralItems } from "@/lib/format";
import { statusChipText } from "@/lib/order-ui";
import { requireUserId } from "@/lib/session";

export const metadata: Metadata = { title: "My Orders", robots: { index: false, follow: false } };

const HERO = {
  breadcrumb: "My Orders",
  eyebrow: "My Orders",
  title: "Your orders, at a glance.",
} as const;

async function Orders({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireUserId("/account/orders");
  const { q = "", status = "" } = await searchParams;
  const orders = await listOwnedOrders({ q: q.trim(), status });
  const total = (await listOwnedOrders({})).length;
  const filtered = Boolean(q.trim() || status);

  return (
    <>
      <PageHero {...HERO} lead="Find order details and delivery updates. This account shows one illustrative order, not a real transaction." />
      <AccountShell active="orders">
        <OrderFilters q={q} status={status} />
        <div className="flex items-center justify-between">
          <Pill>
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </Pill>
          <p className="text-body-sm text-muted">Newest first</p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-7">
            <p className="text-body text-muted">{filtered ? "No orders match your search." : "You have no orders yet."}</p>
          </Card>
        ) : (
          orders.map((o) => {
            const first = o.items[0];
            return (
              <Card key={o.reference} className="p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Pill>Illustrative order · {o.reference}</Pill>
                  <StatusChip>{statusChipText(o.status, o.isIllustrative)}</StatusChip>
                </div>
                <p className="mt-5 text-body-sm text-muted">
                  Placed {formatDate(o.createdAt)} · {pluralItems(o.items.length)} · {o.shippingAddress.organization}
                </p>
                {first && (
                  <div className="mt-5">
                    <LineItem image={first.image} title={first.title} specLine={first.specLine} price={first.unitPrice * first.quantity}>
                      Quantity: {first.quantity}
                    </LineItem>
                  </div>
                )}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-body text-muted">
                    Free shipping · Total {formatINR(o.total)}
                  </p>
                  <ButtonLink href={`/account/orders/${o.reference}`} size="sm">
                    View order &amp; tracking
                  </ButtonLink>
                </div>
              </Card>
            );
          })
        )}

        <p className="text-body-sm text-muted">
          Showing {orders.length} of {total} orders. No additional purchases are shown.
        </p>
        <div>
          <ButtonLink href="/compare-models" variant="secondary" size="sm">
            Browse products
          </ButtonLink>
        </div>
      </AccountShell>
    </>
  );
}

export default function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  return (
    <Suspense fallback={<PageHero {...HERO} lead="Find order details and delivery updates." />}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}
