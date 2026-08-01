import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getApplications } from "../../services/admin/applications.service"
import type { ProApplication } from "../../services/admin/applications.service"
import { usePermissions } from "../../hooks/usePermissions"
import AdminTable from "../../components/admin/ui/AdminTable"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import type { Column } from "../../components/admin/ui/AdminTable"
import { getCategoryLabel } from "../../constants/admin/categoryLabels"
import { Eye } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const STATUS_OPTIONS = [
  { value: "all", label: "Tous" },
  { value: "SUBMITTED", label: "Soumises" },
  { value: "UNDER_REVIEW", label: "En révision" },
  { value: "APPROVED", label: "Approuvées" },
  { value: "REJECTED", label: "Rejetées" },
]

function statusToBadge(status: string): { status: string; label: string } {
  switch (status) {
    case "SUBMITTED": return { status: "pending", label: "Soumise" }
    case "UNDER_REVIEW": return { status: "in_progress", label: "En révision" }
    case "APPROVED": return { status: "active", label: "Approuvée" }
    case "REJECTED": return { status: "inactive", label: "Rejetée" }
    default: return { status: "pending", label: status }
  }
}

export default function AdminApplicationsPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const canReview = hasPermission("applications.review")

  const [applications, setApplications] = useState<ProApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getApplications({ status: statusFilter })
      setApplications(data)
    } catch {
      setError("Impossible de charger les candidatures.")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const columns: Column<ProApplication>[] = [
    {
      key: "name", label: "Candidat", sortable: true, width: "200px",
      render: (a) => (
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-cm-text">{a.name}</p>
          <p className="text-[11px] text-cm-text-muted">{a.email}</p>
        </div>
      ),
    },
    {
      key: "categories", label: "Métiers", width: "160px",
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.categories.map((cat) => (
            <span key={cat} className="px-1.5 py-0.5 bg-cm-surface rounded text-[11px] text-cm-text-soft">{getCategoryLabel(cat)}</span>
          ))}
        </div>
      ),
    },
    {
      key: "status", label: "Statut", sortable: true, width: "120px",
      render: (a) => {
        const s = statusToBadge(a.status)
        return <StatusBadge status={s.status} label={s.label} />
      },
    },
    {
      key: "submitted_at", label: "Date", sortable: true, width: "110px",
      render: (a) => (
        <span className="text-[12px] text-cm-text-muted">{format(new Date(a.submitted_at), "d MMM", { locale: fr })}</span>
      ),
    },
    {
      key: "actions", label: "", width: "80px",
      render: (a) => (
        <button onClick={() => navigate(`/admin/applications/${a.id}`)}
          className="text-[11px] font-medium text-[var(--admin-accent)] hover:underline cursor-pointer flex items-center gap-1 px-1">
          <Eye className="w-3 h-3" /> Voir
        </button>
      ),
    },
  ]

  if (error) return <ErrorState message={error} onRetry={fetchData} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Candidatures Pro</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">{applications.length} candidature{applications.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
            className={`px-3 h-8 text-[11px] font-medium rounded-lg border cursor-pointer ${statusFilter === opt.value ? "bg-cm-text text-white border-cm-text" : "bg-white text-cm-text-soft border-cm-border hover:border-cm-border"}`}>
            {opt.label}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={applications}
        keyExtractor={(a) => a.id}
        searchable
        searchKeys={["name", "email", "phone"]}
        exportable
        exportTransform={(a) => ({ nom: a.name, email: a.email, téléphone: a.phone, métiers: a.categories.join(", "), statut: statusToBadge(a.status).label, date: format(new Date(a.submitted_at), "d MMM yyyy", { locale: fr }) })}
        loading={loading}
        emptyMessage="Aucune candidature trouvée"
      />
    </div>
  )
}
