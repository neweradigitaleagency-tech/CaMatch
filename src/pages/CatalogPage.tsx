import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useBackNavigation } from "../hooks/useBackNavigation"
import { Search, ArrowLeft, Filter, Store, Package, SlidersHorizontal, X, ChevronDown, MapPin } from "lucide-react"
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

export default function CatalogPage() {
  const nav = useNavigate()
  const goBack = useBackNavigation("/marketplace")
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useMemo(() => parseSearchParams(searchParams), [searchParams])

  const [query, setQuery] = useState(params.q)
  const [debouncedQuery, setDebouncedQuery] = useState(params.q)
  const [showSort, setShowSort] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const [localMin, setLocalMin] = useState(params.min)
  const [localMax, setLocalMax] = useState(params.max)
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const filteredSuppliers = useMemo(() => {
    const active = PROFESSIONAL_SELLERS.filter((s) => s.verificationStatus === "active")
    if (params.vert === "all") return active
    return active.filter((s) => s.verticals.includes(params.vert as never))
  }, [params.vert])

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

  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount])
  const hasMore = visibleCount < filteredProducts.length
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

  return (
    <div className="min-h-dynamic bg-[#EDE8DC] pb-8">
      <div className="sticky top-0 z-10 bg-[#EDE8DC]/90 backdrop-blur-xl border-b border-gray-200/40">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={goBack}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 cursor-pointer active:scale-95 shrink-0">
              <ArrowLeft className="w-4 h-4 text-[#1A1A1A]" />
            </button>
            <div>
              <h1 className="text-[15px] font-bold text-[#1A1A1A]">Catalogue</h1>
              <Breadcrumbs />
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
            <input type="text"
              className="w-full h-11 pl-9 pr-4 text-[13px] bg-white border border-gray-200 rounded-xl outline-none transition-all text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#243318]"
              placeholder="Rechercher un produit ou une boutique..."
              value={query} onChange={(e) => handleSearch(e.target.value)} />
          </div>

          <div className="flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {VERTICAL_TABS.map((tab) => (
              <button key={tab.value} onClick={() => updateParam("vert", tab.value)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  params.vert === tab.value ? "bg-[#1A1A1A] text-white" : "bg-white text-[#6B7280] border border-gray-200 hover:border-gray-300"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-medium text-[#6B7280] cursor-pointer">
                <SlidersHorizontal className="w-3 h-3" />{SORT_OPTIONS.find((o) => o.value === params.sort)?.label}
              </button>
              <button onClick={() => setFilterOpen(true)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border cursor-pointer ${
                  hasActiveFilters ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#6B7280] border-gray-200"
                }`}>
                <Filter className="w-3 h-3" />Filtres
                {activeFilterCount > 0 && (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#AECB2A] text-[#243318] text-[8px] font-bold flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              <span className="text-[11px] text-[#6B7280]">
                {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}
                {filteredSuppliers.length > 0 && ` · ${filteredSuppliers.length} boutique${filteredSuppliers.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>

          {showSort && (
            <div className="relative z-20 mt-1">
              <div className="absolute right-0 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden min-w-[160px]">
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { updateParam("sort", opt.value); setShowSort(false) }}
                    className={`w-full text-left px-4 py-2.5 text-[12px] cursor-pointer hover:bg-gray-50 transition-colors ${
                      params.sort === opt.value ? "text-[#243318] font-semibold bg-gray-50" : "text-[#1A1A1A]"
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
                <span className="shrink-0 flex items-center gap-1 px-2 py-1 bg-gray-100 text-[#1A1A1A] rounded-full text-[9px] font-semibold">
                  {params.min ? `${Number(params.min).toLocaleString("fr-FR")} F` : "0"} — {params.max ? `${Number(params.max).toLocaleString("fr-FR")} F` : "∞"}
                  <button onClick={() => { updateParam("min", ""); updateParam("max", "") }} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {params.cond && (
                <span className="shrink-0 flex items-center gap-1 px-2 py-1 bg-gray-100 text-[#1A1A1A] rounded-full text-[9px] font-semibold">
                  {CONDITION_LABELS[params.cond]}
                  <button onClick={() => updateParam("cond", "")} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {params.loc && (
                <span className="shrink-0 flex items-center gap-1 px-2 py-1 bg-gray-100 text-[#1A1A1A] rounded-full text-[9px] font-semibold">
                  <MapPin className="w-2.5 h-2.5" />{params.loc}
                  <button onClick={() => updateParam("loc", "")} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 mt-3">
        {filteredSuppliers.length > 0 && !debouncedQuery && (
          <div className="mb-5">
            <h2 className="text-[13px] font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
              <Store className="w-4 h-4" />Fournisseurs
            </h2>
            <div className="space-y-2">
              {filteredSuppliers.map((s, i) => (
                <CatalogSupplierCard key={s.id} seller={s} productCount={supplierProductCounts[s.id] || 0} index={i} />
              ))}
            </div>
          </div>
        )}

        <h2 className="text-[13px] font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
          <Package className="w-4 h-4" />
          {debouncedQuery ? `Résultats pour "${debouncedQuery}"` : "Produits"}
        </h2>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-[#9CA3AF]" />
            </div>
            <p className="text-[14px] font-bold text-[#1A1A1A] mb-1">Aucun produit trouvé</p>
            <p className="text-[12px] text-[#6B7280]">Essayez de modifier vos filtres ou votre recherche</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-3 h-9 px-4 rounded-xl bg-[#1A1A1A] text-white text-[11px] font-bold cursor-pointer">
                Réinitialiser les filtres
              </button>
            )}
            {suggestions.length > 0 && (
              <div className="mt-8 text-left">
                <p className="text-[13px] font-bold text-[#1A1A1A] mb-3">Vous aimerez aussi</p>
                <div className="grid grid-cols-2 gap-3">
                  {suggestions.map((product) => (
                    <button key={product.id} onClick={() => nav(`/marketplace/item/${product.id}`)}
                      className="text-left bg-white rounded-xl overflow-hidden border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform hover:border-gray-200">
                      <div className="aspect-square bg-gray-50">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <h3 className="text-[11px] font-semibold text-[#1A1A1A] line-clamp-2 leading-tight">{product.name}</h3>
                        <p className="text-[13px] font-bold text-[#1A1A1A] mt-0.5">{product.price.toLocaleString("fr-FR")} F</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {visibleProducts.map((product, i) => (
                <CatalogProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-5">
                <button onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                  className="h-10 px-6 rounded-xl bg-white border border-gray-200 text-[12px] font-semibold text-[#1A1A1A] cursor-pointer hover:border-gray-300 active:scale-[0.98] transition-all flex items-center gap-1.5">
                  <ChevronDown className="w-4 h-4" />
                  Afficher plus ({filteredProducts.length - visibleCount} restant{(filteredProducts.length - visibleCount) > 1 ? "s" : ""})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filtres">
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-[#1A1A1A] mb-2">Prix</p>
          <div className="flex items-center gap-2">
            <input type="number" value={localMin} onChange={(e) => { setLocalMin(e.target.value); updatePriceParam("min", e.target.value) }}
              placeholder="Min" className="w-full h-10 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#243318]" />
            <span className="text-[11px] text-[#6B7280]">→</span>
            <input type="number" value={localMax} onChange={(e) => { setLocalMax(e.target.value); updatePriceParam("max", e.target.value) }}
              placeholder="Max" className="w-full h-10 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#243318]" />
          </div>
        </div>
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-[#1A1A1A] mb-2">État</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {Object.entries(CONDITION_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => updateParam("cond", params.cond === key ? "" : key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-all ${
                  params.cond === key
                    ? key === "like_new" ? "bg-green-100 text-green-700 border-green-200" : key === "good" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-gray-50 text-[#6B7280] border-gray-200"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-[#1A1A1A] mb-2">Localisation</p>
          <div className="flex gap-1.5 flex-wrap">
            {LOCATIONS.slice(0, 8).map((loc) => (
              <button key={loc} onClick={() => updateParam("loc", params.loc === loc ? "" : loc)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-all ${
                  params.loc === loc ? "bg-[#243318] text-white border-[#243318]" : "bg-gray-50 text-[#6B7280] border-gray-200"
                }`}>
                {loc}
              </button>
            ))}
          </div>
        </div>
        <button onClick={clearFilters}
          className="w-full h-10 rounded-xl bg-gray-100 text-[12px] font-medium text-[#6B7280] cursor-pointer hover:bg-gray-200 transition-colors">
          Réinitialiser les filtres
        </button>
      </BottomSheet>
    </div>
  )
}
