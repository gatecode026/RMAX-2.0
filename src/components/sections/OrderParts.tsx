import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { formatINR } from "@/lib/format";

/** Product row used in the cart, confirmation, order list/detail and account overview. */
export function LineItem({
  image,
  title,
  specLine,
  price,
  thumb = 118,
  children,
}: {
  image: string;
  title: string;
  specLine: string;
  price: number;
  thumb?: number;
  children?: React.ReactNode; // extra row under the specs (quantity controls, "Quantity: 1")
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <Image
        src={image}
        alt=""
        width={thumb}
        height={thumb}
        className="rounded-[24px] object-cover"
        style={{ width: thumb, height: thumb }}
      />
      <div className="min-w-0 flex-1 basis-56">
        <h3 className="text-[20px]/7">{title}</h3>
        <p className="mt-1 text-body-sm text-muted">{specLine}</p>
        {children && <div className="mt-2 text-body-sm font-bold text-charcoal">{children}</div>}
      </div>
      <p className="font-heading text-title font-extrabold text-charcoal">{formatINR(price)}</p>
    </div>
  );
}

export function OrderSummary({
  lines,
  subtotal,
  shipping,
  total,
  children,
  className,
}: {
  lines: { quantity: number; shortName: string }[];
  subtotal: number;
  shipping: number;
  total: number;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <h2 className="text-title">Order summary</h2>
      <ul className="mt-4 text-body-sm text-muted">
        {lines.map((l) => (
          <li key={l.shortName}>
            {l.quantity} × {l.shortName}
          </li>
        ))}
      </ul>
      <dl className="mt-5 border-t border-line pt-5 text-body-sm">
        <div className="flex items-center justify-between">
          <dt className="font-bold">Subtotal</dt>
          <dd className="font-bold">{formatINR(subtotal)}</dd>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <dt className="font-bold">Shipping</dt>
          <dd className="font-bold text-navy">{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-5">
        <p className="text-body-sm font-bold">Total</p>
        <p className="font-heading text-[32px]/10 font-extrabold">{formatINR(total)}</p>
      </div>
      <p className="mt-4 text-body-sm text-muted">No tax rate is assumed in this illustrative order.</p>
      {children}
      <p className="mt-6 text-body-sm text-muted">
        Free shipping · 3–5 day delivery
        <br />
        1 year warranty · Exchange only
      </p>
    </Card>
  );
}
