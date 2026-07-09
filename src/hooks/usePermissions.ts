import { useAdminAuthStore } from "../stores/adminAuthStore"

export function usePermissions() {
  const hasPermission = useAdminAuthStore((s) => s.hasPermission)
  const hasAnyPermission = useAdminAuthStore((s) => s.hasAnyPermission)
  const hasAllPermissions = useAdminAuthStore((s) => s.hasAllPermissions)
  const permissions = useAdminAuthStore((s) => s.permissions)
  const admin = useAdminAuthStore((s) => s.admin)

  return { hasPermission, hasAnyPermission, hasAllPermissions, permissions, admin }
}
