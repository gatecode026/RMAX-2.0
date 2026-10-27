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
      badgeBg: "bg-[#EFF6FF]",
      badgeText: "text-[#2563EB]",
      badgeBorder: "border-[#DBEAFE]",
    },
    {
      title: "Total Customers",
      value: data.totalCustomers.toLocaleString("en-IN"),
      growth: data.customersGrowth,
      period: "vs last month",
      icon: Users,
      badgeBg: "bg-[#F0FDF4]",
      badgeText: "text-[#16A34A]",
      badgeBorder: "border-[#DCFCE7]",
    },
    {
      title: "Total Revenue",
      value: formatINR(data.totalRevenue),
      growth: data.revenueGrowth,
      period: "vs last month",
      customIcon: "₹",
      badgeBg: "bg-[#FFFBEB]",
      badgeText: "text-[#D97706]",
      badgeBorder: "border-[#FEF3C7]",
      isCurrency: true,
    },
    {
      title: "Active Institutions",
      value: data.activeInstitutions.toLocaleString("en-IN"),
      growth: data.institutionsGrowth,
      period: "vs last month",
      icon: Building2,
      badgeBg: "bg-[#FAF5FF]",
      badgeText: "text-[#9333EA]",
      badgeBorder: "border-[#F3E8FF]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 items-stretch">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="group relative flex flex-col justify-between rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)] hover:border-[#CBD5E1] w-full min-w-0"
          >
            {/* Top row: Metric label on left, icon badge on right */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-semibold text-[#64748B] tracking-[-0.01em]">
                {card.title}
              </span>
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-[12px] border ${card.badgeBg} ${card.badgeText} ${card.badgeBorder} transition-transform duration-200 group-hover:scale-105`}
              >
                {card.customIcon ? (
                  <span className="font-heading text-[17px] font-bold">{card.customIcon}</span>
                ) : Icon ? (
                  <Icon className="size-5 stroke-[2.2]" />
                ) : null}
              </div>
            </div>

            {/* Middle row: Large Hero Number with 100% full-width room */}
            <div className="mt-3.5">
              <span
                className={`font-jakarta font-extrabold tracking-[-0.02em] text-[#0F172A] tabular-nums block ${
                  card.isCurrency ? "text-[23px] sm:text-[25px] 2xl:text-[26px]" : "text-[26px] sm:text-[28px]"
                }`}
              >
                {card.value}
              </span>
            </div>

            {/* Bottom row: Trend badge & comparison */}
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-bold text-[#059669]">
                <ArrowUp className="size-3 stroke-[3]" />
                <span>+{card.growth}%</span>
              </span>
              <span className="text-[11.5px] font-medium text-[#94A3B8]">
                {card.period}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
