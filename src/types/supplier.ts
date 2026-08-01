import type { TransactionStatus, MobileMoneyProvider, PayoutStatus as PayoutStatusAlias } from './payment'

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
  subcategoryId?: string
  categoryName?: string
  subcategoryName?: string
  name: string
  description?: string
  images: string[]
  videos?: string[]
  brand?: string
  manufacturerReference?: string
  barcode?: string
  technicalSpecs: Record<string, unknown>
  unitType: UnitType
  supplierPrice: number
  recommendedPrice?: number
  cmPrice: number
  salePrice?: number
  saleEndsAt?: string
  stock: number
  reservedStock: number
  availableStock: number
  lowStockThreshold: number
  unlimitedStock: boolean
  isActive: boolean
  isVisible: boolean
  variants?: ProductVariant[]
  createdAt: string
  updatedAt: string
}

export interface SupplierProductFormData {
  name: string
  categoryId: string
  description?: string
  images: string[]
  videos: string[]
  brand?: string
  manufacturerReference?: string
  barcode?: string
  technicalSpecs: Record<string, unknown>
  unitType: UnitType
  supplierPrice: number
  recommendedPrice?: number
  salePrice?: number
  saleEndsAt?: string
  stock: number
  lowStockThreshold: number
  unlimitedStock: boolean
  isVisible: boolean
  variants?: ProductVariantFormData[]
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  sku?: string
  supplierPrice: number
  stock: number
  images: string[]
  attributes: Record<string, string>
  isActive: boolean
  sortOrder: number
}

export interface ProductVariantFormData {
  name: string
  sku?: string
  supplierPrice: number
  stock: number
  images: string[]
  attributes: Record<string, string>
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

export type RecentActivityType = 'order' | 'payment' | 'stock' | 'client' | 'invoice' | 'dispute'

export interface DashboardRecentActivity {
  id: string
  type: RecentActivityType
  label: string
  description: string
  amount?: number
  referenceId?: string
  referenceUrl?: string
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

export type SupplierPaymentStatus = Extract<TransactionStatus, "pending" | "captured" | "refunded" | "partially_refunded" | "failed">
export type SupplierPaymentProvider = MobileMoneyProvider
export type DisputeStatus = 'opened' | 'under_review' | 'resolved_supplier' | 'resolved_client' | 'rejected'
export type DeliveryStatus = 'pending' | 'preparing' | 'picked_up' | 'in_transit' | 'delivered' | 'partial' | 'failed'
export type PayoutStatus = PayoutStatusAlias

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

export type PromotionType = 'fixed' | 'percentage' | 'pack' | 'clearance'
export type PromotionStatus = 'active' | 'scheduled' | 'expired'

export interface SupplierPromotion {
  id: string
  supplierId: string
  productId: string
  productName?: string
  type: PromotionType
  value: number
  startDate: string
  endDate: string
  conditions?: string
  maxQuantity?: number
  usageCount: number
  isActive: boolean
  createdAt: string
}

export type SupplierUserRole = 'admin' | 'manager' | 'storekeeper' | 'preparer' | 'accountant'

export const ROLE_LABELS: Record<SupplierUserRole, string> = {
  admin: 'Administrateur',
  manager: 'Gestionnaire',
  storekeeper: 'Magasinier',
  preparer: 'Préparateur',
  accountant: 'Comptable',
}

export interface TeamMember {
  id: string
  supplierId: string
  name: string
  email: string
  phone?: string
  role: SupplierUserRole
  isActive: boolean
  lastActiveAt?: string
  createdAt: string
}

export interface ActiveSession {
  id: string
  userId: string
  device: string
  browser: string
  ip: string
  lastActiveAt: string
  isCurrent: boolean
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'cancelled'

export interface SupplierInvoice {
  id: string
  orderId: string
  supplierId: string
  clientId: string
  clientName?: string
  number: string
  subtotal: number
  deliveryCost: number
  commission: number
  total: number
  status: InvoiceStatus
  dueDate: string
  paidAt?: string
  notes?: string
  createdAt: string
}

export interface SupplierClient {
  id: string
  name: string
  phone: string
  email?: string
  city: string
  address?: string
  totalOrders: number
  totalSpent: number
  lastOrderAt?: string
  createdAt: string
}

export type StockMovementType = 'entry' | 'exit' | 'return' | 'adjustment' | 'inventory'

export interface StockMovement {
  id: string
  productId: string
  supplierId: string
  productName?: string
  type: StockMovementType
  quantity: number
  stockBefore: number
  stockAfter: number
  reason?: string
  notes?: string
  createdAt: string
  createdBy?: string
}

export type DocumentCategory = 'legal' | 'catalog' | 'invoice' | 'delivery_note' | 'identification' | 'other'
export type DocumentStatus = 'pending' | 'processing' | 'reviewed' | 'approved' | 'rejected'

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  legal: 'Document légal',
  catalog: 'Catalogue produit',
  invoice: 'Facture',
  delivery_note: 'Bon de livraison',
  identification: 'Pièce d\'identité',
  other: 'Autre',
}

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  pending: 'En attente',
  processing: 'Analyse OCR...',
  reviewed: 'Examiné',
  approved: 'Approuvé',
  rejected: 'Rejeté',
}

export interface SupplierDocument {
  id: string
  supplierId: string
  name: string
  description?: string
  category: DocumentCategory
  status: DocumentStatus
  fileName: string
  fileSize: number
  fileType: string
  ocrText?: string
  ocrConfidence?: number
  extractedFields?: Record<string, string>
  rejectionReason?: string
  uploadedAt: string
  reviewedAt?: string
}

export interface ImportSession {
  id: string
  supplierId: string
  fileName: string
  fileType: 'csv' | 'xlsx'
  totalRows: number
  importedRows: number
  failedRows: number
  errors: ImportRowError[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
}

export interface ImportRowError {
  row: number
  message: string
}

export function calculateAvailableStock(product: { stock: number; reservedStock: number; unlimitedStock?: boolean }): number {
  if (product.unlimitedStock) return 99999
  return Math.max(0, product.stock - product.reservedStock)
}

export type PickingStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface PickingItem {
  id: string
  productId: string
  productName: string
  productReference: string
  quantity: number
  pickedQuantity: number
  storageLocation?: string
  unit?: string
}

export interface PickingList {
  id: string
  orderId: string
  supplierId: string
  status: PickingStatus
  items: PickingItem[]
  preparedBy?: string
  notes?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
}
