import { Eyebrow } from "./PageHero";
import { cn } from "@/lib/cn";

/** Eyebrow → H2 → lead, used to open each content section on Home / About. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-[760px]", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-[28px]/9 md:text-section">{title}</h2>
      {lead && <p className="mt-4 text-body text-muted">{lead}</p>}
    </div>
  );
}
