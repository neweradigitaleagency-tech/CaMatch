import { create } from "zustand";
import type { ProJob, ProAlert, ProJobStatus } from "../types";

interface ProState {
  isAvailable: boolean;
  activeAlert: ProAlert | null;
  jobs: ProJob[];
  alerts: ProAlert[];
  currentJob: ProJob | null;
  currentScreen: "dashboard" | "job-execution";
  toggleAvailability: () => void;
  setActiveAlert: (alert: ProAlert | null) => void;
  setJobs: (jobs: ProJob[]) => void;
  addJob: (job: ProJob) => void;
  setAlerts: (alerts: ProAlert[]) => void;
  removeAlert: (id: string) => void;
  setCurrentJob: (job: ProJob | null) => void;
  setCurrentScreen: (screen: "dashboard" | "job-execution") => void;
  updateJobStatus: (jobId: string, status: string) => void;
}

export const useProStore = create<ProState>((set) => ({
  isAvailable: true,
  activeAlert: null,
  jobs: [],
  alerts: [],
  currentJob: null,
  currentScreen: "dashboard",
  toggleAvailability: () =>
    set((state) => ({ isAvailable: !state.isAvailable })),
  setActiveAlert: (alert) => set({ activeAlert: alert }),
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  setAlerts: (alerts) => set({ alerts }),
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
      activeAlert:
        state.activeAlert?.id === id ? null : state.activeAlert,
    })),
  setCurrentJob: (job) => set({ currentJob: job }),
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  updateJobStatus: (jobId, status) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: status as ProJobStatus } : j
      ),
    })),
}));
