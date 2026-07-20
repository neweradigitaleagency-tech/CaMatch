import { create } from "zustand";
import type { MissionStatus, ClientRequest, Mission, ProJob, ProAlert, ProJobStatus } from "../types";
import { useNotificationStore } from "./notificationStore";

export type ProjectType = "service_mission" | "material_order" | "hybrid";
export type ProjectPerspective = "client" | "pro" | "admin";

export interface Project {
  id: string;
  type: ProjectType;
  requestId?: string;
  clientId: string;
  proId?: string;
  supplierId?: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  address: string;
  budgetXOF: number;
  status: MissionStatus | ProJobStatus;
  pricingModel?: "fixed" | "quote";

  clientName: string;
  clientPhone: string;
  clientAvatarUrl?: string;
  proName?: string;
  proAvatar?: string;
  proPhone?: string;

  photos: string[];
  beforePhotos?: string[];
  afterPhotos?: string[];

  quoteId?: string;
  escrowId?: string;
  cancellationId?: string;
  disputeId?: string;

  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  cancelledAt?: string;

  estimatedArrivalMinutes?: number;
  durationMins?: number;
  proNotes?: string;
  clientNotes?: string;

  travelFeeXOF?: number;
  laborFeeXOF?: number;
  totalFeeXOF?: number;
}

interface ProjectState {
  perspective: ProjectPerspective;
  projects: Project[];
  activeProject: Project | null;
  alerts: ProAlert[];
  isAvailable: boolean;

  setPerspective: (p: ProjectPerspective) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  selectProject: (project: Project | null) => void;
  updateProjectStatus: (id: string, status: string) => void;
  setProjectField: (id: string, field: string, value: unknown) => void;

  setAlerts: (alerts: ProAlert[]) => void;
  addAlert: (alert: ProAlert) => void;
  removeAlert: (id: string) => void;
  setActiveAlert: (alert: ProAlert | null) => void;

  toggleAvailability: () => void;
  setAvailable: (v: boolean) => void;
}

function fromMission(m: Mission): Project {
  return {
    id: m.id,
    type: "service_mission",
    requestId: m.requestId,
    clientId: m.clientId,
    proId: m.proId,
    title: m.title,
    description: m.description,
    category: m.category,
    subCategory: m.subCategory,
    address: m.address,
    budgetXOF: m.budgetXOF,
    status: m.status,
    pricingModel: m.pricingModel,
    clientName: m.clientName,
    clientPhone: m.clientPhone,
    proName: m.proName,
    proAvatar: m.proAvatar,
    proPhone: m.proPhone,
    photos: m.photos,
    beforePhotos: m.beforePhotos,
    afterPhotos: m.afterPhotos,
    quoteId: m.quoteId,
    escrowId: m.escrowId,
    cancellationId: m.cancellationId,
    disputeId: m.disputeId,
    createdAt: m.createdAt,
    acceptedAt: m.acceptedAt,
    completedAt: m.completedAt,
    cancelledAt: m.cancelledAt,
    estimatedArrivalMinutes: m.estimatedArrivalMinutes,
    durationMins: m.durationMins,
    proNotes: m.proNotes,
    clientNotes: m.clientNotes,
  };
}

function fromProJob(j: ProJob): Project {
  return {
    id: j.id,
    type: "service_mission",
    clientId: j.clientId,
    proId: undefined,
    title: j.serviceName,
    description: j.description,
    category: j.category,
    address: j.clientLocation,
    budgetXOF: j.totalFeeXOF,
    status: j.status,
    pricingModel: j.pricingModel,
    clientName: j.clientName,
    clientPhone: j.clientPhone,
    clientAvatarUrl: j.clientAvatarUrl,
    photos: [],
    beforePhotos: j.beforePhoto ? [j.beforePhoto] : undefined,
    afterPhotos: j.afterPhoto ? [j.afterPhoto] : undefined,
    createdAt: j.createdAt,
    completedAt: j.completedAt,
    travelFeeXOF: j.travelFeeXOF,
    laborFeeXOF: j.laborFeeXOF,
    totalFeeXOF: j.totalFeeXOF,
  };
}

const statusNotificationLabels: Record<string, string> = {
  accepted: "a accepté votre demande",
  refused: "a refusé la demande",
  paid: "paiement reçu, fonds sécurisés",
  in_progress: "a commencé l'intervention",
  completed: "a terminé l'intervention",
  client_validation: "en attente de votre validation",
  closed: "mission clôturée",
  cancelled: "mission annulée",
  disputed: "litige ouvert",
  refunded: "remboursement effectué",
  en_route: "est en route",
  arrived: "est arrivé sur place",
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  perspective: "client",
  projects: [],
  activeProject: null,
  alerts: [],
  isAvailable: true,

  setPerspective: (perspective) => set({ perspective }),

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),

  selectProject: (project) => set({ activeProject: project }),

  updateProjectStatus: (id: string, status: string) => {
    const project = get().projects.find((p) => p.id === id);
    const label = statusNotificationLabels[status];
    if (label && project) {
      useNotificationStore.getState().addNotification({
        type: "mission",
        title: project.proName || "Mise à jour",
        body: `${project.proName || "Le professionnel"} ${label}`,
        actionUrl: `/orders/tracker/${id}`,
      });
    }
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, status: status as never } : p
      ),
      activeProject:
        state.activeProject?.id === id
          ? { ...state.activeProject, status: status as never }
          : state.activeProject,
    }));
  },

  setProjectField: (id: string, field: string, value: unknown) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, [field]: value } as Project : p
      ),
    })),

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts] })),

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
      activeAlert:
        state.activeAlert?.id === id ? null : state.activeAlert,
    })),

  setActiveAlert: (alert) => set({ activeAlert: alert }),

  toggleAvailability: () =>
    set((state) => ({ isAvailable: !state.isAvailable })),

  setAvailable: (v) => set({ isAvailable: v }),
}));

export { fromMission, fromProJob };
