import { supabase, isSupabaseReady } from "./supabase"
import type { Invoice } from "../types/subscription"
import { format } from "date-fns"

const MOCK_INVOICES: Invoice[] = [
  { id: "inv_1", payment_id: "pay_1", user_id: "mock_user", invoice_number: "CM-2026-0001", pdf_url: null, amount: 4900, tax: 0, total: 4900, status: "paid", due_date: new Date().toISOString(), paid_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: "inv_2", payment_id: "pay_2", user_id: "mock_user", invoice_number: "CM-2026-0002", pdf_url: null, amount: 4900, tax: 0, total: 4900, status: "paid", due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), paid_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
]

export async function fetchInvoices(userId: string): Promise<Invoice[]> {
  if (!isSupabaseReady()) {
    return MOCK_INVOICES.map((inv) => ({ ...inv, user_id: userId }))
  }
  const { data, error } = await supabase!
    .from("invoices" as never)
    .select("*")
    .eq("user_id" as never, userId)
    .order("created_at" as never, { ascending: false }) as any
  if (error) throw error
  return (data ?? []) as Invoice[]
}

export async function generateInvoice(paymentId: string, userId: string): Promise<Invoice> {
  if (!isSupabaseReady()) {
    return {
      id: `inv_${Date.now()}`,
      payment_id: paymentId,
      user_id: userId,
      invoice_number: `CM-${format(new Date(), "yyyy-MM")}-${String(Date.now()).slice(-4)}`,
      pdf_url: null,
      amount: 4900,
      tax: 0,
      total: 4900,
      status: "paid",
      due_date: new Date().toISOString(),
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
  }
  const { data, error } = await supabase!
    .from("invoices" as never)
    .insert({
      payment_id: paymentId,
      user_id: userId,
      invoice_number: `CM-${format(new Date(), "yyyy-MM")}-${String(Date.now()).slice(-4)}`,
      amount: 0,
      tax: 0,
      total: 0,
      status: "pending",
    } as never)
    .select()
    .single() as any
  if (error) throw error
  return data as Invoice
}

export function downloadInvoice(invoice: Invoice): void {
  const content = [
    `FACTURE ${invoice.invoice_number}`,
    `Date: ${format(new Date(invoice.created_at), "dd/MM/yyyy")}`,
    `Montant: ${invoice.total.toLocaleString("fr-FR")} F CFA`,
    `Statut: ${invoice.status === "paid" ? "Payée" : "En attente"}`,
    `---`,
    `Ça Match - Facture générée automatiquement`,
  ].join("\n")
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${invoice.invoice_number}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
