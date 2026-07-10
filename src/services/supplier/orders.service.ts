import { supabase, isSupabaseReady } from "../supabase"
import type { MaterialOrder, MaterialOrderItem, MaterialOrderStatus } from "../../types/supplier"
import { MOCK_ORDERS, getMockSupplierOrders } from "../../data/supplier-mocks"

export const ORDER_STATUS_LABELS: Record<MaterialOrderStatus, string> = {
  PENDING_SUPPLIER: "En attente",
  ACCEPTED: "Acceptée",
  AWAITING_PAYMENT: "Paiement en attente",
  PREPARING: "En préparation",
  READY: "Prête",
  DELIVERING: "En livraison",
  DELIVERED: "Livrée",
  PARTIALLY_DELIVERED: "Livraison partielle",
  CANCELLED: "Annulée",
  DISPUTED: "Litige",
}

export const ORDER_STATUS_COLORS: Record<MaterialOrderStatus, string> = {
  PENDING_SUPPLIER: "bg-amber-100 text-amber-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  AWAITING_PAYMENT: "bg-purple-100 text-purple-800",
  PREPARING: "bg-indigo-100 text-indigo-800",
  READY: "bg-green-100 text-green-800",
  DELIVERING: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  PARTIALLY_DELIVERED: "bg-orange-100 text-orange-800",
  CANCELLED: "bg-red-100 text-red-800",
  DISPUTED: "bg-rose-100 text-rose-800",
}

export function getStatusLabel(status: MaterialOrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status
}

export function getStatusColor(status: MaterialOrderStatus): string {
  return ORDER_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"
}

export const ORDER_STATUS_TRANSITIONS: Record<MaterialOrderStatus, MaterialOrderStatus[]> = {
  PENDING_SUPPLIER: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "AWAITING_PAYMENT", "CANCELLED"],
  AWAITING_PAYMENT: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERING"],
  DELIVERING: ["DELIVERED", "PARTIALLY_DELIVERED"],
  DELIVERED: ["DISPUTED"],
  PARTIALLY_DELIVERED: ["DELIVERED", "DISPUTED"],
  CANCELLED: [],
  DISPUTED: [],
}

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getSupplierOrders(supplierId: string, statusFilter?: string): Promise<MaterialOrder[]> {
  await delay()
  if (!isSupabaseReady()) return getMockSupplierOrders(supplierId, statusFilter)
  let query = supabase
    .from("material_orders" as never)
    .select("*, material_order_items(*)" as never)
    .eq("supplier_id" as never, supplierId)

  if (statusFilter && statusFilter !== "all") query = query.eq("status" as never, statusFilter)

  const { data } = await query.order("created_at" as never, { ascending: false })
  if (!data) return []
  return (data as any[]).map(mapOrder)
}

export async function getSupplierOrderById(orderId: string): Promise<MaterialOrder | null> {
  await delay()
  if (!isSupabaseReady()) return MOCK_ORDERS.find((o) => o.id === orderId) ?? null
  const { data } = await supabase
    .from("material_orders" as never)
    .select("*, material_order_items(*)" as never)
    .eq("id" as never, orderId)
    .single()
  if (!data) return null
  return mapOrder(data as any)
}

export async function updateOrderStatus(orderId: string, status: MaterialOrderStatus): Promise<boolean> {
  await delay()
  if (!isSupabaseReady()) return true
  const { error } = await supabase
    .from("material_orders" as never)
    .update({ status } as never)
    .eq("id" as never, orderId)
  return !error
}

function mapOrder(data: any): MaterialOrder {
  return {
    id: data.id,
    jobId: data.job_id,
    quoteId: data.quote_id ?? undefined,
    supplierId: data.supplier_id,
    supplierName: data.supplier_name ?? undefined,
    clientId: data.client_id,
    clientName: data.client_name ?? undefined,
    professionalId: data.professional_id,
    professionalName: data.professional_name ?? undefined,
    status: data.status,
    deliveryCity: data.delivery_city ?? undefined,
    deliveryAddress: data.delivery_address ?? undefined,
    deliveryCost: data.delivery_cost ?? 0,
    subtotal: data.subtotal,
    commission: data.commission ?? 0,
    total: data.total,
    notes: data.notes ?? undefined,
    estimatedDeliveryAt: data.estimated_delivery_at ?? undefined,
    deliveredAt: data.delivered_at ?? undefined,
    cancelledAt: data.cancelled_at ?? undefined,
    cancellationReason: data.cancellation_reason ?? undefined,
    items: (data.material_order_items ?? []).map((item: any) => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
    })),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
