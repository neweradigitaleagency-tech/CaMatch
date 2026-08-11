import { useState, useMemo } from "react"
import { ArrowLeft, MessageCircle, Star, Store, MapPin, Truck, Clock, Phone, Mail, Share2 } from "lucide-react"
import { useAppNavigation } from "../../navigation/useAppNavigation"
import CatalogProductCard from "./CatalogProductCard"
import type { Seller } from "../../types/marketplace"
import { getProductsBySeller } from "../../data/marketplaceProducts"
import { getReviewsBySeller, getRatingDistribution } from "../../data/marketplaceReviews"

interface ShopScreenV2Props {
  seller: Seller
}

type Tab = "produits" | "propos" | "avis"

export default function ShopScreenV2({ seller }: ShopScreenV2Props) {
  const { navigate: nav, goBack } = useAppNavigation()
  const [tab, setTab] = useState<Tab>("produits")

  const products = useMemo(() => getProductsBySeller(seller.id), [seller.id])
  const allReviews = useMemo(() => getReviewsBySeller(seller.id), [seller.id])
  const dist = useMemo(() => getRatingDistribution(seller.id), [seller.id])

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
  const professional = isPro && "hours" in seller ? seller as Extract<Seller, { type: "professional" }> : null
  const deliveryZones = professional?.deliveryZones || []
  const address = "address" in seller ? seller.address : ""
  const email = "email" in seller ? seller.email : ""
  const description = "description" in seller ? seller.description : ""

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diff === 0) return "Aujourd'hui"
    if (diff === 1) return "Hier"
    if (diff < 7) return `Il y a ${diff} jours`
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: name, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      {/* Mini banner */}
      <div className="relative w-full h-32 overflow-hidden">
        {banner ? (
          <img src={banner} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#243318] via-[#3a5a2a] to-[#AECB2A]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        <button onClick={() => goBack()} className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <button onClick={handleShare} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
          <Share2 className="w-4 h-4 text-white" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <div className="flex items-end gap-3">
            <div className="w-14 h-14 rounded-xl border-2 border-white/80 overflow-hidden bg-white shadow-md shrink-0">
              {logo ? (
                <img src={logo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-cm-bg">
                  <Store className="w-5 h-5 text-cm-text-soft" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-0.5">
              <h1 className="text-base font-bold text-white drop-shadow-sm truncate">{name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B] drop-shadow-sm" />
                  <span className="text-xs font-bold text-white">{seller.rating > 0 ? seller.rating.toFixed(1) : "Nouveau"}</span>
                </div>
                {verified && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#AECB2A] text-[#1A1A1A]">
                    Vérifié
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky tabs */}
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex px-4">
          {[
            { key: "produits" as Tab, label: "Produits", count: products.length },
            { key: "propos" as Tab, label: "À propos" },
            { key: "avis" as Tab, label: "Avis", count: allReviews.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex-1 py-3 text-xs font-semibold cursor-pointer transition-colors ${
                tab === t.key ? "text-cm-text" : "text-cm-text-soft"
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                {t.label}
                {t.count !== undefined && <span className="text-[10px] text-cm-text-muted">({t.count})</span>}
              </span>
              {tab === t.key && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-cm-text rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1">
        {tab === "produits" && (
          <div className="px-4 pt-4 pb-24">
            {products.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-cm-text-soft">Aucun produit disponible</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-cm-text-soft font-medium uppercase tracking-wider">Catalogue</span>
                  <span className="text-[10px] text-cm-text-muted">{products.length} produit{products.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {products.map((product, i) => (
                    <CatalogProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "propos" && (
          <div className="px-4 pt-4 pb-8 space-y-3">
            {description && (
              <div className="p-4 bg-cm-elevated rounded-xl border border-cm-border">
                <div className="flex items-start gap-2.5">
                  <Store className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
                  <p className="text-xs text-cm-text-secondary leading-relaxed">{description}</p>
                </div>
              </div>
            )}

            <div className="bg-cm-elevated rounded-xl border border-cm-border divide-y divide-cm-border/50">
              {[
                { icon: Clock, label: "Horaires", value: professional?.hours },
                { icon: MapPin, label: "Adresse", value: address },
                { icon: Phone, label: "Téléphone", value: phone },
                { icon: Mail, label: "Email", value: email },
              ].filter((i) => i.value).map((item) => (
                <div key={item.label} className="flex items-start gap-3 px-4 py-3">
                  <item.icon className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-cm-text-soft uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs text-cm-text mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {deliveryZones.filter((z) => z.isActive).length > 0 && (
              <div className="bg-cm-elevated rounded-xl border border-cm-border p-4">
                <div className="flex items-start gap-3">
                  <Truck className="w-4 h-4 text-cm-text-soft mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-cm-text-soft uppercase tracking-wider">Zones de livraison</p>
                    <div className="mt-1.5 space-y-1">
                      {deliveryZones.filter((z) => z.isActive).map((z) => (
                        <div key={z.id} className="flex items-center justify-between text-xs">
                          <span className="text-cm-text">{z.city}</span>
                          <span className="text-cm-text-soft">
                            {z.price.toLocaleString("fr-FR")} F
                            {z.estimatedDelayHours && <span className="ml-1">· ~{z.estimatedDelayHours}h</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "avis" && (
          <div className="px-4 pt-4 pb-8">
            {allReviews.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-cm-text-soft">Aucun avis pour le moment</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-4 p-4 bg-cm-elevated rounded-xl border border-cm-border">
                  <div className="text-center">
                    <div className="text-3xl font-black text-cm-text">{seller.rating.toFixed(1)}</div>
                    <div className="flex items-center gap-0.5 mt-0.5 justify-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= Math.round(seller.rating) ? "fill-cm-accent text-cm-accent" : "text-cm-border"}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-cm-text-soft mt-0.5">{allReviews.length} avis</p>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    {[5, 4, 3, 2, 1].map((s) => {
                      const count = dist[s] || 0
                      const pct = allReviews.length > 0 ? (count / allReviews.length) * 100 : 0
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <span className="text-[10px] text-cm-text-soft w-3 text-right">{s}</span>
                          <Star className="w-2.5 h-2.5 text-cm-accent" />
                          <div className="flex-1 h-1.5 rounded-full bg-cm-bg overflow-hidden">
                            <div className="h-full rounded-full bg-cm-accent" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[9px] text-cm-text-soft w-6 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {allReviews.map((rev) => (
                    <div key={rev.id} className="flex gap-3">
                      <img src={rev.authorPhoto} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-cm-text">{rev.authorName}</span>
                          <span className="text-[9px] text-cm-text-muted">{formatDate(rev.date)}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-2.5 h-2.5 ${s <= rev.rating ? "fill-cm-accent text-cm-accent" : "text-cm-border"}`} />
                          ))}
                          {rev.isVerifiedPurchase && (
                            <span className="ml-1 text-[8px] text-cm-accent font-semibold">Achat vérifié</span>
                          )}
                        </div>
                        {rev.productName && (
                          <p className="text-[9px] text-cm-text-soft mt-0.5">Sur : {rev.productName}</p>
                        )}
                        <p className="text-xs text-cm-text mt-0.5 leading-relaxed">{rev.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Floating bottom bar */}
      <div className="cm-fixed-bottom z-20 px-4 pb-safe pt-3 bg-cm-elevated/80 backdrop-blur-lg border-t border-cm-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => nav(`/messages/new?seller=${seller.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl bg-cm-text text-white text-xs font-bold cursor-pointer active:scale-[0.98] transition-transform"
          >
            <MessageCircle className="w-4 h-4" />
            Contacter
          </button>
          {phone && (
            <button
              onClick={() => window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}`, "_blank")}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-cm-accent/20 text-cm-accent cursor-pointer active:scale-[0.98] transition-transform shrink-0"
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
