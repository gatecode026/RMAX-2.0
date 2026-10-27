import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { BestSellerProduct } from "@/lib/admin/types";

interface BestSellingProductsProps {
  products: BestSellerProduct[];
}

export function BestSellingProducts({ products }: BestSellingProductsProps) {
  const maxOrders = Math.max(...products.map((p) => p.ordersCount), 1);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E5EBF4] bg-white p-5 shadow-[0_2px_12px_rgb(35_42_50/0.03)] sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className="font-jakarta text-[17px] font-bold text-[#202A36]">Best Selling Products</h3>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-[13px] font-bold text-[#10469B] hover:underline"
        >
          <span>View All</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* 3 Product Rows */}
      <div className="mt-4 divide-y divide-gray-100">
        {products.map((p) => {
          const progressPct = Math.round((p.ordersCount / maxOrders) * 100);

          return (
            <div key={p.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              {/* Product Thumbnail */}
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#F4F7FC]">
                <Image
                  src={p.image}
                  alt={p.title}
                  width={64}
                  height={64}
                  className="size-full object-contain p-1"
                />
              </div>

              {/* Details & Progress */}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/products`}
                  className="font-jakarta text-[14px] font-bold text-[#202A36] hover:text-[#10469B] truncate block"
                >
                  {p.title}
                </Link>
                <p className="text-[12px] text-[#718096] truncate">{p.specs}</p>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF2F6]">
                  <div
                    className="h-full rounded-full bg-[#10469B] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Order Count Stat */}
              <div className="shrink-0 text-right">
                <p className="font-jakarta text-[16px] font-extrabold text-[#202A36]">{p.ordersCount}</p>
                <p className="text-[11px] font-medium text-[#718096]">Orders</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
