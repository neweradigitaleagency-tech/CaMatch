import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, MessageCircle, Check, MapPin,
  Wrench, CheckCircle, Star, AlertTriangle,
  Navigation
} from "lucide-react";
import type { Mission, MissionStatus } from "../types";
import { useMissionRealtime } from "../hooks/useMissionRealtime";

interface MissionActiveCardProps {
  mission: Mission;
  conversationId?: string;
  proRating?: number;
  proReviewCount?: number;
  proTitle?: string;
  onViewDetails: (mission: Mission) => void;
}

const BADGE: Record<string, { label: string; style: string }> = {
  accepted: { label: "Mission acceptée", style: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  paid: { label: "Mission acceptée", style: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  en_route: { label: "Professionnel en route", style: "bg-blue-50 text-blue-700 border border-blue-200" },
  arrived: { label: "Arrivé sur place", style: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  in_progress: { label: "Intervention en cours", style: "bg-violet-50 text-violet-700 border border-violet-200" },
  completed: { label: "Mission terminée", style: "bg-cm-text text-white" },
  client_validation: { label: "Mission terminée", style: "bg-cm-text text-white" },
  client_validated: { label: "Mission terminée", style: "bg-cm-text text-white" },
  disputed: { label: "Litige en cours", style: "bg-red-50 text-red-700 border border-red-200" },
} as Record<string, { label: string; style: string }>;

const TIMELINE_STEPS: { icon: any; label: string }[] = [
  { icon: Check, label: "Acceptée" },
  { icon: Navigation, label: "En route" },
  { icon: MapPin, label: "Sur place" },
  { icon: Wrench, label: "Intervention" },
  { icon: CheckCircle, label: "Terminée" },
];

const STATUS_TO_STEP: Record<string, number> = {
  accepted: 0,
  paid: 0,
  en_route: 1,
  arrived: 2,
  in_progress: 3,
  completed: 4,
  client_validation: 4,
  client_validated: 4,
};

const DOT_COLORS: Record<string, { bg: string; pulse: string }> = {
  accepted: { bg: "bg-emerald-500", pulse: "" },
  paid: { bg: "bg-emerald-500", pulse: "" },
  en_route: { bg: "bg-blue-500", pulse: "" },
  arrived: { bg: "bg-indigo-500", pulse: "" },
  in_progress: { bg: "bg-violet-500", pulse: "" },
};

function getBadge(status: string) {
  const entry = BADGE[status];
  return entry ?? { label: "Mission acceptée", style: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
}

function getDotColor(status: MissionStatus) {
  return DOT_COLORS[status] || { bg: "bg-cm-accent", pulse: "" };
}

function getContextText(mission: Mission): string {
  const s = mission.status;
  if (s === "accepted") return "Professionnel assigné";
  if (s === "paid") return "Paiement confirmé";
  if (s === "en_route") {
    if (mission.estimatedArrivalMinutes != null)
      return `Arrivée estimée : ${mission.estimatedArrivalMinutes} min`;
    return "Professionnel en route";
  }
  if (s === "arrived") return "Le professionnel est arrivé";
  if (s === "in_progress") {
    if (mission.inProgressAt) {
      const mins = Math.floor((Date.now() - new Date(mission.inProgressAt).getTime()) / 60000);
      if (mins < 1) return "Intervention en cours";
      return `Intervention commencée il y a ${mins} min`;
    }
    return "Intervention en cours";
  }
  if (s === "completed" || s === "client_validation" || s === "client_validated") {
    if (s === "client_validation") return "En attente de votre validation";
    if (mission.completedAt) {
      const t = new Date(mission.completedAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `Mission terminée à ${t}`;
    }
    return "Mission terminée";
  }
  if (s === "disputed") return "Support impliqué";
  return "";
}

function isFinalState(status: MissionStatus): boolean {
  return ["completed", "client_validation", "client_validated"].includes(status);
}

function isTrackingState(status: MissionStatus): boolean {
  return ["en_route", "arrived", "in_progress"].includes(status);
}

export default function MissionActiveCard({
  mission,
  conversationId,
  proRating,
  proReviewCount,
  proTitle,
  onViewDetails,
}: MissionActiveCardProps) {
  const navigate = useNavigate();
  useMissionRealtime(mission.id);

  const status = mission.status;
  const badge = getBadge(status);
  const isDisputed = status === "disputed";
  const showTimeline = !isDisputed;
  const displayRating = proRating != null ? (proRating / 10).toFixed(1) : null;
  const stepIndex = STATUS_TO_STEP[status] ?? 0;
  const dotColor = getDotColor(status);
  const finalState = isFinalState(status);
  const trackingState = isTrackingState(status);

  const missionRef = `#M-${mission.id.slice(0, 4).toUpperCase()}`;

  const handleCardClick = () => {
    onViewDetails(mission);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversationId) {
      navigate(`/messages/${conversationId}`);
    }
  };

  const handleRateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/orders/tracker/${mission.id}?review=1`);
  };

  const handleSupportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/orders/tracker/${mission.id}?support=1`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      onClick={handleCardClick}
      className={`mb-3 bg-cm-elevated border rounded-[var(--radius-cm-lg)] overflow-hidden cursor-pointer transition-all hover:shadow-cm-card active:scale-[0.99] ${
        isDisputed
          ? "border-red-200"
          : finalState
          ? "border-emerald-200"
          : "border-cm-border"
      }`}
    >
      <div className="p-3">
        {/* Row 1: Badge + Reference */}
        <div className="flex items-center justify-between mb-2.5">
          <span
            className={`inline-flex items-center h-5 px-2 rounded-[6px] text-[10px] font-semibold ${badge.style}`}
          >
            {(trackingState || status === "accepted" || status === "paid") && (
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  status === "in_progress"
                    ? "bg-violet-500 animate-pulse"
                    : status === "en_route"
                    ? "bg-blue-500"
                    : status === "arrived"
                    ? "bg-indigo-500"
                    : "bg-emerald-500"
                }`}
              />
            )}
            {badge.label}
          </span>
          <span className="text-[10px] font-mono text-cm-text-muted font-medium">
            {missionRef}
          </span>
        </div>

        {/* Row 2: Pro Info + Chat */}
        {!isDisputed && (
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cm-border shrink-0">
              <img
                src={
                  mission.proAvatar ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                }
                alt={mission.proName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[13px] font-semibold text-cm-text truncate">
                  {mission.proName || "Professionnel"}
                </h3>
                {displayRating && (
                  <span className="flex items-center gap-0.5 text-[11px] text-cm-text-soft shrink-0">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {displayRating}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-cm-text-muted truncate">
                {proTitle || mission.title || ""}
                {proReviewCount != null && proReviewCount > 0 && (
                  <span className="ml-1">· {proReviewCount} avis</span>
                )}
              </p>
            </div>
            {conversationId && !finalState && (
              <button
                onClick={handleChatClick}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-90 ${
                  status === "arrived"
                    ? "bg-cm-accent text-cm-text-onAccent shadow-cm-sm"
                    : "bg-cm-accent-soft text-cm-text hover:bg-cm-border"
                }`}
                aria-label="Message"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Row 3: Timeline */}
        {showTimeline && (
          <div className="flex items-center mb-2.5 px-0.5">
            {TIMELINE_STEPS.map((step, i) => {
              const state =
                i < stepIndex
                  ? "done"
                  : i === stepIndex
                  ? "active"
                  : "future";

              return (
                <div key={step.label} className="flex items-center flex-1">
                  {i > 0 && (
                    <div
                      className={`flex-1 h-[2px] mx-0.5 transition-colors duration-500 ${
                        state === "done" || state === "active"
                          ? "bg-cm-accent"
                          : "bg-cm-border"
                      }`}
                    />
                  )}
                  <div className="flex flex-col items-center">
                    <motion.div
                      layout
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                      className={`w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all duration-300 ${
                        state === "done"
                          ? "bg-cm-accent"
                          : state === "active"
                          ? `${dotColor.bg} shadow-[0_0_0_3px_rgba(17,24,39,0.10)]`
                          : "bg-cm-border-soft border border-cm-border"
                      }`}
                    >
                      {state === "done" ? (
                        <Check className="w-2.5 h-2.5 text-white" />
                      ) : state === "active" && i < 4 ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      ) : state === "active" && i === 4 ? (
                        <Check className="w-2.5 h-2.5 text-white" />
                      ) : null}
                    </motion.div>
                    <span
                      className={`text-[8px] font-semibold mt-0.5 leading-tight text-center whitespace-nowrap ${
                        state === "active"
                          ? "text-cm-text font-bold"
                          : state === "done"
                          ? "text-cm-text-soft"
                          : "text-cm-text-muted"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] mx-0.5 transition-colors duration-500 ${
                        state === "done" ? "bg-cm-accent" : "bg-cm-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Row 4: Context + Action */}
        <div className="flex items-center justify-between min-h-[18px]">
          <p className="text-[11px] text-cm-text-muted">
            {getContextText(mission)}
          </p>
          <div className="flex items-center gap-2">
            {finalState && (
              <button
                onClick={handleRateClick}
                className="text-[11px] font-semibold text-cm-accent flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
              >
                <Star className="w-3 h-3" />
                Noter
              </button>
            )}
            {isDisputed && (
              <button
                onClick={handleSupportClick}
                className="text-[11px] font-semibold text-red-600 flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
              >
                <AlertTriangle className="w-3 h-3" />
                Support
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(mission);
              }}
              className="text-[11px] font-medium text-cm-text-soft flex items-center gap-0.5 cursor-pointer hover:text-cm-text transition-colors"
            >
              Détails
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
