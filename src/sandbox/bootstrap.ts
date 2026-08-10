import { seedWorkflowData } from "../data/mockWorkflowData";
import { getProductById } from "../data/marketplaceProducts";
import { PROFESSIONAL_SELLERS } from "../data/marketplaceSuppliers";
import {
  MOCK_REQUESTS,
  MOCK_MISSIONS,
  MOCK_PRO_JOBS,
  MOCK_PRO_ALERTS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_PROS,
} from "../services/mockData";
import { useRequestStore } from "../stores/requestStore";
import { useProStore } from "../stores/proStore";
import { useChatStore } from "../stores/chatStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useFavoritesStore } from "../stores/favoritesStore";
import { useMarketplaceCartStore } from "../stores/marketplaceCartStore";

let seeded = false;

/**
 * Seed global du sandbox — appelé une fois au boot (avant le premier render).
 * Idempotent : ne peuple que les stores vides (ou non seedés dans la session).
 */
export function ensureSandboxSeed(): void {
  if (seeded) return;
  seeded = true;

  const requestStore = useRequestStore.getState();
  const proStore = useProStore.getState();
  const chatStore = useChatStore.getState();

  if (requestStore.requests.length === 0) {
    requestStore.setRequests(MOCK_REQUESTS);
  }
  if (requestStore.missions.length === 0) {
    requestStore.setMissions(MOCK_MISSIONS);
  }

  if (proStore.jobs.length === 0) {
    proStore.setJobs(MOCK_PRO_JOBS);
  }
  if (proStore.alerts.length === 0) {
    proStore.setAlerts(MOCK_PRO_ALERTS);
  }

  if (chatStore.conversations.length === 0) {
    for (const conv of MOCK_CONVERSATIONS) {
      chatStore.upsertConversation(conv);
    }
    for (const [convId, msgs] of Object.entries(MOCK_MESSAGES)) {
      chatStore.appendMessages(convId, msgs);
    }
  }

  seedWorkflowData();

  seedUniversData();

  const notificationStore = useNotificationStore.getState();
  if (notificationStore.notifications.length === 0) {
    notificationStore.addNotification({
      type: "mission",
      title: "Nouvelle demande reçue",
      body: "Kouamé N'Guessan cherche un électricien pour un tableau électrique défectueux.",
      actionUrl: "/pro/dashboard",
    });
    notificationStore.addNotification({
      type: "message",
      title: "Nouveau message",
      body: "Mamadou K. : « J'arrive dans 15 minutes »",
      actionUrl: "/messages/conv1",
    });
    notificationStore.addNotification({
      type: "info",
      title: "Bienvenue dans la démo",
      body: "Explorez l'app en tant que Client, Pro, Supplier, Admin ou Market via le bouton flottant.",
      actionUrl: "/",
    });
  }
}

/** Seeds des univers secondaires (favoris, panier marketplace). Idempotent. */
function seedUniversData(): void {
  const favorites = useFavoritesStore.getState();
  if ((favorites.items ?? []).length === 0) {
    const pro6 = MOCK_PROS.find((p) => p.id === "pro6");
    if (pro6) {
      favorites.toggle({
        type: "pro",
        id: pro6.id,
        name: pro6.name,
        subtitle: pro6.title,
        image: pro6.avatarUrl,
        rating: pro6.rating / 10,
        priceLabel: `${pro6.hourlyRateXOF.toLocaleString("fr-FR")} F/h`,
        route: `/explorer/pro/${pro6.id}`,
      });
    }
    const ciment = getProductById("mp-1");
    if (ciment) {
      favorites.toggle({
        type: "product",
        id: ciment.id,
        name: ciment.name,
        subtitle: "Quincaillerie ABC",
        image: ciment.images?.[0],
        priceLabel: `${ciment.price.toLocaleString("fr-FR")} F`,
        route: `/marketplace/item/${ciment.id}`,
      });
    }
    const abc = PROFESSIONAL_SELLERS.find((s) => s.id === "seller-pro-1");
    if (abc) {
      favorites.toggle({
        type: "boutique",
        id: abc.id,
        name: abc.companyName,
        subtitle: `${abc.city} · Pro Supply`,
        image: abc.logo,
        route: `/marketplace/shop/${abc.id}`,
      });
    }
  }

  const cart = useMarketplaceCartStore.getState();
  if ((cart.items ?? []).length === 0) {
    const ciment = getProductById("mp-1");
    if (ciment) {
      cart.addItem({
        productId: ciment.id,
        productName: ciment.name,
        productImage: ciment.images?.[0] ?? "",
        price: ciment.price,
        quantity: 2,
        sellerId: ciment.sellerId,
        sellerName: "Quincaillerie ABC",
        vertical: ciment.vertical,
      });
    }
  }
}

/** Rôles explorables depuis le panneau sandbox. */
export interface SandboxRole {
  id: "client" | "pro" | "supplier" | "admin" | "market";
  label: string;
  description: string;
  space: string;
  entry: string;
}

export const SANDBOX_ROLES: SandboxRole[] = [
  { id: "client", label: "Client", description: "Créer une demande, matcher, suivre, payer", space: "client", entry: "/" },
  { id: "pro", label: "Pro", description: "Recevoir des alertes, accepter, exécuter", space: "pro", entry: "/pro/dashboard" },
  { id: "supplier", label: "Supplier", description: "Fournir matériaux et produits", space: "supplier", entry: "/supplier/dashboard" },
  { id: "admin", label: "Admin", description: "Piloter la plateforme", space: "admin", entry: "/admin/dashboard" },
  { id: "market", label: "Market", description: "Acheter sur la marketplace", space: "market", entry: "/marketplace" },
];
