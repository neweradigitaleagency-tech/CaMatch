import { useMemo, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import PageHeader from "../ui/PageHeader"
import { motion } from "motion/react"
import { Search, Package, MapPin, Store, Plus, ArrowRight, TrendingUp, Sparkles, ChevronRight, ShoppingCart } from "lucide-react"
import { MARKETPLACE_CATEGORIES } from "../../data/marketplaceCategories"
import { MARKETPLACE_PRODUCTS } from "../../data/marketplaceProducts"
import { useMarketplaceCartStore } from "../../stores/marketplaceCartStore"
import CatalogProductCard from "./CatalogProductCard"
import type { MarketplaceVertical, Product } from "../../types/marketplace"

const CONSUMER_VERTICALS: MarketplaceVertical[] = ["shopping", "second_hand", "real_estate"]

const VERTICAL_GRADIENTS: Record<string, string> = {
  shopping: "from-pink-500/20 to-rose-500/10",
  second_hand: "from-amber-500/20 to-yellow-500/10",
  real_estate: "from-blue-500/20 to-indigo-500/10",
}

const ALL_ACTIVE = MARKETPLACE_PRODUCTS.filter(
  (p) => CONSUMER_VERTICALS.includes(p.vertical) && p.status === "active" && p.isAvailable
)

function countByVertical(vertical: string) {
  return ALL_ACTIVE.filter((p) => p.vertical === vertical).length
}

export default function MarketplaceHome() {
  const nav = useNavigate()
  const location = useLocation()
  const featuredRef = useRef<HTMLDivElement>(null)
  const cartItemCount = useMarketplaceCartStore((s) => (s.items ?? []).reduce((sum, i) => sum + i.quantity, 0))
  const consumerCategories = MARKETPLACE_CATEGORIES.filter((c) => CONSUMER_VERTICALS.includes(c.vertical))

  const featuredProducts = useMemo(() => {
    return ALL_ACTIVE.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 8)
  }, [])

  const recentProducts = useMemo(() => {
    return [...ALL_ACTIVE]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
  }, [])

  const topCategories = useMemo(() => {
    return consumerCategories
      .map((cat) => ({ ...cat, count: countByVertical(cat.vertical) }))
      .sort((a, b) => b.count - a.count)
  }, [])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
    if (diff === 0) return "Aujourd'hui"
    if (diff === 1) return "Hier"
    if (diff < 7) return `Il y a ${diff} jours`
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  const cartButton = (
    <button onClick={() => nav("/marketplace/cart", { state: { from: location.pathname + location.search } })}
      className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 cursor-pointer active:scale-90 transition-transform">
      <ShoppingCart className="w-4.5 h-4.5 text-cm-text" />
      {cartItemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-cm-error text-white text-[9px] font-bold rounded-full px-1">
          {cartItemCount > 9 ? "9+" : cartItemCount}
        </span>
      )}
    </button>
  )

  const vendreButton = (
    <button onClick={() => nav("/marketplace/register")}
      className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-cm-text text-white text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-[#2A2A2A]">
      <Plus className="w-3.5 h-3.5" />
      Vendre
    </button>
  )

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg pb-8">
      <PageHeader title="Marketplace" fallbackRoute="/" rightAction={<div className="flex items-center gap-1.5">{cartButton}{vendreButton}</div>} />

      <div className="px-4 pt-3 pb-2">
        <button onClick={() => nav("/catalog")}
          className="flex items-center gap-2 w-full h-11 px-4 rounded-xl bg-gray-50 border border-cm-border text-[13px] text-cm-text-muted cursor-pointer hover:border-gray-300 transition-colors">
          <Search className="w-4 h-4" />
          <span>Rechercher dans le marketplace...</span>
        </button>

        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-cm-text-soft shrink-0 font-medium">{ALL_ACTIVE.length} annonces</span>
          <div className="h-3 w-px bg-gray-200 shrink-0" />
          <button onClick={() => nav("/catalog", { state: { from: location.pathname + location.search } })}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cm-accent/20 text-cm-forest text-[11px] font-bold cursor-pointer active:scale-95 transition-transform shrink-0">
            <Store className="w-3 h-3" />
            Pro Supply
          </button>
        </div>
      </div>

      {featuredProducts.length > 0 && (
        <div className="pt-5">
          <div className="flex items-center gap-1.5 px-5 mb-3">
            <Sparkles className="w-4 h-4 text-cm-text" />
            <h2 className="text-sm font-bold text-cm-text">En promotion</h2>
          </div>
          <div ref={featuredRef} className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1">
            {featuredProducts.map((product, i) => (
              <div key={product.id} className="shrink-0 w-36">
                <CatalogProductCard product={product} index={i} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 pt-6">
        <h2 className="text-sm font-bold text-cm-text mb-3">Catégories</h2>
        <div className="grid grid-cols-3 gap-3">
          {topCategories.map((cat) => {
            const count = countByVertical(cat.vertical)
            return (
              <motion.button key={cat.id} whileTap={{ scale: 0.95 }}
                onClick={() => nav(`/marketplace/browse/${cat.vertical}`)}
                className="rounded-2xl overflow-hidden relative cursor-pointer text-left bg-cm-elevated border border-cm-border"
              >
                <div className={`aspect-square p-3 flex flex-col justify-between bg-gradient-to-br ${VERTICAL_GRADIENTS[cat.vertical] || "from-gray-100"}`}>
                  <div className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center text-lg">
                    <span className="text-xl">{cat.vertical === "shopping" ? "🛍️" : cat.vertical === "second_hand" ? "🔄" : "🏠"}</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-cm-text leading-tight">{cat.name}</p>
                    <p className="text-[9px] text-cm-text-soft mt-0.5">{count} article{count !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 -mx-5 px-5 pb-1">
          {topCategories.flatMap((cat) =>
            cat.children.slice(0, 3).map((sub) => (
              <button key={sub.id} onClick={() => nav(`/marketplace/browse/${cat.vertical}`)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-cm-elevated border border-cm-border text-[11px] font-medium text-cm-text-soft cursor-pointer hover:border-gray-300 transition-colors">
                {sub.name}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cm-text" />
            <h2 className="text-sm font-bold text-cm-text">Populaires</h2>
          </div>
          <button onClick={() => nav("/marketplace/browse/toutes")}
            className="flex items-center gap-0.5 text-[11px] font-semibold text-cm-text-soft cursor-pointer hover:text-cm-text transition-colors">
            Voir tout <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ALL_ACTIVE.sort((a, b) => (b.originalPrice ? b.originalPrice - b.price : 0) - (a.originalPrice ? a.originalPrice - a.price : 0))
            .slice(0, 4)
            .map((product, i) => (
              <CatalogProductCard key={product.id} product={product} index={i} />
            ))}
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-cm-text">Annonces récentes</h2>
          <button onClick={() => nav("/marketplace/browse/toutes")}
            className="flex items-center gap-0.5 text-[11px] font-semibold text-cm-text-soft cursor-pointer hover:text-cm-text transition-colors">
            Voir tout <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {recentProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-[13px] text-cm-text-soft">Aucune annonce pour le moment</p>
            <button onClick={() => nav("/marketplace/register")}
              className="mt-3 h-10 px-5 rounded-xl bg-cm-text text-white text-xs font-bold cursor-pointer active:scale-[0.98] transition-transform">
              Publier une annonce
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentProducts.map((product, i) => (
              <CatalogProductCard key={product.id} product={product} index={i} horizontal />
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pt-6 space-y-3">
        <div className="rounded-2xl bg-gradient-to-br from-cm-forest to-[#3a5a2a] p-5">
          <h3 className="text-base font-bold text-white">Vous avez des articles à vendre ?</h3>
          <p className="text-xs text-white/70 mt-1">Créez votre boutique et vendez facilement sur Ça Match.</p>
          <button onClick={() => nav("/marketplace/register")}
            className="mt-3 h-10 px-5 rounded-xl bg-cm-elevated text-cm-forest text-xs font-bold cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-50">
            Commencer à vendre
          </button>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 p-5">
          <h3 className="text-base font-bold text-white">Vous êtes un fournisseur professionnel ?</h3>
          <p className="text-xs text-white/70 mt-1">Proposez vos matériaux et équipements aux professionnels de Ça Match.</p>
          <button onClick={() => nav("/supplier/register")}
            className="mt-3 h-10 px-5 rounded-xl bg-cm-elevated text-amber-700 text-xs font-bold cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-50">
            Devenir fournisseur
          </button>
        </div>
      </div>
    </div>
  )
}
