import { supabase, isSupabaseReady } from "../supabase"
import type { MaterialOrder, MaterialOrderItem, MaterialOrderStatus } from "../../types/supplier"
import { MOCK_ORDERS, getMockSupplierOrders } from "../../data/supplier-mocks"

export interface CreateOrderInput {
  jobId: string
  quoteId?: string
  supplierId: string
  clientId: string
  professionalId: string
  deliveryCity?: string
  deliveryAddress?: string
  deliveryCost?: number
  notes?: string
  estimatedDeliveryAt?: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    unitPrice: number
  }>
}

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

export async function createMaterialOrder(input: CreateOrderInput): Promise<MaterialOrder | null> {
  const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const deliveryCost = input.deliveryCost ?? 0
  const commission = Math.round(subtotal * 0.1)
  const total = subtotal + deliveryCost + commission

  if (!isSupabaseReady()) {
    return mockCreateOrder(input, subtotal, deliveryCost, commission, total)
  }

  const { data, error } = await supabase
    .from("material_orders" as never)
    .insert({
      job_id: input.jobId,
      quote_id: input.quoteId ?? null,
      supplier_id: input.supplierId,
      client_id: input.clientId,
      professional_id: input.professionalId,
      delivery_city: input.deliveryCity ?? null,
      delivery_address: input.deliveryAddress ?? null,
      delivery_cost: deliveryCost,
      subtotal,
      commission,
      total,
      notes: input.notes ?? null,
      estimated_delivery_at: input.estimatedDeliveryAt ?? null,
      status: "PENDING_SUPPLIER",
      material_order_items: input.items.map((item) => ({
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    } as never)
    .select("*, material_order_items(*)")
    .single()

  if (error) {
    console.error("createMaterialOrder error:", error)
    return null
  }

  return mapOrder(data)
}

function mockCreateOrder(
  input: CreateOrderInput, subtotal: number,
  deliveryCost: number, commission: number, total: number,
): MaterialOrder {
  const order: MaterialOrder = {
    id: `mock-${Date.now()}`,
    jobId: input.jobId,
    quoteId: input.quoteId,
    supplierId: input.supplierId,
    clientId: input.clientId,
    professionalId: input.professionalId,
    status: "PENDING_SUPPLIER",
    deliveryCity: input.deliveryCity,
    deliveryAddress: input.deliveryAddress,
    deliveryCost,
    subtotal,
    commission,
    total,
    notes: input.notes,
    estimatedDeliveryAt: input.estimatedDeliveryAt,
    items: input.items.map((item, i) => ({
      id: `mock-item-${i}`,
      orderId: `mock-${Date.now()}`,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return order
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
