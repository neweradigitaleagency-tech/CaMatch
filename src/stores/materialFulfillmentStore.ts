import { create } from "zustand";
import type { MaterialFulfillmentMode } from "../utils/quoteMaterials";

export interface FulfillmentSelection {
  alternatives: Record<string, string>;
  mode: MaterialFulfillmentMode;
  updatedAt: string;
}

interface MaterialFulfillmentState {
  selections: Record<string, FulfillmentSelection>;
  setAlternative: (requestId: string, originalProductId: string, chosenProductId: string) => void;
  setMode: (requestId: string, mode: MaterialFulfillmentMode) => void;
  reset: (requestId: string) => void;
}

function defaultSelection(): FulfillmentSelection {
  return { alternatives: {}, mode: "delivery", updatedAt: new Date().toISOString() };
}

export const useMaterialFulfillmentStore = create<MaterialFulfillmentState>((set) => ({
  selections: {},

  setAlternative: (requestId, from, to) =>
    set((s) => {
      const prev = s.selections[requestId] ?? defaultSelection();
      return {
        selections: {
          ...s.selections,
          [requestId]: {
            ...prev,
            alternatives: { ...prev.alternatives, [from]: to },
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }),

  setMode: (requestId, mode) =>
    set((s) => {
      const prev = s.selections[requestId] ?? defaultSelection();
      return {
        selections: {
          ...s.selections,
          [requestId]: { ...prev, mode, updatedAt: new Date().toISOString() },
        },
      };
    }),

  reset: (requestId) =>
    set((s) => {
      const next = { ...s.selections };
      delete next[requestId];
      return { selections: next };
    }),
}));
