import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Product } from "../../types/marketplace"

interface ShopFeaturedProductsProps {
  products: Product[]
}

export default function ShopFeaturedProducts({ products }: ShopFeaturedProductsProps) {
  const nav = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)

  if (products.length === 0) return null

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = 180
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  const formatPrice = (price: number) => price.toLocaleString("fr-FR") + " F"

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#1A1A1A]">Produits à la une</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer active:scale-90 transition-transform hover:bg-gray-200"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer active:scale-90 transition-transform hover:bg-gray-200"
          >
            <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 pb-1"
      >
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => nav(`/marketplace/item/${product.id}`)}
            className="snap-start shrink-0 w-36 bg-white rounded-xl border border-gray-100 overflow-hidden text-left cursor-pointer active:scale-[0.97] transition-transform hover:border-gray-200"
          >
            <div className="relative aspect-square bg-gray-50">
              {product.images[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl text-gray-300">📦</span>
                </div>
              )}
              {product.originalPrice && (
                <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-[11px] font-semibold text-[#1A1A1A] line-clamp-2 leading-tight">{product.name}</p>
              <p className="text-[12px] font-bold text-[#1A1A1A] mt-0.5">{formatPrice(product.price)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
