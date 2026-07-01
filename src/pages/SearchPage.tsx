import { useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X, Star, MapPin, ArrowLeft, SlidersHorizontal, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import BentoCard from "../components/ui/BentoCard";
import ProCard from "../components/ui/ProCard";
import FilterSheet from "../components/FilterSheet";
import { SERVICE_CATEGORIES, findBestMatch, smartSearchSuggestions } from "../data/serviceCategories";
import { MOCK_PROS } from "../services/mockData";
import { useLocationStore, haversineKm, LOCATIONS } from "../stores/locationStore";
import { useProFilters } from "../hooks/useProFilters";
import type { ProfessionalDetails } from "../types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

export default function SearchPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const subCategoryParam = searchParams.get("subCategory");
  const categoryParam = searchParams.get("category");
  const qParam = searchParams.get("q");

  const [query, setQuery] = useState(qParam || subCategoryParam || "");
  const [typedResults, setTypedResults] = useState<ProfessionalDetails[]>([]);
  const [searched, setSearched] = useState(!!subCategoryParam || !!qParam);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const initialized = useRef(false);

  const storeLat = useLocationStore((s) => s.latitude);
  const storeLng = useLocationStore((s) => s.longitude);
  const neighborhood = useLocationStore((s) => s.neighborhood);
  const setNeighborhood = useLocationStore((s) => s.setNeighborhood);

  if (!initialized.current) {
    initialized.current = true;
    const searchTerm = qParam || subCategoryParam;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = findBestMatch(searchTerm);
      const filtered = MOCK_PROS.filter((pro) => {
        const nameMatch = pro.name.toLowerCase().includes(q);
        const titleMatch = pro.title.toLowerCase().includes(q);
        const locationMatch = pro.locationNeighborhood.toLowerCase().includes(q);
        const subMatch = match && (
          pro.title.toLowerCase().includes(match.subName.toLowerCase()) ||
          pro.subCategory.toLowerCase().includes(match.subName.toLowerCase())
        );
        return nameMatch || titleMatch || locationMatch || subMatch;
      });
      setTypedResults(filtered);
    }
  }

  const userCoord = { lat: storeLat, lng: storeLng };
  const { filters, setFilter, resetFilters, filteredPros } = useProFilters(MOCK_PROS, userCoord);

  const results = typedResults.length > 0 ? typedResults : [];
  const displayPros = filters.query.length >= 2 || filters.categoryId || filters.subCategory || filters.rating > 0 || filters.location || filters.nearbyOnly
    ? filteredPros
    : results;

  const handleSearch = (val: string) => {
    setQuery(val);
    setFilter("query", val);
    if (val.length < 2) {
      if (!subCategoryParam) { setTypedResults([]); setSearched(false); }
      return;
    }
    setSearched(true);
    const q = val.toLowerCase();
    const match = findBestMatch(val);
    const filtered = MOCK_PROS.filter((pro) => {
      const nameMatch = pro.name.toLowerCase().includes(q);
      const titleMatch = pro.title.toLowerCase().includes(q);
      const locationMatch = pro.locationNeighborhood.toLowerCase().includes(q);
      const subMatch = match && (
        pro.title.toLowerCase().includes(match.subName.toLowerCase()) ||
        pro.subCategory.toLowerCase().includes(match.subName.toLowerCase())
      );
      return nameMatch || titleMatch || locationMatch || subMatch;
    });
    setTypedResults(filtered);
  };

  const featuredPros = useMemo(() => {
    let list = [...MOCK_PROS];
    if (subCategoryParam) {
      list = list.filter(p => p.subCategory === subCategoryParam);
    }
    return list.sort((a, b) => b.rating - a.rating).slice(0, 8);
  }, [subCategoryParam]);

  const getTier = (completed: number) => {
    if (completed >= 120) return { label: "Expert", color: "text-cm-accent", bg: "bg-cm-accent-soft" };
    if (completed >= 60) return { label: "Avancé", color: "text-cm-text-soft", bg: "bg-cm-border-soft" };
    return { label: "Débutant", color: "text-cm-text-muted", bg: "bg-cm-border-soft" };
  };

  const hasActiveFilter = filters.nearbyOnly || displayPros.length > 0;

  return (
    <div className="min-h-screen bg-cm-bg pb-24">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-10 bg-cm-bg/80 backdrop-blur-xl border-b border-cm-border/40">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => nav(-1)}
              className="cm-scale-btn w-8 h-8 flex items-center justify-center rounded-[12px] bg-cm-elevated hover:bg-cm-border/50 cursor-pointer shrink-0">
              <ArrowLeft className="w-4 h-4 text-cm-text" />
            </button>
          </div>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted pointer-events-none" />
            <input
              type="text"
              autoFocus={!subCategoryParam}
              className="w-full h-11 pl-9 pr-12 text-[13px] bg-cm-elevated border border-cm-border rounded-[14px] outline-none transition-all text-cm-text placeholder-cm-text-muted focus:border-cm-accent"
              placeholder="Plombier, électricien..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <button onClick={() => setShowFilterSheet(true)}
                className="w-8 h-8 rounded-full bg-cm-border-soft flex items-center justify-center cursor-pointer cm-scale-btn">
                <SlidersHorizontal className="w-4 h-4 text-cm-text-soft" />
              </button>
            </div>
          </div>

          {/* Subcategory suggestions */}
          {query.length >= 2 && !searched && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {smartSearchSuggestions(query).map((s) => (
                <button key={s.subName} onClick={() => { setQuery(s.subName); handleSearch(s.subName); }}
                  className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-[11px] font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors">
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          {searched || hasActiveFilter ? (
            <motion.div key="results" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }}>
              {/* Results header */}
              <div className="flex items-center gap-2 mt-3 mb-2">
                <span className="text-[12px] text-cm-text-muted">
                  {displayPros.length} résultat{displayPros.length !== 1 ? "s" : ""}
                  {subCategoryParam && !query ? ` - ${subCategoryParam}` : ""}
                </span>
                <button onClick={() => setFilter("nearbyOnly", !filters.nearbyOnly)}
                  className={`ml-auto text-[11px] font-medium flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    filters.nearbyOnly
                      ? "bg-cm-accent-soft border-cm-accent text-cm-accent"
                      : "bg-cm-elevated border-cm-border text-cm-text-muted hover:border-cm-accent"
                  }`}>
                  <MapPin className="w-3 h-3" /> À proximité
                </button>
                {(query || filters.categoryId || filters.subCategory) && (
                  <button onClick={() => { setQuery(""); setTypedResults([]); resetFilters(); if (!subCategoryParam) setSearched(false); }}
                    className="text-[11px] font-medium text-cm-text-muted flex items-center gap-1 cursor-pointer">
                    <X className="w-3 h-3" /> Effacer
                  </button>
                )}
              </div>

              {displayPros.length === 0 ? (
                <motion.div variants={itemAnim} className="text-center py-12">
                  <div className="w-14 h-14 rounded-[18px] bg-cm-border-soft border border-cm-border flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-cm-text-muted" />
                  </div>
                  <p className="text-[14px] font-bold text-cm-text mb-1">Aucun résultat</p>
                  <p className="text-[12px] text-cm-text-muted">Essayez d'autres mots-clés</p>
                </motion.div>
              ) : (
                <motion.div variants={container} className="grid grid-cols-2 gap-3 mt-1">
                  {displayPros.map((pro) => (
                    <motion.div key={pro.id} variants={itemAnim}>
                      <ProCard pro={pro} variant="dark" onClick={() => nav(`/explorer/pro/${pro.id}`)} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="browse" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }}>
              {/* Categories Row */}
              <motion.div variants={itemAnim} className="mt-4 mb-5">
                <h2 className="text-[14px] font-display font-bold text-cm-text mb-3">Catégories</h2>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => nav(`/explorer/category/${cat.id}`)}
                      className="cm-scale-btn flex items-center gap-2 px-4 py-2.5 bg-cm-elevated border border-cm-border rounded-[14px] whitespace-nowrap cursor-pointer hover:border-cm-accent/30 transition-colors shadow-cm-bento shrink-0"
                    >
                      <span className="text-[16px]">{cat.icon}</span>
                      <span className="text-[12px] font-semibold text-cm-text">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Featured Pros */}
              <motion.div variants={itemAnim} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[14px] font-display font-bold text-cm-text">
                    {subCategoryParam ? `Pros ${subCategoryParam}` : "Pros à la une"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setFilter("nearbyOnly", !filters.nearbyOnly)}
                      className={`text-[11px] font-medium flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        filters.nearbyOnly
                          ? "bg-cm-accent-soft border-cm-accent text-cm-accent"
                          : "bg-cm-elevated border-cm-border text-cm-text-muted hover:border-cm-accent"
                      }`}>
                      <MapPin className="w-3 h-3" /> À proximité
                    </button>
                    <button onClick={() => nav("/explorer")} className="text-[11px] font-medium text-cm-accent cursor-pointer">
                      Voir tout
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {featuredPros.map((pro) => (
                    <ProCard key={pro.id} pro={pro} variant="light" onClick={() => nav(`/explorer/pro/${pro.id}`)} />
                  ))}
                </div>
              </motion.div>

              {/* Bottom CTA */}
              <motion.div variants={itemAnim} className="text-center pb-4">
                <button type="button" onClick={() => nav("/explorer/request-creation")}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-[14px] text-[13px] font-semibold cursor-pointer cm-scale-btn hover:opacity-90"
                >
                  Créer une demande
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shared Filter Sheet */}
      <FilterSheet
        open={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        filters={filters}
        onSetFilter={setFilter}
      />
    </div>
  );
}
