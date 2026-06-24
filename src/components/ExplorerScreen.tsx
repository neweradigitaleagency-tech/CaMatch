import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, ChevronRight, MapPin, X, Bell, ChevronDown } from "lucide-react";
import { ProfessionalDetails, Mission } from "../types";
import { ProCardSkeleton } from "./ui/Skeleton";
import VerifiedBadge from "./ui/VerifiedBadge";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useLocationStore, haversineKm, LOCATIONS } from "../stores/locationStore";
import { findBestMatch } from "../data/serviceCategories";
import { MOCK_PROS } from "../services/mockData";
import NotificationPanel from "./NotificationPanel";

interface ExplorerScreenProps {
  onSelectPro: (pro: ProfessionalDetails) => void;
  recommendedPros: ProfessionalDetails[];
  onInitiateAiRequest: () => void;
  activeMissions?: Mission[];
  onViewActiveMission?: (mission: Mission) => void;
}

const PROMO_BANNERS = [
  { id: "first", emoji: "🎉", title: "20% de réduction", desc: "sur votre première réservation" },
  { id: "garden", emoji: "🌿", title: "Nouveau", desc: "Service de jardinage disponible" },
  { id: "referral", emoji: "🤝", title: "Parrainage", desc: "Parrainez un ami, gagnez 2 000 FCFA" },
];



