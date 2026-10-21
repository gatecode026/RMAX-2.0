import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/cn";

type Active = "overview" | "orders" | "profile";

const ITEMS = [
  { key: "overview", label: "Overview", href: "/account" },
  { key: "orders", label: "My Orders", href: "/account/orders" },
  { key: "profile", label: "Profile & addresses", href: "/account#profile" },
] as const;

/** Sidebar + content layout used by My Account and My Orders. */
export function AccountShell({ active, children }: { active: Active; children: React.ReactNode }) {
  const item = "block rounded-input px-3 py-3 text-body text-muted transition hover:text-navy";
  return (
    <Container className="mt-12 grid items-start gap-6 md:mt-16 lg:grid-cols-[250px_1fr]">
      <Card className="p-7 lg:sticky lg:top-[calc(var(--header-height)+16px)]">
        <h2 className="text-title">My Account</h2>
        <nav aria-label="Account" className="mt-4">
          <ul className="flex flex-col gap-1">
            {ITEMS.map((i) => (
              <li key={i.key}>
                <Link
                  href={i.href}
                  aria-current={active === i.key ? "page" : undefined}
                  className={cn(item, active === i.key && "bg-soft/80 font-bold text-navy")}
                >
                  {i.label}
                </Link>
              </li>
            ))}
            <li>
              <form action={logoutAction}>
                <button type="submit" className={cn(item, "w-full text-left")}>
                  Sign out
                </button>
              </form>
            </li>
          </ul>
        </nav>
        <p className="mt-4 text-body-sm text-muted">Illustrative account</p>
      </Card>
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </Container>
  );
}
