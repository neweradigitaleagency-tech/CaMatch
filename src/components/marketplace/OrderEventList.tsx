import { Clock, CheckCircle2, Package, Truck, Home, XCircle, AlertTriangle } from "lucide-react"
import type { OrderEvent, MarketplaceOrderStatus } from "../../types/marketplace"
import { formatEventDate } from "../../data/delivery"

const EVENT_ICONS: Record<MarketplaceOrderStatus, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle2,
  preparing: Package,
  shipped: Truck,
  delivered: Home,
  cancelled: XCircle,
  disputed: AlertTriangle,
}

const EVENT_COLORS: Record<MarketplaceOrderStatus, string> = {
  pending: "text-cm-text-muted",
  confirmed: "text-cm-forest",
  preparing: "text-blue-500",
  shipped: "text-indigo-500",
  delivered: "text-green-600",
  cancelled: "text-red-500",
  disputed: "text-red-600",
}

interface OrderEventListProps {
  events: OrderEvent[]
}

export default function OrderEventList({ events }: OrderEventListProps) {
  if (events.length === 0) return null

  const sorted = [...events].sort((a, b) => (a.at < b.at ? 1 : -1))

  return (
    <div className="bg-cm-elevated rounded-xl p-4 border border-cm-border">
      <h2 className="text-[13px] font-bold text-cm-text mb-3">Historique</h2>
      <div className="space-y-0">
        {sorted.map((ev, i) => {
          const Icon = EVENT_ICONS[ev.status]
          const isLast = i === sorted.length - 1
          return (
            <div key={ev.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-cm-surface border border-cm-border`}>
                  <Icon className={`w-3.5 h-3.5 ${EVENT_COLORS[ev.status]}`} />
                </div>
                {!isLast && <div className="w-0.5 h-6 bg-cm-border" />}
              </div>
              <div className={`pb-3.5 ${isLast ? "" : ""}`}>
                <p className="text-[12px] font-bold text-cm-text">{ev.label}</p>
                <p className="text-[10px] text-cm-text-soft mt-0.5">{ev.description}</p>
                <p className="text-[9px] text-cm-text-muted mt-0.5 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {formatEventDate(ev.at)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
