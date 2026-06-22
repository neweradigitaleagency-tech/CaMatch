import { useState } from "react";
import { ArrowLeft, MoreVertical, Star, MapPin, ShieldCheck, Plus, Check, BadgeCheck, Image as ImageIcon, Clock, DollarSign, Phone, MessageSquare, ChevronRight } from "lucide-react";
import { ProfessionalDetails, Service, PortfolioItem, ProVerification, VerificationLevel } from "../types";
import ImageViewer from "./ImageViewer";
import GlassCard from "./ui/GlassCard";
import GlassButton from "./ui/GlassButton";
import VerifiedBadge from "./ui/VerifiedBadge";
import RatingStars from "./ui/RatingStars";

interface ProfilProScreenProps {
  pro: ProfessionalDetails;
  services: Service[];
  portfolio?: PortfolioItem[];
  verification?: ProVerification;
  onBack: () => void;
  onInitiateMatch: (selectedServices: Service[]) => void;
}

const VERIFICATION_LABELS: Record<VerificationLevel, { label: string; color: string }> = {
  none: { label: "Non vérifié", color: "text-ca-text-muted" },
  phone: { label: "Téléphone vérifié", color: "text-ca-info" },
  id: { label: "Identité vérifiée", color: "text-ca-info" },
  background: { label: "Confiance vérifiée", color: "text-[#B8632E]" },
  certified: { label: "Expert certifié", color: "text-[#B8632E]" },
  elite: { label: "Niveau Élite", color: "text-ca-error" },
};

