import { CheckIcon, XIcon } from "lucide-react";
import { HouseholdCalculator } from "@/components/copper/household-calculator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatMemory,
  formatNotesHours,
  formatUsd,
  getPlans,
  getProducts,
} from "@/lib/copper/catalog";
import { cn } from "@/lib/utils";

export function PlusPricing() {
  const plans = getPlans();

  return (
    <section
      id="plus"
      data-testid="plus-pricing"
      className="w-full scroll-mt-16"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            Refine your answers with Copper Plus
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            One plan covers every Copper device in your home.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {plans.map((plan) => {
            const isPlus = plan.id === "copper-plus";
            return (
              <Card
                key={plan.id}
                className={cn("gap-6 py-6", isPlus && "ring-primary ring-2")}
              >
                <CardHeader className="gap-3 px-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-2xl font-bold">
                      <h3>{plan.name}</h3>
                    </CardTitle>
                    {isPlus && <Badge>Best for the whole household</Badge>}
                  </div>
                  <p>
                    <span
                      className={cn(
                        "text-4xl font-extrabold",
                        isPlus && "text-primary",
                      )}
                    >
                      {formatUsd(plan.monthlyUsd)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </p>
                  <p className="text-muted-foreground">
                    or {formatUsd(plan.annualUsd)}/year
                  </p>
                </CardHeader>

                <CardContent className="px-6">
                  <dl className="divide-y text-base">
                    <div className="flex justify-between gap-4 py-3">
                      <dt className="text-muted-foreground">Memory kept</dt>
                      <dd className="font-semibold">
                        {formatMemory(plan.memoryDays)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-3">
                      <dt className="text-muted-foreground">Notes recording</dt>
                      <dd className="font-semibold">
                        {formatNotesHours(plan.notesHoursPerMonth)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-3">
                      <dt className="text-muted-foreground">Refined answers</dt>
                      <dd className="flex items-center gap-1.5 font-semibold">
                        {plan.refinedAnswers ? (
                          <>
                            <CheckIcon
                              aria-hidden
                              className="text-accent size-5"
                            />
                            Included
                          </>
                        ) : (
                          <>
                            <XIcon
                              aria-hidden
                              className="text-muted-foreground size-5"
                            />
                            Not included
                          </>
                        )}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <HouseholdCalculator products={getProducts()} plans={plans} />
      </div>
    </section>
  );
}
