import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  FlaskConical,
  User,
  Briefcase,
  Store,
  ShieldCheck,
  ShoppingBag,
  X,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { SANDBOX_ROLES, type SandboxRole } from "./bootstrap";
import { useAuthStore } from "../stores/authStore";
import { useAppNavigation } from "../navigation/useAppNavigation";

interface SandboxPage {
  label: string;
  path: string;
}

const ROLE_PAGES: Record<SandboxRole["id"], SandboxPage[]> = {
  client: [
    { label: "Accueil", path: "/" },
    { label: "Rechercher un pro", path: "/search" },
    { label: "Nouvelle demande", path: "/orders/new" },
    { label: "Mes commandes", path: "/orders" },
    { label: "Suivi de mission", path: "/orders/tracker/demo_mission_1" },
    { label: "Messages", path: "/messages" },
    { label: "Favoris", path: "/favorites" },
    { label: "Profil", path: "/profile" },
    { label: "Abonnement", path: "/settings/subscription/plans" },
    { label: "Marketplace", path: "/marketplace" },
  ],
  pro: [
    { label: "Tableau de bord", path: "/pro/dashboard" },
    { label: "Missions", path: "/pro/missions" },
    { label: "Mission détail", path: "/pro/mission/job1" },
    { label: "Messages", path: "/pro/messages" },
    { label: "Services", path: "/pro/services" },
    { label: "Revenus", path: "/pro/revenues" },
    { label: "Abonnement pro", path: "/pro/subscription" },
    { label: "Statistiques", path: "/pro/stats" },
    { label: "Paramètres", path: "/pro/settings" },
  ],
  supplier: [
    { label: "Tableau de bord", path: "/supplier/dashboard" },
    { label: "Produits", path: "/supplier/products" },
    { label: "Nouveau produit", path: "/supplier/products/new" },
    { label: "Commandes", path: "/supplier/orders" },
    { label: "Stock", path: "/supplier/stock" },
    { label: "Statistiques", path: "/supplier/stats" },
    { label: "Livraisons", path: "/supplier/deliveries" },
    { label: "Profil", path: "/supplier/profile" },
    { label: "Réglages", path: "/supplier/settings" },
  ],
  admin: [
    { label: "Tableau de bord", path: "/admin/dashboard" },
    { label: "Clients", path: "/admin/clients" },
    { label: "Pros", path: "/admin/pros" },
    { label: "Missions", path: "/admin/missions" },
    { label: "Paiements", path: "/admin/payments" },
    { label: "Réclamations", path: "/admin/disputes" },
    { label: "Livraisons", path: "/admin/deliveries" },
    { label: "Analyses", path: "/admin/analytics" },
    { label: "Réglages", path: "/admin/settings" },
  ],
  market: [
    { label: "Marketplace", path: "/marketplace" },
    { label: "Explorer", path: "/marketplace/explore" },
    { label: "Boutiques", path: "/marketplace/boutiques" },
    { label: "Catalogue élec", path: "/marketplace/browse/electric" },
    { label: "Panier", path: "/marketplace/cart" },
    { label: "Mes commandes", path: "/marketplace/orders" },
    { label: "Vendre", path: "/marketplace/publish" },
  ],
};

const ROLE_ICONS: Record<SandboxRole["id"], React.ReactNode> = {
  client: <User className="w-4 h-4" />,
  pro: <Briefcase className="w-4 h-4" />,
  supplier: <Store className="w-4 h-4" />,
  admin: <ShieldCheck className="w-4 h-4" />,
  market: <ShoppingBag className="w-4 h-4" />,
};

function currentRoleId(): SandboxRole["id"] {
  const s = useAuthStore.getState();
  if (s.admin) return "admin";
  if (s.activeMode === "supplier") return "supplier";
  if (s.isPro || s.activeMode === "pro") return "pro";
  return "client";
}

