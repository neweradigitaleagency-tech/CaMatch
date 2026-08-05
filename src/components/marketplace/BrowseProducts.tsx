import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useParams, useSearchParams, useLocation } from "react-router-dom"
import { motion } from "motion/react"
import { Search, Package, MapPin, SlidersHorizontal, X, ChevronDown } from "lucide-react"
import { useAppNavigation } from "../../navigation/useAppNavigation"
import { MARKETPLACE_PRODUCTS } from "../../data/marketplaceProducts"
import { getCategoryById } from "../../data/marketplaceCategories"
import type { Product } from "../../types/marketplace"
import BottomSheet from "../BottomSheet"
import EmptyState from "../ui/EmptyState"

const ITEMS_PER_PAGE = 8

const SORT_OPTIONS = [
  { value: "recent", label: "Récent" },
  { value: "price_asc", label: "Prix ↑" },
  { value: "price_desc", label: "Prix ↓" },
] as const

type SortKey = (typeof SORT_OPTIONS)[number]["value"]

const CONDITION_LABELS: Record<string, string> = {
  like_new: "Comme neuf",
  good: "Bon état",
  fair: "État correct",
}

const CONDITION_COLORS: Record<string, string> = {
  like_new: "bg-green-100 text-green-700 border-green-200",
  good: "bg-blue-100 text-blue-700 border-blue-200",
  fair: "bg-amber-100 text-amber-700 border-amber-200",
}

const LOCATIONS: string[] = [...new Set(MARKETPLACE_PRODUCTS.map((p) => (p.location.split(",")[0] || "").trim()))].sort()

const CONSUMER_VERTICALS = ["shopping", "second_hand", "real_estate"]

function parseSearchParams(sp: URLSearchParams) {
  return {
    q: sp.get("q") || "",
    sort: (sp.get("sort") || "recent") as SortKey,
    min: sp.get("min") || "",
    max: sp.get("max") || "",
    cond: sp.get("cond") || "",
    loc: sp.get("loc") || "",
  }
}

function getSuggestions(filtered: Product[], allProducts: Product[]): Product[] {
  if (filtered.length > 0) return []
  const used = new Set(filtered.map((p) => p.id))
  return allProducts.filter((p) => !used.has(p.id)).slice(0, 4)
}

