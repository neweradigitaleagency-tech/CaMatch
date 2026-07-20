import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom"
import { motion } from "motion/react"
import { ArrowLeft, Search, Package, MapPin, SlidersHorizontal, X, ChevronRight, ChevronDown } from "lucide-react"
import { useBackNavigation } from "../../hooks/useBackNavigation"
import BottomSheet from "../BottomSheet"
import { MARKETPLACE_PRODUCTS } from "../../data/marketplaceProducts"
import { MARKETPLACE_CATEGORIES } from "../../data/marketplaceCategories"
import { VERTICAL_LABELS } from "../../types/marketplace"
import type { MarketplaceVertical, Product } from "../../types/marketplace"
import Breadcrumbs from "../ui/Breadcrumbs"

const ITEMS_PER_PAGE = 8

function getSuggestions(filtered: Product[], pool: Product[]): Product[] {
  if (filtered.length > 0) return []
  const used = new Set(filtered.map((p) => p.id))
  return pool.filter((p) => !used.has(p.id)).slice(0, 4)
}

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

const SUBCAT_ICONS: Record<string, string> = {
  telephones: "📱", meubles: "🪑", vetements: "👕", vehicules: "🚗", "equipements-divers": "🎮",
  electronique: "💻", "maison-decoration": "🏡", mode: "👗", beaute: "💄", "jeux-enfants": "🧸", automobile: "🔧", electromenager: "🧊",
  location: "🔑", vente: "🏠", airbnb: "🏡", terrains: "🌲", commerces: "🏢",
}

const LOCATIONS: string[] = [...new Set(MARKETPLACE_PRODUCTS.map((p) => (p.location.split(",")[0] || "").trim()))].sort()

function parseSearchParams(sp: URLSearchParams) {
  return {
    q: sp.get("q") || "",
    sub: sp.get("sub") || "all",
    sort: (sp.get("sort") || "recent") as SortKey,
    min: sp.get("min") || "",
    max: sp.get("max") || "",
    cond: sp.get("cond") || "",
    loc: sp.get("loc") || "",
  }
}

