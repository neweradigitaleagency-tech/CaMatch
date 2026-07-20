import { supabase, isSupabaseReady } from "./supabase";
import { getProLevel, XP_EVENTS } from "../types";
import type { XPEventType, ProgressionState, Badge, XPTransaction } from "../types";
import { MOCK_BADGES } from "./mockData";

const XP_STORAGE_KEY = "camatch_xp_transactions";

// ─── LocalStorage fallback ───

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

// ─── Service principal ───

export async function getTotalXP(proId: string): Promise<number> {
  if (!isSupabaseReady()) {
    const txns = getLocalTransactions().filter((t) => t.proId === proId);
    return txns.reduce((sum, t) => sum + t.xp, 0);
  }

  const { data, error } = await supabase.rpc("get_total_xp", { p_user_id: proId });
  if (error) {
    const txns = getLocalTransactions().filter((t) => t.proId === proId);
    return txns.reduce((sum, t) => sum + t.xp, 0);
  }
  return data ?? 0;
}

export async function getXPHistory(proId: string): Promise<XPTransaction[]> {
  if (!isSupabaseReady()) {
    return getLocalTransactions()
      .filter((t) => t.proId === proId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const { data, error } = await supabase
    .from("xp_transactions")
    .select("*")
    .eq("user_id", proId)
    .order("created_at", { ascending: false });

  if (error) {
    return getLocalTransactions()
      .filter((t) => t.proId === proId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (data ?? []).map((t: any) => ({
    id: t.id,
    proId: t.user_id,
    eventType: t.event_type as XPEventType,
    xp: t.xp,
    label: t.label,
    missionId: t.mission_id,
    createdAt: t.created_at,
  }));
}

export async function addXP(
  proId: string,
  eventType: XPEventType,
  missionId?: string
): Promise<XPTransaction> {
  const cfg = XP_EVENTS[eventType];

  // Toujours sauvegarder en localStorage (fallback + mode démo)
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

  // Persister en DB si disponible
  if (isSupabaseReady()) {
    await supabase.rpc("add_xp", {
      p_user_id: proId,
      p_event_type: eventType,
      p_mission_id: missionId ?? null,
    });
  }

  return txn;
}

export async function getProgressionState(proId: string): Promise<ProgressionState> {
  const xp = await getTotalXP(proId);
  const level = getProLevel(xp);
  const history = await getXPHistory(proId);
  const completedJobs = history.filter((t) => t.eventType === "mission_completed").length;
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
