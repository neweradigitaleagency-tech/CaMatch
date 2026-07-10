interface SkeletonProps {
  variant?: "text" | "circle" | "rect" | "card" | "squircle";
  width?: string;
  height?: string;
  className?: string;
}

export default function Skeleton({ variant = "text", width, height, className = "" }: SkeletonProps) {
  const base = "bg-gradient-to-r from-cm-border via-cm-elevated to-cm-border bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]";
  const variants = {
    text: "h-3 w-full rounded-md",
    circle: "rounded-full aspect-square",
    rect: "rounded-[var(--radius-cm-lg)]",
    card: "rounded-[var(--radius-cm-bento)] w-full",
    squircle: "rounded-[var(--radius-cm-squircle)] w-full aspect-square",
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
    <div className="bg-cm-elevated rounded-[var(--radius-cm-card)] p-4 border border-cm-border space-y-3" aria-hidden="true">
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
      <div className="bg-cm-elevated rounded-[var(--radius-cm-card)] p-5 border border-cm-border space-y-4">
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
      <Skeleton variant="rect" className="h-14 rounded-[9999px]" />
    </div>
  );
}

export function ProCardSkeleton() {
  return (
    <div className="bg-cm-elevated rounded-[var(--radius-cm-card)] overflow-hidden border border-cm-border" aria-hidden="true">
      <div className="flex gap-3 p-3">
        <Skeleton variant="circle" width="56px" height="56px" className="shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="w-1/3" />
          <div className="flex gap-1.5">
            <Skeleton variant="rect" className="h-5 w-16 rounded-[9999px]" />
            <Skeleton variant="rect" className="h-5 w-20 rounded-[9999px]" />
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

export function ProCardSkeletonSquircle() {
  return (
    <div className="bg-cm-elevated rounded-[var(--radius-cm-card)] overflow-hidden border border-cm-border" aria-hidden="true">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton variant="squircle" width="64px" height="64px" className="shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton variant="text" className="w-2/3" />
            <Skeleton variant="text" className="w-1/3" />
          </div>
        </div>
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-4/5" />
        <div className="flex gap-2 pt-1">
          <Skeleton variant="rect" className="h-9 w-24 rounded-[9999px]" />
          <Skeleton variant="rect" className="h-9 w-28 rounded-[9999px]" />
        </div>
      </div>
    </div>
  );
}
