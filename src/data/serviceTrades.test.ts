import { describe, expect, it } from "vitest";
import { categoriesWithPros, tradesWithCounts } from "./serviceTrades";
import { MOCK_PROS } from "../services/mockData";
import { SERVICE_CATEGORIES } from "./serviceCategories";

describe("serviceTrades", () => {
  it("listes les catégories qui ont des pros", () => {
    const cats = categoriesWithPros().map((c) => c.id);
    expect(cats).toContain("maison-reparations");
    expect(cats).toContain("transport-livraison");
    expect(cats).not.toContain("beaute-bien-etre");
    expect(cats).not.toContain("sante-domicile");
  });

  it("compte les pros par métier et conserve l'ordre des sous-catégories", () => {
    const trades = tradesWithCounts("maison-reparations");
    const first = SERVICE_CATEGORIES.find((c) => c.id === "maison-reparations")!.subcategories[0]!.name;
    expect(trades[0]!.name).toBe(first);
    expect(trades.length).toBeGreaterThan(1);

    const total = trades.reduce((sum, t) => sum + t.count, 0);
    expect(total).toBe(MOCK_PROS.filter((p) => p.category === "maison-reparations").length);
  });

  it("renvoie une liste vide pour une catégorie sans pros", () => {
    expect(tradesWithCounts("beaute-bien-etre")).toEqual([]);
  });
});
