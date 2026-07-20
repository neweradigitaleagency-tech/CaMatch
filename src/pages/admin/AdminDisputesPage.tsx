import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getAdminDisputes, getDisputeStatusBadge } from "../../services/admin/disputes.service"
import type { AdminDisputeRow } from "../../services/admin/disputes.service"
import { usePermissions } from "../../hooks/usePermissions"
import { formatXOF } from "../../utils/format"
import { Eye, Scale } from "lucide-react"

const STATUS_OPTIONS = [
  { value: "all", label: "Tous" },
  { value: "opened", label: "Ouverts" },
  { value: "under_review", label: "En cours" },
  { value: "resolved_supplier", label: "Résolus (fournisseur)" },
  { value: "resolved_client", label: "Résolus (client)" },
  { value: "rejected", label: "Rejetés" },
]

export default function AdminDisputesPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const canView = hasPermission("disputes.read")

  const [disputes, setDisputes] = useState<AdminDisputeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminDisputes()
      let filtered = data
      if (statusFilter !== "all") filtered = filtered.filter((d) => d.status === statusFilter)
      if (search) filtered = filtered.filter((d) =>
        d.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        d.clientName.toLowerCase().includes(search.toLowerCase()) ||
        d.reason.toLowerCase().includes(search.toLowerCase()) ||
        d.orderId.toLowerCase().includes(search.toLowerCase())
      )
      setDisputes(filtered)
    } catch {
      setError("Impossible de charger les litiges.")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Litiges</h1>
          <p className="text-[13px] text-gray-500 mt-1">{disputes.length} litige(s)</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 focus:border-[var(--admin-accent)]"
            placeholder="Rechercher un litige..." />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
              className={`px-3 h-7 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
                statusFilter === opt.value
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-4 bg-gray-100 animate-pulse rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-[13px] text-red-500">{error}</p>
          <button onClick={fetchData}
            className="mt-3 h-8 px-4 bg-gray-900 text-white text-[11px] font-medium rounded-lg cursor-pointer">
            Réessayer
          </button>
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Scale className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-gray-500">Aucun litige trouvé</p>
          <p className="text-[12px] text-gray-400 mt-1">
            {statusFilter !== "all" ? "Essayez un autre filtre" : "Aucun litige en cours"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Commande</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Fournisseur</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Client</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Motif</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Montant</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Messages</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Statut</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Date</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => {
                  const badge = getDisputeStatusBadge(d.status)
                  return (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-gray-600">{d.orderId}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{d.supplierName}</td>
                      <td className="px-4 py-3 text-gray-600">{d.clientName}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{d.reason}</td>
                      <td className="px-4 py-3 font-medium">{d.amount > 0 ? formatXOF(d.amount) : "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{d.messageCount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          badge.status === "active" ? "bg-green-50 text-green-700" :
                          badge.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                          badge.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-[11px]">
                        {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigate(`/admin/disputes/${d.id}`)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                          title="Voir détail">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
