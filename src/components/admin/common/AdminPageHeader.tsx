import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export default function AdminPageHeader({
  title,
  subtitle,
  breadcrumbs = [{ label: "Dashboard", href: "/admin/dashboard" }],
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-[#10469B] transition-colors">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-700">{bc.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-[#0B2450]">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
