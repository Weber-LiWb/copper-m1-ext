// Household cost math for the Copper Plus calculator. Prices come in from the
// catalog; totals are worked out in cents so they never show rounding noise.
import type { Plan, Product, ProductId } from "./catalog";

export type PlanChoice = "free" | "plus-monthly" | "plus-yearly";

export type DeviceCounts = Record<ProductId, number>;

export type HouseholdEstimate = {
  deviceCount: number;
  devicesUsd: number;
  /** What the chosen plan costs over 12 months. */
  planYearUsd: number;
  firstYearUsd: number;
  /** Yearly plan vs 12 monthly payments; only set for "plus-yearly". */
  yearlySavingsUsd: number | null;
};

export const MAX_DEVICES = 5;

const cents = (usd: number) => Math.round(usd * 100);

/** null when no devices are chosen: there is nothing to total. */
export function estimateHousehold(
  products: Product[],
  plans: Plan[],
  counts: DeviceCounts,
  choice: PlanChoice,
): HouseholdEstimate | null {
  const deviceCount = products.reduce((n, p) => n + (counts[p.id] ?? 0), 0);
  if (deviceCount === 0) return null;

  const devices = products.reduce(
    (sum, p) => sum + cents(p.priceUsd) * (counts[p.id] ?? 0),
    0,
  );

  // One Copper Plus plan covers every device, so its price never scales.
  const plus = plans.find((p) => p.id === "copper-plus");
  const monthlyYear = plus ? cents(plus.monthlyUsd) * 12 : 0;
  const yearly = plus ? cents(plus.annualUsd) : 0;
  const planYear =
    choice === "plus-monthly" ? monthlyYear : choice === "plus-yearly" ? yearly : 0;

  return {
    deviceCount,
    devicesUsd: devices / 100,
    planYearUsd: planYear / 100,
    firstYearUsd: (devices + planYear) / 100,
    yearlySavingsUsd:
      choice === "plus-yearly" ? (monthlyYear - yearly) / 100 : null,
  };
}
