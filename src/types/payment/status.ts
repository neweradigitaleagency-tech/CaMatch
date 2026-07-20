import type { UnifiedPaymentMethod } from "./methods";

export type TransactionStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "cancelled";

export type EscrowStatus =
  | "held"
  | "released"
  | "refunded"
  | "partially_refunded";

export type PayoutStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type InvoiceStatus =
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: "En attente",
  authorized: "Autorisé",
  captured: "Capturé",
  completed: "Terminé",
  failed: "Échoué",
  refunded: "Remboursé",
  partially_refunded: "Partiellement remboursé",
  cancelled: "Annulé",
};

export const ESCROW_STATUS_LABELS: Record<EscrowStatus, string> = {
  held: "Séquestré",
  released: "Libéré",
  refunded: "Remboursé",
  partially_refunded: "Partiellement remboursé",
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: "En attente",
  processing: "En cours",
  completed: "Effectué",
  failed: "Échoué",
};

export const TRANSACTION_STATUS_FLOW: TransactionStatus[] = [
  "pending",
  "authorized",
  "captured",
  "completed",
];

export const ESCROW_STATUS_FLOW: EscrowStatus[] = [
  "held",
  "released",
];

export const PAYOUT_STATUS_FLOW: PayoutStatus[] = [
  "pending",
  "processing",
  "completed",
];

export interface PaymentFlowConfig {
  allowedMethods: UnifiedPaymentMethod[];
  requireEscrow: boolean;
  autoReleaseDays: number;
  commissionPercent: number;
  minAmountXOF: number;
  maxAmountXOF: number;
}

export const DEFAULT_PAYMENT_FLOW: PaymentFlowConfig = {
  allowedMethods: ["orange_money", "mtn_momo", "wave", "moov_money"],
  requireEscrow: true,
  autoReleaseDays: 3,
  commissionPercent: 15,
  minAmountXOF: 500,
  maxAmountXOF: 5_000_000,
};
