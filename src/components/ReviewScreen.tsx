import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Star, CheckCircle } from "lucide-react";
import { Mission } from "../types";
import ImageViewer from "./ImageViewer";
import GlassCard from "./ui/GlassCard";
import GlassButton from "./ui/GlassButton";

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

  const ratingLabels = ["", "Mauvais", "Pas top", "Correct", "Très bien", "Excellent !"];

  if (submitted) {
    return (
      <div className="flex flex-col w-full min-h-screen" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-[rgba(82,183,136,0.20)] flex items-center justify-center mb-6 border-2 border-ca-success animate-scale-in">
            <CheckCircle className="w-10 h-10 text-ca-success" />
          </div>
          <h2 className="text-[22px] font-extrabold text-ca-text-primary mb-2">Merci !</h2>
          <p className="text-[14px] text-ca-text-secondary mb-6 max-w-xs">
            Votre évaluation aide la communauté à faire les bons choix.
          </p>
          <button onClick={onBack}
            className="h-12 px-8 bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-white font-bold text-[14px] rounded-[14px] hover:bg-[rgba(45,106,79,0.95)] transition-all cursor-pointer active:scale-[0.97]">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen pb-32" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, transparent 100%)" }}>
        <button onClick={onBack} className="w-11 h-11 flex items-center justify-center rounded-[14px] bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] text-ca-text-primary cursor-pointer active:scale-95 shadow-[0_4px_16px_rgba(45,106,79,0.06)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-bold text-ca-text-primary">Évaluer</h1>
        <div className="w-11 h-11" />
      </header>

      <div className="flex-1 flex flex-col items-center px-5 pt-4">
        <GlassCard className="w-full p-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-ca-green-light mb-4 shadow-[0_8px_24px_rgba(45,106,79,0.12)]">
            <img src={mission.proAvatar} alt="" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-[18px] font-bold text-ca-text-primary">{mission.proName}</h3>
          <p className="text-[12px] text-ca-text-muted mb-1">{mission.category}</p>
          <p className="text-[12px] text-ca-text-muted mb-6 max-w-xs text-center">{mission.title}</p>

          {/* Before / After photos */}
          {(mission.beforePhotos?.length || mission.afterPhotos?.length) ? (
            <div className="w-full mb-6">
              <div className="flex gap-3">
                {mission.beforePhotos && mission.beforePhotos.length > 0 && (
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-ca-text-muted mb-1.5 text-center uppercase tracking-wider">Avant</p>
                    <button onClick={() => { setViewerIdx(0); setViewerOpen(true); }}
                      className="w-full aspect-video rounded-[14px] overflow-hidden border border-[rgba(255,255,255,0.35)] cursor-pointer active:scale-95 transition-transform">
                      <img src={mission.beforePhotos[0]} alt="" className="w-full h-full object-cover" />
                    </button>
                  </div>
                )}
                {mission.afterPhotos && mission.afterPhotos.length > 0 && (
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-ca-text-muted mb-1.5 text-center uppercase tracking-wider">Après</p>
                    <button onClick={() => { setViewerIdx(mission.beforePhotos?.length || 0); setViewerOpen(true); }}
                      className="w-full aspect-video rounded-[14px] overflow-hidden border border-[rgba(255,255,255,0.35)] cursor-pointer active:scale-95 transition-transform">
                      <img src={mission.afterPhotos[0]} alt="" className="w-full h-full object-cover" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Stars interactives */}
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
                className="cursor-pointer active:scale-90 transition-transform">
                <Star size={36}
                  className={`transition-all duration-150 drop-shadow-sm ${
                    star <= (hovered || rating)
                      ? "fill-ca-warning text-ca-warning"
                      : "fill-[rgba(232,224,208,0.50)] text-[rgba(232,224,208,0.50)]"
                  }`}
                />
              </button>
            ))}
          </div>

          <p className="text-[14px] font-bold text-ca-text-primary mb-5">
            {rating === 0 ? "Tapez pour évaluer" : ratingLabels[rating]}
          </p>

          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience..."
            className="w-full text-[14px] bg-[rgba(255,255,255,0.50)] backdrop-blur-[8px] border border-[rgba(232,224,208,0.80)] rounded-[14px] p-4 outline-none resize-none min-h-[100px] text-ca-text-primary placeholder-ca-text-muted focus:border-[rgba(82,183,136,0.60)] focus:bg-[rgba(255,255,255,0.70)] transition-all"
          />
        </GlassCard>
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <button onClick={handleSubmit} disabled={rating === 0}
          className={`w-full h-13 rounded-[14px] text-[13px] font-bold transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 ${
            rating > 0
              ? "bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-white shadow-[0_8px_24px_rgba(45,106,79,0.20)] hover:bg-[rgba(45,106,79,0.95)]"
              : "bg-[rgba(232,224,208,0.50)] text-ca-text-muted cursor-not-allowed"
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
