import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Star, MapPin, Clock, Briefcase, Phone, MessageSquare, Check, Edit3, Trash2, Plus, X } from "lucide-react";
import { ProPricingConfig, ProAvailability } from "../types";
import ImageViewer from "./ImageViewer";

interface PortfolioImage {
  id: string;
  url: string;
  title: string;
}

interface ProProfileMiniSiteProps {
  proId: string;
  proName: string;
  proAvatar: string;
  proTitle: string;
  proCategory: string;
  proBio: string;
  proRating: number;
  proReviews: number;
  proMissions: number;
  proCity: string;
  proPhone: string;
  proVerified: boolean;
  proJoined: string;
  portfolio: PortfolioImage[];
  pricing: ProPricingConfig;
  availability: ProAvailability;
  isOwnProfile?: boolean;
  onBack: () => void;
  onOpenChat: () => void;
  onEdit?: () => void;
}

const DAY_LABELS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function ProProfileMiniSiteScreen({
  proName, proAvatar, proTitle, proCategory, proBio, proRating, proReviews, proMissions, proCity, proPhone, proVerified, proJoined,
  portfolio, pricing, availability, isOwnProfile, onBack, onOpenChat, onEdit,
}: ProProfileMiniSiteProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [avatarViewOpen, setAvatarViewOpen] = useState(false);
  const [localPortfolio, setLocalPortfolio] = useState(portfolio);

  const handleDeletePortfolioImage = (id: string) => {
    setLocalPortfolio((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPortfolioImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setLocalPortfolio((prev) => [...prev, { id: "new_" + Date.now(), url, title: "Ajouté récemment" }]);
      }
    };
    input.click();
  };

  const renderStars = (n: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(n) ? "fill-amber-400 text-amber-400" : "text-pale-mint"}`} />
      ))}
    </div>
  );

  const pricingEntries: { label: string; value: number | null; suffix: string }[] = [
    { label: "Horaire", value: pricing.hourlyRateXOF || null, suffix: "F/h" },
    { label: "Forfait", value: pricing.fixedPriceXOF || null, suffix: "F" },
    { label: "Intervention", value: pricing.perInterventionXOF || null, suffix: "F" },
    { label: "Sur mesure", value: pricing.pricingType === "custom" ? (pricing.customPriceXOF || 0) : null, suffix: "" },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      {/* Header */}
      <header className="relative h-48 bg-gradient-to-br from-brand-forest to-brand-lime/80 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-32 h-32 rounded-full border border-white/20" />
          <div className="absolute top-10 right-8 w-24 h-24 rounded-full border border-white/20" />
          <div className="absolute -bottom-6 left-1/3 w-40 h-40 rounded-full border border-white/10" />
        </div>
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm cursor-pointer active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {isOwnProfile && onEdit && (
              <button onClick={onEdit} className="h-9 px-3 flex items-center gap-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm text-caption font-medium cursor-pointer active:scale-95">
                <Edit3 className="w-3 h-3" /> Modifier
              </button>
            )}
            <button onClick={onOpenChat} className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-lime text-brand-forest cursor-pointer active:scale-95">
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="absolute -bottom-12 left-4 flex items-end gap-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-[3px] border-brand-cream z-10 shadow-premium cursor-pointer active:scale-95 transition-transform"
            onClick={() => setAvatarViewOpen(true)}>
            <img src={proAvatar} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Profile info */}
      <div className="pt-14 px-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-xl font-bold text-brand-forest">{proName}</h1>
              {proVerified && <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
            </div>
            <p className="text-xs font-bold text-secondary mt-0.5">{proTitle}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1">{renderStars(proRating)}<span className="text-caption text-secondary ml-1">({proReviews})</span></div>
              <span className="text-caption text-secondary flex items-center gap-1"><Briefcase className="w-3 h-3" />{proMissions} missions</span>
            </div>
            <p className="text-caption text-secondary flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />{proCity}
            </p>
          </div>
          <a href={`tel:${proPhone}`} className="w-12 h-12 rounded-2xl bg-brand-lime flex items-center justify-center shadow-sm cursor-pointer hover:brightness-105 transition-all active:scale-95">
            <Phone className="w-5 h-5 text-brand-forest" />
          </a>
        </div>
      </div>

      {/* Bio */}
      {proBio && (
        <div className="px-4 mb-4">
          <h3 className="text-caption uppercase tracking-widest text-secondary font-bold mb-1.5">À propos</h3>
          <p className="text-xs text-secondary leading-relaxed">{proBio}</p>
          <p className="text-caption text-secondary/50 mt-1">Membre depuis {proJoined}</p>
        </div>
      )}

      {/* Portfolio gallery */}
      {localPortfolio.length > 0 && (
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-caption uppercase tracking-widest text-secondary font-bold">Portfolio ({localPortfolio.length})</h3>
            {isOwnProfile && (
              <button onClick={handleAddPortfolioImage}
                className="text-caption font-medium text-brand-forest bg-pale-mint px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer active:scale-95">
                <Plus className="w-3 h-3" /> Ajouter
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {localPortfolio.map((img, i) => (
              <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-pale-mint">
                <button onClick={() => { setGalleryIdx(i); setGalleryOpen(true); }} className="w-full h-full cursor-pointer active:scale-95 transition-transform">
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                </button>
                {isOwnProfile && (
                  <button onClick={() => handleDeletePortfolioImage(img.id)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer active:scale-90">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {isOwnProfile && (
              <button onClick={handleAddPortfolioImage}
                className="aspect-square rounded-xl border-2 border-dashed border-pale-mint flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 hover:bg-pale-mint/30 transition-all text-secondary">
                <Plus className="w-5 h-5" />
                <span className="text-caption font-medium">Ajouter</span>
              </button>
            )}
          </div>
        </div>
      )}
      {localPortfolio.length === 0 && isOwnProfile && (
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-caption uppercase tracking-widest text-secondary font-bold">Portfolio</h3>
          </div>
          <button onClick={handleAddPortfolioImage}
            className="w-full aspect-video rounded-2xl border-2 border-dashed border-pale-mint flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 hover:bg-pale-mint/30 transition-all text-secondary">
            <Plus className="w-8 h-8" />
            <span className="text-caption font-medium">Ajouter des photos</span>
          </button>
        </div>
      )}

      {/* Pricing */}
      <div className="px-4 mb-5">
        <h3 className="text-caption uppercase tracking-widest text-secondary font-bold mb-2">Tarifs</h3>
        <div className="grid grid-cols-2 gap-2">
          {pricingEntries.filter(p => p.value !== null).map((p) => (
            <div key={p.label} className="bg-white rounded-2xl p-3 border border-pale-mint/20 shadow-sm text-center">
              <p className="text-caption text-secondary font-medium uppercase tracking-wider">{p.label}</p>
              <p className="text-lg font-extrabold text-brand-forest mt-0.5">
                {p.value! > 0 ? `${p.value!.toLocaleString()} F` : "Sur devis"}
              </p>
              <p className="text-caption text-secondary/50">{p.suffix}</p>
            </div>
          ))}
        </div>
        {pricing.pricingType === "custom" && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
            <p className="text-caption font-medium text-amber-700">Devis personnalisé disponible</p>
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="px-4 mb-5">
        <h3 className="text-caption uppercase tracking-widest text-secondary font-bold mb-2">Disponibilités</h3>
        <div className="bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm">
          <div className="flex gap-1.5 flex-wrap">
            {DAY_LABELS_FR.map((d, i) => {
              const dayKey = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][i];
              const slot = (availability as any)[dayKey] as { start: string; end: string } | null;
              const isWorking = slot !== null;
              return (
                <div key={d} className={`flex flex-col items-center gap-0.5 ${isWorking ? "" : "opacity-40"}`}>
                  <div className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center text-caption font-medium ${
                    isWorking ? "bg-brand-lime/20 text-brand-forest" : "bg-pale-mint text-secondary/40"
                  }`}>
                    {d}
                  </div>
                  {isWorking && (
                    <span className="text-caption text-secondary/60 font-medium">{slot!.start.slice(0, 5)}</span>
                  )}
                </div>
              );
            })}
          </div>
          {availability.holidays.length > 0 && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-2 text-center">
              <p className="text-caption font-medium text-red-600">Jours fériés : {availability.holidays.length} jour(s)</p>
            </div>
          )}
        </div>
      </div>

      {/* Gallery modal */}
      <ImageViewer
        images={localPortfolio.map(p => ({ url: p.url, title: p.title }))}
        initialIndex={galleryIdx}
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />

      {/* Avatar viewer */}
      <ImageViewer
        images={[{ url: proAvatar, title: proName }]}
        initialIndex={0}
        open={avatarViewOpen}
        onClose={() => setAvatarViewOpen(false)}
      />

      {/* Own profile edit hint */}
      {isOwnProfile && (
        <div className="px-4 pb-4">
          <p className="text-caption text-secondary/50 text-center">
            Cliquez sur les photos du portfolio pour les agrandir • Passez la souris pour supprimer
          </p>
        </div>
      )}
    </div>
  );
}
