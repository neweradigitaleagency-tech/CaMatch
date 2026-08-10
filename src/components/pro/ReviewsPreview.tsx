import { motion } from "motion/react";
import { Star, ChevronRight } from "lucide-react";
import RatingStars from "../ui/RatingStars";
import type { MockReview } from "../../services/mockData";

interface ReviewsPreviewProps {
  reviews: MockReview[];
  rating: number;
  reviewCount: number;
  onViewAll: () => void;
}

export default function ReviewsPreview({ reviews, rating, reviewCount, onViewAll }: ReviewsPreviewProps) {
  if (reviews.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="bg-cm-elevated border border-cm-border rounded-[20px] p-4 shadow-sm mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-[14px] font-bold text-cm-text">Avis clients</span>
        </div>
        <button
          onClick={onViewAll}
          className="text-[11px] font-medium text-cm-text-soft cursor-pointer hover:underline flex items-center gap-0.5"
        >
          Voir tout <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-[26px] font-extrabold text-cm-text">{rating.toFixed(1)}</span>
        <RatingStars rating={rating} size={14} />
        <span className="text-[11px] text-cm-text-muted">({reviewCount} avis)</span>
      </div>

      <div className="space-y-3">
        {reviews.slice(0, 2).map((r) => (
          <div key={r.id} className="bg-cm-surface rounded-[14px] p-3">
            <div className="flex items-center gap-2.5 mb-1.5">
              {r.clientAvatar ? (
                <img src={r.clientAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-cm-border-soft flex items-center justify-center">
                  <Star className="w-3 h-3 text-cm-text-muted" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-cm-text truncate">{r.clientName}</p>
                <RatingStars rating={r.rating} size={10} />
              </div>
              <span className="text-[9px] text-cm-text-muted shrink-0">
                {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            </div>
            <p className="text-[11px] text-cm-text-soft line-clamp-2">{r.comment}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