export default function ExplorerScreen({ onSelectPro, recommendedPros, onInitiateAiRequest, activeMissions = [], onViewActiveMission }: ExplorerScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(() => {
    const seen = localStorage.getItem("howItWorksSeen");
    return !seen;
  });
  const [promoIndex, setPromoIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isPro = useAuthStore((s) => s.isPro);
  const firstName = user?.user_metadata?.firstName || user?.email?.split("@")[0] || "Marie";
  const unreadNotifs = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);

  const storeLat = useLocationStore((s) => s.latitude);
  const storeLng = useLocationStore((s) => s.longitude);
  const neighborhood = useLocationStore((s) => s.neighborhood);
  const locStatus = useLocationStore((s) => s.status);
  const gpsAccuracy = useLocationStore((s) => s.gpsAccuracy);
  const geocodingSource = useLocationStore((s) => s.geocodingSource);
  const refreshLocation = useLocationStore((s) => s.refreshLocation);
  const setNeighborhood = useLocationStore((s) => s.setNeighborhood);

  const activeMission = activeMissions.find(m => ["accepted", "en_route", "in_progress"].includes(m.status));
  const hasActiveJobs = !!activeMission;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    searchRef.current?.focus();
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

  const handleSearchNavigation = useCallback(() => {
    if (searchQuery.trim().length >= 2) {
      nav(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, nav]);

  const userCoord = { lat: storeLat, lng: storeLng };

  const sortedByDistance = [...recommendedPros]
    .filter((p) => p.lat != null && p.lng != null)
    .sort((a, b) => {
      const dA = haversineKm(userCoord, { lat: a.lat!, lng: a.lng! });
      const dB = haversineKm(userCoord, { lat: b.lat!, lng: b.lng! });
      return dA - dB;
    });

  const filteredPros = recommendedPros.filter((pro) => {
    if (activeCategory && pro.category !== activeCategory) return false;
    return true;
  });

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const match = findBestMatch(searchQuery);
    return MOCK_PROS.filter((pro) => {
      const nameMatch = pro.name.toLowerCase().includes(q);
      const titleMatch = pro.title.toLowerCase().includes(q);
      const locationMatch = pro.locationNeighborhood.toLowerCase().includes(q);
      const subMatch = match && (
        pro.subCategory?.toLowerCase().includes(match.subName.toLowerCase()) ||
        pro.title.toLowerCase().includes(match.subName.toLowerCase())
      );
      return nameMatch || titleMatch || locationMatch || subMatch;
    });
  }, [searchQuery]);

  const getTier = (completed: number) => {
    if (completed >= 120) return { label: "Expert", color: "text-cm-text", bg: "bg-cm-accent-soft" };
    if (completed >= 60) return { label: "Avancé", color: "text-cm-text-soft", bg: "bg-cm-border-soft" };
    return { label: "Débutant", color: "text-cm-text-muted", bg: "bg-cm-border-soft" };
  };

  const POPULAR_SUBCATEGORIES = [
    { name: "Plombier", categoryId: "maison-reparations", emoji: "🔧" },
    { name: "Électricien", categoryId: "maison-reparations", emoji: "⚡" },
    { name: "Menuisier", categoryId: "maison-reparations", emoji: "🪚" },
    { name: "Maçon", categoryId: "maison-reparations", emoji: "🧱" },
    { name: "Peintre", categoryId: "maison-reparations", emoji: "🎨" },
    { name: "Carreleur", categoryId: "maison-reparations", emoji: "📐" },
    { name: "Serrurier", categoryId: "maison-reparations", emoji: "🔑" },
    { name: "Climatisation", categoryId: "maison-reparations", emoji: "❄️" },
    { name: "Coursier", categoryId: "transport-livraison", emoji: "📦" },
    { name: "Déménagement", categoryId: "transport-livraison", emoji: "🚚" },
    { name: "Photographe", categoryId: "evenements", emoji: "📸" },
    { name: "DJ", categoryId: "evenements", emoji: "🎧" },
    { name: "Traiteur", categoryId: "evenements", emoji: "🍽️" },
    { name: "Nettoyage", categoryId: "maison-reparations", emoji: "🧹" },
    { name: "Jardinage", categoryId: "maison-reparations", emoji: "🌿" },
  ];

  return (
    <div className="flex flex-col w-full pb-28 min-h-screen bg-cm-bg">
      {refreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-3 bg-cm-elevated border-b border-cm-border">
          <div className="w-5 h-5 border-2 border-cm-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] text-cm-text-soft ml-2">Mise à jour...</span>
        </div>
      )}

      {/* Header */}
      <section className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-[22px] font-bold text-cm-text tracking-tight">Ça Match</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLocationPicker(true)}
              className="flex items-center gap-1.5 bg-cm-elevated border border-cm-border rounded-full px-3 h-8 text-[13px] font-medium text-cm-text cursor-pointer cm-scale-btn"
            >
              <MapPin className="w-3.5 h-3.5 text-cm-text-soft" />
              <span className="truncate max-w-[100px] text-cm-text-soft">{neighborhood}</span>
              {geocodingSource === "nominatim" && (
                <span className="text-[9px] font-medium text-cm-accent">📍</span>
              )}
              <ChevronDown className="w-3 h-3 text-cm-text-soft" />
            </button>
            <button onClick={() => setShowNotifications(true)}
              className="relative w-9 h-9 rounded-full bg-cm-elevated border border-cm-border flex items-center justify-center cursor-pointer cm-scale-btn shrink-0">
              <Bell className="w-4 h-4 text-cm-text" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-cm-error rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-cm-elevated px-0.5">
                  {unreadNotifs > 99 ? "99+" : unreadNotifs}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Welcome + Search Hero */}
      <section className="relative px-5 pt-2 pb-4">
        <p className="text-[24px] font-bold text-cm-text mb-1">
          Bonjour, <span className="text-cm-accent">{firstName}</span>
        </p>
        <p className="text-[14px] text-cm-text-soft mb-5">
          Quel service recherchez-vous ?
        </p>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-cm-text-muted" />
          </div>
          <input
            ref={searchRef}
            type="text"
            className="w-full h-13 pl-12 pr-4 text-[16px] bg-cm-elevated border border-cm-border rounded-[var(--radius-cm-lg)] outline-none transition-all text-cm-text placeholder-cm-text-muted focus:border-cm-accent"
            placeholder="Plombier à Abidjan ?"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length >= 2) setShowSearchResults(true);
              if (e.target.value.length === 0) setShowSearchResults(false);
            }}
            onFocus={() => { if (searchQuery.length >= 2) setShowSearchResults(true); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearchNavigation(); }}
          />
        </div>

        {/* Search dropdown overlay */}
        {showSearchResults && searchQuery.length >= 2 && (
          <div className="absolute z-20 left-0 right-0 top-full mt-1 animate-fade-in pointer-events-none">
            <div className="mx-5 bg-cm-elevated border border-cm-border rounded-[var(--radius-cm-lg)] shadow-cm-bento pointer-events-auto max-h-[60vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
                <h3 className="text-[13px] font-semibold text-cm-text">
                  Résultats pour "<span className="text-cm-accent">{searchQuery}</span>"
                  <span className="text-cm-text-muted font-normal"> ({searchResults.length})</span>
                </h3>
                <button onClick={() => { setSearchQuery(""); setShowSearchResults(false); searchRef.current?.focus(); }}
                  className="text-[11px] font-medium text-cm-text-soft flex items-center gap-0.5 cursor-pointer shrink-0">
                  <X className="w-3 h-3" /> Effacer
                </button>
              </div>

              {/* Results list */}
              {searchResults.length > 0 ? (
                <div className="overflow-y-auto px-3 pb-1 space-y-0.5">
                  {searchResults.slice(0, 10).map((pro) => {
                    const dist = pro.lat != null && storeLat != null
                      ? haversineKm({ lat: storeLat, lng: storeLng }, { lat: pro.lat, lng: pro.lng })
                      : null;
                    return (
                      <div key={pro.id} onClick={() => onSelectPro(pro)}
                        className="flex items-center gap-3 p-2.5 rounded-[var(--radius-cm)] hover:bg-cm-border-soft cursor-pointer transition-colors">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-cm-border shrink-0">
                          <img alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={pro.avatarUrl} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <h4 className="text-[12px] font-semibold text-cm-text truncate">{pro.name}</h4>
                            {pro.isVerified && <VerifiedBadge />}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-cm-text-muted flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-cm-accent text-cm-accent" />
                              {(pro.rating / 10).toFixed(1)}
                            </span>
                            <span className="text-[9px] text-cm-text-soft">{pro.title}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[12px] font-bold text-cm-text">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F</p>
                          {dist != null && (
                            <p className="text-[9px] text-cm-text-muted">{dist.toFixed(1)} km</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {searchResults.length > 10 && (
                    <p className="text-[10px] text-center text-cm-text-muted py-2">
                      +{searchResults.length - 10} autres résultats
                    </p>
                  )}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-[12px] text-cm-text-muted">Aucun pro trouvé pour "{searchQuery}"</p>
                </div>
              )}

              {/* View all button */}
              <div className="shrink-0 px-3 pb-3 pt-1">
                <button onClick={handleSearchNavigation}
                  className="w-full flex items-center justify-between p-3 bg-cm-accent-soft rounded-[var(--radius-cm)] cursor-pointer cm-scale-btn">
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-cm-accent" />
                    <span className="text-[12px] font-semibold text-cm-accent">Voir tous les résultats</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-cm-accent shrink-0" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ---- Home content (always visible) ---- */}
      <>
          {/* Active Mission */}
          {hasActiveJobs && (
            <section className="px-5 mb-4">
              <div className="cm-card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cm-accent" />
                      <span className="text-[11px] font-semibold text-cm-accent">Mission en cours</span>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-cm-accent-soft text-cm-accent">
                      {activeMission!.status === "en_route" ? "En route" :
                       activeMission!.status === "in_progress" ? "En cours" : "Accepté"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4" onClick={() => onViewActiveMission?.(activeMission!)}>
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-cm-border shrink-0">
                      <img src={activeMission!.proAvatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-semibold text-cm-text truncate">{activeMission!.proName}</h3>
                      <p className="text-[12px] text-cm-text-soft truncate">{activeMission!.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-cm-text-muted" />
                        <span className="text-[11px] text-cm-text-soft truncate">{activeMission!.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      activeMission!.status === "accepted" ? "w-1/4 bg-cm-accent" :
                      activeMission!.status === "en_route" ? "w-1/2 bg-cm-accent" :
                      "w-3/4 bg-cm-accent"
                    }`} />
                  </div>
                  <button onClick={() => onViewActiveMission?.(activeMission!)}
                    className="w-full mt-3 h-10 bg-cm-accent rounded-[var(--radius-cm)] text-[13px] font-medium text-white cm-scale-btn hover:bg-cm-accent-hover">
                    Voir les détails
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Most Requested Subcategories */}
          <section className="px-5 py-2">
            <h2 className="text-[16px] font-bold text-cm-text mb-3">Les plus demandés</h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SUBCATEGORIES.map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => {
                    setSearchQuery(sub.name);
                    setShowSearchResults(true);
                    searchRef.current?.focus();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-cm-elevated border border-cm-border rounded-full cursor-pointer cm-scale-btn hover:border-cm-accent"
                >
                  <span className="text-[14px]">{sub.emoji}</span>
                  <span className="text-[13px] font-medium text-cm-text whitespace-nowrap">{sub.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* How It Works */}
          {showHowItWorks && (
            <section className="mx-5 mb-4 animate-fade-in">
              <div className="cm-card p-5">
                <h3 className="text-[15px] font-bold text-cm-text mb-4 text-center">Comment ça marche ?</h3>
                <div className="flex items-start gap-4 mb-4">
                  {[
                    { icon: "🔍", title: "Recherchez", desc: "Trouvez le bon pro" },
                    { icon: "💬", title: "Discutez", desc: "Obtenez un devis" },
                    { icon: "✅", title: "Réservez", desc: "Paiement sécurisé" },
                  ].map((step) => (
                    <div key={step.title} className="flex-1 text-center">
                      <span className="text-[22px] mb-1 block">{step.icon}</span>
                      <p className="text-[12px] font-semibold text-cm-text">{step.title}</p>
                      <p className="text-[11px] text-cm-text-soft">{step.desc}</p>
                    </div>
                  ))}
                </div>
                <button onClick={dismissHowItWorks}
                  className="w-full py-2.5 bg-cm-accent rounded-[var(--radius-cm)] text-[13px] font-medium text-white cm-scale-btn hover:bg-cm-accent-hover">
                  J'ai compris
                </button>
              </div>
            </section>
          )}

          {/* Promo Banner */}
          <section className="px-5 mb-4">
            <div className="cm-card p-4">
              <div className="flex items-center gap-3">
                <span className="text-[24px]">{PROMO_BANNERS[promoIndex].emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-cm-text">{PROMO_BANNERS[promoIndex].title}</p>
                  <p className="text-[12px] text-cm-text-soft">{PROMO_BANNERS[promoIndex].desc}</p>
                </div>
                <button onClick={() => nav("/search")}
                  className="shrink-0 text-[12px] font-medium text-cm-accent border border-cm-accent rounded-full px-3 py-1.5 cm-scale-btn">
                  Voir
                </button>
              </div>
            </div>
          </section>

          {/* Recommended Pros */}
          <section className="py-2">
            <div className="px-5 flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-bold text-cm-text">Prestataires de confiance</h2>
              <button onClick={() => nav("/search")}
                className="text-[12px] font-medium text-cm-accent cm-scale-btn">
                Voir tout <ChevronRight className="w-3 h-3 inline" />
              </button>
            </div>
            {loading ? (
              <div className="px-5 space-y-3">{[1, 2].map((i) => <ProCardSkeleton key={i} />)}</div>
            ) : filteredPros.length === 0 ? (
              <div className="mx-5 p-6 text-center cm-card">
                <span className="text-[24px]">⭐</span>
                <p className="text-[14px] font-semibold text-cm-text mt-2">Découvrez nos pros</p>
                <p className="text-[12px] text-cm-text-soft mt-1">Plus vous utilisez l'app, mieux on vous recommande</p>
                <button onClick={() => nav("/search")}
                  className="mt-3 text-[12px] font-medium text-cm-accent border border-cm-accent px-4 py-2 rounded-full cm-scale-btn">
                  Explorer les catégories
                </button>
              </div>
            ) : (
              <div className="px-5 cm-grid-2">
                {filteredPros.slice(0, 4).map((pro) => {
                  const tier = getTier(pro.completedInterventions);
                  return (
                    <div key={pro.id} onClick={() => onSelectPro(pro)}
                      className="cm-card overflow-hidden cursor-pointer flex flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <img alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={pro.avatarUrl} />
                        <div className="absolute top-2 right-2 bg-cm-elevated/90 px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-medium text-cm-text">
                          <Star className="w-3 h-3" />{(pro.rating / 10).toFixed(1)}
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <div className="flex items-center gap-1">
                          <h4 className="font-semibold text-[13px] text-cm-text truncate">{pro.name}</h4>
                          {pro.isVerified && <VerifiedBadge />}
                        </div>
                        <p className="text-[12px] text-cm-text-soft truncate">{pro.title}</p>
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[10px] text-cm-text-muted">À partir de</span>
                            <p className="text-[14px] font-semibold text-cm-text">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); onSelectPro(pro); }}
                            className="bg-cm-accent text-white h-8 px-4 rounded-full text-[12px] font-medium cm-scale-btn hover:bg-cm-accent-hover">
                            Voir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Nearby Pros */}
          <section className="py-2">
            <div className="px-5 flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-bold text-cm-text">À proximité</h2>
              <button onClick={() => nav("/search")}
                className="text-[12px] font-medium text-cm-accent cm-scale-btn">
                Voir tout <ChevronRight className="w-3 h-3 inline" />
              </button>
            </div>
            {sortedByDistance.length === 0 ? (
              <div className="mx-5 p-6 text-center cm-card">
                <span className="text-[24px]">🗺️</span>
                <p className="text-[14px] font-semibold text-cm-text mt-2">Aucun pro à proximité</p>
                <button onClick={() => nav("/search")}
                  className="mt-3 text-[12px] font-medium text-cm-accent border border-cm-accent px-4 py-2 rounded-full cm-scale-btn">
                  Voir tous les pros
                </button>
              </div>
            ) : (
              <div className="px-5 space-y-2">
                {sortedByDistance.slice(0, 3).map((pro) => {
                  const dist = haversineKm(userCoord, { lat: pro.lat!, lng: pro.lng! });
                  return (
                    <div key={`nearby-${pro.id}`} onClick={() => onSelectPro(pro)}
                      className="flex items-center gap-3 p-3.5 cm-card cursor-pointer">
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-cm-border shrink-0">
                        <img alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={pro.avatarUrl} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[13px] font-semibold text-cm-text truncate">{pro.name}</h4>
                          <span className="text-[11px] text-cm-text-muted shrink-0 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />{dist.toFixed(1)} km
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-cm-accent font-medium">Disponible</span>
                          <span className="text-[11px] text-cm-text-muted flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5" />{(pro.rating / 10).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); onSelectPro(pro); }}
                        className="shrink-0 text-[12px] font-medium text-cm-accent border border-cm-accent px-4 py-1.5 rounded-full cm-scale-btn">
                        Contacter
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Become a Pro CTA */}
          {!isPro && <section className="px-5 py-2 mb-4">
            <div onClick={() => nav("/profile")}
              className="border border-cm-border rounded-[var(--radius-cm-lg)] bg-cm-elevated p-5 cursor-pointer cm-scale-btn">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-cm-accent-soft flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-cm-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-cm-text">Vous êtes professionnel?</h3>
                  <p className="text-[12px] text-cm-text-soft mt-0.5">Rejoignez Ça Match et développez votre activité</p>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                {["Accédez à des centaines de clients", "Gérez vos rendez-vous facilement", "Recevez des paiements sécurisés"].map((text) => (
                  <div key={text} className="flex items-center gap-2 text-[12px] text-cm-text-soft">
                    <svg className="w-3.5 h-3.5 text-cm-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {text}
                  </div>
                ))}
              </div>
              <span className="inline-block text-[13px] font-medium text-white bg-cm-accent px-5 py-2.5 rounded-[var(--radius-cm)]">
                Devenir Professionnel
              </span>
            </div>
          </section>}
        </>

      {/* Notification Panel */}
      <NotificationPanel open={showNotifications} onClose={() => setShowNotifications(false)} />

      {/* Location Picker */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowLocationPicker(false)}>
          <div className="fixed inset-0 bg-cm-overlay" />
          <div className="relative w-full max-w-md bg-cm-elevated rounded-t-[20px] p-5 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-cm-text">Changer de localisation</h3>
              <button onClick={() => setShowLocationPicker(false)} className="w-9 h-9 rounded-full bg-cm-border-soft flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4 text-cm-text" />
              </button>
            </div>
            <div className="space-y-1">
              {LOCATIONS.map((loc) => {
                const hood = loc.split(",")[1].trim();
                const isActive = neighborhood === hood;
                return (
                  <button key={loc} onClick={() => { setNeighborhood(hood); setShowLocationPicker(false); }}
                    className={`w-full text-left px-4 py-3 rounded-[12px] text-[13px] font-medium transition-all cursor-pointer flex items-center gap-3 ${
                      isActive ? "bg-cm-accent-soft text-cm-accent" : "text-cm-text hover:bg-cm-accent-soft"
                    }`}>
                    <MapPin className={`w-4 h-4 ${isActive ? "text-cm-accent" : "text-cm-text-muted"}`} />
                    <span className="flex-1">{loc}</span>
                    {isActive && <span className="text-[10px] text-cm-accent font-semibold mr-1">✓</span>}
                  </button>
                );
              })}
            </div>
            {locStatus === "locating" ? (
              <div className="w-full mt-4 py-3 bg-cm-accent-soft rounded-[12px] text-[13px] font-medium text-cm-accent flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-cm-accent border-t-transparent rounded-full animate-spin" />
                Détection en cours...
              </div>
            ) : locStatus === "available" ? (
              <div className="w-full mt-4 space-y-2">
                <div className="flex items-center justify-between px-4 py-2.5 bg-cm-accent-soft/60 rounded-[12px]">
                  <div className="flex items-center gap-2 text-[12px] text-cm-text">
                    <span className={`w-2 h-2 rounded-full ${geocodingSource === "nominatim" ? "bg-green-500" : "bg-amber-500"}`} />
                    {geocodingSource === "nominatim" ? "Position précise (GPS)" : "Position estimée"}
                  </div>
                  {gpsAccuracy != null && (
                    <span className="text-[11px] text-cm-text-muted font-mono">±{Math.round(gpsAccuracy)} m</span>
                  )}
                </div>
                <button onClick={() => { refreshLocation(); }}
                  className="w-full py-2.5 bg-cm-accent-soft/40 border border-cm-accent/20 rounded-[12px] text-[12px] font-medium text-cm-accent flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all">
                  <MapPin className="w-3.5 h-3.5" /> Rafraîchir ma position
                </button>
              </div>
            ) : (
              <button onClick={() => { refreshLocation(); setShowLocationPicker(false); }}
                className="w-full mt-4 py-3 bg-cm-accent-soft rounded-[12px] text-[13px] font-medium text-cm-accent flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all">
                <MapPin className="w-4 h-4" /> Détecter ma position
              </button>
            )}
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
