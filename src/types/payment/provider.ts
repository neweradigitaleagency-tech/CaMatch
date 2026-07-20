import type { UnifiedPaymentMethod } from "./methods";
import type { TransactionStatus, PayoutStatus } from "./status";

export type ProviderName =
  | "orange_money"
  | "mtn_momo"
  | "wave"
  | "moov_money"
  | "stripe"
  | "flutterwave"
  | "cinetpay"
  | "simulation";

export interface ProviderConfig {
  name: ProviderName;
  label: string;
  enabled: boolean;
  simulated: boolean;
  apiKey?: string;
  webhookSecret?: string;
  environment: "sandbox" | "production";
  supportedMethods: UnifiedPaymentMethod[];
  maxAmountXOF: number;
  fees: number;
}

export interface WebhookPayload {
  provider: ProviderName;
  event: string;
  payload: Record<string, unknown>;
  signature?: string;
  timestamp?: string;
}

export interface WebhookHandlerResult {
  handled: boolean;
  status: TransactionStatus | PayoutStatus;
  providerReference: string;
  providerResponse: Record<string, unknown>;
}

export type SimulationEvent =
  | "payment.success"
  | "payment.failed"
  | "payment.expired"
  | "payout.completed"
  | "payout.failed"
  | "refund.completed";

export interface SimulationTrigger {
  event: SimulationEvent;
  provider: ProviderName;
  reference: string;
  delayMs?: number;
  metadata?: Record<string, unknown>;
}

export interface SimulationResult {
  triggered: boolean;
  webhookPayload: WebhookPayload;
  processedAt: string;
}
