import { ChevronRight, LoaderCircle } from "lucide-react";
import type { MenuItemConfig } from "../../data/menuConfig";

interface DrawerItemProps extends MenuItemConfig {
  onClick?: () => void;
}

export default function DrawerItem({
  icon: Icon, label, subtitle, trailing = "chevron", badge, danger, disabled, loading, onClick,
}: DrawerItemProps) {
  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer text-left transition-all active:scale-[0.98] ${
        danger
          ? "text-cm-error hover:bg-red-50"
          : "text-cm-text hover:bg-cm-surface"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
        danger
          ? "bg-red-100"
          : "bg-cm-glass-dark-bg backdrop-blur-sm border border-cm-glass-dark-border"
      }`}>
        {loading ? (
          <LoaderCircle className="w-4 h-4 text-cm-text animate-spin" />
        ) : (
          <Icon className={`w-4 h-4 ${danger ? "text-cm-error" : "text-cm-text"}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[14px] font-medium block truncate">{label}</span>
        {subtitle && (
          <span className="text-[11px] text-cm-text-muted block truncate mt-0.5">{subtitle}</span>
        )}
      </div>
      {badge != null && (
        <span className="text-[10px] font-bold text-white bg-cm-accent px-2 py-0.5 rounded-full shrink-0">{badge}</span>
      )}
      {trailing === "chevron" && !loading && (
        <ChevronRight className="w-4 h-4 text-cm-border shrink-0" />
      )}
    </button>
  );
}
