import { ChevronRight, MapPin } from "lucide-react";
import type { Conversation } from "../types";

interface MissionContextBarProps {
  conversation: Conversation;
}

const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  accepted: { label: "Acceptée", color: "bg-cm-accent-soft text-cm-accent" },
  on_site: { label: "En route", color: "bg-blue-50 text-blue-600" },
  working: { label: "En cours", color: "bg-amber-50 text-amber-600" },
  completed: { label: "Terminée", color: "bg-green-50 text-green-600" },
};

export default function MissionContextBar({ conversation }: MissionContextBarProps) {
  const meta = conversation.metadata;
  const phase = meta.mission_phase;
  const phaseInfo = phase ? PHASE_LABELS[phase] : null;
  const snapshot = meta.job_snapshot;

  return (
    <div className="mx-4 mt-2 mb-1">
      <div className="bg-cm-elevated border border-cm-border rounded-[12px] p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-cm-text-muted">
            Mission #{conversation.missionId.slice(0, 8)}
          </span>
          {phaseInfo && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-[6px] ${phaseInfo.color}`}>
              {phaseInfo.label}
            </span>
          )}
        </div>
        {snapshot.location && (
          <div className="flex items-center gap-1.5 text-[12px] text-cm-text-muted">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{snapshot.location}</span>
          </div>
        )}
        <button
          onClick={() => {}}
          className="mt-2 w-full flex items-center justify-between px-2 py-1.5 rounded-[8px] hover:bg-cm-accent-soft transition-colors text-[12px] text-cm-accent font-medium"
        >
          Voir les détails de la mission
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
