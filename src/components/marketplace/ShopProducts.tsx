import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { ChevronDown, AlertTriangle } from "lucide-react"
import { useAppNavigation } from "../../navigation/useAppNavigation"
import type { Product } from "../../types/marketplace"
import { useMarketplaceViewStore } from "../../stores/marketplaceViewStore"

interface ShopProductsProps {
  products: Product[]
}

type SortKey = "popular" | "price_asc" | "price_desc" | "name"

const SORT_LABELS: Record<SortKey, string> = {
  popular: "Populaire",
  price_asc: "Prix ↑",
  price_desc: "Prix ↓",
  name: "Nom A-Z",
}

export default function ShopProducts({ products }: ShopProductsProps) {
  const { navigate: nav } = useAppNavigation()
  const { activeCategory, sort, setActiveCategory, setSort } = useMarketplaceViewStore()
  const [showSort, setShowSort] = useState(false)

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category))
    return ["all", ...Array.from(cats)]
  }, [products])

  const filtered = useMemo(() => {
    let result = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory)
    const available = result.filter((p) => p.isAvailable)
    const unavailable = result.filter((p) => !p.isAvailable)

    const sortFn = (a: Product, b: Product) => {
      switch (sort) {
        case "price_asc": return a.price - b.price
        case "price_desc": return b.price - a.price
        case "name": return a.name.localeCompare(b.name)
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    }
    available.sort(sortFn)
    unavailable.sort(sortFn)
    return [...available, ...unavailable]
  }, [products, activeCategory, sort])

  const formatPrice = (price: number) => price.toLocaleString("fr-FR") + " FCFA"

  if (products.length === 0) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-cm-text-muted">Aucun produit disponible</p>
      </div>
    )
  }

  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5 flex-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-cm-text text-white"
                  : "bg-cm-surface text-cm-text-muted hover:bg-cm-border-soft"
              }`}
            >
              {cat === "all" ? "Tous" : cat}
            </button>
          ))}
        </div>
        <div className="relative ml-2">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cm-surface text-[11px] font-semibold text-cm-text-muted cursor-pointer hover:bg-cm-border-soft transition-colors"
          >
            {SORT_LABELS[sort]}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showSort && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-cm-elevated rounded-xl shadow-lg border border-cm-border py-1 min-w-[140px]">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => { setSort(k); setShowSort(false) }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium cursor-pointer hover:bg-cm-surface transition-colors ${
                      sort === k ? "text-cm-text bg-cm-surface" : "text-cm-text-muted"
                    }`}
                  >
                    {SORT_LABELS[k]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((product, i) => (
          <motion.button
            key={product.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={() => nav(`/marketplace/item/${product.id}`)}
            className="text-left bg-cm-elevated rounded-xl overflow-hidden border border-cm-border cursor-pointer active:scale-[0.98] transition-transform hover:border-cm-border-soft"
          >
            <div className="relative aspect-square bg-cm-surface">
              {product.images[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl text-cm-border-soft">📦</span>
                </div>
              )}
              {!product.isAvailable && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded-full">Rupture</span>
                </div>
              )}
              {product.originalPrice && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              )}
            </div>
            <div className="p-2.5">
              <h3 className="text-[12px] font-semibold text-cm-text line-clamp-2 leading-tight">{product.name}</h3>
              <p className="text-[10px] text-cm-text-muted mt-0.5">{"brand" in product ? (product as { brand: string }).brand : ""}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[13px] font-bold text-cm-text">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-[10px] text-cm-text-muted line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              {"stock" in product && product.stock <= 5 && product.stock > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span className="text-[9px] text-amber-600 font-medium">Plus que {product.stock}</span>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