export default function BrowseProducts() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { navigate: nav } = useAppNavigation()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useMemo(() => parseSearchParams(searchParams), [searchParams])

  const [searchQuery, setSearchQuery] = useState(params.q)
  const [showSort, setShowSort] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const [localMin, setLocalMin] = useState(params.min)
  const [localMax, setLocalMax] = useState(params.max)
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalMin(params.min)
    setLocalMax(params.max)
  }, [params.min, params.max])

  const updateParam = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value && value !== "all") next.set(key, value)
      else next.delete(key)
      return next
    }, { replace: true })
    setVisibleCount(ITEMS_PER_PAGE)
  }, [setSearchParams])

  const updatePriceParam = useCallback((key: string, value: string) => {
    if (priceTimer.current) clearTimeout(priceTimer.current)
    priceTimer.current = setTimeout(() => {
      updateParam(key, value)
    }, 300)
  }, [updateParam])

  const oldCategory = getCategoryById(categoryId || "")

  const allProducts = useMemo(() => {
    let result = [...MARKETPLACE_PRODUCTS]
    result = result.filter((p) => CONSUMER_VERTICALS.includes(p.vertical) && p.status === "active" && p.isAvailable)
    if (oldCategory) {
      const slugs = new Set(oldCategory.children.map((c) => c.slug))
      result = result.filter((p) => slugs.has(p.subcategory) || slugs.has(p.category.toLowerCase().replace(/\s+/g, "-")))
    }
    return result
  }, [oldCategory])

  const filtered = useMemo(() => {
    let result = [...allProducts]

    if (params.q) {
      const q = params.q.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }

    if (params.min) { const min = Number(params.min); if (!isNaN(min)) result = result.filter((p) => p.price >= min) }
    if (params.max) { const max = Number(params.max); if (!isNaN(max)) result = result.filter((p) => p.price <= max) }

    if (params.cond) {
      result = result.filter((p) => "condition" in p && (p as { condition: string }).condition === params.cond)
    }

    if (params.loc) {
      result = result.filter((p) => p.location.toLowerCase().includes(params.loc.toLowerCase()))
    }

    switch (params.sort) {
      case "price_asc": result.sort((a, b) => a.price - b.price); break
      case "price_desc": result.sort((a, b) => b.price - a.price); break
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break
    }

    return result
  }, [allProducts, params])

  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])
  const hasMore = visibleCount < filtered.length
  const hasActiveFilters = params.min || params.max || params.cond || params.loc
  const activeFilterCount = [params.min || params.max, params.cond, params.loc].filter(Boolean).length
  const suggestions = useMemo(() => getSuggestions(filtered, allProducts), [filtered, allProducts])

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
    setSearchQuery("")
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    updateParam("q", val)
  }

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg pb-8">
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="h1-cm text-cm-text">Tous les articles</h1>
          <p className="text-[10px] text-cm-text-soft mt-0.5">Marché Ça Match</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFilterOpen(true)}
            className={`relative h-9 px-3 rounded-xl border cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 ${
              hasActiveFilters ? "bg-cm-text text-white border-cm-text" : "bg-cm-elevated text-cm-text-soft border-cm-border"
            }`}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Filtres</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cm-accent text-cm-forest text-[8px] font-bold flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="px-5 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-soft pointer-events-none" />
          <input type="text" value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher dans cette catégorie..."
            className="w-full h-10 pl-9 pr-4 text-[13px] bg-cm-surface border border-cm-border rounded-xl outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-forest focus:bg-cm-elevated transition-all" />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-5 pb-3 pt-2">
          {(params.min || params.max) && (
            <span className="shrink-0 flex items-center gap-1 px-2 py-1 bg-cm-surface text-cm-text rounded-full text-[9px] font-semibold">
              {params.min ? `${Number(params.min).toLocaleString("fr-FR")} F` : "0"} — {params.max ? `${Number(params.max).toLocaleString("fr-FR")} F` : "∞"}
              <button onClick={() => { updateParam("min", ""); updateParam("max", "") }} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
            </span>
          )}
          {params.cond && (
            <span className="shrink-0 flex items-center gap-1 px-2 py-1 bg-cm-surface text-cm-text rounded-full text-[9px] font-semibold">
              {CONDITION_LABELS[params.cond]}
              <button onClick={() => updateParam("cond", "")} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
            </span>
          )}
          {params.loc && (
            <span className="shrink-0 flex items-center gap-1 px-2 py-1 bg-cm-surface text-cm-text rounded-full text-[9px] font-semibold">
              <MapPin className="w-2.5 h-2.5" /> {params.loc}
              <button onClick={() => updateParam("loc", "")} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-5 pb-3">
        <span className="text-[11px] text-cm-text-soft">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
        <div className="relative">
          <button onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-cm-surface border border-cm-border rounded-lg text-[11px] font-medium text-cm-text-soft cursor-pointer hover:bg-cm-surface transition-colors">
            <SlidersHorizontal className="w-3 h-3" />
            {SORT_OPTIONS.find((o) => o.value === params.sort)?.label}
          </button>
          {showSort && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-cm-elevated border border-cm-border rounded-xl shadow-lg overflow-hidden min-w-[140px]">
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { updateParam("sort", opt.value); setShowSort(false) }}
                    className={`w-full text-left px-4 py-2.5 text-[12px] cursor-pointer hover:bg-cm-surface transition-colors ${
                      params.sort === opt.value ? "text-cm-forest font-semibold bg-cm-surface" : "text-cm-text"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-5 pt-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucune annonce trouvée"
            description="Essayez de modifier votre recherche ou vos filtres"
            compact
            action={
              hasActiveFilters
                ? { label: "Réinitialiser les filtres", onClick: clearFilters }
                : undefined
            }
          >
            {suggestions.length > 0 && (
              <div className="mt-8 w-full max-w-lg px-2 text-left">
                <p className="text-[13px] font-bold text-cm-text mb-3">Vous aimerez aussi</p>
                <div className="grid grid-cols-2 gap-3">
                  {suggestions.map((product, i) => (
                    <button key={product.id} onClick={() => nav(`/marketplace/item/${product.id}`)}
                      className="text-left bg-cm-elevated rounded-xl overflow-hidden border border-cm-border cursor-pointer active:scale-[0.98] transition-transform hover:border-cm-border">
                      <div className="aspect-square bg-cm-surface">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-cm-text-muted" /></div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <h3 className="text-[11px] font-semibold text-cm-text line-clamp-2 leading-tight">{product.name}</h3>
                        <p className="text-[13px] font-bold text-cm-text mt-0.5">{product.price.toLocaleString("fr-FR")} F</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </EmptyState>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {visibleProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} onClick={() => nav(`/marketplace/item/${product.id}${location.search}`)} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-5">
                <button onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                  className="h-10 px-6 rounded-xl bg-cm-elevated border border-cm-border text-[12px] font-semibold text-cm-text cursor-pointer hover:border-cm-border active:scale-[0.98] transition-all flex items-center gap-1.5">
                  <ChevronDown className="w-4 h-4" />
                  Afficher plus ({filtered.length - visibleCount} restant{(filtered.length - visibleCount) > 1 ? "s" : ""})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filtres">
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-cm-text mb-2">Prix</p>
          <div className="flex items-center gap-2">
            <input type="number" value={localMin} onChange={(e) => { setLocalMin(e.target.value); updatePriceParam("min", e.target.value) }}
              placeholder="Min" className="w-full h-10 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-forest" />
            <span className="text-[11px] text-cm-text-soft">→</span>
            <input type="number" value={localMax} onChange={(e) => { setLocalMax(e.target.value); updatePriceParam("max", e.target.value) }}
              placeholder="Max" className="w-full h-10 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-forest" />
          </div>
        </div>
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-cm-text mb-2">État</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {Object.entries(CONDITION_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => updateParam("cond", params.cond === key ? "" : key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-all ${
                  params.cond === key ? CONDITION_COLORS[key] : "bg-cm-surface text-cm-text-soft border-cm-border"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-cm-text mb-2">Localisation</p>
          <div className="flex gap-1.5 flex-wrap">
            {LOCATIONS.slice(0, 8).map((loc) => (
              <button key={loc} onClick={() => updateParam("loc", params.loc === loc ? "" : loc)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-all ${
                  params.loc === loc ? "bg-cm-forest text-white border-cm-forest" : "bg-cm-surface text-cm-text-soft border-cm-border"
                }`}>
                {loc}
              </button>
            ))}
          </div>
        </div>
        <button onClick={clearFilters}
          className="w-full h-10 rounded-xl bg-cm-surface text-[12px] font-medium text-cm-text-soft cursor-pointer hover:bg-cm-border transition-colors">
          Réinitialiser les filtres
        </button>
      </BottomSheet>
    </div>
  )
}

