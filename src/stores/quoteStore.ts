import { create } from "zustand";
import type { Quote, QuoteStatus, QuoteVersion, QuoteLineItem } from "../types";
import { useNotificationStore } from "./notificationStore";

interface QuoteState {
  quotes: Record<string, Quote>; // keyed by requestId
  createQuote: (params: {
    requestId: string;
    professionalId: string;
    professionalName: string;
    professionalAvatar: string;
    lineItems: QuoteLineItem[];
    estimatedDurationMins: number;
    startDate: string;
    endDate: string;
    materialsIncluded: string;
    materialsNotIncluded: string;
    materialsByClient: string;
    warranty: string;
    conditions: string;
    validUntil: string;
    notes: string;
    attachments: string[];
  }) => string;
  addVersion: (quoteId: string, lineItems: QuoteLineItem[], changes: Partial<Omit<QuoteVersion, "id" | "version" | "lineItems" | "totalXOF" | "createdAt">>) => void;
  acceptQuote: (requestId: string) => void;
  refuseQuote: (requestId: string) => void;
  expireQuote: (requestId: string) => void;
  addClientComment: (requestId: string, comment: string) => void;
  getQuoteForRequest: (requestId: string) => Quote | undefined;
}

let quoteCounter = 0;

export const useQuoteStore = create<QuoteState>((set, get) => ({
  quotes: {},

  createQuote: (params) => {
    quoteCounter += 1;
    const id = `quote_${Date.now()}_${quoteCounter}`;
    const totalXOF = params.lineItems.reduce((sum, li) => sum + li.totalXOF, 0);
    const version: QuoteVersion = {
      id: `${id}_v1`,
      version: 1,
      lineItems: params.lineItems,
      totalXOF,
      estimatedDurationMins: params.estimatedDurationMins,
      startDate: params.startDate,
      endDate: params.endDate,
      materialsIncluded: params.materialsIncluded,
      materialsNotIncluded: params.materialsNotIncluded,
      materialsByClient: params.materialsByClient,
      warranty: params.warranty,
      conditions: params.conditions,
      validUntil: params.validUntil,
      notes: params.notes,
      attachments: params.attachments,
      createdAt: new Date().toISOString(),
    };
    const quote: Quote = {
      id,
      requestId: params.requestId,
      professionalId: params.professionalId,
      professionalName: params.professionalName,
      professionalAvatar: params.professionalAvatar,
      status: "sent",
      versions: [version],
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      quotes: { ...state.quotes, [params.requestId]: quote },
    }));
    useNotificationStore.getState().addNotification({
      type: "quote",
      title: "Nouveau devis",
      body: `${params.professionalName} a envoyé un devis`,
      actionUrl: `/orders/quote/${params.requestId}`,
    });
    return id;
  },

  addVersion: (quoteId, lineItems, changes) => {
    set((state) => {
      const quote = Object.values(state.quotes).find((q) => q.id === quoteId);
      if (!quote) return state;
      const prev = quote.versions[quote.versions.length - 1]!;
      const totalXOF = lineItems.reduce((sum, li) => sum + li.totalXOF, 0);
      const newVersion: QuoteVersion = {
        id: `${quoteId}_v${quote.versions.length + 1}`,
        version: quote.versions.length + 1,
        lineItems,
        totalXOF,
        estimatedDurationMins: changes.estimatedDurationMins ?? prev.estimatedDurationMins,
        startDate: changes.startDate ?? prev.startDate,
        endDate: changes.endDate ?? prev.endDate,
        materialsIncluded: changes.materialsIncluded ?? prev.materialsIncluded,
        materialsNotIncluded: changes.materialsNotIncluded ?? prev.materialsNotIncluded,
        materialsByClient: changes.materialsByClient ?? prev.materialsByClient,
        warranty: changes.warranty ?? prev.warranty,
        conditions: changes.conditions ?? prev.conditions,
        validUntil: changes.validUntil ?? prev.validUntil,
        notes: changes.notes ?? prev.notes,
        attachments: changes.attachments ?? prev.attachments,
        createdAt: new Date().toISOString(),
      };
      return {
        quotes: {
          ...state.quotes,
          [quote.requestId]: {
            ...quote,
            status: "modified",
            versions: [...quote.versions, newVersion],
            currentVersion: quote.versions.length + 1,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  },

  acceptQuote: (requestId) => {
    set((state) => {
      const quote = state.quotes[requestId];
      if (!quote) return state;
      return {
        quotes: {
          ...state.quotes,
          [requestId]: { ...quote, status: "accepted", updatedAt: new Date().toISOString() },
        },
      };
    });
    useNotificationStore.getState().addNotification({
      type: "quote",
      title: "Devis accepté",
      body: "Le client a accepté votre devis",
      actionUrl: `/orders/tracker/${requestId}`,
    });
  },

  refuseQuote: (requestId) => {
    set((state) => {
      const quote = state.quotes[requestId];
      if (!quote) return state;
      return {
        quotes: {
          ...state.quotes,
          [requestId]: { ...quote, status: "refused", updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  expireQuote: (requestId) => {
    set((state) => {
      const quote = state.quotes[requestId];
      if (!quote) return state;
      return {
        quotes: {
          ...state.quotes,
          [requestId]: { ...quote, status: "expired", updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  addClientComment: (requestId, comment) => {
    set((state) => {
      const quote = state.quotes[requestId];
      if (!quote) return state;
      return {
        quotes: {
          ...state.quotes,
          [requestId]: { ...quote, clientComment: comment, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  getQuoteForRequest: (requestId) => get().quotes[requestId],
}));
