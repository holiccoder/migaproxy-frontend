import type { Metadata } from "next";
import ComponentCard from "@/components/common/ComponentCard";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="space-y-6">
      <ComponentCard title="My Stats">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Available Traffic</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">0 GB</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Total Traffic Purchased</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">0 GB</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Current Plan</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Free</p>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
