import { useState, useEffect, useRef } from "react";
import { Search, Star, Wrench, Bolt, Fan, Brush, Plus, ChevronRight, MapPin, X, Eye, Shield, Mic, Camera, ArrowRight, Phone, MessageSquare, Navigation, Sliders, Filter } from "lucide-react";
import { ProfessionalDetails, Mission } from "../types";
import { ProCardSkeleton } from "./ui/Skeleton";
import MapView from "./ui/MapView";

interface ExplorerScreenProps {
  onSelectPro: (pro: ProfessionalDetails) => void;
  recommendedPros: ProfessionalDetails[];
  onInitiateAiRequest: () => void;
  activeMissions?: Mission[];
  onViewActiveMission?: (mission: Mission) => void;
}

export default function ExplorerScreen({ onSelectPro, recommendedPros, onInitiateAiRequest, activeMissions = [], onViewActiveMission }: ExplorerScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [mapView, setMapView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0, maxPrice: 100000, maxDistance: 30,
  });
  const [pendingFilters, setPendingFilters] = useState(filters);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const activeMission = activeMissions.find(m => ["accepted", "en_route", "in_progress"].includes(m.status));

  const getTier = (completed: number) => {
    if (completed >= 120) return { label: "Expert", icon: Shield, color: "text-cm-warning", bg: "bg-cm-warning/10" };
    if (completed >= 60) return { label: "Avancé", icon: Shield, color: "text-secondary", bg: "bg-pale-mint" };
    return { label: "Débutant", icon: Shield, color: "text-cm-orange", bg: "bg-cm-orange/10" };
  };

  const categories = [
    { id: "electricity", name: "Électricité", icon: Bolt, count: 24 },
    { id: "plumbing", name: "Plomberie", icon: Wrench, count: 18 },
    { id: "ac", name: "Climatisation", icon: Fan, count: 15 },
    { id: "cleaning", name: "Ménage", icon: Brush, count: 32 },
  ];

  const filteredPros = recommendedPros.filter((pro) => {
    if (activeCategory && pro.category !== activeCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return pro.name.toLowerCase().includes(q) ||
      pro.title.toLowerCase().includes(q) ||
      pro.locationNeighborhood.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Active mission — large detailed card */}
      {activeMission && (
        <div className="mx-4 mt-3 bg-brand-forest rounded-2xl overflow-hidden shadow-lg border border-brand-lime/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
                <span className="text-caption font-bold text-brand-lime uppercase tracking-wider">
                  Mission en cours
                </span>
              </div>
              <span className={`text-caption font-bold px-2 py-0.5 rounded-full ${
                activeMission.status === "en_route" ? "bg-cm-warning/20 text-cm-warning" :
                activeMission.status === "in_progress" ? "bg-cm-orange/20 text-cm-orange" :
                "bg-cm-purple/20 text-cm-purple"
              }`}>
                {activeMission.status === "en_route" ? "En route" :
                 activeMission.status === "in_progress" ? "En cours" : "Accepté"}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => onViewActiveMission?.(activeMission)}>
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-lime shrink-0">
                <img src={activeMission.proAvatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{activeMission.proName}</h3>
                <p className="text-caption text-white/60 truncate">{activeMission.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3 h-3 text-brand-lime" />
                  <span className="text-caption text-white/70 truncate">{activeMission.address}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => window.open(`tel:${activeMission.proPhone}`)}
                className="flex-1 h-10 bg-white/10 rounded-xl text-caption font-medium text-white flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:bg-white/20">
                <Phone className="w-3.5 h-3.5" /> Appel
              </button>
              <button onClick={() => onViewActiveMission?.(activeMission)}
                className="flex-1 h-10 bg-white/10 rounded-xl text-caption font-medium text-white flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:bg-white/20">
                <Navigation className="w-3.5 h-3.5" /> Suivi
              </button>
              <button onClick={() => onViewActiveMission?.(activeMission)}
                className="flex-1 h-10 bg-brand-lime rounded-xl text-caption font-bold text-brand-forest flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:bg-brand-lime/80">
                <Star className="w-3.5 h-3.5" /> Chat
              </button>
            </div>
          </div>
          {/* Progress mini-bar */}
          <div className="h-1 bg-white/5">
            <div className={`h-full transition-all duration-700 ${
              activeMission.status === "accepted" ? "w-1/4 bg-cm-purple" :
              activeMission.status === "en_route" ? "w-1/2 bg-cm-warning" :
              "w-3/4 bg-cm-orange"
            }`} />
          </div>
        </div>
      )}

      {/* Search and Hero Section */}
      <section className="px-4 pt-4 pb-3">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-secondary font-medium text-xs tracking-wider uppercase">Bonjour, Marie</span>
            <span className="text-caption text-secondary/60 flex items-center gap-0.5 cursor-pointer hover:text-brand-forest transition-colors">
              <MapPin className="w-2.5 h-2.5" /> Cocody, Abidjan
            </span>
          </div>
          <h2 className="font-sans text-2xl font-extrabold text-brand-forest mt-0.5 tracking-tight">
            De quel service avez-vous besoin ?
          </h2>
        </div>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary">
            <Search className="w-4 h-4 opacity-70" />
          </div>
          <input
            type="text"
            className="w-full h-11 pl-10 pr-16 bg-pale-mint border-none rounded-xl text-xs font-medium placeholder-secondary/60 focus:ring-2 focus:ring-brand-forest focus:bg-white transition-all outline-none text-brand-forest"
            placeholder="Décrivez votre problème..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length >= 2) setShowSearchResults(true);
              if (e.target.value.length === 0) setShowSearchResults(false);
            }}
            onFocus={() => { if (searchQuery.length >= 2) setShowSearchResults(true); }}
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-0.5">
            <button onClick={() => { setPendingFilters(filters); setShowFilters(true); }} className="w-12 h-12 rounded-lg hover:bg-white/50 flex items-center justify-center text-secondary/60 cursor-pointer active:scale-90 transition-all" title="Filtres">
              <Filter className="w-5 h-5" />
            </button>
            <button onClick={() => onInitiateAiRequest()} className="w-12 h-12 rounded-lg hover:bg-white/50 flex items-center justify-center text-secondary/60 cursor-pointer active:scale-90 transition-all" title="Recherche vocale">
              <Mic className="w-5 h-5" />
            </button>
            <button onClick={() => cameraRef.current?.click()} className="w-12 h-12 rounded-lg hover:bg-white/50 flex items-center justify-center text-secondary/60 cursor-pointer active:scale-90 transition-all" title="Photo de votre problème">
              <Camera className="w-5 h-5" />
            </button>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" />
          </div>
        </div>
      </section>

      {showSearchResults && searchQuery.length >= 2 ? (
        /* ─── Search Results View ─── */
        <section className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-sans text-base font-bold text-brand-forest">
              Résultats pour "{searchQuery}"
            </h3>
            <button onClick={() => { setSearchQuery(""); setShowSearchResults(false); }}
              className="text-caption font-medium text-secondary/60 flex items-center gap-0.5 cursor-pointer">
              <X className="w-3 h-3" /> Effacer
            </button>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setShowFilters(true)}
              className="flex items-center gap-1 bg-white border border-pale-mint/30 rounded-xl px-3 py-1.5 text-caption font-medium cursor-pointer active:scale-95">
              <Filter className="w-3 h-3" /> Filtres
            </button>
            <button onClick={() => setMapView((p) => !p)}
              className={`text-caption font-medium px-3 py-1.5 rounded-xl transition-all cursor-pointer ${mapView ? "bg-brand-forest text-white" : "bg-white border border-pale-mint/30"}`}>
              {mapView ? "📋 Liste" : "🗺️ Carte"}
            </button>
            <span className="text-caption text-secondary/60">{filteredPros.length} pros trouvés</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <ProCardSkeleton key={i} />)}
            </div>
          ) : filteredPros.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-pale-mint/20">
              <Search className="w-8 h-8 text-secondary/40 mx-auto mb-2" />
              <p className="text-sm font-bold text-brand-forest mb-1">Aucun résultat</p>
              <p className="text-caption text-secondary/60">Essayez d'autres mots-clés ou ajustez vos filtres.</p>
            </div>
          ) : mapView ? (
            <div className="rounded-xl overflow-hidden border border-pale-mint/20">
              <MapView
                markers={filteredPros.map((pro) => ({
                  id: pro.id,
                  lat: pro.lat,
                  lng: pro.lng,
                  label: `${pro.name} - ${pro.hourlyRateXOF.toLocaleString("fr-FR")} F`,
                }))}
                onMarkerClick={(id) => {
                  const pro = filteredPros.find((p) => p.id === id);
                  if (pro) onSelectPro(pro);
                }}
                height="h-[420px]"
                interactive
              />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPros.map((pro) => {
                const tier = getTier(pro.completedInterventions);
                return (
                  <div key={pro.id} onClick={() => onSelectPro(pro)}
                    className="bg-white rounded-2xl p-3 border border-pale-mint/20 shadow-sm flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pale-mint shrink-0">
                      <img src={pro.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-brand-forest truncate">{pro.name}</h4>
                        {pro.isVerified && <span className="text-caption bg-cm-green/20 text-cm-green font-bold px-1.5 py-0.5 rounded-full">✓ Vérifié</span>}
                        <span className={`text-caption font-medium px-1.5 py-0.5 rounded-full ${tier.bg} ${tier.color}`}>{tier.label}</span>
                      </div>
                      <p className="text-caption text-secondary truncate">{pro.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-caption text-secondary flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-yellow-500 stroke-yellow-500" />{(pro.rating / 10).toFixed(1)}</span>
                        <span className="text-caption text-secondary flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{pro.locationNeighborhood.split(",")[0]}</span>
                        <span className="text-xs font-bold text-brand-forest ml-auto">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <>
      {/* Urgency quick-filter strip */}
      <section className="px-4 pt-3 pb-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "immediate", label: "⚡ Urgent", desc: "Besoin immédiat" },
            { id: "today", label: "📅 Aujourd'hui", desc: "Dans la journée" },
            { id: "this_week", label: "📆 Planifié", desc: "Cette semaine" },
            { id: "quote", label: "💬 Devis", desc: "Sans engagement" },
          ]              .map((pill) => (
            <button key={pill.id}
              onClick={() => setSelectedUrgency(selectedUrgency === pill.id ? null : pill.id)}
              className={`shrink-0 border rounded-xl px-3.5 py-2.5 flex flex-col items-start hover:shadow-sm active:scale-95 transition-all cursor-pointer ${
                selectedUrgency === pill.id
                  ? "bg-brand-forest border-brand-forest text-white"
                  : "bg-white border-pale-mint/30 text-brand-forest"
              }`}
            >
              <span className="text-caption font-medium whitespace-nowrap">{pill.label}</span>
              <span className={`text-caption whitespace-nowrap ${
                selectedUrgency === pill.id ? "text-brand-lime/70" : "text-secondary/60"
              }`}>{pill.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Categories Compact Grid */}
      <section className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-sans text-base font-bold text-brand-forest">Catégories</h3>
          <span onClick={() => setActiveCategory(null)} className="text-caption text-secondary font-semibold flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform">
            Voir tout <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  style={activeCategory === cat.id ? { borderColor: '#C2D939', borderWidth: 2 } : {}}
                className="bg-white rounded-xl p-2.5 flex flex-col items-center justify-center shadow-sm active:scale-95 transition-transform hover:shadow cursor-pointer border border-pale-mint/30"
              >
                <div className="w-8 h-8 rounded-full bg-pale-mint flex items-center justify-center mb-1.5 text-brand-forest">
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="font-bold text-caption text-brand-forest leading-tight text-center">{cat.name}</span>
                <span className="text-caption text-cm-success font-bold mt-0.5">{Math.round(cat.count * 0.35)} en ligne</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Social proof activity strip */}
      <section className="px-4 pt-2 pb-1 overflow-hidden">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {[
            { emoji: "✅", text: "Fatou termine un nettoyage à Marcory", detail: "⭐ 5.0 • il y a 12 min" },
            { emoji: "📱", text: "3 demandes pour climatisation ce matin", detail: "À Cocody & Plateau" },
            { emoji: "👋", text: "Koffi disponible pour dépannage élec", detail: "Intervention sous 1h" },
            { emoji: "💰", text: "Promo: -15% sur 1ère intervention", detail: "Code: BIENVENUE15" },
          ].map((a, i) => (
            <div key={i} className="shrink-0 bg-white rounded-xl p-3 border border-pale-mint/20 shadow-sm min-w-[200px] max-w-[200px]">
              <p className="text-caption text-secondary leading-relaxed">{a.emoji} {a.text}</p>
              <p className="text-caption text-secondary/60 mt-1">{a.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pros visibles: 2 premiers en stack vertical, puis scroll horizontal pour le reste */}
      <section className="pt-3 pb-2">
        <div className="px-4 flex items-center justify-between mb-3">
          <h3 className="font-sans text-base font-bold text-brand-forest">Pros Recommandés</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setMapView((p) => !p)}
              className={`text-caption font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer active:scale-95 ${
                mapView ? "bg-brand-forest text-white" : "bg-pale-mint text-secondary"
              }`}>
              {mapView ? "Liste" : "🗺️ Carte"}
            </button>
            <span onClick={() => { setSearchQuery(""); setShowSearchResults(true); }} className="text-caption text-secondary font-semibold flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform">
              Tout afficher <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {mapView ? (
          <div className="mx-4 bg-white rounded-2xl overflow-hidden shadow-sm border border-pale-mint/20 h-64 flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl">🗺️</span>
              <p className="text-xs text-secondary mt-2">Carte des pros à proximité</p>
              <p className="text-caption text-secondary/60 mt-1">{filteredPros.length} professionnels dans votre zone</p>
            </div>
          </div>
        ) : loading ? (
          <div className="px-4 space-y-3">
            {[1, 2].map((i) => (
              <ProCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPros.length === 0 ? (
          <div className="mx-auto text-center py-6 text-secondary text-xs px-4">
            Aucun professionnel disponible pour cette recherche.
          </div>
        ) : (
          <>
            {/* 2 pros visibles en photo-card (comme les cartes scrollables) */}
            {filteredPros.slice(0, 2).map((pro) => {
              const tier = getTier(pro.completedInterventions);
              return (
                <div
                  key={pro.id}
                  className="mx-4 mb-2 bg-white rounded-2xl overflow-hidden shadow-sm border border-pale-mint/20 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                  onClick={() => onSelectPro(pro)}
                >
                  <div className="flex">
                    <div className="w-28 h-28 shrink-0 relative overflow-hidden">
                      <img alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={pro.avatarUrl} />
                      <div className="absolute top-1.5 left-1.5 bg-white/90 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-yellow-500 stroke-yellow-500" />
                        <span className="text-caption font-medium text-brand-forest">{(pro.rating / 10).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 flex-wrap mb-0.5">
                          <h4 className="font-bold text-sm text-brand-forest truncate">{pro.name}</h4>
                          {pro.isVerified && (
                            <span className="text-caption bg-brand-lime/20 text-brand-forest font-bold px-1.5 py-0.5 rounded-full shrink-0 leading-none">✓ Vérifié</span>
                          )}
                          <span className={`text-caption font-medium px-1.5 py-0.5 rounded-full shrink-0 leading-none ${tier.bg} ${tier.color}`}>{tier.label}</span>
                        </div>
                        <p className="text-caption text-secondary truncate">{pro.title}</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-pale-mint/10">
                        <div className="flex items-center gap-1.5 text-caption text-secondary">
                          <MapPin className="w-2.5 h-2.5" />{pro.locationNeighborhood.split(",")[0]}
                        </div>
                        <span className="text-xs font-bold text-brand-forest">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Scroll horizontal pour les pros supplémentaires */}
            {filteredPros.length > 2 && (
              <div className="flex overflow-x-auto gap-3 px-4 no-scrollbar pb-2 mt-1">
                {filteredPros.slice(2).map((pro) => {
                const tier = getTier(pro.completedInterventions);
                return (
                  <div
                    key={pro.id}
                    className="min-w-[240px] max-w-[240px] bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-pale-mint/20 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onSelectPro(pro)}
                  >
                    <div className="relative h-28 bg-pale-mint overflow-hidden">
                      <img alt={pro.name} className="w-full h-full object-cover object-center" referrerPolicy="no-referrer" src={pro.avatarUrl} />
                      <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-yellow-500 stroke-yellow-500" />
                        <span className="text-caption font-medium text-brand-forest">{(pro.rating / 10).toFixed(1)}</span>
                      </div>
                      {pro.isVerified && (
                        <div className="absolute top-2 left-2 bg-brand-lime/90 px-1.5 py-0.5 rounded-full shadow-sm">
                          <span className="text-caption font-medium text-brand-forest leading-none">✓ Vérifié</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                      <div className="flex items-center gap-1 mb-0.5">
                        <h4 className="font-bold text-xs text-brand-forest truncate">{pro.name}</h4>
                        <span className={`text-caption font-medium px-1.5 py-0.5 rounded-full shrink-0 leading-none ${tier.bg} ${tier.color}`}>{tier.label}</span>
                      </div>
                      <p className="text-caption text-secondary truncate mb-2">{pro.title}</p>
                      <div className="flex justify-between items-center mt-auto pt-1.5 border-t border-pale-mint/20">
                        <span className="text-xs font-bold text-brand-forest">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectPro(pro); }}
                          className="bg-brand-forest text-white h-7 px-3.5 rounded-full text-caption font-medium hover:bg-brand-lime hover:text-brand-forest transition-colors cursor-pointer active:scale-95"
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
          </>
        )}
      </section>
      </>
      )}

      {/* Become a Pro/Marketing CTA banner */}
      <section className="px-4 pt-3">
        <div className="bg-brand-forest rounded-2xl p-4 relative overflow-hidden text-white flex flex-col">
          <div className="relative z-10 w-2/3">
            <h3 className="font-sans text-sm font-bold mb-1">Devenir Pro</h3>
            <p className="text-caption opacity-80 mb-3 leading-relaxed">
              Augmentez vos revenus en rejoignant la communauté des meilleurs experts d'Abidjan.
            </p>
            <button className="bg-brand-lime text-brand-forest font-extrabold text-caption px-4 py-2 rounded-full hover:bg-white transition-colors cursor-pointer active:scale-95">
              En savoir plus
            </button>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <Wrench className="w-32 h-32" />
          </div>
        </div>
      </section>

      {/* (FAB removed per user request) */}

      {/* Filter Bottom Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowFilters(false)}>
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-10 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-forest">Filtres</h3>
              <button onClick={() => setShowFilters(false)} className="w-10 h-10 rounded-full bg-pale-mint flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4 text-brand-forest" />
              </button>
            </div>

            {/* Note minimale */}
            <div>
              <p className="text-caption font-medium text-secondary uppercase tracking-wider mb-2">
                Note minimale : {pendingFilters.minRating}★
              </p>
              <input type="range" min="0" max="5" step="0.5" value={pendingFilters.minRating}
                onChange={(e) => setPendingFilters((f) => ({ ...f, minRating: parseFloat(e.target.value) }))}
                className="w-full accent-cm-green" />
              <div className="flex justify-between text-caption text-secondary/50"><span>0</span><span>3</span><span>5</span></div>
            </div>

            {/* Prix max */}
            <div>
              <p className="text-caption font-medium text-secondary uppercase tracking-wider mb-2">
                Prix max : {pendingFilters.maxPrice.toLocaleString()} F
              </p>
              <input type="range" min="5000" max="100000" step="5000" value={pendingFilters.maxPrice}
                onChange={(e) => setPendingFilters((f) => ({ ...f, maxPrice: parseInt(e.target.value) }))}
                className="w-full accent-cm-green" />
              <div className="flex justify-between text-caption text-secondary/50"><span>5 000</span><span>50 000</span><span>100 000</span></div>
            </div>

            {/* Distance */}
            <div>
              <p className="text-caption font-medium text-secondary uppercase tracking-wider mb-2">
                Distance max : {pendingFilters.maxDistance} km
              </p>
              <input type="range" min="1" max="50" value={pendingFilters.maxDistance}
                onChange={(e) => setPendingFilters((f) => ({ ...f, maxDistance: parseInt(e.target.value) }))}
                className="w-full accent-cm-green" />
              <div className="flex justify-between text-caption text-secondary/50"><span>1 km</span><span>25 km</span><span>50 km</span></div>
            </div>

            <button onClick={() => { setFilters(pendingFilters); setShowFilters(false); }}
              className="w-full py-4 bg-cm-green text-white font-bold text-sm rounded-2xl hover:brightness-105 transition-all cursor-pointer active:scale-95">
              Appliquer les filtres
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
