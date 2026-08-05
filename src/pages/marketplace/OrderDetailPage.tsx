import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import {
  Lock, Package, MapPin, CreditCard, Clock,
  AlertTriangle, XCircle, CheckCircle2, ArrowRight,
} from "lucide-react"
import PageHeader from "../../components/ui/PageHeader"
import OrderDeliveryTimeline from "../../components/marketplace/OrderDeliveryTimeline"
import OrderEventList from "../../components/marketplace/OrderEventList"
import OrderReviewCard from "../../components/marketplace/OrderReviewCard"
import OrderChat from "../../components/marketplace/OrderChat"
import { useAppNavigation } from "../../navigation/useAppNavigation"
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { goBackTo } = useAppNavigation()
  const order = useMarketplaceCartStore((s) => s.getOrder(orderId || ""))
  const updateOrderStatus = useMarketplaceCartStore((s) => s.updateOrderStatus)
  const advanceOrder = useMarketplaceCartStore((s) => s.advanceOrder)
  const [confirming, setConfirming] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    if (!order) return
    if (order.status === "confirmed" || order.status === "preparing") {
      const elapsedMin = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
      const shouldAdvance = order.status === "confirmed" ? elapsedMin >= 1 : elapsedMin >= 3
      if (shouldAdvance) advanceOrder(order.id)
    }
  }, [order, advanceOrder])

  if (!order) {
    return (
      <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
        <PageHeader title="Suivi de commande" fallbackRoute="/marketplace/orders" />
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <Package className="w-12 h-12 text-cm-border-soft mb-3" />
          <p className="text-[15px] font-bold text-cm-text mb-1">Commande introuvable</p>
          <button onClick={() => goBackTo("/marketplace/orders")}
            className="mt-4 h-11 px-6 rounded-xl bg-cm-text text-cm-elevated text-[12px] font-bold cursor-pointer active:scale-[0.97] transition-transform">
            Mes commandes
          </button>
        </div>
      </div>
    )
  }

  const cancelled = order.status === "cancelled"
  const disputed = order.status === "disputed"
  const escrowActive = !cancelled && !disputed && order.status !== "delivered"
  const canConfirm = ["confirmed", "preparing", "shipped"].includes(order.status)
  const canCancel = order.status === "confirmed"

  const handleConfirm = () => {
    if (!canConfirm) return
    setConfirming(true)
    setTimeout(() => {
      updateOrderStatus(order.id, "delivered")
      setConfirming(false)
    }, 900)
  }

  const handleCancel = () => {
    if (!canCancel) return
    setConfirmCancel(false)
    updateOrderStatus(order.id, "cancelled")
  }

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      <PageHeader title="Suivi de commande" fallbackRoute="/marketplace/orders" subtitle={`#${order.id.slice(-8)}`} />

      <div className="flex-1 px-4 pb-8 space-y-3 overflow-y-auto">
        {/* Status banner */}
        <div aria-live="polite" className={`rounded-xl p-4 border flex items-start gap-3 ${
          disputed ? "bg-red-50 border-red-100" : cancelled ? "bg-cm-surface border-cm-border" : "bg-cm-elevated border-cm-border"
        }`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            disputed ? "bg-red-100 text-red-600" : cancelled ? "bg-cm-border text-cm-text-muted" : "bg-cm-accent/20 text-cm-forest"
          }`}>
            {disputed ? <AlertTriangle className="w-4.5 h-4.5" /> : cancelled ? <XCircle className="w-4.5 h-4.5" /> : <CheckCircle2 className="w-4.5 h-4.5" />}
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-cm-text">Commande {STATUS_LABELS[order.status].toLowerCase()}</p>
            <p className="text-[11px] text-cm-text-soft mt-0.5">
              {disputed
                ? "Un litige est ouvert sur cette commande. Ça Match intervient pour vous aider."
                : cancelled
                  ? "Cette commande a été annulée. Aucun montant n'a été débité."
                  : order.status === "delivered"
                    ? "Commande livrée. Les fonds ont été reversés au vendeur."
                    : "Votre paiement est conservé en toute sécurité par Ça Match."}
            </p>
            <p className="text-[10px] text-cm-text-muted mt-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Mise à jour le {formatDate(order.updatedAt)}
            </p>
          </div>
        </div>

        {/* Delivery tracking */}
        <OrderDeliveryTimeline order={order} />

        {/* Escrow explainer */}
        {escrowActive && (
          <div className="rounded-xl p-3.5 bg-cm-forest text-white flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-cm-accent shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-white/90">
              <strong className="text-cm-accent">Comment ça marche :</strong> votre paiement de{" "}
              <strong>{order.total.toLocaleString("fr-FR")} F</strong> est bloqué par Ça Match. Le vendeur ne le reçoit
              que lorsque vous confirmez la bonne réception de votre commande.
            </p>
          </div>
        )}

        {/* Items */}
        <div className="bg-cm-elevated rounded-xl p-4 border border-cm-border">
          <h2 className="text-[13px] font-bold text-cm-text mb-3">Articles ({order.items.length})</h2>
          <div className="space-y-2.5">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-cm-surface overflow-hidden shrink-0 flex items-center justify-center">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-4 h-4 text-cm-border-soft" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-cm-text truncate">{item.productName}</p>
                  <p className="text-[10px] text-cm-text-soft">x{item.quantity} · {item.sellerName}</p>
                </div>
                <span className="text-[12px] font-bold text-cm-text shrink-0">
                  {(item.price * item.quantity).toLocaleString("fr-FR")} F
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <OrderEventList events={order.events} />

        {/* Review after delivery */}
        <OrderReviewCard order={order} />

        {/* Seller chat */}
        <OrderChat order={order} />

        {/* Delivery + payment */}
        <div className="bg-cm-elevated rounded-xl p-4 border border-cm-border space-y-2.5">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-cm-text-soft uppercase tracking-wider">Livraison</p>
              <p className="text-[12px] text-cm-text mt-0.5">{order.deliveryAddress}, {order.deliveryCity}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CreditCard className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-cm-text-soft uppercase tracking-wider">Paiement</p>
              <p className="text-[12px] text-cm-text capitalize mt-0.5">{order.paymentMethod.replace(/_/g, " ")}</p>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-cm-elevated rounded-xl p-4 border border-cm-border space-y-1">
          <div className="flex items-center justify-between text-[11px] text-cm-text-soft">
            <span>Sous-total</span>
            <span>{order.subtotal.toLocaleString("fr-FR")} F</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-cm-text-soft">
            <span>Livraison</span>
            <span>{order.deliveryCost === 0 ? "Gratuite" : `${order.deliveryCost.toLocaleString("fr-FR")} F`}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-cm-text-soft pb-1 border-b border-cm-border-soft">
            <span>Commission ({Math.round(order.commissionRate * 100)}%)</span>
            <span className="text-cm-forest">-{order.commission.toLocaleString("fr-FR")} F</span>
          </div>
          <div className="flex items-center justify-between text-[13px] font-bold text-cm-text pt-1">
            <span>Total payé</span>
            <span>{order.total.toLocaleString("fr-FR")} F</span>
          </div>
          {order.status === "delivered" && (
            <p className="text-[10px] text-cm-text-soft pt-1">
              Le vendeur a reçu <strong>{order.sellerNet.toLocaleString("fr-FR")} F</strong> après votre confirmation.
            </p>
          )}
        </div>

        {/* Actions */}
        {canConfirm && (
          <button onClick={handleConfirm} disabled={confirming}
            className="w-full h-12 rounded-xl bg-cm-text text-cm-elevated text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.98] transition-transform">
            {confirming ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Libération des fonds...</>
            ) : (
              <>Confirmer la réception <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        )}
        {canConfirm && (
          <p className="text-center text-[10px] text-cm-text-soft">
            En confirmant, vous libérez {order.sellerNet.toLocaleString("fr-FR")} F au vendeur.
          </p>
        )}

        <div className="flex gap-2 pt-1">
          {canCancel && (
            <div className="relative flex-1">
              <button onClick={() => setConfirmCancel(true)}
                className="w-full h-10 rounded-xl bg-cm-surface border border-cm-border text-[11px] font-bold text-cm-error cursor-pointer active:scale-[0.98] transition-transform">
                Annuler la commande
              </button>
              <AnimatePresence>
                {confirmCancel && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-cm-elevated rounded-xl shadow-lg border border-cm-border p-3 z-10"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Annuler la commande"
                  >
                    <p className="text-[11px] font-semibold text-cm-text mb-2">Annuler cette commande ?</p>
                    <div className="flex gap-2">
                      <button onClick={handleCancel}
                        className="flex-1 h-9 rounded-lg bg-cm-error text-white text-[10px] font-bold cursor-pointer active:scale-95 transition-transform">
                        Oui, annuler
                      </button>
                      <button onClick={() => setConfirmCancel(false)}
                        className="flex-1 h-9 rounded-lg bg-cm-surface text-cm-text text-[10px] font-bold cursor-pointer active:scale-95 transition-transform">
                        Non
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {order.status !== "cancelled" && (
            <button onClick={() => goBackTo(`/marketplace/dispute/${order.id}`)}
              className={`${canCancel ? "flex-1" : "w-full"} h-10 rounded-xl bg-red-50 border border-red-100 text-[11px] font-bold text-red-600 cursor-pointer active:scale-[0.98] transition-transform`}>
              {disputed ? "Voir le litige" : "Ouvrir un litige"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
