import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBackNavigation } from "../hooks/useBackNavigation";
import { Search, ArrowLeft, X, Star, MapPin, ChevronRight, BriefcaseBusiness, Wrench, Package, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SERVICE_CATEGORIES, smartSearchSuggestions } from "../data/serviceCategories";
import { useLocationStore } from "../stores/locationStore";
import { useRequestStore } from "../stores/requestStore";
import { useUnifiedSearch } from "../hooks/useUnifiedSearch";
import { MOCK_PROS } from "../services/mockData";
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

const DISCOVERY_PRODUCTS = [
  { id: "disc-prod-1", title: "Climatiseur Samsung 12000 BTU", price: 350000, category: "Climatisation", image: null },
  { id: "disc-prod-2", title: "Tube cuivre Ø12mm (10m)", price: 15000, category: "Plomberie", image: null },
  { id: "disc-prod-3", title: "Disjoncteur Legrand 20A", price: 8500, category: "Électricité", image: null },
];

function ProResultCard({ result, onClick }: { result: SearchResult; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="flex items-center gap-3 p-3 bg-white rounded-[14px] text-left cursor-pointer active:scale-[0.98] transition-transform border border-gray-100 hover:border-gray-200 shrink-0 w-[280px]"
    >
      <div className="w-11 h-11 rounded-full bg-gray-100 shrink-0 overflow-hidden border-2 border-gray-100">
        {result.image_url ? (
          <img src={result.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[16px]">👤</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-semibold text-[#2B2B2B] truncate">{result.title}</h3>
        <p className="text-[11px] text-gray-500 truncate">{result.description ?? result.category ?? ""}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600">
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            {result.rating.toFixed(1)}
          </span>
          {result.location_city && (
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />{result.location_city}
            </span>
          )}
        </div>
      </div>
      {result.price > 0 && (
        <span className="text-[11px] font-bold text-[#7FD356] shrink-0">{result.price.toLocaleString()} F/h</span>
      )}
    </motion.button>
  );
}

function ProCardSimple({ name, title, rating, reviewCount, avatarUrl, onClick }: { name: string; title: string; rating: number; reviewCount: number; avatarUrl: string; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="flex items-center gap-3 p-3 bg-white rounded-[14px] text-left cursor-pointer active:scale-[0.98] transition-transform border border-gray-100 hover:border-gray-200"
    >
      <div className="w-11 h-11 rounded-full bg-gray-100 shrink-0 overflow-hidden border-2 border-gray-100">
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-semibold text-[#2B2B2B] truncate">{name}</h3>
        <p className="text-[11px] text-gray-500 truncate">{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600">
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            {rating.toFixed(1)}
          </span>
          <span className="text-[10px] text-gray-400">{reviewCount}+</span>
        </div>
      </div>
    </motion.button>
  );
}

function ProductResultCard({ result, onClick }: { result: SearchResult; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="flex gap-3 p-3 bg-white rounded-[14px] text-left cursor-pointer active:scale-[0.98] transition-transform border border-gray-100 hover:border-gray-200 min-w-0"
    >
      <div className="w-16 h-16 rounded-[10px] bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
        {result.image_url ? (
          <img src={result.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <Package className="w-6 h-6 text-gray-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-[#2B2B2B] line-clamp-2">{result.title}</p>
        {result.category && (
          <p className="text-[10px] text-gray-500 mt-0.5">{result.category}</p>
        )}
        {result.price > 0 && (
          <p className="text-[13px] font-bold text-[#7FD356] mt-1">{result.price.toLocaleString()} FCFA</p>
        )}
      </div>
    </motion.button>
  );
}

function ProductCardSimple({ title, price, category, onClick }: { title: string; price: number; category: string; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="flex gap-3 p-3 bg-white rounded-[14px] text-left cursor-pointer active:scale-[0.98] transition-transform border border-gray-100 hover:border-gray-200"
    >
      <div className="w-16 h-16 rounded-[10px] bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
        <Package className="w-6 h-6 text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-[#2B2B2B] line-clamp-2">{title}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{category}</p>
        <p className="text-[13px] font-bold text-[#7FD356] mt-1">{price.toLocaleString()} FCFA</p>
      </div>
    </motion.button>
  );
}

function ServiceRow({ service, onClick }: { service: MatchedService; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-[12px] text-left cursor-pointer active:scale-[0.98] transition-transform border border-gray-100 hover:border-gray-200"
    >
      <div className="w-9 h-9 rounded-full bg-[rgba(43,43,43,0.06)] flex items-center justify-center shrink-0">
        <Wrench className="w-4 h-4 text-[#2B2B2B]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#2B2B2B]">{service.label}</p>
        <p className="text-[10px] text-gray-500">{service.subName}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
    </motion.button>
  );
}

function RequestRow({ request, onClick }: { request: SimilarRequest; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-[12px] text-left cursor-pointer active:scale-[0.98] transition-transform border border-gray-100 hover:border-gray-200"
    >
      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
        <ClipboardList className="w-4 h-4 text-amber-700" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#2B2B2B] truncate">{request.title}</p>
        <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" />{request.location}
        </p>
      </div>
      <span className="text-[11px] font-bold text-[#7FD356] shrink-0">{request.budgetXOF.toLocaleString()} F</span>
    </motion.button>
  );
}

function SectionHeader({ label, count, onViewAll }: { label: string; count: number; onViewAll?: () => void }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center justify-between mb-2.5 mt-4 first:mt-0">
      <h2 className="text-[15px] font-bold text-[#2B2B2B]">{label} <span className="text-gray-400 font-medium">({count})</span></h2>
      {onViewAll && (
        <button onClick={onViewAll}
          className="text-[11px] font-semibold text-[#7FD356] flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform">
          Voir tout <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default function SearchPage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/marketplace");
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q");
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
  const showDiscovery = !searched || query.length < 2;

  const discoveryServices = useMemo(() => {
    const result: MatchedService[] = [];
    for (const cat of SERVICE_CATEGORIES) {
      for (const sub of cat.subcategories.slice(0, 2)) {
        if (result.length >= 4) break;
        result.push({ label: sub.name, subName: cat.name, categoryId: cat.id });
      }
      if (result.length >= 4) break;
    }
    return result;
  }, []);

  const discoveryPros = useMemo(() => {
    return [...MOCK_PROS].sort((a, b) => b.rating - a.rating).slice(0, 3);
  }, []);

  const discoveryRequests = useMemo(() => {
    return missions.slice(0, 3).map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      category: m.category,
      location: m.address,
      budgetXOF: m.budgetXOF,
    }));
  }, [missions]);

  return (
    <div className="min-h-dynamic bg-[#F5F5F5] pb-24">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-10 bg-[#F5F5F5]/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={goBack}
              className="w-8 h-8 rounded-full bg-[rgba(43,43,43,0.08)] backdrop-blur-sm border border-[rgba(43,43,43,0.10)] flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0">
              <ArrowLeft className="w-4 h-4 text-[#2B2B2B]" />
            </button>
            <span className="text-[15px] font-bold text-[#2B2B2B]">Recherche</span>
          </div>
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2B2B2B]/40 pointer-events-none" />
            <input
              type="text"
              autoFocus={!qParam}
              className="w-full h-11 pl-10 pr-4 text-[13px] bg-white rounded-[14px] outline-none text-[#2B2B2B] placeholder:text-[#2B2B2B]/40 font-medium shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-200/60 focus:border-[#7FD356]/30 focus:ring-2 focus:ring-[#7FD356]/20"
              placeholder="Peinture, plombier, climatiseur..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-[#7FD356] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          {hasResults ? (
            <motion.div key="results" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }} className="pb-4">
              <div className="flex items-center justify-end mt-2 mb-1">
                <button onClick={() => setQuery("")}
                  className="text-[11px] font-medium text-gray-400 flex items-center gap-1 cursor-pointer active:scale-95 transition-transform">
                  <X className="w-3 h-3" /> Effacer
                </button>
              </div>

              {professionals.length > 0 && (
                <div>
                  <SectionHeader label="Professionnels" count={countByType.professional}
                    onViewAll={() => nav(`/professionals?q=${encodeURIComponent(query)}`)} />
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
                        onClick={() => nav(`/professionals?category=${svc.categoryId}`)} />
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
                  <div className="w-14 h-14 rounded-[18px] bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-sm">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-[14px] font-bold text-[#2B2B2B] mb-1">Aucun résultat</p>
                  <p className="text-[12px] text-gray-500 text-center max-w-[240px]">Essayez d'autres mots-clés comme "plombier", "peinture" ou "climatisation"</p>
                </div>
              )}
            </motion.div>
          ) : showDiscovery ? (
            <motion.div key="discovery" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }} className="pb-4">
              {/* Discovery: Professionals */}
              {discoveryPros.length > 0 && (
                <div className="mt-3">
                  <SectionHeader label="Professionnels" count={discoveryPros.length}
                    onViewAll={() => nav("/professionals")} />
                  <div className="space-y-2">
                    {discoveryPros.map((pro) => (
                      <ProCardSimple key={pro.id}
                        name={pro.name}
                        title={pro.title}
                        rating={pro.rating / 10}
                        reviewCount={pro.reviewCount}
                        avatarUrl={pro.avatarUrl ?? ""}
                        onClick={() => nav(`/explorer/pro/${pro.id}`)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Discovery: Services */}
              {discoveryServices.length > 0 && (
                <div className="mt-3">
                  <SectionHeader label="Services" count={discoveryServices.length}
                    onViewAll={() => nav("/professionals")} />
                  <div className="space-y-2">
                    {discoveryServices.map((svc, i) => (
                      <ServiceRow key={`disc-svc-${i}`}
                        service={svc}
                        onClick={() => nav(`/professionals?category=${svc.categoryId}`)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Discovery: Products */}
              {DISCOVERY_PRODUCTS.length > 0 && (
                <div className="mt-3">
                  <SectionHeader label="Marketplace" count={DISCOVERY_PRODUCTS.length}
                    onViewAll={() => nav("/marketplace")} />
                  <div className="space-y-2">
                    {DISCOVERY_PRODUCTS.map((prod) => (
                      <ProductCardSimple key={prod.id}
                        title={prod.title}
                        price={prod.price}
                        category={prod.category}
                        onClick={() => nav(`/catalog?product=${prod.id}`)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Discovery: Similar requests */}
              {discoveryRequests.length > 0 && (
                <div className="mt-3">
                  <SectionHeader label="Demandes récentes" count={discoveryRequests.length}
                    onViewAll={() => nav("/orders")} />
                  <div className="space-y-2">
                    {discoveryRequests.map((req) => (
                      <RequestRow key={req.id} request={req}
                        onClick={() => nav(`/orders/${req.id}`)} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
