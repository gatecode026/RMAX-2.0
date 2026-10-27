import { connection } from "next/server";
import { getAdminDashboardOverview } from "@/lib/admin/data";
import { WelcomeHeader } from "@/components/admin/dashboard/WelcomeHeader";
import { KpiCards } from "@/components/admin/dashboard/KpiCards";
import { SalesChart } from "@/components/admin/dashboard/SalesChart";
import { BestSellingProducts } from "@/components/admin/dashboard/BestSellingProducts";
import { ProMaxPromoCard } from "@/components/admin/dashboard/ProMaxPromoCard";
import { RecentOrdersTable } from "@/components/admin/dashboard/RecentOrdersTable";
import { RecentEnquiriesList } from "@/components/admin/dashboard/RecentEnquiriesList";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { ServiceStatusChart } from "@/components/admin/dashboard/ServiceStatusChart";
import { ImpactBanner } from "@/components/admin/dashboard/ImpactBanner";

export const instant = false;

export const metadata = {
  title: "Admin Dashboard | RMAX Solutions",
  description: "Enterprise administration and operations panel for RMAX Solutions.",
};

export default async function AdminDashboardPage() {
  await connection();
  const data = await getAdminDashboardOverview();

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header */}
      <WelcomeHeader userName="Rahul" dateRange="01 Oct 2026 - 31 Oct 2026" />

      {/* 2. KPI Cards Row (4 cards in consistent alignment) */}
      <KpiCards data={data.kpis} />

      {/* 3. Main Balanced 3-Column Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Primary Column (~1.2fr / 5 cols): Sales Overview + Recent Orders */}
        <div className="lg:col-span-5 flex flex-col gap-6 min-w-0">
          <SalesChart data={data.salesOverview} />
          <RecentOrdersTable orders={data.recentOrders} />
        </div>

        {/* Secondary Column (~1fr / 4 cols): Best Selling Products + Recent Enquiries */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
          <BestSellingProducts products={data.bestSellers} />
          <RecentEnquiriesList enquiries={data.recentEnquiries} />
        </div>

        {/* Right Sidebar Column (~0.7fr / 3 cols): Pro-Max Promotion + Quick Actions + Service Status */}
        <div className="lg:col-span-3 flex flex-col gap-6 min-w-0">
          <ProMaxPromoCard />
          <QuickActions />
          <ServiceStatusChart summary={data.serviceSummary} />
        </div>
      </div>

      {/* 4. Full-Width Impact Banner */}
      <ImpactBanner />
    </div>
  );
}
