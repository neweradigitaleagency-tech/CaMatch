import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  dangerous?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export default function SettingsRow({
  icon: Icon, label, subtitle, trailing, onClick, dangerous, disabled, loading,
}: SettingsRowProps) {
  const content = (
    <div className={`w-full flex items-center gap-3 px-4 py-3.5 text-left min-h-[56px] ${
      dangerous ? "text-cm-error" : "text-cm-text"
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        dangerous ? "bg-red-100" : "bg-cm-surface"
      }`}>
        <Icon className={`w-4 h-4 ${dangerous ? "text-cm-error" : "text-cm-text"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[14px] font-semibold block truncate">{label}</span>
        {subtitle && (
          <span className="text-[11px] text-cm-text-muted block truncate mt-0.5">{subtitle}</span>
        )}
      </div>
      {loading ? (
        <div className="w-5 h-5 rounded-full border-2 border-cm-border border-t-cm-text animate-spin shrink-0" />
      ) : trailing != null ? (
        <span className="shrink-0">{trailing}</span>
      ) : onClick ? (
        <ChevronRight className="w-4 h-4 text-cm-border shrink-0" />
      ) : null}
    </div>
  );

  if (disabled) {
    return (
      <div className={`opacity-40 cursor-not-allowed ${dangerous ? "" : ""}`}>
        {content}
      </div>
    );
  }

  if (!onClick) {
    return <div className="cursor-default">{content}</div>;
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full cursor-pointer active:scale-[0.98] transition-transform text-left ${
        dangerous
          ? "hover:bg-red-50"
          : "hover:bg-cm-surface"
      }`}
    >
      {content}
    </button>
  );
}
