import { useState } from "react";
import { ArrowLeft, Star, MapPin, Check, Plus, Image as ImageIcon, MessageSquare, ChevronRight, Award } from "lucide-react";
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
  none: { label: "Non vérifié", color: "text-gray-400" },
  phone: { label: "Téléphone vérifié", color: "text-gray-500" },
  id: { label: "Identité vérifiée", color: "text-gray-500" },
  background: { label: "Confiance vérifiée", color: "text-gray-700" },
  certified: { label: "Expert certifié", color: "text-gray-900" },
  elite: { label: "Niveau Élite", color: "text-gray-900" },
};

export default function ProfilProScreen({ pro, services, portfolio, verification, onBack, onInitiateMatch, reviews, badges }: ProfilProScreenProps) {
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
    const fallback = services.length > 0 ? [services[0]!] : [];
    const finalServicesList = activeServices.length > 0 ? activeServices : fallback;
    if (finalServicesList.length === 0) return;
    onInitiateMatch(finalServicesList);
  };

  const currentRating = (pro.rating / 10).toFixed(1);
  const vInfo = verification ? VERIFICATION_LABELS[verification.level] : null;
  const bioLong = (pro.bio || "").length > 120;

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-white border-b border-gray-200">
        <button onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[14px] font-bold text-gray-900">Profil</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Hero */}
      <section className="px-4 mt-4 mb-4">
        <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md relative bg-gray-100">
          <img alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={pro.avatarUrl} />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/10 to-transparent flex flex-col justify-end p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-[24px] font-bold text-white">{pro.name}</h2>
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
              <div className="bg-white/90 px-2.5 py-1.5 rounded-[10px] flex items-center gap-1 shadow-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-[13px] font-bold text-gray-900">{currentRating}</span>
                <span className="text-[11px] text-gray-400">({pro.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="px-4 mb-4">
        <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-[20px] font-bold text-gray-900">{pro.experienceYears}</p>
              <p className="text-[11px] text-gray-500">Ans d'exp.</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-[20px] font-bold text-gray-900">{pro.completedInterventions}+</p>
              <p className="text-[11px] text-gray-500">Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-gray-900">&lt;30 min</p>
              <p className="text-[11px] text-gray-500">Tps réponse</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 mb-4">
        <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Tarifs</h3>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Taux horaire</p>
              <p className="text-[20px] font-bold text-gray-900">{pro.hourlyRateXOF.toLocaleString("fr-FR")}<span className="text-[11px] font-medium text-gray-500"> F</span></p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Déplacement</p>
              <p className="text-[20px] font-bold text-gray-900">5 000<span className="text-[11px] font-medium text-gray-500"> F</span></p>
            </div>
            <div className="flex-1 bg-gray-900 rounded-xl p-3 text-center border border-gray-900">
              <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Forfait 2h</p>
              <p className="text-[20px] font-bold text-white">{(pro.hourlyRateXOF * 2 + 5000).toLocaleString("fr-FR")}<span className="text-[11px] font-medium text-white/70"> F</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Badges */}
      {badges && badges.length > 0 && (
        <section className="px-4 mb-4">
          <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-sm">
            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Badges ({badges.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-[10px] border border-gray-100"
                  title={badge.description}>
                  <span className="text-[14px]">{badge.icon}</span>
                  <span className="text-[11px] font-medium text-gray-700">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio */}
      {portfolio && portfolio.length > 0 && (
        <section className="px-4 mb-4">
          <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-sm">
            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Portfolio ({portfolio.length})
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {portfolio.slice(0, 8).map((item, i) => (
                <div key={item.id} onClick={() => { setGalleryIdx(i); setGalleryOpen(true); }}
                  className="rounded-[10px] overflow-hidden aspect-square cursor-pointer active:scale-95 transition-transform border border-gray-100 bg-gray-50">
                  <img src={item.imageUrl} alt={item.caption || "Réalisation"} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Description */}
      <section className="px-4 mb-4">
        <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">À propos</h3>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            {bioExpanded || !bioLong ? pro.bio || "Aucune bio pour le moment." : pro.bio?.slice(0, 120) + "..."}
          </p>
          {bioLong && (
            <button onClick={() => setBioExpanded(!bioExpanded)} className="text-[12px] font-medium text-gray-900 mt-1 cursor-pointer">
              {bioExpanded ? "Réduire" : "Lire plus"}
            </button>
          )}
        </div>
      </section>

      {/* Services */}
      <section className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[16px] font-bold text-gray-900">Services</h3>
          <span className="text-[11px] text-gray-400">Sélectionnez pour estimer</span>
        </div>
        <div className="space-y-2">
          {services.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            return (
              <div key={service.id} onClick={() => toggleService(service.id)}
                className={`p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-gray-100 border-gray-300"
                    : "bg-white border-gray-200 hover:shadow-sm"
                }`}>
                <div className="flex-1 pr-3">
                  <h4 className="font-semibold text-[13px] text-gray-900 mb-0.5">{service.name}</h4>
                  <p className="text-[14px] font-medium text-gray-900">{service.priceEstimateXOF.toLocaleString("fr-FR")} F</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{service.description}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleService(service.id); }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0 ${
                    isSelected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
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
            <h3 className="text-[16px] font-bold text-gray-900">Avis ({reviews.length})</h3>
            {reviews.length > 3 && (
              <button onClick={() => setShowAllReviews(!showAllReviews)} className="text-[12px] text-gray-900 font-medium cursor-pointer">
                {showAllReviews ? "Moins" : "Voir tout"}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review, i) => {
              const daysAgo = Math.floor((Date.now() - new Date(review.createdAt).getTime()) / 86400000);
              return (
                <div key={i} className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                      <img src={review.clientAvatar} alt={review.clientName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[13px] font-semibold text-gray-900">{review.clientName}</h4>
                        <span className="text-[11px] text-gray-400">Il y a {daysAgo || 1}j</span>
                      </div>
                      <RatingStars rating={review.rating} size={12} />
                      <p className="text-[12px] text-gray-600 mt-1.5 leading-relaxed">{review.comment}</p>
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
        <div className="max-w-md mx-auto px-4 pb-[max(8px,env(safe-area-inset-bottom,8px))] pt-3 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
          <div className="flex gap-3">
            <button className="flex-1 h-12 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-700 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all bg-white">
              <MessageSquare className="w-4 h-4" /> Contacter
            </button>
            <button onClick={handleLaunchMatch}
              className="flex-[2] h-12 bg-gray-900 text-white rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all hover:bg-gray-800 shadow-md">
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
