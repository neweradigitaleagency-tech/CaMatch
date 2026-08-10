import { MapPin, Calendar, Clock } from "lucide-react";
import CommissionBreakdown from "./CommissionBreakdown";
import { formatXOF } from "./dashboard";

export interface MissionSummaryData {
  clientName: string;
  clientAvatarUrl?: string;
  serviceName: string;
  description: string;
  address: string;
  scheduledDate?: string;
  scheduledTime?: string;
  budgetMinXOF?: number;
  budgetMaxXOF?: number;
  amountXOF?: number;
  urgency?: "low" | "medium" | "high" | "emergency";
  distanceKm?: string;
  travelMinutes?: string;
}

interface MissionSummaryProps {
  mission: MissionSummaryData;
  commissionPercent: number;
}

export default function MissionSummary({ mission, commissionPercent }: MissionSummaryProps) {
  const estimateXOF =
    mission.amountXOF ??
    (mission.budgetMinXOF && mission.budgetMaxXOF
      ? Math.round((mission.budgetMinXOF + mission.budgetMaxXOF) / 2)
      : mission.budgetMinXOF ?? 0);

  const urgencyLabel =
    mission.urgency === "high" ? "Urgent"
    : mission.urgency === "emergency" ? "Urgence"
    : mission.urgency === "low" ? "Faible"
    : "Normal";

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-cm-surface flex items-center justify-center text-[20px] overflow-hidden">
          {mission.clientAvatarUrl ? (
            <img src={mission.clientAvatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{mission.clientName.charAt(0)}</span>
          )}
        </div>
        <div>
          <p className="text-[15px] font-bold text-cm-text">{mission.clientName}</p>
          <p className="text-[11px] text-cm-text-muted">Client</p>
        </div>
      </div>

      <p className="text-[13px] font-bold text-cm-text mb-1">{mission.serviceName}</p>
      <p className="text-[12px] text-cm-text-soft mb-3">{mission.description}</p>

      <div className="flex items-center gap-2 text-[12px] text-cm-text-soft mb-4">
        <MapPin className="w-3 h-3 text-cm-accent shrink-0" />
        <span>{mission.address}</span>
      </div>

      {(mission.scheduledDate || mission.scheduledTime) && (
        <div className="flex items-center gap-3 text-[12px] text-cm-text-soft mb-4">
          {mission.scheduledDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cm-accent" />
              {new Date(mission.scheduledDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
            </span>
          )}
          {mission.scheduledTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-cm-accent" />
              {mission.scheduledTime}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4">
        {mission.distanceKm && (
          <div className="bg-cm-surface rounded-[12px] p-3 text-center">
            <p className="text-[10px] text-cm-text-soft">Distance</p>
            <p className="text-[14px] font-bold text-cm-text">{mission.distanceKm}</p>
          </div>
        )}
        {mission.travelMinutes && (
          <div className="bg-cm-surface rounded-[12px] p-3 text-center">
            <p className="text-[10px] text-cm-text-soft">Temps estimé</p>
            <p className="text-[14px] font-bold text-cm-text">{mission.travelMinutes}</p>
          </div>
        )}
        <div className="bg-cm-surface rounded-[12px] p-3 text-center">
          <p className="text-[10px] text-cm-text-soft">Budget</p>
          <p className="text-[14px] font-bold text-cm-text">
            {mission.budgetMinXOF && mission.budgetMaxXOF
              ? `${formatXOF(mission.budgetMinXOF)} - ${formatXOF(mission.budgetMaxXOF)}`
              : formatXOF(estimateXOF)}
          </p>
        </div>
        {mission.urgency && (
          <div className="bg-cm-surface rounded-[12px] p-3 text-center">
            <p className="text-[10px] text-cm-text-soft">Urgence</p>
            <p className={`text-[14px] font-bold ${mission.urgency === "high" || mission.urgency === "emergency" ? "text-cm-error" : "text-cm-amber"}`}>
              {urgencyLabel}
            </p>
          </div>
        )}
      </div>

      <CommissionBreakdown subtotalXOF={estimateXOF} percent={commissionPercent} />
    </div>
  );
}
