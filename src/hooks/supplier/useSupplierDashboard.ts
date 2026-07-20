import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getEnhancedStats, getRecentActivities } from "../../services/supplier/dashboard.service"
import type { DashboardRecentActivity } from "../../types/supplier"
import type { EnhancedStats } from "../../services/supplier/dashboard.service"

export function useEnhancedStats() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<EnhancedStats>({
    queryKey: ["supplier-enhanced-stats", userId],
    queryFn: () => (userId ? getEnhancedStats(userId) : Promise.reject("No user")),
    enabled: !!userId,
  })
}

export function useRecentActivities() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<DashboardRecentActivity[]>({
    queryKey: ["supplier-recent-activities", userId],
    queryFn: () => (userId ? getRecentActivities(userId) : []),
    enabled: !!userId,
  })
}
