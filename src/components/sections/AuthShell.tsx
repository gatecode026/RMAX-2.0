import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Pill } from "@/components/ui/Pill";

const BULLETS = [
  "View orders and delivery updates.",
  "Keep your profile and institutional addresses together.",
  "Get help with your purchased model.",
];

/** Two-column layout shared by Login, Create Account and Forgot Password. */
export function AuthShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead: React.ReactNode;
  children: React.ReactNode; // the form card
}) {
  return (
    <Container className="pt-8 md:pt-12">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_510px] lg:gap-12">
        <div className="order-2 lg:order-1">
          <Pill>Your RMAX account</Pill>
          <h1 className="mt-6 text-display-sm md:text-display">{title}</h1>
          <p className="mt-6 text-body text-muted">{lead}</p>
          <ul className="mt-6 flex flex-col gap-4 text-body text-muted">
            {BULLETS.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-6 rounded-card bg-charcoal p-6 text-white">
            <Image
              src="/images/product-pro.png"
              alt=""
              width={110}
              height={110}
              className="size-[110px] shrink-0 rounded-[24px] object-cover"
            />
            <div>
              <p className="font-heading text-[20px]/7 font-extrabold text-white">Built for busy institutions.</p>
              <p className="mt-2 text-body-sm text-muted-dark">
                Free shipping · 1 year warranty
                <br />
                In-house manufacturing
              </p>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">{children}</div>
      </div>
    </Container>
  );
}
