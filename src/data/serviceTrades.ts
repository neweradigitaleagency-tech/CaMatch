import { SERVICE_CATEGORIES, type ServiceCategory } from "./serviceCategories";
import { MOCK_PROS } from "../services/mockData";

export function categoriesWithPros(): ServiceCategory[] {
  return SERVICE_CATEGORIES.filter((c) => MOCK_PROS.some((p) => p.category === c.id));
}

export function tradesWithCounts(catId: string): { name: string; count: number }[] {
  const pros = MOCK_PROS.filter((p) => p.category === catId);
  const present = [...new Set(pros.map((p) => p.subCategory).filter(Boolean))];
  const cat = SERVICE_CATEGORIES.find((c) => c.id === catId);
  const order = cat ? cat.subcategories.map((s) => s.name) : [];
  const ordered = [...order.filter((t) => present.includes(t)), ...present.filter((t) => !order.includes(t))];
  return ordered.map((name) => ({
    name,
    count: MOCK_PROS.filter((p) => p.category === catId && p.subCategory === name).length,
  }));
}
