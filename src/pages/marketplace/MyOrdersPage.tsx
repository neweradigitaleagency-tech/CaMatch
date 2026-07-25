import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Package, MapPin, CreditCard, Clock, CheckCircle, XCircle, Truck } from "lucide-react"
import PageHeader from "../../components/ui/PageHeader"
import { useMarketplaceCartStore } from "../../stores/marketplaceCartStore"
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
  const nav = useNavigate()
  const orders = useMarketplaceCartStore((s) => s.orders)
  const [filter, setFilter] = useState<"all" | MarketplaceOrderStatus>("all")

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      <PageHeader title="Mes commandes" fallbackRoute="/marketplace" />

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
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <Package className="w-12 h-12 text-cm-text-muted mb-3" />
            <p className="text-[14px] font-bold text-cm-text mb-1">Aucune commande</p>
            <p className="text-[12px] text-cm-text-soft mb-4">Vous n'avez pas encore passé de commande</p>
            <button onClick={() => nav("/marketplace")}
              className="h-10 px-5 rounded-xl bg-cm-text text-cm-elevated text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform">
              Découvrir le marketplace
            </button>
          </div>
        ) : (
          filtered.map((order, i) => {
            const Icon = STATUS_ICONS[order.status]
            return (
              <motion.button
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => nav(`/marketplace/order/confirm/${order.id}`)}
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
                </div>
              </motion.button>
            )
          })
        )}
      </div>
    </div>
  )
}
