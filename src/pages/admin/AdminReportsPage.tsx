import { useState, useEffect, useCallback } from "react"
import { ChevronDown, Flag, CheckCircle, XCircle, AlertTriangle, Eye } from "lucide-react"
import { getReports, resolveReport, dismissReport, REPORT_STATUS_LABELS, REPORT_SEVERITY_LABELS, REPORT_REASON_LABELS } from "../../services/admin/reports.service"
import { usePermissions } from "../../hooks/usePermissions"
import AdminTable from "../../components/admin/ui/AdminTable"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import Modal from "../../components/admin/ui/Modal"
import type { Column } from "../../components/admin/ui/AdminTable"
import type { Report } from "../../services/admin/reports.service"

type FilterType = "all" | "pending" | "in_review" | "resolved" | "dismissed"

import { format } from "date-fns"
import { fr } from "date-fns/locale"

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "pending", label: "En attente" },
  { key: "in_review", label: "En cours" },
  { key: "resolved", label: "Résolus" },
  { key: "dismissed", label: "Ignorés" },
]

const STATUS_STYLES: Record<string, string> = {
  pending: "pending",
  active: "in_progress",
  completed: "active",
  rejected: "inactive",
}

const SEVERITY_STYLES: Record<string, string> = {
  low: "text-cm-text-muted bg-cm-surface border-cm-border",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  critical: "text-red-700 bg-red-50 border-red-200 font-semibold",
}

const UI_TO_DB: Record<string, string> = { pending: "pending", in_review: "active", resolved: "completed", dismissed: "rejected" }

