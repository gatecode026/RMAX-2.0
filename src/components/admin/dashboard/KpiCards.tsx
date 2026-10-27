import { Package, Users, Building2, ArrowUp } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { KpiData } from "@/lib/admin/types";

interface KpiCardsProps {
  data: KpiData;
}

export function KpiCards({ data }: KpiCardsProps) {
  const cards = [
    {
      title: "Total Orders",
      value: data.totalOrders.toLocaleString("en-IN"),
      growth: data.ordersGrowth,
      period: "vs last month",
      icon: Package,
      iconBg: "bg-[#EBF2FC]",
      iconColor: "text-[#10469B]",
    },
    {
      title: "Total Customers",
      value: data.totalCustomers.toLocaleString("en-IN"),
      growth: data.customersGrowth,
      period: "vs last month",
      icon: Users,
      iconBg: "bg-[#E8F8EE]",
      iconColor: "text-[#16A34A]",
    },
    {
      title: "Total Revenue",
      value: formatINR(data.totalRevenue),
      growth: data.revenueGrowth,
      period: "vs last month",
      customIcon: "₹",
      iconBg: "bg-[#FEF4E6]",
      iconColor: "text-[#D97706]",
      isCurrency: true,
    },
    {
      title: "Active Institutions",
      value: data.activeInstitutions.toLocaleString("en-IN"),
      growth: data.institutionsGrowth,
      period: "vs last month",
      icon: Building2,
      iconBg: "bg-[#F2EDFB]",
      iconColor: "text-[#7C3AED]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 items-stretch">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="flex h-full items-center gap-3.5 rounded-2xl border border-[#E5EBF4] bg-white px-4 py-3.5 sm:px-4.5 sm:py-4 shadow-[0_2px_12px_rgb(35_42_50/0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgb(35_42_50/0.06)] min-w-0"
          >
            {/* Left Icon Square */}
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${card.iconBg} ${card.iconColor}`}
            >
              {card.customIcon ? (
                <span className="font-heading text-[20px] font-bold">{card.customIcon}</span>
              ) : Icon ? (
                <Icon className="size-5.5 stroke-[2.2]" />
              ) : null}
            </div>

            {/* Right Metric Details */}
            <div className="min-w-0 flex-1">
              <p className="text-[12px] sm:text-[12.5px] font-medium text-[#64748B] whitespace-nowrap">
                {card.title}
              </p>
              
              <div className="mt-0.5 flex items-baseline gap-2.5">
                <span
                  className={`font-jakarta font-extrabold tracking-tight text-[#0F172A] tabular-nums ${
                    card.isCurrency ? "text-[18px] sm:text-[20px]" : "text-[21px] sm:text-[23px]"
                  }`}
                >
                  {card.value}
                </span>

                {/* Growth and period stacked next to value */}
                <div className="flex flex-col leading-none shrink-0">
                  <span className="inline-flex items-center text-[10.5px] sm:text-[11px] font-bold text-[#16A34A]">
                    <ArrowUp className="size-2.5 stroke-[3] mr-0.5" />
                    <span>{card.growth}%</span>
                  </span>
                  <span className="text-[9px] sm:text-[9.5px] text-[#94A3B8] font-normal whitespace-nowrap mt-0.5">
                    {card.period}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
