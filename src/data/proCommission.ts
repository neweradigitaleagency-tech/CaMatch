export const DEFAULT_COMMISSION_PERCENT = 15;

export const PRO_COMMISSION_BY_PLAN: Record<string, number> = {
  plan_pro_starter: 12,
  plan_pro_business: 8,
  plan_pro_premium: 8,
};

export function getProCommissionPercent(planId?: string | null): number {
  if (!planId) return DEFAULT_COMMISSION_PERCENT;
  return PRO_COMMISSION_BY_PLAN[planId] ?? DEFAULT_COMMISSION_PERCENT;
}

export function commissionBreakdown(subtotalXOF: number, percent: number) {
  const commissionXOF = Math.round((subtotalXOF * percent) / 100);
  return {
    percent,
    commissionXOF,
    proNetXOF: Math.max(0, subtotalXOF - commissionXOF),
  };
}
