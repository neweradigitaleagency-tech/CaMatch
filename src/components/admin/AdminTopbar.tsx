import { useAdminAuthStore } from "../../stores/adminAuthStore"
import { useNavigate } from "react-router-dom"
import { Search, Bell, LogOut, Menu, User } from "lucide-react"
import { useState } from "react"

interface AdminTopbarProps {
  onMenuToggle: () => void
}

export default function AdminTopbar({ onMenuToggle }: AdminTopbarProps) {
  const admin = useAdminAuthStore.admin
  const logout = useAdminAuthStore.logout
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/admin/login")
  }

  return (
    <header className="bg-cm-elevated border-b border-[var(--admin-border)] h-[60px] sticky top-0 z-30 flex items-center px-4 lg:px-6 gap-4">
      <button onClick={onMenuToggle} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-cm-surface cursor-pointer lg:hidden">
        <Menu className="w-5 h-5 text-cm-text-soft" />
      </button>

      <div className="flex-1 flex items-center">
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full h-9 pl-9 pr-4 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text placeholder-cm-text-muted focus:border-cm-border"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-cm-surface cursor-pointer">
          <Bell className="w-[18px] h-[18px] text-cm-text-muted" />
          <span className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-red-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-cm-surface cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--admin-accent)] flex items-center justify-center text-white text-[10px] font-bold">
              {admin?.firstname?.[0] ?? <User className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[13px] font-medium text-cm-text hidden sm:block">
              {admin?.firstname} {admin?.lastname}
            </span>
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-cm-elevated border border-cm-border rounded-xl shadow-lg z-20 py-1">
                <div className="px-4 py-2 border-b border-cm-border/40">
                  <p className="text-[13px] font-semibold text-cm-text">{admin?.firstname} {admin?.lastname}</p>
                  <p className="text-[11px] text-cm-text-muted">{admin?.email}</p>
                </div>
                {admin?.roles.map((role: { id: string; name: string; description?: string | null }) => (
                  <div key={role.id} className="px-4 py-1.5 text-[11px] text-cm-text-muted">
                    {role.description ?? role.name}
                  </div>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
