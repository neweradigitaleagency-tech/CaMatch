import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getMissions, MISSION_STATUS_LABELS } from "../../services/admin/missions.service"
import { usePermissions } from "../../hooks/usePermissions"
import AdminTable from "../../components/admin/ui/AdminTable"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import { formatCompactNumber } from "../../utils/admin/formatCurrency"
import { ClipboardList, Clock, CheckCircle, AlertTriangle, Hourglass, MapPin } from "lucide-react"
import type { Column } from "../../components/admin/ui/AdminTable"
import type { Mission } from "../../services/admin/missions.service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { getCategoryLabel } from "../../constants/admin/categoryLabels"

type FilterType = "all" | "pending" | "quoted" | "in_progress" | "completed" | "cancelled" | "disputed"

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "quoted", label: "Devisées" },
  { key: "in_progress", label: "En cours" },
  { key: "completed", label: "Terminées" },
  { key: "cancelled", label: "Annulées" },
  { key: "disputed", label: "Litiges" },
]

const STATUS_STYLES: Record<string, string> = {
  draft: "inactive",
  pending: "pending",
  quoted: "info",
  accepted: "info",
  in_progress: "info",
  completed: "active",
  cancelled: "rejected",
  disputed: "suspended",
}

const URGENCY_LABELS: Record<string, string> = {
  low: "Basse", medium: "Moyenne", high: "Haute", emergency: "Urgence",
}

export default function AdminMissionsPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [missions, setMissions] = useState<Mission[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")

  const fetchMissions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { missions: data, total: count } = await getMissions({ perPage: 100 })
      setMissions(data)
      setTotal(count)
    } catch {
      setError("Impossible de charger les missions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMissions() }, [fetchMissions])

  const filtered = filter === "all" ? missions : missions.filter((m) => m.status === filter)

  const stats = [
    { icon: <ClipboardList className="w-4 h-4" />, label: "Total", value: formatCompactNumber(total) },
    { icon: <Hourglass className="w-4 h-4" />, label: "En attente", value: formatCompactNumber(missions.filter((m) => m.status === "pending" || m.status === "quoted").length) },
    { icon: <Clock className="w-4 h-4" />, label: "En cours", value: formatCompactNumber(missions.filter((m) => m.status === "in_progress").length) },
    { icon: <CheckCircle className="w-4 h-4" />, label: "Terminées", value: formatCompactNumber(missions.filter((m) => m.status === "completed").length) },
    { icon: <AlertTriangle className="w-4 h-4" />, label: "Litiges", value: formatCompactNumber(missions.filter((m) => m.status === "disputed").length) },
  ]

  const columns: Column<Mission>[] = [
    {
      key: "id", label: "Mission", sortable: true, width: "200px",
      render: (m) => (
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-cm-text truncate">{getCategoryLabel(m.category)}</p>
          <p className="text-[11px] text-cm-text-muted truncate">{m.description?.slice(0, 60) || m.address}</p>
          <p className="text-[11px] text-cm-text-muted flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {m.address}
          </p>
        </div>
      ),
    },
    {
      key: "client_name", label: "Client", sortable: true, width: "140px",
      render: (m) => (
        <div>
          <p className="text-[12px] text-cm-text-soft">{m.client_name || "—"}</p>
          {m.client_phone && <p className="text-[11px] text-cm-text-muted">{m.client_phone}</p>}
        </div>
      ),
    },
    {
      key: "pro_name", label: "Professionnel", sortable: true, width: "140px",
      render: (m) => (
        <div>
          <p className="text-[12px] text-cm-text-soft">{m.pro_name || "—"}</p>
          {m.pro_phone && <p className="text-[11px] text-cm-text-muted">{m.pro_phone}</p>}
        </div>
      ),
    },
    {
      key: "status", label: "Statut", sortable: true, width: "120px",
      render: (m) => {
        const s = STATUS_STYLES[m.status] ?? "inactive"
        return <StatusBadge status={s} label={MISSION_STATUS_LABELS[m.status] ?? m.status} />
      },
    },
    {
      key: "urgency", label: "Urgence", sortable: true, width: "80px",
      render: (m) => {
        const colors: Record<string, string> = { low: "text-cm-text-muted", medium: "text-amber-600", high: "text-orange-600", emergency: "text-red-600 font-semibold" }
        return <span className={`text-[12px] capitalize ${colors[m.urgency] ?? "text-cm-text-muted"}`}>{URGENCY_LABELS[m.urgency]}</span>
      },
    },
    {
      key: "final_price", label: "Prix", sortable: true, width: "100px",
      render: (m) => {
        if (m.final_price) return <span className="text-[12px] font-medium text-cm-text">{m.final_price.toLocaleString()} F</span>
        if (m.estimated_price_min) return <span className="text-[12px] text-cm-text-muted">{m.estimated_price_min.toLocaleString()} – {m.estimated_price_max?.toLocaleString()} F</span>
        return <span className="text-[12px] text-cm-text-muted">—</span>
      },
    },
    {
      key: "created_at", label: "Créée le", sortable: true, width: "90px",
      render: (m) => <span className="text-[12px] text-cm-text-muted">{format(new Date(m.created_at), "d MMM", { locale: fr })}</span>,
    },
  ]

  if (error) return <ErrorState message={error} onRetry={fetchMissions} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Missions</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">{total} mission{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-cm-elevated border border-cm-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-cm-text-muted">{s.icon}</span>
              <span className="text-[11px] text-cm-text-muted font-medium">{s.label}</span>
            </div>
            <p className="text-[18px] font-bold text-cm-text">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${filter === f.key ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:bg-cm-surface"}`}>
            {f.label}
            {f.key !== "all" && <span className="ml-1.5 text-[11px] opacity-60">({missions.filter((m) => m.status === f.key).length})</span>}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(m) => m.id}
        onRowClick={(m) => navigate(`/admin/missions/${m.id}`)}
        searchable
        searchKeys={["address", "description", "client_name", "pro_name"]}
        exportable
        loading={loading}
        emptyMessage="Aucune mission trouvée"
      />
    </div>
  )
}
