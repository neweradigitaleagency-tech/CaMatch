import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  trend?: { value: number; positive: boolean };
  icon?: ReactNode;
  onClick?: () => void;
  variant?: "default" | "admin" | "pro";
}

export default function KpiCard({
  label, value, trend, icon, onClick, variant = "default",
}: KpiCardProps) {
  if (variant === "admin" || variant === "pro") {
    return (
      <div
        onClick={onClick}
        className={`bg-white border border-gray-200 rounded-xl p-4 transition-all ${onClick ? "cursor-pointer hover:shadow-md hover:border-gray-300" : ""}`}
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-[12px] font-medium text-gray-500">{label}</span>
          {icon && <span className="text-gray-400">{icon}</span>}
        </div>
        <div className="text-[26px] font-bold text-gray-900 tracking-tight">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {trend.positive ? (
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-600" />
            )}
            <span className={`text-[11px] font-medium ${trend.positive ? "text-green-600" : "text-red-600"}`}>
              {trend.positive ? "+" : ""}{trend.value}%
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-cm-elevated border border-cm-border rounded-xl p-4 transition-all ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[12px] font-medium text-cm-text-soft">{label}</span>
        {icon && <span className="text-cm-text-muted">{icon}</span>}
      </div>
      <div className="text-[26px] font-bold text-cm-text tracking-tight">{value}</div>
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          {trend.positive ? (
            <TrendingUp className="w-3.5 h-3.5 text-cm-accent" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={`text-[11px] font-medium ${trend.positive ? "text-cm-accent" : "text-red-500"}`}>
            {trend.positive ? "+" : ""}{trend.value}%
          </span>
        </div>
      )}
    </div>
  );
}
