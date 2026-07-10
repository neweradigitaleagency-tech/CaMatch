export type SupplierStatus = 'EN_ATTENTE' | 'VERIFIE' | 'ACTIF' | 'BLOQUE' | 'REJETE'
export type SupplierApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
export type MaterialOrderStatus =
  | 'PENDING_SUPPLIER'
  | 'ACCEPTED'
  | 'AWAITING_PAYMENT'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'PARTIALLY_DELIVERED'
  | 'CANCELLED'
  | 'DISPUTED'
export type UnitType = 'piece' | 'meter' | 'kg' | 'liter' | 'bag' | 'box' | 'set'

export interface SupplierProfile {
  userId: string
  companyName: string
  ownerName: string
  phone: string
  email?: string
  address?: string
  city: string
  logoUrl?: string
  photoUrl?: string
  legalDocsUrls?: string[]
  status: SupplierStatus
  commissionRate: number
  rating: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  reviewedBy?: string
  reviewedAt?: string
  rejectionReason?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  parentId?: string
  sortOrder: number
  isActive: boolean
  children?: ProductCategory[]
}

export interface SupplierProduct {
  id: string
  supplierId: string
  categoryId: string
  categoryName?: string
  name: string
  description?: string
  images: string[]
  brand?: string
  manufacturerReference?: string
  barcode?: string
  technicalSpecs: Record<string, unknown>
  unitType: UnitType
  supplierPrice: number
  recommendedPrice?: number
  cmPrice: number
  stock: number
  reservedStock: number
  availableStock: number
  lowStockThreshold: number
  unlimitedStock: boolean
  isActive: boolean
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export interface SupplierProductFormData {
  name: string
  categoryId: string
  description?: string
  images: string[]
  brand?: string
  manufacturerReference?: string
  barcode?: string
  technicalSpecs: Record<string, unknown>
  unitType: UnitType
  supplierPrice: number
  recommendedPrice?: number
  stock: number
  lowStockThreshold: number
  unlimitedStock: boolean
  isVisible: boolean
}

export interface DeliveryZone {
  id: string
  supplierId: string
  city: string
  price: number
  estimatedDelayHours?: number
  isActive: boolean
}

export interface SupplierApplication {
  id: string
  userId: string
  companyName: string
  ownerName: string
  phone: string
  email?: string
  address?: string
  city: string
  legalDocsUrls?: string[]
  photoUrl?: string
  logoUrl?: string
  deliveryCities?: string[]
  status: SupplierApplicationStatus
  reviewedBy?: string
  reviewNotes?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export interface MaterialOrder {
  id: string
  jobId: string
  quoteId?: string
  supplierId: string
  supplierName?: string
  clientId: string
  clientName?: string
  professionalId: string
  professionalName?: string
  status: MaterialOrderStatus
  deliveryCity?: string
  deliveryAddress?: string
  deliveryCost: number
  subtotal: number
  commission: number
  total: number
  notes?: string
  estimatedDeliveryAt?: string
  deliveredAt?: string
  cancelledAt?: string
  cancellationReason?: string
  items?: MaterialOrderItem[]
  createdAt: string
  updatedAt: string
}

export interface MaterialOrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface SupplierCommission {
  id: string
  supplierId: string
  rate: number
  effectiveFrom: string
  effectiveTo?: string
  createdBy?: string
  createdAt: string
}

export interface SupplierDashboardStats {
  todayOrders: number
  todayRevenue: number
  activeProducts: number
  lowStockCount: number
  rating: number
  pendingOrders: number
  preparingOrders: number
  revenueChange: number
  ordersChange: number
}

export type SupplierPaymentStatus = 'pending' | 'captured' | 'refunded' | 'partially_refunded' | 'failed'
export type SupplierPaymentProvider = 'orange_money' | 'mtn_momo' | 'wave' | 'moov_money'
export type DisputeStatus = 'opened' | 'under_review' | 'resolved_supplier' | 'resolved_client' | 'rejected'
export type DeliveryStatus = 'pending' | 'preparing' | 'picked_up' | 'in_transit' | 'delivered' | 'partial' | 'failed'
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface SupplierPayment {
  id: string
  orderId: string
  supplierId: string
  provider: SupplierPaymentProvider
  providerTransactionId: string
  amount: number
  subtotal: number
  deliveryCost: number
  commission: number
  netAmount: number
  status: SupplierPaymentStatus
  failureReason?: string
  refundedAt?: string
  refundReason?: string
  createdAt: string
  updatedAt: string
}

export interface SupplierDispute {
  id: string
  orderId: string
  supplierId: string
  clientId: string
  clientName?: string
  professionalId: string
  professionalName?: string
  reason: string
  description: string
  amount: number
  status: DisputeStatus
  attachments: string[]
  resolvedAt?: string
  resolution?: string
  resolvedBy?: string
  messages: DisputeMessage[]
  createdAt: string
  updatedAt: string
}

export interface DisputeMessage {
  id: string
  disputeId: string
  senderId: string
  senderRole: 'supplier' | 'client' | 'admin'
  senderName: string
  content: string
  attachments: string[]
  createdAt: string
}

export interface SupplierDelivery {
  id: string
  orderId: string
  supplierId: string
  city: string
  address: string
  status: DeliveryStatus
  estimatedPickupAt?: string
  pickedUpAt?: string
  estimatedDeliveryAt?: string
  deliveredAt?: string
  driverName?: string
  driverPhone?: string
  vehicleInfo?: string
  trackingSteps: DeliveryStep[]
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export interface DeliveryStep {
  id: string
  deliveryId: string
  status: string
  label: string
  description: string
  timestamp: string
}

export interface StockReservation {
  id: string
  productId: string
  orderId: string
  supplierId: string
  quantity: number
  status: 'active' | 'released' | 'fulfilled'
  createdAt: string
  releasedAt?: string
}

export interface SupplierBalance {
  available: number
  pending: number
  totalEarned: number
  totalCommission: number
  lastPayoutAt?: string
}

export interface SupplierPayout {
  id: string
  supplierId: string
  amount: number
  status: PayoutStatus
  provider: SupplierPaymentProvider
  providerReference?: string
  requestedAt: string
  processedAt?: string
  failedAt?: string
  failureReason?: string
}

export function calculateCmPrice(supplierPrice: number, commissionRate: number): number {
  if (commissionRate >= 100) return supplierPrice
  return Math.round(supplierPrice / (1 - commissionRate / 100))
}

export function calculateAvailableStock(product: { stock: number; reservedStock: number; unlimitedStock?: boolean }): number {
  if (product.unlimitedStock) return 99999
  return Math.max(0, product.stock - product.reservedStock)
}
