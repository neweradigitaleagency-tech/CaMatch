import { create } from "zustand";
import type { ClientRequest, Mission } from "../types";

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

export const useRequestStore = create<RequestState>((set) => ({
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
  updateMissionStatus: (id: string, status: string) =>
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === id ? { ...m, status: status as never } : m
      ),
      selectedMission:
        state.selectedMission?.id === id
          ? { ...state.selectedMission, status: status as never }
          : state.selectedMission,
    })),
}));
