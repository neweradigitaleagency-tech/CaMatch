import { create } from "zustand";
import type { ClientRequest, Mission } from "../types";
import { useProjectStore, fromMission } from "./projectStore";

interface RequestState {
  requests: ClientRequest[];
  missions: Mission[];
  selectedMission: Mission | null;
  setRequests: (requests: ClientRequest[]) => void;
  addRequest: (request: ClientRequest) => void;
  removeRequest: (id: string) => void;
  setMissions: (missions: Mission[]) => void;
  addMission: (mission: Mission) => void;
  selectMission: (mission: Mission | null) => void;
  updateMissionStatus: (id: string, status: string) => void;
  setMissionField: (id: string, field: string, value: unknown) => void;
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
  setMissions: (missions) => {
    const projectStore = useProjectStore.getState();
    const projects = missions.map(fromMission);
    projectStore.setProjects(projects);
    if (projectStore.perspective !== "client") {
      projectStore.setPerspective("client");
    }
    set({ missions });
  },
  addMission: (mission) => {
    const projectStore = useProjectStore.getState();
    projectStore.addProject(fromMission(mission));
    set((state) => ({ missions: [mission, ...state.missions] }));
  },
  selectMission: (mission) => {
    if (mission) {
      useProjectStore.getState().selectProject(fromMission(mission));
    } else {
      useProjectStore.getState().selectProject(null);
    }
    set({ selectedMission: mission });
  },
  updateMissionStatus: (id: string, status: string) => {
    useProjectStore.getState().updateProjectStatus(id, status);
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
  setMissionField: (id: string, field: string, value: unknown) =>
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === id ? { ...m, [field]: value } as Mission : m
      ),
    })),
}));
