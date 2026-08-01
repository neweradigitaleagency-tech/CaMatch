import { useState, useEffect, useCallback } from "react"
import { usePermissions } from "../../hooks/usePermissions"
import { getFraudAlerts, getFraudAlertStats, updateFraudAlertStatus } from "../../services/admin/fraud.service"
import type { FraudAlert } from "../../services/admin/fraud.service"
import { FRAUD_TYPE_LABELS } from "../../services/admin/fraud.service"
import PageHeader from "../../components/admin/ui/PageHeader"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import AdminTable from "../../components/admin/ui/AdminTable"
import type { Column } from "../../components/admin/ui/AdminTable"
import Modal from "../../components/admin/ui/Modal"
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog"
import ErrorState from "../../components/admin/ui/ErrorState"
import { AlertTriangle, ShieldAlert, UserX, Eye } from "lucide-react"

import { format } from "date-fns"
import { fr } from "date-fns/locale"

const TYPE_ICONS: Record<string, React.ReactNode> = {
  suspicious_login: <ShieldAlert className="w-3.5 h-3.5" />,
  multiple_accounts: <UserX className="w-3.5 h-3.5" />,
  fake_documents: <ShieldAlert className="w-3.5 h-3.5" />,
  payment_fraud: <AlertTriangle className="w-3.5 h-3.5" />,
  review_manipulation: <AlertTriangle className="w-3.5 h-3.5" />,
  other: <AlertTriangle className="w-3.5 h-3.5" />,
}

const STATUS_OPTIONS = [
  { value: "all", label: "Tous" },
  { value: "pending", label: "Ouvert" },
  { value: "active", label: "Analyse" },
  { value: "completed", label: "Résolu" },
  { value: "rejected", label: "Ignoré" },
]

const TYPE_OPTIONS = [
  { value: "all", label: "Tous types" },
  { value: "suspicious_login", label: "Connexion suspecte" },
  { value: "multiple_accounts", label: "Comptes multiples" },
  { value: "fake_documents", label: "Faux documents" },
  { value: "payment_fraud", label: "Fraude paiement" },
  { value: "review_manipulation", label: "Manipulation d'avis" },
  { value: "other", label: "Autre" },
]

function getScoreColor(score: number): string {
  if (score >= 80) return "text-red-600"
  if (score >= 60) return "text-orange-600"
  if (score >= 40) return "text-amber-600"
  return "text-cm-text-muted"
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-red-50 border-red-200"
  if (score >= 60) return "bg-orange-50 border-orange-200"
  if (score >= 40) return "bg-amber-50 border-amber-200"
  return "bg-cm-surface border-cm-border"
}

function statusToBadge(status: string): { status: string; label: string } {
  switch (status) {
    case "pending": return { status: "pending", label: "Ouvert" }
    case "active": return { status: "in_progress", label: "Analyse" }
    case "completed": return { status: "active", label: "Résolu" }
    case "rejected": return { status: "inactive", label: "Ignoré" }
    default: return { status: "pending", label: status }
  }
}

