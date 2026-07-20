import { supabase, isSupabaseReady } from "../supabase";

export interface UnifiedTrustScore {
  overall: number;
  kyc: number;
  activity: number;
  payment_reliability: number;
  fraud_score: number;
  fraud_flags: number;
  last_assessed: string;
  xp_bonus?: number;
  total_xp?: number;
  legacy_components?: Record<string, unknown>;
}

export async function getTrustScores(userId: string): Promise<UnifiedTrustScore | null> {
  if (!isSupabaseReady()) return getMockTrustScores();

  const { data, error } = await supabase.rpc("get_trust_scores", {
    p_user_id: userId,
  });

  if (error) {
    console.warn("get_trust_scores RPC error:", error);
    return getMockTrustScores();
  }

  return data as UnifiedTrustScore | null;
}

export async function recalculateTrustScore(userId: string): Promise<UnifiedTrustScore | null> {
  if (!isSupabaseReady()) return getMockTrustScores();

  const { data, error } = await supabase.rpc("calculate_unified_trust_scores", {
    p_user_id: userId,
  });

  if (error) {
    console.warn("recalculate trust score error:", error);
    return getMockTrustScores();
  }

  return data as UnifiedTrustScore | null;
}

function getMockTrustScores(): UnifiedTrustScore {
  return {
    overall: 78,
    kyc: 85,
    activity: 72,
    payment_reliability: 80,
    fraud_score: 12,
    fraud_flags: 0,
    last_assessed: new Date().toISOString(),
  };
}
