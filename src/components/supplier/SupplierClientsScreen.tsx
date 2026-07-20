import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Users, Phone, MapPin, ShoppingBag, TrendingUp } from "lucide-react"
import { useSupplierClients } from "../../hooks/supplier/useSupplierClients"
import { formatXOF } from "../../utils/format"

export default function SupplierClientsScreen() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const { data: clients, isLoading } = useSupplierClients(search || undefined)

  const stats = useMemo(() => {
    if (!clients || clients.length === 0) return { total: 0, totalSpent: 0, avgSpent: 0, activeMonth: 0 }
    const totalSpent = clients.reduce((s, c) => s + c.totalSpent, 0)
    const now = new Date()
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const activeMonth = clients.filter((c) => c.lastOrderAt && new Date(c.lastOrderAt) > monthAgo).length
    return { total: clients.length, totalSpent, avgSpent: Math.round(totalSpent / clients.length), activeMonth }
  }, [clients])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-200/50 animate-pulse rounded-xl h-8 w-48" />
        <div className="grid grid-cols-3 gap-3">{[1,2,3].map((i) => <div key={i} className="bg-gray-200/50 animate-pulse rounded-xl h-24" />)}</div>
        <div className="bg-gray-200/50 animate-pulse rounded-xl h-12" />
        {[1,2,3,4].map((i) => <div key={i} className="bg-gray-200/50 animate-pulse rounded-xl h-16" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">Clients</h1>
        <p className="text-[13px] text-gray-500 mt-1">{stats.total} client{stats.total > 1 ? "s" : ""} · {formatXOF(stats.totalSpent)} total</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <ShoppingBag className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-[18px] font-bold text-gray-900">{stats.total}</p>
          <p className="text-[10px] text-gray-500">Total clients</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-[16px] font-bold text-gray-900">{formatXOF(stats.avgSpent)}</p>
          <p className="text-[10px] text-gray-500">Moyen/historique</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <Users className="w-5 h-5 text-indigo-500 mb-2" />
          <p className="text-[18px] font-bold text-gray-900">{stats.activeMonth}</p>
          <p className="text-[10px] text-gray-500">Actifs (30j)</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un client..."
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20" />
      </div>

      {clients && clients.length > 0 ? (
        <div className="space-y-2">
          {clients.map((client) => (
            <div key={client.id} onClick={() => navigate(`/supplier/clients/${client.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 cursor-pointer transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-900">{client.name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[11px] text-gray-500">
                    {client.phone && (
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</span>
                    )}
                    {client.city && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{client.city}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[14px] font-bold text-gray-900">{formatXOF(client.totalSpent)}</p>
                  <p className="text-[11px] text-gray-500">{client.totalOrders} commande{client.totalOrders > 1 ? "s" : ""}</p>
                </div>
              </div>
              {client.lastOrderAt && (
                <p className="text-[10px] text-gray-400 mt-2">Dernière commande: {new Date(client.lastOrderAt).toLocaleDateString("fr-FR")}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[13px] font-medium text-gray-500">Aucun client trouvé</p>
          <p className="text-[11px] text-gray-400 mt-1">{search ? "Essayez un autre terme" : "Les clients apparaîtront après les premières commandes"}</p>
        </div>
      )}
    </div>
  )
}
