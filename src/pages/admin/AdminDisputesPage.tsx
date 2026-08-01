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
          <h1 className="text-[20px] font-bold text-cm-text">Litiges</h1>
          <p className="text-[13px] text-cm-text-muted mt-1">{disputes.length} litige(s)</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 px-3 border border-cm-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 focus:border-[var(--admin-accent)]"
            placeholder="Rechercher un litige..." />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
              className={`px-3 h-7 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
                statusFilter === opt.value
                  ? "bg-cm-text text-white border-cm-text"
                  : "bg-white text-cm-text-soft border-cm-border hover:border-cm-border"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-cm-elevated rounded-lg border border-cm-border p-4">
              <div className="h-4 bg-cm-surface animate-pulse rounded w-1/3 mb-2" />
              <div className="h-3 bg-cm-surface animate-pulse rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-6 text-center">
          <p className="text-[13px] text-red-500">{error}</p>
          <button onClick={fetchData}
            className="mt-3 h-8 px-4 bg-cm-text text-white text-[11px] font-medium rounded-lg cursor-pointer">
            Réessayer
          </button>
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-8 text-center">
          <Scale className="w-10 h-10 text-cm-border-soft mx-auto mb-3" />
          <p className="text-[14px] font-medium text-cm-text-muted">Aucun litige trouvé</p>
          <p className="text-[12px] text-cm-text-muted mt-1">
            {statusFilter !== "all" ? "Essayez un autre filtre" : "Aucun litige en cours"}
          </p>
        </div>
      ) : (
        <div className="bg-cm-elevated rounded-xl border border-cm-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-cm-border/40 bg-cm-surface/50">
                  <th className="text-left font-semibold text-cm-text-soft px-4 py-3">Commande</th>
                  <th className="text-left font-semibold text-cm-text-soft px-4 py-3">Fournisseur</th>
                  <th className="text-left font-semibold text-cm-text-soft px-4 py-3">Client</th>
                  <th className="text-left font-semibold text-cm-text-soft px-4 py-3">Motif</th>
                  <th className="text-left font-semibold text-cm-text-soft px-4 py-3">Montant</th>
                  <th className="text-left font-semibold text-cm-text-soft px-4 py-3">Messages</th>
                  <th className="text-left font-semibold text-cm-text-soft px-4 py-3">Statut</th>
                  <th className="text-left font-semibold text-cm-text-soft px-4 py-3">Date</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => {
                  const badge = getDisputeStatusBadge(d.status)
                  return (
                    <tr key={d.id} className="border-b border-cm-border/40 hover:bg-cm-surface/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-cm-text-soft">{d.orderId}</td>
                      <td className="px-4 py-3 font-medium text-cm-text">{d.supplierName}</td>
                      <td className="px-4 py-3 text-cm-text-soft">{d.clientName}</td>
                      <td className="px-4 py-3 text-cm-text-soft max-w-[200px] truncate">{d.reason}</td>
                      <td className="px-4 py-3 font-medium">{d.amount > 0 ? formatXOF(d.amount) : "—"}</td>
                      <td className="px-4 py-3 text-cm-text-muted">{d.messageCount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          badge.status === "active" ? "bg-green-50 text-green-700" :
                          badge.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                          badge.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                          "bg-cm-surface text-cm-text-soft"
                        }`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3 text-cm-text-muted text-[11px]">
                        {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigate(`/admin/disputes/${d.id}`)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-cm-surface text-cm-text-muted hover:text-cm-text-soft cursor-pointer"
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
