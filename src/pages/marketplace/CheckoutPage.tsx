import { useState } from "react"
import { CreditCard, Truck, ChevronRight } from "lucide-react"
import PageHeader from "../../components/ui/PageHeader"
import { useAppNavigation } from "../../navigation/useAppNavigation"
import { useMarketplaceCartStore } from "../../stores/marketplaceCartStore"
import { useLocationStore } from "../../stores/locationStore"

type PaymentMethod = "orange_money" | "mtn_momo" | "wave" | "moov_money" | "card" | "cash_on_delivery"

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: "orange_money", label: "Orange Money", icon: "📱" },
  { value: "mtn_momo", label: "MTN MoMo", icon: "📱" },
  { value: "wave", label: "Wave", icon: "🌊" },
  { value: "moov_money", label: "Moov Money", icon: "📱" },
  { value: "card", label: "Carte bancaire", icon: "💳" },
  { value: "cash_on_delivery", label: "Paiement à la livraison", icon: "💵" },
]

export default function CheckoutPage() {
  const { replace, complete } = useAppNavigation()
  const { items, subtotal, checkout } = useMarketplaceCartStore()
  const neighborhood = useLocationStore((s) => s.neighborhood)

  const [deliveryCity, setDeliveryCity] = useState(neighborhood || "")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery")
  const [submitting, setSubmitting] = useState(false)

  const COMMISSION_RATE = 0.10
  const commission = subtotal() * COMMISSION_RATE
  const sellerNet = subtotal() - commission
  const deliveryCost = subtotal() >= 50000 ? 0 : 3500
  const total = subtotal() + deliveryCost

  const handleSubmit = async () => {
    if (!deliveryCity.trim() || !deliveryAddress.trim()) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    const orderId = checkout(deliveryCity.trim(), deliveryAddress.trim(), paymentMethod)
    setSubmitting(false)
    if (orderId) {
      complete({ to: `/marketplace/order/confirm/${orderId}` })
    }
  }

  if (items.length === 0) {
    replace("/marketplace/cart")
    return null
  }

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      <PageHeader title="Finaliser la commande" fallbackRoute="/marketplace" />

      <div className="flex-1 px-4 pb-4 space-y-3 overflow-y-auto">
        {/* Delivery */}
        <div className="bg-cm-elevated rounded-xl p-4 border border-cm-border">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4 text-cm-text" />
            <h2 className="text-[13px] font-bold text-cm-text">Adresse de livraison</h2>
          </div>
          <input
            value={deliveryCity}
            onChange={(e) => setDeliveryCity(e.target.value)}
            placeholder="Ville / quartier"
            className="w-full h-10 px-3 rounded-xl bg-cm-surface border border-cm-border-soft text-[13px] text-cm-text outline-none mb-2 placeholder:text-cm-text-muted"
          />
          <input
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Adresse complète"
            className="w-full h-10 px-3 rounded-xl bg-cm-surface border border-cm-border-soft text-[13px] text-cm-text outline-none placeholder:text-cm-text-muted"
          />
        </div>

        {/* Payment */}
        <div className="bg-cm-elevated rounded-xl p-4 border border-cm-border">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-cm-text" />
            <h2 className="text-[13px] font-bold text-cm-text">Mode de paiement</h2>
          </div>
          <div className="space-y-1">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPaymentMethod(opt.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all active:scale-[0.99] ${
                  paymentMethod === opt.value
                    ? "bg-cm-text text-cm-elevated"
                    : "bg-cm-surface text-cm-text hover:bg-cm-border-soft"
                }`}
              >
                <span className="text-[16px]">{opt.icon}</span>
                <span className="text-[12px] font-semibold flex-1">{opt.label}</span>
                {paymentMethod === opt.value && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-cm-elevated rounded-xl p-4 border border-cm-border">
          <h2 className="text-[13px] font-bold text-cm-text mb-3">Récapitulatif</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-[12px] text-cm-text truncate">{item.productName}</p>
                  <p className="text-[10px] text-cm-text-soft">x{item.quantity}</p>
                </div>
                <span className="text-[12px] font-semibold text-cm-text shrink-0">
                  {(item.price * item.quantity).toLocaleString("fr-FR")} F
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-cm-border-soft space-y-1">
            <div className="flex justify-between text-[11px] text-cm-text-soft">
              <span>Sous-total</span>
              <span>{subtotal().toLocaleString("fr-FR")} F</span>
            </div>
            <div className="flex justify-between text-[11px] text-cm-text-soft">
              <span>Livraison</span>
              <span>{deliveryCost === 0 ? "Gratuite" : `${deliveryCost.toLocaleString("fr-FR")} F`}</span>
            </div>
            <div className="flex justify-between text-[11px] text-cm-text-soft pb-1 border-b border-cm-border-soft">
              <span>Commission ({Math.round(COMMISSION_RATE * 100)}%)</span>
              <span className="text-cm-accent">-{commission.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold text-cm-text pt-1">
              <span>Total</span>
              <span>{total.toLocaleString("fr-FR")} F</span>
            </div>
            <p className="text-[10px] text-cm-text-soft pt-1 leading-tight">
              Le vendeur recevra <strong>{sellerNet.toLocaleString("fr-FR")} F</strong> après validation de la livraison
            </p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="bg-cm-elevated border-t border-cm-border px-4 py-3 safe-bottom">
        <button
          onClick={handleSubmit}
          disabled={submitting || !deliveryCity.trim() || !deliveryAddress.trim()}
          className="w-full h-11 rounded-xl bg-cm-text text-cm-elevated text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {submitting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Traitement...</>
          ) : (
            `Confirmer la commande — ${total.toLocaleString("fr-FR")} F`
          )}
        </button>
      </div>
    </div>
  )
}
