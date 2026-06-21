interface SkeletonProps {
  variant?: "text" | "circle" | "rect" | "card";
  width?: string;
  height?: string;
  className?: string;
}

export default function Skeleton({ variant = "text", width, height, className = "" }: SkeletonProps) {
  const base = "animate-pulse bg-pale-mint/50 rounded-xl";
  const variants = {
    text: "h-3 w-full rounded-md",
    circle: "rounded-full aspect-square",
    rect: "rounded-xl",
    card: "rounded-2xl w-full",
  };
  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      style={width && height ? { width, height } : undefined}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm space-y-3" aria-hidden="true">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width="48px" height="48px" className="shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="rect" className="h-9 flex-1" />
        <Skeleton variant="rect" className="h-9 flex-1" />
      </div>
    </div>
  );
}

export function AISkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-5 border border-pale-mint/15 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton variant="circle" width="32px" height="32px" />
          <Skeleton variant="text" className="w-1/3" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="circle" width="20px" height="20px" className="shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton variant="text" className={`w-${i % 2 === 0 ? "3/4" : "2/3"}`} />
              <Skeleton variant="text" className="w-1/4" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton variant="rect" className="h-14 rounded-full" />
    </div>
  );
}

export function ProCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-pale-mint/20" aria-hidden="true">
      <div className="flex gap-3 p-3">
        <Skeleton variant="circle" width="56px" height="56px" className="shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="w-1/3" />
          <div className="flex gap-1.5">
            <Skeleton variant="rect" className="h-5 w-16 rounded-full" />
            <Skeleton variant="rect" className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="px-3 pb-3 space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-3/4" />
      </div>
    </div>
  );
}
