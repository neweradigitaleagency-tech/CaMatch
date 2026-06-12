import { cn, getTrustScoreColor, getTrustScoreBarColor } from "@/lib/utils";

interface TrustScoreBarProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function TrustScoreBar({ score, size = "md", showLabel = true, className }: TrustScoreBarProps) {
  const percentage = Math.min((score / 1000) * 100, 100);
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-secondary font-medium">Score de confiance</span>
          <span className={cn("text-xs font-bold", getTrustScoreColor(score))}>
            {score}/1000
          </span>
        </div>
      )}
      <div className={cn("w-full bg-gray-100 rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn(heights[size], "rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]", getTrustScoreBarColor(score))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
