import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Pile de navigation in-app + flux transactionnels.
 *
 * - La pile (sessionStorage `cm_navigation`) enregistre les chemins parcourus
 *   DANS l'app. `window.history.length` n'est pas fiable en SPA (entrées
 *   externes, borne ~50) : on s'appuie sur cette pile explicite pour décider
 *   si `navigate(-1)` est sûr.
 * - `flow` porte les données critiques d'un flux transactionnel
 *   (ex. mission → review). Il remplace `location.state` pour que la
 *   navigation par URL (raccourcis, navigate-to-component) ne perde rien.
 * - `flags` porte des marqueurs de navigation (ex. « vient du hamburger »),
 *   l'ancien `state.from` devient un flag.
 *
 * Règles (voir AGENTS.md — NAVIGATION RULES) :
 * - Pile bornée à 30 entrées.
 * - `navigate(-1)` interdit hors du wrapper `goBack()`.
 * - Données critiques via `flow`, jamais via `location.state`.
 */

export interface StackEntry {
  path: string;
  search?: string;
}

interface NavigationState {
  stack: StackEntry[];
  flow: { key: string; data?: unknown } | null;
  flags: Record<string, boolean>;

  push: (entry: StackEntry) => void;
  pop: () => StackEntry | undefined;
  peek: () => StackEntry | undefined;
  clearStack: () => void;

  setFlow: (key: string, data?: unknown) => void;
  getFlow: <T = unknown>(key: string) => T | undefined;
  clearFlow: (key: string) => void;

  setFlag: (key: string, value: boolean) => void;
  getFlag: (key: string) => boolean;
  clearFlag: (key: string) => void;
}

const MAX_STACK = 30;

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      stack: [],
      flow: null,
      flags: {},

      push: (entry) =>
        set((s) => {
          const last = s.stack[s.stack.length - 1];
          if (last && last.path === entry.path && last.search === entry.search) {
            return s;
          }
          return { stack: [...s.stack, entry].slice(-MAX_STACK) };
        }),

      pop: () => {
        const entry = get().stack.pop();
        return entry;
      },

      peek: () => {
        const stack = get().stack;
        return stack.length > 0 ? stack[stack.length - 1] : undefined;
      },

      clearStack: () => set({ stack: [] }),

      setFlow: (key, data) => set({ flow: { key, data } }),
      getFlow: <T,>(key: string): T | undefined => {
        const flow = get().flow;
        if (!flow || flow.key !== key) return undefined;
        return flow.data as T;
      },
      clearFlow: (key) =>
        set((s) => (s.flow && s.flow.key === key ? { flow: null } : s)),

      setFlag: (key, value) => set((s) => ({ flags: { ...s.flags, [key]: value } })),
      getFlag: (key) => get().flags[key] === true,
      clearFlag: (key) =>
        set((s) => {
          const { [key]: _removed, ...rest } = s.flags;
          return { flags: rest };
        }),
    }),
    {
      name: "cm_navigation",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ stack: s.stack, flow: s.flow, flags: s.flags }),
    }
  )
);
