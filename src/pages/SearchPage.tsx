import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Filter, Camera, Star, MapPin, ChevronRight } from "lucide-react";
import { usePros } from "../hooks/useDatabase";
import { ProCardSkeleton } from "../components/ui/Skeleton";
import MapView from "../components/ui/MapView";
import type { ProfessionalDetails } from "../types";

export default function SearchPage() {
  const nav = useNavigate();
  const { data: pros = [] } = usePros();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfessionalDetails[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapView, setMapView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minRating: 0, maxPrice: 100000, maxDistance: 30 });
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    const q = val.toLowerCase();
    const filtered = pros.filter((pro) =>
      pro.name.toLowerCase().includes(q) ||
      pro.title.toLowerCase().includes(q) ||
      pro.locationNeighborhood.toLowerCase().includes(q)
    ).filter((pro) => pro.rating / 10 >= filters.minRating)
     .filter((pro) => pro.hourlyRateXOF <= filters.maxPrice);
    setTimeout(() => { setResults(filtered); setLoading(false); }, 300);
  };

  const getTier = (completed: number) => {
    if (completed >= 120) return { label: "Expert", color: "text-cm-warning", bg: "bg-cm-warning/10" };
    if (completed >= 60) return { label: "Avancé", color: "text-secondary", bg: "bg-pale-mint" };
    return { label: "Débutant", color: "text-cm-orange", bg: "bg-cm-orange/10" };
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Search Header */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-lg font-extrabold mb-3">Rechercher un pro</h1>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text" autoFocus
            className="w-full h-12 pl-10 pr-16 bg-pale-mint border-none rounded-xl text-sm font-medium placeholder-secondary/60 focus:ring-2 focus:ring-cm-green focus:bg-white transition-all outline-none text-brand-forest"
            placeholder="Électricien, plombier, ménage..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-0.5">
            <button onClick={() => setShowFilters(true)}
              className="w-10 h-10 rounded-lg hover:bg-white/50 flex items-center justify-center text-secondary/60 cursor-pointer">
              <Filter className="w-4 h-4" />
            </button>
            <button onClick={() => cameraRef.current?.click()}
              className="w-10 h-10 rounded-lg hover:bg-white/50 flex items-center justify-center text-secondary/60 cursor-pointer">
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
            <p className="text-caption text-secondary">
              {loading ? "Recherche..." : `${results.length} résultat(s) pour "${query}"`}
            </p>
            <button onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
              className="text-caption font-medium text-secondary/60 flex items-center gap-0.5 cursor-pointer">
              <X className="w-3 h-3" /> Effacer
            </button>
          </div>
        )}

        {!searched && !loading && (
          <div className="pt-8 text-center">
            <Search className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
            <p className="text-sm font-bold text-brand-forest mb-1">Que cherchez-vous ?</p>
            <p className="text-caption text-secondary/60">Tapez un métier, un nom ou un lieu</p>
          </div>
        )}

        {searched && !loading && results.length === 0 && query.length >= 2 && (
          <div className="bg-white rounded-2xl p-6 text-center border border-pale-mint/20">
            <Search className="w-8 h-8 text-secondary/40 mx-auto mb-2" />
            <p className="text-sm font-bold text-brand-forest mb-1">Aucun résultat</p>
            <p className="text-caption text-secondary/60">Essayez d'autres mots-clés</p>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <ProCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setMapView((p) => !p)}
                className={`text-caption font-medium px-3 py-1.5 rounded-xl transition-all cursor-pointer ${mapView ? "bg-brand-forest text-white" : "bg-white border border-pale-mint/30"}`}>
                {mapView ? "Liste" : "Carte"}
              </button>
              <span className="text-caption text-secondary/60">{results.length} pros trouvés</span>
            </div>

            {mapView ? (
              <div className="rounded-xl overflow-hidden border border-pale-mint/20">
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
              <div className="space-y-2">
                {results.map((pro) => {
                  const tier = getTier(pro.completedInterventions);
                  return (
                    <div key={pro.id} onClick={() => nav(`/explorer/pro/${pro.id}`)}
                      className="bg-white rounded-2xl p-3 border border-pale-mint/20 shadow-sm flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pale-mint shrink-0">
                        <img src={pro.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-brand-forest truncate">{pro.name}</h4>
                          {pro.isVerified && <span className="text-caption bg-cm-green/20 text-cm-green font-bold px-1.5 py-0.5 rounded-full">Vérifié</span>}
                        </div>
                        <p className="text-caption text-secondary truncate">{pro.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-caption text-secondary flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-yellow-500 stroke-yellow-500" />{(pro.rating / 10).toFixed(1)}
                          </span>
                          <span className="text-caption text-secondary flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />{pro.locationNeighborhood.split(",")[0]}
                          </span>
                          <span className="text-xs font-bold text-brand-forest ml-auto">{pro.hourlyRateXOF.toLocaleString("fr-FR")} F</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowFilters(false)}>
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-10 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Filtres</h3>
              <button onClick={() => setShowFilters(false)} className="w-10 h-10 rounded-full bg-pale-mint flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-caption font-medium text-secondary uppercase mb-2">Note min : {filters.minRating}</p>
              <input type="range" min="0" max="5" step="0.5" value={filters.minRating}
                onChange={(e) => setFilters((f) => ({ ...f, minRating: parseFloat(e.target.value) }))}
                className="w-full accent-cm-green" />
            </div>
            <div>
              <p className="text-caption font-medium text-secondary uppercase mb-2">Prix max : {filters.maxPrice.toLocaleString()} F</p>
              <input type="range" min="5000" max="100000" step="5000" value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: parseInt(e.target.value) }))}
                className="w-full accent-cm-green" />
            </div>
            <button onClick={() => { setShowFilters(false); handleSearch(query); }}
              className="w-full py-4 bg-cm-green text-white font-bold text-sm rounded-2xl cursor-pointer">
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
