import { create } from "zustand";
import { useAuthStore } from "./authStore";

/**
 * Store d'onboarding client — persistance PAR COMPTE.
 * La clé localStorage dépend de l'userId courant : `cm_client_onboarding_${userId}`.
 * Un nouvel utilisateur repart de zéro, un compte déjà onboardé ne revoit pas les étapes.
 */

const KEY_PREFIX = "cm_client_onboarding_";

interface ClientOnboardingData {
  selectedCategoryIds: string[];
  selectedSubCategories: string[];
  neighborhood: string;
  completed: boolean;
}

interface ClientOnboardingStore extends ClientOnboardingData {
  initialized: boolean;
  /** Charge (ou initialise) les données pour le compte courant. */
  initialize: () => void;
  setCategories: (categoryIds: string[], subCategories: string[]) => void;
  setNeighborhood: (name: string) => void;
  markComplete: () => void;
  reset: () => void;
}

function keyFor(): string {
  const userId = useAuthStore.getState().userId ?? "guest";
  return `${KEY_PREFIX}${userId}`;
}

function loadData(): ClientOnboardingData | null {
  try {
    const raw = localStorage.getItem(keyFor());
    return raw ? (JSON.parse(raw) as ClientOnboardingData) : null;
  } catch {
    return null;
  }
}

function persistData(data: ClientOnboardingData) {
  try {
    localStorage.setItem(keyFor(), JSON.stringify(data));
  } catch {}
}

const defaultData: ClientOnboardingData = {
  selectedCategoryIds: [],
  selectedSubCategories: [],
  neighborhood: "Cocody",
  completed: false,
};

export function isClientOnboardingCompleted(): boolean {
  const saved = loadData();
  return saved?.completed === true;
}

export const useClientOnboardingStore = create<ClientOnboardingStore>((set, get) => ({
  ...defaultData,
  initialized: false,

  initialize: () => {
    const saved = loadData();
    if (saved) {
      set({ ...defaultData, ...saved, initialized: true });
    } else {
      set({ ...defaultData, initialized: true });
    }
  },

  setCategories: (categoryIds, subCategories) => {
    const next = { ...get(), selectedCategoryIds: categoryIds, selectedSubCategories: subCategories };
    persistData(next);
    set(next);
  },

  setNeighborhood: (name) => {
    const next = { ...get(), neighborhood: name };
    persistData(next);
    set(next);
  },

  markComplete: () => {
    const next = { ...get(), completed: true };
    persistData(next);
    set(next);
  },

  reset: () => {
    try {
      localStorage.removeItem(keyFor());
    } catch {}
    set({ ...defaultData, initialized: true });
  },
}));
