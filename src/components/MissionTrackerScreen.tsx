import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, Clock, MapPin, Phone, Navigation, Star, MessageSquare, DollarSign, Camera, BadgeCheck, Circle } from "lucide-react";
import MapView from "./ui/MapView";
import type { Mission, MissionStatus } from "../types";
import { MISSION_STATUS_LABELS, MISSION_STATUS_ORDER } from "../types";
import ImageViewer from "./ImageViewer";
import GlassCard from "./ui/GlassCard";
import { StatusBadge } from "./ui";

interface MissionTrackerScreenProps {
  mission: Mission;
  onBack: () => void;
  onOpenChat: () => void;
  onUpdateStatus: (status: MissionStatus) => void;
  onReview: (mission: Mission) => void;
}

const STATUS_CONFIG: Record<MissionStatus, { dot: string; icon: typeof CheckCircle }> = {
  created: { dot: "bg-ca-info", icon: Clock },
  accepted: { dot: "bg-[#B8632E]", icon: CheckCircle },
  en_route: { dot: "bg-ca-info", icon: Navigation },
  in_progress: { dot: "bg-[#B8632E]", icon: Clock },
  completed: { dot: "bg-ca-success", icon: CheckCircle },
  paid: { dot: "bg-ca-success", icon: DollarSign },
  reviewed: { dot: "bg-ca-green-primary", icon: Star },
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
    <div className="flex flex-col w-full min-h-screen pb-32" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, transparent 100%)" }}>
        <button onClick={onBack} className="w-11 h-11 flex items-center justify-center rounded-[14px] bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] text-ca-text-primary cursor-pointer active:scale-95 shadow-[0_4px_16px_rgba(45,106,79,0.06)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[14px] font-bold truncate max-w-[180px] text-ca-text-primary">{mission.title}</h1>
        <button onClick={onOpenChat} className="w-11 h-11 flex items-center justify-center rounded-[14px] bg-[rgba(45,106,79,0.85)] text-white cursor-pointer active:scale-95 backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] shadow-[0_4px_16px_rgba(45,106,79,0.15)]">
          <MessageSquare className="w-5 h-5" />
        </button>
      </header>

      {/* Circular status + Badge */}
      <div className="flex flex-col items-center py-6 px-4">
        <div className="relative w-24 h-24 mb-3">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(183,228,199,0.40)" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none" stroke="#2D6A4F" strokeWidth="6"
              strokeLinecap="round" strokeDasharray={`${(displayIdx / (DISPLAYABLE_STATUSES.length - 1)) * 264} 264`}
              initial={{ strokeDasharray: "0 264" }}
              animate={{ strokeDasharray: `${(displayIdx / (DISPLAYABLE_STATUSES.length - 1)) * 264} 264` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${config.dot} backdrop-blur-[4px]`}>
              <config.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <StatusBadge status={mission.status} className="text-[12px] h-7 px-3" />
      </div>

      {/* Timeline steps */}
      <div className="flex items-center justify-center gap-1 px-8 mb-2">
        {DISPLAYABLE_STATUSES.map((s, i) => {
          const done = i <= displayIdx;
          return (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-3 h-3 rounded-full shrink-0 transition-all duration-300 ${
                done ? "bg-ca-green-primary" : "bg-[rgba(232,224,208,0.50)]"
              } ${i === displayIdx ? "ring-2 ring-offset-2 ring-ca-green-light scale-125" : ""}`} />
              {i < DISPLAYABLE_STATUSES.length - 1 && (
                <div className={`flex-1 h-0.5 mx-0.5 ${done ? "bg-ca-green-primary" : "bg-[rgba(232,224,208,0.40)]"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Status labels row */}
      <div className="flex justify-between px-4 mb-6 -mt-1">
        {DISPLAYABLE_STATUSES.map((s, i) => (
          <span key={s} className={`text-[9px] font-medium text-center ${
            i === displayIdx ? "text-ca-text-primary font-bold" : "text-ca-text-muted"
          }`} style={{ width: `${100 / DISPLAYABLE_STATUSES.length}%` }}>
            {MISSION_STATUS_LABELS[s].replace(/[éèê]/g, c => c === 'é' ? 'e' : c === 'è' ? 'e' : 'e').split(" ")[0]}
          </span>
        ))}
      </div>

      {/* Before/After Photos */}
      {(mission.beforePhotos?.length > 0 || mission.afterPhotos?.length > 0) && (
        <div className="mx-4 mb-4">
          <GlassCard className="p-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 text-ca-text-secondary">
              <Camera className="w-3.5 h-3.5" /> Photos de la mission
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {mission.beforePhotos && mission.beforePhotos.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-[#B8632E] uppercase tracking-wider mb-1">Avant</p>
                  <div className="rounded-[14px] overflow-hidden aspect-video bg-[rgba(255,255,255,0.40)] border border-[rgba(255,255,255,0.30)]">
                    <img src={mission.beforePhotos[0]} alt="Avant" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {mission.afterPhotos && mission.afterPhotos.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-ca-success uppercase tracking-wider mb-1">Après</p>
                  <div className="rounded-[14px] overflow-hidden aspect-video bg-[rgba(255,255,255,0.40)] border border-[rgba(255,255,255,0.30)]">
                    <img src={mission.afterPhotos[0]} alt="Après" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Map */}
      {["accepted", "en_route", "in_progress"].includes(mission.status) && (
        <div className="mx-4 mb-4 rounded-[16px] overflow-hidden border border-[rgba(255,255,255,0.35)] shadow-[0_8px_32px_rgba(45,106,79,0.08)] h-40">
          <MapView height="h-40" markers={[
            { id: "pro", lat: 5.36, lng: -4.01, label: mission.proName || "Pro", selected: true },
            { id: "client", lat: 5.35, lng: -4.00, label: "Marie (vous)" },
          ]} interactive={false} />
        </div>
      )}

      {/* Pro info card */}
      {mission.proName && (
        <div className="mx-4 mb-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-ca-green-light">
                <img src={mission.proAvatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[14px] text-ca-text-primary">{mission.proName}</h4>
                <p className="text-[12px] text-ca-text-muted">{mission.category}</p>
              </div>
              <a href={`tel:${mission.proPhone}`} className="w-11 h-11 rounded-[12px] bg-[rgba(45,106,79,0.10)] flex items-center justify-center cursor-pointer hover:bg-[rgba(45,106,79,0.15)] transition-colors">
                <Phone className="w-4 h-4 text-ca-text-primary" />
              </a>
            </div>
            <div className="flex gap-2">
              <button onClick={onOpenChat} className="flex-1 h-10 bg-[rgba(45,106,79,0.10)] rounded-[12px] text-[11px] font-medium text-ca-text-primary flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:bg-[rgba(45,106,79,0.15)]">
                <MessageSquare className="w-3.5 h-3.5" /> Chat
              </button>
              <button className="flex-1 h-10 bg-[rgba(45,106,79,0.10)] rounded-[12px] text-[11px] font-medium text-ca-text-primary flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:bg-[rgba(45,106,79,0.15)]">
                <MapPin className="w-3.5 h-3.5" /> Position
              </button>
              <button className="flex-1 h-10 bg-[rgba(45,106,79,0.10)] rounded-[12px] text-[11px] font-medium text-ca-text-primary flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:bg-[rgba(45,106,79,0.15)]">
                <Navigation className="w-3.5 h-3.5" /> Itinéraire
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Info */}
      <div className="mx-4">
        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ca-text-muted">Budget</span>
            <span className="font-bold text-ca-text-primary">{mission.budgetXOF.toLocaleString()} F</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ca-text-muted">Catégorie</span>
            <span className="font-bold text-ca-text-primary">{mission.category}</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ca-text-muted">Adresse</span>
            <span className="font-bold text-ca-text-primary text-right max-w-[200px] truncate">{mission.address}</span>
          </div>
        </GlassCard>
      </div>

      {/* Review CTA */}
      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        {mission.status === "paid" && (
          <button onClick={() => onReview(mission)}
            className="w-full h-13 bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-white rounded-[14px] text-[13px] font-bold hover:bg-[rgba(45,106,79,0.95)] transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(45,106,79,0.20)]">
            <Star className="w-4 h-4" /> Évaluer cette mission
          </button>
        )}
        {isAfter && mission.status !== "paid" && (
          <div className="text-center py-3">
            <p className="text-[12px] text-ca-text-muted font-medium">Mission terminée</p>
          </div>
        )}
      </div>

      {/* Chat FAB */}
      <button onClick={onOpenChat}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-[16px] bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(45,106,79,0.30)] cursor-pointer active:scale-90 transition-all z-10 hover:bg-[rgba(45,106,79,0.95)]">
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
}
