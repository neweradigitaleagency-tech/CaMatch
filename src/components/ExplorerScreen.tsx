import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, Star, ChevronRight, MapPin, X, Bell, ChevronDown, Menu, ClipboardList, SlidersHorizontal, MessageCircle } from "lucide-react";
import { ProfessionalDetails, Mission } from "../types";
import { ProCardSkeleton } from "./ui/Skeleton";
import VerifiedBadge from "./ui/VerifiedBadge";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useLocationStore, haversineKm, LOCATIONS } from "../stores/locationStore";
import NotificationPanel from "./NotificationPanel";
import HamburgerDrawer from "./HamburgerDrawer";

interface ExplorerScreenProps {
  onSelectPro: (pro: ProfessionalDetails) => void;
  recommendedPros: ProfessionalDetails[];
  onInitiateAiRequest: () => void;
  activeMissions?: Mission[];
  onViewActiveMission?: (mission: Mission) => void;
}

export default function ExplorerScreen({ onSelectPro, recommendedPros, onInitiateAiRequest, activeMissions = [], onViewActiveMission }: ExplorerScreenProps) {
  const [loading, setLoading] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(() => {
    const seen = localStorage.getItem("howItWorksSeen");
    return !seen;
  });
  const [showAllTrusted, setShowAllTrusted] = useState(false);
  const [showAllNearby, setShowAllNearby] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number>(0);
  const taskManagerRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  const navigationType = useNavigationType();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = location.pathname;
    if (location.pathname === "/" && navigationType === "POP" && prev.startsWith("/profile/")) {
      setShowDrawer(true);
    }
  }, [location.pathname, navigationType]);

  const user = useAuthStore((s) => s.user);
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
    if (!showTaskManager) return;
    const handler = (e: MouseEvent) => {
      if (taskManagerRef.current && !taskManagerRef.current.contains(e.target as Node)) {
        setShowTaskManager(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTaskManager]);

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

  const userCoord = { lat: storeLat, lng: storeLng };

  const sortedByDistance = [...recommendedPros]
    .filter((p) => p.lat != null && p.lng != null)
    .sort((a, b) => {
      const dA = haversineKm(userCoord, { lat: a.lat!, lng: a.lng! });
      const dB = haversineKm(userCoord, { lat: b.lat!, lng: b.lng! });
      return dA - dB;
    });

  const filteredPros = recommendedPros;

  const getTier = (completed: number) => {
    if (completed >= 120) return { label: "Expert", color: "text-gray-700", bg: "bg-gray-100" };
    if (completed >= 60) return { label: "Avancé", color: "text-gray-500", bg: "bg-gray-100" };
    return { label: "Débutant", color: "text-gray-400", bg: "bg-gray-50" };
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
    <div className="flex flex-col w-full pb-6 min-h-screen bg-cm-bg">
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
            <button onClick={() => setShowNotifications(true)}
              className="relative w-9 h-9 rounded-full bg-cm-elevated border border-cm-border flex items-center justify-center cursor-pointer cm-scale-btn shrink-0">
              <Bell className="w-4 h-4 text-cm-text" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-cm-error rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-cm-elevated px-0.5">
                  {unreadNotifs > 99 ? "99+" : unreadNotifs}
                </span>
              )}
            </button>
            <button onClick={() => setShowDrawer(true)}
              className="w-9 h-9 rounded-full bg-cm-elevated border border-cm-border flex items-center justify-center cursor-pointer cm-scale-btn shrink-0">
              <Menu className="w-4 h-4 text-cm-text" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <button onClick={() => setShowLocationPicker(true)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-cm-text-soft cursor-pointer cm-scale-btn">
            <MapPin className="w-3.5 h-3.5 text-cm-text-muted" />
            <span className="truncate max-w-[160px]">{neighborhood}</span>
            {geocodingSource === "nominatim" && (
              <span className="text-[9px] font-medium text-cm-accent">📍</span>
            )}
            <ChevronDown className="w-3 h-3 text-cm-text-muted" />
          </button>
        </div>
      </section>

      {/* Welcome + Search Hero */}
      <section className="relative px-5 pt-2 pb-4">
        <p className="text-[24px] font-bold text-cm-text mb-1">
          Bonjour, <span className="text-cm-accent">{firstName}</span>
        </p>
        <p className="text-[14px] text-cm-text-soft mb-2">
          Quel service recherchez-vous ?
        </p>

        {/* Task Manager button */}
        <div ref={taskManagerRef} className="relative mb-3">
          <button onClick={() => setShowTaskManager(!showTaskManager)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-cm-accent bg-cm-accent-soft px-3 py-1.5 rounded-full cm-scale-btn cursor-pointer">
            <ClipboardList className="w-3.5 h-3.5" />
            Task Manager
            <ChevronDown className={`w-3 h-3 transition-transform ${showTaskManager ? "rotate-180" : ""}`} />
          </button>
          {showTaskManager && (
            <div className="absolute left-0 top-full mt-1 z-20 w-56 bg-cm-elevated border border-cm-border rounded-[var(--radius-cm-lg)] shadow-cm-md animate-fade-in overflow-hidden">
              <button onClick={() => { setShowTaskManager(false); nav("/orders/new"); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-cm-text hover:bg-cm-accent-soft cursor-pointer transition-colors">
                <span className="w-7 h-7 rounded-full bg-cm-accent-soft flex items-center justify-center text-[14px]">➕</span>
                Créer une demande
              </button>
              {hasActiveJobs && (
                <>
                  <div className="h-px bg-cm-border mx-3" />
                  <button onClick={() => { setShowTaskManager(false); onViewActiveMission?.(activeMission!); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-cm-accent hover:bg-cm-accent-soft cursor-pointer transition-colors font-medium">
                    <MessageCircle className="w-4 h-4" />
                    Discuter avec le pro
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-cm-text-muted" />
          </div>
          <input
            type="text"
            className="w-full h-13 pl-12 pr-12 text-[16px] bg-cm-elevated border border-cm-border rounded-[var(--radius-cm-lg)] outline-none transition-all text-cm-text placeholder-cm-text-muted cursor-pointer"
            placeholder="Plombier à Abidjan ?"
            readOnly
            onFocus={() => nav("/search")}
            onClick={() => nav("/search")}
          />
          <button onClick={(e) => { e.stopPropagation(); setShowFilterSheet(true); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cm-border-soft flex items-center justify-center cursor-pointer cm-scale-btn">
            <SlidersHorizontal className="w-4 h-4 text-cm-text-soft" />
          </button>
        </div>
      </section>

      {/* ---- Home content (always visible) ---- */}
      <>
          {/* Active Mission */}
          {hasActiveJobs && (
            <section className="px-5 mb-4">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-900" />
                      <span className="text-[11px] font-semibold text-gray-700">Mission en cours</span>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {activeMission!.status === "en_route" ? "En route" :
                       activeMission!.status === "in_progress" ? "En cours" :
                       activeMission!.status === "paid" ? "Payée" : "Acceptée"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
                      <img src={activeMission!.proAvatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-semibold text-gray-900 truncate">{activeMission!.proName}</h3>
                      <p className="text-[12px] text-gray-500 truncate">{activeMission!.title}</p>
                    </div>
                    {activeMission!.status !== "accepted" && (
                      <button onClick={(e) => { e.stopPropagation(); nav(`/messages/${activeMission!.id}`); }}
                        className="flex items-center gap-1.5 h-9 px-3.5 bg-gray-900 text-white rounded-full text-[11px] font-semibold cursor-pointer active:scale-95 transition-all">
                        <MessageCircle className="w-3.5 h-3.5" /> Message
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-[11px] text-gray-500 truncate">{activeMission!.address}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gray-900 transition-all ${
                      activeMission!.status === "accepted" ? "w-1/6" :
                      activeMission!.status === "paid" ? "w-2/6" :
                      activeMission!.status === "in_progress" ? "w-3/6" :
                      activeMission!.status === "completed" ? "w-4/6" :
                      activeMission!.status === "client_validation" ? "w-5/6" :
                      "w-1/6"
                    }`} />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => onViewActiveMission?.(activeMission!)}
                      className="flex-1 h-10 bg-gray-900 rounded-xl text-[12px] font-semibold text-white cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all">
                      Suivre la mission
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Most Requested Subcategories */}
          <section className="px-5 py-2">
            <h2 className="text-[16px] font-bold text-cm-text mb-3">Les plus demandés</h2>
            <div className="flex overflow-x-auto gap-2 flex-nowrap no-scrollbar pb-1">
              {POPULAR_SUBCATEGORIES.map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => nav(`/search?q=${encodeURIComponent(sub.name)}`)}
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

          {/* Recommended Pros */}
          <section className="py-2">
            <div className="px-5 flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-bold text-cm-text">Prestataires de confiance</h2>
              <button onClick={() => setShowAllTrusted(!showAllTrusted)}
                className="text-[12px] font-medium text-cm-accent cm-scale-btn flex items-center gap-0.5">
                {showAllTrusted ? "Réduire" : "Voir tout"}
                <ChevronRight className={`w-3 h-3 transition-transform ${showAllTrusted ? "rotate-90" : ""}`} />
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
                <AnimatePresence mode="popLayout">
                {(showAllTrusted ? filteredPros : filteredPros.slice(0, 4)).map((pro) => {
                  const domainLabel = pro.title || pro.subCategory || "Professionnel";
                  return (
                    <motion.div layout key={pro.id} onClick={() => onSelectPro(pro)}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer flex flex-col hover:border-gray-300 transition-all shadow-sm">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <img alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={pro.avatarUrl} />
                        <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-medium text-gray-700 shadow-sm">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />{(pro.rating / 10).toFixed(1)}
                        </div>
                      </div>
                      <div className="p-3 space-y-1.5">
                        <div className="flex items-center gap-1">
                          <h4 className="font-semibold text-[13px] text-gray-900 truncate">{pro.name}</h4>
                          {pro.isVerified && <VerifiedBadge />}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">{domainLabel}</p>
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[9px] text-gray-400">À partir de</span>
                            <p className="text-[14px] font-bold text-gray-900">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); onSelectPro(pro); }}
                            className="bg-gray-900 text-white h-8 px-4 rounded-full text-[11px] font-semibold cursor-pointer hover:opacity-90 active:scale-95 transition-all">
                            Voir
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* Nearby Pros */}
          <section className="py-2">
            <div className="px-5 flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-bold text-cm-text">À proximité</h2>
              <button onClick={() => setShowAllNearby(!showAllNearby)}
                className="text-[12px] font-medium text-cm-accent cm-scale-btn flex items-center gap-0.5">
                {showAllNearby ? "Réduire" : "Voir tout"}
                <ChevronRight className={`w-3 h-3 transition-transform ${showAllNearby ? "rotate-90" : ""}`} />
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
                <AnimatePresence mode="popLayout">
                {(showAllNearby ? sortedByDistance : sortedByDistance.slice(0, 3)).map((pro) => {
                  const dist = haversineKm(userCoord, { lat: pro.lat!, lng: pro.lng! });
                  return (
                    <motion.div layout key={`nearby-${pro.id}`} onClick={() => onSelectPro(pro)}
                      className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:border-gray-300 transition-all shadow-sm">
                      <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
                        <img alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={pro.avatarUrl} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[13px] font-semibold text-gray-900 truncate">{pro.name}</h4>
                          <span className="text-[11px] text-gray-400 shrink-0 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />{dist.toFixed(1)} km
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-900 font-medium">Disponible</span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />{(pro.rating / 10).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); onSelectPro(pro); }}
                        className="shrink-0 text-[12px] font-medium bg-gray-900 text-white px-4 py-1.5 rounded-full cursor-pointer hover:opacity-90 active:scale-95 transition-all">
                        Voir
                      </button>
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>
            )}
          </section>

        </>

      {/* Hamburger Drawer */}
      <HamburgerDrawer open={showDrawer} onClose={() => setShowDrawer(false)} />

      {/* Filter Sheet */}
      {showFilterSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowFilterSheet(false)}>
          <div className="fixed inset-0 bg-cm-overlay" />
          <div className="relative w-full max-w-md bg-cm-elevated rounded-t-[20px] p-5 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-cm-text">Filtrer les résultats</h3>
              <button onClick={() => setShowFilterSheet(false)} className="w-9 h-9 rounded-full bg-cm-border-soft flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4 text-cm-text" />
              </button>
            </div>

            {/* Type filter */}
            <div className="mb-5">
              <p className="text-[13px] font-semibold text-cm-text mb-2.5">Type de service</p>
              <div className="flex flex-wrap gap-2">
                {["Maison & Réparations", "Transport & Livraison", "Événements", "Éducation", "Informatique", "Assistance"].map((t) => (
                  <button key={t} onClick={() => setFilterType(filterType === t ? null : t)}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer cm-scale-btn transition-colors ${
                      filterType === t
                        ? "bg-cm-accent text-white"
                        : "bg-cm-border-soft text-cm-text-soft hover:bg-cm-accent-soft"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating filter */}
            <div className="mb-5">
              <p className="text-[13px] font-semibold text-cm-text mb-2.5">Note minimum</p>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((r) => (
                  <button key={r} onClick={() => setFilterRating(r)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer cm-scale-btn transition-colors ${
                      filterRating === r
                        ? "bg-cm-accent text-white"
                        : "bg-cm-border-soft text-cm-text-soft hover:bg-cm-accent-soft"
                    }`}>
                    {r === 0 ? "Tous" : `${r}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Location filter */}
            <div className="mb-6">
              <p className="text-[13px] font-semibold text-cm-text mb-2.5">Localisation</p>
              <div className="flex items-center gap-2 px-4 py-3 bg-cm-border-soft rounded-[var(--radius-cm)]">
                <MapPin className="w-4 h-4 text-cm-text-muted" />
                <span className="text-[13px] text-cm-text-soft">{neighborhood}</span>
              </div>
            </div>

            <button onClick={() => { setShowFilterSheet(false); nav("/search"); }}
              className="w-full py-3 bg-cm-accent rounded-[var(--radius-cm)] text-[14px] font-medium text-white cm-scale-btn hover:bg-cm-accent-hover cursor-pointer">
              Appliquer les filtres
            </button>
          </div>
        </div>
      )}

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
                const hood = loc.split(",")[1]!.trim();
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


