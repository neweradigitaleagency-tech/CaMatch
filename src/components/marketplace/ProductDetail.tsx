import { useState, useMemo, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "motion/react"
import { ArrowLeft, MapPin, Heart, MessageCircle, Phone, ChevronDown, Eye, Share2, Flag, BadgeCheck, Package, AlertTriangle, ShieldAlert, Star } from "lucide-react"
import { useBackNavigation } from "../../hooks/useBackNavigation"
import { getProductById } from "../../data/marketplaceProducts"
import { getSellerById } from "../../data/marketplaceSuppliers"
import type { Product, MaterialProduct, ShoppingProduct, SecondHandProduct, RealEstateProduct, ProfessionalSeller } from "../../types/marketplace"

function formatPrice(p: number) { return p.toLocaleString("fr-FR") + " F" }

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return "Hier"
  if (diff < 7) return `Il y a ${diff} jours`
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

const CONDITION_LABELS: Record<string, string> = {
  like_new: "Comme neuf", good: "Bon état", fair: "État correct",
}

const UNIT_LABELS: Record<string, string> = {
  piece: "Pièce", meter: "Mètre", kg: "Kg", liter: "Litre", bag: "Sac", box: "Boîte", set: "Lot",
}

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>()
  const nav = useNavigate()
  const goBack = useBackNavigation("/marketplace")
  const product = useMemo(() => getProductById(productId || ""), [productId])
  const seller = useMemo(() => (product ? getSellerById(product.sellerId) : undefined), [product])
  const [currentImg, setCurrentImg] = useState(0)
  const [showDesc, setShowDesc] = useState(false)
  const [wished, setWished] = useState(false)
  const touchStartX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0]!.clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0]!.clientX - touchStartX.current
    if (Math.abs(diff) > 50) {
      if (diff < 0 && currentImg < product!.images.length - 1) setCurrentImg((i) => i + 1)
      if (diff > 0 && currentImg > 0) setCurrentImg((i) => i - 1)
    }
  }

  if (!product || !seller) {
    return (
      <div className="flex flex-col w-full min-h-dynamic bg-[#EDE8DC]">
        <header className="bg-white px-4 py-3">
          <button onClick={goBack} className="w-11 h-11 flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center px-4 text-center py-16">
          <div>
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[16px] font-bold text-[#1A1A1A] mb-1">Annonce introuvable</p>
            <p className="text-[13px] text-[#6B7280]">Cette annonce n'existe pas ou a été supprimée.</p>
          </div>
        </div>
      </div>
    )
  }

  const isPro = seller.type === "professional"
  const isProSupply = product.vertical === "pro_supply"
  const isSecondHand = product.vertical === "second_hand"
  const isRealEstate = product.vertical === "real_estate"
  const isShopping = product.vertical === "shopping"
  const condition = "condition" in product ? (product as SecondHandProduct).condition : undefined

  const getSpecs = (): { label: string; value: string }[] => {
    if (isProSupply) {
      const mp = product as MaterialProduct
      const result: ({ label: string; value: string } | null)[] = [
        mp.brand ? { label: "Marque", value: mp.brand } : null,
        mp.unit ? { label: "Unité", value: UNIT_LABELS[mp.unit] || mp.unit } : null,
        mp.dimensions ? { label: "Dimensions", value: mp.dimensions } : null,
        mp.stock ? { label: "Stock", value: `${mp.stock} ${mp.unit ? UNIT_LABELS[mp.unit] || "" : ""}` } : null,
      ]
      if (mp.technicalSpecs) {
        for (const [k, v] of Object.entries(mp.technicalSpecs)) {
          result.push({ label: k.charAt(0).toUpperCase() + k.slice(1), value: v })
        }
      }
      return result.filter(Boolean) as { label: string; value: string }[]
    }
    if (isSecondHand) {
      const sh = product as SecondHandProduct
      return [
        sh.brand ? { label: "Marque", value: sh.brand } : null,
        sh.model ? { label: "Modèle", value: sh.model } : null,
        sh.storage ? { label: "Stockage", value: sh.storage } : null,
        sh.hasOriginalBox ? { label: "Boîte d'origine", value: "Oui" } : null,
        sh.hasAccessories ? { label: "Accessoires inclus", value: "Oui" } : null,
        sh.defects?.length ? { label: "Défauts", value: sh.defects.join(", ") } : null,
      ].filter(Boolean) as { label: string; value: string }[]
    }
    if (isShopping) {
      const sp = product as ShoppingProduct
      const result: ({ label: string; value: string } | null)[] = [
        sp.brand ? { label: "Marque", value: sp.brand } : null,
        sp.warranty ? { label: "Garantie", value: sp.warranty } : null,
      ]
      if (sp.specifications) {
        for (const [k, v] of Object.entries(sp.specifications)) {
          result.push({ label: k.charAt(0).toUpperCase() + k.slice(1), value: v })
        }
      }
      return result.filter(Boolean) as { label: string; value: string }[]
    }
    if (isRealEstate) {
      const re = product as RealEstateProduct
      return [
        { label: "Surface", value: `${re.surface} m²` },
        re.bedrooms ? { label: "Pièces", value: `${re.bedrooms} chambre${re.bedrooms > 1 ? "s" : ""}` } : null,
        re.bathrooms ? { label: "Salle(s) d'eau", value: `${re.bathrooms}` } : null,
        re.furnished ? { label: "Meublé", value: "Oui" } : null,
        re.yearBuilt ? { label: "Année", value: `${re.yearBuilt}` } : null,
        re.floor ? { label: "Étage", value: `${re.floor}/${re.totalFloors || "?"}` } : null,
        re.amenities?.length ? { label: "Commodités", value: re.amenities.slice(0, 3).join(", ") } : null,
      ].filter(Boolean) as { label: string; value: string }[]
    }
    return []
  }

  const specs = getSpecs()

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-[#EDE8DC]">
      {/* Image carousel */}
      <div className="relative w-full aspect-square bg-gray-100">
        {product.images[currentImg] ? (
          <img src={product.images[currentImg]} alt={product.name}
            className="w-full h-full object-cover"
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-b from-black/30 to-transparent">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center cursor-pointer active:scale-90 transition-transform" aria-label="Retour">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={() => setWished(!wished)} className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center cursor-pointer active:scale-90 transition-transform" aria-label="Favoris">
            <Heart className={`w-5 h-5 ${wished ? "fill-red-500 text-red-500" : "text-white"}`} />
          </button>
        </div>

        {product.images.length > 1 && (
          <>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {product.images.map((_, i) => (
                <button key={i} onClick={() => setCurrentImg(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentImg ? "bg-white w-3" : "bg-white/50"}`}
                  aria-label={`Image ${i + 1}`} />
              ))}
            </div>
            <div className="absolute top-3 right-14 px-2 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-medium">
              {currentImg + 1}/{product.images.length}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 pb-8">
        {/* Product info card */}
        <div className="bg-white rounded-[16px] mx-4 -mt-6 relative z-10 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-start gap-2 mb-1">
            <h1 className="text-[18px] font-bold text-[#1A1A1A] leading-tight flex-1">{product.name}</h1>
            {isProSupply && (product as MaterialProduct).cmPrice && (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold">Prix CM</span>
            )}
          </div>

          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-[22px] font-extrabold text-[#1A1A1A]">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-[13px] text-[#9CA3AF] line-through">{formatPrice(product.originalPrice)}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-bold">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {condition && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                condition === "like_new" ? "bg-green-100 text-green-700" :
                condition === "good" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
              }`}>{CONDITION_LABELS[condition]}</span>
            )}
            {isProSupply && (
              <span className="px-2 py-0.5 rounded bg-[#AECB2A]/20 text-[#243318] text-[10px] font-bold">Pro Supply</span>
            )}
            <span className="text-[11px] text-[#6B7280]">{formatDate(product.createdAt)}</span>
            <span className="text-[11px] text-[#6B7280] flex items-center gap-1 ml-auto">
              <Eye className="w-3 h-3" /> {Math.floor(Math.random() * 200 + 50)} vues
            </span>
          </div>

          {!product.isAvailable && (
            <div className="mt-2 flex items-center gap-1.5 px-3 py-2 bg-red-50 rounded-lg text-[12px] text-red-600 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Ce produit n'est plus disponible
            </div>
          )}
        </div>

        {/* Seller card */}
        <div className="mx-4 mt-3">
          <Link to={isPro ? `/marketplace/shop/${seller.id}` : "#"}
            className="block bg-white rounded-[12px] p-3.5 border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                {isPro && (seller as ProfessionalSeller).logo ? (
                  <img src={(seller as ProfessionalSeller).logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[16px]">
                    {seller.type === "individual" ? "👤" : "🏪"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-[#1A1A1A]">
                    {seller.type === "professional" ? (seller as ProfessionalSeller).companyName : seller.type === "individual" ? (seller as any).displayName : (seller as any).businessName}
                  </span>
                  {(seller.verificationStatus === "active" || seller.verificationStatus === "verified") && (
                    <BadgeCheck className="w-3.5 h-3.5 text-[#AECB2A] shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#6B7280]">
                  <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />{seller.rating.toFixed(1)}</span>
                  <span>{seller.reviewCount} avis</span>
                  <span>{seller.totalSales} ventes</span>
                </div>
              </div>
              {isPro && <span className="text-[11px] text-[#243318] font-semibold shrink-0">Voir la boutique →</span>}
            </div>
          </Link>
        </div>

        {/* Description */}
        <div className="mx-4 mt-3 bg-white rounded-[12px] p-3.5 border border-gray-100">
          <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-1">Description</h3>
          <p className={`text-[13px] text-[#4A4A4A] leading-relaxed ${showDesc ? "" : "line-clamp-3"}`}>
            {product.description}
          </p>
          {product.description.length > 120 && (
            <button onClick={() => setShowDesc(!showDesc)} className="flex items-center gap-0.5 text-[12px] font-medium text-[#243318] mt-1 cursor-pointer">
              {showDesc ? "Réduire" : "Lire plus"} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDesc ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        {/* Specs */}
        {specs.length > 0 && (
          <div className="mx-4 mt-3 bg-white rounded-[12px] p-3.5 border border-gray-100">
            <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-2">Détails</h3>
            <div className="space-y-1.5">
              {specs.map((spec, i) => (
                <div key={i} className="flex items-center text-[12px]">
                  <span className="text-[#6B7280] w-28 shrink-0">{spec.label}</span>
                  <span className="text-[#1A1A1A] font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="mx-4 mt-3 bg-white rounded-[12px] p-3.5 flex items-center gap-2 border border-gray-100">
          <MapPin className="w-4 h-4 text-[#6B7280] shrink-0" />
          <span className="text-[13px] text-[#1A1A1A] font-medium">{product.location}</span>
          {product.deliveryAvailable && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold">
              Livraison {product.deliveryFee ? `(${formatPrice(product.deliveryFee)})` : "disponible"}
            </span>
          )}
        </div>

        {/* Safety tips */}
        <div className="mx-4 mt-3 bg-amber-50 rounded-[10px] p-3 flex gap-2 border border-amber-100">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-relaxed">
            <strong>Conseil sécurité :</strong> Rencontrez le vendeur dans un lieu public et privilégiez les paiements sécurisés. Ne transférez jamais d'argent avant d'avoir vu le bien.
          </p>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] z-20">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <button onClick={() => { /* TODO: share */ }}
            className="w-11 h-11 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0" aria-label="Partager">
            <Share2 className="w-4 h-4 text-[#1A1A1A]" />
          </button>
          {isPro && "phone" in seller && (
            <a href={`tel:${(seller as ProfessionalSeller).phone}`}
              className="w-11 h-11 rounded-full bg-[#243318] flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0" aria-label="Appeler">
              <Phone className="w-4 h-4 text-white" />
            </a>
          )}
          <button onClick={() => nav("/orders/new")}
            className="flex-1 h-11 rounded-[12px] bg-[#1A1A1A] text-white font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform">
            <MessageCircle className="w-4 h-4" /> Contacter le vendeur
          </button>
        </div>
      </div>
    </div>
  )
}