export default function AdminFraudPage() {
  const { hasPermission, admin } = usePermissions()
  const canReview = hasPermission("fraud.resolve")

  const [alerts, setAlerts] = useState<FraudAlert[]>([])
  const [stats, setStats] = useState({ total: 0, open: 0, investigating: 0, resolved: 0, avgScore: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [detailAlert, setDetailAlert] = useState<FraudAlert | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ alert: FraudAlert; action: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [alertsRes, statsRes] = await Promise.all([
        getFraudAlerts({ status: statusFilter, type: typeFilter }),
        getFraudAlertStats(),
      ])
      setAlerts(alertsRes.alerts)
      setStats(statsRes)
    } catch {
      setError("Impossible de charger les alertes.")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const [actionError, setActionError] = useState<string | null>(null)

  const handleAction = async () => {
    if (!confirmAction || !canReview) return
    if (!admin?.id) {
      setActionError("Impossible d'identifier l'administrateur.")
      return
    }
    setActionLoading(true)
    setActionError(null)
    const newStatus = confirmAction.action === "resolve" ? "completed" : confirmAction.action === "dismiss" ? "rejected" : "active"
    const ok = await updateFraudAlertStatus(confirmAction.alert.id, newStatus, admin.id)
    setActionLoading(false)
    setConfirmAction(null)
    if (ok) {
      setDetailAlert(null)
      fetchData()
    } else {
      setActionError("Échec de la mise à jour de l'alerte.")
    }
  }

  const columns: Column<FraudAlert>[] = [
    {
      key: "type", label: "Alerte", sortable: true, width: "220px",
      render: (f) => (
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getScoreBg(f.score)}`}>
            {TYPE_ICONS[f.type] ?? <AlertTriangle className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-cm-text">{FRAUD_TYPE_LABELS[f.type] ?? f.type}</p>
            <p className="text-[11px] text-cm-text-muted">{f.target_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "target_type", label: "Cible", width: "100px",
      render: (f) => <span className="text-[12px] text-cm-text-soft capitalize">{f.target_type === "professional" ? "Pro" : f.target_type === "user" ? "Client" : f.target_type === "transaction" ? "Transaction" : "Avis"}</span>,
    },
    {
      key: "score", label: "Score", sortable: true, width: "80px",
      render: (f) => <span className={`text-[13px] font-bold ${getScoreColor(f.score)}`}>{f.score}%</span>,
    },
    {
      key: "status", label: "Statut", sortable: true, width: "110px",
      render: (f) => {
        const s = statusToBadge(f.status)
        return <StatusBadge status={s.status} label={s.label} />
      },
    },
    {
      key: "created_at", label: "Détectée le", sortable: true, width: "130px",
      render: (f) => (
        <div className="flex flex-col">
          <span className="text-[12px] text-cm-text-muted">{format(new Date(f.created_at), "d MMM yyyy", { locale: fr })}</span>
          <span className="text-[11px] text-cm-text-muted">{new Date(f.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      ),
    },
    {
      key: "actions", label: "", width: "120px",
      render: (f) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setDetailAlert(f) }}
            className="text-[11px] font-medium text-[var(--admin-accent)] hover:underline cursor-pointer flex items-center gap-1 px-1">
            <Eye className="w-3 h-3" /> Examiner
          </button>
          {canReview && f.status === "pending" && (
            <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ alert: f, action: "dismiss" }) }}
              className="text-[11px] font-medium text-cm-text-muted hover:underline cursor-pointer px-1">
              Ignorer
            </button>
          )}
        </div>
      ),
    },
  ]

  if (error) return <ErrorState message={error} onRetry={fetchData} />

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Fraude" description={`${stats.total} alertes · ${stats.open} non traitées`} />

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
          <p className="text-[11px] font-medium text-cm-text-muted uppercase tracking-wider">Score moyen</p>
          <p className="text-[18px] font-bold text-cm-text mt-1">{stats.avgScore}%</p>
        </div>
        <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
          <p className="text-[11px] font-medium text-cm-text-muted uppercase tracking-wider">Alertes ouvertes</p>
          <p className="text-[18px] font-bold text-red-600 mt-1">{stats.open}</p>
        </div>
        <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
          <p className="text-[11px] font-medium text-cm-text-muted uppercase tracking-wider">En analyse</p>
          <p className="text-[18px] font-bold text-amber-600 mt-1">{stats.investigating}</p>
        </div>
        <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
          <p className="text-[11px] font-medium text-cm-text-muted uppercase tracking-wider">Résolues</p>
          <p className="text-[18px] font-bold text-[var(--admin-accent)] mt-1">{stats.resolved}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
            className={`px-3 h-8 text-[11px] font-medium rounded-lg border cursor-pointer ${statusFilter === opt.value ? "bg-cm-text text-white border-cm-text" : "bg-white text-cm-text-soft border-cm-border hover:border-cm-border"}`}>
            {opt.label}
          </button>
        ))}
        <div className="w-px h-6 bg-cm-border-soft mx-1" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="h-8 px-2 text-[11px] bg-cm-elevated border border-cm-border rounded-lg outline-none text-cm-text-soft cursor-pointer">
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <AdminTable
        columns={columns}
        data={alerts}
        keyExtractor={(f) => f.id}
        searchable
        searchKeys={["type", "target_name", "description", "target_id"]}
        exportable
        exportTransform={(f) => ({ type: FRAUD_TYPE_LABELS[f.type] ?? f.type, cible: f.target_name, score: `${f.score}%`, statut: statusToBadge(f.status).label, description: f.description ?? "" })}
        loading={loading}
        emptyMessage="Aucune alerte trouvée"
      />

      <Modal isOpen={!!detailAlert} onClose={() => setDetailAlert(null)} title="Détail de l'alerte" size="lg">
        {detailAlert && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getScoreBg(detailAlert.score)}`}>
                {TYPE_ICONS[detailAlert.type] ?? <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[15px] font-semibold text-cm-text">{FRAUD_TYPE_LABELS[detailAlert.type] ?? detailAlert.type}</p>
                <p className="text-[12px] text-cm-text-muted">Cible : {detailAlert.target_name} ({detailAlert.target_type})</p>
              </div>
              <div className="ml-auto">
                <span className={`text-[14px] font-bold ${getScoreColor(detailAlert.score)}`}>{detailAlert.score}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cm-surface rounded-lg p-3">
                <p className="text-[10px] font-medium text-cm-text-muted uppercase tracking-wider">Type</p>
                <p className="text-[13px] text-cm-text mt-0.5 capitalize">{detailAlert.target_type}</p>
              </div>
              <div className="bg-cm-surface rounded-lg p-3">
                <p className="text-[10px] font-medium text-cm-text-muted uppercase tracking-wider">ID cible</p>
                <p className="text-[13px] text-cm-text mt-0.5 font-mono text-[11px] break-all">{detailAlert.target_id}</p>
              </div>
              <div className="bg-cm-surface rounded-lg p-3">
                <p className="text-[10px] font-medium text-cm-text-muted uppercase tracking-wider">Statut</p>
                <div className="mt-0.5">
                  <StatusBadge {...statusToBadge(detailAlert.status)} />
                </div>
              </div>
              <div className="bg-cm-surface rounded-lg p-3">
                <p className="text-[10px] font-medium text-cm-text-muted uppercase tracking-wider">Détectée le</p>
                <p className="text-[13px] text-cm-text mt-0.5">{new Date(detailAlert.created_at).toLocaleString("fr-FR")}</p>
              </div>
              {detailAlert.reviewer_name && (
                <div className="bg-cm-surface rounded-lg p-3">
                  <p className="text-[10px] font-medium text-cm-text-muted uppercase tracking-wider">Examinée par</p>
                  <p className="text-[13px] text-cm-text mt-0.5">{detailAlert.reviewer_name}</p>
                </div>
              )}
              {detailAlert.resolved_at && (
                <div className="bg-cm-surface rounded-lg p-3">
                  <p className="text-[10px] font-medium text-cm-text-muted uppercase tracking-wider">Résolue le</p>
                  <p className="text-[13px] text-cm-text mt-0.5">{new Date(detailAlert.resolved_at).toLocaleString("fr-FR")}</p>
                </div>
              )}
            </div>

            {detailAlert.description && (
              <div>
                <p className="text-[11px] font-medium text-cm-text-muted uppercase tracking-wider mb-1">Description</p>
                <p className="text-[13px] text-cm-text-soft bg-cm-surface rounded-lg p-3">{detailAlert.description}</p>
              </div>
            )}

            {detailAlert.metadata && Object.keys(detailAlert.metadata).length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-cm-text-muted uppercase tracking-wider mb-1">Métadonnées</p>
                <pre className="text-[11px] text-cm-text-soft bg-cm-surface rounded-lg p-3 overflow-x-auto">{JSON.stringify(detailAlert.metadata, null, 2)}</pre>
              </div>
            )}

            {actionError && (
              <div className="text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2">{actionError}</div>
            )}
            {canReview && detailAlert.status !== "completed" && detailAlert.status !== "rejected" && (
              <div className="flex items-center gap-2 pt-2 border-t border-cm-border/40">
                <button onClick={() => setConfirmAction({ alert: detailAlert, action: "investigate" })}
                  className="h-9 px-4 bg-amber-600 text-white text-[12px] font-medium rounded-lg hover:bg-amber-700 transition-colors cursor-pointer">
                  Investiguer
                </button>
                <button onClick={() => setConfirmAction({ alert: detailAlert, action: "resolve" })}
                  className="h-9 px-4 bg-green-600 text-white text-[12px] font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                  Résoudre
                </button>
                <button onClick={() => setConfirmAction({ alert: detailAlert, action: "dismiss" })}
                  className="h-9 px-4 text-[12px] font-medium text-cm-text-soft bg-cm-elevated border border-cm-border rounded-lg hover:bg-cm-surface cursor-pointer">
                  Ignorer
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleAction}
        loading={actionLoading}
        title={confirmAction?.action === "resolve" ? "Résoudre l'alerte" : confirmAction?.action === "dismiss" ? "Ignorer l'alerte" : "Investiguer l'alerte"}
        message={confirmAction?.action === "resolve"
          ? "Confirmez la résolution de cette alerte fraude."
          : confirmAction?.action === "dismiss"
            ? "Confirmez que cette alerte est un faux positif."
            : "Confirmez le passage en investigation de cette alerte."}
        confirmLabel={confirmAction?.action === "resolve" ? "Résoudre" : confirmAction?.action === "dismiss" ? "Ignorer" : "Investiguer"}
        variant={confirmAction?.action === "dismiss" ? "warning" : "default"}
      />
    </div>
  )
}
