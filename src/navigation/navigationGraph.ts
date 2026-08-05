import { matchPath } from "react-router-dom";

/**
 * NAVIGATION GRAPH — Ça Match
 *
 * Source unique de vérité pour la navigation : chaque route définit
 * son parent logique, son fallback (destination quand il n'y a pas
 * d'historique in-app), son rôle, son type de page et son comportement.
 *
 * Règles :
 * - Les littéraux (`/orders/report`) doivent précéder les patterns
 *   paramétrés (`/orders/:id`) dans le tableau, sinon matchPath retourne
 *   la mauvaise entrée.
 * - Aucun retour automatique vers "/" sauf pour les routes racines.
 * - Toute route nouvelle doit être déclarée ici (voir AGENTS.md).
 */

export type RouteRole = "client" | "pro" | "supplier" | "admin";

export type RouteType =
  | "root"
  | "exploration"
  | "listing"
  | "profile"
  | "settings"
  | "wizard"
  | "flow"
  | "mission"
  | "transactional"
  | "immersive"
  | "auth"
  | "onboarding"
  | "normal";

export interface NavigationNode {
  /** Pattern de route, ex. "/orders/tracker/:id" */
  route: string;
  type: RouteType;
  roles: RouteRole[];
  /** Parent logique (pattern) — sert à la documentation et aux flux. */
  parent?: string;
  /** Destination du retour quand il n'y a pas d'historique in-app. */
  fallback: string;
  /** Destination après succès d'un flux transactionnel (replace). */
  completion?: string;
  /** Masque la navigation globale (tab bar) — écrans immersifs. */
  hideNav?: boolean;
}

/** Fallbacks par espace — filet pour toute route absente du graph. */
export const SPACE_FALLBACK: Record<RouteRole, string> = {
  client: "/",
  pro: "/pro/dashboard",
  supplier: "/supplier/dashboard",
  admin: "/admin/dashboard",
};

/** Espace (rôle) d'un pathname, pour choisir le fallback de dernier recours. */
export function resolveSpace(pathname: string): RouteRole {
  if (pathname.startsWith("/pro/")) return "pro";
  if (pathname.startsWith("/supplier/")) return "supplier";
  if (pathname.startsWith("/admin/")) return "admin";
  return "client";
}

