import { useState } from "react"
import { motion } from "motion/react"
import { Star, PenLine, CheckCircle2 } from "lucide-react"
import type { MarketplaceOrder } from "../../types/marketplace"
import { useMarketplaceReviewStore } from "../../stores/marketplaceReviewStore"

interface OrderReviewCardProps {
  order: MarketplaceOrder
}

export default function OrderReviewCard({ order }: OrderReviewCardProps) {
  const { addReview, getReviewByOrder } = useMarketplaceReviewStore()
  const existing = getReviewByOrder(order.id)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (order.status !== "delivered") return null

  const seller = order.items[0]

  if (existing) {
    return (
      <div className="bg-cm-elevated rounded-xl p-4 border border-cm-border" aria-live="polite">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-cm-green" />
          <h2 className="text-[13px] font-bold text-cm-text">Avis déposé</h2>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-4 h-4 ${s <= existing.rating ? "text-cm-amber fill-cm-amber" : "text-cm-border-soft"}`}
            />
          ))}
          <span className="text-[11px] text-cm-text-muted ml-2">
            {new Date(existing.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </span>
        </div>
        <p className="text-[12px] text-cm-text leading-relaxed">
          {existing.comment || "Merci pour votre évaluation."}
        </p>
      </div>
    )
  }

  const valid = rating >= 1 && comment.trim().length >= 10

  const handleSubmit = () => {
    if (!valid || submitting || !seller) return
    setSubmitting(true)
    setTimeout(() => {
      addReview({
        orderId: order.id,
        sellerId: seller.sellerId,
        sellerName: seller.sellerName,
        productName: order.items.length === 1 ? seller.productName : undefined,
        rating,
        comment: comment.trim(),
      })
      setSubmitting(false)
    }, 600)
  }

  return (
    <div className="bg-cm-elevated rounded-xl p-4 border border-cm-border">
      <div className="flex items-center gap-2 mb-1">
        <PenLine className="w-4 h-4 text-cm-forest" />
        <h2 className="text-[13px] font-bold text-cm-text">Évaluez votre achat</h2>
      </div>
      <p className="text-[11px] text-cm-text-soft mb-3">
        Votre avis aide d'autres acheteurs et valorise les bons vendeurs.
      </p>

      <div className="flex items-center gap-1.5 mb-3">
        {[1, 2, 3, 4, 5].map((s) => {
          const active = (hover || rating) >= s
          return (
            <motion.button
              key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              whileTap={{ scale: 0.85 }}
              className="cursor-pointer p-0.5"
              aria-label={`${s} étoile${s > 1 ? "s" : ""}`}
            >
              <Star className={`w-7 h-7 transition-colors ${active ? "text-cm-amber fill-cm-amber" : "text-cm-border-soft"}`} />
            </motion.button>
          )
        })}
        <span className="text-[11px] font-bold text-cm-text ml-1">
          {rating === 0 ? "Touchez pour noter" : `${rating}/5`}
        </span>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={300}
        className="w-full px-4 py-3 rounded-xl bg-cm-surface border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft resize-none mb-3"
        placeholder="Partagez votre expérience : qualité, livraison, vendeur..."
      />

      <button
        onClick={handleSubmit}
        disabled={!valid || submitting}
        className="w-full h-10 rounded-xl bg-cm-text text-cm-elevated text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
      >
        {submitting ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "Publier mon avis"
        )}
      </button>
      <p className="text-[10px] text-cm-text-muted text-center mt-2">
        {comment.trim().length >= 10 ? "" : "10 caractères minimum pour votre commentaire."}
      </p>
    </div>
  )
}
