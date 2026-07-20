import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getAdminDeliveries, getDeliveryStatusBadge } from "../../services/admin/deliveries.service"
import type { AdminDeliveryRow } from "../../services/admin/deliveries.service"
import { usePermissions } from "../../hooks/usePermissions"
import { Eye, Truck } from "lucide-react"

const STATUS_OPTIONS = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "preparing", label: "Préparation" },
  { value: "picked_up", label: "Enlevée" },
  { value: "in_transit", label: "En route" },
  { value: "delivered", label: "Livrées" },
  { value: "partial", label: "Partielles" },
  { value: "failed", label: "Échouées" },
]

export default function AdminDeliveriesPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const canView = hasPermission("deliveries.read")

  const [deliveries, setDeliveries] = useState<AdminDeliveryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminDeliveries()
      let filtered = data
      if (statusFilter !== "all") filtered = filtered.filter((d) => d.status === statusFilter)
      if (search) filtered = filtered.filter((d) =>
        d.city.toLowerCase().includes(search.toLowerCase()) ||
        d.orderId.toLowerCase().includes(search.toLowerCase()) ||
        (d.driverName && d.driverName.toLowerCase().includes(search.toLowerCase()))
      )
      setDeliveries(filtered)
    } catch {
      setError("Impossible de charger les livraisons.")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Livraisons</h1>
          <p className="text-[13px] text-gray-500 mt-1">{deliveries.length} livraison(s)</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 focus:border-[var(--admin-accent)]"
            placeholder="Rechercher une livraison..." />
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
      ) : deliveries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-gray-500">Aucune livraison trouvée</p>
          <p className="text-[12px] text-gray-400 mt-1">
            {statusFilter !== "all" ? "Essayez un autre filtre" : "En attente de la première livraison"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Commande</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Ville</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Adresse</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Chauffeur</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Véhicule</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Étapes</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Statut</th>
                  <th className="text-left font-semibold text-gray-600 px-4 py-3">Créée</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => {
                  const badge = getDeliveryStatusBadge(d.status)
                  return (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-gray-600">{d.orderId}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{d.city}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{d.address}</td>
                      <td className="px-4 py-3 text-gray-600">{d.driverName ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{d.vehicleInfo ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{d.stepCount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          badge.status === "active" ? "bg-green-50 text-green-700" :
                          badge.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                          badge.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                          badge.status === "warning" ? "bg-orange-50 text-orange-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-[11px]">
                        {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigate(`/admin/deliveries/${d.id}`)}
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
