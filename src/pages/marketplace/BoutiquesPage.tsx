import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Star, Search, Store } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import FavoriteButton from "../../components/FavoriteButton";
import { getBoutiques, type BoutiqueView } from "../../data/marketplaceSuppliers";
import type { ShopType, MarketplaceVertical } from "../../types/marketplace";

const VERTICAL_INFO: Partial<Record<MarketplaceVertical, { label: string; icon: string }>> = {
  pro_supply: { label: "Matériaux", icon: "🧱" },
  shopping: { label: "Shopping", icon: "🛍️" },
  second_hand: { label: "Seconde main", icon: "♻️" },
  real_estate: { label: "Immobilier", icon: "🏢" },
  automobile: { label: "Auto", icon: "🚗" },
};

const SHOP_TYPE_LABEL: Record<ShopType, string> = {
  physical: "Sur place",
  online: "En ligne",
  hybrid: "Hybride",
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

function BoutiqueCard({ boutique, onClick }: { boutique: BoutiqueView; onClick?: () => void }) {
  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="w-full relative flex items-center gap-3 p-3 bg-cm-elevated rounded-[var(--radius-cm)] border border-cm-border text-left cursor-pointer active:scale-[0.98] transition-transform hover:border-cm-accent/40"
    >
      <div className="w-14 h-14 rounded-[14px] bg-cm-surface border border-cm-border shrink-0 overflow-hidden flex items-center justify-center">
        {boutique.logo ? (
          <img src={boutique.logo} alt={boutique.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <Store className="w-6 h-6 text-cm-text-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[13px] font-bold text-cm-text truncate">{boutique.name}</h3>
          {boutique.verified && (
            <span className="w-4 h-4 bg-cm-green rounded-full flex items-center justify-center shrink-0">
              <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none"><path d="M3 6L5 8L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          )}
        </div>
        <p className="text-[11px] text-cm-text-soft flex items-center gap-1 truncate mt-0.5">
          <MapPin className="w-3 h-3 text-cm-text-muted shrink-0" /> {boutique.city}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            {boutique.rating > 0 ? boutique.rating.toFixed(1) : "Nouveau"}
          </span>
          <span className="text-[10px] text-cm-text-muted">({boutique.reviewCount})</span>
          <span className="text-[10px] text-cm-text-muted bg-cm-surface px-1.5 py-0.5 rounded-full">{SHOP_TYPE_LABEL[boutique.shopType]}</span>
          {boutique.buyOnline && (
            <span className="text-[10px] font-semibold text-cm-accent bg-cm-accent/10 px-1.5 py-0.5 rounded-full">Achat en ligne</span>
          )}
        </div>
      </div>
      <FavoriteButton item={{
        type: "boutique",
        id: boutique.id,
        name: boutique.name,
        subtitle: `${boutique.city} · ${SHOP_TYPE_LABEL[boutique.shopType]}`,
        image: boutique.logo,
        rating: boutique.rating,
        route: `/marketplace/shop/${boutique.id}`,
      }} />
    </motion.button>
  );
}

export default function BoutiquesPage() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");

  const verticalFilter = searchParams.get("vertical");
  const onlineFilter = searchParams.get("online") === "1";
  const surplaceFilter = searchParams.get("surplace") === "1";

  const boutiques = useMemo(() => getBoutiques(), []);

  const verticals = useMemo(() => {
    const present = boutiques
      .map((b) => b.verticals)
      .flat()
      .filter((v, i, arr) => arr.indexOf(v) === i);
    const order: MarketplaceVertical[] = ["pro_supply", "shopping", "second_hand", "real_estate", "automobile"];
    return [...order.filter((v) => present.includes(v)), ...present.filter((v) => !order.includes(v))];
  }, [boutiques]);

  const isFilterActive = !!verticalFilter || onlineFilter || surplaceFilter;

  const filtered = useMemo(() => {
    return boutiques.filter((b) => {
      const matchesQuery = !query.trim() || b.name.toLowerCase().includes(query.trim().toLowerCase()) || b.city.toLowerCase().includes(query.trim().toLowerCase());
      const matchesVertical = !verticalFilter || b.verticals.includes(verticalFilter as never);
      const matchesOnline = !onlineFilter || b.buyOnline || b.shopType === "online";
      const matchesSurplace = !surplaceFilter || b.shopType === "physical" || b.shopType === "hybrid";
      return matchesQuery && matchesVertical && matchesOnline && matchesSurplace;
    });
  }, [boutiques, query, verticalFilter, onlineFilter, surplaceFilter]);

  const setFilter = (params: Record<string, string>) => {
    const next = new URLSearchParams(params);
    setSearchParams(next);
  };

  return (
    <div className="min-h-dynamic bg-cm-bg pb-10">
      <PageHeader title="Boutiques d'Abidjan" fallbackRoute="/" subtitle={`${boutiques.length} boutiques partenaires`} />

      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-[13px] bg-cm-elevated border border-cm-border rounded-[var(--radius-cm-lg)] outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-accent/50 focus:ring-2 focus:ring-cm-accent/20 transition-all"
            placeholder="Rechercher une boutique..."
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 pt-2 pb-1 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          <button onClick={() => setFilter({})}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              !isFilterActive ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft"
            }`}>
            Toutes
          </button>
          {verticals.map((v) => (
            <button key={v} onClick={() => setFilter({ vertical: v })}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                verticalFilter === v ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft"
              }`}>
              <span>{VERTICAL_INFO[v]?.icon}</span>
              <span>{VERTICAL_INFO[v]?.label ?? v}</span>
            </button>
          ))}
          <button onClick={() => setFilter({ online: "1" })}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              onlineFilter ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft"
            }`}>
            🌐 En ligne
          </button>
          <button onClick={() => setFilter({ surplace: "1" })}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              surplaceFilter ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft"
            }`}>
            📍 Sur place
          </button>
        </div>
      </div>

      {/* Count */}
      {isFilterActive && (
        <div className="px-4 py-1.5">
          <p className="text-[11px] text-cm-text-muted">{filtered.length} boutique(s)</p>
        </div>
      )}

      {/* List */}
      <div className="px-4 pt-2">
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div key="list" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-2">
              {filtered.map((b) => (
                <BoutiqueCard key={b.id} boutique={b} onClick={() => nav(`/marketplace/shop/${b.id}`)} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center pt-14">
              <div className="w-14 h-14 rounded-[18px] bg-cm-elevated border border-cm-border flex items-center justify-center mb-3 shadow-sm">
                <Store className="w-6 h-6 text-cm-text-muted" />
              </div>
              <p className="text-[14px] font-bold text-cm-text mb-1">Aucune boutique trouvée</p>
              <p className="text-[12px] text-cm-text-muted text-center max-w-[240px]">Essayez un autre filtre ou un autre nom de boutique</p>
              <button onClick={() => { setQuery(""); setFilter({}); }}
                className="mt-4 h-9 px-4 rounded-xl bg-cm-text text-white text-[11px] font-bold cursor-pointer active:scale-95 transition-transform">
                Réinitialiser
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
