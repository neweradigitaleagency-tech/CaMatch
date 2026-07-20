import { useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useBackNavigation } from "../../hooks/useBackNavigation"
import { motion } from "motion/react"
import { Search, Package, MapPin, Store, Plus, ArrowRight, ArrowLeft, TrendingUp, Sparkles, ChevronRight } from "lucide-react"
import { MARKETPLACE_CATEGORIES } from "../../data/marketplaceCategories"
import { MARKETPLACE_PRODUCTS } from "../../data/marketplaceProducts"
import type { MarketplaceVertical, Product } from "../../types/marketplace"

const CONSUMER_VERTICALS: MarketplaceVertical[] = ["shopping", "second_hand", "real_estate"]

const VERTICAL_GRADIENTS: Record<string, string> = {
  shopping: "from-pink-500/20 to-rose-500/10",
  second_hand: "from-amber-500/20 to-yellow-500/10",
  real_estate: "from-blue-500/20 to-indigo-500/10",
}

const VERTICAL_IMAGES: Record<string, string> = {
  shopping: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200",
  second_hand: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200",
  real_estate: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200",
}

const ALL_ACTIVE = MARKETPLACE_PRODUCTS.filter(
  (p) => CONSUMER_VERTICALS.includes(p.vertical) && p.status === "active" && p.isAvailable
)

function countByVertical(vertical: string) {
  return ALL_ACTIVE.filter((p) => p.vertical === vertical).length
}

