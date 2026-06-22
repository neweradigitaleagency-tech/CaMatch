import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export default function RatingStars({
  rating,
  max = 5,
  size = 14,
  interactive = false,
  onRate,
  showValue = false,
  reviewCount,
  className = "",
}: RatingStarsProps) {
  const displayRating = rating;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const star = i + 1;
          const filled = star <= Math.floor(displayRating);
          const half = !filled && star - 0.5 <= displayRating;
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate?.(star)}
              className={`${interactive ? "cursor-pointer active:scale-90 transition-transform" : "cursor-default"}`}
            >
              <Star
                size={size}
                className={`transition-all duration-150 ${
                  filled
                    ? "fill-ca-warning text-ca-warning"
                    : half
                    ? "fill-ca-warning/50 text-ca-warning"
                    : "fill-[rgba(232,224,208,0.50)] text-[rgba(232,224,208,0.50)]"
                }`}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-[13px] font-semibold text-ca-text-primary ml-1">
          {displayRating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-[12px] text-ca-text-muted ml-0.5">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
