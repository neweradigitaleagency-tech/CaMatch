import { MapPin, Package, Star, Store } from "lucide-react"
import type { Seller } from "../../types/marketplace"
import { formatSellerRating } from "../../data/marketplaceSuppliers"

interface ShopHeaderProps {
  seller: Seller
  productCount: number
}

export default function ShopHeader({ seller, productCount }: ShopHeaderProps) {
  const isPro = seller.type === "professional" || seller.type === "ca_match_pro"
  const name = isPro && "companyName" in seller ? seller.companyName : "displayName" in seller ? seller.displayName : "Boutique"
  const logo = isPro && "logo" in seller ? seller.logo || "" : "photo" in seller ? seller.photo || "" : ""
  const banner = isPro && "banner" in seller ? seller.banner || "" : ""
  const city = "city" in seller ? seller.city : ""
  const rating = seller.rating
  const verified = seller.verificationStatus === "active" || seller.verificationStatus === "verified"

  return (
    <div className="w-full">
      {banner ? (
        <div className="w-full h-40 overflow-hidden">
          <img src={banner} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-r from-[#243318] to-[#AECB2A]" />
      )}

      <div className="px-5 pb-4 -mt-10 relative z-10">
        <div className="flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-md shrink-0">
            {logo ? (
              <img src={logo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Store className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-lg font-bold text-[#1A1A1A] truncate">{name}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                <span className="text-sm font-semibold text-[#1A1A1A]">{formatSellerRating(rating)}</span>
                <span className="text-xs text-[#6B7280]">({seller.reviewCount} avis)</span>
              </div>
              {verified && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#AECB2A] text-[#1A1A1A]">
                  Vérifié
                </span>
              )}
              {seller.verificationStatus === "pending" && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                  En attente
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <MapPin className="w-3.5 h-3.5" />
            {city}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Package className="w-3.5 h-3.5" />
            {productCount} produits
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Store className="w-3.5 h-3.5" />
            {seller.totalSales} ventes
          </div>
        </div>
      </div>
    </div>
  )
}
