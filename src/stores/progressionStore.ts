import { create } from "zustand";
import { getProLevel, getProLevelFromJobs, type ProLevel, type Badge, type ProLevelConfig } from "../types";
import { getBadgesForXp } from "../services/mockData";

interface ProgressionState {
  xp: number;
  level: ProLevel;
  levelConfig: ProLevelConfig;
  badges: Badge[];
  completedJobs: number;
  totalEarningsXOF: number;
  currentCommissionPercent: number;
  setXp: (xp: number) => void;
  addXp: (amount: number) => void;
  addCompletedJob: (earningsXOF: number) => void;
  setCompletedJobs: (count: number) => void;
  setTotalEarnings: (amount: number) => void;
}

export const useProgressionStore = create<ProgressionState>((set, get) => ({
  xp: 600,
  level: "débutant",
  levelConfig: getProLevel(0),
  badges: getBadgesForXp(0),
  completedJobs: 0,
  totalEarningsXOF: 0,
  currentCommissionPercent: 15,

  setXp: (xp) => {
    const levelConfig = getProLevel(xp);
    const badges = getBadgesForXp(xp);
    set({ xp, level: levelConfig.level, levelConfig, badges, currentCommissionPercent: levelConfig.commissionPercent });
  },

  addXp: (amount) => {
    const current = get();
    const newXp = current.xp + amount;
    const levelConfig = getProLevel(newXp);
    const badges = getBadgesForXp(newXp);
    set({ xp: newXp, level: levelConfig.level, levelConfig, badges, currentCommissionPercent: levelConfig.commissionPercent });
  },

  addCompletedJob: (earningsXOF) => {
    const current = get();
    const newJobs = current.completedJobs + 1;
    const newXp = newJobs * 50;
    const newEarnings = current.totalEarningsXOF + earningsXOF;
    const levelConfig = getProLevel(newXp);
    const badges = getBadgesForXp(newXp);
    set({
      completedJobs: newJobs,
      xp: newXp,
      totalEarningsXOF: newEarnings,
      level: levelConfig.level,
      levelConfig,
      badges,
      currentCommissionPercent: levelConfig.commissionPercent,
    });
  },

  setCompletedJobs: (count) => {
    const xp = count * 50;
    const levelConfig = getProLevel(xp);
    const badges = getBadgesForXp(xp);
    set({ completedJobs: count, xp, level: levelConfig.level, levelConfig, badges, currentCommissionPercent: levelConfig.commissionPercent });
  },

  setTotalEarnings: (amount) => set({ totalEarningsXOF: amount }),
}));
