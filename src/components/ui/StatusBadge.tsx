import type { MissionStatus } from "../../types";
import { MISSION_STATUS_LABELS } from "../../types";

interface StatusBadgeProps {
  status: MissionStatus;
  className?: string;
}

const STATUS_STYLES: Record<MissionStatus, string> = {
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

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center h-6 px-2.5 rounded-[9999px] text-[11px] font-semibold ${STATUS_STYLES[status]} ${className}`}
    >
      {MISSION_STATUS_LABELS[status]}
    </span>
  );
}
