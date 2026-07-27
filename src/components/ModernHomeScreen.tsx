import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, Menu, ClipboardPlus, Store, Briefcase, UserPlus, X } from "lucide-react";
import SponsoredCard from "./SponsoredCard";
import type { SponsoredItem } from "./SponsoredCard";
import HamburgerDrawer from "./HamburgerDrawer";
import NotificationBell from "./ui/NotificationBell";
import NotificationPanel from "./ui/NotificationPanel";
import { useNotificationStore } from "../stores/notificationStore";
import { useLocationStore, LOCATIONS } from "../stores/locationStore";
import { cardAppear } from "../animations/variants";

const MENU_ITEMS = [
  {
    id: "professionnel",
    label: "Services professionnels",
    icon: Briefcase,
    route: "/professionals",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=300&fit=crop",
    description: "Trouver un professionnel pour vos besoins du quotidien.",
    categories: ["Plomberie", "Électricité", "BTP", "Beauté", "Services locaux"],
    ctaLabel: "Explorer les professionnels",
  },
  {
    id: "freelance",
    label: "Freelance",
    icon: UserPlus,
    route: "/freelance",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
    description: "Trouver des experts digitaux pour vos projets.",
    categories: ["Développement", "Design", "Marketing", "Rédaction", "Conseil"],
    ctaLabel: "Trouver un freelance",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: Store,
    route: "/marketplace",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop",
    description: "Acheter, vendre et découvrir des produits.",
    categories: ["Électronique", "Immobilier", "Seconde main", "Maison"],
    ctaLabel: "Explorer",
  },
] as const;

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
    id: "sp-6",
    name: "Propre+ Ménage",
    category: "Nettoyage",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop",
    tagline: "Nettoyage professionnel rapide",
    link: "/marketplace/shop/seller-pro-3",
    size: "small",
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

