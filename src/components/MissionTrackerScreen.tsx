import { motion } from "motion/react";
import {
  ArrowLeft, CheckCircle, MapPin, Navigation, Star, MessageSquare, DollarSign, Camera, FileText,
  Zap, Droplets, Wind, Sparkles, AlertTriangle, Circle,
} from "lucide-react";
import MapView from "./ui/MapView";
import type { Mission, MissionStatus } from "../types";
import { MISSION_STATUS_LABELS, MISSION_STATUS_ORDER } from "../types";
import ImageViewer from "./ImageViewer";
import StatusBadge from "./ui/StatusBadge";
import { useState } from "react";

interface MissionTrackerScreenProps {
  mission: Mission;
  onBack: () => void;
  onOpenChat: () => void;
  onOpenInvoice: () => void;
  onUpdateStatus: (status: MissionStatus) => void;
  onReview: (mission: Mission) => void;
}

  const SIX_STEPS: MissionStatus[] = MISSION_STATUS_ORDER.filter((s) => s !== "created");

const STEP_ICONS: Record<string, typeof Circle> = {
  accepted: CheckCircle,
  en_route: Navigation,
  in_progress: Zap,
  completed: CheckCircle,
  paid: DollarSign,
  reviewed: Star,
};

const STEP_SHORT_LABELS: Record<string, string> = {
  accepted: "Acceptée",
  en_route: "En route",
  in_progress: "Intervention",
  completed: "Terminée",
  paid: "Paiement",
  reviewed: "Évaluée",
};

