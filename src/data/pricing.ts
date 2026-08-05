const HOURLY_CATEGORIES = new Set(["education-formation"]);

export function isHourlyCategory(category: string): boolean {
  return HOURLY_CATEGORIES.has(category);
}

export function roundPriceFCFA(value: number): number {
  return Math.max(500, Math.round(value / 500) * 500);
}

export function formatPriceLabel(rate: number, options: { hourly?: boolean } = {}): string {
  const rounded = roundPriceFCFA(rate);
  if (options.hourly) return `${rounded.toLocaleString("fr-FR")} F/h`;
  return `À partir de ${rounded.toLocaleString("fr-FR")} F`;
}
