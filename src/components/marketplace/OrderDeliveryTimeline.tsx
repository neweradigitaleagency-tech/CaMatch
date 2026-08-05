import { useState } from "react"
import { Truck, Copy, Check, Phone, Clock, CheckCircle2 } from "lucide-react"
import type { MarketplaceOrder } from "../../types/marketplace"
import { DELIVERY_STEPS, DELIVERY_STATUS_INDEX, getEstimatedWindow, formatEventDate } from "../../data/delivery"

interface OrderDeliveryTimelineProps {
  order: MarketplaceOrder
}

export default function OrderDeliveryTimeline({ order }: OrderDeliveryTimelineProps) {
  const [copied, setCopied] = useState(false)
  const stepIndex = DELIVERY_STATUS_INDEX[order.status] ?? 0
  const delivered = order.status === "delivered"
  const cancelled = order.status === "cancelled"
  const disputed = order.status === "disputed"
  const window = getEstimatedWindow(order.delivery.estimatedAt)
  const trackable = !cancelled && !disputed && order.delivery.trackingCode

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.delivery.trackingCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard indisponible */
    }
  }

  if (cancelled || disputed) return null

  return (
    <div className="bg-cm-elevated rounded-xl p-4 border border-cm-border">
      {/* Carrier */}
      <div className="flex items-center gap-3 pb-3 border-b border-cm-border">
        <div className="w-10 h-10 rounded-full bg-cm-surface flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5 text-cm-text-soft" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-cm-text-soft uppercase tracking-wider">
            Livré par
          </p>
          <p className="text-[13px] font-bold text-cm-text">{order.delivery.carrier}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold ${
          delivered ? "bg-cm-green/15 text-green-700" : "bg-cm-accent/20 text-cm-forest"
        }`}>
          {delivered ? "Livrée" : "En route"}
        </span>
      </div>

      {/* Tracking number */}
      {trackable && (
        <div className="flex items-center justify-between py-3 border-b border-cm-border">
          <div>
            <p className="text-[10px] font-semibold text-cm-text-soft uppercase tracking-wider">N° de suivi</p>
            <p className="text-[13px] font-mono font-bold text-cm-text tracking-wide">{order.delivery.trackingCode}</p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-cm-surface text-[11px] font-bold text-cm-text cursor-pointer active:scale-95 transition-transform"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cm-green" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
      )}

      {/* ETA */}
      <div className="flex items-start gap-2.5 py-3 border-b border-cm-border">
        <Clock className="w-4 h-4 text-cm-amber mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] font-semibold text-cm-text-soft uppercase tracking-wider">
            {delivered ? "Livrée le" : "Livraison estimée"}
          </p>
          {delivered && order.delivery.deliveredAt ? (
            <p className="text-[12px] font-bold text-cm-text capitalize mt-0.5">
              {formatEventDate(order.delivery.deliveredAt)}
            </p>
          ) : (
            <>
              <p className="text-[12px] font-bold text-cm-text capitalize mt-0.5">{window.from}</p>
              <p className="text-[11px] text-cm-text-soft">au {window.to}</p>
            </>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="pt-3">
        <div className="space-y-0">
          {DELIVERY_STEPS.map((step, i) => {
            const done = i <= stepIndex
            const isCurrent = i === stepIndex && !delivered
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    done ? "bg-cm-accent text-cm-forest" : "bg-cm-surface border border-cm-border text-cm-text-muted"
                  }`}>
                    {done && !isCurrent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                  </div>
                  {i < DELIVERY_STEPS.length - 1 && (
                    <div className={`w-0.5 h-6 ${i < stepIndex ? "bg-cm-accent" : "bg-cm-border"}`} />
                  )}
                </div>
                <div className={`pb-4 ${isCurrent ? "" : "opacity-70"}`}>
                  <p className={`text-[12px] font-bold ${done ? "text-cm-text" : "text-cm-text-soft"}`}>
                    {step.label}
                    {isCurrent && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-cm-accent/20 text-cm-forest text-[9px]">
                        En cours
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-cm-text-soft mt-0.5">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Contact carrier */}
      <a
        href={`tel:${order.delivery.contact.replace(/\s/g, "")}`}
        className="flex items-center justify-center gap-2 h-10 rounded-xl bg-cm-surface border border-cm-border text-[11px] font-bold text-cm-text cursor-pointer active:scale-[0.98] transition-transform"
      >
        <Phone className="w-3.5 h-3.5" />
        Contacter {order.delivery.carrier}
      </a>
    </div>
  )
}
