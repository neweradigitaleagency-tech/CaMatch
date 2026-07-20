import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Store, Star, MapPin, Package, BadgeCheck } from "lucide-react"
import type { ProfessionalSeller } from "../../types/marketplace"

interface CatalogSupplierCardProps {
  seller: ProfessionalSeller
  productCount: number
  index: number
}

export default function CatalogSupplierCard({ seller, productCount, index }: CatalogSupplierCardProps) {
  const nav = useNavigate()

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => nav(`/marketplace/shop/${seller.id}`)}
      className="w-full flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-gray-200 active:scale-[0.99] transition-all text-left"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
        {seller.logo ? (
          <img src={seller.logo} alt={seller.companyName} className="w-full h-full object-cover" />
        ) : (
          <Store className="w-6 h-6 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[#1A1A1A] truncate">{seller.companyName}</span>
          {(seller.verificationStatus === "active" || seller.verificationStatus === "verified") && (
            <BadgeCheck className="w-3.5 h-3.5 text-[#AECB2A] shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mt-0.5">
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
            {seller.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {seller.city}
          </span>
          <span className="flex items-center gap-0.5">
            <Package className="w-3 h-3" />
            {productCount} produits
          </span>
        </div>
      </div>
    </motion.button>
  )
}
