import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ClipboardList } from "lucide-react"
import { useSupplierOrders } from "../../hooks/supplier/useSupplierOrders"
import { getStatusLabel, getStatusColor } from "../../services/supplier/orders.service"
import { formatXOF } from "../../utils/format"

const STATUS_FILTERS = [
  { value: "all", label: "Toutes" },
  { value: "PENDING_SUPPLIER", label: "Nouvelles" },
  { value: "ACCEPTED", label: "Acceptées" },
  { value: "PREPARING", label: "Préparation" },
  { value: "READY", label: "Prêtes" },
  { value: "DELIVERING", label: "Livraison" },
  { value: "DELIVERED", label: "Livrées" },
  { value: "CANCELLED", label: "Annulées" },
]

export default function SupplierOrderListScreen() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")
  const { data: orders, isLoading } = useSupplierOrders(statusFilter)

  const filtered = (orders ?? []).filter((o) => {
    if (search) {
      const q = search.toLowerCase()
      return o.id.toLowerCase().includes(q) || (o.clientName && o.clientName.toLowerCase().includes(q))
    }
    return true
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-cm-elevated rounded-xl border border-cm-border p-4">
            <div className="h-4 bg-cm-surface/50 animate-pulse rounded w-1/3 mb-2" />
            <div className="h-3 bg-cm-surface/50 animate-pulse rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[20px] font-bold text-cm-text">Commandes reçues</h1>
        <p className="text-[12px] text-cm-text-muted">{orders?.length ?? 0} commandes</p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-cm-elevated border border-cm-border rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green"
            placeholder="Rechercher une commande..." />
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)}
            className={`shrink-0 px-3 h-7 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
              statusFilter === f.value
                ? "bg-cm-text text-white border-cm-text"
                : "bg-cm-elevated text-cm-text-soft border-cm-border hover:border-cm-border"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-8 text-center">
          <ClipboardList className="w-10 h-10 text-cm-border-soft mx-auto mb-3" />
          <p className="text-[14px] font-medium text-cm-text-muted">Aucune commande trouvée</p>
          <p className="text-[12px] text-cm-text-muted mt-1">
            {statusFilter !== "all" ? "Essayez un autre filtre" : "Vous n'avez pas encore reçu de commande"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => (
            <div key={order.id}
              onClick={() => navigate(`/supplier/orders/${order.id}`)}
              className="bg-cm-elevated rounded-xl border border-cm-border p-4 hover:border-cm-border cursor-pointer transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-cm-text">{order.id.toUpperCase()}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-[12px] text-cm-text-soft mt-0.5 font-medium">{order.clientName ?? "Client"}</p>
                  <p className="text-[11px] text-cm-text-muted">
                    {order.deliveryCity && `${order.deliveryCity} · `}
                    {formatXOF(order.total)}
                  </p>
                  {order.items && order.items.length > 0 && (
                    <p className="text-[11px] text-cm-text-muted mt-1 truncate">
                      {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-cm-text-muted">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
