import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, Menu, ClipboardPlus, Store, UserPlus, X, Star, ChevronRight, Heart } from "lucide-react";
import SponsoredCard from "./SponsoredCard";
import type { SponsoredItem } from "./SponsoredCard";
import HamburgerDrawer from "./HamburgerDrawer";
import NotificationBell from "./ui/NotificationBell";
import NotificationPanel from "./ui/NotificationPanel";
import { useNotificationStore } from "../stores/notificationStore";
import { useLocationStore, LOCATIONS } from "../stores/locationStore";
import { useAuthStore } from "../stores/authStore";
import { useFavoritesStore, type FavoriteItem } from "../stores/favoritesStore";
import { categoriesWithPros } from "../data/serviceTrades";
import { getAllFreelancers } from "../data/freelanceCategories";
import { formatPriceLabel } from "../data/pricing";
import { SEARCH_BRANCHES } from "../data/searchMenu";
import { getBoutiques } from "../data/marketplaceSuppliers";
import { MARKETPLACE_PRODUCTS } from "../data/marketplaceProducts";
import { cardAppear } from "../animations/variants";
import { useAppNavigation } from "../navigation/useAppNavigation";

const HERO_CARDS = [
  {
    id: "freelance",
    label: "Freelance",
    icon: UserPlus,
    route: "/freelance",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
    description: "Experts digitaux pour vos projets",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: Store,
    route: "/marketplace",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop",
    description: "Produits, immobilier, occasion",
  },
] as const;

const POPULAR_PRODUCT_IDS = ["mp-25", "mp-27", "mp-26", "mp-32", "mp-31", "mp-28"];

const TYPE_LABEL: Record<FavoriteItem["type"], string> = { pro: "Pro", product: "Produit", boutique: "Boutique" };

const SPONSORED_ITEMS: SponsoredItem[] = [
  {
    id: "sp-1",
    name: "Quincaillerie du Plateau",
    category: "Quincaillerie",
    image: "https://images.unsplash.com/photo-1567721913486-6585f069b332?w=600&h=300&fit=crop",
    tagline: "Tout pour vos travaux et rénovations",
    link: "/marketplace/shop/seller-pro-1",
    size: "large",
  },
  {
    id: "sp-2",
    name: "Boutique Yopougon",
    category: "Épicerie",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
    tagline: "Produits frais et articles quotidiens",
    link: "/marketplace/shop/seller-pro-2",
    size: "medium",
  },
  {
    id: "sp-3",
    name: "Plomberie Express Abidjan",
    category: "Plomberie",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    tagline: "Dépannage 7j/7 - Intervention rapide",
    link: "/marketplace/shop/seller-pro-6",
    size: "small",
  },
  {
    id: "sp-6",
    name: "Propre+ Ménage",
    category: "Nettoyage",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop",
    tagline: "Nettoyage professionnel rapide",
    link: "/marketplace/shop/seller-pro-3",
    size: "small",
  },
  {
    id: "sp-4",
    name: "Clinique Dentaire Deux Plateaux",
    category: "Santé",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop",
    tagline: "Soins dentaires de qualité",
    link: "/marketplace/shop/seller-pro-7",
    size: "medium",
  },
  {
    id: "sp-5",
    name: "Super Marché Cocody",
    category: "Supermarché",
    image: "https://images.unsplash.com/photo-1484712401471-05c7215830eb?w=600&h=300&fit=crop",
    tagline: "Le meilleur rapport qualité-prix",
    link: "/marketplace/shop/seller-pro-1",
    size: "large",
  },
  {
    id: "sp-7",
    name: "Électricien Pro Abidjan",
    category: "Électricité",
    image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=300&fit=crop",
    tagline: "Installation, dépannage et rénovation",
    link: "/marketplace/shop/seller-pro-7",
    size: "medium",
  },
  {
    id: "sp-8",
    name: "Coiffure Excellence",
    category: "Beauté",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=300&fit=crop",
    tagline: "Coupes, tresses et soins capillaires",
    link: "/marketplace/shop/seller-pro-8",
    size: "large",
  },
];

