import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, Wrench, Bolt, Fan, Brush, Plus, ChevronRight, MapPin, X, Eye, Shield, Mic, Camera, ArrowRight, Phone, MessageSquare, Navigation, Filter, Bell, BadgeCheck, Clock, ChevronDown, Zap, Sparkles, Gift, Users, ChevronLeft, Hammer } from "lucide-react";
import { ProfessionalDetails, Mission } from "../types";
import { ProCardSkeleton } from "./ui/Skeleton";
import GlassCard from "./ui/GlassCard";
import GlassButton from "./ui/GlassButton";
import CategoryChip from "./ui/CategoryChip";
import VerifiedBadge from "./ui/VerifiedBadge";
import { useAuthStore } from "../stores/authStore";

interface ExplorerScreenProps {
  onSelectPro: (pro: ProfessionalDetails) => void;
  recommendedPros: ProfessionalDetails[];
  onInitiateAiRequest: () => void;
  activeMissions?: Mission[];
  onViewActiveMission?: (mission: Mission) => void;
}

const CATEGORIES = [
  { id: "plumbing", name: "Plomberie", icon: Wrench, emoji: "🚰" },
  { id: "electricity", name: "Électricité", icon: Zap, emoji: "⚡" },
  { id: "ac", name: "Climatisation", icon: Fan, emoji: "❄️" },
  { id: "carpenter", name: "Menuiserie", icon: Hammer, emoji: "🔨" },
];

const RECENT_SEARCHES = ["Plombier", "Électricien", "Menuisier"];

const PROMO_BANNERS = [
  { id: "first", emoji: "🎉", title: "20% de réduction", desc: "sur votre première réservation", bg: "from-[rgba(45,106,79,0.15)] to-[rgba(69,123,157,0.10)]" },
  { id: "garden", emoji: "🌿", title: "Nouveau", desc: "Service de jardinage disponible", bg: "from-[rgba(69,123,157,0.15)] to-[rgba(244,162,97,0.10)]" },
  { id: "referral", emoji: "🤝", title: "Parrainage", desc: "Parrainez un ami, gagnez 2 000 FCFA", bg: "from-[rgba(244,162,97,0.15)] to-[rgba(45,106,79,0.10)]" },
];

const LOCATIONS = ["Abidjan, Cocody", "Abidjan, Plateau", "Abidjan, Marcory", "Abidjan, Yopougon", "Abidjan, Treichville"];

