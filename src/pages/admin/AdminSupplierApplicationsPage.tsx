import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getAdminSupplierApplications, approveSupplierApplication, rejectSupplierApplication } from "../../services/admin/suppliers.service"
import type { SupplierApplication } from "../../types/supplier"
import { usePermissions } from "../../hooks/usePermissions"
import { CheckCircle, XCircle, Eye } from "lucide-react"

const STATUS_OPTIONS = [
  { value: "all", label: "Toutes" },
  { value: "SUBMITTED", label: "Soumises" },
  { value: "UNDER_REVIEW", label: "En révision" },
  { value: "APPROVED", label: "Approuvées" },
  { value: "REJECTED", label: "Rejetées" },
]

export default function AdminSupplierApplicationsPage() {
  const navigate = useNavigate()
  const { hasPermission, admin } = usePermissions()
  const canReview = hasPermission("suppliers.validate")

  const [apps, setApps] = useState<SupplierApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminSupplierApplications({ status: filter })
      setApps(data)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleApprove = async (appId: string) => {
    if (!admin?.id || !canReview) return
    await approveSupplierApplication(appId, admin.id)
    fetchData()
  }

  const handleReject = async (appId: string) => {
    if (!admin?.id || !canReview) return
    const reason = prompt("Motif du rejet :")
    if (!reason) return
    await rejectSupplierApplication(appId, admin.id, reason)
    fetchData()
  }

  const appStatusLabel = (s: string) => {
    const labels: Record<string, string> = { SUBMITTED: "Soumise", UNDER_REVIEW: "En révision", APPROVED: "Approuvée", REJECTED: "Rejetée" }
    return labels[s] ?? s
  }

  const appStatusColor = (s: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: "bg-yellow-50 text-yellow-700",
      UNDER_REVIEW: "bg-blue-50 text-blue-700",
      APPROVED: "bg-green-50 text-green-700",
      REJECTED: "bg-gray-100 text-gray-600",
    }
    return colors[s] ?? "bg-gray-50 text-gray-600"
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-[20px] font-bold text-gray-900">Candidatures fournisseurs</h1>
        <p className="text-[13px] text-gray-500 mt-1">{apps.length} candidatures</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => setFilter(opt.value)}
            className={`px-3 h-7 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
              filter === opt.value
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}>
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white rounded-lg border border-gray-200 animate-pulse" />)}
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-[14px] text-gray-500">Aucune candidature</p>
        </div>
      ) : (
        <div className="space-y-2">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-gray-900">{app.companyName}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${appStatusColor(app.status)}`}>
                      {appStatusLabel(app.status)}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-600 mt-0.5">{app.ownerName} · {app.phone} · {app.city}</p>
                  {app.reviewNotes && <p className="text-[11px] text-gray-400 mt-1">Note : {app.reviewNotes}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(app.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                {canReview && app.status !== "APPROVED" && app.status !== "REJECTED" && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleApprove(app.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 cursor-pointer"
                      title="Approuver">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleReject(app.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                      title="Rejeter">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
