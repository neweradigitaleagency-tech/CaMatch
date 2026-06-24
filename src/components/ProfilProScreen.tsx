import { useState } from "react";
import { ArrowLeft, Star, MapPin, Check, Plus, Image as ImageIcon, MessageSquare, ChevronRight, Crown, Award, TrendingDown } from "lucide-react";
import { ProfessionalDetails, Service, PortfolioItem, ProVerification, VerificationLevel, PRO_LEVELS, type ProLevelConfig, type Badge } from "../types";
import ImageViewer from "./ImageViewer";
import VerifiedBadge from "./ui/VerifiedBadge";
import RatingStars from "./ui/RatingStars";

interface ProfilProScreenProps {
  pro: ProfessionalDetails;
  services: Service[];
  portfolio?: PortfolioItem[];
  verification?: ProVerification;
  onBack: () => void;
  onInitiateMatch: (selectedServices: Service[]) => void;
  reviews?: { clientName: string; clientAvatar: string; rating: number; comment: string; createdAt: string }[];
  levelConfig?: ProLevelConfig;
  badges?: Badge[];
  commissionPercent?: number;
}

const VERIFICATION_LABELS: Record<VerificationLevel, { label: string; color: string }> = {
  none: { label: "Non vérifié", color: "text-cm-text-muted" },
  phone: { label: "Téléphone vérifié", color: "text-cm-text-soft" },
  id: { label: "Identité vérifiée", color: "text-cm-text-soft" },
  background: { label: "Confiance vérifiée", color: "text-cm-text" },
  certified: { label: "Expert certifié", color: "text-cm-accent" },
  elite: { label: "Niveau Élite", color: "text-cm-accent" },
};

