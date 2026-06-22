import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  className?: string;
}

export default function VerifiedBadge({ className = "" }: VerifiedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[9999px] text-[11px] font-semibold bg-[rgba(82,183,136,0.20)] border border-[rgba(82,183,136,0.50)] text-ca-green-primary backdrop-blur-[4px] ${className}`}
    >
      <BadgeCheck className="w-3 h-3" />
      Vérifié
    </span>
  );
}
