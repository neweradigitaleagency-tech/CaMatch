import type { MissionStatus } from "../../types";
import { MISSION_STATUS_LABELS } from "../../types";

interface StatusBadgeProps {
  status: MissionStatus;
  className?: string;
}

const STATUS_STYLES: Record<MissionStatus, string> = {
  created: "bg-cm-border-soft text-cm-text-muted",
  accepted: "bg-cm-accent-soft text-cm-accent border border-cm-accent/30",
  en_route: "bg-cm-border-soft text-cm-text-soft",
  in_progress: "bg-cm-accent-soft text-cm-accent border border-cm-accent/30",
  completed: "bg-cm-accent text-white",
  paid: "bg-cm-text text-white",
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
