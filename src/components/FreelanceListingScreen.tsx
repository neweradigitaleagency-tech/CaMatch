import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { motion } from "motion/react";
import { Search, MapPin, Star, X } from "lucide-react";
import { LOCATIONS } from "../stores/locationStore";
import PageHeader from "./ui/PageHeader";
import { FREELANCE_CATEGORIES, FREELANCERS, getAllFreelancers } from "../data/freelanceCategories";
import FavoriteButton from "./FavoriteButton";
import { formatPriceLabel } from "../data/pricing";
import type { FreelancerProfile } from "../data/freelanceCategories";

function favItemForPro(pro: FreelancerProfile) {
  return {
    type: "pro" as const,
    id: pro.id,
    name: pro.name,
    subtitle: pro.title,
    image: pro.avatarUrl,
    rating: pro.rating,
    priceLabel: formatPriceLabel(pro.hourlyRate),
    route: `/explorer/pro/${pro.id}`,
  };
}

export default function FreelanceListingScreen() {
  const { navigate: nav } = useAppNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const activeCategoryId = searchParams.get("category");

  const activeCategory = useMemo(() => {
    return FREELANCE_CATEGORIES.find((c) => c.id === activeCategoryId);
  }, [activeCategoryId]);

  const isCategoryFocused = !!activeCategory;

  const filteredCategories = useMemo(() => {
    const cats = isCategoryFocused
      ? FREELANCE_CATEGORIES.filter((c) => c.id === activeCategoryId)
      : FREELANCE_CATEGORIES;
    return cats
      .map((cat) => {
        const pros = (FREELANCERS[cat.id] || []).filter((pro) => {
          const matchesQuery = !query || pro.name.toLowerCase().includes(query.toLowerCase()) || pro.title.toLowerCase().includes(query.toLowerCase());
          const matchesLocation = !locationFilter || pro.location === locationFilter;
          return matchesQuery && matchesLocation;
        });
        return { ...cat, pros };
      })
      .filter((cat) => cat.pros.length > 0);
  }, [query, locationFilter, activeCategoryId, isCategoryFocused]);

  const featuredFreelancers = useMemo(() => {
    return getAllFreelancers().sort((a, b) => b.rating - a.rating).slice(0, 6);
  }, []);

  const toggleCategory = (catId: string) => {
    if (activeCategoryId === catId) {
      setSearchParams(new URLSearchParams(), { replace: true });
    } else {
      setSearchParams(new URLSearchParams({ category: catId }), { replace: true });
    }
  };

  const resetAll = () => {
    setQuery("");
    setLocationFilter("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      {/* Header */}
      <PageHeader
        title={activeCategory ? activeCategory.name : "Freelance"}
        subtitle="Services digitaux"
        fallbackRoute="/"
      />

      {/* Search + Categories */}
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
            placeholder={activeCategory ? `Rechercher en ${activeCategory.name}...` : "Graphiste, développeur, community manager..."}
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FREELANCE_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => toggleCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                activeCategoryId === cat.id
                  ? "bg-cm-text text-white"
                  : "bg-cm-elevated border border-cm-border text-cm-text hover:border-cm-text-muted"
              }`}>
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Location filter */}
        <button onClick={() => setShowLocationPicker(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cm-elevated border border-cm-border text-[11px] font-medium text-cm-text-soft cursor-pointer active:scale-95 transition-transform mt-2">
          <MapPin className="w-3.5 h-3.5" />
          {locationFilter || "Toutes les zones"}
        </button>
      </div>

      {/* Top Rated Horizontal Carousel */}
      {!query && !isCategoryFocused && (
        <div className="pt-3 pb-1">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-[13px] font-bold text-cm-text">Freelances en vedette</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
            {featuredFreelancers.map((pro, i) => (
              <motion.button
                key={pro.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                onClick={() => nav(`/explorer/pro/${pro.id}`)}
                className="shrink-0 w-40 relative bg-cm-elevated border border-cm-border rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
              >
                <div className="relative h-24 overflow-hidden">
                  <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover object-top" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <FavoriteButton item={favItemForPro(pro)} className="top-2 left-2" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-cm-amber text-cm-amber drop-shadow-sm" />
                      <span className="text-[11px] font-bold text-white drop-shadow-sm">{pro.rating}</span>
                    </div>
                  </div>
                  {pro.badge && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-cm-amber text-[8px] font-bold text-cm-text shadow-sm">
                      {pro.badge}
                    </span>
                  )}
                  {pro.verified && !pro.badge && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-cm-green rounded-full flex items-center justify-center shadow-sm">
                      <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none"><path d="M3 6L5 8L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-[12px] font-bold text-cm-text truncate">{pro.name}</h3>
                  <p className="text-[10px] text-cm-text-soft truncate mt-0.5">{pro.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-cm-text-soft flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />{pro.location}
                    </span>
                    <span className="text-[10px] font-bold text-cm-forest truncate min-w-0">{formatPriceLabel(pro.hourlyRate)}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <section className="flex-1 px-4 pb-6 pt-3">
        {filteredCategories.length === 0 && (query || isCategoryFocused) ? (
          <div className="flex flex-col items-center justify-center pt-12">
            <div className="w-14 h-14 rounded-xl bg-cm-elevated border border-cm-border flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-cm-text-muted" />
            </div>
            <p className="text-[13px] font-bold text-cm-text mb-1">Aucun freelance trouvé</p>
            <button onClick={resetAll}
              className="mt-3 h-9 px-4 rounded-xl bg-cm-text text-white text-[11px] font-bold cursor-pointer active:scale-95 transition-transform">
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[16px]">{cat.icon}</span>
                    <h2 className="text-[14px] font-bold text-cm-text">{cat.name}</h2>
                    <span className="text-[10px] text-cm-text-muted font-medium bg-cm-elevated px-1.5 py-0.5 rounded-full">{cat.pros.length}</span>
                  </div>
                </div>

                {/* Horizontal scroll of freelancer cards */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
                  {cat.pros.map((pro, i) => (
                    <motion.button
                      key={pro.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.25 }}
                      onClick={() => nav(`/explorer/pro/${pro.id}`)}
                      className="shrink-0 w-56 relative bg-cm-elevated border border-cm-border rounded-2xl p-3 text-left cursor-pointer active:scale-[0.97] transition-transform hover:border-cm-accent/40"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-cm-border">
                          <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" loading="lazy" />
                          {pro.verified && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-cm-green rounded-full flex items-center justify-center">
                              <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none"><path d="M3 6L5 8L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <h3 className="text-[12px] font-bold text-cm-text truncate">{pro.name}</h3>
                            {pro.badge && (
                              <span className="text-[8px] font-bold text-cm-amber bg-cm-amber/15 px-1.5 py-0.5 rounded-full shrink-0">{pro.badge}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-cm-text-soft truncate">{pro.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-cm-border/50">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-cm-amber">
                            <Star className="w-2.5 h-2.5 fill-cm-amber text-cm-amber" />{pro.rating}
                          </span>
                          <span className="text-[9px] text-cm-text-muted">({pro.reviewCount})</span>
                        </div>
                        <span className="text-[11px] font-bold text-cm-forest truncate">{formatPriceLabel(pro.hourlyRate)}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <MapPin className="w-2.5 h-2.5 text-cm-text-muted" />
                        <span className="text-[9px] text-cm-text-muted">{pro.location}</span>
                      </div>
                      <FavoriteButton item={favItemForPro(pro)} />
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
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
