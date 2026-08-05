import { useMemo } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Store,
  Plus,
  Package,
  Wrench,
  BadgeCheck,
  Star,
  MapPin,
  ShieldCheck,
  Truck,
  Handshake,
} from "lucide-react";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { MARKETPLACE_CATEGORIES } from "../../data/marketplaceCategories";
import { MARKETPLACE_PRODUCTS } from "../../data/marketplaceProducts";
import { getBoutiques } from "../../data/marketplaceSuppliers";
import { getProductsBySeller } from "../../data/marketplaceProducts";
import CatalogProductCard from "./CatalogProductCard";
import type { MarketplaceVertical } from "../../types/marketplace";

const VERTICAL_META: Record<
  MarketplaceVertical,
  { emoji: string; chip: string; tint: string; text: string }
> = {
  shopping: { emoji: "🛍️", chip: "bg-sky-500/10 text-sky-600", tint: "from-sky-400/20", text: "text-sky-600" },
  second_hand: { emoji: "♻️", chip: "bg-amber-500/10 text-amber-600", tint: "from-amber-400/20", text: "text-amber-600" },
  automobile: { emoji: "🚗", chip: "bg-blue-500/10 text-blue-600", tint: "from-blue-400/20", text: "text-blue-600" },
  real_estate: { emoji: "🏢", chip: "bg-rose-500/10 text-rose-600", tint: "from-rose-400/20", text: "text-rose-600" },
  pro_supply: { emoji: "🧱", chip: "bg-emerald-500/10 text-emerald-600", tint: "from-emerald-400/20", text: "text-emerald-600" },
};

const PUBLISH_ACTION = {
  key: "publier",
  label: "Publier une annonce",
  icon: Plus,
  to: "/marketplace/publish",
  desc: "Vendez en 5 minutes",
};

const QUICK_ACTIONS = [
  { key: "commandes", label: "Commandes", icon: Package, to: "/marketplace/orders", desc: "Suivi des commandes" },
  { key: "boutiques", label: "Boutiques", icon: Store, to: "/marketplace/boutiques", desc: "Pro partenaires" },
];

