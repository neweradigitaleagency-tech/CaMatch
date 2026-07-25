import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import type { Product } from "../../types/marketplace"
import CatalogProductCard from "./CatalogProductCard"

interface ShopCatalogProps {
  products: Product[]
}

type SortKey = "popular" | "price_asc" | "price_desc" | "name"

const SORT_LABELS: Record<SortKey, string> = {
  popular: "Populaire",
  price_asc: "Prix ↑",
  price_desc: "Prix ↓",
  name: "Nom A-Z",
}

const VERTICAL_LABEL: Record<string, string> = {
  pro_supply: "Pro Supply",
  shopping: "Shopping",
  second_hand: "Seconde main",
  real_estate: "Immobilier",
}

export default function ShopCatalog({ products }: ShopCatalogProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [sort, setSort] = useState<SortKey>("popular")
  const [showSort, setShowSort] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category))
    return ["all", ...Array.from(cats)]
  }, [products])

  const filtered = useMemo(() => {
    let result = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q) || ("brand" in p && (p as { brand: string }).brand.toLowerCase().includes(q)))
    }

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
  }, [products, activeCategory, sort, searchQuery])

  const verticalLabel = products[0] ? VERTICAL_LABEL[products[0].vertical] || products[0].vertical : ""

  if (products.length === 0) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-cm-text-soft">Aucun produit disponible</p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-cm-text">
          Catalogue {verticalLabel && <span className="font-normal text-cm-text-soft">· {verticalLabel}</span>}
        </h3>
        <span className="text-[11px] text-cm-text-soft">{filtered.length} produit{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-cm-text text-white"
                  : "bg-cm-elevated text-cm-text-soft"
              }`}
            >
              {cat === "all" ? "Tous" : cat}
            </button>
          ))}
        </div>
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cm-elevated text-[11px] font-semibold text-cm-text-soft cursor-pointer"
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
                    className={`w-full text-left px-4 py-2 text-xs font-medium cursor-pointer ${
                      sort === k ? "text-cm-text bg-cm-border/20" : "text-cm-text-soft"
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
          <CatalogProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  )
}
