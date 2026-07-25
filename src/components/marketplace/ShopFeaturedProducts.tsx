import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Product } from "../../types/marketplace"
import CatalogProductCard from "./CatalogProductCard"

interface ShopFeaturedProductsProps {
  products: Product[]
}

export default function ShopFeaturedProducts({ products }: ShopFeaturedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (products.length === 0) return null

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = 180
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-cm-text">Produits à la une</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="w-7 h-7 rounded-full bg-cm-elevated flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-cm-text-soft" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-7 h-7 rounded-full bg-cm-elevated flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
          >
            <ChevronRight className="w-3.5 h-3.5 text-cm-text-soft" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 pb-1"
      >
        {products.map((product, i) => (
          <div key={product.id} className="snap-start shrink-0 w-36">
            <CatalogProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </div>
  )
}
