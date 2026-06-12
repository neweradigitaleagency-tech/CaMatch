import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "amber" | "blue" | "gray" | "red";
  size?: "sm" | "md";
  className?: string;
}

const variants = {
  green: "bg-primary-50 text-primary-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
  red: "bg-red-50 text-red-700",
};

const sizes = {
  sm: "text-2xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

export function Badge({ children, variant = "gray", size = "sm", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full font-medium", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}

export function VerificationBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary-700 text-2xs font-medium px-2 py-0.5">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      Vérifié
    </span>
  );
}

export function BadgeLevel({ level }: { level: string }) {
  const colors: Record<string, string> = {
    BRONZE: "bg-amber-100 text-amber-800",
    SILVER: "bg-gray-200 text-gray-700",
    GOLD: "bg-yellow-100 text-yellow-800",
    ELITE: "bg-purple-100 text-purple-700",
    NONE: "bg-gray-100 text-gray-500",
  };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full text-2xs font-bold px-2 py-0.5", colors[level] ?? colors.NONE)}>
      {level === "GOLD" && "🥇"}
      {level === "SILVER" && "🥈"}
      {level === "BRONZE" && "🥉"}
      {level === "ELITE" && "💎"}
      {level}
    </span>
  );
}
