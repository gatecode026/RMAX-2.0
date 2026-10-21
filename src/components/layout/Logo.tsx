import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Site logo — `.context/Frame.png` (white artwork) tinted to the brand navy #002970,
 * exactly as the Home design shows it on the light header.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="RMAX Solutions — home" className={cn("inline-flex shrink-0 items-center", className)}>
      <Image src="/images/logo-navy.png" alt="RMAX Solutions" width={1155} height={371} priority className="h-[45px] w-auto" />
    </Link>
  );
}
