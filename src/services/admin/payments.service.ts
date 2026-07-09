import { supabase, isSupabaseReady } from "../supabase"

export interface Transaction {
  id: string
  type: "payment" | "payout" | "refund" | "fee"
  status: string
  amount: number
  fee: number
  net_amount: number
  currency: string
  description: string
  mission_id?: string
  client_id?: string
  client_name?: string
  professional_id?: string
  pro_name?: string
  payment_method: string
  created_at: string
  completed_at?: string
}

export interface PayoutItem {
  id: string
  payee_id: string
  payee_name: string
  amount: number
  method: string
  status: string
  provider_reference?: string
  hold_until?: string
  created_at: string
}

export interface PaymentStats {
  total_revenue: number
  total_payouts: number
  total_refunds: number
  pending_payouts: number
  pending_transactions: number
  monthly_revenue: number
  fee_revenue: number
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  authorized: "Autorisé",
  captured: "Capturé",
  completed: "Complété",
  failed: "Échoué",
  refunded: "Remboursé",
  partially_refunded: "Remboursé partiel",
  processing: "En cours",
}

const TYPE_LABELS: Record<string, string> = {
  payment: "Paiement",
  payout: "Virement",
  refund: "Remboursement",
  fee: "Frais",
}

const METHOD_LABELS: Record<string, string> = {
  wave: "Wave",
  orange_money: "Orange Money",
  mtn: "MTN Mobile Money",
  cash: "Espèces",
  card: "Carte bancaire",
  bank_transfer: "Virement bancaire",
  visa: "Visa",
  mastercard: "Mastercard",
  paypal: "PayPal",
  bitcoin: "Bitcoin",
  usdt: "USDT",
}

export async function getTransactions(params: {
  page?: number
  perPage?: number
  status?: string
  search?: string
} = {}): Promise<{ transactions: Transaction[]; total: number }> {
  if (!isSupabaseReady()) return { transactions: [], total: 0 }

  const { page = 1, perPage = 20, status, search } = params
  let query = supabase
    .from("transactions" as never)
    .select("*, payer:payer_id(email), payee:payee_id(email)", { count: "exact" }) as never

  let q: any = query
  if (status && status !== "all") q = q.eq("status", status)
  if (search) {
    q = q.or(`provider_reference.ilike.%${search}%,payer.email.ilike.%${search}%,payee.email.ilike.%${search}%`)
  }

  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data, count, error } = await q.order("created_at", { ascending: false }).range(from, to) as any
  if (error) throw error

  return {
    transactions: (data ?? []).map((t: any) => {
      const isRefund = t.status === "refunded" || t.status === "partially_refunded"
      return {
        id: t.id,
        type: isRefund ? "refund" : "payment",
        status: t.status,
        amount: t.amount,
        fee: t.platform_fee ?? 0,
        net_amount: t.net_amount,
        currency: t.currency ?? "XOF",
        description: `Transaction ${t.id?.slice(0, 8)}`,
        mission_id: t.job_id,
        client_id: t.payer_id,
        client_name: t.payer?.email?.split("@")[0] ?? "",
        professional_id: t.payee_id,
        pro_name: t.payee?.email?.split("@")[0] ?? "",
        payment_method: t.payment_method,
        created_at: t.created_at,
        completed_at: t.updated_at,
      } as Transaction
    }),
    total: count ?? 0,
  }
}

export async function getPayouts(params: {
  page?: number
  perPage?: number
  status?: string
  search?: string
} = {}): Promise<{ payouts: PayoutItem[]; total: number }> {
  if (!isSupabaseReady()) return { payouts: [], total: 0 }

  const { page = 1, perPage = 20, status, search } = params
  let query = supabase
    .from("payouts" as never)
    .select("*, payee:payee_id(email)", { count: "exact" }) as never

  let q: any = query
  if (status && status !== "all") q = q.eq("status", status)
  if (search) {
    q = q.or(`provider_reference.ilike.%${search}%,payee.email.ilike.%${search}%`)
  }

  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data, count, error } = await q.order("created_at", { ascending: false }).range(from, to) as any
  if (error) throw error

  return {
    payouts: (data ?? []).map((p: any) => ({
      id: p.id,
      payee_id: p.payee_id,
      payee_name: p.payee?.email?.split("@")[0] ?? "",
      amount: p.amount,
      method: p.method,
      status: p.status,
      provider_reference: p.provider_reference,
      hold_until: p.hold_until,
      created_at: p.created_at,
    })) as PayoutItem[],
    total: count ?? 0,
  }
}

export async function getPaymentStats(): Promise<PaymentStats> {
  if (!isSupabaseReady()) {
    return { total_revenue: 0, total_payouts: 0, total_refunds: 0, pending_payouts: 0, pending_transactions: 0, monthly_revenue: 0, fee_revenue: 0 }
  }

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [txnResult, payoutResult, monthlyResult, feeResult] = await Promise.all([
    supabase.from("transactions" as never).select("amount, platform_fee, status") as any,
    supabase.from("payouts" as never).select("amount, status") as any,
    supabase.from("transactions" as never).select("amount").eq("status", "captured").gte("created_at", firstOfMonth) as any,
    supabase.from("transactions" as never).select("platform_fee").eq("status", "captured") as any,
  ])

  const allTxns: any[] = txnResult.data ?? []
  const allPayouts: any[] = payoutResult.data ?? []
  const monthlyTxns: any[] = monthlyResult.data ?? []
  const feeTxns: any[] = feeResult.data ?? []

  const total_revenue = allTxns.filter((t: any) => t.status === "captured").reduce((s: number, t: any) => s + (t.amount ?? 0), 0)
  const total_refunds = allTxns.filter((t: any) => t.status === "refunded" || t.status === "partially_refunded").reduce((s: number, t: any) => s + (t.amount ?? 0), 0)
  const total_payouts = allPayouts.filter((p: any) => p.status === "completed").reduce((s: number, p: any) => s + (p.amount ?? 0), 0)
  const pending_payouts = allPayouts.filter((p: any) => p.status === "pending" || p.status === "processing").reduce((s: number, p: any) => s + (p.amount ?? 0), 0)
  const pending_transactions = allTxns.filter((t: any) => t.status === "pending" || t.status === "authorized").reduce((s: number, t: any) => s + (t.amount ?? 0), 0)
  const monthly_revenue = monthlyTxns.reduce((s: number, t: any) => s + (t.amount ?? 0), 0)
  const fee_revenue = feeTxns.reduce((s: number, t: any) => s + (t.platform_fee ?? 0), 0)

  return { total_revenue, total_payouts, total_refunds, pending_payouts, pending_transactions, monthly_revenue, fee_revenue }
}

export async function processRefund(transactionId: string, amount?: number): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await (supabase.from("transactions" as never) as any)
    .update({ status: "refunded" })
    .eq("id", transactionId) as any
  return !error
}

export async function approvePayout(payoutId: string, status: "processing" | "completed" = "processing"): Promise<boolean> {
  if (!isSupabaseReady()) return false
  const { error } = await (supabase.from("payouts" as never) as any)
    .update({ status })
    .eq("id", payoutId) as any
  return !error
}

export { STATUS_LABELS as TXN_STATUS_LABELS, TYPE_LABELS as TXN_TYPE_LABELS, METHOD_LABELS as TXN_METHOD_LABELS }