export default function MissionTrackerScreen({
  mission, onBack, onOpenChat, onOpenInvoice, onUpdateStatus, onReview,
}: MissionTrackerScreenProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const currentIdx = SIX_STEPS.indexOf(mission.status);

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-6">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full text-cm-text hover:bg-cm-accent-soft transition-colors cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[14px] font-bold text-cm-text truncate max-w-[180px]">{mission.title}</h1>
        <div className="w-10 h-10" />
      </header>

      {/* 6-step pipeline */}
      <div className="px-4 pt-5 pb-3">
        <div className="bg-cm-elevated rounded-2xl p-5 border border-cm-border shadow-sm">
          <div className="flex items-start justify-between relative">
            {SIX_STEPS.map((s, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              const StepIcon = STEP_ICONS[s] || Circle;

              return (
                <div key={s} className="flex flex-col items-center relative z-10 flex-1">
                  <div className="relative">
                    <motion.div
                      animate={active ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 1.5, repeat: active ? Infinity : 0, repeatDelay: 1.5 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                        done || active ? "bg-cm-accent" : "bg-cm-border-soft"
                      }`}
                    >
                      <StepIcon className={`w-4 h-4 ${done || active ? "text-white" : "text-cm-text-muted"}`} />
                    </motion.div>
                    {active && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [1, 0.3, 1], scale: [1, 0.95, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-1 rounded-full border-2 border-cm-accent/40 pointer-events-none"
                      />
                    )}
                  </div>
                  <span className={`text-[9px] mt-1.5 font-medium text-center leading-tight ${
                    active ? "text-cm-accent font-bold" : done ? "text-cm-text" : "text-cm-text-muted"
                  }`}>
                    {STEP_SHORT_LABELS[s] || s}
                  </span>
                </div>
              );
            })}

            {/* Connecting lines */}
            <div className="absolute top-4 left-[8%] right-[8%] h-[3px] rounded-full overflow-hidden">
              <div className="w-full h-full bg-cm-border-soft" />
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${currentIdx >= 0 ? (currentIdx / (SIX_STEPS.length - 1)) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-cm-accent rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status label */}
      <div className="px-4 mb-3">
        <StatusBadge status={mission.status} className="text-[12px] h-7 px-3" />
      </div>

      {/* Photos — visible only at evaluation (reviewed) */}
      {mission.status === "reviewed" && (mission.beforePhotos?.length > 0 || mission.afterPhotos?.length > 0) && (
        <div className="px-4 mb-3">
          <div className="border border-cm-border rounded-2xl bg-cm-elevated p-4 shadow-sm">
            <h4 className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Photos
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {mission.beforePhotos && mission.beforePhotos.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-cm-text-soft uppercase tracking-wider mb-1">Avant</p>
                  <div className="rounded-xl overflow-hidden aspect-video bg-cm-bg border border-cm-border-soft">
                    <img src={mission.beforePhotos[0]} alt="Avant" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {mission.afterPhotos && mission.afterPhotos.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-cm-accent uppercase tracking-wider mb-1">Après</p>
                  <div className="rounded-xl overflow-hidden aspect-video bg-cm-bg border border-cm-border-soft">
                    <img src={mission.afterPhotos[0]} alt="Après" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      {["accepted", "en_route", "in_progress"].includes(mission.status) && (
        <div className="px-4 mb-3">
          <div className="rounded-2xl overflow-hidden border border-cm-border shadow-sm h-40">
            <MapView height="h-40" markers={[
              { id: "pro", lat: 5.36, lng: -4.01, label: mission.proName || "Pro", selected: true },
              { id: "client", lat: 5.35, lng: -4.00, label: "Marie (vous)" },
            ]} interactive={false} />
          </div>
        </div>
      )}

      {/* Pro profile card */}
      {mission.proName && (
        <div className="px-4 mb-3">
          <div className="border border-cm-border rounded-2xl bg-cm-elevated p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cm-border-soft shrink-0">
                <img src={mission.proAvatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[14px] text-cm-text">{mission.proName}</h4>
                <p className="text-[12px] text-cm-text-muted">{mission.category}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onOpenChat}
                className="flex-1 h-10 border border-cm-border rounded-xl text-[11px] font-medium text-cm-text flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:bg-cm-accent-soft">
                <MessageSquare className="w-3.5 h-3.5" /> Chat
              </button>
              <button className="flex-1 h-10 border border-cm-border rounded-xl text-[11px] font-medium text-cm-text flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:bg-cm-accent-soft">
                <MapPin className="w-3.5 h-3.5" /> Position
              </button>
              <button className="flex-1 h-10 border border-cm-border rounded-xl text-[11px] font-medium text-cm-text flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:bg-cm-accent-soft">
                <Navigation className="w-3.5 h-3.5" /> Itinéraire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mission info */}
      <div className="px-4 mb-3">
        <div className="border border-cm-border rounded-2xl bg-cm-elevated p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-cm-text-soft">Budget</span>
            <span className="font-bold text-cm-text font-mono">{mission.budgetXOF.toLocaleString()} F</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-cm-text-soft">Catégorie</span>
            <span className="font-bold text-cm-text">{mission.category}</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-cm-text-soft">Adresse</span>
            <span className="font-bold text-cm-text text-right max-w-[200px] truncate">{mission.address}</span>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-4 space-y-2">
        {mission.status === "paid" && (
          <>
            <button onClick={() => onReview(mission)}
              className="w-full h-12 bg-cm-text text-white rounded-xl text-[13px] font-semibold hover:opacity-90 transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 shadow-sm">
              <Star className="w-4 h-4" /> Évaluer cette mission
            </button>
            <button onClick={onOpenInvoice}
              className="w-full h-11 border border-cm-border text-cm-text rounded-xl text-[12px] font-medium hover:bg-cm-accent-soft transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> Voir la facture
            </button>
          </>
        )}
        {mission.status === "reviewed" && (
          <button onClick={onOpenInvoice}
            className="w-full h-11 border border-cm-border text-cm-text rounded-xl text-[12px] font-medium hover:bg-cm-accent-soft transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 shadow-sm">
            <FileText className="w-4 h-4" /> Voir la facture
          </button>
        )}
        {["completed", "paid", "reviewed"].includes(mission.status) === false && (
          <div className="text-center py-2">
            <p className="text-[12px] text-cm-text-muted font-medium">Mission en cours</p>
          </div>
        )}
      </div>

      <ImageViewer
        images={mission.photos?.map((p) => ({ url: p, title: mission.title })) || []}
        initialIndex={0}
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
}
