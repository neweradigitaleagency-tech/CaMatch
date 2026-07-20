import { supabase, isSupabaseReady } from "./supabase"
import type { Payment, PaymentInput } from "../types/subscription"
import type { TransactionLedgerEntry, TransactionStatus, UnifiedPaymentMethod } from "../types/payment"
import { format } from "date-fns"

const MOCK_PAYMENTS: Payment[] = [
  { id: "pay_1", user_id: "mock_user", subscription_id: "sub_mock", provider: "wave", provider_transaction_id: "WAVE-001", amount: 4900, currency: "XOF", status: "captured", provider_response: null, metadata: null, created_at: new Date().toISOString() },
  { id: "pay_2", user_id: "mock_user", subscription_id: "sub_mock", provider: "orange_money", provider_transaction_id: "OM-002", amount: 4900, currency: "XOF", status: "captured", provider_response: null, metadata: null, created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
]

export async function createPayment(input: PaymentInput & { user_id: string }): Promise<Payment> {
  if (!isSupabaseReady()) {
    return {
      id: `pay_${Date.now()}`,
      user_id: input.user_id,
      subscription_id: input.subscription_id,
      provider: input.provider,
      provider_transaction_id: `${input.provider.toUpperCase()}_${Date.now()}`,
      amount: input.amount,
      currency: "XOF",
      status: "captured",
      provider_response: { simulated: true, message: "Paiement simulé" },
      metadata: null,
      created_at: new Date().toISOString(),
    }
  }
  const { data, error } = await (supabase!
    .from("payments" as never)
    .insert({
      user_id: input.user_id,
      subscription_id: input.subscription_id,
      provider: input.provider,
      amount: input.amount,
      currency: "XOF",
      status: "captured",
      provider_transaction_id: `TXN_${Date.now()}`,
    } as never)
    .select("*, invoice:invoices(*)")
    .single() as any)
  if (error) throw error
  return data as unknown as Payment
}

export async function verifyPayment(paymentId: string): Promise<Payment> {
  if (!isSupabaseReady()) {
    return { ...MOCK_PAYMENTS[0] as Payment, id: paymentId, status: "captured" }
  }
  const { data, error } = await (supabase!
    .from("payments" as never)
    .select("*, invoice:invoices(*)")
    .eq("id" as never, paymentId)
    .single() as any)
  if (error) throw error
  return data as unknown as Payment
}

export async function fetchPaymentHistory(userId: string): Promise<Payment[]> {
  if (!isSupabaseReady()) {
    return MOCK_PAYMENTS.map((p) => ({ ...p, user_id: userId }))
  }
  const { data, error } = await (supabase!
    .from("payments" as never)
    .select("*, invoice:invoices(*)")
    .eq("user_id" as never, userId)
    .order("created_at" as never, { ascending: false }) as any)
  if (error) throw error
  return (data ?? []) as unknown as Payment[]
}

export async function refundPayment(paymentId: string): Promise<Payment> {
  if (!isSupabaseReady()) {
    return { ...MOCK_PAYMENTS[0] as Payment, id: paymentId, status: "refunded" }
  }
  const { data, error } = await (supabase!
    .from("payments" as never)
    .update({ status: "refunded", updated_at: new Date().toISOString() } as never)
    .eq("id" as never, paymentId)
    .select("*, invoice:invoices(*)")
    .single() as any)
  if (error) throw error
  return data as unknown as Payment
}

export async function processWebhook(payload: {
  provider: string
  event: string
  transaction_id: string
  amount: number
  status: string
}): Promise<{ success: boolean }> {
  if (!isSupabaseReady()) return { success: true }
  const { error } = await (supabase!.from("payments" as never).insert({
    provider: payload.provider,
    provider_transaction_id: payload.transaction_id,
    amount: payload.amount,
    currency: "XOF",
    status: payload.status === "completed" ? "captured" : "failed",
    metadata: { webhook_event: payload.event },
  } as never) as any)
  if (error) throw error
  return { success: true }
}