function ProductCard({ product, index, onClick }: { product: Product; index: number; onClick: () => void }) {
  const formatPrice = (price: number) => price.toLocaleString("fr-FR") + " F"
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
    if (diff === 0) return "Aujourd'hui"
    if (diff === 1) return "Hier"
    if (diff < 7) return `Il y a ${diff} jours`
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }
  const condition = "condition" in product ? (product as { condition: string }).condition : null

  return (
    <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      className="text-left bg-cm-elevated rounded-xl overflow-hidden border border-cm-border cursor-pointer active:scale-[0.98] transition-transform hover:border-cm-border">
      <div className="relative aspect-square bg-cm-surface">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-cm-text-muted" /></div>
        )}
        {product.originalPrice && (
          <div className="absolute top-2 left-2 bg-cm-error text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-[12px] font-semibold text-cm-text line-clamp-2 leading-tight">{product.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[14px] font-bold text-cm-text">{formatPrice(product.price)}</span>
          {product.originalPrice && <span className="text-[10px] text-cm-text-muted line-through">{formatPrice(product.originalPrice)}</span>}
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-cm-text-soft">
          {condition && (
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold leading-tight ${
              condition === "like_new" ? "bg-green-100 text-green-700" :
              condition === "good" ? "bg-blue-100 text-blue-700" :
              condition === "fair" ? "bg-amber-100 text-amber-700" : "bg-cm-surface text-cm-text-soft"
            }`}>
              {condition === "like_new" ? "Comme neuf" : condition === "good" ? "Bon état" : "État correct"}
            </span>
          )}
          <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{product.location.split(",")[0]}</span>
          <span className="ml-auto">{formatDate(product.createdAt)}</span>
        </div>
      </div>
    </motion.button>
  )
}
