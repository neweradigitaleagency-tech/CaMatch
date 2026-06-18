import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, Clock, MapPin, Phone, Navigation, Star, MessageSquare, DollarSign, User } from "lucide-react";
import { Mission, MissionStatus, MISSION_STATUS_LABELS, MISSION_STATUS_ORDER } from "../types";

interface MissionTrackerScreenProps {
  mission: Mission;
  onBack: () => void;
  onOpenChat: () => void;
  onUpdateStatus: (status: MissionStatus) => void;
  onReview: (mission: Mission) => void;
}

const STATUS_COLORS: Record<MissionStatus, { bg: string; text: string; icon: typeof CheckCircle }> = {
  created: { bg: "bg-blue-500", text: "text-blue-600", icon: Clock },
  accepted: { bg: "bg-purple-500", text: "text-purple-600", icon: CheckCircle },
  en_route: { bg: "bg-amber-500", text: "text-amber-600", icon: Navigation },
  in_progress: { bg: "bg-orange-500", text: "text-orange-600", icon: Clock },
  completed: { bg: "bg-green-500", text: "text-green-600", icon: CheckCircle },
  paid: { bg: "bg-emerald-500", text: "text-emerald-600", icon: DollarSign },
  reviewed: { bg: "bg-teal-500", text: "text-teal-600", icon: Star },
};

export default function MissionTrackerScreen({
  mission, onBack, onOpenChat, onUpdateStatus, onReview,
}: MissionTrackerScreenProps) {
  const currentIdx = MISSION_STATUS_ORDER.indexOf(mission.status);

  const canTransition = (from: MissionStatus): MissionStatus | null => {
    const transitions: Record<MissionStatus, MissionStatus | null> = {
      created: "accepted",
      accepted: "en_route",
      en_route: "in_progress",
      in_progress: "completed",
      completed: "paid",
      paid: "reviewed",
      reviewed: null,
    };
    return transitions[from] || null;
  };

  const nextStatus = canTransition(mission.status);
  const isCompleted = ["completed", "paid", "reviewed"].includes(mission.status);

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-sans text-sm font-bold truncate max-w-[200px]">{mission.title}</h1>
        <button onClick={onOpenChat} className="w-9 h-9 flex items-center justify-center rounded-full bg-brand-lime text-brand-forest cursor-pointer active:scale-95">
          <MessageSquare className="w-4 h-4" />
        </button>
      </header>

      {/* Stepper 7 états */}
      <div className="px-4 py-5">
        <div className="relative">
          <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-pale-mint" />
          <div className="space-y-0">
            {MISSION_STATUS_ORDER.map((s, i) => {
              const colors = STATUS_COLORS[s];
              const isDone = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={s} className="flex items-start gap-3 py-2">
                  <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isDone ? colors.bg : "bg-pale-mint"
                  } ${isCurrent ? "ring-2 ring-offset-2 ring-brand-lime" : ""}`}>
                    {isDone ? (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-secondary/30" />
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className={`text-xs font-bold ${isDone ? "text-brand-forest" : "text-secondary/40"}`}>
                      {MISSION_STATUS_LABELS[s]}
                    </p>
                    {isCurrent && mission.status === "en_route" && mission.estimatedArrivalMinutes && (
                      <p className="text-[10px] text-amber-600 font-bold mt-0.5">
                        Arrivée estimée : {mission.estimatedArrivalMinutes} min
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pro info card */}
      {mission.proName && (
        <div className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-lime">
              <img src={mission.proAvatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{mission.proName}</h4>
              <p className="text-[10px] text-secondary">{mission.category}</p>
            </div>
            <a href={`tel:${mission.proPhone}`} className="w-10 h-10 rounded-full bg-pale-mint flex items-center justify-center cursor-pointer hover:bg-pale-mint/80 transition-colors">
              <Phone className="w-4 h-4 text-brand-forest" />
            </a>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            <button onClick={onOpenChat} className="flex-1 h-10 bg-pale-mint rounded-xl text-[10px] font-bold text-brand-forest flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all">
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </button>
            <button className="flex-1 h-10 bg-pale-mint rounded-xl text-[10px] font-bold text-brand-forest flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all">
              <MapPin className="w-3.5 h-3.5" /> Position
            </button>
            <button className="flex-1 h-10 bg-pale-mint rounded-xl text-[10px] font-bold text-brand-forest flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all">
              <Navigation className="w-3.5 h-3.5" /> Itinéraire
            </button>
          </div>
        </div>
      )}

      {/* Map placeholder */}
      {["accepted", "en_route", "in_progress"].includes(mission.status) && (
        <div className="mx-4 mb-4 bg-pale-mint rounded-2xl h-36 flex items-center justify-center border border-pale-mint/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-pale-mint to-white/50 flex flex-col items-center justify-center">
            <MapPin className="w-8 h-8 text-brand-lime mb-1" />
            <p className="text-[10px] font-bold text-secondary">Carte en direct</p>
            <p className="text-[8px] text-secondary/60">{mission.address}</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-secondary">Budget</span>
          <span className="font-bold">{mission.budgetXOF.toLocaleString()} F</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-secondary">Catégorie</span>
          <span className="font-bold">{mission.category}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-secondary">Adresse</span>
          <span className="font-bold text-right max-w-[200px] truncate">{mission.address}</span>
        </div>
      </div>

      {/* Action button */}
      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        {nextStatus && (
          <button
            onClick={() => onUpdateStatus(nextStatus)}
            className="w-full h-13 bg-brand-forest text-white rounded-2xl text-xs font-bold hover:bg-brand-lime hover:text-brand-forest transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
            Passer à : {MISSION_STATUS_LABELS[nextStatus]}
          </button>
        )}
        {mission.status === "paid" && (
          <button
            onClick={() => onReview(mission)}
            className="w-full h-13 bg-brand-lime text-brand-forest rounded-2xl text-xs font-bold hover:brightness-105 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Star className="w-4 h-4" /> Évaluer cette mission
          </button>
        )}
        {isCompleted && (
          <div className="text-center py-3">
            <p className="text-[10px] text-secondary font-medium">Mission terminée</p>
          </div>
        )}
      </div>
    </div>
  );
}
