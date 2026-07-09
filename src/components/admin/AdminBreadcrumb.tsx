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
    <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-4">
      <Link to="/admin/dashboard" className="hover:text-gray-700 transition-colors cursor-pointer">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {segments.slice(1).map((seg, i) => {
        const path = "/admin/" + segments.slice(1, i + 2).join("/")
        const label = LABEL_MAP[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
        const isLast = i === segments.length - 2
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-gray-300" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{label}</span>
            ) : (
              <Link to={path} className="hover:text-gray-700 transition-colors cursor-pointer">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
