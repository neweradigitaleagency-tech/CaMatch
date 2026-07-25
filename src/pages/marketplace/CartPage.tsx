import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { ShoppingCart, Trash2, Minus, Plus, Package } from "lucide-react"
import PageHeader from "../../components/ui/PageHeader"
import { useMarketplaceCartStore, useCartHydrated } from "../../stores/marketplaceCartStore"

export default function CartPage() {
  const nav = useNavigate()
  const hydrated = useCartHydrated()
  const { items, removeItem, updateQuantity, clearCart, itemCount, subtotal } =
    useMarketplaceCartStore()
  const [confirmClear, setConfirmClear] = useState(false)

  const COMMISSION_RATE = 0.10
  const commission = Math.round(subtotal() * COMMISSION_RATE)
  const deliveryCost = subtotal() >= 50000 ? 0 : 3500
  const total = subtotal() + deliveryCost

  if (!hydrated) {
    return (
      <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
        <PageHeader title="Mon panier" fallbackRoute="/marketplace" />
        <div className="flex-1 px-4 pt-2 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-cm-elevated rounded-[var(--radius-cm)] p-4 border border-cm-border flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-3 rounded-full bg-gray-100 animate-pulse" />
                <div className="w-1/2 h-2 rounded-full bg-gray-100 animate-pulse" />
                <div className="w-1/4 h-3 rounded-full bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
        <PageHeader title="Mon panier" fallbackRoute="/marketplace" />
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cm-elevated border border-cm-border flex items-center justify-center mb-4">
            <ShoppingCart className="w-8 h-8 text-cm-text-muted" />
          </div>
          <p className="text-[15px] font-bold text-cm-text mb-1">Panier vide</p>
          <p className="text-[12px] text-cm-text-soft mb-6">Ajoutez des produits depuis le catalogue</p>
          <button onClick={() => nav("/catalog")}
            className="h-12 px-6 rounded-xl bg-cm-text text-white text-[12px] font-bold cursor-pointer active:scale-[0.97] transition-transform">
            Découvrir le catalogue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      <PageHeader
        title="Mon panier"
        fallbackRoute="/marketplace"
        subtitle={`${itemCount()} article${itemCount() > 1 ? "s" : ""}`}
        rightAction={
          <div className="relative">
            <button onClick={() => setConfirmClear(true)}
              className="text-[12px] font-bold text-cm-error px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer active:scale-95 transition-all touch-min">
              Vider
            </button>
            <AnimatePresence>
              {confirmClear && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full right-0 mt-1 z-10 bg-cm-elevated rounded-xl shadow-lg border border-cm-border p-3 w-48"
                >
                  <p className="text-[11px] font-semibold text-cm-text mb-2">Vider le panier ?</p>
                  <div className="flex gap-2">
                    <button onClick={() => { clearCart(); setConfirmClear(false) }}
                      className="flex-1 h-10 rounded-lg bg-cm-error text-white text-[10px] font-bold cursor-pointer active:scale-95 transition-transform">
                      Vider
                    </button>
                    <button onClick={() => setConfirmClear(false)}
                      className="flex-1 h-10 rounded-lg bg-gray-100 text-cm-text text-[10px] font-bold cursor-pointer active:scale-95 transition-transform">
                      Annuler
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
      />

      <div className="flex-1 px-4 pb-4 space-y-3 overflow-y-auto">
        {items.map((item) => (
          <motion.div
            key={item.productId}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cm-elevated rounded-[var(--radius-cm)] p-4 border border-cm-border flex gap-3"
          >
            <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
              {item.productImage ? (
                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-6 h-6 text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-cm-text truncate">{item.productName}</p>
              <p className="text-[11px] text-cm-text-soft mt-0.5">{item.sellerName}</p>
              <p className="text-[13px] font-bold text-cm-text mt-1">
                {(item.price * item.quantity).toLocaleString("fr-FR")} F
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg border border-cm-border">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-9 h-9 flex items-center justify-center cursor-pointer active:scale-90 transition-transform text-cm-text-soft hover:text-cm-text touch-min" aria-label="Diminuer quantité">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-[11px] font-bold text-cm-text">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center cursor-pointer active:scale-90 transition-transform text-cm-text-soft hover:text-cm-text touch-min" aria-label="Augmenter quantité">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button onClick={() => removeItem(item.productId)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer active:scale-90 transition-transform text-cm-text-muted hover:text-cm-error touch-min" aria-label="Supprimer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

        <div className="bg-cm-elevated border-t border-cm-border px-4 py-4 safe-bottom">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] text-cm-text-soft">Sous-total</span>
          <span className="text-[12px] font-semibold text-cm-text">{subtotal().toLocaleString("fr-FR")} F</span>
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] text-cm-text-soft">Livraison</span>
          <span className="text-[12px] font-semibold text-cm-text">
            {deliveryCost === 0 ? "Gratuite" : `${deliveryCost.toLocaleString("fr-FR")} F`}
          </span>
        </div>
        <div className="flex items-center justify-between mb-1.5 pb-2 border-b border-cm-border">
          <span className="text-[12px] text-cm-text-soft">Total</span>
          <span className="text-[12px] font-semibold text-cm-text">{total.toLocaleString("fr-FR")} F</span>
        </div>
        <p className="text-[10px] text-cm-text-muted mb-3 text-right">Dont frais de service ({Math.round(COMMISSION_RATE * 100)}%) : {commission.toLocaleString("fr-FR")} F</p>
        <button onClick={() => nav("/marketplace/checkout")}
          className="w-full h-12 rounded-xl bg-cm-text text-white text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform">
          Commander ({itemCount()} article{itemCount() > 1 ? "s" : ""})
        </button>
      </div>
    </div>
  )
}
