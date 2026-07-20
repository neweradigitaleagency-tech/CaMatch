import type { InvoiceStatus } from "./status";
import type { UnifiedPaymentMethod } from "./methods";

export type InvoiceDomain = "mission" | "subscription" | "supplier";

export interface BaseInvoice {
  id: string;
  number: string;
  domain: InvoiceDomain;
  amount: number;
  tax?: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  method?: UnifiedPaymentMethod;
  pdfUrl?: string;
  notes?: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
}

export interface MissionInvoice extends BaseInvoice {
  domain: "mission";
  missionId: string;
  clientId: string;
  proId: string;
  clientName: string;
  proName: string;
  category: string;
  address: string;
  reason: string;
  laborCostXOF: number;
  materialsCostXOF: number;
  travelCostXOF: number;
  commissionPercent: number;
  commissionXOF: number;
  proAmountXOF: number;
  beforePhotos: string[];
  afterPhotos: string[];
  clientRating?: number;
  clientComment?: string;
}

export interface SubscriptionInvoice extends BaseInvoice {
  domain: "subscription";
  userId: string;
  subscriptionId: string;
  planName: string;
  billingPeriod: { start: string; end: string };
}

export interface SupplierInvoice extends BaseInvoice {
  domain: "supplier";
  orderId: string;
  supplierId: string;
  clientId: string;
  clientName?: string;
  subtotal: number;
  deliveryCost: number;
  commission: number;
}

export type Invoice = MissionInvoice | SubscriptionInvoice | SupplierInvoice;
