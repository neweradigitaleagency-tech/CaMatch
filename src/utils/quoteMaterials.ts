import type { QuoteLineItem } from "../types";
import type { MaterialProduct } from "../types/marketplace";
import { MARKETPLACE_PRODUCTS } from "../data/marketplaceProducts";
import { TRAVEL_PICKUP_SURCHARGE_XOF } from "../components/pro/dashboard";

export type MaterialFulfillmentMode = "delivery" | "self_pickup" | "pro_pickup";

export interface MaterialFulfillmentOption {
  id: MaterialFulfillmentMode;
  label: string;
  hint: string;
}

export const MATERIAL_FULFILLMENT_OPTIONS: MaterialFulfillmentOption[] = [
  {
    id: "delivery",
    label: "Livraison quincaillerie",
    hint: "La quincaillerie livre les matériaux chez vous",
  },
  {
    id: "self_pickup",
    label: "Retrait en magasin",
    hint: "Vous récupérez les matériaux vous-même",
  },
  {
    id: "pro_pickup",
    label: "Le pro va chercher",
    hint: `Le pro récupère les matériaux et les apporte (${TRAVEL_PICKUP_SURCHARGE_XOF} F)`,
  },
];

export function isMaterialLine(li: QuoteLineItem): li is QuoteLineItem & { productId: string } {
  return li.source === "marketplace" && typeof li.productId === "string" && li.productId.length > 0;
}

export function getMaterialLines(lineItems: QuoteLineItem[]): QuoteLineItem[] {
  return lineItems.filter(isMaterialLine);
}

export function resolveMaterialProduct(productId: string): MaterialProduct | undefined {
  const p = MARKETPLACE_PRODUCTS.find((x) => x.id === productId);
  return p && p.vertical === "pro_supply" ? p : undefined;
}

export function materialProductPrice(p: MaterialProduct): number {
  return p.cmPrice ?? p.price;
}

export function getMaterialAlternatives(product: MaterialProduct, limit = 3): MaterialProduct[] {
  return MARKETPLACE_PRODUCTS
    .filter((p): p is MaterialProduct => p.vertical === "pro_supply" && p.isAvailable && p.status === "active")
    .filter((p) => p.id !== product.id && (p.category === product.category || p.subcategory === product.subcategory))
    .sort((a, b) => materialProductPrice(a) - materialProductPrice(b))
    .slice(0, limit);
}

export const QUINCAILLERIE_DELIVERY_FREE_THRESHOLD_XOF = 50000;
export const QUINCAILLERIE_DELIVERY_FEE_XOF = 3500;

export function getFulfillmentFee(mode: MaterialFulfillmentMode, materialSubtotalXOF: number): number {
  if (mode === "delivery") {
    return materialSubtotalXOF >= QUINCAILLERIE_DELIVERY_FREE_THRESHOLD_XOF ? 0 : QUINCAILLERIE_DELIVERY_FEE_XOF;
  }
  if (mode === "pro_pickup") return TRAVEL_PICKUP_SURCHARGE_XOF;
  return 0;
}
