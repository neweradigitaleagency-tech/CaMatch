import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Package, AlertTriangle } from "lucide-react"
import type { Product } from "../../types/marketplace"

interface CatalogProductCardProps {
  product: Product
  index: number
  horizontal?: boolean
}

function formatPrice(price: number): string {
  return price.toLocaleString("fr-FR") + " FCFA"
}

function getConditionLabel(condition: string): string {
  switch (condition) {
    case "like_new": return "Comme neuf"
    case "good": return "Bon état"
    case "fair": return "État correct"
    default: return condition
  }
}

export default function CatalogProductCard({ product, index, horizontal }: CatalogProductCardProps) {
  const nav = useNavigate()
  const [imgError, setImgError] = useState(false)

  const hasImage = product.images.length > 0 && product.images[0]?.trim() && !imgError

  const isOnSale = product.originalPrice && product.originalPrice > product.price
  const discountPct = isOnSale ? Math.round((1 - product.price / product.originalPrice!) * 100) : 0
  const brand = "brand" in product ? (product as { brand?: string }).brand : undefined
  const condition = "condition" in product ? (product as { condition: string }).condition : null
  const isLowStock = product.stock !== undefined && product.stock <= 5 && product.stock > 0

  const cardContent = horizontal ? (
    <div className="flex gap-3 p-3">
      <div className="w-16 h-16 rounded-xl bg-cm-surface relative shrink-0 overflow-hidden">
        {hasImage ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-5 h-5 text-cm-text-muted" />
          </div>
        )}
        {isOnSale && (
          <span className="absolute top-0.5 left-0.5 px-1 py-0.5 rounded-full bg-cm-error text-white text-[7px] font-bold leading-tight">
            -{discountPct}%
          </span>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-[7px] font-bold text-white bg-black/60 px-1 py-0.5 rounded-full">Rupture</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="caption-cm font-semibold text-cm-text line-clamp-2 leading-tight">{product.name}</h3>
        {brand && <p className="text-[10px] text-cm-text-soft mt-0.5 truncate">{brand}</p>}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="label-cm font-semibold text-cm-text">{formatPrice(product.price)}</span>
          {isOnSale && (
            <span className="text-[9px] text-cm-text-muted line-through">{formatPrice(product.originalPrice!)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-cm-accent/20 text-cm-forest">{product.category}</span>
          {isLowStock && (
            <span className="flex items-center gap-0.5 text-[9px] text-amber-600">
              <AlertTriangle className="w-2.5 h-2.5" />+{product.stock}
            </span>
          )}
        </div>
      </div>
    </div>
  ) : (
    <>
      <div className="aspect-square bg-cm-surface relative">
        {hasImage ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-cm-text-muted" />
          </div>
        )}
        {isOnSale && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-cm-error text-white text-[9px] font-bold leading-tight">
            -{discountPct}%
          </span>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">Rupture</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-cm-text line-clamp-2 leading-tight">{product.name}</h3>
        {brand && <p className="caption-cm text-cm-text-soft mt-1 truncate">{brand}</p>}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="label-cm font-semibold text-cm-text">{formatPrice(product.price)}</span>
          {isOnSale && (
            <span className="caption-cm text-cm-text-muted line-through">{formatPrice(product.originalPrice!)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="label-cm px-2 py-0.5 rounded-full bg-cm-accent/20 text-cm-forest">{product.category}</span>
          {condition && (
            <span className="caption-cm text-cm-text-soft">{getConditionLabel(condition)}</span>
          )}
          {isLowStock && (
            <span className="flex items-center gap-1 caption-cm text-amber-600 font-medium">
              <AlertTriangle className="w-3 h-3" /> Plus que {product.stock}
            </span>
          )}
        </div>
      </div>
    </>
  )

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => nav(`/marketplace/item/${product.id}`, { state: { from: window.location.pathname + window.location.search } })}
      className={`w-full text-left bg-cm-elevated border border-cm-border rounded-xl overflow-hidden cursor-pointer hover:border-cm-accent/40 active:scale-[0.97] transition-all shadow-cm-card hover:shadow-cm-card-hov transition-shadow ${horizontal ? "" : ""}`}
    >
      {cardContent}
    </motion.button>
  )
}
