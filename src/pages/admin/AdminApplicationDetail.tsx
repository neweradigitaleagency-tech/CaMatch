import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getApplicationById, updateApplicationStatus } from "../../services/admin/applications.service"
import type { ProApplication } from "../../services/admin/applications.service"
import { usePermissions } from "../../hooks/usePermissions"
import { getCategoryLabel } from "../../constants/admin/categoryLabels"
import { ArrowLeft, CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react"

export default function AdminApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission, admin } = usePermissions()
  const canReview = hasPermission("applications.review")

  const [app, setApp] = useState<ProApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [showConfirm, setShowConfirm] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getApplicationById(id)
      .then((data) => {
        if (!data) { setError("Candidature introuvable."); return }
        setApp(data)
        setNotes(data.notes ?? "")
      })
      .catch(() => setError("Impossible de charger la candidature."))
      .finally(() => setLoading(false))
  }, [id])

  const handleAction = async (action: string) => {
    if (!app || !canReview || !admin?.id) return
    setActionLoading(true)
    const newStatus = action === "approve" ? "APPROVED" : action === "reject" ? "REJECTED" : "UNDER_REVIEW"
    const ok = await updateApplicationStatus(app.id, newStatus, admin.id, notes)
    setActionLoading(false)
    setShowConfirm(null)
    if (ok) {
      setApp({ ...app, status: newStatus, notes, reviewer_name: admin.email ?? "Admin" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-dynamic bg-cm-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cm-border border-t-cm-text rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="min-h-dynamic bg-cm-surface flex flex-col items-center justify-center gap-4">
        <p className="text-[13px] text-cm-text-muted">{error ?? "Candidature introuvable."}</p>
        <button onClick={() => navigate("/admin/applications")}
          className="h-9 px-4 bg-cm-text text-white text-[12px] font-medium rounded-lg cursor-pointer">
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/applications")}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cm-surface cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-cm-text-soft" />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-cm-text">{app.name}</h1>
          <p className="text-[12px] text-cm-text-muted">{app.email} · {app.phone}</p>
        </div>
      </div>

      <div className="bg-cm-elevated border border-cm-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cm-text-muted" />
          <span className="text-[13px] font-semibold text-cm-text">Détails de la candidature</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div className="bg-cm-surface rounded-lg p-3">
            <p className="text-cm-text-muted">Localisation</p>
            <p className="text-cm-text font-medium">{app.location}</p>
          </div>
          <div className="bg-cm-surface rounded-lg p-3">
            <p className="text-cm-text-muted">Métiers</p>
            <p className="text-cm-text font-medium">{app.categories.map((c) => getCategoryLabel(c)).join(", ")}</p>
          </div>
          <div className="bg-cm-surface rounded-lg p-3">
            <p className="text-cm-text-muted">Expérience</p>
            <p className="text-cm-text font-medium">{app.experience_years} ans</p>
          </div>
          <div className="bg-cm-surface rounded-lg p-3">
            <p className="text-cm-text-muted">Taux horaire</p>
            <p className="text-cm-text font-medium">{app.hourly_rate.toLocaleString("fr-FR")} F</p>
          </div>
          <div className="bg-cm-surface rounded-lg p-3">
            <p className="text-cm-text-muted">Statut</p>
            <p className="text-cm-text font-medium">{app.status === "SUBMITTED" ? "Soumise" : app.status === "UNDER_REVIEW" ? "En révision" : app.status === "APPROVED" ? "Approuvée" : "Rejetée"}</p>
          </div>
          <div className="bg-cm-surface rounded-lg p-3">
            <p className="text-cm-text-muted">Documents</p>
            <p className="text-cm-text font-medium">{app.documents_count} fichier{app.documents_count !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {app.title && (
        <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
          <p className="text-[12px] font-semibold text-cm-text mb-1">{app.title}</p>
          <p className="text-[12px] text-cm-text-muted">{app.bio}</p>
        </div>
      )}

      <div className="bg-cm-elevated border border-cm-border rounded-xl p-4">
        <label className="text-[12px] font-semibold text-cm-text mb-2 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Notes de révision
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ajouter une note..."
          rows={3}
          className="w-full text-[13px] bg-cm-surface border border-cm-border rounded-lg p-3 outline-none text-cm-text placeholder:text-cm-text-muted resize-none"
        />
      </div>

      {app.status !== "APPROVED" && app.status !== "REJECTED" && canReview && (
        <div className="flex gap-3">
          <button onClick={() => setShowConfirm("approve")} disabled={actionLoading}
            className="flex-1 h-11 bg-green-600 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 cursor-pointer hover:bg-green-700 disabled:opacity-50 transition-colors">
            <CheckCircle className="w-4 h-4" /> Approuver
          </button>
          <button onClick={() => setShowConfirm("reject")} disabled={actionLoading}
            className="flex-1 h-11 bg-red-500 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 cursor-pointer hover:bg-red-600 disabled:opacity-50 transition-colors">
            <XCircle className="w-4 h-4" /> Rejeter
          </button>
        </div>
      )}

      {app.status === "APPROVED" && (
        <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-[13px] font-semibold text-green-600">Approuvée</span>
        </div>
      )}
      {app.status === "REJECTED" && (
        <div className="flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <XCircle className="w-5 h-5 text-red-500" />
          <span className="text-[13px] font-semibold text-red-500">Rejetée</span>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-cm-elevated rounded-xl px-6 py-5 mx-4 w-full max-w-sm shadow-xl">
            <h3 className="text-[15px] font-bold text-cm-text text-center mb-2">
              {showConfirm === "approve" ? "Approuver cette candidature ?" : "Rejeter cette candidature ?"}
            </h3>
            <p className="text-[12px] text-cm-text-muted text-center mb-5">
              Cette action enverra une notification au professionnel.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 h-11 rounded-xl text-[13px] font-semibold text-cm-text-soft border border-cm-border cursor-pointer">
                Annuler
              </button>
              <button onClick={() => handleAction(showConfirm)}
                className={`flex-1 h-11 rounded-xl text-[13px] font-bold text-white cursor-pointer ${showConfirm === "approve" ? "bg-green-600" : "bg-red-500"}`}>
                {actionLoading ? "..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
