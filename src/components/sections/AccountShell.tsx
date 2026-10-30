import Link from "next/link";
import { User, ShoppingCart, FileText, MapPin, LogOut } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { customerLogoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/cn";

type Active = "overview" | "quotations" | "orders" | "profile" | "cart";

interface AccountShellProps {
  active: Active;
  cartCount?: number;
  children: React.ReactNode;
}

/** Sidebar + content layout used by My Account and My Orders. */
export function AccountShell({ active, cartCount = 0, children }: AccountShellProps) {
  const item = "flex items-center justify-between rounded-input px-3 py-3 text-body text-muted transition hover:text-navy";

  const items = [
    { key: "overview", label: "Account Overview", href: "/account", icon: User },
    {
      key: "cart",
      label: "My Cart",
      href: "/account#cart",
      badge: cartCount > 0 ? `${cartCount}` : undefined,
      icon: ShoppingCart,
    },
    { key: "quotations", label: "Quotation History", href: "/account#quotations", icon: FileText },
    { key: "profile", label: "Address & Mobile", href: "/account#profile", icon: MapPin },
  ];

  return (
    <Container className="mt-12 grid items-start gap-6 md:mt-16 lg:grid-cols-[250px_1fr]">
      <Card className="p-7 lg:sticky lg:top-[calc(var(--header-height)+16px)]">
        <h2 className="text-title">My Account</h2>
        <nav aria-label="Account" className="mt-4">
          <ul className="flex flex-col gap-1">
            {items.map((i) => {
              const Icon = i.icon;
              return (
                <li key={i.key}>
                  <Link
                    href={i.href}
                    aria-current={active === i.key ? "page" : undefined}
                    className={cn(item, active === i.key && "bg-soft/80 font-bold text-navy")}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4 shrink-0 text-muted group-hover:text-navy" aria-hidden="true" />
                      <span>{i.label}</span>
                    </div>
                    {i.badge && (
                      <span className="rounded-full bg-navy/10 px-2 py-0.5 text-xs font-bold text-navy">
                        {i.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
            <li>
              <form action={customerLogoutAction}>
                <button type="submit" className={cn(item, "w-full text-left cursor-pointer")}>
                  <div className="flex items-center gap-2.5">
                    <LogOut className="size-4 shrink-0 text-muted" aria-hidden="true" />
                    <span>Sign out</span>
                  </div>
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
