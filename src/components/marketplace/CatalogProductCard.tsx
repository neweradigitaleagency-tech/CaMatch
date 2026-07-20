import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Package, AlertTriangle, Star } from "lucide-react"
import type { Product } from "../../types/marketplace"

interface CatalogProductCardProps {
  product: Product
  index: number
}

function formatPrice(price: number): string {
  return price.toLocaleString("fr-FR") + " FCFA"
}

function getVerticalIcon(vertical: string): string {
  switch (vertical) {
    case "pro_supply": return "🏗️"
    case "shopping": return "🛒"
    case "second_hand": return "♻️"
    case "real_estate": return "🏠"
    default: return "📦"
  }
}

export default function CatalogProductCard({ product, index }: CatalogProductCardProps) {
  const nav = useNavigate()

  const isOnSale = product.originalPrice && product.originalPrice > product.price
  const discountPct = isOnSale ? Math.round((1 - product.price / product.originalPrice!) * 100) : 0
  const brand = "brand" in product ? (product as { brand?: string }).brand : undefined

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => nav(`/marketplace/item/${product.id}`)}
      className="w-full text-left bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:border-gray-200 active:scale-[0.99] transition-all"
    >
      <div className="flex gap-3 p-3">
        <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <Package className="w-8 h-8 text-gray-300" />
          )}
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
              <span className="text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-full">Rupture</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-1.5">
              <span className="text-[9px]">{getVerticalIcon(product.vertical)}</span>
              <p className="text-[13px] font-semibold text-[#1A1A1A] leading-tight line-clamp-2">{product.name}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {brand && <span className="text-[10px] text-[#6B7280]">{brand}</span>}
              <span className="text-[9px] text-[#6B7280] bg-gray-100 px-1.5 py-0.5 rounded-full">{product.category}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-[#1A1A1A]">{formatPrice(product.price)}</span>
              {isOnSale && (
                <span className="text-[10px] text-[#6B7280] line-through">{formatPrice(product.originalPrice!)}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {discountPct > 0 && (
                <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">-{discountPct}%</span>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <AlertTriangle className="w-3 h-3 text-amber-500" />
              )}
            </div>
          </div>
          {"condition" in product && product.vertical === "second_hand" && (
            <span className="text-[9px] text-[#6B7280] mt-0.5">
              {product.condition === "like_new" ? "Comme neuf" : product.condition === "good" ? "Bon état" : "État correct"}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}
