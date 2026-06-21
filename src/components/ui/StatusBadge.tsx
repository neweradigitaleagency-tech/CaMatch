import type { MissionStatus } from "../../types";
import { MISSION_STATUS_LABELS } from "../../types";

interface StatusBadgeProps {
  status: MissionStatus;
  className?: string;
}

const STATUS_STYLES: Record<MissionStatus, string> = {
  created: "bg-cm-info/10 text-cm-info",
  accepted: "bg-cm-warning/10 text-cm-warning",
  en_route: "bg-cm-blue/10 text-cm-blue",
  in_progress: "bg-cm-purple/10 text-cm-purple",
  completed: "bg-cm-green/10 text-cm-green",
  paid: "bg-cm-success/10 text-cm-success",
  reviewed: "bg-cm-green/20 text-cm-green-deep",
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center h-6 px-2.5 rounded-full text-caption font-medium ${STATUS_STYLES[status]} ${className}`}
    >
      {MISSION_STATUS_LABELS[status]}
    </span>
  );
}
