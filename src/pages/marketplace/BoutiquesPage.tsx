import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Star, Search, Store, BadgeCheck, Package } from "lucide-react";
import FavoriteButton from "../../components/FavoriteButton";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { getBoutiques, type BoutiqueView } from "../../data/marketplaceSuppliers";
import { getProductsBySeller } from "../../data/marketplaceProducts";
import type { ShopType, MarketplaceVertical } from "../../types/marketplace";
import EmptyState from "../../components/ui/EmptyState";

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
  const previews = useMemo(
    () => getProductsBySeller(boutique.id).filter((p) => p.status === "active").slice(0, 3),
    [boutique.id]
  );

  return (
    <motion.button onClick={onClick} variants={fadeUp}
      className="w-full relative flex flex-col bg-cm-elevated rounded-[var(--radius-cm)] border border-cm-border overflow-hidden text-left cursor-pointer active:scale-[0.99] transition-transform hover:border-cm-accent/40"
    >
      <div className="relative h-24 shrink-0">
        {boutique.banner ? (
          <img src={boutique.banner} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cm-accent/20 to-cm-forest/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        {boutique.verified && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 text-cm-forest text-[9px] font-bold shadow-sm">
            <BadgeCheck className="w-3 h-3 text-cm-green" />
            Certifiée Ça Match
          </span>
        )}
        <div className="absolute -bottom-5 left-3 w-11 h-11 rounded-xl border-2 border-cm-elevated overflow-hidden bg-cm-surface flex items-center justify-center shadow-md">
          {boutique.logo ? (
            <img src={boutique.logo} alt={boutique.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <Store className="w-5 h-5 text-cm-text-muted" />
          )}
        </div>
      </div>

      <div className="px-3.5 pt-6 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[14px] font-bold text-cm-text truncate">{boutique.name}</h3>
          <FavoriteButton item={{
            type: "boutique",
            id: boutique.id,
            name: boutique.name,
            subtitle: `${boutique.city} · ${SHOP_TYPE_LABEL[boutique.shopType]}`,
            image: boutique.logo,
            rating: boutique.rating,
            route: `/marketplace/shop/${boutique.id}`,
          }} />
        </div>
        <p className="text-[11px] text-cm-text-soft mt-1 line-clamp-2">
          {boutique.description || `Boutique à ${boutique.city}`}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            {boutique.rating > 0 ? boutique.rating.toFixed(1) : "Nouveau"}
          </span>
          <span className="text-[10px] text-cm-text-muted">({boutique.reviewCount})</span>
          <span className="text-[10px] text-cm-text-soft flex items-center gap-0.5">
            <MapPin className="w-3 h-3 text-cm-text-muted shrink-0" /> {boutique.city}
          </span>
          <span className="text-[10px] text-cm-text-muted bg-cm-surface px-1.5 py-0.5 rounded-full">{SHOP_TYPE_LABEL[boutique.shopType]}</span>
          {boutique.buyOnline && (
            <span className="text-[10px] font-semibold text-cm-accent bg-cm-accent/10 px-1.5 py-0.5 rounded-full">Achat en ligne</span>
          )}
        </div>
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 mt-2.5">
            {previews.map((p) => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-cm-surface">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-cm-text-muted" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}

export default function BoutiquesPage() {
  const { navigate: nav } = useAppNavigation();
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
      <div className="px-4 pt-4 pb-1">
        <h1 className="h1-cm text-cm-text">Boutiques d'Abidjan</h1>
        <p className="text-[11px] text-cm-text-soft mt-0.5">{boutiques.length} boutiques partenaires</p>
      </div>

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
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center pt-8">
              <EmptyState
                icon={Store}
                title="Aucune boutique trouvée"
                description="Essayez un autre filtre ou un autre nom de boutique"
                compact
                action={{ label: "Réinitialiser", onClick: () => { setQuery(""); setFilter({}) } }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
