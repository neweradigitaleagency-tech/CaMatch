import { create } from "zustand";
import type { EscrowEntry, EscrowStatus, UnifiedPaymentMethod } from "../types/payment";
import { useNotificationStore } from "./notificationStore";

const COMMISSION_PERCENT = 15;

interface EscrowState {
  entries: EscrowEntry[];
  addEntry: (entry: EscrowEntry) => void;
  holdPayment: (missionId: string, clientId: string, proId: string, amountXOF: number, paymentMethod: UnifiedPaymentMethod) => EscrowEntry;
  releasePayment: (missionId: string) => void;
  refundPayment: (missionId: string) => void;
  getEntry: (missionId: string) => EscrowEntry | undefined;
}

let escrowCounter = 0;

export const useEscrowStore = create<EscrowState>((set, get) => ({
  entries: [],

  addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),

  holdPayment: (missionId, clientId, proId, amountXOF, method) => {
    escrowCounter += 1;
    const commissionXOF = Math.round(amountXOF * COMMISSION_PERCENT / 100);
    const entry: EscrowEntry = {
      id: `escrow_${Date.now()}_${escrowCounter}`,
      missionId,
      clientId,
      proId,
      amountXOF,
      commissionPercent: COMMISSION_PERCENT,
      commissionXOF,
      proAmountXOF: amountXOF - commissionXOF,
      platformAmountXOF: commissionXOF,
      method,
      status: "held",
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ entries: [...state.entries, entry] }));
    useNotificationStore.getState().addNotification({
      type: "mission",
      title: "Paiement sécurisé",
      body: `Paiement de ${amountXOF.toLocaleString()} F confirmé. Les fonds sont sécurisés sur la plateforme.`,
      actionUrl: `/orders/tracker/${missionId}`,
    });
    return entry;
  },

  releasePayment: (missionId) => {
    set((state) => ({
      entries: state.entries.map((e) =>
        e.missionId === missionId && e.status === "held"
          ? { ...e, status: "released" as EscrowStatus, releasedAt: new Date().toISOString() }
          : e
      ),
    }));
    const entry = get().entries.find((e) => e.missionId === missionId);
    if (entry) {
      useNotificationStore.getState().addNotification({
        type: "mission",
        title: "Paiement débloqué",
        body: `Le paiement de ${entry.proAmountXOF.toLocaleString()} F a été débloqué vers le professionnel.`,
        actionUrl: `/orders/tracker/${missionId}`,
      });
    }
  },

  refundPayment: (missionId) => {
    set((state) => ({
      entries: state.entries.map((e) =>
        e.missionId === missionId && e.status === "held"
          ? { ...e, status: "refunded" as EscrowStatus, releasedAt: new Date().toISOString() }
          : e
      ),
    }));
  },

  getEntry: (missionId) => get().entries.find((e) => e.missionId === missionId),
}));
