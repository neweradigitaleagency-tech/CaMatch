import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, Clock, MapPin, Phone, Navigation, Star, MessageSquare, DollarSign, Camera } from "lucide-react";
import MapView from "./ui/MapView";
import type { Mission, MissionStatus } from "../types";
import { MISSION_STATUS_LABELS, MISSION_STATUS_ORDER } from "../types";
import ImageViewer from "./ImageViewer";
import { StatusBadge } from "./ui";

interface MissionTrackerScreenProps {
  mission: Mission;
  onBack: () => void;
  onOpenChat: () => void;
  onUpdateStatus: (status: MissionStatus) => void;
  onReview: (mission: Mission) => void;
}

const STATUS_CONFIG: Record<MissionStatus, { dot: string; icon: typeof CheckCircle }> = {
  created: { dot: "bg-cm-info", icon: Clock },
  accepted: { dot: "bg-cm-purple", icon: CheckCircle },
  en_route: { dot: "bg-cm-warning", icon: Navigation },
  in_progress: { dot: "bg-cm-orange", icon: Clock },
  completed: { dot: "bg-cm-green", icon: CheckCircle },
  paid: { dot: "bg-cm-success", icon: DollarSign },
  reviewed: { dot: "bg-cm-green-deep", icon: Star },
};

const DISPLAYABLE_STATUSES: MissionStatus[] = ["accepted", "en_route", "in_progress", "completed", "paid", "reviewed"];

export default function MissionTrackerScreen({
  mission, onBack, onOpenChat, onUpdateStatus, onReview,
}: MissionTrackerScreenProps) {
  const currentIdx = MISSION_STATUS_ORDER.indexOf(mission.status);
  const displayIdx = DISPLAYABLE_STATUSES.indexOf(mission.status);
  const config = STATUS_CONFIG[mission.status];

  const isBefore = ["created", "accepted", "en_route"].includes(mission.status);
  const isActive = ["in_progress"].includes(mission.status);
  const isAfter = ["completed", "paid", "reviewed"].includes(mission.status);

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sans text-sm font-bold truncate max-w-[180px]">{mission.title}</h1>
        <button onClick={onOpenChat} className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-lime text-brand-forest cursor-pointer active:scale-95">
          <MessageSquare className="w-5 h-5" />
        </button>
      </header>

      {/* Circular status indicator */}
      <div className="flex flex-col items-center py-6 px-4">
        <div className="relative w-24 h-24 mb-3">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E6EFE6" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none" stroke="#C2D939" strokeWidth="6"
              strokeLinecap="round" strokeDasharray={`${(displayIdx / (DISPLAYABLE_STATUSES.length - 1)) * 264} 264`}
              initial={{ strokeDasharray: "0 264" }}
              animate={{ strokeDasharray: `${(displayIdx / (DISPLAYABLE_STATUSES.length - 1)) * 264} 264` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${config.dot}`}>
              <config.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <StatusBadge status={mission.status} />
      </div>

      {/* Dot stepper - single line */}
      <div className="flex items-center justify-center gap-1 px-8 mb-6">
        {DISPLAYABLE_STATUSES.map((s, i) => {
          const done = i <= displayIdx;
          return (
            <div key={s} className="flex items-center flex-1">
               <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${done ? config.dot : "bg-pale-mint"} ${i === displayIdx ? "ring-2 ring-offset-1 ring-cm-green scale-125" : ""}`} />
              {i < DISPLAYABLE_STATUSES.length - 1 && (
                <div className={`flex-1 h-0.5 mx-0.5 ${done ? "bg-brand-lime" : "bg-pale-mint"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Status labels row */}
      <div className="flex justify-between px-4 mb-6 -mt-3">
        {DISPLAYABLE_STATUSES.map((s, i) => (
          <span key={s} className={`text-[8px] font-medium text-center ${i === displayIdx ? "text-brand-forest font-bold" : "text-secondary/40"}`}
            style={{ width: `${100 / DISPLAYABLE_STATUSES.length}%` }}>
            {MISSION_STATUS_LABELS[s].replace(/[éèê]/g, c => c === 'é' ? 'e' : c === 'è' ? 'e' : 'e').split(" ")[0]}
          </span>
        ))}
      </div>

      {/* Before/After Photos */}
      {(mission.beforePhotos?.length > 0 || mission.afterPhotos?.length > 0) && (
        <div className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm">
          <h4 className="text-caption font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" /> Photos de la mission
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {mission.beforePhotos && mission.beforePhotos.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-cm-warning uppercase tracking-wider mb-1">Avant</p>
                <div className="rounded-xl overflow-hidden aspect-video bg-pale-mint">
                  <img src={mission.beforePhotos[0]} alt="Avant" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            {mission.afterPhotos && mission.afterPhotos.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-cm-green uppercase tracking-wider mb-1">Après</p>
                <div className="rounded-xl overflow-hidden aspect-video bg-pale-mint">
                  <img src={mission.afterPhotos[0]} alt="Après" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      {["accepted", "en_route", "in_progress"].includes(mission.status) && (
        <div className="mx-4 mb-4 rounded-2xl overflow-hidden border border-pale-mint/20 h-40">
          <MapView
            height="h-40"
            markers={[
              { id: "pro", lat: 5.36, lng: -4.01, label: mission.proName || "Pro", selected: true },
              { id: "client", lat: 5.35, lng: -4.00, label: "Marie (vous)" },
            ]}
            interactive={false}
          />
        </div>
      )}

      {/* Pro info card */}
      {mission.proName && (
        <div className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-lime">
              <img src={mission.proAvatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{mission.proName}</h4>
              <p className="text-caption text-secondary">{mission.category}</p>
            </div>
            <a href={`tel:${mission.proPhone}`} className="w-12 h-12 rounded-full bg-pale-mint flex items-center justify-center cursor-pointer hover:bg-pale-mint/80 transition-colors">
              <Phone className="w-4 h-4 text-brand-forest" />
            </a>
          </div>
          <div className="flex gap-2">
            <button onClick={onOpenChat} className="flex-1 h-10 bg-pale-mint rounded-xl text-caption font-medium text-brand-forest flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all">
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </button>
            <button className="flex-1 h-10 bg-pale-mint rounded-xl text-caption font-medium text-brand-forest flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all">
              <MapPin className="w-3.5 h-3.5" /> Position
            </button>
            <button className="flex-1 h-10 bg-pale-mint rounded-xl text-caption font-medium text-brand-forest flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all">
              <Navigation className="w-3.5 h-3.5" /> Itinéraire
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mx-4 bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm space-y-2">
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

      {/* CTA - Review only */}
      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        {mission.status === "paid" && (
          <button
            onClick={() => onReview(mission)}
            className="w-full h-13 bg-brand-lime text-brand-forest rounded-2xl text-xs font-bold hover:brightness-105 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Star className="w-4 h-4" /> Évaluer cette mission
          </button>
        )}
        {isAfter && mission.status !== "paid" && (
          <div className="text-center py-3">
            <p className="text-caption text-secondary font-medium">Mission terminée</p>
          </div>
        )}
      </div>
    </div>
  );
}