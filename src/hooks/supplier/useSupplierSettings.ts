import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { fetchTeamMembersBySupplier, fetchSessions, fetchSessionCount } from "../../services/supplier/settings.service"
import type { TeamMember, ActiveSession } from "../../types/supplier"

export function useTeamMembers() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<TeamMember[]>({
    queryKey: ["supplier-team", userId],
    queryFn: () => fetchTeamMembersBySupplier(userId || "supplier-1"),
    enabled: !!userId,
  })
}

export function useSessions() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<ActiveSession[]>({
    queryKey: ["supplier-sessions", userId],
    queryFn: () => fetchSessions(userId || "supplier-1"),
    enabled: !!userId,
  })
}

export function useSessionCount() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<number>({
    queryKey: ["supplier-session-count", userId],
    queryFn: () => fetchSessionCount(userId || "supplier-1"),
    enabled: !!userId,
  })
}
