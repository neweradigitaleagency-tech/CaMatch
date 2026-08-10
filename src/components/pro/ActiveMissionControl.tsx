import { motion } from "motion/react";
import { CheckCircle, Clock, MessageCircle, Navigation, Phone, Check } from "lucide-react";
import type { ProJob } from "../../types";
import { STATUS_FLOW, nextStatus, FLOW_BUTTON_LABELS } from "./dashboard";

interface ActiveMissionControlProps {
  job: ProJob;
  onNavigate: () => void;
  onChat: () => void;
  onAdvance: () => void;
}

const STEP_LABELS: Record<string, string> = {
  accepted: "En route",
  en_route: "Arrivé",
  arrived: "Photo",
  photos_taken: "Commencer",
  in_progress: "Terminer",
  completed: "Validé",
  client_validation: "Clôturé",
};

const STATUS_TITLE: Record<string, string> = {
  quote_required: "Devis requis",
  en_route: "En route",
  arrived: "Arrivé sur place",
  photos_taken: "Photos prises",
  in_progress: "En cours",
  completed: "Terminée",
  client_validation: "En validation",
};

export default function ActiveMissionControl({ job, onNavigate, onChat, onAdvance }: ActiveMissionControlProps) {
  const flowIdx = STATUS_FLOW.indexOf(job.status as (typeof STATUS_FLOW)[number]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <div className="bg-cm-elevated border border-cm-border rounded-[20px] p-4 shadow-sm">
        <div className="flex items-center gap-1 mb-3">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-[11px] font-bold text-green-600 uppercase tracking-wider">
            {STATUS_TITLE[job.status] ?? "Mission acceptée"}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-cm-surface flex items-center justify-center text-[16px]">👤</div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-cm-text truncate">{job.clientName}</p>
            <p className="text-[11px] text-cm-text-muted truncate">{job.clientLocation}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={onNavigate}
            className="flex-1 h-10 rounded-[12px] bg-cm-text text-white text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" /> Naviguer
          </button>
          <button
            onClick={onChat}
            className="flex-1 h-10 rounded-[12px] border border-cm-border text-cm-text-soft text-[11px] font-bold cursor-pointer active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Chat
          </button>
          <a
            href={`tel:${job.clientPhone}`}
            className="w-10 h-10 rounded-[12px] border border-cm-border text-cm-text-soft flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        <div className="flex items-center justify-between bg-cm-surface rounded-[12px] p-2">
          {STATUS_FLOW.map((s, i) => {
            const done = i < flowIdx;
            const active = i === flowIdx;
            return (
              <div key={s} className="flex flex-col items-center flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    done || active ? "bg-cm-text text-white" : "bg-cm-border-soft text-cm-text-muted"
                  }`}
                >
                  {done ? <Check className="w-3 h-3" /> : active ? <div className="w-2 h-2 rounded-full bg-white" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                </div>
                <span
                  className={`text-[7px] mt-1 font-bold text-center leading-tight uppercase tracking-wider ${
                    active ? "text-cm-text" : done ? "text-cm-text-muted" : "text-cm-border-soft"
                  }`}
                >
                  {STEP_LABELS[s]}
                </span>
              </div>
            );
          })}
        </div>

        {job.status === "quote_required" ? (
          <button
            onClick={onAdvance}
            className="w-full mt-3 h-11 rounded-[12px] bg-violet-600 text-white text-[12px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-violet-700 shadow-sm"
          >
            Créer un devis
          </button>
        ) : job.status === "client_validation" ? (
          <div className="w-full mt-3 h-11 rounded-[12px] bg-cm-surface text-cm-text-muted text-[12px] font-bold flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5" /> En attente de validation du client
          </div>
        ) : nextStatus(job.status) ? (
          <button
            onClick={onAdvance}
            className="w-full mt-3 h-11 rounded-[12px] bg-cm-text text-white text-[12px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-cm-text/90 shadow-sm"
          >
            {FLOW_BUTTON_LABELS[job.status] ?? "Continuer"}
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
