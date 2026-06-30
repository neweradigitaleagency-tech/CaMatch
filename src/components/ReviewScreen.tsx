import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Star, CheckCircle } from "lucide-react";
import { Mission } from "../types";
import ImageViewer from "./ImageViewer";
import GlassCard from "./ui/GlassCard";

interface ReviewScreenProps {
  mission: Mission;
  onBack: () => void;
  onSubmit: (missionId: string, rating: number, comment: string) => void;
}

export default function ReviewScreen({ mission, onBack, onSubmit }: ReviewScreenProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIdx, setViewerIdx] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(mission.id, rating, comment);
    setSubmitted(true);
  };

  const allAfterPhotos = (mission.afterPhotos || []).map(u => ({ url: u, title: "Après" }));
  const allBeforePhotos = (mission.beforePhotos || []).map(u => ({ url: u, title: "Avant" }));

  const ratingLabels = ["", "Très insuffisant", "Insuffisant", "Médiocre", "Passable", "Correct", "Satisfaisant", "Bon", "Très bon", "Excellent", "Parfait !"];

  if (submitted) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-cm-bg">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-cm-accent-soft border-2 border-cm-accent flex items-center justify-center mb-6 animate-scale-in">
            <CheckCircle className="w-10 h-10 text-cm-accent" />
          </div>
          <h2 className="text-[22px] font-display font-bold text-cm-text mb-2">Merci !</h2>
          <p className="text-[14px] text-cm-text-soft mb-6 max-w-xs">
            Votre évaluation aide la communauté à faire les bons choix.
          </p>
          <button onClick={onBack}
            className="h-12 px-8 bg-cm-text text-white font-bold text-[14px] rounded-[14px] hover:opacity-90 transition-all cursor-pointer active:scale-[0.97]">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-11 h-11 flex items-center justify-center rounded-[14px] border border-cm-border bg-cm-elevated text-cm-text cursor-pointer active:scale-95 shadow-cm-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Évaluer</h1>
        <div className="w-11 h-11" />
      </header>

      <div className="flex-1 flex flex-col items-center px-5 pt-4">
        <GlassCard className="w-full p-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cm-border-soft mb-4 shadow-cm-sm">
            <img src={mission.proAvatar} alt="" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-[18px] font-bold text-cm-text">{mission.proName}</h3>
          <p className="text-[12px] text-cm-text-muted mb-1">{mission.category}</p>
          <p className="text-[12px] text-cm-text-muted mb-6 max-w-xs text-center">{mission.title}</p>

          {/* Before / After photos */}
          {(mission.beforePhotos?.length || mission.afterPhotos?.length) ? (
            <div className="w-full mb-6">
              <div className="flex gap-3">
                {mission.beforePhotos && mission.beforePhotos.length > 0 && (
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-cm-text-muted mb-1.5 text-center uppercase tracking-wider">Avant</p>
                    <button onClick={() => { setViewerIdx(0); setViewerOpen(true); }}
                      className="w-full aspect-video rounded-[14px] overflow-hidden border border-cm-border-soft cursor-pointer active:scale-95 transition-transform">
                      <img src={mission.beforePhotos[0]} alt="" className="w-full h-full object-cover" />
                    </button>
                  </div>
                )}
                {mission.afterPhotos && mission.afterPhotos.length > 0 && (
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-cm-text-muted mb-1.5 text-center uppercase tracking-wider">Après</p>
                    <button onClick={() => { setViewerIdx(mission.beforePhotos?.length || 0); setViewerOpen(true); }}
                      className="w-full aspect-video rounded-[14px] overflow-hidden border border-cm-border-soft cursor-pointer active:scale-95 transition-transform">
                      <img src={mission.afterPhotos[0]} alt="" className="w-full h-full object-cover" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Stars interactives — note 1-10 */}
          <div className="flex gap-1.5 mb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
                className="cursor-pointer active:scale-90 transition-transform">
                <Star size={28}
                  className={`transition-all duration-150 drop-shadow-sm ${
                    star <= (hovered || rating) && star <= 5
                      ? "fill-cm-accent text-cm-accent"
                      : star <= (hovered || rating) && star <= 7
                        ? "fill-yellow-500 text-yellow-500"
                        : star <= (hovered || rating)
                          ? "fill-green-500 text-green-500"
                          : "fill-cm-border-soft text-cm-border-soft"
                  }`}
                />
              </button>
            ))}
          </div>

          <p className="text-[14px] font-bold text-cm-text mb-5">
            {rating === 0 ? "Tapez pour évaluer" : ratingLabels[rating]}
          </p>

          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience..."
            className="w-full text-[14px] bg-cm-bg border border-cm-border rounded-[14px] p-4 outline-none resize-none min-h-[100px] text-cm-text placeholder-cm-text-muted focus:border-cm-accent transition-all"
          />
        </GlassCard>
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <button onClick={handleSubmit} disabled={rating === 0}
          className={`w-full h-13 rounded-[14px] text-[13px] font-bold transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 ${
            rating > 0
              ? "bg-cm-text text-white shadow-cm-md hover:opacity-90"
              : "bg-cm-border-soft text-cm-text-muted cursor-not-allowed"
          }`}>
          <Star className="w-4 h-4" /> Publier mon évaluation
        </button>
      </div>

      <ImageViewer
        images={[...allBeforePhotos, ...allAfterPhotos]}
        initialIndex={viewerIdx}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
