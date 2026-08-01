import { useAdminAuthStore } from "../stores/adminAuthStore"

export function usePermissions() {
  const hasPermission = useAdminAuthStore.hasPermission
  const hasAnyPermission = useAdminAuthStore.hasAnyPermission
  const hasAllPermissions = useAdminAuthStore.hasAllPermissions
  const permissions = useAdminAuthStore.permissions
  const admin = useAdminAuthStore.admin

  return { hasPermission, hasAnyPermission, hasAllPermissions, permissions, admin }
}
