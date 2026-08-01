import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Truck, Package, CheckCircle, XCircle, Clock, MapPin, AlertCircle, User } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getMockSupplierDeliveries, MOCK_ORDERS } from "../../data/supplier-mocks"
import type { DeliveryStatus } from "../../types/supplier"

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: "En attente",
  preparing: "Préparation",
  picked_up: "Enlevée",
  in_transit: "En route",
  delivered: "Livrée",
  partial: "Partielle",
  failed: "Échouée",
}

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending: "bg-cm-surface text-cm-text-soft",
  preparing: "bg-indigo-100 text-indigo-700",
  picked_up: "bg-blue-100 text-blue-700",
  in_transit: "bg-amber-100 text-amber-700",
  delivered: "bg-emerald-100 text-emerald-700",
  partial: "bg-orange-100 text-orange-700",
  failed: "bg-red-100 text-red-700",
}

const STATUS_ICONS: Record<DeliveryStatus, typeof Truck> = {
  pending: Clock,
  preparing: Package,
  picked_up: Package,
  in_transit: Truck,
  delivered: CheckCircle,
  partial: AlertCircle,
  failed: XCircle,
}

function getStepIndex(status: DeliveryStatus): number {
  const order: DeliveryStatus[] = ["pending", "preparing", "picked_up", "in_transit", "delivered"]
  return order.indexOf(status)
}

export default function SupplierDeliveriesScreen() {
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.user?.id ?? "supplier-1")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const { data: deliveries = [] } = useQuery({
    queryKey: ["supplier-deliveries", userId],
    queryFn: () => getMockSupplierDeliveries(userId),
  })

  const filtered = useMemo(() => {
    let result = [...deliveries]
    if (statusFilter !== "all") result = result.filter((d) => d.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((d) => d.orderId.toLowerCase().includes(q) || d.city.toLowerCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [deliveries, statusFilter, search])

  const activeCount = deliveries.filter((d) => !["delivered", "failed"].includes(d.status)).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Suivi des livraisons</h1>
          <p className="text-[12px] text-cm-text-muted">
            {deliveries.length} livraisons · {activeCount > 0 ? <span className="text-amber-600 font-medium">{activeCount} en cours</span> : "aucune en cours"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-cm-elevated border border-cm-border rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green"
            placeholder="Rechercher par commande ou ville..." />
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {["all", "pending", "preparing", "picked_up", "in_transit", "delivered", "partial", "failed"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`shrink-0 px-3 h-7 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
              statusFilter === s
                ? "bg-cm-text text-white border-cm-text"
                : "bg-cm-elevated text-cm-text-soft border-cm-border hover:border-cm-border"
            }`}>
            {s === "all" ? "Toutes" : STATUS_LABELS[s as DeliveryStatus]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-8 text-center">
          <Truck className="w-10 h-10 text-cm-border-soft mx-auto mb-3" />
          <p className="text-[14px] font-medium text-cm-text-muted">Aucune livraison trouvée</p>
          <p className="text-[12px] text-cm-text-muted mt-1">
            {statusFilter !== "all" ? "Essayez un autre filtre" : "Aucune livraison pour le moment"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((delivery) => {
            const Icon = STATUS_ICONS[delivery.status]
            const stepCount = delivery.trackingSteps.length
            const lastStep = delivery.trackingSteps[stepCount - 1]
            const eta = delivery.estimatedDeliveryAt
              ? new Date(delivery.estimatedDeliveryAt).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })
              : null

            return (
              <div key={delivery.id}
                onClick={() => navigate(`/supplier/deliveries/${delivery.id}`)}
                className="bg-cm-elevated rounded-xl border border-cm-border p-4 hover:border-cm-border cursor-pointer transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${
                        delivery.status === "delivered" ? "text-emerald-500" :
                        delivery.status === "in_transit" ? "text-amber-500" :
                        delivery.status === "failed" ? "text-red-500" :
                        "text-cm-text-muted"
                      }`} />
                      <p className="text-[14px] font-semibold text-cm-text">{delivery.orderId}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[delivery.status]}`}>
                        {STATUS_LABELS[delivery.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[12px] text-cm-text-soft">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {delivery.city}
                      </span>
                      {delivery.driverName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {delivery.driverName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-cm-text-muted">
                      <span>{stepCount} étape{stepCount > 1 ? "s" : ""}</span>
                      {eta && <span>Prévue: {eta}</span>}
                      {delivery.deliveredAt && (
                        <span className="text-emerald-600 font-medium">
                          Livrée le {new Date(delivery.deliveredAt).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                    {lastStep && ["pending", "preparing", "picked_up", "in_transit"].includes(delivery.status) && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-cm-surface rounded-full overflow-hidden">
                          <div className="h-full bg-cm-green rounded-full transition-all"
                            style={{ width: `${Math.min(100, (getStepIndex(delivery.status) / 4) * 100)}%` }} />
                        </div>
                        <span className="text-[10px] text-cm-text-muted">{lastStep.label}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-cm-text-muted">
                      {new Date(delivery.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                    {delivery.failureReason && (
                      <p className="text-[10px] text-red-400 mt-1 max-w-[160px] truncate">{delivery.failureReason}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
