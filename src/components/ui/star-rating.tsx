import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
  showValue?: boolean;
}

export function StarRating({ rating, size = "sm", showValue = true }: StarRatingProps) {
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className="inline-flex items-center gap-1">
      <Star className={iconSize + " fill-amber-400 text-amber-400"} />
      <span className={textSize + " font-semibold text-text-primary"}>{rating}</span>
      {showValue && <span className={textSize + " text-text-tertiary"}>/ 5</span>}
    </span>
  );
}
