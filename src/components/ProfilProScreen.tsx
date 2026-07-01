import { useState, useMemo } from "react";
import {
  ArrowLeft, Heart, Share2, MapPin, ShieldCheck, Award,
  Image as ImageIcon, MessageCircle, Check, Plus, Clock, Globe,
  CreditCard, Calendar, Phone, MapPinned, Star,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ProfessionalDetails, Service, PortfolioItem, ProVerification, VerificationLevel, Badge } from "../types";
import ImageViewer from "./ImageViewer";
import { BannerGradient, StatusPill, StarRating } from "./ui/ProCard";

interface ProfilProScreenProps {
  pro: ProfessionalDetails;
  services: Service[];
  portfolio?: PortfolioItem[];
  verification?: ProVerification;
  onBack: () => void;
  onInitiateMatch: (selectedServices: Service[]) => void;
  reviews?: {
    clientName: string;
    clientAvatar: string;
    rating: number;
    comment: string;
    createdAt: string;
    photos?: string[];
    reply?: { text: string; createdAt: string };
  }[];
  badges?: Badge[];
}

const PAYMENT_LABELS: Record<string, string> = {
  orange_money: "Orange Money",
  mtn_momo: "MTN MoMo",
  wave: "Wave",
  moov_money: "Moov Money",
};

const REVIEW_FILTERS = [
  { key: "all" as const, label: "Tous" },
  { key: "5" as const, label: "5★" },
  { key: "4" as const, label: "4★" },
  { key: "3" as const, label: "3★" },
  { key: "photos" as const, label: "Photos" },
];

const PREMIUM_BADGES = [
  { name: "Identité vérifiée", icon: ShieldCheck },
  { name: "Paiement sécurisé", icon: CreditCard },
  { name: "Intervention rapide", icon: Clock },
  { name: "100% satisfaction", icon: Star },
  { name: "Certifié ÇaMatch", icon: Award },
];

const VERIFICATION_LABELS: Record<VerificationLevel, { label: string; color: string }> = {
  none: { label: "Non vérifié", color: "text-gray-400" },
  phone: { label: "Téléphone vérifié", color: "text-gray-500" },
  id: { label: "Identité vérifiée", color: "text-gray-500" },
  background: { label: "Confiance vérifiée", color: "text-gray-700" },
  certified: { label: "Expert certifié", color: "text-gray-900" },
  elite: { label: "Niveau Élite", color: "text-gray-900" },
};

