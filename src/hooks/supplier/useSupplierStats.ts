import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getSupplierDashboardStats } from "../../services/supplier/profile.service"
import type { SupplierDashboardStats } from "../../types/supplier"

export function useSupplierStats() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<SupplierDashboardStats>({
    queryKey: ["supplier-stats", userId],
    queryFn: () => (userId ? getSupplierDashboardStats(userId) : Promise.resolve({
      todayOrders: 0, todayRevenue: 0, activeProducts: 0, lowStockCount: 0, rating: 0,
      pendingOrders: 0, preparingOrders: 0, revenueChange: 0, ordersChange: 0,
    })),
    enabled: !!userId,
  })
}