export default function ProfilProScreen({ pro, services, portfolio, verification, onBack, onInitiateMatch }: ProfilProScreenProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);

  const toggleService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  const handleLaunchMatch = () => {
    const activeServices = services.filter((s) => selectedServiceIds.includes(s.id));
    const finalServicesList = activeServices.length > 0 ? activeServices : [services[0]];
    onInitiateMatch(finalServicesList);
  };

  const currentRating = (pro.rating / 10).toFixed(1);
  const vInfo = verification ? VERIFICATION_LABELS[verification.level] : null;

  return (
    <div className="flex flex-col w-full pb-8 relative" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      {/* Top action bar */}
      <header className="flex justify-between items-center px-4 py-3 sticky top-0 z-10" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, transparent 100%)" }}>
        <button
          onClick={onBack}
          className="w-11 h-11 flex items-center justify-center rounded-[14px] bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] text-ca-text-primary hover:bg-[rgba(255,255,255,0.80)] transition-colors cursor-pointer active:scale-95 shadow-[0_4px_16px_rgba(45,106,79,0.06)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[14px] font-bold text-ca-text-primary">Profil Pro</h1>
        <button className="w-11 h-11 flex items-center justify-center rounded-[14px] bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] text-ca-text-primary hover:bg-[rgba(255,255,255,0.80)] transition-colors cursor-pointer active:scale-95 shadow-[0_4px_16px_rgba(45,106,79,0.06)]">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Hero card */}
      <section className="px-4 mt-1 mb-4">
        <div className="w-full aspect-[3/4] rounded-[20px] overflow-hidden shadow-[0_8px_32px_rgba(45,106,79,0.15)] relative group">
          <img alt={pro.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" src={pro.avatarUrl} />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(27,46,31,0.85)] via-[rgba(27,46,31,0.20)] to-transparent flex flex-col justify-end p-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-[22px] font-bold text-white">{pro.name}</h2>
                  {pro.isVerified && <VerifiedBadge className="bg-[rgba(255,255,255,0.20)] text-white border-white/40" />}
                </div>
                <p className="text-white/80 text-[13px] font-medium">{pro.title}</p>
                {vInfo && (
                  <span className={`inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium uppercase tracking-wider ${vInfo.color}`}>
                    <BadgeCheck className="w-3 h-3" />{vInfo.label}
                  </span>
                )}
              </div>
              <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-[8px] px-2.5 py-1.5 rounded-[12px] flex items-center gap-1 shadow-md">
                <Star className="w-4 h-4 fill-ca-warning text-ca-warning" />
                <span className="text-[12px] font-bold text-ca-text-primary">{currentRating}</span>
                <span className="text-[11px] text-ca-text-muted">({pro.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info bar glass — 3 colonnes */}
      <section className="px-4 mb-4">
        <GlassCard className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-[18px] font-extrabold text-ca-text-primary">{pro.experienceYears}</p>
              <p className="text-[11px] text-ca-text-muted">Ans d'exp.</p>
            </div>
            <div className="text-center border-x border-[rgba(232,224,208,0.40)]">
              <p className="text-[18px] font-extrabold text-ca-text-primary">{pro.completedInterventions}+</p>
              <p className="text-[11px] text-ca-text-muted">Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-extrabold text-ca-text-primary">&lt; 30 min</p>
              <p className="text-[11px] text-ca-text-muted">Tps réponse</p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Tarifs */}
      <section className="px-4 mb-4">
        <GlassCard className="p-4">
          <h3 className="text-[11px] font-bold text-ca-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Tarifs
          </h3>
          <div className="flex gap-2">
            <div className="flex-1 bg-[rgba(255,255,255,0.40)] rounded-[14px] p-3 text-center border border-[rgba(255,255,255,0.30)]">
              <p className="text-[11px] text-ca-text-muted uppercase tracking-wider font-medium">Taux horaire</p>
              <p className="text-[18px] font-extrabold text-ca-text-primary">{pro.hourlyRateXOF.toLocaleString("fr-FR")} <span className="text-[11px] font-medium">F</span></p>
            </div>
            <div className="flex-1 bg-[rgba(255,255,255,0.40)] rounded-[14px] p-3 text-center border border-[rgba(255,255,255,0.30)]">
              <p className="text-[11px] text-ca-text-muted uppercase tracking-wider font-medium">Déplacement</p>
              <p className="text-[18px] font-extrabold text-ca-text-primary">5 000 <span className="text-[11px] font-medium">F</span></p>
            </div>
            <div className="flex-1 bg-[rgba(45,106,79,0.85)] rounded-[14px] p-3 text-center border border-[rgba(82,183,136,0.30)]">
              <p className="text-[11px] text-white/60 uppercase tracking-wider font-medium">Forfait 2h</p>
              <p className="text-[18px] font-extrabold text-white">{(pro.hourlyRateXOF * 2 + 5000).toLocaleString("fr-FR")} <span className="text-[11px] font-medium">F</span></p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Portfolio */}
      {portfolio && portfolio.length > 0 && (
        <section className="px-4 mb-4">
          <GlassCard className="p-4">
            <h3 className="text-[11px] font-bold text-ca-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Portfolio ({portfolio.length})
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {portfolio.slice(0, 8).map((item, i) => (
                <div key={item.id} onClick={() => { setGalleryIdx(i); setGalleryOpen(true); }}
                  className="rounded-[12px] overflow-hidden aspect-square cursor-pointer active:scale-95 transition-transform border border-[rgba(255,255,255,0.30)]">
                  <img src={item.imageUrl} alt={item.caption || "Réalisation"} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      )}

      {/* Services */}
      <section className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[16px] font-bold text-ca-text-primary">Services</h3>
          <span className="text-[11px] text-ca-text-muted italic">Sélectionnez pour estimer</span>
        </div>
        <div className="space-y-2.5">
          {services.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            return (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`p-4 rounded-[16px] flex items-center justify-between cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-[rgba(82,183,136,0.15)] border-[rgba(82,183,136,0.40)]"
                    : "bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] hover:shadow-[0_8px_32px_rgba(45,106,79,0.08)]"
                }`}
              >
                <div className="flex-1 pr-3">
                  <h4 className="font-bold text-[13px] text-ca-text-primary mb-0.5">{service.name}</h4>
                  <p className="text-[13px] font-bold text-ca-green-primary">{service.priceEstimateXOF.toLocaleString("fr-FR")} F</p>
                  <p className="text-[11px] text-ca-text-muted italic mt-0.5">{service.description}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleService(service.id); }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0 ${
                    isSelected ? "bg-ca-green-primary text-white" : "bg-[rgba(45,106,79,0.15)] text-ca-green-primary"
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bio */}
      <section className="px-4 mb-4">
        <GlassCard className="p-4">
          <h3 className="text-[11px] font-bold text-ca-text-secondary uppercase tracking-wider mb-1.5">À propos</h3>
          <p className="text-[13px] text-ca-text-secondary leading-relaxed">{pro.bio || "Aucune bio pour le moment."}</p>
        </GlassCard>
      </section>

      {/* Section Avis (mock) */}
      <section className="px-4 mb-4">
        <h3 className="text-[16px] font-bold text-ca-text-primary mb-3">Avis</h3>
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[rgba(255,255,255,0.30)] shrink-0">
                  <img
                    src={`https://i.pravatar.cc/40?u=${i}`}
                    alt="" className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[13px] font-bold text-ca-text-primary">Client {i}</h4>
                    <span className="text-[11px] text-ca-text-muted">Il y a {i * 3}j</span>
                  </div>
                  <RatingStars rating={5 - i + 1} size={12} />
                  <p className="text-[12px] text-ca-text-secondary mt-1.5 leading-relaxed">
                    {i === 1 ? "Excellent travail ! Professionnel et ponctuel. Je recommande vivement." :
                     i === 2 ? "Très bon service, travail soigné. Un peu de retard mais prévenu à l'avance." :
                     "Correct dans l'ensemble, correspond à la description."}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Bottom bar fixe */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 pb-4 pt-3 bg-gradient-to-t from-[#F5F0E8] via-[#F5F0E8] to-transparent">
          <div className="flex gap-3">
            <button className="flex-1 h-12 bg-[rgba(255,255,255,0.60)] backdrop-blur-[12px] border border-[rgba(82,183,136,0.40)] rounded-[14px] text-[13px] font-semibold text-ca-green-primary flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all duration-150">
              <MessageSquare className="w-4 h-4" /> Contacter
            </button>
            <button
              onClick={handleLaunchMatch}
              className="flex-[2] h-12 bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-white rounded-[14px] text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all duration-150 hover:bg-[rgba(45,106,79,0.95)] shadow-[0_8px_24px_rgba(45,106,79,0.25)]"
            >
              Envoyer une demande
            </button>
          </div>
        </div>
      </div>

      {/* Image viewer */}
      {portfolio && (
        <ImageViewer
          images={portfolio.map(p => ({ url: p.imageUrl, title: p.caption }))}
          initialIndex={galleryIdx}
          open={galleryOpen}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}
