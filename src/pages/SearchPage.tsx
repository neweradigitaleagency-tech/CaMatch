import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import { Search, X, Star, MapPin, ChevronRight, ArrowLeft, Wrench, Package, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLocationStore } from "../stores/locationStore";
import { useRequestStore } from "../stores/requestStore";
import { useUnifiedSearch } from "../hooks/useUnifiedSearch";
import { SEARCH_BRANCHES, getSearchBranchById, type SearchBranch, type SearchSubcategory } from "../data/searchMenu";
import type { SearchResult } from "../services/searchService";
import type { MatchedService, SimilarRequest } from "../hooks/useUnifiedSearch";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

function ProResultCard({ result, onClick }: { result: SearchResult; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="flex items-center gap-3 p-3 bg-cm-elevated rounded-[var(--radius-cm)] text-left cursor-pointer active:scale-[0.98] transition-transform border border-cm-border shrink-0 w-[280px]"
    >
      <div className="w-11 h-11 rounded-full bg-cm-surface shrink-0 overflow-hidden border-2 border-cm-border-soft">
        {result.image_url ? (
          <img src={result.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[16px]">👤</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-semibold text-cm-text truncate">{result.title}</h3>
        <p className="text-[11px] text-cm-text-soft truncate">{result.description ?? result.category ?? ""}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600">
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            {result.rating.toFixed(1)}
          </span>
          {result.location_city && (
            <span className="text-[10px] text-cm-text-muted flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" /> {result.location_city}
            </span>
          )}
        </div>
      </div>
      {result.price > 0 && (
        <span className="text-[11px] font-bold text-cm-accent shrink-0">{result.price.toLocaleString()} F/h</span>
      )}
    </motion.button>
  );
}

function ProductResultCard({ result, onClick }: { result: SearchResult; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="flex gap-3 p-3 bg-cm-elevated rounded-[var(--radius-cm)] text-left cursor-pointer active:scale-[0.98] transition-transform border border-cm-border min-w-0"
    >
      <div className="w-16 h-16 rounded-[10px] bg-cm-surface border border-cm-border flex items-center justify-center shrink-0 overflow-hidden">
        {result.image_url ? (
          <img src={result.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <Package className="w-6 h-6 text-cm-text-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-cm-text line-clamp-2">{result.title}</p>
        {result.category && (
          <p className="text-[10px] text-cm-text-soft mt-0.5">{result.category}</p>
        )}
        {result.price > 0 && (
          <p className="text-[13px] font-bold text-cm-accent mt-1">{result.price.toLocaleString()} FCFA</p>
        )}
      </div>
    </motion.button>
  );
}

function ServiceRow({ service, onClick }: { service: MatchedService; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="w-full flex items-center gap-3 px-4 py-3 bg-cm-elevated rounded-[12px] text-left cursor-pointer active:scale-[0.98] transition-transform border border-cm-border-soft hover:border-cm-border"
    >
      <div className="w-9 h-9 rounded-full bg-cm-glass-dark-bg flex items-center justify-center shrink-0">
        <Wrench className="w-4 h-4 text-cm-text" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-cm-text">{service.label}</p>
        <p className="text-[10px] text-cm-text-muted">{service.subName}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-cm-border shrink-0" />
    </motion.button>
  );
}

function RequestRow({ request, onClick }: { request: SimilarRequest; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="w-full flex items-center gap-3 px-4 py-3 bg-cm-elevated rounded-[12px] text-left cursor-pointer active:scale-[0.98] transition-transform border border-cm-border-soft hover:border-cm-border"
    >
      <div className="w-9 h-9 rounded-full bg-cm-amber/15 flex items-center justify-center shrink-0">
        <ClipboardList className="w-4 h-4 text-cm-amber" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-cm-text truncate">{request.title}</p>
        <p className="text-[10px] text-cm-text-muted truncate flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" />{request.location}
        </p>
      </div>
      <span className="text-[11px] font-bold text-cm-accent shrink-0">{request.budgetXOF.toLocaleString()} F</span>
    </motion.button>
  );
}

function SectionHeader({ label, count, onViewAll }: { label: string; count: number; onViewAll?: () => void }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center justify-between mb-2.5 mt-4 first:mt-0">
      <h2 className="text-[15px] font-bold text-cm-text">{label} <span className="text-cm-text-muted font-medium">({count})</span></h2>
      {onViewAll && (
        <button onClick={onViewAll}
          className="text-[11px] font-semibold text-cm-accent flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform">
          Voir tout <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function BranchCard({ branch, onClick }: { branch: SearchBranch; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="flex flex-col gap-2.5 p-3.5 bg-cm-elevated rounded-[var(--radius-cm)] border border-cm-border text-left cursor-pointer active:scale-[0.97] transition-transform hover:border-cm-accent/40"
    >
      <div className={`w-10 h-10 rounded-[12px] bg-gradient-to-br ${branch.color} border border-cm-border-soft flex items-center justify-center text-[18px]`}>
        {branch.icon}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-cm-text leading-tight">{branch.label}</p>
        <p className="text-[10px] text-cm-text-muted mt-0.5 leading-snug line-clamp-2">{branch.description}</p>
      </div>
    </motion.button>
  );
}

function SubcategoryRow({ sub, onClick }: { sub: SearchSubcategory; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="w-full flex items-center gap-3 px-4 py-3.5 bg-cm-elevated rounded-[12px] text-left cursor-pointer active:scale-[0.98] transition-transform border border-cm-border-soft hover:border-cm-accent/40"
    >
      <div className="w-10 h-10 rounded-[12px] bg-cm-surface border border-cm-border flex items-center justify-center text-[17px] shrink-0">
        {sub.icon}
      </div>
      <span className="text-[13px] font-semibold text-cm-text flex-1">{sub.name}</span>
      <ChevronRight className="w-4 h-4 text-cm-border shrink-0" />
    </motion.button>
  );
}

export default function SearchPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q");
  const branchParam = searchParams.get("branch");
  const branch = useMemo(() => (branchParam ? getSearchBranchById(branchParam) : undefined), [branchParam]);
  const storeLat = useLocationStore((s) => s.latitude);
  const storeLng = useLocationStore((s) => s.longitude);
  const missions = useRequestStore((s) => s.missions);

  const {
    query, setQuery, loading, searched,
    professionals, products, matchedServices, similarRequests, countByType,
  } = useUnifiedSearch({ lat: storeLat, lng: storeLng, initialQuery: qParam ?? undefined });

  const handleResultClick = useCallback((result: SearchResult) => {
    switch (result.result_type) {
      case "professional":
        nav(`/explorer/pro/${result.id}`);
        break;
      case "product":
        nav(`/catalog?product=${result.id}`);
        break;
      case "supplier":
        nav(`/catalog?supplier=${result.id}`);
        break;
    }
  }, [nav]);

  const hasResults = professionals.length > 0 || products.length > 0 || matchedServices.length > 0 || similarRequests.length > 0;
  const showSelection = query.trim().length < 2;

  return (
    <div className="min-h-dynamic bg-cm-bg pb-24">
      <PageHeader title={branch ? branch.label : "Recherche"} fallbackRoute="/" />
      <div className="px-4 pt-2 pb-1">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted pointer-events-none" />
          <input
            type="text"
            autoFocus={!qParam && !branchParam}
            className="w-full h-11 pl-10 pr-4 text-[13px] bg-cm-elevated rounded-[var(--radius-cm-lg)] outline-none text-cm-text placeholder:text-cm-text-muted font-medium border border-cm-border focus:border-cm-accent/50 focus:ring-2 focus:ring-cm-accent/20 transition-all"
            placeholder="Peinture, plombier, climatiseur..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-cm-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          {showSelection ? (
            branch ? (
              <motion.div key={`branch-${branch.id}`} variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }} className="pb-4">
                <button onClick={() => nav("/search")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-cm-accent mt-3 cursor-pointer active:scale-95 transition-transform">
                  <ArrowLeft className="w-3.5 h-3.5" /> Toutes les branches
                </button>

                <div className="flex items-center gap-3 p-4 mt-2.5 bg-cm-elevated rounded-[var(--radius-cm)] border border-cm-border">
                  <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${branch.color} border border-cm-border-soft flex items-center justify-center text-[22px] shrink-0`}>
                    {branch.icon}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-bold text-cm-text">{branch.label}</h2>
                    <p className="text-[11px] text-cm-text-muted leading-snug">{branch.description}</p>
                  </div>
                </div>

                <h3 className="text-[13px] font-bold text-cm-text mt-4 mb-2">Choisissez une catégorie</h3>
                <div className="space-y-2">
                  {branch.subcategories.map((sub) => (
                    <SubcategoryRow key={sub.id} sub={sub} onClick={() => nav(sub.target)} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="branches" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }} className="pb-4">
                <h2 className="text-[15px] font-bold text-cm-text mt-3">Que recherchez-vous ?</h2>
                <p className="text-[11px] text-cm-text-muted mt-0.5 mb-3">Choisissez une branche ou tapez directement votre recherche</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {SEARCH_BRANCHES.map((b) => (
                    <BranchCard key={b.id} branch={b} onClick={() => nav(`/search?branch=${b.id}`)} />
                  ))}
                </div>
              </motion.div>
            )
          ) : (
            <motion.div key="results" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }} className="pb-4">
              <div className="flex items-center justify-end mt-2 mb-1">
                <button onClick={() => setQuery("")}
                  className="text-[11px] font-medium text-cm-text-muted flex items-center gap-1 cursor-pointer active:scale-95 transition-transform">
                  <X className="w-3 h-3" /> Effacer
                </button>
              </div>

              {professionals.length > 0 && (
                <div>
                  <SectionHeader label="Professionnels" count={countByType.professional}
                    onViewAll={() => nav(`/search?q=${encodeURIComponent(query)}`)} />
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
                    {professionals.map((pro) => (
                      <ProResultCard key={pro.id} result={pro} onClick={() => handleResultClick(pro)} />
                    ))}
                  </div>
                </div>
              )}

              {matchedServices.length > 0 && (
                <div>
                  <SectionHeader label="Services" count={countByType.service} />
                  <div className="space-y-2">
                    {matchedServices.map((svc, i) => (
                      <ServiceRow key={`${svc.categoryId}-${i}`}
                        service={svc}
                        onClick={() => nav(`/search?q=${encodeURIComponent(svc.label)}`)} />
                    ))}
                  </div>
                </div>
              )}

              {products.length > 0 && (
                <div>
                  <SectionHeader label="Produits Marketplace" count={countByType.product}
                    onViewAll={() => nav(`/marketplace?q=${encodeURIComponent(query)}`)} />
                  <div className="grid grid-cols-2 gap-2.5">
                    {products.map((prod) => (
                      <ProductResultCard key={prod.id} result={prod} onClick={() => handleResultClick(prod)} />
                    ))}
                  </div>
                </div>
              )}

              {similarRequests.length > 0 && (
                <div>
                  <SectionHeader label="Demandes similaires" count={countByType.request} />
                  <div className="space-y-2">
                    {similarRequests.map((req) => (
                      <RequestRow key={req.id} request={req}
                        onClick={() => nav(`/orders/${req.id}`)} />
                    ))}
                  </div>
                </div>
              )}

              {!loading && professionals.length === 0 && matchedServices.length === 0 && products.length === 0 && similarRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center pt-12">
                  <div className="w-14 h-14 rounded-[18px] bg-cm-elevated border border-cm-border flex items-center justify-center mb-3 shadow-sm">
                    <Search className="w-6 h-6 text-cm-text-muted" />
                  </div>
                  <p className="text-[14px] font-bold text-cm-text mb-1">Aucun résultat</p>
                  <p className="text-[12px] text-cm-text-muted text-center max-w-[240px]">Essayez d'autres mots-clés comme "plombier", "peinture" ou "climatisation"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
