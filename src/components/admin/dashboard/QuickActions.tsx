import Link from "next/link";
import { Package, FileText, Building2, Wrench, ChevronRight } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      label: "Add New Product",
      href: "/admin/products/create",
      icon: Package,
      iconColor: "text-[#10469B]",
      bgColor: "bg-[#EBF2FC]",
    },
    {
      label: "Create Quotation",
      href: "/admin/quotations?action=new",
      icon: FileText,
      iconColor: "text-[#16A34A]",
      bgColor: "bg-[#E8F8EE]",
    },
    {
      label: "Add Institution",
      href: "/admin/institutions?action=new",
      icon: Building2,
      iconColor: "text-[#D97706]",
      bgColor: "bg-[#FEF4E6]",
    },
    {
      label: "Service Request",
      href: "/admin/service-requests?action=new",
      icon: Wrench,
      iconColor: "text-[#7C3AED]",
      bgColor: "bg-[#F2EDFB]",
    },
  ];

  return (
    <div className="flex flex-col rounded-2xl border border-[#E5EBF4] bg-white p-4.5 sm:p-5 shadow-[0_2px_12px_rgb(35_42_50/0.03)]">
      <div className="pb-3 border-b border-gray-100">
        <h3 className="font-jakarta text-[15.5px] font-bold text-[#202A36]">
          Quick Actions
        </h3>
      </div>

      <div className="mt-3 space-y-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.label}
              href={act.href}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#F8FAFC] px-3 py-2.5 transition-all duration-150 hover:border-[#10469B]/30 hover:bg-[#F0F5FD] hover:shadow-xs active:scale-[0.99] group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${act.bgColor} ${act.iconColor}`}
                >
                  <Icon className="size-4" />
                </div>
                <span className="text-[12.5px] sm:text-[13px] font-semibold text-slate-800 group-hover:text-[#10469B] transition-colors whitespace-nowrap">
                  {act.label}
                </span>
              </div>
              <ChevronRight className="size-3.5 text-slate-400 group-hover:text-[#10469B] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
