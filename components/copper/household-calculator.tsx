"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  type DeviceCounts,
  estimateHousehold,
  MAX_DEVICES,
  type PlanChoice,
} from "@/lib/copper/calculator";
import { formatUsd, type Plan, type Product } from "@/lib/copper/catalog";

const CHOICES: { id: PlanChoice; label: string }[] = [
  { id: "free", label: "Free" },
  { id: "plus-monthly", label: "Plus monthly" },
  { id: "plus-yearly", label: "Plus yearly" },
];

export function HouseholdCalculator({
  products,
  plans,
}: {
  products: Product[];
  plans: Plan[];
}) {
  const [counts, setCounts] = useState<DeviceCounts>({
    "copper-home": 1,
    "copper-notes": 1,
  });
  const [choice, setChoice] = useState<PlanChoice>("plus-yearly");

  const plus = plans.find((p) => p.id === "copper-plus");
  const estimate = estimateHousehold(products, plans, counts, choice);
  const change = (product: Product, by: number) =>
    setCounts((current) => ({
      ...current,
      [product.id]: Math.min(
        MAX_DEVICES,
        Math.max(0, current[product.id] + by),
      ),
    }));

  const planLine =
    choice === "plus-monthly" && plus
      ? `${formatUsd(plus.monthlyUsd)}/month`
      : choice === "plus-yearly" && plus
        ? `${formatUsd(plus.annualUsd)}/year`
        : formatUsd(0);

  return (
    <Card data-testid="household-calculator" className="mt-8 gap-6 py-6">
      <CardHeader className="gap-2 px-6">
        <CardTitle className="text-2xl font-bold">
          <h3>What will your household pay?</h3>
        </CardTitle>
        <CardDescription className="text-base">
          Pick your devices and a plan to see your first-year cost.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-8 px-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <ul className="flex flex-col gap-4">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {formatUsd(product.priceUsd)} each
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Remove a ${product.name}`}
                    disabled={counts[product.id] === 0}
                    onClick={() => change(product, -1)}
                  >
                    <MinusIcon />
                  </Button>
                  <output
                    aria-label={`${product.name} count`}
                    className="w-6 text-center text-lg font-bold tabular-nums"
                  >
                    {counts[product.id]}
                  </output>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Add a ${product.name}`}
                    disabled={counts[product.id] === MAX_DEVICES}
                    onClick={() => change(product, 1)}
                  >
                    <PlusIcon />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2">
            <p className="font-semibold">Plan</p>
            <ButtonGroup aria-label="Plan">
              {CHOICES.map(({ id, label }) => (
                <Button
                  key={id}
                  variant={choice === id ? "default" : "outline"}
                  aria-pressed={choice === id}
                  onClick={() => setChoice(id)}
                >
                  {label}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </div>

        <div aria-live="polite" className="bg-muted rounded-lg p-5">
          {estimate ? (
            <dl className="divide-y text-base">
              <div className="flex justify-between gap-4 pb-3">
                <dt className="text-muted-foreground">Devices</dt>
                <dd className="font-semibold">
                  {formatUsd(estimate.devicesUsd)}
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-3">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    {plus?.name ?? "Copper Plus"}
                  </dt>
                  <dd className="font-semibold">{planLine}</dd>
                </div>
                {choice !== "free" && (
                  <dd className="text-muted-foreground text-sm">
                    One plan covers all {estimate.deviceCount}{" "}
                    {estimate.deviceCount === 1 ? "device" : "devices"}.
                  </dd>
                )}
              </div>
              <div className="flex justify-between gap-4 pt-3">
                <dt className="font-semibold">First-year total</dt>
                <dd
                  data-testid="first-year-total"
                  className="text-primary text-2xl font-extrabold"
                >
                  {formatUsd(estimate.firstYearUsd)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted-foreground">
              Add a device to see your total.
            </p>
          )}

          {estimate?.yearlySavingsUsd != null && (
            <p className="mt-3 font-semibold">
              You save {formatUsd(estimate.yearlySavingsUsd)} compared with
              paying monthly.
            </p>
          )}

          <Separator className="my-4" />
          <p className="text-muted-foreground text-sm">
            Every new device comes with a 30-day free trial of Copper Plus.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