export default function AdminReportsPage() {
  const { hasPermission } = usePermissions()
  const [reports, setReports] = useState<Report[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [modalReport, setModalReport] = useState<Report | null>(null)
  const [resolutionText, setResolutionText] = useState("")
  const [modalAction, setModalAction] = useState<"resolve" | "dismiss" | "view" | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { reports: data, total: count } = await getReports({ perPage: 100 })
      setReports(data); setTotal(count)
    } catch {
      setError("Impossible de charger les signalements")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === (UI_TO_DB[filter] ?? filter))

  const pendingCount = reports.filter((r) => r.status === "pending").length
  const activeCount = reports.filter((r) => r.status === "active").length

  const canResolve = hasPermission("reports.resolve")
  const canDismiss = hasPermission("reports.dismiss")

  const openActionModal = (report: Report, action: "resolve" | "dismiss") => {
    setModalReport(report)
    setModalAction(action)
    setResolutionText("")
  }

  const openViewModal = (report: Report) => {
    setModalReport(report)
    setModalAction("view")
    setResolutionText("")
  }

  const handleConfirmAction = async () => {
    if (!modalReport) return
    const id = modalReport.id
    setActionLoading(id)
    try {
      if (modalAction === "resolve") {
        const ok = await resolveReport(id, resolutionText)
        if (ok) setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "completed", resolved_at: new Date().toISOString(), resolution_note: resolutionText } : r))
      } else if (modalAction === "dismiss") {
        const ok = await dismissReport(id, resolutionText)
        if (ok) setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected", resolved_at: new Date().toISOString(), resolution_note: resolutionText } : r))
      }
      setModalReport(null)
      setModalAction(null)
    } finally {
      setActionLoading(null)
    }
  }

  const columns: Column<Report>[] = [
    {
      key: "id", label: "Signalement", sortable: true, width: "260px",
      render: (r) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cm-text-muted">{r.id.slice(0, 8)}</span>
            {r.severity === "critical" && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
          </div>
          <p className="text-[13px] font-medium text-cm-text truncate mt-0.5">{REPORT_REASON_LABELS[r.reason] ?? r.reason}</p>
          <p className="text-[11px] text-cm-text-muted truncate">{r.description?.slice(0, 60)}</p>
        </div>
      ),
    },
    {
      key: "reporter_name", label: "Signalé par", sortable: true, width: "130px",
      render: (r) => <span className="text-[12px] text-cm-text-soft">{r.reporter_name || "—"}</span>,
    },
    {
      key: "reported_user_name", label: "Visé", sortable: true, width: "140px",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-cm-text-soft">{r.reported_user_name || "—"}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${r.reported_user_type === "professional" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
            {r.reported_user_type === "professional" ? "Pro" : "Client"}
          </span>
        </div>
      ),
    },
    {
      key: "severity", label: "Sévérité", sortable: true, width: "90px",
      render: (r) => (
        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] rounded-md border ${SEVERITY_STYLES[r.severity] ?? "text-cm-text-muted"}`}>
          {REPORT_SEVERITY_LABELS[r.severity] ?? r.severity}
        </span>
      ),
    },
    {
      key: "status", label: "Statut", sortable: true, width: "100px",
      render: (r) => {
        const s = STATUS_STYLES[r.status] ?? "inactive"
        return <StatusBadge status={s} label={REPORT_STATUS_LABELS[r.status] ?? r.status} />
      },
    },
    {
      key: "created_at", label: "Date", sortable: true, width: "110px",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-[12px] text-cm-text-muted">{format(new Date(r.created_at), "d MMM HH:mm", { locale: fr })}</span>
          {r.admin_name && <span className="text-[11px] text-cm-text-muted mt-0.5">{r.admin_name}</span>}
        </div>
      ),
    },
    {
      key: "actions", label: "", width: "200px",
      render: (r) => (
        <div className="flex items-center gap-1">
          {r.status === "pending" && canResolve && (
            <button
              onClick={(e) => { e.stopPropagation(); openActionModal(r, "resolve") }}
              disabled={actionLoading === r.id}
              className="h-7 px-2 rounded-lg text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" /> Résoudre
            </button>
          )}
          {r.status === "pending" && canDismiss && (
            <button
              onClick={(e) => { e.stopPropagation(); openActionModal(r, "dismiss") }}
              disabled={actionLoading === r.id}
              className="h-7 px-2 rounded-lg text-[11px] font-medium text-cm-text-soft bg-cm-surface hover:bg-cm-surface cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" /> Ignorer
            </button>
          )}
          {(r.status !== "pending" || (!canResolve && !canDismiss)) && (
            <button
              onClick={(e) => { e.stopPropagation(); openViewModal(r) }}
              className="h-7 px-2 rounded-lg text-[11px] font-medium text-cm-text-muted hover:bg-cm-surface cursor-pointer flex items-center gap-1"
              title="Détails"
            >
              <Eye className="w-3 h-3" /> Détails
            </button>
          )}
        </div>
      ),
    },
  ]

  if (error) return <ErrorState message={error} onRetry={fetchReports} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Signalements</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">
            {total} signalement{total !== 1 ? "s" : ""}
            {pendingCount > 0 && <span className="ml-2 text-amber-600 font-medium">· {pendingCount} en attente</span>}
            {activeCount > 0 && <span className="ml-2 text-blue-600 font-medium">· {activeCount} en cours</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${filter === f.key ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:bg-cm-surface"}`}>
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1.5 text-[11px] opacity-60">
                ({reports.filter((r) => r.status === (UI_TO_DB[f.key] ?? f.key)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        searchable
        searchKeys={["description", "reporter_name", "reported_user_name", "id"]}
        exportable
        loading={loading}
        emptyMessage="Aucun signalement trouvé"
      />

      <Modal isOpen={modalReport !== null && modalAction !== null} onClose={() => { setModalReport(null); setModalAction(null) }} title={modalAction === "view" ? "Détails du signalement" : modalAction === "resolve" ? "Résoudre le signalement" : "Ignorer le signalement"} size="lg">
        {modalReport && modalAction === "view" && (
          <div>
            <dl className="space-y-3 text-[13px]">
              <DetailRow label="Raison" value={REPORT_REASON_LABELS[modalReport.reason] ?? modalReport.reason} />
              <DetailRow label="Signalé par" value={modalReport.reporter_name || "—"} />
              <DetailRow label="Visé" value={`${modalReport.reported_user_name || "—"} (${modalReport.reported_user_type === "professional" ? "Pro" : "Client"})`} />
              <DetailRow label="Sévérité" value={REPORT_SEVERITY_LABELS[modalReport.severity] ?? modalReport.severity} />
              <DetailRow label="Statut" value={REPORT_STATUS_LABELS[modalReport.status] ?? modalReport.status} />
              <DetailRow label="Date" value={format(new Date(modalReport.created_at), "d MMMM HH:mm", { locale: fr })} />
            </dl>
            <div className="mt-4">
              <p className="text-[12px] text-cm-text-muted font-medium mb-1">Description</p>
              <p className="text-[13px] text-cm-text-soft bg-cm-surface rounded-lg p-3">{modalReport.description || "Aucune description"}</p>
            </div>
            {modalReport.resolution_note && (
              <div className="mt-4">
                <p className="text-[12px] text-cm-text-muted font-medium mb-1">Résolution</p>
                <p className="text-[13px] text-cm-text-soft bg-amber-50 rounded-lg p-3">{modalReport.resolution_note}</p>
              </div>
            )}
            {modalReport.evidence_urls && modalReport.evidence_urls.length > 0 && (
              <div className="mt-4">
                <p className="text-[12px] text-cm-text-muted font-medium mb-1">Preuves</p>
                <div className="space-y-1">
                  {modalReport.evidence_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-[12px] text-blue-600 underline">{url}</a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {modalReport && modalAction && modalAction !== "view" && (
          <div>
            <p className="text-[12px] text-cm-text-muted mb-4">
              {modalAction === "resolve"
                ? "Confirmez la résolution de ce signalement. Vous pouvez ajouter une note."
                : "Confirmez que vous ignorez ce signalement. Vous pouvez ajouter une note."}
            </p>
            <textarea
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="Note de résolution (optionnelle)"
              rows={3}
              className="w-full p-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-border resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setModalReport(null); setModalAction(null) }}
                className="h-9 px-4 text-[12px] font-medium text-cm-text-soft bg-cm-elevated border border-cm-border rounded-lg hover:bg-cm-surface cursor-pointer">
                Annuler
              </button>
              <button onClick={handleConfirmAction}
                disabled={actionLoading === modalReport.id}
                className={`h-9 px-4 text-[12px] font-medium rounded-lg text-white cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
                  modalAction === "resolve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-cm-text hover:bg-cm-text/80"
                }`}>
                {actionLoading === modalReport.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : modalAction === "resolve" ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                Confirmer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[12px] text-cm-text-muted">{label}</dt>
      <dd className="text-[12px] font-medium text-cm-text text-right truncate ml-4">{value}</dd>
    </div>
  )
}