function SectionHeader({ label, onViewAll, badge }: { label: string; onViewAll?: () => void; badge?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <h2 className="text-[15px] font-bold text-cm-text tracking-tight">{label}</h2>
        {badge && (
          <span className="text-[9px] font-bold text-cm-text bg-cm-accent/20 px-1.5 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      {onViewAll && (
        <button onClick={onViewAll} className="text-[11px] font-semibold text-cm-accent flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform">
          Voir tout <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default function ModernHomeScreen() {
  const { navigate: nav } = useAppNavigation();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
  const neighborhood = useLocationStore((s) => s.neighborhood);
  const locStatus = useLocationStore((s) => s.status);
  const gpsAccuracy = useLocationStore((s) => s.gpsAccuracy);
  const geocodingSource = useLocationStore((s) => s.geocodingSource);
  const refreshLocation = useLocationStore((s) => s.refreshLocation);
  const setNeighborhood = useLocationStore((s) => s.setNeighborhood);
  const authUser = useAuthStore((s) => s.user);
  const firstName = authUser?.user_metadata?.firstName || authUser?.email?.split("@")[0] || "Jessica";

  const featuredFreelancers = getAllFreelancers().sort((a, b) => b.rating - a.rating).slice(0, 6);
  const featuredBoutiques = getBoutiques().slice(0, 6);
  const popularProducts = POPULAR_PRODUCT_IDS
    .map((id) => MARKETPLACE_PRODUCTS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const favoriteItems = useFavoritesStore((s) => s.items)
    .slice()
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg">
      {/* ── Header ── */}
      <header className="px-3 pt-3 pb-1 bg-cm-bg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] bg-cm-accent flex items-center justify-center">
              <span className="text-[14px] font-extrabold text-cm-text leading-none">C</span>
            </div>
            <span className="text-cm-text text-[18px] font-extrabold tracking-tight">CaMatch</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell unreadCount={unreadCount} onClick={() => setShowNotifications(true)} variant="client" />
            <button
              onClick={() => nav("/favorites")}
              className="relative w-8 h-8 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              aria-label="Mes favoris"
            >
              <Heart className="w-5 h-5 text-cm-text" />
              {favoriteItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-cm-error rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-cm-bg px-0.5">
                  {favoriteItems.length > 99 ? "99+" : favoriteItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowDrawer(true)}
              className="w-8 h-8 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              aria-label="Menu"
            >
              <Menu className="w-4 h-4 text-cm-text" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowLocationPicker(true)}
          className="flex items-center gap-1 text-[12px] font-semibold text-cm-text/70 cursor-pointer active:scale-95 transition-transform mt-1 ml-0.5"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate max-w-[160px]">{neighborhood}</span>
        </button>
      </header>

      {/* ── Greeting ── */}
      <section className="px-3 pt-2">
        <h1 className="text-[20px] font-extrabold text-cm-text tracking-tight text-balance">
          Bonjour{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="text-[12px] text-cm-text-muted mt-0.5">Que pouvons-nous faire pour vous aujourd'hui ?</p>
      </section>

      {/* ── Search bar (héro) ── */}
      <section className="px-3 pt-4">
        <button
          onClick={() => nav("/search")}
          className="w-full h-12 pl-3.5 pr-4 bg-cm-elevated rounded-[14px] border border-cm-border-soft shadow-cm-sm flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
        >
          <Search className="w-5 h-5 text-cm-text-muted shrink-0" />
          <span className="flex-1 text-left text-[14px] font-medium text-cm-text-muted truncate">
            Rechercher un service, un produit, un pro...
          </span>
        </button>
      </section>

      {/* ── Chips rapides : 9 branches ── */}
      <section className="px-3 pt-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {SEARCH_BRANCHES.map((branch) => (
            <button
              key={branch.id}
              onClick={() => nav(`/search?branch=${branch.id}`)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-cm-elevated border border-cm-border text-[11px] font-semibold text-cm-text cursor-pointer active:scale-95 transition-all hover:border-cm-accent/60"
            >
              <span className="text-[14px] leading-none">{branch.icon}</span>
              <span>{branch.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── CTA Créer une demande ── */}
      <section className="px-3 pt-3">
        <button
          onClick={() => nav("/orders/new")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] bg-cm-text text-white cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <ClipboardPlus className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <span className="block text-[13px] font-bold leading-tight">Créer une demande</span>
            <span className="block text-[10px] text-white/70 mt-0.5 truncate">Décrivez votre besoin, recevez des propositions</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />
        </button>
      </section>

      {/* ── Vos favoris ── */}
      {favoriteItems.length > 0 && (
        <section className="pt-6">
          <div className="px-3">
            <SectionHeader label="Vos favoris" badge={`${favoriteItems.length}`} onViewAll={() => nav("/favorites")} />
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-3 pb-1">
            {favoriteItems.slice(0, 6).map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => nav(item.route)}
                className="shrink-0 w-44 bg-cm-elevated border border-cm-border rounded-2xl p-3 text-left cursor-pointer active:scale-[0.97] transition-transform hover:border-cm-accent/40"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-cm-border bg-cm-surface flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Heart className="w-4 h-4 text-cm-text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[12px] font-bold text-cm-text truncate">{item.name}</h3>
                    <p className="text-[10px] text-cm-text-soft truncate">{item.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-cm-border/50">
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-cm-amber">
                    <Star className="w-2.5 h-2.5 fill-cm-amber text-cm-amber" />
                    {item.rating != null ? item.rating.toFixed(1) : "★"}
                  </span>
                  <span className="text-[10px] font-bold text-cm-forest truncate max-w-[80px]">
                    {item.priceLabel ?? TYPE_LABEL[item.type]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Hero 2-col : Freelance | Marketplace ── */}
      <section className="px-3 pt-4">
        <div className="grid grid-cols-2 gap-3">
          {HERO_CARDS.map((item, i) => (
            <motion.div
              key={item.id}
              variants={cardAppear}
              initial="hidden"
              animate="visible"
              custom={i}
              className="rounded-[20px] overflow-hidden bg-cm-elevated shadow-cm-card border border-cm-border-soft"
            >
              <button onClick={() => nav(item.route)} className="relative w-full h-[120px] overflow-hidden cursor-pointer text-left group">
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="relative z-10 flex flex-col items-start justify-between h-full p-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="block text-[13px] font-extrabold text-white leading-tight">{item.label}</span>
                    <span className="hidden md:block text-[9px] text-white/80 mt-0.5 leading-tight">{item.description}</span>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Recommandé : Services à domicile ── */}
      <section className="px-3 pt-6">
        <SectionHeader label="Services à domicile" badge="Abidjan" onViewAll={() => nav("/professionals")} />
        <div className="grid grid-cols-4 gap-2.5">
          {categoriesWithPros().map((cat) => (
            <button
              key={cat.id}
              onClick={() => nav(`/professionals?category=${cat.id}`)}
              className="flex flex-col items-center gap-1.5 px-1 py-3 rounded-[16px] bg-cm-elevated border border-cm-border-soft cursor-pointer active:scale-95 transition-all"
            >
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-cm-accent/20 to-cm-bg flex items-center justify-center text-[16px]">
                {cat.icon}
              </span>
              <span className="text-[9px] font-semibold text-cm-text text-center leading-tight line-clamp-2">{cat.name}</span>
            </button>
          ))}
          <button
            onClick={() => nav("/professionals")}
            className="flex flex-col items-center justify-center gap-1.5 px-1 py-3 rounded-[16px] bg-cm-accent/10 border border-dashed border-cm-accent/40 cursor-pointer active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-cm-accent" />
            <span className="text-[9px] font-bold text-cm-accent text-center leading-tight">Tout voir</span>
          </button>
        </div>
      </section>

      {/* ── Recommandé : Freelances en vedette ── */}
      <section className="pt-6">
        <div className="px-3">
          <SectionHeader label="Freelances en vedette" onViewAll={() => nav("/freelance")} />
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-3 pb-1">
          {featuredFreelancers.map((pro) => (
            <button
              key={pro.id}
              onClick={() => nav(`/explorer/pro/${pro.id}`)}
              className="shrink-0 w-44 bg-cm-elevated border border-cm-border rounded-2xl p-3 text-left cursor-pointer active:scale-[0.97] transition-transform hover:border-cm-accent/40"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-cm-border">
                  <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" loading="lazy" />
                  {pro.verified && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-cm-green rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 12 12" className="w-2 text-white" fill="none"><path d="M3 6L5 8L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[12px] font-bold text-cm-text truncate">{pro.name}</h3>
                  <p className="text-[10px] text-cm-text-soft truncate">{pro.title}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-cm-border/50">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-cm-amber">
                  <Star className="w-2.5 h-2.5 fill-cm-amber text-cm-amber" />{pro.rating}
                </span>
                <span className="text-[10px] font-bold text-cm-forest truncate max-w-[60%]">{formatPriceLabel(pro.hourlyRate)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Recommandé : Boutiques d'Abidjan ── */}
      <section className="pt-6">
        <div className="px-3">
          <SectionHeader label="Boutiques d'Abidjan" onViewAll={() => nav("/marketplace/boutiques")} />
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-3 pb-1">
          {featuredBoutiques.map((shop) => (
            <button
              key={shop.id}
              onClick={() => nav(`/marketplace/shop/${shop.id}`)}
              className="shrink-0 w-44 bg-cm-elevated border border-cm-border rounded-2xl p-3 text-left cursor-pointer active:scale-[0.97] transition-transform hover:border-cm-accent/40"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-cm-border bg-cm-surface flex items-center justify-center">
                  {shop.logo ? (
                    <img src={shop.logo} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Store className="w-4 h-4 text-cm-text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[12px] font-bold text-cm-text truncate">{shop.name}</h3>
                  <p className="text-[10px] text-cm-text-soft truncate flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />{shop.city}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-cm-border/50">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-cm-amber">
                  <Star className="w-2.5 h-2.5 fill-cm-amber text-cm-amber" />{shop.rating > 0 ? shop.rating.toFixed(1) : "Nouveau"}
                </span>
                {shop.buyOnline && (
                  <span className="text-[9px] font-semibold text-cm-forest bg-cm-green/15 px-1.5 py-0.5 rounded-full">En ligne</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Recommandé : Produits populaires ── */}
      <section className="pt-6">
        <div className="px-3">
          <SectionHeader label="Produits populaires" onViewAll={() => nav("/marketplace")} />
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-3 pb-1">
          {popularProducts.map((prod) => (
            <button
              key={prod.id}
              onClick={() => nav(`/marketplace/item/${prod.id}`)}
              className="shrink-0 w-36 bg-cm-elevated border border-cm-border rounded-2xl overflow-hidden text-left cursor-pointer active:scale-[0.97] transition-transform hover:border-cm-accent/40"
            >
              <div className="h-20 overflow-hidden bg-cm-surface">
                <img src={prod.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-2.5">
                <h3 className="text-[11px] font-bold text-cm-text leading-tight line-clamp-2">{prod.name}</h3>
                <p className="text-[11px] font-bold text-cm-accent mt-1">{prod.price.toLocaleString()} F</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Sponsored Section ── */}
      <section className="px-3 pt-6 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-cm-accent" />
          <h2 className="text-[15px] font-bold text-cm-text tracking-tight">Sponsorisé</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {SPONSORED_ITEMS.map((item, i) => (
              <SponsoredCard key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Notifications ── */}
      <NotificationPanel open={showNotifications} onClose={() => setShowNotifications(false)} variant="sheet" />

      {/* ── Hamburger Drawer ── */}
      <HamburgerDrawer open={showDrawer} onClose={() => setShowDrawer(false)} />

      {/* ── Location Picker ── */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setShowLocationPicker(false)}
          >
            <div className="fixed inset-0 bg-black/40" />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-t-[20px] p-5 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-cm-text">Changer de localisation</h3>
                <button
                  onClick={() => setShowLocationPicker(false)}
                  className="w-9 h-9 rounded-full bg-cm-glass-dark-bg backdrop-blur-sm border border-cm-glass-dark-border flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 text-cm-text" />
                </button>
              </div>
              <div className="space-y-1">
                {LOCATIONS.map((loc) => {
                  const hood = loc.split(",")[1]?.trim() || "";
                  const isActive = neighborhood === hood;
                  return (
                    <button
                      key={loc}
                      onClick={() => { setNeighborhood(hood); setShowLocationPicker(false); }}
                      className={`w-full text-left px-4 py-3 rounded-[12px] text-[13px] font-medium transition-all cursor-pointer flex items-center gap-3 ${
                        isActive ? "bg-cm-accent/20 text-cm-text" : "text-cm-text hover:bg-cm-surface"
                      }`}
                    >
                      <MapPin className={`w-4 h-4 ${isActive ? "text-cm-accent" : "text-cm-text-muted"}`} />
                      <span className="flex-1">{loc}</span>
                      {isActive && <span className="text-[10px] text-cm-accent font-semibold mr-1">✓</span>}
                    </button>
                  );
                })}
              </div>
              {locStatus === "locating" ? (
                <div className="w-full mt-4 py-3 bg-cm-accent/20 rounded-[12px] text-[13px] font-medium text-cm-text flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-cm-accent border-t-transparent rounded-full animate-spin" />
                  Détection en cours...
                </div>
              ) : locStatus === "available" ? (
                <div className="w-full mt-4 space-y-2">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-cm-accent/20 rounded-[12px]">
                    <div className="flex items-center gap-2 text-[12px] text-cm-text">
                      <span className={`w-2 h-2 rounded-full ${geocodingSource === "nominatim" ? "bg-green-500" : "bg-amber-500"}`} />
                      {geocodingSource === "nominatim" ? "Position précise (GPS)" : "Position estimée"}
                    </div>
                    {gpsAccuracy != null && (
                      <span className="text-[11px] text-cm-text-muted font-mono">±{Math.round(gpsAccuracy)} m</span>
                    )}
                  </div>
                  <button
                    onClick={() => refreshLocation()}
                    className="w-full py-2.5 bg-cm-accent/20 border border-cm-accent/30 rounded-[12px] text-[12px] font-medium text-cm-text flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Rafraîchir ma position
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { refreshLocation(); setShowLocationPicker(false); }}
                  className="w-full mt-4 py-3 bg-cm-accent/20 rounded-[12px] text-[13px] font-medium text-cm-text flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all"
                >
                  <MapPin className="w-4 h-4" /> Détecter ma position
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
