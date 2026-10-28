import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { AccountShell } from "@/components/sections/AccountShell";
import { AddressCard } from "@/components/sections/AddressCard";
import { ProfileForm } from "@/components/sections/ProfileForm";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { getCurrentUserProfile } from "@/lib/data/users";
import { listOwnedQuotes } from "@/lib/data/quotes";
import { formatDate, formatINR } from "@/lib/format";
import { requireUserId } from "@/lib/session";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

function getStatusBadge(status: string) {
  switch (status) {
    case "new":
      return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">New Request</span>;
    case "in_review":
    case "under_review":
      return <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Under Review</span>;
    case "quote_sent":
      return <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">Quote Sent</span>;
    case "approved":
      return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">Approved</span>;
    case "declined":
      return <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">Declined</span>;
    default:
      return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">{status}</span>;
  }
}

async function Overview() {
  await requireUserId("/account");
  const [user, quotes] = await Promise.all([getCurrentUserProfile(), listOwnedQuotes()]);
  if (!user) return null;
  if (user.role === "manager") redirect("/manager/dashboard");
  if (user.role === "super_admin" || user.role === "admin") redirect("/admin/dashboard");
  const ship = user.shippingAddress;
  const bill = user.billingAddress;

  return (
    <>
      <PageHero
        breadcrumb="My Account"
        eyebrow="My Account"
        title={`Welcome, ${user.name.split(" ")[0]}.`}
        lead="Manage your contact details, delivery address, and track your institutional quotation proposals."
      />
      <AccountShell active="overview">
        {/* 1. Mobile Number & Basic Info */}
        <ProfileForm
          initial={{ name: user.name, organization: user.organization ?? "", email: user.email, phone: user.phone ?? "" }}
        />

        {/* 2. Saved Address */}
        <div className="grid gap-6 md:grid-cols-2">
          <AddressCard kind="shipping" heading="Delivery / Institutional Address" actionLabel="Edit address" initial={ship}>
            <h2 className="mt-4 text-title">{ship?.organization ?? "No delivery address saved"}</h2>
            <p className="mt-4 text-body-sm leading-6 text-muted">
              {ship ? (
                <>
                  {[ship.recipient, ship.department].filter(Boolean).join(" · ")}
                  <br />
                  {[ship.street, ship.line2].filter(Boolean).join(", ")}
                  <br />
                  {ship.city}, {ship.state} {ship.postalCode}, {ship.country}
                </>
              ) : (
                "Save your delivery address for fast and seamless machine deployment."
              )}
            </p>
          </AddressCard>

          <AddressCard
            kind="billing"
            heading="Billing / Tax Address"
            actionLabel="Add / edit billing"
            initial={bill}
            sameAsShipping={user.billingSameAsShipping}
          >
            <h2 className="mt-4 text-title">{(user.billingSameAsShipping ? ship?.organization : bill?.organization) ?? "No billing address"}</h2>
            <p className="mt-4 text-body-sm leading-6 text-muted">
              {user.billingSameAsShipping ? (
                <>
                  Same as delivery address
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
            </p>
          </AddressCard>
        </div>

        {/* 3. Quotation History Only */}
        <Card id="quotations" className="scroll-mt-28 p-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <h2 className="text-title">Quotation History</h2>
              <p className="text-body-sm text-muted">Track the status of all your requested machine quotations and proposals.</p>
            </div>
            <ButtonLink href="/institutional-quote" size="sm">
              Request New Quote
            </ButtonLink>
          </div>

          {quotes.length > 0 ? (
            <div className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line">
              {quotes.map((q) => (
                <div key={q._id} className="flex flex-col justify-between gap-4 bg-white p-5 transition hover:bg-soft/40 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-bold text-navy text-sm">
                        {q.quoteNumber || "QT-REQUEST"}
                      </span>
                      {getStatusBadge(q.status)}
                    </div>
                    <p className="font-medium text-charcoal text-sm">
                      Model: <span className="font-semibold uppercase">{q.preferredModel}</span> · Qty: <span className="font-semibold">{q.quantity} unit(s)</span>
                    </p>
                    <p className="text-muted text-xs">
                      Delivery: {q.deliveryCityPostal || "Standard"} · Requested on {formatDate(q.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                    <div className="text-left sm:text-right">
                      <span className="block text-muted text-xs">Quoted Proposal</span>
                      <span className="font-heading font-extrabold text-navy text-base">
                        {q.quotedAmount && q.quotedAmount > 0 ? formatINR(q.quotedAmount) : "Pending Review"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-body text-muted">You have not submitted any quotation requests yet.</p>
              <ButtonLink href="/institutional-quote" size="sm" className="mt-5">
                Request an Institutional Quote
              </ButtonLink>
            </div>
          )}
        </Card>
      </AccountShell>
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={<PageHero breadcrumb="My Account" eyebrow="My Account" title="Welcome." lead="Your profile, addresses and quotations in one place." />}
    >
      <Overview />
    </Suspense>
  );
}
