import type { LucideIcon } from "lucide-react";

interface CategoryChipProps {
  icon: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function CategoryChip({
  icon: Icon,
  label,
  count,
  active = false,
  onClick,
  className = "",
}: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[9999px] transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap ${
        active
          ? "bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-white shadow-[0_4px_16px_rgba(45,106,79,0.20)]"
          : "bg-[rgba(255,255,255,0.55)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] text-ca-text-primary hover:bg-[rgba(255,255,255,0.75)]"
      } ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[13px] font-semibold">{label}</span>
      {count !== undefined && (
        <span className={`text-[11px] font-medium ${active ? "text-white/70" : "text-ca-text-muted"}`}>
          {count}
        </span>
      )}
    </button>
  );
}
