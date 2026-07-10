import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getAdminSupplierDetail, updateSupplierStatus } from "../../services/admin/suppliers.service"
import type { SupplierProfile } from "../../types/supplier"
import { usePermissions } from "../../hooks/usePermissions"
import { ArrowLeft, CheckCircle, XCircle, Ban, Building2 } from "lucide-react"
import { formatXOF } from "../../utils/format"

const STATUS_OPTIONS = [
  { value: "VERIFIE", label: "Vérifier", icon: CheckCircle, color: "bg-blue-500 hover:opacity-90" },
  { value: "ACTIF", label: "Activer", icon: CheckCircle, color: "bg-cm-green hover:opacity-90" },
  { value: "BLOQUE", label: "Bloquer", icon: Ban, color: "bg-red-500 hover:opacity-90" },
  { value: "REJETE", label: "Rejeter", icon: XCircle, color: "bg-gray-500 hover:opacity-90" },
]

export default function AdminSupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission, admin } = usePermissions()
  const canValidate = hasPermission("suppliers.validate")

  const [profile, setProfile] = useState<SupplierProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getAdminSupplierDetail(id)
      .then((data) => {
        if (!data) { setError("Fournisseur introuvable."); return }
        setProfile(data)
      })
      .catch(() => setError("Impossible de charger le fournisseur."))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (status: string) => {
    if (!id || !canValidate || !admin?.id) return
    if (status === "REJETE" && !rejectionReason.trim()) return
    setActionLoading(true)
    const ok = await updateSupplierStatus(id, status, admin.id, rejectionReason || undefined)
    setActionLoading(false)
    if (ok && profile) {
      setProfile({ ...profile, status: status as SupplierProfile["status"], rejectionReason: status === "REJETE" ? rejectionReason : undefined })
    }
  }

  if (loading) {
    return (
      <div className="min-h-dynamic bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-dynamic bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-[13px] text-gray-500">{error ?? "Fournisseur introuvable."}</p>
        <button onClick={() => navigate("/admin/suppliers")}
          className="h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-lg cursor-pointer">
          Retour
        </button>
      </div>
    )
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      EN_ATTENTE: "bg-yellow-50 text-yellow-700",
      VERIFIE: "bg-blue-50 text-blue-700",
      ACTIF: "bg-green-50 text-green-700",
      BLOQUE: "bg-red-50 text-red-700",
      REJETE: "bg-gray-100 text-gray-600",
    }
    const labels: Record<string, string> = {
      EN_ATTENTE: "En attente",
      VERIFIE: "Vérifié",
      ACTIF: "Actif",
      BLOQUE: "Bloqué",
      REJETE: "Rejeté",
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
        {labels[status] ?? status}
      </span>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/suppliers")}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-500" />
          <div>
            <h1 className="text-[18px] font-bold text-gray-900">{profile.companyName}</h1>
            <p className="text-[12px] text-gray-500">{profile.ownerName} · {profile.phone}</p>
          </div>
          <StatusBadge status={profile.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 col-span-2 space-y-3">
          <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Informations
          </h2>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Entreprise</p>
              <p className="text-gray-900 font-medium">{profile.companyName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Responsable</p>
              <p className="text-gray-900 font-medium">{profile.ownerName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Téléphone</p>
              <p className="text-gray-900 font-medium">{profile.phone}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Email</p>
              <p className="text-gray-900 font-medium">{profile.email ?? "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Ville</p>
              <p className="text-gray-900 font-medium">{profile.city}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Adresse</p>
              <p className="text-gray-900 font-medium">{profile.address ?? "—"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Performance</h2>
          <div className="space-y-3 text-[12px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Commission</span>
              <span className="font-medium">{profile.commissionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Produits</span>
              <span className="font-medium">{profile.totalProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Commandes</span>
              <span className="font-medium">{profile.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Revenu total</span>
              <span className="font-medium">{formatXOF(profile.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Note</span>
              <span className="font-medium">⭐ {profile.rating}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Documents</h2>
          <div className="text-[12px] text-gray-500">
            {(profile.legalDocsUrls?.length ?? 0) > 0 ? (
              <p>{profile.legalDocsUrls?.length} document(s) fourni(s)</p>
            ) : (
              <p className="text-gray-400">Aucun document fourni</p>
            )}
          </div>
          {profile.createdAt && (
            <p className="text-[11px] text-gray-400 mt-3">
              Inscrit le {new Date(profile.createdAt).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>

        {canValidate && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 col-span-2 space-y-3">
            <h2 className="text-[13px] font-semibold text-gray-900">Actions</h2>

            {profile.status === "REJETE" && (
              <div className="mb-2">
                <label className="text-[11px] font-medium text-gray-600 block mb-1">Motif du rejet</label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[12px] focus:outline-none resize-none" rows={2} />
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.filter((opt) => {
                const s = profile.status
                if (opt.value === "ACTIF") return s === "VERIFIE" || s === "EN_ATTENTE"
                if (opt.value === "VERIFIE") return s === "EN_ATTENTE"
                if (opt.value === "BLOQUE") return s === "ACTIF" || s === "VERIFIE"
                if (opt.value === "REJETE") return s === "EN_ATTENTE" || s === "VERIFIE" || s === "BLOQUE"
                return false
              }).map((opt) => {
                const Icon = opt.icon
                return (
                  <button key={opt.value} onClick={() => handleStatusChange(opt.value)}
                    disabled={actionLoading || (opt.value === "REJETE" && !rejectionReason.trim())}
                    className={`flex items-center gap-1.5 h-9 px-4 text-white text-[12px] font-medium rounded-lg disabled:opacity-50 cursor-pointer transition-all ${opt.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {actionLoading ? "..." : opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
