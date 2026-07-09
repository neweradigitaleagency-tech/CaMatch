import { supabase, isSupabaseReady } from "./supabase"
import type { Credit, CreditTransaction, CreditTransactionType } from "../types/subscription"

export async function getCreditBalance(userId: string): Promise<Credit | null> {
  if (!isSupabaseReady()) {
    return { id: "cr_1", user_id: userId, balance: 5000, lifetime_earned: 15000, lifetime_spent: 10000 }
  }
  const { data, error } = await supabase!
    .from("credits" as never)
    .select("*")
    .eq("user_id" as never, userId)
    .maybeSingle() as any
  if (error && error.code !== "PGRST116") throw error
  return data as Credit | null
}

const CREDIT_PACKS = [
  { amount: 5000, price: 5000, bonus: 0 },
  { amount: 10000, price: 9500, bonus: 500 },
  { amount: 25000, price: 22500, bonus: 2500 },
  { amount: 50000, price: 42500, bonus: 7500 },
  { amount: 100000, price: 80000, bonus: 20000 },
]

export function getCreditPacks() {
  return CREDIT_PACKS
}

export async function purchaseCredits(userId: string, packAmount: number): Promise<{ credit: Credit; transaction: CreditTransaction }> {
  const pack = CREDIT_PACKS.find((p) => p.amount === packAmount)
  if (!pack) throw new Error("Pack invalide")
  const totalCredits = pack.amount + pack.bonus
  if (!isSupabaseReady()) {
    const tx: CreditTransaction = {
      id: `ctx_${Date.now()}`,
      user_id: userId,
      type: "purchase",
      amount: totalCredits,
      balance_after: 5000 + totalCredits,
      reference_type: "purchase",
      reference_id: `pay_${Date.now()}`,
      description: `Achat ${packAmount} F CFA + ${pack.bonus} bonus`,
      created_at: new Date().toISOString(),
    }
    return {
      credit: { id: "cr_1", user_id: userId, balance: 5000 + totalCredits, lifetime_earned: 15000 + totalCredits, lifetime_spent: 10000 },
      transaction: tx,
    }
  }
  const { data: credit, error: creditError } = await supabase!
    .rpc("add_credits" as never, { p_user_id: userId, p_amount: totalCredits } as never)
    .single() as any
  if (creditError) throw creditError
  const tx: CreditTransaction = {
    id: `ctx_${Date.now()}`,
    user_id: userId,
    type: "purchase",
    amount: totalCredits,
    balance_after: (credit as any)?.balance ?? totalCredits,
    reference_type: "purchase",
    reference_id: null,
    description: `Achat ${packAmount} F CFA + ${pack.bonus} bonus`,
    created_at: new Date().toISOString(),
  }
  return { credit: credit as unknown as Credit, transaction: tx }
}

export async function spendCredits(userId: string, amount: number, referenceType: string, referenceId: string, description?: string): Promise<CreditTransaction> {
  if (!isSupabaseReady()) {
    return {
      id: `ctx_${Date.now()}`,
      user_id: userId,
      type: "spend",
      amount,
      balance_after: 5000 - amount,
      reference_type: referenceType,
      reference_id: referenceId,
      description: description ?? "Dépense de crédits",
      created_at: new Date().toISOString(),
    }
  }
  const { data, error } = await supabase!
    .rpc("spend_credits" as never, { p_user_id: userId, p_amount: amount } as never)
    .single() as any
  if (error) throw error
  return {
    id: `ctx_${Date.now()}`,
    user_id: userId,
    type: "spend",
    amount,
    balance_after: (data as any)?.balance ?? 0,
    reference_type: referenceType,
    reference_id: referenceId,
    description: description ?? "Dépense de crédits",
    created_at: new Date().toISOString(),
  }
}

export async function fetchCreditHistory(userId: string): Promise<CreditTransaction[]> {
  if (!isSupabaseReady()) {
    return [
      { id: "ctx_1", user_id: userId, type: "purchase", amount: 15000, balance_after: 15000, reference_type: "purchase", reference_id: "pay_1", description: "Achat de crédits", created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "ctx_2", user_id: userId, type: "spend", amount: 5000, balance_after: 10000, reference_type: "boost", reference_id: "boost_1", description: "Boost Search Top 7 jours", created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "ctx_3", user_id: userId, type: "bonus", amount: 5000, balance_after: 15000, reference_type: "promotion", reference_id: "promo_1", description: "Bonus bienvenue", created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "ctx_4", user_id: userId, type: "purchase", amount: 10000, balance_after: 25000, reference_type: "purchase", reference_id: "pay_2", description: "Achat 10 000 F CFA + 500 bonus", created_at: new Date().toISOString() },
    ]
  }
  const { data, error } = await supabase!
    .from("credit_transactions" as never)
    .select("*")
    .eq("user_id" as never, userId)
    .order("created_at" as never, { ascending: false }) as any
  if (error) throw error
  return (data ?? []) as CreditTransaction[]
}
