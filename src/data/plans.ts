import { Check, Shield, Zap, Crown } from "lucide-react";
import type { PlanConfig, PaymentMethod } from "../types";

export const PLANS: PlanConfig[] = [
  {
    tier: "standard",
    label: "Standard",
    priceMonthly: 0,
    priceOneTime: 0,
    commissionRate: 0.15,
    badge: null,
    requiresVerification: false,
    features: [
      "Profil de base",
      "Répondre aux demandes",
      "Commission 15%",
      "Support standard",
    ],
  },
  {
    tier: "verified",
    label: "Vérifié",
    priceMonthly: 0,
    priceOneTime: 5000,
    commissionRate: 0.15,
    badge: "✓ Vérifié",
    requiresVerification: false,
    features: [
      "Badge Vérifié sur le profil",
      "Confiance client renforcée",
      "Commission 15%",
      "Paiement unique",
    ],
  },
  {
    tier: "pro",
    label: "Pro",
    priceMonthly: 2000,
    priceOneTime: 0,
    commissionRate: 0.12,
    badge: "PRO",
    requiresVerification: false,
    features: [
      "Profil mis en avant",
      "Apparition prioritaire",
      "Commission réduite 12%",
      "Statistiques détaillées",
      "Support prioritaire",
    ],
  },
  {
    tier: "pro_plus",
    label: "Pro+",
    priceMonthly: 5000,
    priceOneTime: 0,
    commissionRate: 0.08,
    badge: "PRO+",
    requiresVerification: true,
    features: [
      "Tout du plan Pro",
      "Commission super réduite 8%",
      "Badge PRO+",
      "Top position dans les recherches",
      "Support VIP",
    ],
  },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: "orange_money", label: "Orange Money", icon: "📱" },
  { value: "mtn_momo", label: "MTN MoMo", icon: "📱" },
  { value: "moov_money", label: "Moov Money", icon: "📱" },
];

export function getPlanByTier(tier: string): PlanConfig | undefined {
  return PLANS.find((p) => p.tier === tier);
}

export function getBadgeForTier(tier: string, isVerified: boolean): string | null {
  if (tier === "pro_plus") return "PRO+";
  if (tier === "pro") return "PRO";
  if (isVerified) return "✓ Vérifié";
  return null;
}

export function getPaymentMethodLabel(method: string): string {
  const m = PAYMENT_METHODS.find((p) => p.value === method);
  return m ? m.label : method;
}
