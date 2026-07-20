import type { EscrowStatus } from "./status";
import type { UnifiedPaymentMethod } from "./methods";

export interface EscrowEntry {
  id: string;
  missionId: string;
  clientId: string;
  proId: string;
  amountXOF: number;
  commissionPercent: number;
  commissionXOF: number;
  proAmountXOF: number;
  platformAmountXOF: number;
  method: UnifiedPaymentMethod;
  status: EscrowStatus;
  transactionId?: string;
  paidAt: string;
  releasedAt?: string;
  refundedAt?: string;
  createdAt: string;
}

export interface EscrowRelease {
  escrowId: string;
  releasedBy: "client" | "auto" | "admin";
  releasedAt: string;
  transactionId: string;
}

export interface EscrowRefund {
  escrowId: string;
  refundedBy: "client" | "pro" | "admin" | "dispute";
  refundedAt: string;
  refundPercent: number;
  refundAmountXOF: number;
  reason?: string;
  transactionId: string;
}

export interface EscrowSummary {
  totalHeldXOF: number;
  totalReleasedXOF: number;
  totalRefundedXOF: number;
  pendingReleaseCount: number;
  averageReleaseTimeHours: number;
}

export const ESCROW_COMMISSION_PERCENT = 15;

export function calculateEscrowAmounts(
  amountXOF: number,
  commissionPercent: number = ESCROW_COMMISSION_PERCENT,
): {
  commissionXOF: number;
  proAmountXOF: number;
  platformAmountXOF: number;
} {
  const commissionXOF = Math.round(amountXOF * commissionPercent / 100);
  return {
    commissionXOF,
    proAmountXOF: amountXOF - commissionXOF,
    platformAmountXOF: commissionXOF,
  };
}
