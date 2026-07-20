import type { MissionStatus } from "../../types";
import { MISSION_STATUS_LABELS } from "../../types";

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
}

const MISSION_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-500",
  published: "bg-blue-50 text-blue-600 border border-blue-200",
  pending: "bg-amber-50 text-amber-600 border border-amber-200",
  accepted: "bg-green-50 text-green-600 border border-green-200",
  quote_requested: "bg-amber-50 text-amber-600 border border-amber-200",
  quote_sent: "bg-blue-50 text-blue-600 border border-blue-200",
  quote_accepted: "bg-green-50 text-green-600 border border-green-200",
  refused: "bg-red-50 text-red-600 border border-red-200",
  paid: "bg-gray-900 text-white",
  in_progress: "bg-purple-50 text-purple-600 border border-purple-200",
  completed: "bg-gray-900 text-white",
  client_validation: "bg-amber-50 text-amber-600 border border-amber-200",
  disputed: "bg-red-50 text-red-600 border border-red-200",
  closed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
  refunded: "bg-red-50 text-red-600 border border-red-200",
  created: "bg-gray-100 text-gray-500",
  en_route: "bg-blue-50 text-blue-600 border border-blue-200",
  arrived: "bg-blue-50 text-blue-600 border border-blue-200",
  client_validated: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  reviewed: "bg-gray-900 text-white",
};

const GENERIC_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" },
  approved: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" },
  completed: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" },
  success: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" },
  verified: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" },
  pending: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  submitted: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  under_review: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  in_progress: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  en_attente: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  actif: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" },
  blocked: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
  rejeté: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
  rejected: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
  suspended: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
  disabled: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
  inactive: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
};

export default function StatusBadge({
  status,
  label,
  size = "sm",
  showDot = false,
  className = "",
}: StatusBadgeProps) {
  const missionStyle = MISSION_STYLES[status];
  if (missionStyle) {
    const h = size === "sm" ? "h-6" : size === "md" ? "h-7" : "h-8";
    const textSize = size === "sm" ? "text-[11px]" : "text-[12px]";
    return (
      <span className={`inline-flex items-center ${h} px-2.5 rounded-[9999px] ${textSize} font-semibold ${missionStyle} ${className}`}>
        {label ?? MISSION_STATUS_LABELS[status as MissionStatus] ?? status}
      </span>
    );
  }

  const generic = GENERIC_STYLES[status.toLowerCase()] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  const h = size === "sm" ? "h-5" : size === "md" ? "h-6" : "h-7";
  const textSize = size === "sm" ? "text-[11px]" : "text-[12px]";

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 ${h} rounded-full ${generic.bg} ${generic.text} ${textSize} font-medium ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${generic.dot}`} />}
      {label ?? status}
    </span>
  );
}
