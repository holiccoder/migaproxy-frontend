import type { Metadata } from "next";
import DashboardLatestActivity from "@/components/dashboard/DashboardLatestActivity";
import DashboardTrafficHistoryChart from "@/components/dashboard/DashboardTrafficHistoryChart";
import DashboardWalletBalanceCard from "@/components/dashboard/DashboardWalletBalanceCard";
import AvailableTrafficCard from "@/components/dashboard/AvailableTrafficCard";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-2">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">My Stats</h3>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <AvailableTrafficCard />

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">History Traffic</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">0 GB</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Current Plan</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Free</p>
              </div>
            </div>
          </div>
        </section>

        <DashboardWalletBalanceCard />
      </div>

      <DashboardTrafficHistoryChart />

      <DashboardLatestActivity />
    </div>
  );
}
