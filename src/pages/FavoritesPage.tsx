import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MapPin, Star, Briefcase, Package, Store } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { useFavoritesStore, type FavoriteItem, type FavoriteType } from "../stores/favoritesStore";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const SECTION_META: Record<FavoriteType, { label: string; icon: typeof Briefcase }> = {
  pro: { label: "Professionnels", icon: Briefcase },
  product: { label: "Produits", icon: Package },
  boutique: { label: "Boutiques", icon: Store },
};

function FavoriteRow({ item, onOpen }: { item: FavoriteItem; onOpen: () => void }) {
  const remove = useFavoritesStore((s) => s.remove);

  return (
    <motion.button variants={fadeUp} onClick={onOpen}
      className="w-full flex items-center gap-3 p-3 bg-cm-elevated rounded-[var(--radius-cm)] border border-cm-border text-left cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="w-14 h-14 rounded-[14px] bg-cm-surface border border-cm-border shrink-0 overflow-hidden flex items-center justify-center">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <Heart className="w-5 h-5 text-cm-text-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-bold text-cm-text truncate">{item.name}</h3>
        {item.subtitle && (
          <p className="text-[11px] text-cm-text-soft truncate mt-0.5">{item.subtitle}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {item.rating !== undefined && item.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {item.rating.toFixed(1)}
            </span>
          )}
          {item.priceLabel && (
            <span className="text-[11px] font-bold text-cm-accent">{item.priceLabel}</span>
          )}
        </div>
      </div>
      <div
        role="button"
        aria-label="Retirer des favoris"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          remove(item.type, item.id);
        }}
        className="w-9 h-9 rounded-full bg-cm-surface border border-cm-border flex items-center justify-center cursor-pointer active:scale-90 transition-transform shrink-0"
      >
        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
      </div>
    </motion.button>
  );
}

export default function FavoritesPage() {
  const nav = useNavigate();
  const items = useFavoritesStore((s) => s.items);

  const groups = useMemo(() => {
    const order: FavoriteType[] = ["pro", "product", "boutique"];
    return order
      .map((type) => ({
        type,
        items: (items ?? []).filter((i) => i.type === type),
      }))
      .filter((g) => g.items.length > 0);
  }, [items]);

  const total = (items ?? []).length;

  return (
    <div className="min-h-dynamic bg-cm-bg pb-10">
      <PageHeader title="Mes favoris" fallbackRoute="/" subtitle={total > 0 ? `${total} favori(s)` : undefined} />

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center pt-16 px-8">
          <div className="w-16 h-16 rounded-[20px] bg-cm-elevated border border-cm-border flex items-center justify-center mb-4 shadow-sm">
            <Heart className="w-7 h-7 text-cm-text-muted" />
          </div>
          <p className="text-[15px] font-bold text-cm-text mb-1">Aucun favori</p>
          <p className="text-[12px] text-cm-text-muted text-center leading-relaxed">
            Touchez le cœur sur un professionnel, un produit ou une boutique pour le retrouver ici.
          </p>
          <button onClick={() => nav("/")}
            className="mt-5 h-11 px-6 rounded-[14px] bg-cm-text text-white text-[12px] font-bold cursor-pointer active:scale-95 transition-transform">
            Explorer
          </button>
        </div>
      ) : (
        <div className="px-4 pt-3">
          <AnimatePresence mode="wait">
            <motion.div key="list" variants={container} initial="hidden" animate="show" className="space-y-5">
              {groups.map((group) => {
                const meta = SECTION_META[group.type];
                const Icon = meta.icon;
                return (
                  <div key={group.type}>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Icon className="w-3.5 h-3.5 text-cm-text-muted" />
                      <h2 className="text-[13px] font-bold text-cm-text">{meta.label}</h2>
                      <span className="text-[10px] text-cm-text-muted font-medium bg-cm-elevated px-1.5 py-0.5 rounded-full">{group.items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <FavoriteRow key={`${item.type}-${item.id}`} item={item} onOpen={() => nav(item.route)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
