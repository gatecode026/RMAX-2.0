"use client";

import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/layout/PageHero";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="pt-16">
      <Eyebrow>Something went wrong</Eyebrow>
      <h1 className="mt-3 text-display-sm md:text-display">We hit a snag.</h1>
      <p className="mt-5 max-w-[640px] text-body text-muted">This page could not be loaded. Please try again.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}
