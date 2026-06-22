import type { MissionStatus } from "../../types";
import { MISSION_STATUS_LABELS } from "../../types";

interface StatusBadgeProps {
  status: MissionStatus;
  className?: string;
}

const STATUS_STYLES: Record<MissionStatus, string> = {
  created: "bg-[rgba(69,123,157,0.20)] border border-[rgba(69,123,157,0.35)] text-ca-info",
  accepted: "bg-[rgba(244,162,97,0.20)] border border-[rgba(244,162,97,0.35)] text-[#B8632E]",
  en_route: "bg-[rgba(69,123,157,0.20)] border border-[rgba(69,123,157,0.35)] text-ca-info",
  in_progress: "bg-[rgba(244,162,97,0.20)] border border-[rgba(244,162,97,0.35)] text-[#B8632E]",
  completed: "bg-[rgba(82,183,136,0.20)] border border-[rgba(82,183,136,0.35)] text-ca-green-primary",
  paid: "bg-[rgba(82,183,136,0.20)] border border-[rgba(82,183,136,0.35)] text-ca-green-primary",
  reviewed: "bg-[rgba(82,183,136,0.20)] border border-[rgba(82,183,136,0.35)] text-ca-green-primary",
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center h-6 px-2.5 rounded-[9999px] text-[11px] font-semibold backdrop-blur-[4px] ${STATUS_STYLES[status]} ${className}`}
    >
      {MISSION_STATUS_LABELS[status]}
    </span>
  );
}
