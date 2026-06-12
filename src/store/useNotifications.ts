import { create } from "zustand";

interface NotificationState {
  pushEnabled: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  setPushEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrateEnabled: (enabled: boolean) => void;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationState>((set) => ({
  pushEnabled: false,
  soundEnabled: true,
  vibrateEnabled: true,
  setPushEnabled: (pushEnabled) => set({ pushEnabled }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setVibrateEnabled: (vibrateEnabled) => set({ vibrateEnabled }),
  reset: () =>
    set({ pushEnabled: false, soundEnabled: true, vibrateEnabled: true }),
}));
