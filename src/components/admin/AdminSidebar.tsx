import { NavLink, useLocation } from "react-router-dom"
import { ADMIN_NAV_ITEMS } from "../../constants/admin/routes"
import { usePermissions } from "../../hooks/usePermissions"
import {
  LayoutDashboard, Users, Briefcase, ShieldCheck, ClipboardList,
  MessageSquare, Flag, CreditCard, Bell, BarChart3, Settings, ScrollText, Menu, X, ShieldAlert
} from "lucide-react"

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const { hasPermission } = usePermissions()
  const location = useLocation()

  const visibleItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  )

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onMobileClose} />
      )}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-[var(--admin-sidebar)] transition-all duration-200
          ${collapsed ? "w-[64px]" : "w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center h-14 px-4 border-b border-white/10 gap-3">
          <div className="w-7 h-7 rounded-full bg-[var(--admin-accent)] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            Ç
          </div>
          {!collapsed && (
            <span className="text-white text-[14px] font-bold whitespace-nowrap">Ça Match Admin</span>
          )}
          <button onClick={onToggle} className="ml-auto w-7 h-7 flex items-center justify-center text-white/50 hover:text-white cursor-pointer lg:flex hidden">
            <Menu className="w-4 h-4" />
          </button>
          <button onClick={onMobileClose} className="ml-auto w-7 h-7 flex items-center justify-center text-white/50 hover:text-white cursor-pointer lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto space-y-0.5 px-2">
          {visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <ShieldAlert className="w-5 h-5 text-white/30" />
              </div>
              {!collapsed && (
                <>
                  <p className="text-[13px] font-semibold text-white/50 mb-1">Aucune permission</p>
                  <p className="text-[11px] text-white/30 leading-relaxed">
                    Ce compte administrateur n'a pas de rôle configuré. Contactez un super-administrateur.
                  </p>
                </>
              )}
            </div>
          ) : (
            visibleItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium transition-colors cursor-pointer
                    ${isActive
                      ? "bg-[var(--admin-sidebar-active)] text-[var(--admin-sidebar-text-active)]"
                      : "text-[var(--admin-sidebar-text)] hover:bg-[var(--admin-sidebar-hover)] hover:text-white"
                    }`}
                  title={collapsed ? item.label : undefined}
                >
                  {Icon && <Icon className="w-[18px] h-[18px] shrink-0" />}
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              )
            })
          )}
        </nav>

        <div className="border-t border-white/10 p-3 text-[11px] text-white/30 text-center">
          {!collapsed && <span>v1.0.0</span>}
        </div>
      </aside>
    </>
  )
}
