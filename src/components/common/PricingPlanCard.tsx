import { ArrowRightIcon, BoltIcon } from "@/icons";
import Link from "next/link";

type PricingPlanCardProps = {
  name: string;
  description: string;
  features: Array<{
    key: string;
    value: string;
  }>;
  purchaseHref: string | null;
};

export default function PricingPlanCard({
  name,
  description,
  features,
  purchaseHref,
}: PricingPlanCardProps) {
  return (
    <article className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-8">
      <header className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-500 dark:bg-sky-500/15 dark:text-sky-300">
          <BoltIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">套餐详情</p>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{name}</h2>
        </div>
      </header>

      <p className="mt-5 text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>

      <div className="mt-6 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
        {features.length > 0 ? (
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div
                key={`${feature.key}-${feature.value}-${index}`}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <span className="text-gray-500 dark:text-gray-400">{feature.key}</span>
                <span className="text-right font-semibold text-gray-900 dark:text-white">
                  {feature.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">暂无功能说明</p>
        )}
      </div>

      {purchaseHref ? (
        <Link
          href={purchaseHref}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-800"
        >
          立即购买
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-400 px-4 py-3 text-sm font-medium text-white"
        >
          暂不可购买
        </button>
      )}
    </article>
  );
}
