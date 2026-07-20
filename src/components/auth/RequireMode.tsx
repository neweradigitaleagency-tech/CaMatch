import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../../stores/authStore"
import type { ReactNode } from "react"

interface RequireModeProps {
  mode: "client" | "pro" | "supplier"
  fallback?: string
  children?: ReactNode
}

export default function RequireMode({ mode, fallback = "/", children }: RequireModeProps) {
  const activeMode = useAuthStore((s) => s.activeMode)
  const isPro = useAuthStore((s) => s.isPro)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const initialized = useAuthStore((s) => s.initialized)

  if (!initialized) return null

  if (!isAuthenticated) return <Navigate to="/onboarding" replace />

  if (mode === "pro" && !isPro && activeMode !== "pro") {
    return <Navigate to={fallback || "/"} replace />
  }

  if (mode === "client" && activeMode === "pro") {
    return <Navigate to={fallback || "/pro/dashboard"} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
