import { create } from "zustand";
import type { ProJob, ProAlert, ProJobStatus } from "../types";
import { useProjectStore, fromProJob } from "./projectStore";

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
  toggleAvailability: () => {
    const projectStore = useProjectStore.getState();
    projectStore.toggleAvailability();
    set((state) => ({ isAvailable: !state.isAvailable }));
  },
  setActiveAlert: (alert) =>
    set({ activeAlert: alert }),
  setJobs: (jobs) => {
    const projectStore = useProjectStore.getState();
    const projects = jobs.map(fromProJob);
    projectStore.setProjects(projects);
    if (projectStore.perspective !== "pro") {
      projectStore.setPerspective("pro");
    }
    projectStore.setAvailable(true);
    set({ jobs });
  },
  addJob: (job) => {
    useProjectStore.getState().addProject(fromProJob(job));
    set((state) => ({ jobs: [job, ...state.jobs] }));
  },
  setAlerts: (alerts) => {
    useProjectStore.getState().setAlerts(alerts);
    set({ alerts });
  },
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
      activeAlert:
        state.activeAlert?.id === id ? null : state.activeAlert,
    })),
  setCurrentJob: (job) => {
    if (job) {
      useProjectStore.getState().selectProject(fromProJob(job));
    } else {
      useProjectStore.getState().selectProject(null);
    }
    set({ currentJob: job });
  },
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  updateJobStatus: (jobId, status) => {
    useProjectStore.getState().updateProjectStatus(jobId, status);
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: status as ProJobStatus } : j
      ),
    }));
  },
}));
