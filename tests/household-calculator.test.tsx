import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HouseholdCalculator } from "@/components/copper/household-calculator";
import { getPlans, getProducts } from "@/lib/copper/catalog";

function renderCalculator(products = getProducts(), plans = getPlans()) {
  render(<HouseholdCalculator products={products} plans={plans} />);
  const total = () => screen.getByTestId("first-year-total").textContent;
  const click = (name: string) =>
    fireEvent.click(screen.getByRole("button", { name }));
  return { total, click };
}

describe("HouseholdCalculator", () => {
  it("starts with one of each device on the yearly plan", () => {
    const { total } = renderCalculator();
    expect(screen.getByLabelText("Copper Home count")).toHaveTextContent("1");
    expect(screen.getByLabelText("Copper Notes count")).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "Plus yearly" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(total()).toBe("$357");
    expect(screen.getByText(/One plan covers all 2 devices/)).toBeInTheDocument();
  });

  it("updates the total when devices are added or removed", () => {
    const { total, click } = renderCalculator();
    click("Add a Copper Home");
    expect(total()).toBe("$506");
    click("Remove a Copper Notes");
    expect(total()).toBe("$377");
  });

  it("keeps each count between 0 and 5", () => {
    const { click } = renderCalculator();
    for (let i = 0; i < 7; i++) click("Add a Copper Home");
    expect(screen.getByLabelText("Copper Home count")).toHaveTextContent("5");
    expect(screen.getByRole("button", { name: "Add a Copper Home" })).toBeDisabled();
    for (let i = 0; i < 7; i++) click("Remove a Copper Home");
    expect(screen.getByLabelText("Copper Home count")).toHaveTextContent("0");
    expect(
      screen.getByRole("button", { name: "Remove a Copper Home" }),
    ).toBeDisabled();
  });

  it("shows savings only on the yearly plan", () => {
    const { total, click } = renderCalculator();
    expect(screen.getByText(/You save \$16\.88/)).toBeInTheDocument();

    click("Plus monthly");
    expect(total()).toBe("$373.88");
    expect(screen.queryByText(/You save/)).toBeNull();

    click("Free");
    expect(total()).toBe("$278");
    expect(screen.queryByText(/One plan covers/)).toBeNull();
  });

  it("asks for a device when none are chosen", () => {
    const { click } = renderCalculator();
    click("Remove a Copper Home");
    click("Remove a Copper Notes");
    expect(screen.getByText("Add a device to see your total.")).toBeInTheDocument();
    expect(screen.queryByTestId("first-year-total")).toBeNull();
  });

  it("follows the catalog when prices change", () => {
    const products = getProducts().map((p) => ({ ...p, priceUsd: p.priceUsd + 50 }));
    const plans = getPlans().map((p) =>
      p.id === "copper-plus" ? { ...p, monthlyUsd: 9.49, annualUsd: 95 } : p,
    );
    const { total } = renderCalculator(products, plans);
    expect(total()).toBe("$473");
    expect(screen.getByText(/You save \$18\.88/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\$149|\$129|\$7\.99|\$79\b/);
  });
});
