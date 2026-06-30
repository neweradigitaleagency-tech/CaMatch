import type { MissionStatus } from "../../types";
import { MISSION_STATUS_LABELS } from "../../types";

interface StatusBadgeProps {
  status: MissionStatus;
  className?: string;
}

const STATUS_STYLES: Record<MissionStatus, string> = {
  draft: "bg-cm-border-soft text-cm-text-muted",
  published: "bg-cm-accent-soft text-cm-accent border border-cm-accent/30",
  pending: "bg-amber-50 text-amber-600 border border-amber-200",
  accepted: "bg-cm-accent-soft text-cm-accent border border-cm-accent/30",
  refused: "bg-red-50 text-red-600 border border-red-200",
  paid: "bg-cm-text text-white",
  in_progress: "bg-cm-accent-soft text-cm-accent border border-cm-accent/30",
  completed: "bg-cm-accent text-white",
  client_validation: "bg-amber-50 text-amber-600 border border-amber-200",
  disputed: "bg-red-50 text-red-600 border border-red-200",
  closed: "bg-cm-border-soft text-cm-text-soft",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
  refunded: "bg-red-50 text-red-600 border border-red-200",
  // Legacy
  created: "bg-cm-border-soft text-cm-text-muted",
  en_route: "bg-cm-border-soft text-cm-text-soft",
  reviewed: "bg-cm-accent text-white",
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
