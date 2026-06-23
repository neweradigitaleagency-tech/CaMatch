import { useState } from "react";
import { ArrowLeft, MapPin, DollarSign, Clock, AlertTriangle, Trash2, Navigation, CheckCircle, Zap, Droplets, Wind, Sparkles, Circle } from "lucide-react";
import { motion } from "motion/react";
import { ClientRequest, MISSION_STATUS_LABELS, MISSION_STATUS_ORDER } from "../types";
import type { MissionStatus } from "../types";
import ImageViewer from "./ImageViewer";

interface RequestDetailScreenProps {
  request: ClientRequest;
  onBack: () => void;
  onDelete?: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  created: "bg-cm-accent-soft text-cm-accent",
  accepted: "bg-cm-elevated text-cm-text border border-cm-border",
  en_route: "bg-cm-accent-soft text-cm-accent",
  in_progress: "bg-cm-elevated text-cm-text border border-cm-border",
  completed: "bg-cm-elevated text-cm-text border border-cm-border",
  paid: "bg-cm-elevated text-cm-text border border-cm-border",
  reviewed: "bg-cm-elevated text-cm-text border border-cm-border",
};

const DOMAIN_ICONS: Record<string, typeof Zap> = {
  electricity: Zap,
  plumbing: Droplets,
  ac: Wind,
  cleaning: Sparkles,
};

const DISPLAYABLE = MISSION_STATUS_ORDER.filter((s) => s !== "created");

const STATUS_STEP_ICONS: Record<string, typeof Circle> = {
  accepted: CheckCircle,
  en_route: Navigation,
  in_progress: Zap,
  completed: CheckCircle,
  paid: Clock,
  reviewed: CheckCircle,
};

export default function RequestDetailScreen({ request, onBack, onDelete }: RequestDetailScreenProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);

  const currentIdx = DISPLAYABLE.indexOf(request.status as MissionStatus);
  const CategoryIcon = DOMAIN_ICONS[request.category] || AlertTriangle;

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-cm-elevated border-b border-cm-border sticky top-0 z-10">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-cm-elevated text-cm-text hover:bg-cm-accent-soft transition-colors border border-cm-border cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-sm font-bold text-cm-text truncate max-w-[200px]">{request.title}</h1>
        {onDelete && (
          <button onClick={() => onDelete(request.id)} className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50 text-red-500 cursor-pointer active:scale-95">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </header>

      <div className="px-4 pt-4 space-y-3">
        <div className="bg-cm-elevated rounded-2xl p-5 border border-cm-border">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[request.status] || "bg-cm-elevated text-cm-text-soft border border-cm-border"}`}>
              {MISSION_STATUS_LABELS[request.status] || request.status}
            </span>
            <span className="text-[11px] text-cm-text-soft">
              {new Date(request.createdAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
          <p className="text-sm text-cm-text-soft leading-relaxed mb-4">{request.description}</p>
          <div className="space-y-2 text-[12px]">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cm-text-soft/60" />
              <span className="text-cm-text">{request.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-cm-text-soft/60" />
              <span className="font-bold text-cm-text font-mono">{request.budgetXOF.toLocaleString()} F</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cm-text-soft/60" />
              <span className="text-cm-text">{request.urgency}</span>
            </div>
          </div>
          {request.photos && request.photos.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {request.photos.map((p, i) => (
                <button key={i} onClick={() => { setGalleryIdx(i); setGalleryOpen(true); }}
                  className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-cm-border cursor-pointer active:scale-95">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vertical animated timeline */}
        {currentIdx >= 0 && (
          <div className="bg-cm-elevated rounded-2xl p-5 border border-cm-border">
            <h3 className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <CategoryIcon className="w-3.5 h-3.5" /> Suivi de la demande
            </h3>
            <div className="space-y-0">
              {DISPLAYABLE.map((s, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                const StepIcon = STATUS_STEP_ICONS[s] || Circle;
                const label = MISSION_STATUS_LABELS[s] || s;
                const shortLabel = label.split(" ")[0];
                return (
                  <div key={s} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={false}
                        animate={active ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 2, repeat: active ? Infinity : 0, repeatDelay: 1.5 }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          done ? "bg-cm-text" : "bg-cm-border-soft"
                        }`}>
                        <StepIcon className={`w-3.5 h-3.5 ${done ? "text-white" : "text-cm-text-muted"}`} />
                      </motion.div>
                      {i < DISPLAYABLE.length - 1 && (
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: done ? 1 : 0 }}
                          transition={{ duration: 0.4, delay: i * 0.1 }}
                          className={`w-px flex-1 min-h-[28px] origin-top ${done ? "bg-cm-text" : "bg-cm-border-soft"}`} />
                      )}
                    </div>
                    <div className={`pb-5 flex-1 ${i === DISPLAYABLE.length - 1 ? "pb-0" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-[12px] font-medium ${
                          done ? "text-cm-text" : "text-cm-text-muted"
                        }`}>
                          {shortLabel}
                        </span>
                        {active && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: [1, 1, 1, 0], scale: 1 }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-[10px] font-bold text-cm-accent">
                            EN COURS
                          </motion.span>
                        )}
                        {done && !active && (
                          <span className="text-[10px] text-cm-text-soft">✓</span>
                        )}
                      </div>
                      <p className="text-[11px] text-cm-text-muted mt-0.5">
                        {s === "accepted" && "Un professionnel a accepté votre demande"}
                        {s === "en_route" && "Le professionnel est en route vers votre adresse"}
                        {s === "in_progress" && "Le professionnel travaille sur votre intervention"}
                        {s === "completed" && "L'intervention est terminée"}
                        {s === "paid" && "Votre paiement a été confirmé"}
                        {s === "reviewed" && "Vous avez évalué cette mission"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {request.status === "created" && (
          <div className="bg-cm-accent-soft border border-cm-accent/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-cm-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-cm-text mb-1">En attente d'un professionnel</p>
              <p className="text-[11px] text-cm-text-soft leading-relaxed">
                Votre demande a été publiée. Un professionnel va bientôt vous répondre. Vous serez notifié dès qu'un pro sera intéressé.
              </p>
            </div>
          </div>
        )}
      </div>

      <ImageViewer
        images={request.photos.map(p => ({ url: p, title: request.title }))}
        initialIndex={galleryIdx}
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
}