export default function SandboxPanel() {
  const { pathname } = useLocation();
  const { goBackTo } = useAppNavigation();
  const [open, setOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<SandboxRole["id"]>(currentRoleId());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const switchRole = (role: SandboxRole) => {
    const auth = useAuthStore.getState();
    auth.adminLogout();
    if (role.id === "admin") {
      auth.adminDemoLogin();
    } else {
      auth.setUser("demo", "client");
      if (role.id === "pro") {
        auth.setPro();
        auth.setActiveMode("pro");
      } else if (role.id === "supplier") {
        auth.setActiveMode("supplier");
      } else {
        auth.setActiveMode("client");
      }
    }
    setActiveRole(role.id);
    setOpen(false);
    goBackTo(role.entry);
  };

  const navigateTo = (path: string) => {
    setOpen(false);
    goBackTo(path);
  };

  const pages = ROLE_PAGES[activeRole];

  return (
    <div ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Panneau sandbox démo"
        className="fixed bottom-24 right-4 z-[70] flex items-center gap-2 pl-3 pr-4 h-11 rounded-full bg-gradient-to-r from-cm-accent to-cm-forest text-white text-[12px] font-bold shadow-lg shadow-cm-accent/30 cursor-pointer hover:opacity-90 active:scale-[0.96] transition-all"
      >
        <FlaskConical className="w-4 h-4" />
        Démo
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-x-4 bottom-24 z-[70] mx-auto max-w-md bg-cm-elevated border border-cm-border rounded-[20px] shadow-2xl overflow-hidden max-h-[70dvh] flex flex-col"
          >
            <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-cm-border/40 bg-cm-bg/60">
              <div>
                <p className="text-[15px] font-extrabold text-cm-text flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-cm-accent" />
                  Sandbox démo
                </p>
                <p className="text-[11px] text-cm-text-muted mt-0.5">
                  Aucune base de données — basculez de rôle et explorez les univers.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer le panneau"
                className="p-1.5 rounded-[10px] text-cm-text-muted cursor-pointer hover:bg-cm-border/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-cm-text-muted mb-2">
                  Choisir un rôle
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SANDBOX_ROLES.map((role) => {
                    const active = role.id === activeRole;
                    const current = role.id === currentRoleId();
                    return (
                      <button
                        key={role.id}
                        onClick={() => switchRole(role)}
                        className={`flex items-start gap-2.5 p-3 rounded-[14px] border text-left cursor-pointer transition-all ${
                          active
                            ? "border-cm-accent bg-cm-accent-soft"
                            : "border-cm-border bg-cm-bg hover:border-cm-accent/40"
                        }`}
                      >
                        <span
                          className={`mt-0.5 p-1.5 rounded-[10px] ${
                            active ? "bg-cm-accent text-white" : "bg-cm-elevated text-cm-text-muted"
                          }`}
                        >
                          {ROLE_ICONS[role.id]}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 text-[12px] font-bold text-cm-text">
                            {role.label}
                            {current && (
                              <span className="text-[9px] font-bold text-cm-accent">●</span>
                            )}
                          </span>
                          <span className="block text-[10px] text-cm-text-muted leading-snug mt-0.5">
                            {role.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-cm-text-muted mb-2 flex items-center gap-1.5">
                  <LayoutGrid className="w-3 h-3" />
                  Pages {SANDBOX_ROLES.find((r) => r.id === activeRole)?.label.toLowerCase()}
                </p>
                <div className="flex flex-col gap-1">
                  {pages.map((page) => {
                    const isCurrent = pathname === page.path;
                    return (
                      <button
                        key={page.path}
                        onClick={() => navigateTo(page.path)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-[12px] text-left text-[12px] cursor-pointer transition-colors ${
                          isCurrent
                            ? "bg-cm-accent-soft text-cm-accent font-bold"
                            : "bg-cm-bg text-cm-text hover:bg-cm-border/20"
                        }`}
                      >
                        <span className="truncate">{page.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-cm-text-muted" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