export default function MarketplaceHome() {
  const nav = useNavigate()
  const goBack = useBackNavigation("/")
  const featuredRef = useRef<HTMLDivElement>(null)
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

  const formatPrice = (price: number) => price.toLocaleString("fr-FR") + " F"

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
    if (diff === 0) return "Aujourd'hui"
    if (diff === 1) return "Hier"
    if (diff < 7) return `Il y a ${diff} jours`
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-[#EDE8DC] pb-8">
      <header className="bg-white px-5 pt-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={goBack}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0">
            <ArrowLeft className="w-4 h-4 text-[#1A1A1A]" />
          </button>
          <h1 className="text-xl font-extrabold text-[#1A1A1A]">Marketplace</h1>
          <div className="flex-1" />
          <button onClick={() => nav("/marketplace/register")}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#1A1A1A] text-white text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-[#2A2A2A]">
            <Plus className="w-3.5 h-3.5" />
            Vendre
          </button>
        </div>

        <button onClick={() => nav("/catalog")}
          className="flex items-center gap-2 w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-[13px] text-gray-400 cursor-pointer hover:border-gray-300 transition-colors">
          <Search className="w-4 h-4" />
          <span>Rechercher dans le marketplace...</span>
        </button>

        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-[#6B7280] shrink-0 font-medium">{ALL_ACTIVE.length} annonces</span>
          <div className="h-3 w-px bg-gray-200 shrink-0" />
          <button onClick={() => nav("/catalog")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#AECB2A]/20 text-[#243318] text-[11px] font-bold cursor-pointer active:scale-95 transition-transform shrink-0">
            <Store className="w-3 h-3" />
            Pro Supply
          </button>
        </div>
      </header>

      {featuredProducts.length > 0 && (
        <div className="pt-5">
          <div className="flex items-center gap-1.5 px-5 mb-3">
            <Sparkles className="w-4 h-4 text-[#1A1A1A]" />
            <h2 className="text-sm font-bold text-[#1A1A1A]">En promotion</h2>
          </div>
          <div ref={featuredRef} className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1">
            {featuredProducts.map((product) => (
              <motion.button key={product.id} whileTap={{ scale: 0.96 }}
                onClick={() => nav(`/marketplace/item/${product.id}`)}
                className="shrink-0 w-36 bg-white rounded-xl overflow-hidden border border-gray-100 cursor-pointer text-left active:scale-[0.98] transition-transform hover:border-gray-200">
                <div className="aspect-[4/3] bg-gray-50 relative">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>
                  )}
                  {product.originalPrice && (
                    <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-[11px] font-semibold text-[#1A1A1A] line-clamp-1">{product.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[12px] font-bold text-[#1A1A1A]">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-[9px] text-[#9CA3AF] line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 pt-6">
        <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">Catégories</h2>
        <div className="grid grid-cols-3 gap-3">
          {topCategories.map((cat) => {
            const count = countByVertical(cat.vertical)
            return (
              <motion.button key={cat.id} whileTap={{ scale: 0.95 }}
                onClick={() => nav(`/marketplace/browse/${cat.vertical}`)}
                className="rounded-2xl overflow-hidden relative cursor-pointer text-left bg-white border border-gray-100"
              >
                <div className={`aspect-square p-3 flex flex-col justify-between bg-gradient-to-br ${VERTICAL_GRADIENTS[cat.vertical] || "from-gray-100"}`}>
                  <div className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center text-lg">
                    <span className="text-xl">{cat.vertical === "shopping" ? "🛍️" : cat.vertical === "second_hand" ? "🔄" : "🏠"}</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#1A1A1A] leading-tight">{cat.name}</p>
                    <p className="text-[9px] text-[#6B7280] mt-0.5">{count} article{count !== 1 ? "s" : ""}</p>
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
                className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-[11px] font-medium text-[#6B7280] cursor-pointer hover:border-gray-300 transition-colors">
                {sub.name}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#1A1A1A]" />
            <h2 className="text-sm font-bold text-[#1A1A1A]">Populaires</h2>
          </div>
          <button onClick={() => nav("/marketplace/browse/toutes")}
            className="flex items-center gap-0.5 text-[11px] font-semibold text-[#6B7280] cursor-pointer hover:text-[#1A1A1A] transition-colors">
            Voir tout <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ALL_ACTIVE.sort((a, b) => (b.originalPrice ? b.originalPrice - b.price : 0) - (a.originalPrice ? a.originalPrice - a.price : 0))
            .slice(0, 4)
            .map((product, i) => (
              <motion.button key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                onClick={() => nav(`/marketplace/item/${product.id}`)}
                className="text-left bg-white rounded-xl overflow-hidden border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform hover:border-gray-200">
                <div className="aspect-square bg-gray-50">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="text-[11px] font-semibold text-[#1A1A1A] line-clamp-1">{product.name}</h3>
                  <p className="text-[13px] font-bold text-[#1A1A1A] mt-0.5">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-[9px] text-[#6B7280]">
                    <MapPin className="w-2.5 h-2.5" />
                    {product.location.split(",")[0]}
                  </div>
                </div>
              </motion.button>
            ))}
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[#1A1A1A]">Annonces récentes</h2>
          <button onClick={() => nav("/marketplace/browse/toutes")}
            className="flex items-center gap-0.5 text-[11px] font-semibold text-[#6B7280] cursor-pointer hover:text-[#1A1A1A] transition-colors">
            Voir tout <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {recentProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-[13px] text-[#6B7280]">Aucune annonce pour le moment</p>
            <button onClick={() => nav("/marketplace/register")}
              className="mt-3 h-10 px-5 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold cursor-pointer active:scale-[0.98] transition-transform">
              Publier une annonce
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentProducts.map((product, i) => (
              <motion.button key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={() => nav(`/marketplace/item/${product.id}`)}
                className="w-full flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer text-left active:scale-[0.99] transition-transform hover:border-gray-200">
                <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-[13px] font-semibold text-[#1A1A1A] line-clamp-1">{product.name}</h3>
                  <p className="text-[14px] font-bold text-[#1A1A1A] mt-0.5">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#6B7280]">
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{product.location.split(",")[0]}</span>
                    <span>{formatDate(product.createdAt)}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pt-6 space-y-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#243318] to-[#3a5a2a] p-5">
          <h3 className="text-base font-bold text-white">Vous avez des articles à vendre ?</h3>
          <p className="text-xs text-white/70 mt-1">Créez votre boutique et vendez facilement sur Ça Match.</p>
          <button onClick={() => nav("/marketplace/register")}
            className="mt-3 h-10 px-5 rounded-xl bg-white text-[#243318] text-xs font-bold cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-50">
            Commencer à vendre
          </button>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 p-5">
          <h3 className="text-base font-bold text-white">Vous êtes un fournisseur professionnel ?</h3>
          <p className="text-xs text-white/70 mt-1">Proposez vos matériaux et équipements aux professionnels de Ça Match.</p>
          <button onClick={() => nav("/supplier/register")}
            className="mt-3 h-10 px-5 rounded-xl bg-white text-amber-700 text-xs font-bold cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-50">
            Devenir fournisseur
          </button>
        </div>
      </div>
    </div>
  )
}
