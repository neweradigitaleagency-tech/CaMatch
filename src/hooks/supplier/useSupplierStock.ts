import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getStockMovements, getStockAlerts, createStockMovement } from "../../services/supplier/stock.service"
import { getMockSupplierProducts } from "../../data/supplier-mocks"
import type { StockMovement, StockMovementType } from "../../types/supplier"

export function useSupplierStockMovements(filters?: { type?: StockMovementType | "all"; productId?: string }) {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<StockMovement[]>({
    queryKey: ["supplier-stock-movements", userId, filters?.type, filters?.productId],
    queryFn: () => (userId ? getStockMovements(userId, filters) : []),
    enabled: !!userId,
  })
}

export function useSupplierStockAlerts() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ["supplier-stock-alerts", userId],
    queryFn: () => (userId ? getStockAlerts(userId) : { outOfStock: [], lowStock: [] }),
    enabled: !!userId,
  })
}

export function useSupplierProductsStock() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ["supplier-products-stock", userId],
    queryFn: () => (userId ? getMockSupplierProducts(userId) : []),
    enabled: !!userId,
  })
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      productId: string
      supplierId: string
      type: StockMovementType
      quantity: number
      reason?: string
      notes?: string
    }) => Promise.resolve(createStockMovement(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-stock-movements"] })
      queryClient.invalidateQueries({ queryKey: ["supplier-stock-alerts"] })
      queryClient.invalidateQueries({ queryKey: ["supplier-products-stock"] })
      queryClient.invalidateQueries({ queryKey: ["supplier-products"] })
    },
  })
}
