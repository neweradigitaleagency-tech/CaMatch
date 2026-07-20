import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getPromotions, getActivePromotionsCount } from "../../services/supplier/promotions.service"
import type { SupplierPromotion } from "../../types/supplier"

export function useSupplierPromotions() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<SupplierPromotion[]>({
    queryKey: ["supplier-promotions", userId],
    queryFn: () => (userId ? getPromotions(userId) : []),
    enabled: !!userId,
  })
}

export function useActivePromotionsCount() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ["supplier-active-promotions-count", userId],
    queryFn: () => (userId ? getActivePromotionsCount(userId) : 0),
    enabled: !!userId,
  })
}
