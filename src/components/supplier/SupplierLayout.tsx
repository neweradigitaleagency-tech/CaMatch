import { useState, useCallback } from "react"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard, Package, ClipboardList, MapPin, BarChart3, User, Menu, X, LogOut, Building2, Wallet, Scale, Truck, Banknote, Settings, Box, Users, Tag, FileText, FileUp, Upload,
} from "lucide-react"
import { useSupplierProfile } from "../../hooks/supplier/useSupplierProfile"
import { useAuthStore } from "../../stores/authStore"
import { RealtimeNotificationsProvider } from "../../contexts/RealtimeNotificationsContext"
import NotificationBell from "./NotificationBell"
import NotificationPanel from "./NotificationPanel"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/supplier/dashboard", icon: LayoutDashboard },
  { label: "Produits", href: "/supplier/products", icon: Package },
  { label: "Stocks", href: "/supplier/stock", icon: Box },
  { label: "Commandes", href: "/supplier/orders", icon: ClipboardList },
  { label: "Préparation", href: "/supplier/picking", icon: Package },
  { label: "Clients", href: "/supplier/clients", icon: Users },
  { label: "Promotions", href: "/supplier/promotions", icon: Tag },
  { label: "Paiements", href: "/supplier/payments", icon: Wallet },
  { label: "Factures", href: "/supplier/invoices", icon: FileText },
  { label: "Documents", href: "/supplier/documents", icon: FileUp },
  { label: "Litiges", href: "/supplier/disputes", icon: Scale },
  { label: "Suivi livraisons", href: "/supplier/deliveries", icon: Truck },
  { label: "Zones livraison", href: "/supplier/delivery-zones", icon: MapPin },
  { label: "Solde", href: "/supplier/balance", icon: Banknote },
  { label: "Imports", href: "/supplier/import", icon: Upload },
  { label: "Statistiques", href: "/supplier/stats", icon: BarChart3 },
  { label: "Profil", href: "/supplier/profile", icon: User },
  { label: "Paramètres", href: "/supplier/settings", icon: Settings },
]

export default function SupplierLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  const { data: profile } = useSupplierProfile()

  const handleNavClick = useCallback((href: string) => {
    setMobileOpen(false)
    if (location.pathname === href) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <RealtimeNotificationsProvider>
    <div className="min-h-dynamic bg-cm-surface flex">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-cm-text w-[260px] transition-transform duration-200
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 h-14 px-4 border-b border-white/10">
          <img src="/logo.svg" alt="Ça Match" className="h-6" />
          <span className="text-white text-[14px] font-bold whitespace-nowrap">Fournisseur</span>
          <button onClick={() => setMobileOpen(false)} className="ml-auto w-7 h-7 flex items-center justify-center text-white/50 hover:text-white cursor-pointer lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {profile && (
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white text-[13px] font-semibold truncate">{profile.companyName}</p>
            <p className="text-white/50 text-[11px]">{profile.city}</p>
          </div>
        )}

        <nav className="flex-1 py-3 overflow-y-auto space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => handleNavClick(item.href)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive ? "bg-cm-elevated/10 text-white" : "text-white/60 hover:bg-cm-elevated/5 hover:text-white"
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 h-10 w-full rounded-lg text-[13px] font-medium text-white/50 hover:bg-cm-elevated/5 hover:text-white cursor-pointer transition-colors">
            <LogOut className="w-[18px] h-[18px]" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen lg:ml-[260px]">
        <header className="h-14 bg-cm-elevated border-b border-cm-border flex items-center px-4 lg:px-6 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cm-surface cursor-pointer lg:hidden">
            <Menu className="w-5 h-5 text-cm-text-soft" />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <NotificationBell />
            <div className="relative">
              <NotificationPanel />
            </div>
            <Building2 className="w-4 h-4 text-cm-text-muted" />
            <span className="text-[12px] text-cm-text-muted">{profile?.companyName ?? "Fournisseur"}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
    </RealtimeNotificationsProvider>
  )
}