function BoutiqueWideCard({ boutique, index }: { boutique: ReturnType<typeof getBoutiques>[number]; index: number }) {
  const { navigate } = useAppNavigation();
  const previews = getProductsBySeller(boutique.id)
    .filter((p) => p.status === "active")
    .slice(0, 3);

  return (
    <motion.button
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
      onClick={() => navigate(`/marketplace/shop/${boutique.id}`)}
      className="w-72 shrink-0 snap-start bg-cm-elevated border border-cm-border rounded-2xl overflow-hidden shadow-cm-card active:scale-[0.97] transition-all cursor-pointer text-left flex flex-col"
    >
      <div className="relative h-24 bg-gradient-to-br from-cm-accent/20 to-cm-forest/10 shrink-0">
        {boutique.banner ? (
          <img src={boutique.banner} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {boutique.verified && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 text-cm-forest text-[9px] font-bold shadow-sm">
            <BadgeCheck className="w-3 h-3 text-cm-green" />
            Certifiée Ça Match
          </span>
        )}
        <div className="absolute -bottom-5 left-3 w-10 h-10 rounded-xl border-2 border-cm-elevated overflow-hidden bg-cm-surface flex items-center justify-center shadow-md">
          {boutique.logo ? (
            <img src={boutique.logo} alt={boutique.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <Store className="w-4 h-4 text-cm-text-muted" />
          )}
        </div>
      </div>
      <div className="px-3.5 pt-6 pb-3 flex-1">
        <h3 className="text-[13px] font-bold text-cm-text line-clamp-1">{boutique.name}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="flex items-center gap-0.5 text-[10px] text-cm-text-soft">
            <Star className="w-3 h-3 fill-cm-amber text-cm-amber" />
            <span className="font-semibold">{boutique.rating.toFixed(1)}</span>
          </span>
          <span className="text-cm-text-muted text-[9px]">·</span>
          <span className="flex items-center gap-0.5 text-[10px] text-cm-text-soft">
            <MapPin className="w-3 h-3" /> {boutique.city}
          </span>
        </div>
        <p className="text-[10px] text-cm-text-soft mt-1.5 line-clamp-2 leading-snug">
          {boutique.description || `Boutique à ${boutique.city}`}
        </p>
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-1 mt-2.5">
            {previews.map((p) => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-cm-surface">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-3.5 h-3.5 text-cm-text-muted" />
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

export default function MarketplaceHome() {
  const { navigate } = useAppNavigation();

  const boutiques = useMemo(() => getBoutiques().slice(0, 4), []);
  const products = useMemo(() => MARKETPLACE_PRODUCTS.filter((p) => p.status === "active").slice(0, 6), []);

  return (
    <div className="flex-1 pb-8">
      {/* Hero */}
      <section className="px-4 pt-5 pb-6">
        <div className="relative overflow-hidden rounded-3xl bg-cm-forest text-white px-5 pt-6 pb-5 shadow-cm-card">
          <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-cm-accent/20 blur-2xl" />
          <div className="absolute bottom-0 right-4 text-6xl opacity-15 select-none">🛒</div>
          <p className="text-[11px] font-semibold text-cm-accent uppercase tracking-widest mb-1.5">Ça Match · Marché</p>
          <h1 className="h1-cm text-white leading-tight">Tout pour vous,<br />directement en ville</h1>
          <p className="text-[12px] text-white/70 mt-2 max-w-[260px] leading-relaxed">
            Neuf, seconde main, véhicules, immobilier ou fournitures pro — trouvez tout près de chez vous.
          </p>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {[
              { icon: ShieldCheck, label: "Paiement sécurisé" },
              { icon: BadgeCheck, label: "Vendeurs vérifiés" },
              { icon: Truck, label: "Livraison" },
              { icon: Handshake, label: "Remise en main propre" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-[10px] font-medium text-white/90"
              >
                <Icon className="w-3 h-3 text-cm-accent" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Univers */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="h3-cm text-cm-text">Parcourir par univers</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {MARKETPLACE_CATEGORIES.map((cat, i) => {
            const meta = VERTICAL_META[cat.vertical];
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25, ease: "easeOut" }}
                onClick={() => navigate(`/marketplace/browse/${cat.id}`)}
                className={`text-left rounded-2xl p-3 bg-cm-elevated border border-cm-border shadow-cm-card active:scale-[0.97] transition-all hover:border-cm-accent/40 cursor-pointer overflow-hidden relative`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.tint} to-transparent`} />
                <div className="relative">
                  <span className="text-xl leading-none">{meta.emoji}</span>
                  <h3 className="text-[13px] font-bold text-cm-text mt-2">{cat.name}</h3>
                  <p className="text-[10px] text-cm-text-soft mt-0.5 line-clamp-1">{cat.description}</p>
                  <span className="inline-flex items-center gap-0.5 mt-2 text-[10px] font-semibold text-cm-forest">
                    Découvrir <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Actions rapides */}
      <section className="px-4 mt-6">
        <motion.button
          key={PUBLISH_ACTION.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(PUBLISH_ACTION.to)}
          className="relative w-full overflow-hidden rounded-2xl bg-cm-forest text-white border border-cm-forest shadow-cm-btn p-5 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer text-left"
        >
          <div className="absolute -top-10 -right-8 w-32 h-32 rounded-full bg-cm-accent/25 blur-2xl" />
          <span className="relative w-12 h-12 rounded-xl bg-cm-accent/25 border border-cm-accent/40 flex items-center justify-center shrink-0">
            <Plus className="w-6 h-6 text-cm-accent" />
          </span>
          <span className="relative flex-1 min-w-0">
            <span className="block text-[16px] font-extrabold leading-tight">{PUBLISH_ACTION.label}</span>
            <span className="block text-[12px] text-white/65 mt-0.5">{PUBLISH_ACTION.desc}</span>
          </span>
          <ArrowRight className="relative w-5 h-5 text-cm-accent shrink-0" />
        </motion.button>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {QUICK_ACTIONS.map(({ key, label, icon: Icon, to, desc }) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(to)}
              className={`rounded-2xl p-2.5 text-left border active:scale-95 transition-all cursor-pointer flex flex-col bg-cm-elevated border-cm-border shadow-cm-card hover:border-cm-accent/40`}
            >
              <Icon className={`w-5 h-5 text-cm-forest`} />
              <span className={`text-[11px] font-bold mt-2 text-cm-text`}>{label}</span>
              <span className={`text-[9px] text-cm-text-muted`}>{desc}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Boutiques populaires */}
      {boutiques.length > 0 && (
        <section className="mt-7">
          <div className="px-4 flex items-center justify-between mb-3">
            <h2 className="h3-cm text-cm-text">Boutiques populaires</h2>
            <button
              onClick={() => navigate("/marketplace/boutiques")}
              className="inline-flex items-center gap-0.5 text-[11px] font-bold text-cm-forest active:opacity-60 cursor-pointer"
            >
              Tout voir <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none snap-x">
            {boutiques.map((b, i) => (
              <BoutiqueWideCard key={b.id} boutique={b} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Dernières annonces */}
      {products.length > 0 && (
        <section className="mt-7 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="h3-cm text-cm-text">Dernières annonces</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p, i) => (
              <CatalogProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* CTA vendeur */}
      <section className="px-4 mt-7">
        <div className="rounded-3xl border border-cm-border bg-cm-elevated p-5 flex items-center gap-4 shadow-cm-card">
          <div className="w-12 h-12 rounded-2xl bg-cm-accent/20 border border-cm-accent/30 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6 text-cm-forest" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-cm-text">Un objet à vendre ?</h3>
            <p className="text-[11px] text-cm-text-soft mt-0.5">Publiez une annonce en quelques minutes.</p>
          </div>
          <button
            onClick={() => navigate("/marketplace/publish")}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-cm-text text-white text-[12px] font-bold active:scale-95 transition-transform cursor-pointer shrink-0"
          >
            Publier <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
}
