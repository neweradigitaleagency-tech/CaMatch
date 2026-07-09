import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getAdminNotifications, NOTIF_TYPE_LABELS, NOTIF_CHANNEL_LABELS, NOTIF_STATUS_LABELS } from "../../services/admin/notifications.service"
import { usePermissions } from "../../hooks/usePermissions"
import AdminTable from "../../components/admin/ui/AdminTable"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import type { Column } from "../../components/admin/ui/AdminTable"
import type { AdminNotification } from "../../services/admin/notifications.service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type FilterType = "all" | "sent" | "pending" | "failed" | "scheduled"

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "sent", label: "Envoyées" },
  { key: "pending", label: "En attente" },
  { key: "failed", label: "Échouées" },
  { key: "scheduled", label: "Planifiées" },
]

const STATUS_STYLES: Record<string, string> = {
  sent: "active",
  pending: "pending",
  scheduled: "info",
  failed: "rejected",
}

const TYPE_STYLES: Record<string, string> = {
  info: "text-blue-700 bg-blue-50 border-blue-200",
  warning: "text-amber-700 bg-amber-50 border-amber-200",
  promotion: "text-purple-700 bg-purple-50 border-purple-200",
  system: "text-gray-600 bg-gray-100 border-gray-200",
}

export default function AdminNotificationsPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { notifications: data, total: count } = await getAdminNotifications({ perPage: 100 })
      setNotifications(data); setTotal(count)
    } catch {
      setError("Impossible de charger les notifications.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.status === filter)
  const canSend = hasPermission("notifications.send")

  const columns: Column<AdminNotification>[] = [
    {
      key: "title", label: "Notification", sortable: true, width: "280px",
      render: (n) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${TYPE_STYLES[n.type] ?? "text-gray-500 bg-gray-100 border-gray-200"}`}>
              {NOTIF_TYPE_LABELS[n.type] ?? n.type}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${n.channel === "email" ? "text-blue-600 bg-blue-50 border-blue-200" : n.channel === "sms" ? "text-green-600 bg-green-50 border-green-200" : "text-gray-600 bg-gray-100 border-gray-200"}`}>
              {NOTIF_CHANNEL_LABELS[n.channel] ?? n.channel}
            </span>
          </div>
          <p className="text-[13px] font-medium text-gray-900 truncate mt-1">{n.title}</p>
          <p className="text-[11px] text-gray-400 truncate">{n.content}</p>
        </div>
      ),
    },
    {
      key: "target", label: "Cible", sortable: true, width: "100px",
      render: (n) => (
        <div className="flex flex-col">
          <span className="text-[12px] text-gray-700 capitalize">{n.target === "all" ? "Tous" : n.target === "clients" ? "Clients" : n.target === "professionals" ? "Pros" : "Spécifique"}</span>
          {n.target_users && <span className="text-[11px] text-gray-400">{n.target_users} utilisateur{(n.target_users) > 1 ? "s" : ""}</span>}
        </div>
      ),
    },
    {
      key: "delivery", label: "Délivrées", sortable: false, width: "100px",
      render: (n) => (
        <div className="flex flex-col">
          <span className="text-[12px] text-gray-700">{n.sent_count}</span>
          {n.failed_count > 0 && <span className="text-[11px] text-red-500">{n.failed_count} échec{n.failed_count > 1 ? "s" : ""}</span>}
        </div>
      ),
    },
    {
      key: "status", label: "Statut", sortable: true, width: "100px",
      render: (n) => {
        const s = STATUS_STYLES[n.status] ?? "inactive"
        return <StatusBadge status={s} label={NOTIF_STATUS_LABELS[n.status] ?? n.status} />
      },
    },
    {
      key: "created_at", label: "Créée le", sortable: true, width: "110px",
      render: (n) => (
        <div className="flex flex-col">
          <span className="text-[12px] text-gray-500">{format(new Date(n.created_at), "d MMM HH:mm", { locale: fr })}</span>
          {n.created_by && <span className="text-[11px] text-gray-400">{n.created_by}</span>}
        </div>
      ),
    },
  ]

  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Notifications</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{total} notification{total !== 1 ? "s" : ""}</p>
        </div>
        {canSend && (
          <button onClick={() => navigate("/admin/notifications/create")} className="h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
            Nouvelle notification
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${filter === f.key ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1.5 text-[11px] opacity-60">
                ({notifications.filter((n) => n.status === f.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(n) => n.id}
        searchable
        searchKeys={["title", "content", "id"]}
        exportable
        loading={loading}
        emptyMessage="Aucune notification trouvée"
      />
    </div>
  )
}
