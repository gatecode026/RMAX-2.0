import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";

export function NotFoundContent() {
  return (
    <Container className="pt-16">
      <Eyebrow>Page not found</Eyebrow>
      {/* 152px is reserved for the 404 numeral in the design system */}
      <p aria-hidden className="mt-2 font-heading text-[96px]/[112px] font-extrabold text-navy md:text-numeral">
        404
      </p>
      <h1 className="mt-2 text-display-sm md:text-display">We can’t find that page.</h1>
      <div className="mt-8">
        <ButtonLink href="/">Back to home</ButtonLink>
      </div>
    </Container>
  );
}
