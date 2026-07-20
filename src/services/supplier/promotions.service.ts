import type { SupplierPromotion, PromotionType } from "../../types/supplier"
import { getMockSupplierPromotions, MOCK_PRODUCTS } from "../../data/supplier-mocks"

export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  fixed: "Remise fixe",
  percentage: "Pourcentage",
  pack: "Pack",
  clearance: "Déstockage",
}

export const PROMOTION_TYPE_COLORS: Record<PromotionType, string> = {
  fixed: "bg-blue-100 text-blue-800",
  percentage: "bg-green-100 text-green-800",
  pack: "bg-purple-100 text-purple-800",
  clearance: "bg-red-100 text-red-800",
}

export function getPromotions(supplierId: string): SupplierPromotion[] {
  return getMockSupplierPromotions(supplierId)
}

export function getPromotionById(supplierId: string, promotionId: string): SupplierPromotion | undefined {
  return getMockSupplierPromotions(supplierId).find((p) => p.id === promotionId)
}

export function getPromotionStatus(promotion: SupplierPromotion): "active" | "scheduled" | "expired" {
  const now = new Date()
  const start = new Date(promotion.startDate)
  const end = new Date(promotion.endDate)
  if (end < now) return "expired"
  if (start > now) return "scheduled"
  return "active"
}

export function getActivePromotionsCount(supplierId: string): number {
  return getMockSupplierPromotions(supplierId).filter((p) => new Date(p.endDate) > new Date() && new Date(p.startDate) <= new Date()).length
}
