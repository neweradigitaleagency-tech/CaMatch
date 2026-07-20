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
          ? "text-red-600 hover:bg-red-50"
          : "text-[#2B2B2B] hover:bg-gray-100"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
        danger
          ? "bg-red-100"
          : "bg-[rgba(43,43,43,0.08)] backdrop-blur-sm border border-[rgba(43,43,43,0.10)]"
      }`}>
        {loading ? (
          <LoaderCircle className="w-4 h-4 text-[#2B2B2B] animate-spin" />
        ) : (
          <Icon className={`w-4 h-4 ${danger ? "text-red-600" : "text-[#2B2B2B]"}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[14px] font-medium block truncate">{label}</span>
        {subtitle && (
          <span className="text-[11px] text-gray-400 block truncate mt-0.5">{subtitle}</span>
        )}
      </div>
      {badge != null && (
        <span className="text-[10px] font-bold text-white bg-[#7FD356] px-2 py-0.5 rounded-full shrink-0">{badge}</span>
      )}
      {trailing === "chevron" && !loading && (
        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
      )}
    </button>
  );
}
