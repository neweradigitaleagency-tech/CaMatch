import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X, Star, MapPin, Sparkles, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import GlassCard from "../components/ui/GlassCard";
import BentoCard from "../components/ui/BentoCard";
import VerifiedBadge from "../components/ui/VerifiedBadge";
import { SERVICE_CATEGORIES, findBestMatch } from "../data/serviceCategories";
import { MOCK_PROS } from "../services/mockData";
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

  const [query, setQuery] = useState("");
  const [typedResults, setTypedResults] = useState<ProfessionalDetails[]>([]);
  const [searched, setSearched] = useState(!!subCategoryParam);

  const initialResults = useMemo(() => {
    if (subCategoryParam) {
      const q = subCategoryParam.toLowerCase();
      return MOCK_PROS.filter(p =>
        p.subCategory.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q)
      );
    }
    return [];
  }, [subCategoryParam]);

  const results = subCategoryParam && !query ? initialResults : typedResults;

  const featuredPros = useMemo(() => {
    let list = [...MOCK_PROS];
    if (subCategoryParam) {
      list = list.filter(p => p.subCategory === subCategoryParam);
    }
    return list.sort((a, b) => b.rating - a.rating).slice(0, 8);
  }, [subCategoryParam]);

  const handleSearch = (val: string) => {
    setQuery(val);
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

  const getTier = (completed: number) => {
    if (completed >= 120) return { label: "Expert", color: "text-cm-accent", bg: "bg-cm-accent-soft" };
    if (completed >= 60) return { label: "Avancé", color: "text-cm-text-soft", bg: "bg-cm-border-soft" };
    return { label: "Débutant", color: "text-cm-text-muted", bg: "bg-cm-border-soft" };
  };

  return (
    <div className="min-h-screen bg-cm-bg pb-24">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-10 bg-cm-bg/80 backdrop-blur-xl border-b border-cm-border/40">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            {subCategoryParam && (
              <button onClick={() => nav(-1)}
                className="cm-scale-btn w-8 h-8 flex items-center justify-center rounded-[12px] bg-cm-elevated hover:bg-cm-border/50 cursor-pointer shrink-0">
                <ArrowLeft className="w-4 h-4 text-cm-text" />
              </button>
            )}
          </div>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted pointer-events-none" />
            <input
              type="text"
              autoFocus={!subCategoryParam}
              className="w-full h-11 pl-9 pr-10 text-[13px] bg-cm-elevated border border-cm-border rounded-[14px] outline-none transition-all text-cm-text placeholder-cm-text-muted focus:border-cm-accent"
              placeholder="Plombier, électricien..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Search results / Suggestions */}
        <AnimatePresence mode="wait">
          {searched ? (
            <motion.div key="results" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }}>
              {/* Results header */}
              <div className="flex items-center justify-between mt-3 mb-2">
                <span className="text-[12px] text-cm-text-muted">
                  {results.length} résultat{results.length !== 1 ? "s" : ""}
                  {subCategoryParam && !query ? ` - ${subCategoryParam}` : ""}
                </span>
                {query && (
                  <button onClick={() => { setQuery(""); setTypedResults([]); if (!subCategoryParam) setSearched(false); }}
                    className="text-[11px] font-medium text-cm-text-muted flex items-center gap-1 cursor-pointer">
                    <X className="w-3 h-3" /> Effacer
                  </button>
                )}
              </div>

              {results.length === 0 ? (
                <motion.div variants={itemAnim} className="text-center py-12">
                  <div className="w-14 h-14 rounded-[18px] bg-cm-border-soft border border-cm-border flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-cm-text-muted" />
                  </div>
                  <p className="text-[14px] font-bold text-cm-text mb-1">Aucun résultat</p>
                  <p className="text-[12px] text-cm-text-muted">Essayez d'autres mots-clés</p>
                </motion.div>
              ) : (
                <motion.div variants={container} className="grid grid-cols-2 gap-3 mt-1">
                  {results.map((pro) => {
                    const tier = getTier(pro.completedInterventions);
                    return (
                      <motion.div key={pro.id} variants={itemAnim}>
                        <button onClick={() => nav(`/explorer/pro/${pro.id}`)} className="w-full text-left cursor-pointer">
                          <BentoCard className="p-3.5 h-full group hover:border-cm-accent/30 transition-colors">
                            <div className="flex items-center gap-2.5 mb-2">
                              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cm-border-soft shrink-0">
                                <img src={pro.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <h4 className="text-[12px] font-bold text-cm-text truncate">{pro.name}</h4>
                                  {pro.isVerified && <VerifiedBadge />}
                                </div>
                                <p className="text-[10px] text-cm-text-soft truncate">{pro.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[11px] text-cm-text-muted flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-cm-accent text-cm-accent" />
                                {(pro.rating / 10).toFixed(1)}
                              </span>
                              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-[9999px] ${tier.bg} ${tier.color}`}>
                                {tier.label}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-cm-text-muted flex items-center gap-0.5 truncate">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                {pro.locationNeighborhood.split(",")[0]}
                              </span>
                              <span className="text-[12px] font-bold text-cm-text font-mono">
                                {pro.hourlyRateXOF.toLocaleString("fr-FR")} F
                              </span>
                            </div>
                          </BentoCard>
                        </button>
                      </motion.div>
                    );
                  })}
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
                  <button onClick={() => nav("/explorer")} className="text-[11px] font-medium text-cm-accent cursor-pointer">
                    Voir tout
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {featuredPros.map((pro) => {
                    const tier = getTier(pro.completedInterventions);
                    return (
                      <button key={pro.id} onClick={() => nav(`/explorer/pro/${pro.id}`)} className="w-full text-left cursor-pointer">
                        <BentoCard className="p-3.5 group hover:border-cm-accent/30 transition-colors">
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cm-border-soft shrink-0">
                              <img src={pro.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <h4 className="text-[12px] font-bold text-cm-text truncate">{pro.name}</h4>
                                {pro.isVerified && <VerifiedBadge />}
                              </div>
                              <p className="text-[10px] text-cm-text-soft truncate">{pro.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[11px] text-cm-text-muted flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-cm-accent text-cm-accent" />
                              {(pro.rating / 10).toFixed(1)}
                            </span>
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-[9999px] ${tier.bg} ${tier.color}`}>
                              {tier.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-cm-text-muted flex items-center gap-0.5 truncate">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              {pro.locationNeighborhood.split(",")[0]}
                            </span>
                            <span className="text-[12px] font-bold text-cm-text font-mono">
                              {pro.hourlyRateXOF.toLocaleString("fr-FR")} F
                            </span>
                          </div>
                        </BentoCard>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Bottom CTA */}
              <motion.div variants={itemAnim} className="text-center pb-4">
                <button
                  className="inline-flex items-center gap-2 px-5 py-3 bg-cm-accent-soft border border-cm-accent/30 rounded-[14px] text-[13px] font-semibold text-cm-accent cursor-pointer cm-scale-btn"
                >
                  <Sparkles className="w-4 h-4" />
                  Je ne sais pas qui contacter
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
