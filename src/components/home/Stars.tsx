import { useId } from "react";

const STAR = "M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.3l-5.8 3.1 1.1-6.47L2.6 9.35l6.5-.95L12 2.5z";

/** Five navy stars; `value` may be fractional (4.5 → four full, one half). */
export function Stars({ value = 5, size = 20, className }: { value?: number; size?: number; className?: string }) {
  const uid = useId();
  return (
    <span className={className} role="img" aria-label={`${value} out of 5 stars`} style={{ display: "inline-flex", gap: size * 0.1 }}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        const id = `${uid}-${i}`;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <defs>
              <linearGradient id={id}>
                <stop offset={`${fill * 100}%`} stopColor="#002970" />
                <stop offset={`${fill * 100}%`} stopColor="transparent" />
              </linearGradient>
            </defs>
            <path d={STAR} fill={`url(#${id})`} stroke="#002970" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        );
      })}
    </span>
  );
}
