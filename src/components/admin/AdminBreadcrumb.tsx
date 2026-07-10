import { useLocation, Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"

const LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Clients",
  pros: "Professionnels",
  verifications: "Vérifications",
  missions: "Missions",
  support: "Support",
  reports: "Signalements",
  payments: "Paiements",
  notifications: "Notifications",
  analytics: "Analytics",
  settings: "Paramètres",
  logs: "Logs",
}

export default function AdminBreadcrumb() {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav className="flex items-center gap-1 text-[13px] mb-5" aria-label="Fil d'Ariane">
      <Link to="/admin/dashboard" className="flex items-center justify-center w-7 h-7 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-border-light)] transition-all cursor-pointer">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {segments.slice(1).map((seg, i) => {
        const path = "/admin/" + segments.slice(1, i + 2).join("/")
        const label = LABEL_MAP[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
        const isLast = i === segments.length - 2
        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-[var(--admin-text-muted)] opacity-50" />
            {isLast ? (
              <span className="text-[var(--admin-text-primary)] font-semibold">{label}</span>
            ) : (
              <Link to={path} className="text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors cursor-pointer">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
