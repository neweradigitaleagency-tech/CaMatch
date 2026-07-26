import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "motion/react"
import { Store, Star, MapPin, BadgeCheck, ChevronRight } from "lucide-react"
import type { ProfessionalSeller } from "../../types/marketplace"

interface CatalogSupplierCardProps {
  seller: ProfessionalSeller
  productCount: number
  index: number
  featured?: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  "ps-ciment": "Ciment", "ps-aciers": "Aciers", "ps-carrelage": "Carrelage",
  "ps-peinture": "Peinture", "ps-plomberie": "Plomberie", "ps-electricite": "Électricité",
  "ps-menuiserie": "Menuiserie", "ps-quincaillerie": "Quincaillerie", "ps-outillage": "Outillage",
  "ps-equipement": "Équipement", "ps-gros-oeuvre": "Gros œuvre", "ps-clim": "Clim",
}

export default function CatalogSupplierCard({ seller, productCount, index, featured }: CatalogSupplierCardProps) {
  const nav = useNavigate()
  const location = useLocation()

  const displayCategories = seller.categories.slice(0, 2)

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => nav(`/marketplace/shop/${seller.id}`, { state: { from: location.pathname + location.search } })}
      className="w-full text-left bg-cm-elevated border border-cm-border rounded-2xl overflow-hidden cursor-pointer hover:border-cm-accent/40 active:scale-[0.99] transition-all shadow-cm-card hover:shadow-cm-card-hov transition-shadow flex flex-col min-h-64"
    >
      {/* Banner */}
      <div className="relative aspect-video overflow-hidden">
        {seller.banner ? (
          <img src={seller.banner} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cm-accent/20 via-cm-forest/10 to-cm-accent/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="px-3 -mt-6 pb-3 relative flex-1 flex flex-col">
        {/* Logo + Name row */}
        <div className="flex items-end gap-3 mb-3">
          <div className="w-16 h-16 rounded-xl border-[2px] border-white overflow-hidden shrink-0 bg-cm-surface shadow-md flex items-center justify-center">
            {seller.logo ? (
              <img src={seller.logo} alt={seller.companyName} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-6 h-6 text-cm-text-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0 pb-0.5">
            <div className="flex items-center gap-2">
              <h3 className="h3-cm text-cm-text line-clamp-1 leading-snug min-w-0">{seller.companyName}</h3>
              {(seller.verificationStatus === "active" || seller.verificationStatus === "verified") && (
                <BadgeCheck className="w-4 h-4 text-cm-green shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 meta-cm text-cm-text-soft">
                <Star className="w-3 h-3 fill-cm-amber text-cm-amber" />
                <span className="font-semibold">{seller.rating.toFixed(1)}</span>
              </span>
              <span className="text-cm-text-muted text-[10px]">·</span>
              <span className="flex items-center gap-1 meta-cm text-cm-text-soft">
                <MapPin className="w-3 h-3" />
                {seller.city}
              </span>
            </div>
          </div>
        </div>

        {/* Categories */}
        {displayCategories.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {displayCategories.map((cat) => (
              <span key={cat} className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium h-5 bg-cm-accent/20 text-cm-forest shrink-0">
                {CATEGORY_LABELS[cat] || cat}
              </span>
            ))}
            {seller.categories.length > 2 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium h-5 bg-cm-accent/20 text-cm-forest shrink-0">
                +{seller.categories.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-4 border-t border-cm-border/50 gap-2 mt-auto">
          <span className="meta-cm text-cm-text-soft whitespace-nowrap overflow-hidden text-ellipsis">
            {productCount} produit{productCount !== 1 ? "s" : ""} · {seller.reviewCount} avis
          </span>
          <div className="w-px h-4 bg-cm-border/30 shrink-0" />
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-cm-forest bg-cm-accent/20 hover:bg-cm-accent/30 shrink-0 cursor-pointer">
            Voir <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.button>
  )
}
