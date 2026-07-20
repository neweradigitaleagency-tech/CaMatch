import type { UnifiedPaymentMethod } from "./methods";
import type { TransactionStatus } from "./status";

export type TransactionType =
  | "payment"
  | "payout"
  | "refund"
  | "commission"
  | "withdrawal"
  | "fee"
  | "bonus"
  | "cashback";

export type LinkedEntityType =
  | "mission"
  | "subscription"
  | "material_order"
  | "boost"
  | "escrow"
  | "payout";

export interface TransactionLedgerEntry {
  id: string;
  type: TransactionType;
  fromUserId: string;
  toUserId: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  method: UnifiedPaymentMethod;
  status: TransactionStatus;
  reference?: string;
  linkedEntityType?: LinkedEntityType;
  linkedEntityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentIntent {
  id: string;
  jobId: string;
  payerId: string;
  amount: number;
  currency: string;
  method: UnifiedPaymentMethod;
  status: TransactionStatus;
  providerReference?: string;
  providerResponse?: Record<string, unknown>;
  webhookReceivedAt?: string;
  expiresAt: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePayInInput {
  missionId: string;
  clientId: string;
  proId: string;
  amountXOF: number;
  method: UnifiedPaymentMethod;
}

export interface CreatePayoutInput {
  payeeId: string;
  amount: number;
  method: UnifiedPaymentMethod;
  holdUntil?: string;
}

export interface TransactionSummary {
  totalEarnedXOF: number;
  totalWithdrawnXOF: number;
  totalCommissionPaidXOF: number;
  pendingBalanceXOF: number;
  availableBalanceXOF: number;
  transactionCount: number;
  lastTransactionAt?: string;
}

export function calculateNetAmount(
  grossAmount: number,
  feePercent: number,
): { feeAmount: number; netAmount: number } {
  const feeAmount = Math.round(grossAmount * feePercent / 100);
  return {
    feeAmount,
    netAmount: grossAmount - feeAmount,
  };
}
