import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  className?: string;
}

export default function VerifiedBadge({ className = "" }: VerifiedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-cm-accent text-white ${className}`}
    >
      <BadgeCheck className="w-2.5 h-2.5" />
      Vérifié
    </span>
  );
}