export default function ModernHomeScreen() {
  const nav = useNavigate();
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

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-[#F5F5F5]">
      {/* ── Header ── */}
      <header className="px-3 pt-3 pb-1 bg-[#F5F5F5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[20px] leading-none">🌿</span>
            <span className="text-[#2B2B2B] text-[18px] font-extrabold tracking-tight">CaMatch</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell unreadCount={unreadCount} onClick={() => setShowNotifications(true)} variant="client" />
            <button
              onClick={() => setShowDrawer(true)}
              className="w-8 h-8 rounded-full bg-[rgba(43,43,43,0.08)] backdrop-blur-sm border border-[rgba(43,43,43,0.10)] flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              aria-label="Menu"
            >
              <Menu className="w-4 h-4 text-[#2B2B2B]" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowLocationPicker(true)}
          className="flex items-center gap-1 text-[12px] font-semibold text-[#2B2B2B]/70 cursor-pointer active:scale-95 transition-transform mt-1 ml-0.5"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate max-w-[160px]">{neighborhood}</span>
        </button>
      </header>

      {/* ── Explorer ── */}
      <section className="px-3 pt-3 pb-1">
        <h2 className="text-[16px] font-bold text-[#2B2B2B] mb-3">Que recherchez-vous ?</h2>
        <div className="space-y-3">
          {MENU_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              variants={cardAppear}
              initial="hidden"
              animate="visible"
              custom={i}
              className="rounded-[16px] overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200/60"
            >
              <button
                onClick={() => nav(item.route)}
                className="relative w-full h-[120px] overflow-hidden cursor-pointer text-left group"
              >
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/95 via-[#1a1a1a]/40 to-[#1a1a1a]/20" />
                <div className="relative z-10 flex flex-col items-start justify-between h-full p-3.5">
                  <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[13px] font-extrabold text-white leading-tight">{item.label}</span>
                </div>
              </button>
              <div className="px-3.5 py-3">
                <p className="text-[12px] text-[#2B2B2B]/60 leading-relaxed mb-2.5">{item.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.categories.map((cat) => (
                    <span key={cat} className="text-[10px] font-semibold text-[#2B2B2B]/50 bg-[#2B2B2B]/5 rounded-full px-2 py-0.5">
                      {cat}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => nav(item.route)}
                  className="w-full py-2 rounded-[10px] bg-[#7FD356]/15 text-[#2B2B2B] text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] transition-all"
                >
                  {item.ctaLabel}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Créer une demande ── */}
      <section className="px-3 pt-3 pb-1">
        <motion.div
          variants={cardAppear}
          initial="hidden"
          animate="visible"
          custom={3}
          className="rounded-[16px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200/60"
        >
          <h3 className="text-[14px] font-bold text-[#2B2B2B]">Besoin d'une solution précise ?</h3>
          <p className="text-[12px] text-[#2B2B2B]/60 mt-1 leading-relaxed">
            Décrivez votre besoin et recevez des propositions de professionnels adaptées.
          </p>
          <button
            onClick={() => nav("/orders/new")}
            className="w-full mt-3 py-2.5 rounded-[12px] bg-[#7FD356] text-[#2B2B2B] text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all"
          >
            <ClipboardPlus className="w-4 h-4" />
            Créer une demande
          </button>
        </motion.div>
      </section>

      {/* ── Search Bar ── */}
      <section className="px-3 pt-2 pb-1">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none z-10">
            <div className="w-8 h-8 rounded-full bg-[#7FD356] flex items-center justify-center">
              <Search className="w-4 h-4 text-[#2B2B2B]" />
            </div>
          </div>
          <input
            type="text"
            className="w-full h-13 pl-[52px] pr-4 text-[14px] bg-white rounded-[14px] outline-none text-[#2B2B2B] placeholder:text-[#2B2B2B]/40 font-medium shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200/60 transition-all focus-within:ring-2 focus-within:ring-[#7FD356]/40 focus-within:border-[#7FD356]/30"
            placeholder="Rechercher plombier..."
            onFocus={() => nav("/search")}
            readOnly
          />
        </div>
      </section>

      {/* ── Sponsored Section ── */}
      <section className="px-3 pt-2 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7FD356]" />
          <h2 className="text-[16px] font-bold text-[#2B2B2B]">Sponsorisé</h2>
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
                <h3 className="text-[15px] font-semibold text-[#2B2B2B]">Changer de localisation</h3>
                <button
                  onClick={() => setShowLocationPicker(false)}
                  className="w-9 h-9 rounded-full bg-[rgba(43,43,43,0.08)] backdrop-blur-sm border border-[rgba(43,43,43,0.10)] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#2B2B2B]" />
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
                        isActive ? "bg-[#7FD356]/20 text-[#2B2B2B]" : "text-[#2B2B2B] hover:bg-gray-50"
                      }`}
                    >
                      <MapPin className={`w-4 h-4 ${isActive ? "text-[#7FD356]" : "text-gray-400"}`} />
                      <span className="flex-1">{loc}</span>
                      {isActive && <span className="text-[10px] text-[#7FD356] font-semibold mr-1">✓</span>}
                    </button>
                  );
                })}
              </div>
              {locStatus === "locating" ? (
                <div className="w-full mt-4 py-3 bg-[#7FD356]/20 rounded-[12px] text-[13px] font-medium text-[#2B2B2B] flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#7FD356] border-t-transparent rounded-full animate-spin" />
                  Détection en cours...
                </div>
              ) : locStatus === "available" ? (
                <div className="w-full mt-4 space-y-2">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#7FD356]/20 rounded-[12px]">
                    <div className="flex items-center gap-2 text-[12px] text-[#2B2B2B]">
                      <span className={`w-2 h-2 rounded-full ${geocodingSource === "nominatim" ? "bg-green-500" : "bg-amber-500"}`} />
                      {geocodingSource === "nominatim" ? "Position précise (GPS)" : "Position estimée"}
                    </div>
                    {gpsAccuracy != null && (
                      <span className="text-[11px] text-gray-500 font-mono">±{Math.round(gpsAccuracy)} m</span>
                    )}
                  </div>
                  <button
                    onClick={() => refreshLocation()}
                    className="w-full py-2.5 bg-[#7FD356]/20 border border-[#7FD356]/30 rounded-[12px] text-[12px] font-medium text-[#2B2B2B] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Rafraîchir ma position
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { refreshLocation(); setShowLocationPicker(false); }}
                  className="w-full mt-4 py-3 bg-[#7FD356]/20 rounded-[12px] text-[13px] font-medium text-[#2B2B2B] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all"
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
