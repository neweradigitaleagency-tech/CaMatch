import { MOCK_DISPUTES, MOCK_ORDERS } from "../../data/supplier-mocks"
import type { SupplierDispute } from "../../types/supplier"

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export interface AdminDisputeRow {
  id: string
  orderId: string
  supplierName: string
  clientName: string
  reason: string
  amount: number
  status: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

const SUPPLIER_NAMES: Record<string, string> = {
  "supplier-1": "Mamadou Diallo",
  "supplier-2": "Soro Ibrahim",
  "supplier-3": "Kouamé Philippe",
}

export function getDisputeStatusBadge(status: string): { label: string; status: string } {
  const map: Record<string, { label: string; status: string }> = {
    opened: { label: "Ouvert", status: "pending" },
    under_review: { label: "En cours", status: "in_progress" },
    resolved_supplier: { label: "Résolu (fournisseur)", status: "active" },
    resolved_client: { label: "Résolu (client)", status: "active" },
    rejected: { label: "Rejeté", status: "rejected" },
  }
  return map[status] ?? { label: status, status: "pending" }
}

export async function getAdminDisputes(): Promise<AdminDisputeRow[]> {
  await delay()
  return MOCK_DISPUTES.map((d) => ({
    id: d.id,
    orderId: d.orderId,
    supplierName: SUPPLIER_NAMES[d.supplierId] ?? d.supplierId,
    clientName: d.clientName ?? d.clientId,
    reason: d.reason,
    amount: d.amount,
    status: d.status,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    messageCount: d.messages.length,
  }))
}

export async function getAdminDisputeDetail(id: string): Promise<SupplierDispute | null> {
  await delay()
  return MOCK_DISPUTES.find((d) => d.id === id) ?? null
}

export async function resolveDispute(
  disputeId: string,
  resolution: string,
  resolvedBy: string,
): Promise<boolean> {
  await delay()
  const dispute = MOCK_DISPUTES.find((d) => d.id === disputeId)
  if (!dispute) return false
  dispute.status = "resolved_client"
  dispute.resolvedAt = new Date().toISOString()
  dispute.resolution = resolution
  dispute.resolvedBy = resolvedBy
  dispute.messages.push({
    id: `dmsg-admin-${Date.now()}`,
    disputeId,
    senderId: resolvedBy,
    senderRole: "admin",
    senderName: "Admin Ça Match",
    content: resolution,
    attachments: [],
    createdAt: new Date().toISOString(),
  })
  return true
}

export async function rejectDispute(
  disputeId: string,
  reason: string,
  resolvedBy: string,
): Promise<boolean> {
  await delay()
  const dispute = MOCK_DISPUTES.find((d) => d.id === disputeId)
  if (!dispute) return false
  dispute.status = "rejected"
  dispute.resolvedAt = new Date().toISOString()
  dispute.resolution = reason
  dispute.resolvedBy = resolvedBy
  dispute.messages.push({
    id: `dmsg-admin-${Date.now()}`,
    disputeId,
    senderId: resolvedBy,
    senderRole: "admin",
    senderName: "Admin Ça Match",
    content: `Litige rejeté : ${reason}`,
    attachments: [],
    createdAt: new Date().toISOString(),
  })
  return true
}