export default function ProfilProScreen({ pro, services, portfolio, verification, onBack, onInitiateMatch, reviews, levelConfig, badges, commissionPercent }: ProfilProScreenProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  const toggleService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  const handleLaunchMatch = () => {
    const activeServices = services.filter((s) => selectedServiceIds.includes(s.id));
    const fallback = services.length > 0 ? [services[0]] : [];
    const finalServicesList = activeServices.length > 0 ? activeServices : fallback;
    if (finalServicesList.length === 0) return;
    onInitiateMatch(finalServicesList);
  };

  const currentRating = (pro.rating / 10).toFixed(1);
  const vInfo = verification ? VERIFICATION_LABELS[verification.level] : null;
  const bioLong = (pro.bio || "").length > 120;

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full text-cm-text hover:bg-cm-accent-soft transition-colors cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[14px] font-display font-bold text-cm-text">Profil</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Hero */}
      <section className="px-4 mt-4 mb-4">
        <div className="w-full aspect-[3/4] rounded-[16px] overflow-hidden shadow-cm-md relative bg-cm-border-soft">
          <img alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={pro.avatarUrl} />
          <div className="absolute inset-0 bg-gradient-to-t from-cm-text/80 via-cm-text/10 to-transparent flex flex-col justify-end p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-[24px] font-display font-bold text-white">{pro.name}</h2>
                  {pro.isVerified && <VerifiedBadge />}
                </div>
                <p className="text-white/70 text-[14px] font-medium">{pro.title}</p>
                {vInfo && (
                  <span className={`inline-flex items-center gap-1 mt-1 text-[11px] font-medium ${vInfo.color}`}>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {vInfo.label}
                  </span>
                )}
              </div>
              <div className="bg-cm-elevated px-2.5 py-1.5 rounded-[10px] flex items-center gap-1 shadow-cm-sm">
                <Star className="w-4 h-4 text-cm-text" />
                <span className="text-[13px] font-bold text-cm-text">{currentRating}</span>
                <span className="text-[11px] text-cm-text-muted">({pro.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row + Level */}
      <section className="px-4 mb-4">
        <div className="border border-cm-border rounded-[14px] bg-cm-elevated p-4 shadow-cm-sm">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-[20px] font-display font-bold text-cm-text">{pro.experienceYears}</p>
              <p className="text-[11px] text-cm-text-soft">Ans d'exp.</p>
            </div>
            <div className="text-center border-x border-cm-border-soft">
              <p className="text-[20px] font-display font-bold text-cm-text">{pro.completedInterventions}+</p>
              <p className="text-[11px] text-cm-text-soft">Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-display font-bold text-cm-text">&lt;30 min</p>
              <p className="text-[11px] text-cm-text-soft">Tps réponse</p>
            </div>
          </div>
          {levelConfig && (() => {
            const tierIndex = PRO_LEVELS.findIndex(l => l.level === levelConfig.level) + 1;
            return (
            <div className="border-t border-cm-border mt-3 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {levelConfig.level === "élite" ? <Crown className="w-4 h-4 text-cm-accent" /> : <Award className="w-4 h-4 text-cm-accent" />}
                <div>
                  <span className="text-[13px] font-bold text-cm-text">{levelConfig.label}</span>
                  <span className="text-[11px] text-cm-text-muted ml-2">Niveau {tierIndex}/4</span>
                </div>
              </div>
              {commissionPercent !== undefined && (
                <div className="flex items-center gap-1 text-[11px] text-cm-text-soft">
                  <TrendingDown className="w-3 h-3" />
                  Commission {commissionPercent}%
                </div>
              )}
            </div>
            );
          })()}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 mb-4">
        <div className="border border-cm-border rounded-[14px] bg-cm-elevated p-4 shadow-cm-sm">
          <h3 className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-3">Tarifs</h3>
          <div className="flex gap-2">
            <div className="flex-1 bg-cm-bg rounded-[12px] p-3 text-center border border-cm-border-soft">
              <p className="text-[10px] text-cm-text-muted uppercase tracking-wider font-medium">Taux horaire</p>
              <p className="text-[20px] font-display font-bold text-cm-text">{pro.hourlyRateXOF.toLocaleString("fr-FR")}<span className="text-[11px] font-mono font-medium text-cm-text-soft"> F</span></p>
            </div>
            <div className="flex-1 bg-cm-bg rounded-[12px] p-3 text-center border border-cm-border-soft">
              <p className="text-[10px] text-cm-text-muted uppercase tracking-wider font-medium">Déplacement</p>
              <p className="text-[20px] font-display font-bold text-cm-text">5 000<span className="text-[11px] font-mono font-medium text-cm-text-soft"> F</span></p>
            </div>
            <div className="flex-1 bg-cm-accent rounded-[12px] p-3 text-center border border-cm-accent">
              <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Forfait 2h</p>
              <p className="text-[20px] font-display font-bold text-white">{(pro.hourlyRateXOF * 2 + 5000).toLocaleString("fr-FR")}<span className="text-[11px] font-mono font-medium text-white/70"> F</span></p>
            </div>
          </div>
          <div className="border-t border-cm-border mt-3" />
        </div>
      </section>

      {/* Badges */}
      {badges && badges.length > 0 && (
        <section className="px-4 mb-4">
          <div className="border border-cm-border rounded-[14px] bg-cm-elevated p-4 shadow-cm-sm">
            <h3 className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Badges ({badges.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cm-bg rounded-[10px] border border-cm-border-soft"
                  title={badge.description}>
                  <span className="text-[14px]">{badge.icon}</span>
                  <span className="text-[11px] font-medium text-cm-text">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio */}
      {portfolio && portfolio.length > 0 && (
        <section className="px-4 mb-4">
          <div className="border border-cm-border rounded-[14px] bg-cm-elevated p-4 shadow-cm-sm">
            <h3 className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Portfolio ({portfolio.length})
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {portfolio.slice(0, 8).map((item, i) => (
                <div key={item.id} onClick={() => { setGalleryIdx(i); setGalleryOpen(true); }}
                  className="rounded-[10px] overflow-hidden aspect-square cursor-pointer active:scale-95 transition-transform border border-cm-border-soft bg-cm-bg">
                  <img src={item.imageUrl} alt={item.caption || "Réalisation"} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Description */}
      <section className="px-4 mb-4">
        <div className="border border-cm-border rounded-[14px] bg-cm-elevated p-4 shadow-cm-sm">
          <h3 className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-1.5">À propos</h3>
          <p className="text-[13px] text-cm-text-soft leading-relaxed">
            {bioExpanded || !bioLong ? pro.bio || "Aucune bio pour le moment." : pro.bio?.slice(0, 120) + "..."}
          </p>
          {bioLong && (
            <button onClick={() => setBioExpanded(!bioExpanded)} className="text-[12px] font-medium text-cm-accent mt-1 cursor-pointer">
              {bioExpanded ? "Réduire" : "Lire plus"}
            </button>
          )}
        </div>
      </section>

      {/* Services */}
      <section className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[16px] font-display font-bold text-cm-text">Services</h3>
          <span className="text-[11px] text-cm-text-muted">Sélectionnez pour estimer</span>
        </div>
        <div className="space-y-2">
          {services.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            return (
              <div key={service.id} onClick={() => toggleService(service.id)}
                className={`p-4 rounded-[14px] flex items-center justify-between cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-cm-accent-soft border-cm-accent"
                    : "bg-cm-elevated border-cm-border hover:shadow-cm-sm"
                }`}>
                <div className="flex-1 pr-3">
                  <h4 className="font-semibold text-[13px] text-cm-text mb-0.5">{service.name}</h4>
                  <p className="text-[14px] font-mono font-medium text-cm-text">{service.priceEstimateXOF.toLocaleString("fr-FR")} F</p>
                  <p className="text-[11px] text-cm-text-muted mt-0.5">{service.description}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleService(service.id); }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0 ${
                    isSelected ? "bg-cm-accent text-white" : "bg-cm-border-soft text-cm-text-soft"
                  }`}>
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <section className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16px] font-display font-bold text-cm-text">Avis ({reviews.length})</h3>
            {reviews.length > 3 && (
              <button onClick={() => setShowAllReviews(!showAllReviews)} className="text-[12px] text-cm-accent font-medium cursor-pointer">
                {showAllReviews ? "Moins" : "Voir tout"}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review, i) => {
              const daysAgo = Math.floor((Date.now() - new Date(review.createdAt).getTime()) / 86400000);
              return (
                <div key={i} className="p-4 border border-cm-border rounded-[14px] bg-cm-elevated shadow-cm-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-cm-border-soft shrink-0 bg-cm-bg">
                      <img src={review.clientAvatar} alt={review.clientName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[13px] font-semibold text-cm-text">{review.clientName}</h4>
                        <span className="text-[11px] text-cm-text-muted">Il y a {daysAgo || 1}j</span>
                      </div>
                      <RatingStars rating={review.rating} size={12} />
                      <p className="text-[12px] text-cm-text-soft mt-1.5 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 pb-[max(8px,env(safe-area-inset-bottom,8px))] pt-3 bg-gradient-to-t from-cm-bg via-cm-bg to-transparent">
          <div className="flex gap-3">
            <button className="flex-1 h-12 border border-cm-border rounded-[12px] text-[13px] font-medium text-cm-text flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all bg-cm-elevated">
              <MessageSquare className="w-4 h-4" /> Contacter
            </button>
            <button onClick={handleLaunchMatch}
              className="flex-[2] h-12 bg-cm-accent text-white rounded-[12px] text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all hover:bg-cm-accent-hover shadow-cm-md">
              Envoyer une demande
            </button>
          </div>
        </div>
      </div>

      {portfolio && (
        <ImageViewer images={portfolio.map(p => ({ url: p.imageUrl, title: p.caption }))} initialIndex={galleryIdx} open={galleryOpen} onClose={() => setGalleryOpen(false)} />
      )}
    </div>
  );
}
