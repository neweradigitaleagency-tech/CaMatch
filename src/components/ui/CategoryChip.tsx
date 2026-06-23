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
          ? "bg-cm-text text-white shadow-cm-sm border border-cm-text"
          : "bg-cm-elevated border border-cm-border text-cm-text hover:bg-cm-accent-soft"
      } ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[13px] font-semibold">{label}</span>
      {count !== undefined && (
        <span className={`text-[11px] font-medium ${active ? "text-white/70" : "text-cm-text-muted"}`}>
          {count}
        </span>
      )}
    </button>
  );
}