export default function ProfilProScreen({
  pro, services, portfolio, verification, onBack, onInitiateMatch, reviews, badges,
}: ProfilProScreenProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "5" | "4" | "3" | "photos">("all");
  const [copied, setCopied] = useState(false);

  const rating = pro.rating / 10;
  const vInfo = verification ? VERIFICATION_LABELS[verification.level] : null;
  const bioLong = (pro.bio || "").length > 100;

  const distance = useMemo(() => {
    const hash = pro.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return ((hash % 50) / 10 + 0.3).toFixed(1);
  }, [pro.id]);

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    switch (reviewFilter) {
      case "5": return reviews.filter((r) => r.rating === 5);
      case "4": return reviews.filter((r) => r.rating === 4);
      case "3": return reviews.filter((r) => r.rating === 3);
      case "photos": return reviews.filter((r) => r.photos && r.photos.length > 0);
      default: return reviews;
    }
  }, [reviews, reviewFilter]);

  const displayReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 3);

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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  };

  const trustColor = !pro.trustScore ? "bg-gray-200" : pro.trustScore >= 85 ? "bg-emerald-500" : pro.trustScore >= 70 ? "bg-emerald-400" : pro.trustScore >= 50 ? "bg-amber-400" : "bg-red-400";
  const trustLabel = !pro.trustScore ? "Non évalué" : pro.trustScore >= 85 ? "Excellent" : pro.trustScore >= 70 ? "Fiable" : pro.trustScore >= 50 ? "En progression" : "À améliorer";

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer active:scale-90 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-[13px] font-black text-gray-900 tracking-tight truncate mx-2">{pro.name}</h1>
        <div className="flex items-center gap-1">
          <button onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer active:scale-90 shrink-0 relative"
            aria-label="Partager le profil">
            {copied ? (
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-wider">Copié</span>
            ) : (
              <Share2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button onClick={() => setLiked(!liked)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer active:scale-90 shrink-0"
            aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}>
            <Heart className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative h-[200px] overflow-hidden shrink-0">
        <BannerGradient category={pro.category} />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent" />
        <StatusPill pro={pro} />
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-5">
          <div className="flex items-end gap-3">
            <div className="w-[64px] h-[64px] rounded-full overflow-hidden border-[3px] border-white shadow-lg shrink-0 bg-gray-200">
              <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-[22px] font-black text-white tracking-tight leading-tight">{pro.name}</h2>
              <p className="text-[12px] font-bold text-white/80 mt-0.5">{pro.title || pro.subCategory}</p>
              {vInfo && (
                <div className="flex items-center gap-1.5 mt-1">
                  <svg className="w-3 h-3 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">{vInfo.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pro Info Card */}
      <section className="px-4 -mt-3 relative z-10">
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-black text-gray-900 tracking-tight">{pro.name}</h2>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span className="text-[8px] font-black text-emerald-700 uppercase tracking-wider">Agréé</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="font-semibold">{pro.locationNeighborhood}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="font-semibold">À {distance} km</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="font-semibold">{pro.completedInterventions} missions</span>
            </div>
          </div>
          {/* Trust Score Bar */}
          {pro.trustScore != null && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Score de confiance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-black text-gray-900">{pro.trustScore}%</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase">{trustLabel}</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pro.trustScore}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${trustColor}`}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats row — 4 columns */}
      <section className="px-4 mt-3">
        <div className="grid grid-cols-4 gap-0.5 py-2.5 px-2 rounded-2xl bg-amber-50/60 items-center justify-items-center text-center">
          <div className="flex flex-col items-center">
            <StarRating rating={rating} size="sm" />
            <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-gray-400">Note</span>
          </div>
          <div className="flex flex-col items-center border-x border-gray-200/50 w-full">
            <span className="text-[11px] font-black text-gray-800">{pro.completedInterventions}</span>
            <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-gray-400">Missions</span>
          </div>
          <div className="flex flex-col items-center border-r border-gray-200/50 w-full">
            <span className="text-[11px] font-black text-gray-800">{pro.reviewCount}</span>
            <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-gray-400">Avis</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black text-gray-800">{pro.clientCount || Math.round(pro.completedInterventions * 0.85)}</span>
            <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-gray-400">Clients</span>
          </div>
        </div>
      </section>

      {/* À propos */}
      <section className="px-4 mt-4">
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
          <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-wider mb-2">À propos</h3>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            {bioExpanded || !bioLong
              ? pro.bio || "Professionnel expérimenté prêt à vous accompagner dans vos projets."
              : pro.bio?.slice(0, 100) + "..."}
          </p>
          {bioLong && (
            <button onClick={() => setBioExpanded(!bioExpanded)}
              className="text-[11px] font-black text-gray-900 mt-1.5 cursor-pointer uppercase tracking-wider hover:text-gray-600 transition-colors">
              {bioExpanded ? "Réduire" : "Lire plus"}
            </button>
          )}
        </div>
      </section>

      {/* Badges */}
      <section className="px-4 mt-4">
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-3">
            <Award className="w-4 h-4 text-gray-700" />
            <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-wider">
              Badges {(badges?.length || 0) > 0 ? `(${badges!.length + PREMIUM_BADGES.length})` : `(${PREMIUM_BADGES.length})`}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges?.map((badge) => (
              <div key={badge.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-[10px] border border-gray-100" title={badge.description}>
                <span className="text-[14px]">{badge.icon}</span>
                <span className="text-[11px] font-black text-gray-700">{badge.name}</span>
              </div>
            ))}
            {PREMIUM_BADGES.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div key={`premium-${i}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-[10px] border border-emerald-100">
                  <Icon className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-black text-emerald-700">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Offres */}
      {pro.offers && pro.offers.length > 0 && (
        <section className="px-4 mt-4">
          <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-wider mb-3 px-0.5">Offres spéciales</h3>
          <div className="space-y-2.5">
            {pro.offers.map((offer) => (
              <div key={offer.id} className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-amber-50 via-amber-50/80 to-orange-50 border border-amber-200 p-4">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full -mr-8 -mt-8" />
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex-1 pr-3">
                    <h4 className="text-[13px] font-black text-gray-900 tracking-tight">{offer.title}</h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">{offer.description}</p>
                  </div>
                  <div className={`shrink-0 px-2.5 py-1 rounded-full ${offer.badgeColor} text-white text-[9px] font-black uppercase tracking-wider`}>
                    {offer.badge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tarifs */}
      <section className="px-4 mt-4">
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
          <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-wider mb-3">Tarifs</h3>
          <div className="space-y-0">
            {[
              { label: "Taux horaire", price: pro.hourlyRateXOF, highlighted: false },
              { label: "Déplacement", price: 5000, highlighted: false },
              { label: "Forfait 2h", price: pro.hourlyRateXOF * 2 + 5000, highlighted: true },
              { label: "Forfait 4h", price: pro.hourlyRateXOF * 4 + 5000, highlighted: false },
              { label: "Journée (8h)", price: pro.hourlyRateXOF * 8 + 5000, highlighted: false },
            ].map((row, i) => (
              <div key={row.label}
                className={`flex items-center justify-between py-2.5 ${i > 0 ? "border-t border-gray-100" : ""} ${row.highlighted ? "px-3 -mx-3 bg-gray-900 rounded-[12px] text-white border-t-0 mt-1.5 mb-1.5" : "px-0"}`}>
                <span className={`text-[12px] font-bold ${row.highlighted ? "text-white" : "text-gray-600"}`}>{row.label}</span>
                <span className={`text-[14px] font-black tracking-tight ${row.highlighted ? "text-white" : "text-gray-900"}`}>
                  {row.price.toLocaleString("fr-FR")} <span className={`text-[9px] font-bold ${row.highlighted ? "text-white/70" : "text-gray-400"}`}>F</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h3 className="text-[13px] font-black text-gray-900 tracking-tight">Services</h3>
          <span className="text-[10px] font-bold text-gray-400">Sélectionnez pour estimer</span>
        </div>
        <div className="space-y-2">
          {services.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            return (
              <motion.div
                key={service.id}
                layout
                onClick={() => toggleService(service.id)}
                className={`p-4 rounded-[16px] flex items-center justify-between cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                <div className="flex-1 pr-3">
                  <h4 className={`font-black text-[13px] ${isSelected ? "text-white" : "text-gray-900"} mb-0.5 tracking-tight`}>
                    {service.name}
                  </h4>
                  <p className={`text-[15px] font-black ${isSelected ? "text-white" : "text-gray-900"}`}>
                    {service.priceEstimateXOF.toLocaleString("fr-FR")} F
                  </p>
                  <p className={`text-[11px] font-semibold mt-0.5 ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                    {service.description}
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleService(service.id); }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0 ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}>
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Portfolio */}
      {portfolio && portfolio.length > 0 && (
        <section className="px-4 mt-4">
          <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <ImageIcon className="w-4 h-4 text-gray-700" />
              <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Réalisations ({portfolio.length})</h3>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {portfolio.slice(0, 8).map((item, i) => (
                <div key={item.id} onClick={() => { setGalleryIdx(i); setGalleryOpen(true); }}
                  className="rounded-[12px] overflow-hidden aspect-square cursor-pointer active:scale-95 transition-transform border border-gray-100 bg-gray-50 group relative">
                  <img src={item.imageUrl} alt={item.caption || "Réalisation"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-4">
                    <span className="text-[7px] font-black text-white/90 uppercase tracking-wider">
                      {i % 2 === 0 ? "Avant" : "Après"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Avis */}
      {reviews && reviews.length > 0 && (
        <section className="px-4 mt-4">
          <div className="mb-3 px-0.5">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[13px] font-black text-gray-900 tracking-tight">Avis ({reviews.length})</h3>
              {reviews.length > 3 && (
                <button onClick={() => setShowAllReviews(!showAllReviews)}
                  className="text-[10px] font-black text-gray-700 cursor-pointer uppercase tracking-wider hover:text-gray-900 transition-colors">
                  {showAllReviews ? "Moins" : "Voir tout"}
                </button>
              )}
            </div>
            {/* Filter tabs */}
            <div className="flex gap-1.5">
              {REVIEW_FILTERS.map((f) => {
                const count = f.key === "all" ? reviews.length
                  : f.key === "photos" ? reviews.filter((r) => r.photos && r.photos.length > 0).length
                  : reviews.filter((r) => r.rating === Number(f.key)).length;
                const isActive = reviewFilter === f.key;
                return (
                  <button key={f.key} onClick={() => setReviewFilter(f.key)}
                    className={`px-3 py-1.5 rounded-[10px] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                    }`}>
                    {f.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
            {displayReviews.map((review, i) => {
              const daysAgo = Math.floor((Date.now() - new Date(review.createdAt).getTime()) / 86400000);
              return (
                <motion.div key={`${review.clientName}-${i}`} layout
                  className="p-4 bg-white border border-gray-100 rounded-[16px] shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                      <img src={review.clientAvatar} alt={review.clientName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[13px] font-black text-gray-900 tracking-tight">{review.clientName}</h4>
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 rounded-full">
                            <Check className="w-2 h-2 text-blue-600" />
                            <span className="text-[7px] font-black text-blue-700 uppercase tracking-wider">Vérifié</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">Il y a {daysAgo || 1}j</span>
                      </div>
                      <StarRating rating={review.rating} size="xs" />
                      <p className="text-[12px] text-gray-600 mt-1.5 leading-relaxed">{review.comment}</p>
                      {/* Review photos */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {review.photos.slice(0, 2).map((url, pi) => (
                            <div key={pi} className="w-[60px] h-[60px] rounded-[10px] overflow-hidden border border-gray-100">
                              <img src={url} alt="Avis photo" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Pro reply */}
                      {review.reply && (
                        <div className="mt-2.5 pl-3 border-l-2 border-gray-200">
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 bg-gray-100 mt-0.5">
                              <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-black text-gray-700">{pro.name}</span>
                                <MessageCircle className="w-2.5 h-2.5 text-gray-400" />
                              </div>
                              <p className="text-[11px] text-gray-500 leading-relaxed">{review.reply.text}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Infos Pratiques */}
      <section className="px-4 mt-4 mb-4">
        <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm">
          <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-wider mb-3">Infos pratiques</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPinned className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Zone d'intervention</p>
                <p className="text-[12px] font-bold text-gray-800">{pro.locationNeighborhood} et environs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Horaires</p>
                <p className="text-[12px] font-bold text-gray-800">{pro.workingHours || "Lun–Sam 8h–18h"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Langues parlées</p>
                <p className="text-[12px] font-bold text-gray-800">{pro.languages?.join(", ") || "Français"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Moyens de paiement</p>
                <p className="text-[12px] font-bold text-gray-800">
                  {pro.paymentMethods?.map((m) => PAYMENT_LABELS[m] || m).join(", ") || "Orange Money, Wave"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Temps de réponse</p>
                <p className="text-[12px] font-bold text-gray-800">{pro.responseTime || "~10 minutes"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Contact</p>
                <p className="text-[12px] font-bold text-gray-800">{pro.phoneNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fixed bottom CTA */}
      <div className="sticky bottom-0 left-0 right-0 z-20 mt-auto">
        <div className="max-w-md mx-auto px-4 pb-[max(12px,env(safe-area-inset-bottom,12px))] pt-3 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
          <button onClick={handleLaunchMatch}
            className="w-full h-12 bg-gray-900 text-white rounded-[14px] text-[11px] font-black tracking-wide cursor-pointer active:scale-[0.97] transition-all hover:bg-gray-800 shadow-md">
            Prendre RDV
          </button>
        </div>
      </div>

      {/* Image viewer */}
      {portfolio && (
        <ImageViewer images={portfolio.map(p => ({ url: p.imageUrl, title: p.caption }))} initialIndex={galleryIdx} open={galleryOpen} onClose={() => setGalleryOpen(false)} />
      )}
    </div>
  );
}
