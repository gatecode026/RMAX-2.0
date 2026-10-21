import { Container } from "@/components/layout/Container";

export default function Loading() {
  return (
    <Container className="pt-10" aria-busy="true" aria-live="polite">
      <div className="h-4 w-40 animate-pulse rounded bg-soft" />
      <div className="mt-6 h-14 w-2/3 animate-pulse rounded-input bg-soft" />
      <div className="mt-6 h-5 w-1/2 animate-pulse rounded bg-soft" />
      <div className="mt-16 h-96 animate-pulse rounded-card bg-soft/70" />
      <span className="sr-only">Loading…</span>
    </Container>
  );
}
