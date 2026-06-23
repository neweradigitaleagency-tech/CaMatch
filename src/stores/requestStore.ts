import { create } from "zustand";
import type { ClientRequest, Mission } from "../types";
import { useNotificationStore } from "./notificationStore";

interface RequestState {
  requests: ClientRequest[];
  missions: Mission[];
  selectedMission: Mission | null;
  setRequests: (requests: ClientRequest[]) => void;
  addRequest: (request: ClientRequest) => void;
  removeRequest: (id: string) => void;
  setMissions: (missions: Mission[]) => void;
  selectMission: (mission: Mission | null) => void;
  updateMissionStatus: (id: string, status: string) => void;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [],
  missions: [],
  selectedMission: null,
  setRequests: (requests) => set({ requests }),
  addRequest: (request) =>
    set((state) => ({ requests: [request, ...state.requests] })),
  removeRequest: (id) =>
    set((state) => ({
      requests: state.requests.filter((r) => r.id !== id),
    })),
  setMissions: (missions) => set({ missions }),
  selectMission: (mission) => set({ selectedMission: mission }),
  updateMissionStatus: (id: string, status: string) => {
    const mission = get().missions.find((m) => m.id === id);
    const statusLabels: Record<string, string> = {
      accepted: "accepté votre demande",
      en_route: "est en route",
      in_progress: "a commencé l'intervention",
      completed: "a terminé l'intervention",
      paid: "paiement confirmé",
      reviewed: "évaluation reçue",
    };
    const label = statusLabels[status];
    if (label && mission) {
      useNotificationStore.getState().addNotification({
        type: "mission",
        title: mission.proName || "Mise à jour",
        body: `${mission.proName || "Le professionnel"} a ${label}`,
        actionUrl: `/orders/tracker/${id}`,
      });
    }
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === id ? { ...m, status: status as never } : m
      ),
      selectedMission:
        state.selectedMission?.id === id
          ? { ...state.selectedMission, status: status as never }
          : state.selectedMission,
    }));
  },
}));
