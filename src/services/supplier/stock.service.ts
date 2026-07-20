import type { StockMovement, StockMovementType, SupplierProduct } from "../../types/supplier"
import { MOCK_STOCK_MOVEMENTS, MOCK_PRODUCTS, getMockSupplierProducts } from "../../data/supplier-mocks"

export const MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  entry: "Entrée",
  exit: "Sortie",
  return: "Retour",
  adjustment: "Ajustement",
  inventory: "Inventaire",
}

export const MOVEMENT_TYPE_COLORS: Record<StockMovementType, string> = {
  entry: "bg-green-100 text-green-800",
  exit: "bg-red-100 text-red-800",
  return: "bg-blue-100 text-blue-800",
  adjustment: "bg-amber-100 text-amber-800",
  inventory: "bg-purple-100 text-purple-800",
}

export const MOVEMENT_TYPE_ICONS: Record<StockMovementType, string> = {
  entry: "ArrowDownToLine",
  exit: "ArrowUpFromLine",
  return: "RotateCcw",
  adjustment: "SlidersHorizontal",
  inventory: "ClipboardCheck",
}

export function getStockMovements(supplierId: string, filters?: { type?: StockMovementType | "all"; productId?: string }): StockMovement[] {
  let result = MOCK_STOCK_MOVEMENTS.filter((m) => m.supplierId === supplierId)
  if (filters?.type && filters.type !== "all") result = result.filter((m) => m.type === filters.type)
  if (filters?.productId) result = result.filter((m) => m.productId === filters.productId)
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getStockAlerts(supplierId: string): { outOfStock: SupplierProduct[]; lowStock: SupplierProduct[] } {
  const products = getMockSupplierProducts(supplierId)
  const outOfStock = products.filter((p) => !p.unlimitedStock && p.availableStock <= 0 && p.isActive)
  const lowStock = products.filter((p) => !p.unlimitedStock && p.availableStock > 0 && p.availableStock <= p.lowStockThreshold && p.isActive)
  return { outOfStock, lowStock }
}

export function createStockMovement(data: {
  productId: string
  supplierId: string
  type: StockMovementType
  quantity: number
  reason?: string
  notes?: string
}): StockMovement {
  const product = MOCK_PRODUCTS.find((p) => p.id === data.productId)
  const stockBefore = product?.stock ?? 0
  let stockAfter = stockBefore
  if (data.type === "entry" || data.type === "return") stockAfter = stockBefore + data.quantity
  else stockAfter = Math.max(0, stockBefore - data.quantity)
  return {
    id: `sm-${Date.now()}`,
    productId: data.productId,
    supplierId: data.supplierId,
    productName: product?.name ?? "",
    type: data.type,
    quantity: data.quantity,
    stockBefore,
    stockAfter,
    reason: data.reason,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  }
}
