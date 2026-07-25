import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useNavigate, useSearchParams, useLocation } from "react-router-dom"
import { Search, Filter, Store, Package, SlidersHorizontal, X, ChevronDown, MapPin, ShoppingCart, Sparkles, Award } from "lucide-react"
import PageHeader from "../components/ui/PageHeader"
import { useMarketplaceCartStore } from "../stores/marketplaceCartStore"
import type { MarketplaceVertical, Product } from "../types/marketplace"
import { PROFESSIONAL_SELLERS } from "../data/marketplaceSuppliers"
import { MARKETPLACE_PRODUCTS, searchProducts } from "../data/marketplaceProducts"
import CatalogSupplierCard from "../components/marketplace/CatalogSupplierCard"
import CatalogProductCard from "../components/marketplace/CatalogProductCard"
import Breadcrumbs from "../components/ui/Breadcrumbs"
import BottomSheet from "../components/BottomSheet"

const ITEMS_PER_PAGE = 10

function getSuggestions(filtered: Product[], pool: Product[]): Product[] {
  if (filtered.length > 0) return []
  const used = new Set(filtered.map((p) => p.id))
  return pool.filter((p) => !used.has(p.id)).slice(0, 4)
}

type VerticalFilter = MarketplaceVertical | "all"

const VERTICAL_TABS: { value: VerticalFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "pro_supply", label: "Pro Supply" },
  { value: "shopping", label: "Shopping" },
  { value: "second_hand", label: "Seconde main" },
  { value: "real_estate", label: "Immobilier" },
]

const SORT_OPTIONS = [
  { value: "relevance", label: "Pertinence" },
  { value: "price_asc", label: "Prix ↑" },
  { value: "price_desc", label: "Prix ↓" },
  { value: "newest", label: "Plus récent" },
] as const

type SortKey = (typeof SORT_OPTIONS)[number]["value"]

const CONDITION_LABELS: Record<string, string> = {
  like_new: "Comme neuf",
  good: "Bon état",
  fair: "État correct",
}

const LOCATIONS: string[] = [...new Set(MARKETPLACE_PRODUCTS.map((p) => (p.location.split(",")[0] || "").trim()))].sort()

function parseSearchParams(sp: URLSearchParams) {
  return {
    q: sp.get("q") || "",
    vert: (sp.get("vert") || "all") as VerticalFilter,
    sort: (sp.get("sort") || "relevance") as SortKey,
    min: sp.get("min") || "",
    max: sp.get("max") || "",
    cond: sp.get("cond") || "",
    loc: sp.get("loc") || "",
  }
}