export const NAVIGATION_GRAPH: NavigationNode[] = [
  // ─── Auth / onboarding (public) ───────────────────────────────
  { route: "/onboarding", type: "onboarding", roles: ["client"], fallback: "/", hideNav: true },

  // ─── Espace client ────────────────────────────────────────────
  { route: "/", type: "root", roles: ["client"], fallback: "/" },

  // Home & exploration
  { route: "/search", type: "exploration", roles: ["client"], parent: "/", fallback: "/" },
  { route: "/catalog", type: "exploration", roles: ["client"], parent: "/", fallback: "/" },
  { route: "/professionals", type: "listing", roles: ["client"], parent: "/search", fallback: "/search" },
  { route: "/freelance", type: "listing", roles: ["client"], parent: "/search", fallback: "/search" },
  { route: "/favorites", type: "profile", roles: ["client"], parent: "/", fallback: "/" },
  { route: "/explorer/pro/:id", type: "profile", roles: ["client"], parent: "/search", fallback: "/search" },
  { route: "/explorer/design-provider/:id", type: "profile", roles: ["client"], parent: "/search", fallback: "/search" },

  // Messagerie
  { route: "/messages", type: "exploration", roles: ["client"], parent: "/", fallback: "/" },
  { route: "/messages/new", type: "immersive", roles: ["client"], parent: "/messages", fallback: "/messages", hideNav: true },
  { route: "/messages/:conversationId", type: "immersive", roles: ["client"], parent: "/messages", fallback: "/messages", hideNav: true },

  // Demandes / missions / paiements (littéraux AVANT /orders/:id)
  { route: "/orders", type: "listing", roles: ["client"], parent: "/", fallback: "/" },
  { route: "/orders/new", type: "wizard", roles: ["client"], parent: "/orders", fallback: "/orders", hideNav: true },
  { route: "/orders/matching/:requestId", type: "flow", roles: ["client"], parent: "/orders/new", fallback: "/orders", hideNav: true },
  { route: "/orders/proposals/:requestId", type: "flow", roles: ["client"], parent: "/orders/matching/:requestId", fallback: "/orders" },
  { route: "/orders/proposals/:requestId/:proposalId", type: "flow", roles: ["client"], parent: "/orders/proposals/:requestId", fallback: "/orders", hideNav: true },
  { route: "/orders/review", type: "transactional", roles: ["client"], parent: "/orders/tracker/:id", fallback: "/orders", completion: "/orders", hideNav: true },
  { route: "/orders/dispute/:id", type: "transactional", roles: ["client"], parent: "/orders/tracker/:id", fallback: "/orders", completion: "/orders", hideNav: true },
  { route: "/orders/cancel/:id", type: "transactional", roles: ["client"], parent: "/orders/tracker/:id", fallback: "/orders", completion: "/orders", hideNav: true },
  { route: "/orders/report", type: "transactional", roles: ["client"], parent: "/orders/tracker/:id", fallback: "/orders", completion: "/orders", hideNav: true },
  { route: "/orders/qr-payment", type: "transactional", roles: ["client"], parent: "/orders/tracker/:id", fallback: "/orders", completion: "/orders", hideNav: true },
  { route: "/orders/invoice", type: "transactional", roles: ["client"], parent: "/orders/tracker/:id", fallback: "/orders", completion: "/orders", hideNav: true },
  { route: "/orders/quote/create/:requestId", type: "wizard", roles: ["client"], parent: "/orders", fallback: "/orders", completion: "/orders", hideNav: true },
  { route: "/orders/quote/:requestId", type: "transactional", roles: ["client"], parent: "/orders/quote/create/:requestId", fallback: "/orders", completion: "/orders/payment/:requestId", hideNav: true },
  { route: "/orders/payment/:requestId", type: "transactional", roles: ["client"], parent: "/orders/quote/:requestId", fallback: "/orders", completion: "/orders", hideNav: true },
  { route: "/orders/tracker/:id", type: "mission", roles: ["client"], parent: "/orders", fallback: "/orders", hideNav: true },
  { route: "/orders/:id", type: "mission", roles: ["client"], parent: "/orders", fallback: "/orders" },

  // Profil client
  { route: "/profile", type: "profile", roles: ["client"], parent: "/", fallback: "/" },
  { route: "/my-profile", type: "profile", roles: ["client"], parent: "/", fallback: "/" },
  { route: "/profile/settings", type: "settings", roles: ["client"], parent: "/my-profile", fallback: "/my-profile" },
  { route: "/profile/payments", type: "settings", roles: ["client"], parent: "/my-profile", fallback: "/my-profile" },
  { route: "/profile/addresses", type: "settings", roles: ["client"], parent: "/my-profile", fallback: "/my-profile" },
  { route: "/profile/notifications", type: "settings", roles: ["client"], parent: "/my-profile", fallback: "/my-profile" },
  { route: "/profile/help", type: "settings", roles: ["client"], parent: "/my-profile", fallback: "/my-profile" },
  { route: "/profile/edit", type: "settings", roles: ["client"], parent: "/my-profile", fallback: "/my-profile" },
  { route: "/profile/security", type: "settings", roles: ["client"], parent: "/my-profile", fallback: "/my-profile" },
  { route: "/profile/language", type: "settings", roles: ["client"], parent: "/my-profile", fallback: "/my-profile" },
  { route: "/profile/terms", type: "settings", roles: ["client"], parent: "/my-profile", fallback: "/my-profile" },

  // Profil pro (espace client)
  { route: "/profile/pro-edit", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/profile/pro-verification", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/profile/pro-finances", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/profile/pro-subscription", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/profile/pro-planning", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/profile/pro-notifications", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/profile/pro-help", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/profile/pro-missions", type: "mission", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/profile/pro-preview", type: "profile", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },

  // Vérification
  { route: "/verify/phone", type: "auth", roles: ["client"], parent: "/profile", fallback: "/", hideNav: true },
  { route: "/verify/email", type: "auth", roles: ["client"], parent: "/profile", fallback: "/", hideNav: true },
  { route: "/verify/identity", type: "auth", roles: ["client"], parent: "/profile", fallback: "/", hideNav: true },

  // Abonnement client
  { route: "/settings/subscription", type: "settings", roles: ["client"], parent: "/my-profile", fallback: "/my-profile" },
  { route: "/settings/subscription/plans", type: "transactional", roles: ["client"], parent: "/settings/subscription", fallback: "/settings/subscription" },
  { route: "/settings/subscription/payment", type: "transactional", roles: ["client"], parent: "/settings/subscription/plans", fallback: "/settings/subscription/plans", completion: "/settings/subscription" },
  { route: "/settings/subscription/history", type: "settings", roles: ["client"], parent: "/settings/subscription", fallback: "/settings/subscription" },
  { route: "/settings/subscription/invoices", type: "settings", roles: ["client"], parent: "/settings/subscription", fallback: "/settings/subscription" },

  // Marketplace (littéraux AVANT les patterns AVANT le catch-all)
  { route: "/marketplace", type: "exploration", roles: ["client"], parent: "/", fallback: "/" },
  { route: "/marketplace/explore", type: "listing", roles: ["client"], parent: "/marketplace", fallback: "/marketplace" },
  { route: "/marketplace/publish", type: "wizard", roles: ["client"], parent: "/marketplace", fallback: "/marketplace", completion: "/marketplace", hideNav: true },
  { route: "/marketplace/profile", type: "profile", roles: ["client"], parent: "/marketplace", fallback: "/marketplace" },
  { route: "/marketplace/boutiques", type: "listing", roles: ["client"], parent: "/marketplace", fallback: "/marketplace" },
  { route: "/marketplace/register", type: "wizard", roles: ["client"], parent: "/marketplace", fallback: "/marketplace", completion: "/marketplace", hideNav: true },
  { route: "/marketplace/cart", type: "transactional", roles: ["client"], parent: "/marketplace", fallback: "/marketplace" },
  { route: "/marketplace/checkout", type: "transactional", roles: ["client"], parent: "/marketplace/cart", fallback: "/marketplace/cart", completion: "/marketplace/order/confirm/:orderId", hideNav: true },
  { route: "/marketplace/orders", type: "profile", roles: ["client"], parent: "/marketplace", fallback: "/marketplace" },
  { route: "/marketplace/seller", type: "profile", roles: ["client"], parent: "/marketplace", fallback: "/marketplace", hideNav: true },
  { route: "/marketplace/order/confirm/:orderId", type: "transactional", roles: ["client"], parent: "/marketplace/checkout", fallback: "/marketplace", hideNav: true },
  { route: "/marketplace/orders/:orderId", type: "profile", roles: ["client"], parent: "/marketplace/orders", fallback: "/marketplace/orders", hideNav: true },
  { route: "/marketplace/dispute/:orderId", type: "transactional", roles: ["client"], parent: "/marketplace/orders", fallback: "/marketplace/orders", hideNav: true },
  { route: "/marketplace/browse/:vertical", type: "listing", roles: ["client"], parent: "/marketplace", fallback: "/marketplace" },
  { route: "/marketplace/shop/:sellerId", type: "profile", roles: ["client"], parent: "/marketplace/boutiques", fallback: "/marketplace", hideNav: true },
  { route: "/marketplace/supplier/:sellerId", type: "profile", roles: ["client"], parent: "/marketplace", fallback: "/marketplace", hideNav: true },
  { route: "/marketplace/item/:productId", type: "profile", roles: ["client"], parent: "/marketplace", fallback: "/marketplace", hideNav: true },
  { route: "/marketplace/:categoryId", type: "listing", roles: ["client"], parent: "/marketplace", fallback: "/marketplace" },

  // ─── Espace professionnel ─────────────────────────────────────
  { route: "/pro/onboarding", type: "onboarding", roles: ["pro"], parent: "/", fallback: "/pro/dashboard", hideNav: true },
  { route: "/pro/onboarding/:step", type: "onboarding", roles: ["pro"], parent: "/pro/onboarding", fallback: "/pro/dashboard", hideNav: true },
  { route: "/pro/dashboard", type: "root", roles: ["pro"], fallback: "/pro/dashboard" },
  { route: "/pro/services", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/revenues", type: "profile", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/wallet", type: "profile", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/messages", type: "exploration", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/messages/:conversationId", type: "immersive", roles: ["pro"], parent: "/pro/messages", fallback: "/pro/messages", hideNav: true },
  { route: "/pro/mission/:id", type: "mission", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/missions", type: "mission", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/gallery", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/stats", type: "profile", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/badges", type: "profile", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/security", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/settings", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/support", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/about", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/professional-identity", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/payment-methods", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/withdraw", type: "transactional", roles: ["pro"], parent: "/pro/wallet", fallback: "/pro/wallet", completion: "/pro/wallet" },
  { route: "/pro/withdrawals", type: "profile", roles: ["pro"], parent: "/pro/wallet", fallback: "/pro/wallet" },
  { route: "/pro/bank-accounts", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/currency", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/timezone", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/appearance", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/privacy", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/phone", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/email", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/subscription", type: "settings", roles: ["pro"], parent: "/pro/dashboard", fallback: "/pro/dashboard" },
  { route: "/pro/subscription/plans", type: "transactional", roles: ["pro"], parent: "/pro/subscription", fallback: "/pro/subscription" },
  { route: "/pro/boost", type: "transactional", roles: ["pro"], parent: "/pro/subscription", fallback: "/pro/subscription", completion: "/pro/subscription" },
  { route: "/pro/credits", type: "transactional", roles: ["pro"], parent: "/pro/subscription", fallback: "/pro/subscription" },

  // ─── Portail fournisseur ──────────────────────────────────────
  { route: "/supplier/register", type: "onboarding", roles: ["supplier"], parent: "/", fallback: "/supplier/dashboard", hideNav: true },
  { route: "/supplier/dashboard", type: "root", roles: ["supplier"], fallback: "/supplier/dashboard" },
  { route: "/supplier/products", type: "listing", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/products/new", type: "wizard", roles: ["supplier"], parent: "/supplier/products", fallback: "/supplier/products", completion: "/supplier/products" },
  { route: "/supplier/products/:id/edit", type: "wizard", roles: ["supplier"], parent: "/supplier/products", fallback: "/supplier/products", completion: "/supplier/products" },
  { route: "/supplier/stock", type: "listing", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/orders", type: "listing", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/orders/:id", type: "flow", roles: ["supplier"], parent: "/supplier/orders", fallback: "/supplier/orders" },
  { route: "/supplier/picking", type: "flow", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/clients", type: "listing", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/clients/:id", type: "profile", roles: ["supplier"], parent: "/supplier/clients", fallback: "/supplier/clients" },
  { route: "/supplier/promotions", type: "listing", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/payments", type: "listing", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/payments/:id", type: "flow", roles: ["supplier"], parent: "/supplier/payments", fallback: "/supplier/payments" },
  { route: "/supplier/invoices", type: "listing", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/invoices/:id", type: "flow", roles: ["supplier"], parent: "/supplier/invoices", fallback: "/supplier/invoices" },
  { route: "/supplier/documents", type: "listing", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/disputes", type: "listing", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/disputes/:id", type: "flow", roles: ["supplier"], parent: "/supplier/disputes", fallback: "/supplier/disputes" },
  { route: "/supplier/deliveries", type: "listing", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/deliveries/:id", type: "flow", roles: ["supplier"], parent: "/supplier/deliveries", fallback: "/supplier/deliveries" },
  { route: "/supplier/delivery-zones", type: "settings", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/balance", type: "profile", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/import", type: "wizard", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/stats", type: "profile", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/profile", type: "settings", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },
  { route: "/supplier/settings", type: "settings", roles: ["supplier"], parent: "/supplier/dashboard", fallback: "/supplier/dashboard" },

  // ─── Espace admin ─────────────────────────────────────────────
  { route: "/admin/login", type: "auth", roles: ["admin"], parent: "/", fallback: "/admin/dashboard" },
  { route: "/admin/dashboard", type: "root", roles: ["admin"], fallback: "/admin/dashboard" },
  { route: "/admin/clients", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/clients/:id", type: "profile", roles: ["admin"], parent: "/admin/clients", fallback: "/admin/clients" },
  { route: "/admin/pros", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/pros/:id", type: "profile", roles: ["admin"], parent: "/admin/pros", fallback: "/admin/pros" },
  { route: "/admin/verifications", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/applications", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/applications/:id", type: "profile", roles: ["admin"], parent: "/admin/applications", fallback: "/admin/applications" },
  { route: "/admin/missions", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/missions/:id", type: "profile", roles: ["admin"], parent: "/admin/missions", fallback: "/admin/missions" },
  { route: "/admin/payments", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/support", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/support/:id", type: "profile", roles: ["admin"], parent: "/admin/support", fallback: "/admin/support" },
  { route: "/admin/reports", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/subscriptions", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/plans", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/features", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/feature-flags", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/invoices", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/coupons", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/notifications", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/notifications/create", type: "wizard", roles: ["admin"], parent: "/admin/notifications", fallback: "/admin/notifications", completion: "/admin/notifications" },
  { route: "/admin/categories", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/promotions", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/cms", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/roles", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/fraud", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/analytics", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/analytics/revenue", type: "listing", roles: ["admin"], parent: "/admin/analytics", fallback: "/admin/analytics" },
  { route: "/admin/settings", type: "settings", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/logs", type: "settings", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/suppliers/applications", type: "listing", roles: ["admin"], parent: "/admin/suppliers", fallback: "/admin/suppliers" },
  { route: "/admin/suppliers", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/suppliers/:id", type: "profile", roles: ["admin"], parent: "/admin/suppliers", fallback: "/admin/suppliers" },
  { route: "/admin/disputes", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/disputes/:id", type: "profile", roles: ["admin"], parent: "/admin/disputes", fallback: "/admin/disputes" },
  { route: "/admin/deliveries", type: "listing", roles: ["admin"], parent: "/admin/dashboard", fallback: "/admin/dashboard" },
  { route: "/admin/deliveries/:id", type: "profile", roles: ["admin"], parent: "/admin/deliveries", fallback: "/admin/deliveries" },
];

/** Résout l'entrée du graph pour un pathname (match de patterns). */
export function getRouteInfo(pathname: string): NavigationNode | undefined {
  return NAVIGATION_GRAPH.find((n) => matchPath(n.route, pathname) !== null);
}

/** Fallback de retour pour un pathname (jamais de retour sauvage vers "/"). */
export function getFallback(pathname: string): string {
  return getRouteInfo(pathname)?.fallback ?? SPACE_FALLBACK[resolveSpace(pathname)];
}

/** Écran immersif : masque la navigation globale (tab bar / barre). */
export function isImmersiveRoute(pathname: string): boolean {
  return getRouteInfo(pathname)?.hideNav === true;
}

/** Destination de fin de flux transactionnel (si définie). */
export function getCompletion(pathname: string): string | undefined {
  return getRouteInfo(pathname)?.completion;
}
