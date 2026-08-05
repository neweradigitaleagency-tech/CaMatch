import { useParams } from "react-router-dom"
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight, Lock } from "lucide-react"
import PageHeader from "../../components/ui/PageHeader"
import { useAppNavigation } from "../../navigation/useAppNavigation"
import { useMarketplaceCartStore } from "../../stores/marketplaceCartStore"

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { navigate: nav } = useAppNavigation()
  const order = useMarketplaceCartStore((s) => s.getOrder(orderId || ""))

  if (!order) {
    return (
      <div className="flex flex-col w-full min-h-dynamic bg-cm-bg items-center justify-center px-5">
        <Package className="w-12 h-12 text-cm-border-soft mb-3" />
        <p className="text-[15px] font-bold text-cm-text">Commande introuvable</p>
        <button onClick={() => nav("/marketplace")}
          className="mt-4 h-11 px-6 rounded-xl bg-cm-text text-cm-elevated text-[12px] font-bold cursor-pointer active:scale-[0.97] transition-transform">
          Retour au marketplace
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      <PageHeader title="Commande confirmée" fallbackRoute="/marketplace" />
      <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cm-accent/20 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-cm-accent" />
        </div>
        <h1 className="text-[18px] font-extrabold text-cm-text mb-1">Commande confirmée !</h1>
        <p className="text-[12px] text-cm-text-soft mb-6 max-w-[280px]">
          Votre commande a été transmise au vendeur. Vous serez informé de son traitement.
        </p>

        <div className="w-full rounded-xl p-3.5 bg-cm-forest text-white flex items-start gap-2.5 text-left mb-6 max-w-sm">
          <Lock className="w-4 h-4 text-cm-accent shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-white/90">
            <strong className="text-cm-accent">Paiement sécurisé :</strong> vos{" "}
            {order.total.toLocaleString("fr-FR")} F sont bloqués en escrow par Ça Match et ne seront
            reversés au vendeur qu'à la confirmation de la livraison.
          </p>
        </div>

        <div className="w-full bg-cm-elevated rounded-xl p-4 border border-cm-border text-left mb-6 max-w-sm">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-cm-border">
            <Package className="w-4 h-4 text-cm-text" />
            <span className="text-[13px] font-bold text-cm-text">Commande #{order.id.slice(-8)}</span>
          </div>
          <div className="space-y-2 text-[12px]">
            <div className="flex items-center gap-2 text-cm-text-soft">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{order.deliveryAddress}, {order.deliveryCity}</span>
            </div>
            <div className="flex items-center gap-2 text-cm-text-soft">
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span className="capitalize">{order.paymentMethod.replace(/_/g, " ")}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-cm-border space-y-1">
            <div className="flex items-center justify-between text-[11px] text-cm-text-soft">
              <span>Sous-total</span>
              <span>{order.subtotal.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-cm-text-soft">
              <span>Commission ({Math.round(order.commissionRate * 100)}%)</span>
              <span className="text-cm-accent">-{order.commission.toLocaleString("fr-FR")} F</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-cm-text-soft">
              <span>Livraison</span>
              <span>{order.deliveryCost === 0 ? "Gratuite" : `${order.deliveryCost.toLocaleString("fr-FR")} F`}</span>
            </div>
            <div className="flex items-center justify-between text-[14px] font-bold text-cm-text pt-1 border-t border-cm-border">
              <span>Total payé</span>
              <span>{order.total.toLocaleString("fr-FR")} F</span>
            </div>
            <p className="text-[10px] text-cm-text-soft pt-1">
              Le vendeur recevra <strong>{order.sellerNet.toLocaleString("fr-FR")} F</strong> après la livraison
            </p>
          </div>
        </div>

        <button onClick={() => nav("/marketplace/orders")}
          className="h-11 px-6 rounded-xl bg-cm-text text-cm-elevated text-[12px] font-bold flex items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform">
          Mes commandes <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => nav("/marketplace")}
          className="mt-2 h-11 px-6 rounded-xl text-[12px] font-bold text-cm-text-soft cursor-pointer active:scale-[0.97] transition-transform">
          Continuer mes achats
        </button>
      </div>
    </div>
  )
}
