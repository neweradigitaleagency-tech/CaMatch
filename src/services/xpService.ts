import { getProLevel, XP_EVENTS } from "../types";
import type { XPTransaction, XPEventType, ProgressionState, Badge } from "../types";
import { MOCK_BADGES } from "./mockData";

const XP_STORAGE_KEY = "camatch_xp_transactions";

function getLocalTransactions(): XPTransaction[] {
  try {
    return JSON.parse(localStorage.getItem(XP_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalTransactions(txns: XPTransaction[]): void {
  localStorage.setItem(XP_STORAGE_KEY, JSON.stringify(txns));
}

export function getTotalXP(proId: string): number {
  const txns = getLocalTransactions().filter((t) => t.proId === proId);
  return txns.reduce((sum, t) => sum + t.xp, 0);
}

export function getXPHistory(proId: string): XPTransaction[] {
  return getLocalTransactions()
    .filter((t) => t.proId === proId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addXP(
  proId: string,
  eventType: XPEventType,
  missionId?: string
): XPTransaction {
  const cfg = XP_EVENTS[eventType];

  const txn: XPTransaction = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    proId,
    eventType,
    xp: cfg.xp,
    label: cfg.label,
    missionId,
    createdAt: new Date().toISOString(),
  };

  const txns = getLocalTransactions();
  txns.push(txn);
  saveLocalTransactions(txns);

  return txn;
}

export function getProgressionState(proId: string): ProgressionState {
  const xp = getTotalXP(proId);
  const level = getProLevel(xp);
  const totalTxns = getLocalTransactions().filter((t) => t.proId === proId);
  const completedJobs = totalTxns.filter((t) => t.eventType === "mission_completed").length;
  const totalEarningsXOF = completedJobs * 25000;

  const badges: Badge[] = MOCK_BADGES.map((b) => ({
    ...b,
    unlocked: xp >= b.id.length * 500,
  }));

  return {
    xp,
    level: level.level,
    badges,
    completedJobs,
    totalEarningsXOF,
    currentCommissionPercent: level.commissionPercent,
  };
}