export default function ExplorerScreen({ onSelectPro, recommendedPros, onInitiateAiRequest, activeMissions = [], onViewActiveMission }: ExplorerScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(() => {
    const seen = localStorage.getItem("howItWorksSeen");
    return !seen;
  });
  const [promoIndex, setPromoIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isPro = useAuthStore((s) => s.isPro);
  const firstName = user?.user_metadata?.firstName || user?.email?.split("@")[0] || "Marie";

  const activeMission = activeMissions.find(m => ["accepted", "en_route", "in_progress"].includes(m.status));
  const hasActiveJobs = !!activeMission;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const dismissHowItWorks = () => {
    setShowHowItWorks(false);
    localStorage.setItem("howItWorksSeen", "true");
  };

  const handlePullRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setRefreshing(false);
  }, []);

  const handleRefreshClick = useCallback(() => {
    nav(".", { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [nav]);

  const filteredPros = recommendedPros.filter((pro) => {
    if (activeCategory && pro.category !== activeCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return pro.name.toLowerCase().includes(q) ||
      pro.title.toLowerCase().includes(q) ||
      pro.locationNeighborhood.toLowerCase().includes(q);
  });

  const getTier = (completed: number) => {
    if (completed >= 120) return { label: "Expert", icon: Shield, color: "text-[#B8632E]", bg: "bg-[rgba(244,162,97,0.20)]" };
    if (completed >= 60) return { label: "Avancé", icon: Shield, color: "text-ca-text-secondary", bg: "bg-[rgba(255,255,255,0.50)]" };
    return { label: "Débutant", icon: Shield, color: "text-ca-error", bg: "bg-[rgba(230,57,70,0.10)]" };
  };

  return (
    <div className="flex flex-col w-full pb-32 min-h-screen relative" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      {/* Pull to refresh indicator */}
      {refreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-3 bg-[rgba(255,255,255,0.80)] backdrop-blur-[12px]">
          <div className="w-5 h-5 border-2 border-ca-green-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] text-ca-text-secondary ml-2">Mise à jour...</span>
        </div>
      )}

      {/* Section 1: Header */}
      <section className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={handleRefreshClick} className="cursor-pointer">
              <span className="text-[20px] font-extrabold text-ca-green-primary tracking-tight">Ça Match</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLocationPicker(true)}
              className="flex items-center gap-1 bg-[rgba(255,255,255,0.55)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] rounded-[9999px] px-3 h-8 text-[12px] font-medium text-ca-text-primary cursor-pointer active:scale-95 transition-all"
            >
              <MapPin className="w-3 h-3 text-ca-green-light" />
              <span className="truncate max-w-[100px]">{location.split(",")[1]?.trim() || location.split(",")[0]}</span>
              <ChevronDown className="w-3 h-3 text-ca-text-muted" />
            </button>
            <button className="relative w-9 h-9 rounded-[12px] bg-[rgba(255,255,255,0.55)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] flex items-center justify-center cursor-pointer active:scale-90 transition-all shrink-0">
              <Bell className="w-4 h-4 text-ca-text-primary" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-[rgba(255,255,255,0.60)]">
                3
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Welcome & Search */}
      <section className="px-4 pt-1 pb-2">
        <div className="mb-3">
          <p className="text-[22px] font-extrabold text-ca-text-primary tracking-tight">
            Bonjour, {firstName} 👋
          </p>
          <p className="text-[13px] text-ca-text-muted mt-0.5">
            Que voulez-vous faire aujourd'hui?
          </p>
        </div>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-ca-green-light" />
          </div>
          <input
            ref={searchRef}
            type="text"
            className="w-full h-12 pl-10 pr-20 text-[14px] bg-[rgba(255,255,255,0.55)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.40)] rounded-[14px] outline-none transition-all duration-200 text-ca-text-primary placeholder-ca-text-muted focus:bg-[rgba(255,255,255,0.75)] focus:border-[rgba(82,183,136,0.40)]"
            placeholder="Rechercher un service, un professionnel..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length >= 2) setShowSearchResults(true);
              if (e.target.value.length === 0) setShowSearchResults(false);
            }}
            onFocus={() => { if (searchQuery.length >= 2) setShowSearchResults(true); }}
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-0.5">
            <button
              onClick={() => onInitiateAiRequest()}
              className="w-9 h-9 rounded-[10px] hover:bg-white/40 flex items-center justify-center text-ca-text-muted cursor-pointer active:scale-90 transition-all"
              title="Recherche vocale"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={() => nav("/explorer/scan")}
              className="w-9 h-9 rounded-[10px] hover:bg-white/40 flex items-center justify-center text-ca-text-muted cursor-pointer active:scale-90 transition-all"
              title="Scanner un QR code"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recent search chips */}
        {!showSearchResults && searchQuery.length === 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
            {RECENT_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => { setSearchQuery(term); setShowSearchResults(true); }}
                className="shrink-0 text-[11px] font-medium text-ca-text-muted bg-[rgba(255,255,255,0.35)] backdrop-blur-[4px] px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.25)] cursor-pointer hover:bg-[rgba(255,255,255,0.50)] transition-colors active:scale-95"
              >
                🔍 {term}
              </button>
            ))}
          </div>
        )}
      </section>

      {showSearchResults && searchQuery.length >= 2 ? (
        <section className="px-4 pt-2 pb-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-bold text-ca-text-primary">
              Résultats pour "{searchQuery}"
            </h3>
            <button onClick={() => { setSearchQuery(""); setShowSearchResults(false); searchRef.current?.focus(); }}
              className="text-[11px] font-medium text-ca-text-muted flex items-center gap-0.5 cursor-pointer">
              <X className="w-3 h-3" /> Effacer
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <ProCardSkeleton key={i} />)}</div>
          ) : filteredPros.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <Search className="w-8 h-8 text-ca-text-muted mx-auto mb-2" />
              <p className="text-[14px] font-bold text-ca-text-primary mb-1">Aucun résultat</p>
              <p className="text-[11px] text-ca-text-muted">Essayez d'autres mots-clés ou ajustez vos filtres.</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {filteredPros.map((pro) => {
                const tier = getTier(pro.completedInterventions);
                return (
                  <GlassCard key={pro.id} interactive onClick={() => onSelectPro(pro)} className="flex items-center gap-3 p-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[rgba(82,183,136,0.30)] shrink-0">
                      <img src={pro.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-[14px] font-bold text-ca-text-primary truncate">{pro.name}</h4>
                        {pro.isVerified && <VerifiedBadge />}
                      </div>
                      <p className="text-[12px] text-ca-text-secondary truncate">{pro.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[12px] text-ca-text-muted flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-ca-warning text-ca-warning" />{(pro.rating / 10).toFixed(1)}
                        </span>
                        <span className="text-[12px] text-ca-text-muted flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />{pro.locationNeighborhood.split(",")[0]}
                        </span>
                        <span className="text-[12px] font-bold text-ca-text-primary ml-auto">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ca-text-muted shrink-0" />
                  </GlassCard>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Section 4: Active Jobs */}
          {hasActiveJobs && (
            <section className="px-4 mb-3">
              <GlassCard className="overflow-hidden !p-0">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-ca-success animate-pulse" />
                      <span className="text-[11px] font-bold text-ca-green-primary uppercase tracking-wider">
                        Mission en cours
                      </span>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-[9999px] backdrop-blur-[4px] ${
                      activeMission!.status === "en_route" || activeMission!.status === "in_progress"
                        ? "bg-[rgba(244,162,97,0.20)] text-[#B8632E] border border-[rgba(244,162,97,0.35)]"
                        : "bg-[rgba(69,123,157,0.20)] text-ca-info border border-[rgba(69,123,157,0.35)]"
                    }`}>
                      {activeMission!.status === "en_route" ? "En route" :
                       activeMission!.status === "in_progress" ? "En cours" : "Accepté"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => onViewActiveMission?.(activeMission!)}>
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-ca-green-light shrink-0">
                      <img src={activeMission!.proAvatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-bold text-ca-text-primary truncate">{activeMission!.proName}</h3>
                      <p className="text-[12px] text-ca-text-muted truncate">{activeMission!.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-ca-green-light" />
                        <span className="text-[11px] text-ca-text-muted truncate">{activeMission!.address}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ca-text-muted shrink-0" />
                  </div>
                  <div className="h-1.5 bg-[rgba(255,255,255,0.30)] rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-700 rounded-full ${
                      activeMission!.status === "accepted" ? "w-1/4 bg-ca-info" :
                      activeMission!.status === "en_route" ? "w-1/2 bg-ca-warning" :
                      "w-3/4 bg-ca-warning"
                    }`} />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => onViewActiveMission?.(activeMission!)}
                      className="flex-1 h-10 bg-[rgba(45,106,79,0.85)] rounded-[12px] text-[11px] font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:bg-[rgba(45,106,79,0.95)]">
                      Voir les détails
                    </button>
                    <button onClick={() => onViewActiveMission?.(activeMission!)}
                      className="flex-1 h-10 bg-[rgba(255,255,255,0.50)] rounded-[12px] text-[11px] font-medium text-ca-text-primary flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:bg-[rgba(255,255,255,0.65)]">
                      <MessageSquare className="w-3.5 h-3.5" /> Contacter
                    </button>
                  </div>
                </div>
              </GlassCard>
            </section>
          )}

          {/* Section 3: Categories */}
          <section className="px-4 py-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-ca-text-primary">Catégories</h2>
              <button onClick={() => setShowMoreCategories((p) => !p)}
                className="text-[11px] text-ca-text-secondary font-semibold flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform">
                {showMoreCategories ? "Moins" : "Voir tout"} <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(showMoreCategories ? CATEGORIES : CATEGORIES.slice(0, 4)).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(activeCategory === cat.id ? null : cat.id);
                    if (!activeCategory) {
                      nav(`/search?category=${cat.id}`);
                    }
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 bg-[rgba(255,255,255,0.50)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.30)] rounded-[14px] cursor-pointer active:scale-95 transition-all hover:bg-[rgba(255,255,255,0.70)]"
                >
                  <span className="text-[20px]">{cat.emoji}</span>
                  <span className="text-[10px] font-semibold text-ca-text-primary text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Section 8: How It Works (new users only) */}
          {showHowItWorks && (
            <section className="mx-4 mb-3">
              <GlassCard className="p-4">
                <h3 className="text-[14px] font-bold text-ca-text-primary mb-3 text-center">Comment ça marche ?</h3>
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-1 text-center">
                    <div className="w-10 h-10 rounded-full bg-[rgba(45,106,79,0.12)] flex items-center justify-center mx-auto mb-1.5">
                      <Search className="w-4 h-4 text-ca-green-primary" />
                    </div>
                    <p className="text-[11px] font-bold text-ca-text-primary">Recherchez</p>
                    <p className="text-[10px] text-ca-text-muted">Trouvez le bon professionnel</p>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="w-10 h-10 rounded-full bg-[rgba(45,106,79,0.12)] flex items-center justify-center mx-auto mb-1.5">
                      <MessageSquare className="w-4 h-4 text-ca-green-primary" />
                    </div>
                    <p className="text-[11px] font-bold text-ca-text-primary">Discutez</p>
                    <p className="text-[10px] text-ca-text-muted">Échangez et obtenez un devis</p>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="w-10 h-10 rounded-full bg-[rgba(45,106,79,0.12)] flex items-center justify-center mx-auto mb-1.5">
                      <BadgeCheck className="w-4 h-4 text-ca-green-primary" />
                    </div>
                    <p className="text-[11px] font-bold text-ca-text-primary">Réservez</p>
                    <p className="text-[10px] text-ca-text-muted">Paiement sécurisé</p>
                  </div>
                </div>
                <button
                  onClick={dismissHowItWorks}
                  className="w-full py-2.5 bg-[rgba(45,106,79,0.85)] rounded-[12px] text-[12px] font-bold text-white cursor-pointer active:scale-[0.97] transition-all hover:bg-[rgba(45,106,79,0.95)]"
                >
                  J'ai compris
                </button>
              </GlassCard>
            </section>
          )}

          {/* Section 7: Promotions & Banners */}
          <section className="px-4 mb-3">
            <div className="relative overflow-hidden rounded-[16px]">
              <div className={`bg-gradient-to-r ${PROMO_BANNERS[promoIndex].bg} backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] p-4 transition-all duration-300`}>
                <div className="flex items-center gap-3">
                  <span className="text-[28px]">{PROMO_BANNERS[promoIndex].emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-ca-text-primary">{PROMO_BANNERS[promoIndex].title}</p>
                    <p className="text-[12px] text-ca-text-muted">{PROMO_BANNERS[promoIndex].desc}</p>
                  </div>
                  <button
                    onClick={() => nav("/search")}
                    className="shrink-0 text-[11px] font-semibold text-ca-green-primary bg-[rgba(255,255,255,0.50)] px-3 py-1.5 rounded-full cursor-pointer active:scale-95 transition-all"
                  >
                    Voir
                  </button>
                </div>
              </div>
              <div className="flex justify-center gap-1 mt-2">
                {PROMO_BANNERS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPromoIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === promoIndex ? "bg-ca-green-primary w-3" : "bg-[rgba(45,106,79,0.20)]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Section 5: Recommended For You */}
          <section className="py-1">
            <div className="px-4 flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-ca-text-primary">Recommandé pour vous</h2>
              <button onClick={() => nav("/search")}
                className="text-[11px] text-ca-text-secondary font-semibold flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform">
                Voir tout <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {loading ? (
              <div className="px-4 space-y-3">{[1, 2].map((i) => <ProCardSkeleton key={i} />)}</div>
            ) : filteredPros.length === 0 ? (
              <div className="mx-auto text-center py-4 px-4">
                <span className="text-[28px]">⭐</span>
                <p className="text-[13px] font-bold text-ca-text-primary mt-2">Découvrez nos professionnels</p>
                <p className="text-[11px] text-ca-text-muted mt-1">Plus vous utilisez l'app, mieux on vous recommande</p>
                <button onClick={() => nav("/search")}
                  className="mt-3 text-[12px] font-semibold text-ca-green-primary bg-[rgba(45,106,79,0.12)] px-4 py-2 rounded-full cursor-pointer active:scale-95 transition-all">
                  Explorer les catégories
                </button>
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-3 px-4 no-scrollbar pb-2">
                {filteredPros.slice(0, 6).map((pro) => {
                  const tier = getTier(pro.completedInterventions);
                  return (
                    <div
                      key={pro.id}
                      className="min-w-[220px] max-w-[220px] bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.35)] rounded-[20px] overflow-hidden shadow-[0_8px_32px_rgba(45,106,79,0.10)] flex flex-col cursor-pointer active:scale-[0.98] transition-all duration-200"
                      onClick={() => onSelectPro(pro)}
                    >
                      <div className="relative h-28 overflow-hidden">
                        <img alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={pro.avatarUrl} />
                        <div className="absolute top-2 right-2 bg-[rgba(255,255,255,0.80)] backdrop-blur-[4px] px-2 py-0.5 rounded-[9999px] flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-ca-warning text-ca-warning" />
                          <span className="text-[11px] font-medium text-ca-text-primary">{(pro.rating / 10).toFixed(1)}</span>
                        </div>
                        {pro.isVerified && (
                          <div className="absolute top-2 left-2">
                            <VerifiedBadge />
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex flex-col flex-grow">
                        <div className="flex items-center gap-1 mb-0.5">
                          <h4 className="font-bold text-[13px] text-ca-text-primary truncate">{pro.name}</h4>
                        </div>
                        <p className="text-[11px] text-ca-text-secondary truncate mb-1">{pro.title}</p>
                        <div className="flex items-center gap-1 text-[11px] text-ca-text-muted mb-2">
                          <span>{pro.reviewCount} avis</span>
                        </div>
                        <div className="flex justify-between items-center mt-auto pt-2 border-t border-[rgba(232,224,208,0.30)]">
                          <div>
                            <span className="text-[10px] text-ca-text-muted">À partir de</span>
                            <p className="text-[13px] font-bold text-ca-text-primary">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); onSelectPro(pro); }}
                            className="bg-[rgba(45,106,79,0.85)] text-white h-8 px-4 rounded-[9999px] text-[11px] font-medium hover:bg-[rgba(45,106,79,0.95)] transition-colors cursor-pointer active:scale-95"
                          >
                            Réserver
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 6: Nearby Professionals */}
          <section className="py-1">
            <div className="px-4 flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-ca-text-primary">Professionnels à proximité</h2>
              <button onClick={() => nav("/search")}
                className="text-[11px] text-ca-text-secondary font-semibold flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform">
                Voir tout <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {filteredPros.length === 0 ? (
              <div className="mx-4">
                <GlassCard className="p-6 text-center">
                  <span className="text-[32px]">🗺️</span>
                  <p className="text-[13px] font-bold text-ca-text-primary mt-2">Aucun professionnel à proximité</p>
                  <p className="text-[11px] text-ca-text-muted mt-1">Élargissez votre zone de recherche</p>
                  <button onClick={() => nav("/search")}
                    className="mt-3 text-[12px] font-semibold text-ca-green-primary bg-[rgba(45,106,79,0.12)] px-4 py-2 rounded-full cursor-pointer active:scale-95 transition-all">
                    Voir tous les professionnels
                  </button>
                </GlassCard>
              </div>
            ) : (
              <div className="px-4 space-y-2">
                {filteredPros.slice(0, 3).map((pro) => {
                  const distance = (Math.random() * 4 + 0.5).toFixed(1);
                  return (
                    <GlassCard key={`nearby-${pro.id}`} interactive onClick={() => onSelectPro(pro)} className="flex items-center gap-3 p-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-ca-green-light shrink-0 relative">
                        <img alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={pro.avatarUrl} />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[13px] font-bold text-ca-text-primary truncate">{pro.name}</h4>
                          <span className="text-[11px] text-ca-text-muted flex items-center gap-0.5 shrink-0">
                            <MapPin className="w-2.5 h-2.5" />{distance} km
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[11px] text-green-600 font-medium">Disponible maintenant</span>
                          </div>
                          <span className="text-[11px] text-ca-text-muted flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-ca-warning text-ca-warning" />{(pro.rating / 10).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectPro(pro); }}
                        className="shrink-0 text-[11px] font-semibold text-ca-green-primary bg-[rgba(45,106,79,0.10)] px-4 py-2 rounded-full cursor-pointer active:scale-95 transition-all hover:bg-[rgba(45,106,79,0.18)]"
                      >
                        Contacter
                      </button>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 10: Recent Activity */}
          <section className="px-4 py-2">
            <h2 className="text-[15px] font-bold text-ca-text-primary mb-3">Activité récente</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              <GlassCard className="shrink-0 min-w-[160px] p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[rgba(232,224,208,0.30)]">
                    <img alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-ca-text-primary truncate">Koffi A.</p>
                    <p className="text-[10px] text-ca-text-muted">Vu récemment</p>
                  </div>
                </div>
                <button
                  onClick={() => nav("/search")}
                  className="w-full text-[11px] font-medium text-ca-green-primary bg-[rgba(45,106,79,0.10)] py-1.5 rounded-full cursor-pointer active:scale-95 transition-all"
                >
                  Réserver à nouveau
                </button>
              </GlassCard>
              <GlassCard className="shrink-0 min-w-[160px] p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-[10px] bg-[rgba(45,106,79,0.10)] flex items-center justify-center">
                    <Bolt className="w-4 h-4 text-ca-green-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-ca-text-primary truncate">Menuiserie</p>
                    <p className="text-[10px] text-ca-text-muted">Recherché récemment</p>
                  </div>
                </div>
                <button
                  onClick={() => nav("/search?category=electricity")}
                  className="w-full text-[11px] font-medium text-ca-green-primary bg-[rgba(45,106,79,0.10)] py-1.5 rounded-full cursor-pointer active:scale-95 transition-all"
                >
                  Rechercher
                </button>
              </GlassCard>
            </div>
          </section>

          {/* Section 9: Become a Professional CTA */}
          <section className="px-4 py-2 mb-4">
            <div
              onClick={() => nav("/profile")}
              className="relative overflow-hidden rounded-[20px] p-5 cursor-pointer active:scale-[0.98] transition-all duration-200"
              style={{ background: "linear-gradient(135deg, rgba(45,106,79,0.12) 0%, rgba(69,123,157,0.10) 100%)", border: "1px solid rgba(45,106,79,0.20)" }}
            >
              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-ca-green-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-ca-text-primary">Vous êtes professionnel?</h3>
                    <p className="text-[12px] text-ca-text-muted mt-0.5">Rejoignez Ça Match et développez votre activité</p>
                  </div>
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-[12px] text-ca-text-secondary">
                    <BadgeCheck className="w-3.5 h-3.5 text-ca-green-primary shrink-0" />
                    <span>Accédez à des centaines de clients</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-ca-text-secondary">
                    <BadgeCheck className="w-3.5 h-3.5 text-ca-green-primary shrink-0" />
                    <span>Gérez vos rendez-vous facilement</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-ca-text-secondary">
                    <BadgeCheck className="w-3.5 h-3.5 text-ca-green-primary shrink-0" />
                    <span>Recevez des paiements sécurisés</span>
                  </div>
                </div>
                <span className="inline-block text-[12px] font-bold text-white bg-ca-green-primary px-5 py-2 rounded-full">
                  Devenir Professionnel
                </span>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-[0.04]">
                <Wrench className="w-32 h-32 text-ca-green-primary" />
              </div>
            </div>
          </section>
        </>
      )}

      {/* Location Picker Bottom Sheet */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowLocationPicker(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[rgba(255,255,255,0.85)] backdrop-blur-[24px] rounded-t-[24px] p-5 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-ca-text-primary">Changer de localisation</h3>
              <button onClick={() => setShowLocationPicker(false)} className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.60)] flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4 text-ca-text-primary" />
              </button>
            </div>
            <div className="space-y-1">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  onClick={() => { setLocation(loc); setShowLocationPicker(false); }}
                  className={`w-full text-left px-4 py-3 rounded-[12px] text-[13px] font-medium transition-all cursor-pointer flex items-center gap-3 ${
                    location === loc ? "bg-[rgba(45,106,79,0.12)] text-ca-green-primary" : "text-ca-text-primary hover:bg-[rgba(255,255,255,0.50)]"
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${location === loc ? "text-ca-green-primary" : "text-ca-text-muted"}`} />
                  {loc}
                </button>
              ))}
            </div>
            <button
              className="w-full mt-4 py-3 bg-[rgba(45,106,79,0.10)] rounded-[12px] text-[12px] font-medium text-ca-text-primary flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all"
            >
              <MapPin className="w-4 h-4" /> Détecter ma position
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Briefcase(props: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
