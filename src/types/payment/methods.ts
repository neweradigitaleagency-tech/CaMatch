export type MobileMoneyProvider =
  | "orange_money"
  | "mtn_momo"
  | "wave"
  | "moov_money";

export type CardProvider = "stripe" | "flutterwave" | "cinetpay";

export type PaymentMethod =
  | MobileMoneyProvider
  | CardProvider;

/** @deprecated Use "mtn_momo" instead */
export type MtnLegacy = "mtn_money";

export type UnifiedPaymentMethod =
  | PaymentMethod
  | "cash"
  | "bank_transfer"
  | "card"
  | "credit";

export type PayoutMethod =
  | MobileMoneyProvider
  | "bank_transfer";

export type PaymentMethodCategory = "mobile_money" | "card" | "cash" | "bank" | "credit";

export interface PaymentMethodInfo {
  value: UnifiedPaymentMethod;
  label: string;
  color: string;
  category: PaymentMethodCategory;
  fees: number;
  processingTime: string;
  maxXOF: number;
  countries: string[];
}

export const PAYMENT_METHOD_LABELS: Record<UnifiedPaymentMethod, string> = {
  orange_money: "Orange Money",
  mtn_momo: "MTN MoMo",
  wave: "Wave",
  moov_money: "Moov Money",
  stripe: "Stripe",
  flutterwave: "Flutterwave",
  cinetpay: "CinetPay",
  cash: "Espèces",
  bank_transfer: "Virement bancaire",
  card: "Carte bancaire",
  credit: "Crédit plateforme",
};

export const PAYMENT_METHOD_COLORS: Record<UnifiedPaymentMethod, string> = {
  orange_money: "#FF7900",
  mtn_momo: "#FFCC00",
  wave: "#1E90FF",
  moov_money: "#00A3FF",
  stripe: "#6772E5",
  flutterwave: "#F50057",
  cinetpay: "#1A56DB",
  cash: "#4CAF50",
  bank_transfer: "#607D8B",
  card: "#9C27B0",
  credit: "#FF9800",
};

export const MOBILE_MONEY_PROVIDERS: MobileMoneyProvider[] = [
  "orange_money",
  "mtn_momo",
  "wave",
  "moov_money",
];

export const CARD_PROVIDERS: CardProvider[] = [
  "stripe",
  "flutterwave",
  "cinetpay",
];
