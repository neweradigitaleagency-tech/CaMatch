import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { motion } from "motion/react";
import { Search, MapPin, Star, X, ChevronRight } from "lucide-react";
import { MOCK_PROS } from "../services/mockData";
import { categoriesWithPros, tradesWithCounts } from "../data/serviceTrades";
import { formatPriceLabel, isHourlyCategory } from "../data/pricing";
import { LOCATIONS } from "../stores/locationStore";
import PageHeader from "./ui/PageHeader";
import FavoriteButton from "./FavoriteButton";

function hoodOf(location: string) {
  return location.split(",")[0]?.trim() ?? location;
}

function favItemForPro(pro: (typeof MOCK_PROS)[number]) {
  return {
    type: "pro" as const,
    id: pro.id,
    name: pro.name,
    subtitle: pro.title,
    image: pro.avatarUrl,
    rating: pro.rating / 10,
    priceLabel: formatPriceLabel(pro.hourlyRateXOF, { hourly: isHourlyCategory(pro.category) }),
    route: `/explorer/pro/${pro.id}`,
  };
}

export default function ProfessionalListingScreen() {
  const { navigate: nav } = useAppNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const activeCategoryId = searchParams.get("category");
  const activeSub = searchParams.get("sub");

  const categories = useMemo(() => categoriesWithPros(), []);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId),
    [categories, activeCategoryId]
  );

  const isCategoryFocused = !!activeCategory;

  const activeTrades = useMemo(
    () => (activeCategoryId ? tradesWithCounts(activeCategoryId).map((t) => t.name) : []),
    [activeCategoryId]
  );

  const filteredPros = useMemo(() => {
    let base = activeCategoryId ? MOCK_PROS.filter((p) => p.category === activeCategoryId) : MOCK_PROS;
    if (activeSub) base = base.filter((p) => p.subCategory === activeSub);
    const q = query.trim().toLowerCase();
    if (q) {
      base = base.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          (p.subCategory || "").toLowerCase().includes(q)
      );
    }
    if (locationFilter) base = base.filter((p) => hoodOf(p.locationNeighborhood) === locationFilter);
    return base;
  }, [activeCategoryId, activeSub, query, locationFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, (typeof MOCK_PROS)[number][]>();
    for (const p of filteredPros) {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    return categories.map((c) => ({ cat: c, pros: map.get(c.id) ?? [] })).filter((g) => g.pros.length > 0);
  }, [filteredPros, categories]);

  const total = filteredPros.length;

  const setParams = (overrides: { category?: string | null; sub?: string | null }) => {
    const nextCategory = overrides.category !== undefined ? overrides.category : activeCategoryId;
    const nextSub = overrides.sub !== undefined ? overrides.sub : activeSub;
    const params = new URLSearchParams();
    if (nextCategory) params.set("category", nextCategory);
    if (nextSub) params.set("sub", nextSub);
    setSearchParams(params, { replace: true });
  };

  const toggleCategory = (catId: string) => {
    if (activeCategoryId === catId) {
      setSearchParams(new URLSearchParams(), { replace: true });
    } else {
      setParams({ category: catId, sub: null });
    }
  };

  const toggleTrade = (trade: string) => {
    if (activeSub === trade) {
      setParams({ sub: null });
    } else {
      setParams({ sub: trade });
    }
  };

  const resetAll = () => {
    setQuery("");
    setLocationFilter("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const headerTitle = activeSub ?? activeCategory?.name ?? "Services à domicile";
  const headerSubtitle = activeSub ? activeCategory?.name : activeCategory ? undefined : undefined;

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      <PageHeader title={headerTitle} subtitle={headerSubtitle} fallbackRoute="/search" />

      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative w-full mb-2">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-cm-text-muted" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-9 pr-4 text-[13px] bg-cm-elevated border border-cm-border rounded-xl outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-forest"
            placeholder={activeCategory ? `Rechercher dans ${activeCategory.name}...` : "Rechercher un professionnel..."}
          />
        </div>

        <button onClick={() => setShowLocationPicker(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cm-elevated border border-cm-border text-[11px] font-medium text-cm-text-soft cursor-pointer active:scale-95 transition-transform">
          <MapPin className="w-3.5 h-3.5" />
          {locationFilter || "Toutes les zones"}
        </button>
      </div>

      {/* Category Chips */}
      <div className="px-4 pb-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => toggleCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                activeCategoryId === cat.id
                  ? "bg-cm-text text-white"
                  : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:border-cm-text-muted"
              }`}>
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trade chips when a category is focused */}
      {activeCategory && activeTrades.length > 0 && (
        <div className="px-4 pb-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {activeTrades.map((trade) => (
              <button key={trade} onClick={() => toggleTrade(trade)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  activeSub === trade
                    ? "bg-cm-accent text-white"
                    : "bg-cm-surface border border-cm-border text-cm-text-soft hover:border-cm-text-muted"
                }`}>
                {trade}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results count */}
      {(query || isCategoryFocused) && (
        <div className="px-4 py-1.5">
          <p className="text-[11px] text-cm-text-muted">
            {total} résultat{total > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Listing */}
      <section className="flex-1 px-4 pb-6 pt-3">
        {total === 0 && (query || isCategoryFocused) ? (
          <div className="flex flex-col items-center justify-center pt-12">
            <div className="w-14 h-14 rounded-xl bg-cm-elevated border border-cm-border flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-cm-text-muted" />
            </div>
            <p className="text-[13px] font-bold text-cm-text mb-1">Aucun résultat</p>
            <p className="text-[11px] text-cm-text-soft">Essayez d'autres mots-clés</p>
            <button onClick={resetAll}
              className="mt-3 h-9 px-4 rounded-xl bg-cm-text text-white text-[11px] font-bold cursor-pointer active:scale-95 transition-transform">
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ cat, pros }) => {
              const shown = isCategoryFocused ? pros : pros.slice(0, 4);
              const hasMore = !isCategoryFocused && pros.length > 4;
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[16px]">{cat.icon}</span>
                      <h2 className="text-[14px] font-bold text-cm-text">{cat.name}</h2>
                      <span className="text-[10px] text-cm-text-muted font-medium bg-cm-elevated px-1.5 py-0.5 rounded-full">{pros.length}</span>
                    </div>
                    {hasMore && (
                      <button onClick={() => toggleCategory(cat.id)}
                        className="flex items-center gap-0.5 text-[11px] font-semibold text-cm-accent cursor-pointer active:scale-95 transition-transform">
                        Voir tous <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Vertical list of pro rows */}
                  <div className="space-y-2">
                    {shown.map((pro, i) => (
                      <motion.button
                        key={pro.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                        onClick={() => nav(`/explorer/pro/${pro.id}`)}
                        className="w-full flex items-center gap-3 relative bg-cm-elevated border border-cm-border rounded-2xl p-3 text-left cursor-pointer active:scale-[0.98] transition-transform hover:border-cm-accent/40"
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-cm-border">
                          <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" loading="lazy" />
                          {pro.isVerified && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-cm-green rounded-full flex items-center justify-center">
                              <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none"><path d="M3 6L5 8L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[13px] font-bold text-cm-text truncate">{pro.name}</h3>
                          <p className="text-[11px] text-cm-text-soft truncate">{pro.subCategory}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-cm-amber">
                              <Star className="w-3 h-3 fill-cm-amber text-cm-amber" />{(pro.rating / 10).toFixed(1)}
                            </span>
                            <span className="text-[9px] text-cm-text-muted">({pro.reviewCount})</span>
                            <span className="text-[9px] text-cm-text-muted flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" />{hoodOf(pro.locationNeighborhood)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0 pl-2">
                          <span className="text-[12px] font-bold text-cm-forest whitespace-nowrap">
                            {formatPriceLabel(pro.hourlyRateXOF, { hourly: isHourlyCategory(pro.category) })}
                          </span>
                          <FavoriteButton item={favItemForPro(pro)} floating={false} />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Location Picker */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowLocationPicker(false)}>
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative w-full max-w-md bg-cm-elevated rounded-t-[20px] p-5 pb-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-cm-text">Filtrer par zone</h3>
              <button onClick={() => setShowLocationPicker(false)} className="p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min">
                <X className="w-4 h-4 text-cm-text" />
              </button>
            </div>
            <div className="space-y-1">
              <button onClick={() => { setLocationFilter(""); setShowLocationPicker(false); }}
                className={`w-full text-left px-4 py-3 rounded-[12px] text-[13px] font-medium transition-all cursor-pointer flex items-center gap-3 ${!locationFilter ? "bg-cm-accent/20 text-cm-text" : "text-cm-text hover:bg-cm-surface"}`}>
                <MapPin className="w-4 h-4" />
                <span className="flex-1">Toutes les zones</span>
                {!locationFilter && <span className="text-[10px] text-cm-accent font-semibold">✓</span>}
              </button>
              {LOCATIONS.map((loc) => {
                const hood = loc.split(",")[1]?.trim() || loc;
                const isActive = locationFilter === hood;
                return (
                  <button key={loc} onClick={() => { setLocationFilter(hood); setShowLocationPicker(false); }}
                    className={`w-full text-left px-4 py-3 rounded-[12px] text-[13px] font-medium transition-all cursor-pointer flex items-center gap-3 ${isActive ? "bg-cm-accent/20 text-cm-text" : "text-cm-text hover:bg-cm-surface"}`}>
                    <MapPin className={`w-4 h-4 ${isActive ? "text-cm-accent" : "text-cm-text-muted"}`} />
                    <span className="flex-1">{loc}</span>
                    {isActive && <span className="text-[10px] text-cm-accent font-semibold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