function SupplierCardSkeleton() {
  return (
    <div className="bg-cm-elevated border border-cm-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-14 bg-gray-200/50" />
      <div className="px-4 -mt-7 pb-3">
        <div className="flex items-end gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gray-200/50 border-2 border-white" />
          <div className="flex-1 pb-0.5 space-y-2">
            <div className="h-4 bg-gray-200/50 rounded w-3/4" />
            <div className="h-3 bg-gray-200/50 rounded w-1/2" />
          </div>
        </div>
        <div className="flex gap-1.5 mb-3">
          <div className="h-5 bg-gray-200/50 rounded-full w-16" />
          <div className="h-5 bg-gray-200/50 rounded-full w-20" />
        </div>
        <div className="pt-2.5 border-t border-cm-border/50">
          <div className="h-3 bg-gray-200/50 rounded w-2/3" />
        </div>
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="bg-cm-elevated border border-cm-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200/50" />
      <div className="p-2.5 space-y-2">
        <div className="h-3 bg-gray-200/50 rounded w-full" />
        <div className="h-3 bg-gray-200/50 rounded w-2/3" />
        <div className="h-4 bg-gray-200/50 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function CatalogPage() {
  const nav = useNavigate()
  const location = useLocation()
  const cartCount = useMarketplaceCartStore((s) => (s.items ?? []).reduce((sum, i) => sum + i.quantity, 0))
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useMemo(() => parseSearchParams(searchParams), [searchParams])

  const [query, setQuery] = useState(params.q)
  const [debouncedQuery, setDebouncedQuery] = useState(params.q)
  const [showSort, setShowSort] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [loading, setLoading] = useState(true)

  const [localMin, setLocalMin] = useState(params.min)
  const [localMax, setLocalMax] = useState(params.max)
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalMin(params.min)
    setLocalMax(params.max)
  }, [params.min, params.max])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  const updateParam = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value && value !== "all") next.set(key, value)
      else next.delete(key)
      return next
    })
    setVisibleCount(ITEMS_PER_PAGE)
  }, [setSearchParams])

  const updatePriceParam = useCallback((key: string, value: string) => {
    if (priceTimer.current) clearTimeout(priceTimer.current)
    priceTimer.current = setTimeout(() => {
      updateParam(key, value)
    }, 300)
  }, [updateParam])

  const handleSearch = (val: string) => {
    setQuery(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setDebouncedQuery(val)
      updateParam("q", val)
    }, 300)
  }

  const hasActiveFilters = params.min || params.max || params.cond || params.loc
  const activeFilterCount = [params.min || params.max, params.cond, params.loc].filter(Boolean).length

  const clearFilters = () => {
    const vert = params.vert
    setSearchParams(new URLSearchParams(vert && vert !== "all" ? { vert } : {}))
    setQuery("")
    setDebouncedQuery("")
  }

  const isProSupply = params.vert === "all" || params.vert === "pro_supply"

  const filteredSuppliers = useMemo(() => {
    const active = PROFESSIONAL_SELLERS.filter((s) => s.verificationStatus === "active")
    if (params.vert === "all") return active
    return active.filter((s) => s.verticals.includes(params.vert as never))
  }, [params.vert])

  const featuredSuppliers = useMemo(() => {
    return filteredSuppliers
      .filter((s) => s.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
  }, [filteredSuppliers])

  const filteredProducts = useMemo(() => {
    if (debouncedQuery) {
      const searched = searchProducts(debouncedQuery)
      if (params.vert === "all") return searched
      return searched.filter((p) => p.vertical === params.vert)
    }

    let result = [...MARKETPLACE_PRODUCTS]
    if (params.vert !== "all") result = result.filter((p) => p.vertical === params.vert)

    if (params.min) { const min = Number(params.min); if (!isNaN(min)) result = result.filter((p) => p.price >= min) }
    if (params.max) { const max = Number(params.max); if (!isNaN(max)) result = result.filter((p) => p.price <= max) }
    if (params.cond) { result = result.filter((p) => "condition" in p && (p as { condition: string }).condition === params.cond) }
    if (params.loc) { result = result.filter((p) => p.location.toLowerCase().includes(params.loc.toLowerCase())) }

    switch (params.sort) {
      case "price_asc": result.sort((a, b) => a.price - b.price); break
      case "price_desc": result.sort((a, b) => b.price - a.price); break
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break
      default: result.sort((a, b) => (b.originalPrice ? b.originalPrice - b.price : 0) - (a.originalPrice ? a.originalPrice - a.price : 0)); break
    }
    return result
  }, [debouncedQuery, params, params.vert, params.sort, params.min, params.max, params.cond, params.loc])

  const promotedProducts = useMemo(() => {
    return filteredProducts.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 6)
  }, [filteredProducts])

  const visibleProducts = useMemo(() => {
    if (debouncedQuery) return filteredProducts.slice(0, visibleCount)
    const promotedIds = new Set(promotedProducts.map((p) => p.id))
    const rest = filteredProducts.filter((p) => !promotedIds.has(p.id))
    return rest.slice(0, visibleCount)
  }, [filteredProducts, promotedProducts, visibleCount, debouncedQuery])

  const hasMore = visibleCount < filteredProducts.length - (debouncedQuery ? 0 : promotedProducts.length)
  const suggestions = useMemo(() => getSuggestions(filteredProducts, MARKETPLACE_PRODUCTS), [filteredProducts])

  const supplierProductCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of MARKETPLACE_PRODUCTS) {
      const sid = "supplierId" in p ? (p as { supplierId: string }).supplierId : p.sellerId
      counts[sid] = (counts[sid] || 0) + 1
    }
    return counts
  }, [])

  const showCondition = params.vert === "all" || params.vert === "second_hand"

  const cartButton = (
    <div className="relative shrink-0">
      <button onClick={() => nav("/marketplace/cart", { state: { from: location.pathname + location.search } })}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-cm-elevated cursor-pointer active:scale-90 transition-transform touch-min" aria-label="Panier">
        <ShoppingCart className="w-5 h-5 text-cm-text" />
      </button>
      {cartCount > 0 && (
        <span className="absolute top-0 right-0 min-w-[18px] h-[18px] flex items-center justify-center bg-cm-error text-white text-[9px] font-bold rounded-full px-1 pointer-events-none">
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      )}
    </div>
  )

  return (
    <div className="min-h-dynamic bg-cm-bg pb-8">
      <PageHeader title="Pro Supply" fallbackRoute="/marketplace" rightAction={cartButton} />

      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted pointer-events-none" />
          <input type="text"
            className="w-full h-11 pl-9 pr-4 text-[13px] bg-cm-elevated border border-cm-border rounded-xl outline-none transition-all text-cm-text placeholder:text-cm-text-muted focus:border-cm-forest"
            placeholder="Rechercher un produit ou une boutique..."
            value={query} onChange={(e) => handleSearch(e.target.value)} />
        </div>

        <div className="mt-2">
          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar -mx-4 px-4">
          {VERTICAL_TABS.map((tab) => (
            <button key={tab.value} onClick={() => updateParam("vert", tab.value)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer touch-min ${
                params.vert === tab.value ? "bg-cm-text text-white" : "bg-cm-elevated text-cm-text-soft border border-cm-border hover:border-cm-text-muted"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-cm-elevated border border-cm-border rounded-lg text-[11px] font-medium text-cm-text-soft cursor-pointer touch-min">
              <SlidersHorizontal className="w-3 h-3" />{SORT_OPTIONS.find((o) => o.value === params.sort)?.label}
            </button>
            <button onClick={() => setFilterOpen(true)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border cursor-pointer touch-min ${
                hasActiveFilters ? "bg-cm-text text-white border-cm-text" : "bg-cm-elevated text-cm-text-soft border-cm-border"
              }`}>
              <Filter className="w-3 h-3" />Filtres
              {activeFilterCount > 0 && (
                <span className="w-3.5 h-3.5 rounded-full bg-cm-accent text-cm-forest text-[9px] font-bold flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>
          <span className="text-[11px] text-cm-text-soft w-full xs:w-auto">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}
            {filteredSuppliers.length > 0 && ` · ${filteredSuppliers.length} boutique${filteredSuppliers.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {showSort && (
          <div className="relative z-20 mt-1">
            <div className="absolute right-0 bg-cm-elevated border border-cm-border rounded-xl shadow-lg overflow-hidden min-w-[160px]">
              {SORT_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => { updateParam("sort", opt.value); setShowSort(false) }}
                  className={`w-full text-left px-4 py-2.5 text-[12px] cursor-pointer hover:bg-cm-surface transition-colors ${
                    params.sort === opt.value ? "text-cm-forest font-semibold bg-cm-surface" : "text-cm-text"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-2">
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
                <MapPin className="w-2.5 h-2.5" />{params.loc}
                <button onClick={() => updateParam("loc", "")} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-4">
        {!debouncedQuery && isProSupply && featuredSuppliers.length > 0 && (
          <div className="mb-4">
            <h2 className="h2-cm text-cm-text mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-cm-amber" /> Boutiques à la une
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 pr-8">
              {featuredSuppliers.map((s, i) => (
                <div key={s.id} className="shrink-0 w-[80vw] max-w-72">
                  <CatalogSupplierCard seller={s} productCount={supplierProductCounts[s.id] || 0} index={i} featured />
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredSuppliers.length > 0 && !debouncedQuery && (
          <div className="mb-4">
            <h2 className="h2-cm text-cm-text mb-4 flex items-center gap-2">
              <Store className="w-4 h-4" />Fournisseurs
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2.5">
                {[1, 2, 3, 4].map((i) => <SupplierCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2.5">
                {filteredSuppliers.map((s, i) => (
                  <CatalogSupplierCard key={s.id} seller={s} productCount={supplierProductCounts[s.id] || 0} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {!debouncedQuery && isProSupply && promotedProducts.length > 0 && (
          <div className="mb-4">
            <h2 className="h2-cm text-cm-text mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cm-accent" /> En promotion
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {promotedProducts.map((product, i) => (
                <div key={product.id} className="shrink-0 w-36">
                  <CatalogProductCard product={product} index={i} horizontal />
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="h2-cm text-cm-text mb-4 flex items-center gap-2">
          <Package className="w-4 h-4" />
          {debouncedQuery ? `Résultats pour "${debouncedQuery}"` : "Produits"}
        </h2>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-xl bg-cm-elevated border border-cm-border flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-cm-text-muted" />
            </div>
            <p className="text-[14px] font-bold text-cm-text mb-1">Aucun produit trouvé</p>
            <p className="text-[12px] text-cm-text-soft">Essayez de modifier vos filtres ou votre recherche</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-3 h-9 px-4 rounded-xl bg-cm-text text-white text-[11px] font-bold cursor-pointer touch-min">
                Réinitialiser les filtres
              </button>
            )}
            {suggestions.length > 0 && (
              <div className="mt-8 text-left">
                <p className="text-[13px] font-bold text-cm-text mb-3">Vous aimerez aussi</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestions.map((product, i) => (
                    <CatalogProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {loading ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2.5">
                {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2.5">
                {visibleProducts.map((product, i) => (
                  <CatalogProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
            {hasMore && (
              <div className="flex justify-center mt-5">
                <button onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                  className="h-10 px-6 rounded-xl bg-cm-elevated border border-cm-border text-[12px] font-semibold text-cm-text cursor-pointer hover:border-gray-300 active:scale-[0.98] transition-all flex items-center gap-1.5 touch-min">
                  <ChevronDown className="w-4 h-4" />
                  Afficher plus ({filteredProducts.length - visibleCount - (debouncedQuery ? 0 : promotedProducts.length)} restant{(filteredProducts.length - visibleCount - (debouncedQuery ? 0 : promotedProducts.length)) > 1 ? "s" : ""})
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
        {showCondition && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-cm-text mb-2">État</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => updateParam("cond", params.cond === key ? "" : key)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-all touch-min ${
                    params.cond === key
                      ? key === "like_new" ? "bg-green-100 text-green-700 border-green-200" : key === "good" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-cm-surface text-cm-text-soft border-cm-border"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-cm-text mb-2">Localisation</p>
          <div className="flex gap-1.5 flex-wrap">
            {LOCATIONS.slice(0, 8).map((loc) => (
              <button key={loc} onClick={() => updateParam("loc", params.loc === loc ? "" : loc)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-all touch-min ${
                  params.loc === loc ? "bg-cm-forest text-white border-cm-forest" : "bg-cm-surface text-cm-text-soft border-cm-border"
                }`}>
                {loc}
              </button>
            ))}
          </div>
        </div>
        <button onClick={clearFilters}
          className="w-full h-10 rounded-xl bg-cm-surface text-[12px] font-medium text-cm-text-soft cursor-pointer hover:bg-cm-border transition-colors touch-min">
          Réinitialiser les filtres
        </button>
      </BottomSheet>
    </div>
  )
}
