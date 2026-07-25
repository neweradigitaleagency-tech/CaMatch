import { MapPin, Package, Star, Store, Share2, MessageCircle, ArrowLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import type { Seller } from "../../types/marketplace"

interface ShopHeroProps {
  seller: Seller
  productCount: number
}

export default function ShopHero({ seller, productCount }: ShopHeroProps) {
  const nav = useNavigate()
  const location = useLocation()
  const isPro = seller.type === "professional" || seller.type === "ca_match_pro"
  const name = isPro && "companyName" in seller ? seller.companyName
    : "displayName" in seller ? seller.displayName
    : "businessName" in seller ? seller.businessName
    : "Boutique"
  const logo = isPro && "logo" in seller ? seller.logo || ""
    : "photo" in seller ? seller.photo || ""
    : ""
  const banner = isPro && "banner" in seller ? seller.banner || "" : ""
  const city = "city" in seller ? seller.city : ""
  const phone = "phone" in seller ? seller.phone : ""
  const verified = seller.verificationStatus === "active" || seller.verificationStatus === "verified"

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: name, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="w-full">
      <div className="relative w-full h-48 overflow-hidden">
        {banner ? (
          <img src={banner} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#243318] via-[#3a5a2a] to-[#AECB2A]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <button
          onClick={() => nav(location.state?.from || "/marketplace", { replace: true })}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={handleShare}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
        >
          <Share2 className="w-4 h-4 text-white" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white/80 overflow-hidden bg-white shadow-lg shrink-0">
              {logo ? (
                <img src={logo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Store className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-0.5">
              <h1 className="text-xl font-bold text-white drop-shadow-sm truncate">{name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B] drop-shadow-sm" />
                  <span className="text-sm font-bold text-white">{seller.rating > 0 ? seller.rating.toFixed(1) : "Nouveau"}</span>
                  <span className="text-xs text-white/70">({seller.reviewCount} avis)</span>
                </div>
                {verified && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#AECB2A] text-[#1A1A1A]">
                    Vérifié
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-cm-elevated border-b border-cm-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-cm-text-soft">
            <MapPin className="w-3.5 h-3.5" />
            {city}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cm-text-soft">
            <Package className="w-3.5 h-3.5" />
            {productCount} produit{productCount !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cm-text-soft">
            <Store className="w-3.5 h-3.5" />
            {seller.totalSales} vente{seller.totalSales !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2.5">
          <button
            onClick={() => {
              nav(`/messages/new?seller=${seller.id}`, { state: { from: location.pathname } })
            }}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-cm-text text-white text-xs font-bold cursor-pointer active:scale-[0.98] transition-transform"
          >
            <MessageCircle className="w-4 h-4" />
            Contacter
          </button>
          {phone && (
            <button
              onClick={() => window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}`, "_blank")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-cm-accent/20 text-cm-accent cursor-pointer active:scale-[0.98] transition-transform shrink-0"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
