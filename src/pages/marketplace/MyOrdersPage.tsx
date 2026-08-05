import { useState } from "react"
import { motion } from "motion/react"
import { Package, MapPin, CreditCard, Clock, CheckCircle, XCircle, Truck, User } from "lucide-react"
import { useAppNavigation } from "../../navigation/useAppNavigation"
import { useMarketplaceCartStore } from "../../stores/marketplaceCartStore"
import { getEstimatedWindow } from "../../data/delivery"
import EmptyState from "../../components/ui/EmptyState"
import type { MarketplaceOrderStatus } from "../../types/marketplace"

const STATUS_LABELS: Record<MarketplaceOrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  disputed: "Litige",
}

const STATUS_ICONS: Record<MarketplaceOrderStatus, typeof Package> = {
  pending: Clock, confirmed: CheckCircle, preparing: Package,
  shipped: Truck, delivered: CheckCircle, cancelled: XCircle, disputed: XCircle,
}

const STATUS_COLORS: Record<MarketplaceOrderStatus, string> = {
  pending: "text-amber-500", confirmed: "text-cm-accent", preparing: "text-blue-500",
  shipped: "text-indigo-500", delivered: "text-green-600", cancelled: "text-red-500", disputed: "text-red-600",
}

export default function MyOrdersPage() {
  const { navigate: nav } = useAppNavigation()
  const orders = useMarketplaceCartStore((s) => s.orders)
  const [filter, setFilter] = useState<"all" | MarketplaceOrderStatus>("all")

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
        <h1 className="h1-cm text-cm-text">Mes commandes</h1>
        <button
          onClick={() => nav("/marketplace/profile")}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-cm-elevated border border-cm-border text-[11px] font-bold text-cm-text cursor-pointer active:scale-95 transition-all"
        >
          <User className="w-3.5 h-3.5 text-cm-forest" />
          Mon espace
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {(["all", "confirmed", "preparing", "shipped", "delivered", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 h-8 px-3 rounded-lg text-[11px] font-bold cursor-pointer active:scale-95 transition-all ${
              filter === f ? "bg-cm-text text-cm-elevated" : "bg-cm-elevated text-cm-text-soft border border-cm-border"
            }`}
          >
            {f === "all" ? "Toutes" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucune commande"
            description="Vous n'avez pas encore passé de commande"
            action={{ label: "Découvrir le marketplace", onClick: () => nav("/marketplace") }}
            compact
          />
        ) : (
          filtered.map((order, i) => {
            const Icon = STATUS_ICONS[order.status]
            return (
              <motion.button
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => nav(`/marketplace/orders/${order.id}`)}
                className="w-full bg-cm-elevated rounded-xl p-3.5 border border-cm-border text-left cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[13px] font-semibold text-cm-text">
                      Commande #{order.id.slice(-8)}
                    </p>
                    <p className="text-[11px] text-cm-text-soft mt-0.5">
                      {order.items.length} article{order.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 ${STATUS_COLORS[order.status]}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">{STATUS_LABELS[order.status]}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-cm-text-soft">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {order.deliveryCity}
                  </span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> {order.total.toLocaleString("fr-FR")} F
                  </span>
                  {order.status !== "delivered" && order.status !== "cancelled" && order.delivery?.estimatedAt && (
                    <span className="flex items-center gap-1 text-cm-forest font-semibold">
                      <Truck className="w-3 h-3" /> Est. {getEstimatedWindow(order.delivery.estimatedAt).to}
                    </span>
                  )}
                </div>
              </motion.button>
            )
          })
        )}
      </div>
    </div>
  )
}
