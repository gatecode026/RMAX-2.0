import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { CheckoutForm } from "@/components/sections/CheckoutForm";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCart } from "@/lib/cart";
import { getCurrentUserProfile } from "@/lib/data/users";
import { formatINR } from "@/lib/format";
import type { CheckoutInput } from "@/lib/validations/schemas";

export const metadata: Metadata = { title: "Checkout" };

/** Breadcrumb + heading shared by every checkout state (sign-in prompt, profile prompt, form). */
function CheckoutIntro({ lead }: { lead: string }) {
  return (
    <div className="flex flex-col items-start gap-4.5 pt-2 pb-8 sm:pb-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-sans text-[14px]">
        <Link href="/" className="text-[#64748B] hover:text-[#0B62FF] transition-colors">
          Home
        </Link>
        <ChevronRight className="size-4 text-[#64748B]" aria-hidden="true" />
        <span className="font-sans text-[12px] font-normal leading-4 text-[#0B62FF]" aria-current="page">
          Checkout
        </span>
      </nav>
      <p className="font-sans text-[12px] font-extrabold leading-4 tracking-wider text-[#0B62FF] uppercase">CHECKOUT</p>
      <div className="flex flex-col items-start gap-3.5 max-w-[940px]">
        <h1 className="font-jakarta text-[32px]/[38px] sm:text-[42px]/[48px] md:text-[52px]/[60px] font-extrabold tracking-[-1.5px] text-[#020618]">
          Complete your order.
        </h1>
        <p className="font-sans text-[15px] sm:text-[16px]/[28px] text-[#62748E]">{lead}</p>
      </div>
    </div>
  );
}

/** Minimum profile data required before an order can be placed (PRD: "profile completion"). */
function isProfileComplete(user: NonNullable<Awaited<ReturnType<typeof getCurrentUserProfile>>>): boolean {
  const ship = user.shippingAddress;
  return Boolean(user.name && user.phone && ship?.street && ship?.city && ship?.state && ship?.postalCode);
}

async function CheckoutContent() {
  const [cart, user] = await Promise.all([getCart(), getCurrentUserProfile()]);
  const empty = cart.lines.length === 0;
  const description = cart.lines.map((l) => `${l.quantity} ${l.product.name} ${l.quantity === 1 ? "unit" : "units"}`).join(" and ");

  // Mandatory Customer authentication for direct purchase — an Admin/Manager session never
  // counts, and there is no guest checkout. The cart itself is already always empty for a
  // visitor with no Customer session (see lib/cart.ts), so this is belt-and-suspenders.
  if (!user) {
    return (
      <>
        <CheckoutIntro
          lead="Please log in to your RMAX customer account to complete your purchase."
        />
        <Card className="rounded-[30px] border border-[#94A3B8]/20 bg-white p-7 md:p-8 shadow-xs">
          <h2 className="font-jakarta text-[24px]/[28px] font-extrabold text-[#020618]">Sign in to check out</h2>
          <p className="mt-3 font-sans text-[15px] text-[#62748E]">
            Direct purchase requires a Customer account. Your selection is saved — you'll come straight back here
            once you're signed in.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/?auth=login&next=/checkout" className="rounded-full">
              Login
            </ButtonLink>
            <ButtonLink href="/?auth=register&next=/checkout" variant="secondary" className="rounded-full">
              Create Account
            </ButtonLink>
          </div>
        </Card>
      </>
    );
  }

  if (!empty && !isProfileComplete(user)) {
    return (
      <>
        <CheckoutIntro lead="Please complete your profile details before placing your order." />
        <Card className="rounded-[30px] border border-[#94A3B8]/20 bg-white p-7 md:p-8 shadow-xs">
          <h2 className="font-jakarta text-[24px]/[28px] font-extrabold text-[#020618]">
            A few details are missing
          </h2>
          <p className="mt-3 font-sans text-[15px] text-[#62748E]">
            We need your name, phone number and delivery address before you can place an order. Your cart is
            saved — you'll return straight to checkout after saving your profile.
          </p>
          <ButtonLink href="/account?next=%2Fcheckout" className="mt-6 rounded-full">
            Complete your profile
          </ButtonLink>
        </Card>
      </>
    );
  }

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

  const leadText = empty
    ? "Your saved details are ready — add a model to your cart to continue."
    : `Signed in with your saved details. This illustrative checkout contains ${description}, with free shipping and a ${formatINR(cart.total)} total.`;

  return (
    <>
      <CheckoutIntro lead={leadText} />

      {empty ? (
        <Card className="rounded-[30px] border border-[#94A3B8]/20 bg-white p-7 md:p-8 shadow-xs">
          <h2 className="font-jakarta text-[24px]/[28px] font-extrabold text-[#020618]">Your cart is empty</h2>
          <p className="mt-3 font-sans text-[15px] text-[#62748E]">Add a model to your cart before checking out.</p>
          <ButtonLink href="/compare-models" className="mt-6 rounded-full">
            Browse products
          </ButtonLink>
        </Card>
      ) : (
        <CheckoutForm
          loggedIn

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
    </>
  );
}

export default function CheckoutPage() {
  return (
    <div className="w-full -mb-16 md:-mb-24 pb-16 md:pb-24 pt-6 sm:pt-8 bg-[linear-gradient(90deg,#E1F5FF_0%,#FFFFFF_48%,#EAF1FF_100%)]">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 xl:px-0">
        <Suspense
          fallback={
            <div className="flex flex-col items-start gap-4.5 pt-2 pb-8 sm:pb-10">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-sans text-[14px]">
                <Link href="/" className="text-[#64748B]">Home</Link>
                <ChevronRight className="size-4 text-[#64748B]" />
                <span className="text-[#0B62FF] text-[12px]">Checkout</span>
              </nav>
              <p className="font-sans text-[12px] font-extrabold tracking-wider text-[#0B62FF] uppercase">CHECKOUT</p>
              <h1 className="font-jakarta text-[32px] sm:text-[42px] md:text-[52px] font-extrabold text-[#020618]">Complete your order.</h1>
              <p className="font-sans text-[16px] text-[#62748E]">Loading checkout...</p>
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </div>
    </div>
  );
}
