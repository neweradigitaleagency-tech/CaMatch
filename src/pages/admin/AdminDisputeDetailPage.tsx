import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getAdminDisputeDetail, resolveDispute, rejectDispute } from "../../services/admin/disputes.service"
import type { SupplierDispute } from "../../types/supplier"
import { usePermissions } from "../../hooks/usePermissions"
import { formatXOF } from "../../utils/format"
import { ArrowLeft, Scale, CheckCircle, XCircle, MessageSquare } from "lucide-react"

export default function AdminDisputeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission, admin } = usePermissions()
  const canResolve = hasPermission("disputes.resolve")

  const [dispute, setDispute] = useState<SupplierDispute | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [resolution, setResolution] = useState("")
  const [showResolve, setShowResolve] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getAdminDisputeDetail(id)
      .then((data) => {
        if (!data) { setError("Litige introuvable."); return }
        setDispute(data)
      })
      .catch(() => setError("Impossible de charger le litige."))
      .finally(() => setLoading(false))
  }, [id])

  const handleResolve = async () => {
    if (!id || !admin?.id || !resolution.trim()) return
    setActionLoading(true)
    const ok = await resolveDispute(id, resolution, admin.id)
    setActionLoading(false)
    if (ok) {
      setShowResolve(false)
      const updated = await getAdminDisputeDetail(id)
      if (updated) setDispute(updated)
    }
  }

  const handleReject = async () => {
    if (!id || !admin?.id || !resolution.trim()) return
    setActionLoading(true)
    const ok = await rejectDispute(id, resolution, admin.id)
    setActionLoading(false)
    if (ok) {
      setShowResolve(false)
      const updated = await getAdminDisputeDetail(id)
      if (updated) setDispute(updated)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dynamic bg-cm-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cm-border border-t-cm-text rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !dispute) {
    return (
      <div className="min-h-dynamic bg-cm-surface flex flex-col items-center justify-center gap-4">
        <p className="text-[13px] text-cm-text-muted">{error ?? "Litige introuvable."}</p>
        <button onClick={() => navigate("/admin/disputes")}
          className="h-9 px-4 bg-cm-text text-white text-[12px] font-medium rounded-lg cursor-pointer">
          Retour
        </button>
      </div>
    )
  }

  const isResolved = dispute.status === "resolved_supplier" || dispute.status === "resolved_client" || dispute.status === "rejected"
  const canAct = canResolve && !isResolved

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/disputes")}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cm-surface cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-cm-text-soft" />
        </button>
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-cm-text-muted" />
          <div>
            <h1 className="text-[18px] font-bold text-cm-text">Litige #{dispute.orderId}</h1>
            <p className="text-[12px] text-cm-text-muted">{dispute.reason}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4 space-y-3">
          <h2 className="text-[13px] font-semibold text-cm-text">Détails</h2>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="bg-cm-surface rounded-lg p-3">
              <p className="text-cm-text-muted">Fournisseur</p>
              <p className="text-cm-text font-medium">{dispute.supplierId.replace("supplier-", "Fournisseur #")}</p>
            </div>
            <div className="bg-cm-surface rounded-lg p-3">
              <p className="text-cm-text-muted">Client</p>
              <p className="text-cm-text font-medium">{dispute.clientName ?? dispute.clientId}</p>
            </div>
            <div className="bg-cm-surface rounded-lg p-3">
              <p className="text-cm-text-muted">Montant du litige</p>
              <p className="text-cm-text font-medium">{dispute.amount > 0 ? formatXOF(dispute.amount) : "—"}</p>
            </div>
            <div className="bg-cm-surface rounded-lg p-3">
              <p className="text-cm-text-muted">Statut</p>
              <p className="text-cm-text font-medium capitalize">{dispute.status.replace(/_/g, " ")}</p>
            </div>
            <div className="bg-cm-surface rounded-lg p-3 col-span-2">
              <p className="text-cm-text-muted">Description</p>
              <p className="text-cm-text mt-1">{dispute.description}</p>
            </div>
            {dispute.resolution && (
              <div className="bg-cm-surface rounded-lg p-3 col-span-2">
                <p className="text-cm-text-muted">Résolution</p>
                <p className="text-cm-text mt-1">{dispute.resolution}</p>
                {dispute.resolvedAt && (
                  <p className="text-cm-text-muted text-[11px] mt-1">
                    Résolu le {new Date(dispute.resolvedAt).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
          <h2 className="text-[13px] font-semibold text-cm-text flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4" /> Conversation ({dispute.messages.length})
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {dispute.messages.map((msg) => {
              const isAdmin = msg.senderRole === "admin"
              const isSupplier = msg.senderRole === "supplier"
              return (
                <div key={msg.id} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
                    isAdmin ? "bg-cm-surface text-cm-text" :
                    isSupplier ? "bg-blue-50 text-blue-900" :
                    "bg-green-50 text-green-900"
                  }`}>
                    <p className="text-[11px] font-semibold mb-0.5">{msg.senderName}</p>
                    <p className="text-[12px]">{msg.content}</p>
                    <p className="text-[10px] text-cm-text-soft/50 mt-1">
                      {new Date(msg.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {canAct && (
          <div className="bg-cm-elevated rounded-xl border border-cm-border p-4 space-y-3">
            <h2 className="text-[13px] font-semibold text-cm-text">Actions</h2>
            {!showResolve ? (
              <div className="flex gap-2">
                <button onClick={() => { setShowResolve(true); setResolution("") }}
                  className="flex items-center gap-1.5 h-9 px-4 bg-green-500 text-white text-[12px] font-medium rounded-lg hover:opacity-90 cursor-pointer">
                  <CheckCircle className="w-3.5 h-3.5" /> Résoudre
                </button>
                <button onClick={() => { setShowResolve(true); setResolution("Litige rejeté — preuves insuffisantes") }}
                  className="flex items-center gap-1.5 h-9 px-4 bg-cm-surface0 text-white text-[12px] font-medium rounded-lg hover:opacity-90 cursor-pointer">
                  <XCircle className="w-3.5 h-3.5" /> Rejeter
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-cm-text-soft block">Notes de résolution</label>
                <textarea value={resolution} onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-3 py-2 border border-cm-border rounded-lg text-[12px] focus:outline-none resize-none"
                  rows={3} placeholder="Expliquez la décision..." />
                <div className="flex gap-2">
                  <button onClick={handleResolve} disabled={actionLoading || !resolution.trim()}
                    className="flex items-center gap-1.5 h-9 px-4 bg-green-500 text-white text-[12px] font-medium rounded-lg disabled:opacity-50 cursor-pointer">
                    {actionLoading ? "..." : "Confirmer résolution"}
                  </button>
                  <button onClick={() => setShowResolve(false)}
                    className="h-9 px-4 border border-cm-border text-cm-text-soft text-[12px] font-medium rounded-lg cursor-pointer">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
