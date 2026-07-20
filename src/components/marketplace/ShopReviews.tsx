import { Star, ChevronDown } from "lucide-react"
import { useState, useMemo } from "react"
import { getReviewsBySeller, getRatingDistribution } from "../../data/marketplaceReviews"

interface ShopReviewsProps {
  sellerId: string
  reviewCount: number
  rating: number
}

export default function ShopReviews({ sellerId, reviewCount, rating }: ShopReviewsProps) {
  const [showAll, setShowAll] = useState(false)

  const allReviews = useMemo(() => getReviewsBySeller(sellerId), [sellerId])
  const displayed = showAll ? allReviews : allReviews.slice(0, 3)
  const dist = useMemo(() => getRatingDistribution(sellerId), [sellerId])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diff === 0) return "Aujourd'hui"
    if (diff === 1) return "Hier"
    if (diff < 7) return `Il y a ${diff} jours`
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  if (reviewCount === 0 || allReviews.length === 0) return null

  return (
    <div className="px-5 pt-5">
      <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Avis clients</h3>

      <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded-xl border border-gray-100">
        <div className="text-center">
          <div className="text-3xl font-black text-[#1A1A1A]">{rating.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 mt-0.5 justify-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "fill-[#F59E0B] text-[#F59E0B]" : "text-gray-200"}`} />
            ))}
          </div>
          <p className="text-[10px] text-[#6B7280] mt-0.5">{allReviews.length} avis</p>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          {[5, 4, 3, 2, 1].map((s) => {
            const count = dist[s] || 0
            const pct = allReviews.length > 0 ? (count / allReviews.length) * 100 : 0
            return (
              <div key={s} className="flex items-center gap-2">
                <span className="text-[10px] text-[#6B7280] w-3 text-right">{s}</span>
                <Star className="w-2.5 h-2.5 text-[#F59E0B]" />
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[9px] text-[#6B7280] w-6 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {displayed.map((rev) => (
          <div key={rev.id} className="flex gap-3">
            <img src={rev.authorPhoto} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1A1A1A]">{rev.authorName}</span>
                <span className="text-[9px] text-[#9CA3AF]">{formatDate(rev.date)}</span>
              </div>
              <div className="flex items-center gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-2.5 h-2.5 ${s <= rev.rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-gray-200"}`} />
                ))}
                {rev.isVerifiedPurchase && (
                  <span className="ml-1 text-[8px] text-[#AECB2A] font-semibold">Achat vérifié</span>
                )}
              </div>
              {rev.productName && (
                <p className="text-[9px] text-[#6B7280] mt-0.5">Sur : {rev.productName}</p>
              )}
              <p className="text-xs text-[#1A1A1A] mt-0.5 leading-relaxed">{rev.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {allReviews.length > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full flex items-center justify-center gap-1 mt-3 py-2.5 text-xs font-semibold text-[#6B7280] cursor-pointer hover:text-[#1A1A1A] transition-colors"
        >
          Voir les {allReviews.length} avis
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
