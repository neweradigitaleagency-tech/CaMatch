import { motion } from "motion/react";
import {
  ArrowLeft, CheckCircle, MapPin, Navigation, Star, MessageSquare, DollarSign, Camera,
  Zap, Droplets, Wind, Sparkles, AlertTriangle, Circle, Shield, ThumbsUp, ThumbsDown, X,
  Clock, Home, User, FileText,
} from "lucide-react";
import type { Mission, MissionStatus } from "../types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../stores/chatStore";

interface MissionTrackerScreenProps {
  mission: Mission;
  onBack: () => void;
  onOpenChat: () => void;
  onOpenInvoice: () => void;
  onUpdateStatus: (status: MissionStatus) => void;
  onReview: (mission: Mission) => void;
  onDispute?: (missionId: string) => void;
  onCancel?: (missionId: string) => void;
}

const PIPELINE_STEPS: MissionStatus[] = ["accepted", "paid", "in_progress", "completed", "client_validation", "closed"];

const STEP_ICONS: Record<string, typeof Circle> = {
  accepted: CheckCircle,
  paid: DollarSign,
  in_progress: Zap,
  completed: CheckCircle,
  client_validation: Camera,
  closed: Star,
};

const STEP_LABELS: Record<string, string> = {
  accepted: "Acceptée",
  paid: "Paiement",
  in_progress: "Intervention",
  completed: "Terminée",
  client_validation: "Validation",
  closed: "Clôturée",
};

export default function MissionTrackerScreen({
  mission, onBack, onOpenChat, onOpenInvoice, onUpdateStatus, onReview, onDispute, onCancel,
}: MissionTrackerScreenProps) {
  const currentIdx = PIPELINE_STEPS.indexOf(mission.status);
  const nav = useNavigate();

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-white border-b border-gray-100">
        <button onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[14px] font-bold text-gray-900 truncate max-w-[200px]">{mission.title}</h1>
        <button onClick={() => nav("/")}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer active:scale-95">
          <Home className="w-5 h-5" />
        </button>
      </header>

      {/* Pipeline - redesigned */}
      <div className="px-4 pt-5 pb-3">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between relative">
            {PIPELINE_STEPS.map((s, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              const StepIcon = STEP_ICONS[s] || Circle;

              return (
                <div key={s} className="flex flex-col items-center relative z-10 flex-1">
                  <div className="relative">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                      done ? "bg-gray-900 text-white" :
                      active ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" :
                      "bg-gray-100 text-gray-300"
                    }`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                    {active && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [1, 0.3, 1], scale: [1, 0.95, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-1.5 rounded-full border-2 border-gray-900/20 pointer-events-none"
                      />
                    )}
                  </div>
                  <span className={`text-[9px] mt-1.5 font-semibold text-center leading-tight ${
                    active ? "text-gray-900" : done ? "text-gray-700" : "text-gray-300"
                  }`}>
                    {STEP_LABELS[s] || s}
                  </span>
                </div>
              );
            })}

            {/* Connecting line */}
            <div className="absolute top-[18px] left-[8%] right-[8%] h-[2px] rounded-full overflow-hidden">
              <div className="w-full h-full bg-gray-100" />
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${currentIdx >= 0 ? (currentIdx / (PIPELINE_STEPS.length - 1)) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gray-900 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pro card with Chat button only */}
      {mission.proName && (
        <div className="px-4 mb-3">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
                <img src={mission.proAvatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[15px] text-gray-900">{mission.proName}</h4>
                <p className="text-[12px] text-gray-500">{mission.category}</p>
              </div>
              {currentIdx >= 1 && (
                <button onClick={onOpenChat}
                  className="flex items-center gap-1.5 h-10 px-4 bg-gray-900 text-white rounded-xl text-[12px] font-semibold cursor-pointer active:scale-95 transition-all hover:opacity-90">
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mission info card */}
      <div className="px-4 mb-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-gray-500">Budget</span>
            <span className="font-bold text-gray-900">{mission.budgetXOF.toLocaleString()} F</span>
          </div>
          {mission.quoteId && (
            <button onClick={(e) => { e.stopPropagation(); nav(`/orders/quote/${mission.requestId}`); }}
              className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 text-[11px] font-semibold text-gray-700 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
              <FileText className="w-3.5 h-3.5" /> Voir le devis
            </button>
          )}
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-gray-500">Catégorie</span>
            <span className="font-bold text-gray-900">{mission.category}</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-gray-500">Adresse</span>
            <span className="font-bold text-gray-900 text-right max-w-[200px] truncate">{mission.address}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 mt-1">
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <Clock className="w-3 h-3" />
              Créée le {new Date(mission.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
      </div>

      {/* Photos section */}
      {["client_validation", "closed"].includes(mission.status) && (
        <div className="px-4 mb-3">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Photos avant/après
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {mission.beforePhotos && mission.beforePhotos.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Avant</p>
                  <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 border border-gray-200">
                    <img src={mission.beforePhotos[0]} alt="Avant" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {mission.afterPhotos && mission.afterPhotos.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-gray-900 uppercase tracking-wider mb-1">Après</p>
                  <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 border border-gray-200">
                    <img src={mission.afterPhotos[0]} alt="Après" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validation section */}
      {mission.status === "client_validation" && (
        <div className="px-4 mb-3">
          <div className="bg-gray-900 rounded-2xl p-5 space-y-4 text-white">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <h3 className="text-[14px] font-bold">Validez le travail effectué</h3>
            </div>
            <p className="text-[12px] text-gray-300">Comparez les photos et confirmez que le travail est conforme.</p>
            <div className="flex gap-3">
              <button onClick={() => { onUpdateStatus("closed" as MissionStatus); }}
                className="flex-1 py-3 bg-white text-gray-900 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all">
                <ThumbsUp className="w-4 h-4" /> Valider
              </button>
              <button onClick={() => onUpdateStatus("disputed" as MissionStatus)}
                className="flex-1 py-3 border border-white/30 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all">
                <ThumbsDown className="w-4 h-4" /> Contester
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="px-4 space-y-2 mt-auto">
        {mission.status === "closed" && (
          <>
            <button onClick={() => onReview(mission)}
              className="w-full h-12 bg-gray-900 text-white rounded-xl text-[13px] font-semibold hover:opacity-90 transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 shadow-sm">
              <Star className="w-4 h-4" /> Évaluer cette mission
            </button>
            <button onClick={onOpenInvoice}
              className="w-full h-11 border border-gray-200 text-gray-700 rounded-xl text-[12px] font-medium hover:bg-gray-50 transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2">
              Voir la facture
            </button>
          </>
        )}
        {["in_progress", "completed", "paid"].includes(mission.status) && (
          <div className="text-center py-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-gray-900 animate-pulse" />
              <p className="text-[12px] font-medium text-gray-700">Mission en cours</p>
            </div>
          </div>
        )}
      </div>

      {/* Cancel / Dispute links */}
      <div className="px-4 mt-4 flex items-center justify-center gap-4">
        {onDispute && !["closed", "cancelled", "disputed", "refunded"].includes(mission.status) && (
          <button onClick={() => onDispute(mission.id)}
            className="text-[11px] text-red-500 font-medium underline cursor-pointer active:opacity-70">
            Signaler un problème
          </button>
        )}
        {onCancel && !["closed", "cancelled", "disputed", "refunded"].includes(mission.status) && (
          <button onClick={() => onCancel(mission.id)}
            className="text-[11px] text-gray-400 font-medium underline cursor-pointer active:opacity-70">
            Annuler la mission
          </button>
        )}
      </div>
    </div>
  );
}
