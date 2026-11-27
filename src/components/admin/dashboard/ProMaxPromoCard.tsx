import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { BestSellerProduct } from "@/lib/admin/types";

/** Spotlights the product customers order most; hidden until at least one product has orders or quotes. */
export function ProMaxPromoCard({ product }: { product?: BestSellerProduct }) {
  if (!product) return null;
  return (
    <div className="relative flex min-h-[175px] w-full items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-[#143E82] via-[#1A4E9E] to-[#16448D] p-5 text-white shadow-[0_4px_20px_rgb(16_70_155/0.18)] sm:p-6">
      <div className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 rounded-full bg-blue-400/25 blur-2xl" />

      <div className="relative z-10 flex max-w-[62%] flex-col justify-center sm:max-w-[65%]">
        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-100/80">Top seller</p>
        <h3 className="mt-1 line-clamp-3 font-jakarta text-[17px] font-extrabold leading-[1.2] tracking-tight text-white sm:text-[19px]">
          {product.title}
        </h3>
        <p className="mt-1 text-[11px] font-medium leading-snug text-blue-100/90 sm:text-[11.5px]">
          {product.ordersCount} {product.ordersCount === 1 ? "order / quote" : "orders / quotes"}
        </p>
        <div className="mt-3.5 sm:mt-4">
          <Link
            href={`/admin/products/${product.slug}`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold text-[#103E85] shadow-md transition-all duration-150 hover:bg-slate-100 active:scale-95"
          >
            <span>View Product</span>
            <ArrowRight className="size-3 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {product.image ? (
        <div
          className="pointer-events-none absolute bottom-0 right-0 top-0 flex w-[50%] items-end justify-end overflow-hidden"
          style={{ maskImage: "linear-gradient(to right, transparent 0%, black 18%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 18%)" }}
        >
          <div className="relative h-full w-full">
            <Image src={product.image} alt={product.title} fill className="object-contain object-right-bottom p-1 drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]" sizes="(max-width: 768px) 160px, 200px" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
