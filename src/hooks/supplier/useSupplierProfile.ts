import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getSupplierProfile, updateSupplierProfile, getSupplierDashboardStats, getSupplierApplication, createSupplierApplication } from "../../services/supplier/profile.service"
import type { SupplierProfile, SupplierDashboardStats, SupplierApplication } from "../../types/supplier"

export function useSupplierProfile() {
  const userId = useAuthStore((s) => s.user?.id) ?? "supplier-1"
  return useQuery<SupplierProfile | null>({
    queryKey: ["supplier-profile", userId],
    queryFn: () => getSupplierProfile(userId),
  })
}

export function useSupplierDashboardStats() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<SupplierDashboardStats>({
    queryKey: ["supplier-dashboard-stats", userId],
    queryFn: () => (userId ? getSupplierDashboardStats(userId) : Promise.resolve({
      todayOrders: 0, todayRevenue: 0, activeProducts: 0, lowStockCount: 0, rating: 0,
      pendingOrders: 0, preparingOrders: 0, revenueChange: 0, ordersChange: 0,
    })),
    enabled: !!userId,
  })
}

export function useUpdateSupplierProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<SupplierProfile> }) =>
      updateSupplierProfile(userId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["supplier-profile"] }),
  })
}

export function useSupplierApplication() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<SupplierApplication | null>({
    queryKey: ["supplier-application", userId],
    queryFn: () => (userId ? getSupplierApplication(userId) : Promise.resolve(null)),
    enabled: !!userId,
  })
}

export function useCreateSupplierApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (app: Omit<SupplierApplication, "id" | "status" | "createdAt" | "updatedAt">) =>
      createSupplierApplication(app),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["supplier-application"] }),
  })
}
