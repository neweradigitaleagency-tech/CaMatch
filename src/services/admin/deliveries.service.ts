import { MOCK_DELIVERIES } from "../../data/supplier-mocks"
import type { SupplierDelivery } from "../../types/supplier"

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export interface AdminDeliveryRow {
  id: string
  orderId: string
  supplierId: string
  city: string
  address: string
  status: string
  driverName?: string
  driverPhone?: string
  vehicleInfo?: string
  estimatedDeliveryAt?: string
  deliveredAt?: string
  failureReason?: string
  createdAt: string
  stepCount: number
}

export function getDeliveryStatusBadge(status: string): { label: string; status: string } {
  const map: Record<string, { label: string; status: string }> = {
    pending: { label: "En attente", status: "pending" },
    preparing: { label: "Préparation", status: "in_progress" },
    picked_up: { label: "Enlevée", status: "in_progress" },
    in_transit: { label: "En route", status: "in_progress" },
    delivered: { label: "Livrée", status: "active" },
    partial: { label: "Partielle", status: "warning" },
    failed: { label: "Échouée", status: "rejected" },
  }
  return map[status] ?? { label: status, status: "pending" }
}

export async function getAdminDeliveries(): Promise<AdminDeliveryRow[]> {
  await delay()
  return MOCK_DELIVERIES.map((d) => ({
    id: d.id,
    orderId: d.orderId,
    supplierId: d.supplierId,
    city: d.city,
    address: d.address,
    status: d.status,
    driverName: d.driverName,
    driverPhone: d.driverPhone,
    vehicleInfo: d.vehicleInfo,
    estimatedDeliveryAt: d.estimatedDeliveryAt,
    deliveredAt: d.deliveredAt,
    failureReason: d.failureReason,
    createdAt: d.createdAt,
    stepCount: d.trackingSteps.length,
  }))
}

export async function getAdminDeliveryDetail(id: string): Promise<SupplierDelivery | null> {
  await delay()
  return MOCK_DELIVERIES.find((d) => d.id === id) ?? null
}
