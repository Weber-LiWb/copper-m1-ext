// @vitest-environment node
import { describe, expect, it } from "vitest";
import { estimateHousehold } from "@/lib/copper/calculator";
import { getPlans, getProducts } from "@/lib/copper/catalog";

const products = getProducts();
const plans = getPlans();
const one = { "copper-home": 1, "copper-notes": 1 };

describe("lib/copper/calculator.ts", () => {
  it("adds device prices from the catalog", () => {
    const estimate = estimateHousehold(products, plans, one, "free");
    expect(estimate).toMatchObject({
      deviceCount: 2,
      devicesUsd: 278,
      planYearUsd: 0,
      firstYearUsd: 278,
      yearlySavingsUsd: null,
    });
  });

  it("charges 12 monthly payments without rounding noise", () => {
    const estimate = estimateHousehold(products, plans, one, "plus-monthly");
    expect(estimate?.planYearUsd).toBe(95.88);
    expect(estimate?.firstYearUsd).toBe(373.88);
    expect(estimate?.yearlySavingsUsd).toBeNull();
  });

  it("shows what the yearly plan saves over paying monthly", () => {
    const estimate = estimateHousehold(products, plans, one, "plus-yearly");
    expect(estimate?.planYearUsd).toBe(79);
    expect(estimate?.firstYearUsd).toBe(357);
    expect(estimate?.yearlySavingsUsd).toBe(16.88);
  });

  it("charges one Copper Plus plan however many devices there are", () => {
    const many = { "copper-home": 5, "copper-notes": 5 };
    const estimate = estimateHousehold(products, plans, many, "plus-yearly");
    expect(estimate?.devicesUsd).toBe(5 * 149 + 5 * 129);
    expect(estimate?.planYearUsd).toBe(79);
  });

  it("returns null when no devices are chosen", () => {
    const none = { "copper-home": 0, "copper-notes": 0 };
    expect(estimateHousehold(products, plans, none, "plus-yearly")).toBeNull();
  });
});
