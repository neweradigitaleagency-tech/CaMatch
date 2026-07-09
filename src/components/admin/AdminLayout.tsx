import { useState } from "react"
import { Outlet, Navigate } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"
import AdminTopbar from "./AdminTopbar"
import AdminBreadcrumb from "./AdminBreadcrumb"
import { useAdminAuthStore } from "../../stores/adminAuthStore"

export default function AdminLayout() {
  const { isAuthenticated, initialized } = useAdminAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--admin-bg)]">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[var(--admin-accent)] rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`admin-main flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? "lg:ml-[64px]" : "lg:ml-[260px]"}`}>
        <AdminTopbar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 max-w-[1400px] w-full mx-auto">
          <AdminBreadcrumb />
          <Outlet />
        </main>
        <footer className="border-t border-gray-200 py-3 px-6 text-[11px] text-gray-400 text-center">
          Ça Match Back Office &copy; {new Date().getFullYear()} &mdash; Propulsé par NEDA
        </footer>
      </div>
    </div>
  )
}
