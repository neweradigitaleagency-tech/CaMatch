import { create } from "zustand";

export interface AppNotification {
  id: string;
  type: "mission" | "message" | "payment" | "review" | "promo" | "info" | "quote";
  title: string;
  body: string;
  icon?: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notif: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearNotification: (id: string) => void;
}

function loadPersisted(): AppNotification[] {
  try {
    const raw = localStorage.getItem("cm_notifications");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(notifications: AppNotification[]) {
  try {
    localStorage.setItem("cm_notifications", JSON.stringify(notifications));
  } catch {}
}

let notifCounter = 0;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: loadPersisted(),
  get unreadCount() {
    return get().notifications.filter((n) => !n.read).length;
  },

  addNotification: (notif) => {
    notifCounter += 1;
    const n: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${notifCounter}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [n, ...state.notifications].slice(0, 100);
      persist(updated);
      return { notifications: updated };
    });
  },

  markRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      persist(updated);
      return { notifications: updated };
    });
  },

  markAllRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      persist(updated);
      return { notifications: updated };
    });
  },

  clearNotification: (id) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      persist(updated);
      return { notifications: updated };
    });
  },
}));
