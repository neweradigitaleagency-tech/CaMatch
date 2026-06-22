import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Filter, Camera, Star, MapPin, ChevronRight, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { usePros } from "../hooks/useDatabase";
import { ProCardSkeleton } from "../components/ui/Skeleton";
import MapView from "../components/ui/MapView";
import GlassCard from "../components/ui/GlassCard";
import GlassButton from "../components/ui/GlassButton";
import VerifiedBadge from "../components/ui/VerifiedBadge";
import type { ProfessionalDetails } from "../types";

type SortOption = "recommended" | "closest" | "highest_rated" | "most_active";

export default function SearchPage() {
  const nav = useNavigate();
  const { data: pros = [] } = usePros();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfessionalDetails[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapView, setMapView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [filters, setFilters] = useState({ minRating: 0, maxPrice: 100000, maxDistance: 30, verifiedOnly: false });
  const [pendingFilters, setPendingFilters] = useState(filters);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    const q = val.toLowerCase();
    let filtered = pros.filter((pro) =>
      pro.name.toLowerCase().includes(q) ||
      pro.title.toLowerCase().includes(q) ||
      pro.locationNeighborhood.toLowerCase().includes(q)
    ).filter((pro) => pro.rating / 10 >= filters.minRating)
     .filter((pro) => pro.hourlyRateXOF <= filters.maxPrice);
    if (filters.verifiedOnly) filtered = filtered.filter((p) => p.isVerified);
    filtered = sortResults(filtered, sortBy);
    setTimeout(() => { setResults(filtered); setLoading(false); }, 300);
  };

  const sortResults = (list: ProfessionalDetails[], sort: SortOption): ProfessionalDetails[] => {
    switch (sort) {
      case "closest": return [...list];
      case "highest_rated": return [...list].sort((a, b) => b.rating - a.rating);
      case "most_active": return [...list].sort((a, b) => b.completedInterventions - a.completedInterventions);
      default: return list;
    }
  };

  const applyFiltersAndSearch = () => {
    setFilters(pendingFilters);
    setShowFilters(false);
    if (query.length >= 2) {
      setLoading(true);
      setSearched(true);
      const q = query.toLowerCase();
      let filtered = pros.filter((pro) =>
        pro.name.toLowerCase().includes(q) ||
        pro.title.toLowerCase().includes(q) ||
        pro.locationNeighborhood.toLowerCase().includes(q)
      ).filter((pro) => (pro.rating / 10) >= pendingFilters.minRating)
       .filter((pro) => pro.hourlyRateXOF <= pendingFilters.maxPrice);
      if (pendingFilters.verifiedOnly) filtered = filtered.filter((p) => p.isVerified);
      filtered = sortResults(filtered, sortBy);
      setTimeout(() => { setResults(filtered); setLoading(false); }, 300);
    }
  };

  const getTier = (completed: number) => {
    if (completed >= 120) return { label: "Expert", color: "text-[#B8632E]", bg: "bg-[rgba(244,162,97,0.20)]" };
    if (completed >= 60) return { label: "Avancé", color: "text-ca-text-secondary", bg: "bg-[rgba(255,255,255,0.50)]" };
    return { label: "Débutant", color: "text-ca-error", bg: "bg-[rgba(230,57,70,0.10)]" };
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "recommended", label: "Recommandés" },
    { value: "closest", label: "Proches" },
    { value: "highest_rated", label: "Mieux notés" },
    { value: "most_active", label: "Plus actifs" },
  ];

  return (
    <div className="flex flex-col w-full pb-24 min-h-screen" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      {/* Search Header */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-10" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, transparent 100%)" }}>
        <h1 className="text-[22px] font-extrabold text-ca-text-primary mb-3">Rechercher un pro</h1>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-ca-green-light" />
          </div>
          <input
            type="text" autoFocus
            className="w-full h-12 pl-10 pr-16 text-[14px] bg-[rgba(255,255,255,0.55)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.40)] rounded-[14px] outline-none transition-all duration-200 text-ca-text-primary placeholder-ca-text-muted focus:bg-[rgba(255,255,255,0.75)] focus:border-[rgba(82,183,136,0.40)]"
            placeholder="Plombier, électricien, menuisier..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-0.5">
            <button onClick={() => { setPendingFilters(filters); setShowFilters(true); }}
              className="w-10 h-10 rounded-[10px] hover:bg-white/40 flex items-center justify-center text-ca-text-muted cursor-pointer">
              <Filter className="w-4 h-4" />
            </button>
            <button onClick={() => cameraRef.current?.click()}
              className="w-10 h-10 rounded-[10px] hover:bg-white/40 flex items-center justify-center text-ca-text-muted cursor-pointer">
              <Camera className="w-4 h-4" />
            </button>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-4">
        {query.length >= 2 && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-ca-text-muted">
              {loading ? "Recherche..." : `${results.length} résultat(s) pour "${query}"`}
            </p>
            <button onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
              className="text-[11px] font-medium text-ca-text-muted flex items-center gap-0.5 cursor-pointer">
              <X className="w-3 h-3" /> Effacer
            </button>
          </div>
        )}

        {!searched && !loading && (
          <div className="pt-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-[20px] bg-[rgba(82,183,136,0.15)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.25)] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-ca-text-muted" />
            </div>
            <p className="text-[15px] font-bold text-ca-text-primary mb-1">Que cherchez-vous ?</p>
            <p className="text-[12px] text-ca-text-muted">Tapez un métier, un nom ou un lieu</p>
          </div>
        )}

        {searched && !loading && results.length === 0 && query.length >= 2 && (
          <GlassCard className="p-6 text-center">
            <Search className="w-8 h-8 text-ca-text-muted mx-auto mb-2" />
            <p className="text-[14px] font-bold text-ca-text-primary mb-1">Aucun résultat</p>
            <p className="text-[12px] text-ca-text-muted">Essayez d'autres mots-clés</p>
          </GlassCard>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <ProCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            {/* Filter & Sort bar */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar">
              <button onClick={() => { setPendingFilters(filters); setShowFilters(true); }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium bg-[rgba(255,255,255,0.55)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] rounded-[12px] cursor-pointer active:scale-95 whitespace-nowrap">
                <SlidersHorizontal className="w-3 h-3" /> Filtres
              </button>
              <button onClick={() => setShowSort(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium bg-[rgba(255,255,255,0.55)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] rounded-[12px] cursor-pointer active:scale-95 whitespace-nowrap">
                <ArrowUpDown className="w-3 h-3" /> {sortOptions.find(o => o.value === sortBy)?.label || "Tri"}
              </button>
              <button onClick={() => setMapView((p) => !p)}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-[12px] transition-all cursor-pointer whitespace-nowrap ${mapView ? "bg-ca-green-primary text-white" : "bg-[rgba(255,255,255,0.55)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] text-ca-text-primary"}`}>
                {mapView ? "Liste" : "🗺️ Carte"}
              </button>
              <span className="text-[11px] text-ca-text-muted whitespace-nowrap">{results.length} pros</span>
            </div>

            {mapView ? (
              <div className="rounded-[16px] overflow-hidden border border-[rgba(255,255,255,0.35)] shadow-[0_8px_32px_rgba(45,106,79,0.10)]">
                <MapView
                  markers={results.map((pro) => ({
                    id: pro.id, lat: pro.lat, lng: pro.lng,
                    label: `${pro.name} - ${pro.hourlyRateXOF.toLocaleString("fr-FR")} F`,
                  }))}
                  onMarkerClick={(id) => { const p = results.find((r) => r.id === id); if (p) nav(`/explorer/pro/${p.id}`); }}
                  height="h-[500px]" interactive
                />
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((pro) => {
                  const tier = getTier(pro.completedInterventions);
                  return (
                    <GlassCard key={pro.id} interactive onClick={() => nav(`/explorer/pro/${pro.id}`)} className="flex items-center gap-3 p-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[rgba(82,183,136,0.30)] shrink-0">
                        <img src={pro.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-[14px] font-bold text-ca-text-primary truncate">{pro.name}</h4>
                          {pro.isVerified && <VerifiedBadge />}
                          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-[9999px] ${tier.bg} ${tier.color}`}>{tier.label}</span>
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
          </>
        )}
      </div>

      {/* Sort Bottom Sheet */}
      {showSort && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowSort(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[rgba(255,255,255,0.85)] backdrop-blur-[24px] rounded-t-[24px] p-5 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-ca-text-primary">Trier par</h3>
              <button onClick={() => setShowSort(false)} className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.60)] backdrop-blur-[4px] flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                  className={`w-full py-3.5 px-4 rounded-[14px] text-[13px] font-semibold text-left transition-all cursor-pointer ${
                    sortBy === opt.value
                      ? "bg-[rgba(45,106,79,0.10)] text-ca-green-primary"
                      : "text-ca-text-primary hover:bg-[rgba(255,255,255,0.50)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowFilters(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[rgba(255,255,255,0.85)] backdrop-blur-[24px] rounded-t-[24px] p-5 pb-10 space-y-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-ca-text-primary">Filtres</h3>
              <button onClick={() => setShowFilters(false)} className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.60)] backdrop-blur-[4px] flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Catégorie */}
            <div>
              <p className="text-[11px] font-medium text-ca-text-secondary uppercase tracking-wider mb-2">Catégorie</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {["Tous", "Plomberie", "Électricité", "Climatisation", "Menuiserie"].map((c) => (
                  <button key={c} className="px-3 py-1.5 rounded-[9999px] text-[11px] font-medium bg-[rgba(255,255,255,0.55)] backdrop-blur-[4px] border border-[rgba(255,255,255,0.35)] cursor-pointer active:scale-95 whitespace-nowrap">
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Note min */}
            <div>
              <p className="text-[11px] font-medium text-ca-text-secondary uppercase tracking-wider mb-2">
                Note min : {pendingFilters.minRating}★
              </p>
              <input type="range" min="0" max="5" step="0.5" value={pendingFilters.minRating}
                onChange={(e) => setPendingFilters((f) => ({ ...f, minRating: parseFloat(e.target.value) }))}
                className="w-full accent-ca-green-primary" />
              <div className="flex justify-between text-[11px] text-ca-text-muted"><span>0</span><span>3</span><span>5</span></div>
            </div>

            {/* Prix max */}
            <div>
              <p className="text-[11px] font-medium text-ca-text-secondary uppercase tracking-wider mb-2">
                Prix max : {pendingFilters.maxPrice.toLocaleString()} F
              </p>
              <input type="range" min="5000" max="100000" step="5000" value={pendingFilters.maxPrice}
                onChange={(e) => setPendingFilters((f) => ({ ...f, maxPrice: parseInt(e.target.value) }))}
                className="w-full accent-ca-green-primary" />
              <div className="flex justify-between text-[11px] text-ca-text-muted"><span>5 000</span><span>50 000</span><span>100 000</span></div>
            </div>

            {/* Distance */}
            <div>
              <p className="text-[11px] font-medium text-ca-text-secondary uppercase tracking-wider mb-2">
                Distance max : {pendingFilters.maxDistance} km
              </p>
              <input type="range" min="1" max="50" value={pendingFilters.maxDistance}
                onChange={(e) => setPendingFilters((f) => ({ ...f, maxDistance: parseInt(e.target.value) }))}
                className="w-full accent-ca-green-primary" />
              <div className="flex justify-between text-[11px] text-ca-text-muted"><span>1 km</span><span>25 km</span><span>50 km</span></div>
            </div>

            {/* Vérification toggle */}
            <label className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-[13px] font-semibold text-ca-text-primary">Pros vérifiés uniquement</span>
              <div
                onClick={() => setPendingFilters((f) => ({ ...f, verifiedOnly: !f.verifiedOnly }))}
                className={`w-11 h-6 rounded-[9999px] transition-all duration-200 relative cursor-pointer ${
                  pendingFilters.verifiedOnly ? "bg-ca-green-primary" : "bg-[rgba(232,224,208,0.60)]"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all duration-200 ${
                  pendingFilters.verifiedOnly ? "left-[22px]" : "left-0.5"
                }`} />
              </div>
            </label>

            <button onClick={applyFiltersAndSearch}
              className="w-full py-4 bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] text-white font-bold text-[14px] rounded-[14px] hover:bg-[rgba(45,106,79,0.95)] transition-all cursor-pointer active:scale-[0.97]">
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
