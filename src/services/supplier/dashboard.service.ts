import { getMockSupplierProducts, getMockSupplierOrders, getMockRecentActivities, getMockSupplierInvoices, getMockSupplierPayments, getMockSupplier } from "../../data/supplier-mocks"
import { getActivePromotionsCount } from "./promotions.service"
import type { DashboardRecentActivity } from "../../types/supplier"
import { getMockSupplierStats } from "../../data/supplier-mocks"

export interface EnhancedStats {
  todayOrders: number
  monthOrders: number
  todayRevenue: number
  monthRevenue: number
  pendingOrders: number
  preparingOrders: number
  activeProducts: number
  productsSold: number
  lowStockCount: number
  outOfStockCount: number
  averageOrderValue: number
  activeClients: number
  unpaidInvoices: number
  overdueInvoices: number
  activePromotions: number
  openDisputes: number
  activeDeliveries: number
  rating: number
  revenueChange: number
  ordersChange: number
}

function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { start, now }
}

export function getEnhancedStats(supplierId: string): EnhancedStats {
  const stats = getMockSupplierStats(supplierId)
  const products = getMockSupplierProducts(supplierId)
  const orders = getMockSupplierOrders(supplierId)
  const invoices = getMockSupplierInvoices(supplierId)
  const payments = getMockSupplierPayments(supplierId)
  const promoCount = getActivePromotionsCount(supplierId)

  const { start } = getMonthRange()
  const monthOrders = orders.filter((o) => new Date(o.createdAt) >= start).length
  const monthRevenue = orders.filter((o) => new Date(o.createdAt) >= start).reduce((s, o) => s + o.total, 0)
  const productsSold = orders.reduce((s, o) => s + (o.items?.reduce((si, i) => si + i.quantity, 0) ?? 0), 0)

  const clientIds = [...new Set(orders.map((o) => o.clientId))]
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const activeClients = orders.filter((o) => new Date(o.createdAt) > monthAgo).length > 0 ? clientIds.length : Math.max(1, clientIds.length - 1)

  const unpaidInvoices = invoices.filter((i) => i.status === "unpaid").length
  const overdueInvoices = invoices.filter((i) => i.status === "overdue").length
  const outOfStockCount = products.filter((p) => !p.unlimitedStock && p.availableStock <= 0).length

  const avgOrderValue = orders.length > 0 ? Math.round(orders.reduce((s, o) => s + o.total, 0) / orders.length) : 0

  return {
    todayOrders: stats.todayOrders,
    monthOrders,
    todayRevenue: stats.todayRevenue,
    monthRevenue,
    pendingOrders: stats.pendingOrders,
    preparingOrders: stats.preparingOrders,
    activeProducts: stats.activeProducts,
    productsSold,
    lowStockCount: stats.lowStockCount,
    outOfStockCount,
    averageOrderValue: avgOrderValue,
    activeClients,
    unpaidInvoices,
    overdueInvoices,
    activePromotions: promoCount,
    openDisputes: 2,
    activeDeliveries: 3,
    rating: stats.rating,
    revenueChange: stats.revenueChange,
    ordersChange: stats.ordersChange,
  }
}

export function getRecentActivities(supplierId: string): DashboardRecentActivity[] {
  return getMockRecentActivities(supplierId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
