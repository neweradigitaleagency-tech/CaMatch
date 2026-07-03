import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import ProfileSection from "./ProfileSection";
import { StarRating } from "../ui/ProCard";
import type { SectionWithReviewsProps } from "./types";

export default function ReviewsSection({
  mode, editing, reviews, onReplyToReview,
}: SectionWithReviewsProps) {
  const [showAll, setShowAll] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [replyingIndex, setReplyingIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = showAll ? reviews : reviews.slice(0, 3);
    if (filterRating) {
      list = list.filter((r) => Math.round(r.rating) === filterRating);
    }
    return list;
  }, [reviews, showAll, filterRating]);

  const ratingDistribution = useMemo(() => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const s = Math.round(r.rating);
      dist[s] = (dist[s] || 0) + 1;
    });
    return dist;
  }, [reviews]);

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const handleSendReply = (index: number) => {
              const text = (replyTexts[index] || "").trim();
    if (!text) return;
    onReplyToReview?.(index, text);
    setReplyTexts((prev) => ({ ...prev, [index]: "" }));
    setReplyingIndex(null);
  };

  return (
    <ProfileSection title="Avis" subtitle={reviews.length > 0 ? `${reviews.length} avis` : undefined}>
      <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
        {reviews.length === 0 ? (
          <p className="text-[12px] font-semibold text-gray-400 text-center py-3">Aucun avis pour le moment</p>
        ) : (
          <>
            {/* Rating summary */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
              <div className="text-center">
                <span className="text-[32px] font-black text-gray-900">{avgRating}</span>
                <StarRating rating={Number(avgRating)} size="sm" />
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button key={star} onClick={() => setFilterRating(filterRating === star ? null : star)}
                    className={`flex items-center gap-2 text-[9px] font-bold cursor-pointer ${filterRating === star ? "text-gray-900" : "text-gray-400"}`}>
                    <span className="w-8">{star}★</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-900 rounded-full transition-all"
                        style={{ width: `${reviews.length > 0 ? ((ratingDistribution[star] ?? 0) / reviews.length) * 100 : 0}%` }} />
                    </div>
                    <span className="w-6 text-right">{ratingDistribution[star] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Review list */}
            <div className="space-y-4">
              {filtered.map((review, i) => {
                const realIndex = reviews.indexOf(review);
                return (
                  <div key={i} className={`${i > 0 ? "pt-4 border-t border-gray-100" : ""}`}>
                    <div className="flex items-start gap-3">
                      <img src={review.clientAvatar} alt={review.clientName}
                        className="w-9 h-9 rounded-full bg-gray-200 object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] font-black text-gray-900">{review.clientName}</p>
                          <span className="text-[9px] font-semibold text-gray-400">{review.createdAt}</span>
                        </div>
                        <StarRating rating={review.rating} size="xs" />
                        <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">{review.comment}</p>

                        {review.photos && review.photos.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {review.photos.map((photo, pi) => (
                              <img key={pi} src={photo} alt=""
                                className="w-16 h-16 rounded-[10px] object-cover bg-gray-100" />
                            ))}
                          </div>
                        )}

                        {/* Pro reply */}
                        {review.reply ? (
                          <div className="mt-2.5 ml-3 pl-3 border-l-2 border-gray-200">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Votre réponse</p>
                            <p className="text-[11px] text-gray-600 mt-0.5">{review.reply.text}</p>
                          </div>
                        ) : mode !== "client" && editing && (
                          <div className="mt-2.5">
                            {replyingIndex === realIndex ? (
                              <div className="flex gap-2">
                                <textarea
                                  value={replyTexts[realIndex] || ""}
                                  onChange={(e) => setReplyTexts((prev) => ({ ...prev, [realIndex]: e.target.value }))}
                                  placeholder="Votre réponse..."
                                  className="flex-1 text-[11px] rounded-[10px] border border-gray-200 px-3 py-2 resize-none min-h-[36px] outline-none focus:ring-1 focus:ring-gray-300" />
                                <button onClick={() => handleSendReply(realIndex)}
                                  className="shrink-0 h-full px-3 rounded-[10px] bg-gray-900 text-white text-[9px] font-black uppercase tracking-wider cursor-pointer active:scale-95 hover:bg-gray-800">
                                  Publier
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setReplyingIndex(realIndex)}
                                className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors">
                                <MessageCircle className="w-3 h-3" /> Répondre
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {reviews.length > 3 && (
              <button onClick={() => setShowAll(!showAll)}
                className="flex items-center justify-center gap-1.5 w-full mt-4 pt-4 border-t border-gray-100 text-[11px] font-black text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-800 transition-colors">
                {showAll ? "Réduire" : `Voir tous les avis (${reviews.length})`}
                {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </>
        )}
      </div>
    </ProfileSection>
  );
}
