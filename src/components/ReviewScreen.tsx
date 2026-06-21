import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Star } from "lucide-react";
import { Mission } from "../types";
import ImageViewer from "./ImageViewer";

interface ReviewScreenProps {
  mission: Mission;
  onBack: () => void;
  onSubmit: (missionId: string, rating: number, comment: string) => void;
}

export default function ReviewScreen({ mission, onBack, onSubmit }: ReviewScreenProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hovered, setHovered] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIdx, setViewerIdx] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(mission.id, rating, comment);
  };

  const allAfterPhotos = (mission.afterPhotos || []).map(u => ({ url: u, title: "Après" }));
  const allBeforePhotos = (mission.beforePhotos || []).map(u => ({ url: u, title: "Avant" }));

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sans text-sm font-bold">Évaluer</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brand-lime mb-4 shadow-premium">
          <img src={mission.proAvatar} alt="" className="w-full h-full object-cover" />
        </div>
        <h3 className="font-sans text-lg font-bold">{mission.proName}</h3>
        <p className="text-xs text-secondary mb-1">{mission.category}</p>
        <p className="text-caption text-secondary mb-6 max-w-xs">{mission.title}</p>

        {/* Before / After photos */}
        {(mission.beforePhotos?.length || mission.afterPhotos?.length) ? (
          <div className="w-full mb-6">
            <div className="flex gap-3">
              {mission.beforePhotos && mission.beforePhotos.length > 0 && (
                <div className="flex-1">
                  <p className="text-caption font-medium text-secondary mb-1.5 text-center uppercase tracking-wider">Avant</p>
                  <button onClick={() => { setViewerIdx(0); setViewerOpen(true); }} className="w-full aspect-video rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform">
                    <img src={mission.beforePhotos[0]} alt="" className="w-full h-full object-cover" />
                  </button>
                </div>
              )}
              {mission.afterPhotos && mission.afterPhotos.length > 0 && (
                <div className="flex-1">
                  <p className="text-caption font-medium text-secondary mb-1.5 text-center uppercase tracking-wider">Après</p>
                  <button onClick={() => { setViewerIdx(mission.beforePhotos?.length || 0); setViewerOpen(true); }} className="w-full aspect-video rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform">
                    <img src={mission.afterPhotos[0]} alt="" className="w-full h-full object-cover" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Star rating */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="cursor-pointer active:scale-90 transition-transform"
            >
              <Star
                className={`w-10 h-10 transition-all drop-shadow-sm ${
                  star <= (hovered || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300 fill-gray-200 stroke-gray-400"
                }`}
              />
            </button>
          ))}
        </div>

        <p className="text-xs font-bold text-brand-forest mb-4">
          {rating === 0 ? "Tapez pour évaluer" : rating <= 2 ? "Mauvais" : rating === 3 ? "Correct" : rating === 4 ? "Très bien" : "Excellent !"}
        </p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience..."
          className="w-full text-sm bg-white border border-pale-mint/30 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-brand-forest resize-none min-h-[100px]"
        />
      </div>

      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className={`w-full h-13 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
            rating > 0
              ? "bg-brand-lime text-brand-forest shadow-sm"
              : "bg-pale-mint text-secondary/50 cursor-not-allowed"
          }`}
        >
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