export default function CategoryExplore() {
  const { vertical } = useParams<{ vertical: string }>()
  const nav = useNavigate()
  const goBack = useBackNavigation("/marketplace")
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
    })
    setVisibleCount(ITEMS_PER_PAGE)
  }, [setSearchParams])

  const updatePriceParam = useCallback((key: string, value: string) => {
    if (priceTimer.current) clearTimeout(priceTimer.current)
    priceTimer.current = setTimeout(() => {
      updateParam(key, value)
    }, 300)
  }, [updateParam])

  const currentVertical = vertical && vertical !== "toutes" ? (vertical as MarketplaceVertical) : null
  const category = currentVertical ? MARKETPLACE_CATEGORIES.find((c) => c.vertical === currentVertical) : null
  const pageTitle = currentVertical ? (VERTICAL_LABELS[currentVertical] || category?.name || currentVertical) : "Toutes les annonces"

  const allProducts = useMemo(() => {
    let result = [...MARKETPLACE_PRODUCTS]
    if (currentVertical) result = result.filter((p) => p.vertical === currentVertical)
    return result.filter((p) => p.status === "active" && p.isAvailable)
  }, [currentVertical])

  const subcategories = useMemo(() => {
    if (!category) return []
    return [{ id: "all", name: "Toutes", parentId: "" }, ...category.children]
  }, [category])

  const filtered = useMemo(() => {
    let result = [...allProducts]

    if (params.sub !== "all" && category) {
      const sub = category.children.find((c) => c.id === params.sub)
      if (sub) result = result.filter((p) => p.subcategory === sub.slug || p.category === sub.slug)
    }

    if (params.q) {
      const q = params.q.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }

    if (params.min) {
      const min = Number(params.min)
      if (!isNaN(min)) result = result.filter((p) => p.price >= min)
    }
    if (params.max) {
      const max = Number(params.max)
      if (!isNaN(max)) result = result.filter((p) => p.price <= max)
    }

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
  }, [allProducts, params, category])

  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])
  const hasMore = visibleCount < filtered.length
  const suggestions = useMemo(() => getSuggestions(filtered, allProducts), [filtered, allProducts])

  const hasActiveFilters = params.sub !== "all" || params.min || params.max || params.cond || params.loc
  const activeFilterCount = [params.sub !== "all", params.min || params.max, params.cond, params.loc].filter(Boolean).length
  const isSecondHand = currentVertical === "second_hand"

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
    setSearchQuery("")
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    updateParam("q", val)
  }

  const handleSubChange = (id: string) => {
    updateParam("sub", id === "all" ? "" : id)
  }

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-[#EDE8DC] pb-8">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="px-5 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={goBack}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0">
              <ArrowLeft className="w-4 h-4 text-[#1A1A1A]" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[17px] font-extrabold text-[#1A1A1A]">{pageTitle}</h1>
              <Breadcrumbs />
            </div>
            <button onClick={() => setFilterOpen(true)}
              className={`relative h-9 px-3 rounded-xl border cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 ${
                hasActiveFilters ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#6B7280] border-gray-200"
              }`}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Filtres</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#AECB2A] text-[#243318] text-[8px] font-bold flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
            <input type="text" value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Rechercher dans cette catégorie..."
              className="w-full h-10 pl-9 pr-4 text-[13px] bg-gray-50 border border-gray-200 rounded-xl outline-none text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#243318] focus:bg-white transition-all" />
          </div>
        </div>

        {subcategories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-3">
            {subcategories.map((sub) => (
              <button key={sub.id} onClick={() => handleSubChange(sub.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  params.sub === sub.id ? "bg-[#1A1A1A] text-white" : "bg-gray-50 text-[#6B7280] border border-gray-200 hover:border-gray-300"
                }`}>
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-5 pb-3 -mt-1">
            {params.sub !== "all" && (
              <span className="shrink-0 flex items-center gap-1 px-2 py-1 bg-[#AECB2A]/20 text-[#243318] rounded-full text-[9px] font-semibold">
                {subcategories.find((s) => s.id === params.sub)?.name}
                <button onClick={() => handleSubChange("all")} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
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
                <MapPin className="w-2.5 h-2.5" /> {params.loc}
                <button onClick={() => updateParam("loc", "")} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between px-5 pb-3">
          <span className="text-[11px] text-[#6B7280]">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
          <div className="relative">
            <button onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-medium text-[#6B7280] cursor-pointer hover:bg-gray-100 transition-colors">
              <SlidersHorizontal className="w-3 h-3" />
              {SORT_OPTIONS.find((o) => o.value === params.sort)?.label}
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden min-w-[140px]">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => { updateParam("sort", opt.value); setShowSort(false) }}
                      className={`w-full text-left px-4 py-2.5 text-[12px] cursor-pointer hover:bg-gray-50 transition-colors ${
                        params.sort === opt.value ? "text-[#243318] font-semibold bg-gray-50" : "text-[#1A1A1A]"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {category && params.sub === "all" && !params.q && !params.min && !params.max && !params.cond && !params.loc && (
        <div className="px-5 pt-4">
          <div className="grid grid-cols-2 gap-2">
            {category.children.map((sub) => {
              const count = allProducts.filter((p) => p.subcategory === sub.slug || p.category === sub.slug).length
              return (
                <motion.button key={sub.id} whileTap={{ scale: 0.96 }} onClick={() => handleSubChange(sub.id)}
                  className="text-left bg-white rounded-xl border border-gray-100 p-3 cursor-pointer hover:border-[#243318]/30 transition-all active:scale-[0.98]">
                  <span className="text-xl leading-none">{SUBCAT_ICONS[sub.slug] || "📦"}</span>
                  <p className="text-[12px] font-bold text-[#1A1A1A] mt-1.5 leading-tight">{sub.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[9px] text-[#6B7280]">{count} article{count !== 1 ? "s" : ""}</span>
                    <ChevronRight className="w-2.5 h-2.5 text-[#9CA3AF]" />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      <div className="px-5 pt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-[14px] font-bold text-[#1A1A1A] mb-1">Aucune annonce trouvée</p>
            <p className="text-[12px] text-[#6B7280]">Essayez de modifier votre recherche ou vos filtres</p>
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
            <div className="grid grid-cols-2 gap-3">
              {visibleProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} onClick={() => nav(`/marketplace/item/${product.id}${location.search}`)} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-5">
                <button onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                  className="h-10 px-6 rounded-xl bg-white border border-gray-200 text-[12px] font-semibold text-[#1A1A1A] cursor-pointer hover:border-gray-300 active:scale-[0.98] transition-all flex items-center gap-1.5">
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
          <p className="text-[11px] font-semibold text-[#1A1A1A] mb-2">Prix</p>
          <div className="flex items-center gap-2">
            <input type="number" value={localMin} onChange={(e) => { setLocalMin(e.target.value); updatePriceParam("min", e.target.value) }}
              placeholder="Min" className="w-full h-10 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#243318]" />
            <span className="text-[11px] text-[#6B7280]">→</span>
            <input type="number" value={localMax} onChange={(e) => { setLocalMax(e.target.value); updatePriceParam("max", e.target.value) }}
              placeholder="Max" className="w-full h-10 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#243318]" />
          </div>
        </div>
        {isSecondHand && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-[#1A1A1A] mb-2">État</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => updateParam("cond", params.cond === key ? "" : key)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-all ${
                    params.cond === key ? CONDITION_COLORS[key] : "bg-gray-50 text-[#6B7280] border-gray-200"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
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
  const brand = "brand" in product ? (product as { brand: string }).brand : null

  return (
    <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      className="text-left bg-white rounded-xl overflow-hidden border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform hover:border-gray-200">
      <div className="relative aspect-square bg-gray-50">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-gray-300" /></div>
        )}
        {product.originalPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-[12px] font-semibold text-[#1A1A1A] line-clamp-2 leading-tight">{product.name}</h3>
        {brand && <p className="text-[9px] text-[#6B7280] mt-0.5">{brand}</p>}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[14px] font-bold text-[#1A1A1A]">{formatPrice(product.price)}</span>
          {product.originalPrice && <span className="text-[10px] text-[#9CA3AF] line-through">{formatPrice(product.originalPrice)}</span>}
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#6B7280]">
          {condition && (
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold leading-tight ${
              condition === "like_new" ? "bg-green-100 text-green-700" :
              condition === "good" ? "bg-blue-100 text-blue-700" :
              condition === "fair" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
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
